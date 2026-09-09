import test from "node:test";
import assert from "node:assert/strict";
import { calculateApplicationFee } from "../src/domain/applicationFees.js";
import { demoFixture } from "../src/domain/demoFixtures.js";
import {
  getSteps,
  validateStep,
  afghanPurposes,
} from "../src/domain/applicationForm.js";
import { getRequiredDocuments } from "../src/domain/documentRequirements.js";
import { validateApplication } from "../platform/rules.js";
import { safeEmailNext } from "../src/platform/emailLink.js";
import { notificationPayload } from "../platform/email-templates.js";
import { verifyPaymentSignature } from "../platform/razorpay.js";
import { createHmac } from "node:crypto";
test("fees use current nationality, validity, season, category and 3% charge", () => {
  const quote = (extra) =>
    calculateApplicationFee({
      application_type: "evisa",
      visa_category: "tourist",
      nationality: "Canada",
      visa_validity: "5-years",
      expected_arrival_date: "2026-10-12",
      ...extra,
    });
  assert.equal(quote({}).amount, 20600);
  assert.equal(quote({ nationality: "United States" }).amount, 16480);
  assert.equal(quote({ nationality: "United Kingdom" }).baseAmount, 48400);
  assert.equal(quote({ nationality: "Japan" }).amount, 2575);
  assert.equal(quote({ nationality: "Argentina" }).amount, 0);
  assert.equal(
    quote({ visa_validity: "30-days", expected_arrival_date: "2027-05-01" })
      .amount,
    1030,
  );
  assert.equal(quote({ visa_category: "business" }).amount, 12360);
  assert.equal(quote({ visa_validity: undefined }).amount, null);
  assert.equal(
    calculateApplicationFee({
      application_type: "oci",
      nationality: "Argentina",
    }).amount,
    27500,
  );
  assert.equal(
    calculateApplicationFee({
      application_type: "afghan",
      nationality: "Afghanistan",
    }).amount,
    0,
  );
});
test("all Afghan and OCI presets provide mandatory fields including origin and conditional answers", () => {
  const profiles = [
    ...Object.entries(afghanPurposes).flatMap(([visa_category, purposes]) =>
      purposes.map((afghan_purpose) => [
        "afghan",
        { visa_category, afghan_purpose },
      ]),
    ),
    ...[
      "former-indian",
      "descendant-child",
      "descendant-grandchild",
      "foreign-spouse",
    ].map((oci_category) => ["oci", { oci_category }]),
  ];
  for (const [type, seed] of profiles) {
    const data = demoFixture(type, {
      ...seed,
      pakistan_origin: false,
      previous_name_used: "yes",
      marital_status: "married",
    });
    assert.equal(data.pakistan_origin, "no");
    assert.equal(data.review_accuracy, false);
    const docs = getRequiredDocuments(data).map((d) => ({
      type: d.type,
      status: "uploaded",
    }));
    const result = validateApplication(
      { ...data, review_accuracy: true },
      docs,
    );
    assert.deepEqual(result.errors, {}, `${type}/${JSON.stringify(seed)}`);
  }
});
test("Pakistan-origin regular cases are not incorrectly blocked by an OCI rule", () => {
  const data = demoFixture("regular", { pakistan_origin: "yes" });
  const security = getSteps("regular", data).find((s) => s.id === "security");
  assert.equal(validateStep(security, data).pakistan_origin, undefined);
});
test("magic-link redirect only permits application pages and known consent routes", () => {
  const path = "/applications/11111111-1111-4111-8111-111111111111";
  assert.equal(safeEmailNext(path), path);
  for (const value of [
    "//evil.test",
    "/applications/../../admin",
    "/applications/\\evil",
    "https://evil.test",
  ])
    assert.equal(safeEmailNext(value), "/applications");
});
test("all four notification templates carry applicant, reference, decision remarks and authenticated deep link", async () => {
  for (const status of [
    "submitted",
    "waiting_for_information",
    "accepted",
    "rejected",
  ]) {
    const db = {
      from: (table) => ({
        select() {
          return this;
        },
        eq() {
          return this;
        },
        async single() {
          return {
            data:
              table === "applications"
                ? {
                    id: "app",
                    reference: "VS-123",
                    owner_id: "owner",
                    answers: { given_name: "Alex", surname: "Morgan" },
                  }
                : { to_status: status, reason: "Please replace <photo>" },
          };
        },
      }),
      auth: {
        admin: {
          getUserById: async () => ({
            data: { user: { email: "owner@example.com" } },
          }),
          generateLink: async () => ({
            data: { properties: { hashed_token: "one-use-hash" } },
          }),
        },
      },
    };
    const payload = await notificationPayload(
      db,
      { publicUrl: "https://visa.example.com" },
      {
        application_id: "app",
        history_id: "event",
        recipient: "owner@example.com",
        subject: status,
      },
      "sender@example.com",
    );
    assert.equal(
      payload.template.id,
      `visa-application-${status === "waiting_for_information" ? "continue" : status}`,
    );
    assert.equal(payload.template.variables.APPLICANT_NAME, "Alex Morgan");
    assert.equal(payload.template.variables.APPLICATION_ID, "VS-123");
    assert.match(payload.template.variables.REMARKS, /&lt;photo&gt;/);
    const link = new URL(payload.template.variables.TRACKING_LINK);
    assert.equal(link.searchParams.get("next"), "/applications/app");
    assert.equal(link.searchParams.get("token_hash"), "one-use-hash");
    assert.equal(payload.text, undefined);
  }
});
test("payment signature binds the provider order and payment to our secret", () => {
  const signature = createHmac("sha256", "secret")
    .update("order_1|pay_1")
    .digest("hex");
  assert.ok(verifyPaymentSignature("order_1", "pay_1", signature, "secret"));
  assert.equal(
    verifyPaymentSignature("other", "pay_1", signature, "secret"),
    false,
  );
  assert.equal(
    verifyPaymentSignature("order_1", "pay_1", "bad", "secret"),
    false,
  );
});
