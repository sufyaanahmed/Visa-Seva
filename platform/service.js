import { razorpayClient, verifyPaymentSignature } from "./razorpay.js";
import { calculateApplicationFee } from "../src/domain/applicationFees.js";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import sharp from "sharp";
import { answerSchema, validateApplication } from "./rules.js";
import { getRequiredDocuments } from "../src/domain/documentRequirements.js";
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
export function unwrap({ data, error }) {
  if (error)
    throw new ApiError(
      400,
      error.message.includes("Version conflict")
        ? "This application changed. Reload it before continuing."
        : error.message,
    );
  return data;
}
export function createService(db, config) {
  async function role(actor) {
    return unwrap(
      await db
        .from("platform_roles")
        .select("role")
        .eq("user_id", actor.id)
        .maybeSingle(),
    )?.role;
  }
  async function get(actor, id) {
    let query = db.from("applications").select("*").eq("id", id);
    if (actor.kind === "admin") {
      if (!(await role(actor)))
        throw new ApiError(403, "Admin access required.");
    } else query = query.eq("owner_id", actor.id);
    const app = unwrap(await query.maybeSingle());
    if (!app) throw new ApiError(404, "Application not found.");
    const [documents, history, payments] = await Promise.all(
      ["application_documents", "application_history", "payment_sessions"].map(
        (t) =>
          db.from(t).select("*").eq("application_id", id).order("created_at"),
      ),
    );
    return {
      ...app,
      fee: calculateApplicationFee(app.answers),
      documents: unwrap(documents),
      history: unwrap(history),
      payments: unwrap(payments),
    };
  }
  async function command(actor, id, action, payload = {}) {
    if (action === "transition" && payload.status === "accepted") {
      const application = await get(actor, id);
      const report = validateApplication(
        application.answers,
        application.documents,
      );
      if (!report.complete)
        throw new ApiError(
          422,
          "Resolve missing application details before accepting.",
          report,
        );
    }
    return unwrap(
      await db.rpc("platform_command", {
        actor: actor.id,
        kind: actor.kind,
        app_id: id,
        command: action,
        payload,
      }),
    );
  }
  async function list(actor, { status, search = "", page = 0 } = {}) {
    let q = db
      .from("applications")
      .select("id,reference,status,payment_status,answers,version,updated_at", {
        count: "exact",
      })
      .order("updated_at", { ascending: false });
    if (actor.kind === "admin") {
      if (!(await role(actor)))
        throw new ApiError(403, "Admin access required.");
    } else q = q.eq("owner_id", actor.id);
    if (status) q = q.eq("status", status);
    if (search)
      q = q.ilike("reference", `%${search.replace(/[^a-zA-Z0-9-]/g, "")}%`);
    const result = await q.range(page * 25, page * 25 + 24);
    return { applications: unwrap(result), count: result.count };
  }
  async function create(actor, answers, draftKey) {
    return command(actor, null, "create", {
      answers: answerSchema.parse(answers),
      draft_key: draftKey,
    });
  }
  async function update(actor, id, answers, version) {
    const previous = await get(actor, id);
    if (previous.payment_status === "paid") {
      const before = calculateApplicationFee(previous.answers),
        after = calculateApplicationFee(answers);
      if (
        before.amount !== after.amount ||
        before.currency !== after.currency ||
        before.collection !== after.collection
      )
        throw new ApiError(
          409,
          "A paid application cannot change to a different fee. Start a separate application for that route.",
        );
    }
    return command(actor, id, "update", {
      answers: answerSchema.parse(answers),
      version,
    });
  }
  async function validate(actor, id) {
    const a = await get(actor, id);
    return {
      ...validateApplication(a.answers, a.documents),
      version: a.version,
    };
  }
  async function confirm(actor, id, version) {
    if (actor.kind !== "applicant")
      throw new ApiError(403, "Review and confirm on the Visa Seva website.");
    const report = await validate(actor, id);
    if (!report.complete)
      throw new ApiError(
        422,
        "Complete the missing application information.",
        report,
      );
    return command(actor, id, "confirm", { version });
  }
  async function submit(actor, id, version) {
    const app = await get(actor, id);
    if (
      ["submitted", "under_review", "accepted", "rejected"].includes(app.status)
    )
      return app;
    const report = validateApplication(app.answers, app.documents);
    if (!report.complete)
      throw new ApiError(
        422,
        "Complete the missing application information.",
        report,
      );
    return command(actor, id, "submit", { version });
  }
  async function checkout(actor, id, version, requestKey) {
    const application = await get(actor, id);
    const fee = calculateApplicationFee(application.answers);
    if (fee.amount == null && fee.collection !== "external")
      throw new ApiError(422, fee.reason);
    await command(actor, id, "checkout", {
      version,
      request_key: requestKey,
      amount: fee.collection === "external" ? 0 : fee.amount,
      currency: fee.currency,
    });
    const a = await get(actor, id);
    const p =
      a.payments.find((p) =>
        ["pending", "processing", "paid"].includes(p.status),
      ) || a.payments.find((p) => p.request_key === requestKey);
    return {
      ...p,
      checkout_url: `${config.publicUrl}/applications/${id}/checkout?session=${p.id}`,
    };
  }
  async function providerCheckout(actor, id, paymentId) {
    const app = await get(actor, id);
    if (actor.kind !== "applicant")
      throw new ApiError(403, "Open checkout on the website.");
    let payment = app.payments.find((p) => p.id === paymentId);
    if (!payment) throw new ApiError(404, "Payment session not found.");
    if (["paid", "external"].includes(payment.status))
      return { paid: true, external: payment.status === "external" };
    const fee = calculateApplicationFee(app.answers);
    if (fee.collection === "external") {
      await command(actor, id, "payment", {
        payment_id: paymentId,
        outcome: "external",
      });
      unwrap(
        await db
          .from("payment_sessions")
          .update({ provider: "external" })
          .eq("id", paymentId),
      );
      return { paid: true, external: true };
    }
    if (fee.amount !== payment.amount || fee.currency !== payment.currency)
      throw new ApiError(
        409,
        "The fee has changed. Return to your application to start a new checkout.",
      );
    if (payment.amount === 0) {
      await command(actor, id, "payment", {
        payment_id: paymentId,
        outcome: "paid",
      });
      unwrap(
        await db
          .from("payment_sessions")
          .update({
            provider: "gratis",
            transaction_reference: `GRATIS-${paymentId}`,
          })
          .eq("id", paymentId),
      );
      return { paid: true };
    }
    if (config.paymentProvider !== "razorpay") return { provider: "simulated" };
    const request = razorpayClient(config);
    if (!payment.provider_order_id) {
      const claimed = unwrap(
        await db.rpc("claim_payment_order", { payment_id: paymentId }),
      );
      if (!claimed) {
        // Never create a second order after a timeout. Recover the first by its receipt.
        const list = await request(
          `/orders?receipt=${encodeURIComponent(paymentId)}&count=100`,
        );
        const existing = list.items?.find(
          (o) =>
            o.receipt === paymentId &&
            o.amount === payment.amount &&
            o.currency === payment.currency,
        );
        if (!existing)
          throw new ApiError(
            409,
            "Checkout is being prepared. Please retry shortly; no second payment has been created.",
          );
        payment = { ...payment, provider_order_id: existing.id };
      } else {
        try {
          const order = await request("/orders", {
            amount: payment.amount,
            currency: payment.currency,
            receipt: paymentId,
            notes: { application_id: id },
          });
          payment = { ...payment, provider_order_id: order.id };
        } catch (error) {
          // A definitive rejection cannot have created an order; permit a corrected retry.
          if (error.providerStatus >= 400 && error.providerStatus < 500)
            unwrap(
              await db
                .from("payment_sessions")
                .update({ order_started_at: null })
                .eq("id", paymentId),
            );
          throw error;
        }
      }
      unwrap(
        await db
          .from("payment_sessions")
          .update({
            provider_order_id: payment.provider_order_id,
            provider: "razorpay",
          })
          .eq("id", paymentId),
      );
    }
    const paid = await reconcilePayment(actor, id, payment, request);
    return {
      provider: "razorpay",
      paid,
      key: config.razorpayKeyId,
      order_id: payment.provider_order_id,
      amount: payment.amount,
      currency: payment.currency,
      name: "Visa Seva",
      description: app.reference,
    };
  }
  async function reconcilePayment(actor, id, payment, request) {
    const list = await request(`/orders/${payment.provider_order_id}/payments`);
    let receipt = list.items?.find(
      (p) =>
        p.order_id === payment.provider_order_id &&
        p.amount === payment.amount &&
        p.currency === payment.currency &&
        ["authorized", "captured"].includes(p.status),
    );
    if (!receipt) return false;
    if (receipt.status === "authorized")
      receipt = await request(`/payments/${receipt.id}/capture`, {
        amount: payment.amount,
        currency: payment.currency,
      });
    if (
      receipt.status !== "captured" ||
      receipt.amount !== payment.amount ||
      receipt.currency !== payment.currency
    )
      throw new ApiError(
        409,
        "Payment has not been captured yet. Retry verification.",
      );
    await command(actor, id, "payment", {
      payment_id: payment.id,
      outcome: "paid",
    });
    unwrap(
      await db
        .from("payment_sessions")
        .update({ transaction_reference: receipt.id })
        .eq("id", payment.id),
    );
    return true;
  }
  async function verifyCheckout(actor, id, paymentId, body) {
    const app = await get(actor, id);
    const payment = app.payments.find((p) => p.id === paymentId);
    if (
      !payment?.provider_order_id ||
      body.razorpay_order_id !== payment.provider_order_id ||
      !verifyPaymentSignature(
        payment.provider_order_id,
        body.razorpay_payment_id,
        body.razorpay_signature,
        config.razorpaySecret,
      )
    )
      throw new ApiError(400, "Payment signature could not be verified.");
    if (actor.kind !== "applicant")
      throw new ApiError(403, "Open checkout on the website.");
    return {
      paid: await reconcilePayment(actor, id, payment, razorpayClient(config)),
    };
  }
  async function upload(actor, id, type, buffer, version) {
    if (actor.kind !== "applicant")
      throw new ApiError(403, "Upload documents on the website.");
    const app = await get(actor, id);
    const req = getRequiredDocuments(app.answers).find((r) => r.type === type);
    if (!req)
      throw new ApiError(
        400,
        "This document is not required for the selected category.",
      );
    if (!Buffer.isBuffer(buffer))
      throw new ApiError(
        400,
        "Upload file bytes using application/octet-stream.",
      );
    if (
      !buffer.length ||
      buffer.length > (req.maxBytes || 10 * 1024 * 1024) ||
      (req.minBytes && buffer.length < req.minBytes)
    )
      throw new ApiError(400, `Check file size. ${req.rule}`);
    let mime;
    if (req.extensions.includes("pdf")) {
      if (
        buffer.subarray(0, 5).toString() !== "%PDF-" ||
        !buffer.subarray(-2048).includes(Buffer.from("%%EOF"))
      )
        throw new ApiError(400, "Choose a valid PDF.");
      // Reject active PDF content. Previews are served from the isolated storage origin.
      if (
        /\/(JavaScript|JS|Launch|EmbeddedFile|RichMedia)\b/.test(
          buffer.toString("latin1"),
        )
      )
        throw new ApiError(400, "Remove scripts or attachments from the PDF.");
      mime = "application/pdf";
    } else {
      const metadata = await sharp(buffer, { limitInputPixels: 16000000 })
        .metadata()
        .catch(() => null);
      if (
        !metadata ||
        metadata.format !== "jpeg" ||
        (req.minDimension &&
          Math.min(metadata.width, metadata.height) < req.minDimension) ||
        (req.maxDimension &&
          Math.max(metadata.width, metadata.height) > req.maxDimension) ||
        (req.square && metadata.width !== metadata.height)
      )
        throw new ApiError(
          400,
          req.square
            ? "Choose a valid square JPEG photograph."
            : "Choose a valid JPEG image.",
        );
      mime = "image/jpeg";
    }
    const path = `${actor.id}/${id}/${randomUUID()}.${mime === "image/jpeg" ? "jpg" : "pdf"}`;
    unwrap(
      await db.storage
        .from("application-documents")
        .upload(path, buffer, { contentType: mime, upsert: false }),
    );
    try {
      return await command(actor, id, "document", {
        version,
        type,
        path,
        mime_type: mime,
        size: buffer.length,
        sha256: hash(buffer),
      });
    } catch (error) {
      await db.storage.from("application-documents").remove([path]);
      throw error;
    }
  }
  async function download(actor, id, documentId) {
    const a = await get(actor, id);
    const doc = a.documents.find((d) => d.id === documentId);
    if (!doc) throw new ApiError(404, "Document not found.");
    if (actor.kind === "agent")
      throw new ApiError(403, "Open documents on the website.");
    unwrap(
      await db.from("platform_audit").insert({
        application_id: id,
        actor_id: actor.id,
        actor_kind: actor.kind,
        action: "document_download",
      }),
    );
    return unwrap(
      await db.storage
        .from("application-documents")
        .createSignedUrl(doc.path, 300),
    );
  }
  async function grant(actor, label, scopes) {
    if (actor.kind !== "applicant")
      throw new ApiError(403, "Authorize an assistant on the website.");
    const token = `vs_agent_${randomBytes(32).toString("base64url")}`;
    const grant = unwrap(
      await db
        .from("agent_grants")
        .insert({
          owner_id: actor.id,
          label,
          scopes,
          token_hash: hash(token),
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        })
        .select("id,label,scopes,expires_at")
        .single(),
    );
    unwrap(
      await db.from("platform_audit").insert({
        actor_id: actor.id,
        actor_kind: "applicant",
        action: "agent_grant_created",
      }),
    );
    return { ...grant, token };
  }
  return {
    get,
    list,
    create,
    update,
    validate,
    confirm,
    submit,
    checkout,
    providerCheckout,
    verifyCheckout,
    upload,
    download,
    grant,
    role,
    command,
  };
}
