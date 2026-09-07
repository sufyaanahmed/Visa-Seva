import { mailpitFetcher } from './mailpit.js';
import { createClient } from "@supabase/supabase-js";
import { configuration } from "./server.js";
import { unwrap } from "./service.js";
export async function deliverEmails(
  db,
  config,
  { apiKey, from, fetcher = fetch },
) {
  if (!apiKey || !from)
    throw new Error(
      "RESEND_API_KEY and EMAIL_FROM are required. Queued emails are preserved.",
    );
  const messages = unwrap(await db.rpc("claim_platform_emails"));
  for (const message of messages) {
    try {
      const response = await fetcher("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `visa-notification-${message.id}`,
        },
        body: JSON.stringify({
          from,
          to: [message.recipient],
          subject: message.subject,
          text: `${message.body}\n\nView your application securely: ${config.publicUrl}/applications/${message.application_id}`,
        }),
      });
      if (!response.ok)
        throw new Error(`Email provider returned ${response.status}`);
      const result = await response.json();
      if (!result.id)
        throw new Error("Email provider did not return a delivery reference");
      unwrap(
        await db
          .from("email_notifications")
          .update({
            status: "sent",
            provider_id: result.id,
            last_error: null,
            lease_until: null,
          })
          .eq("id", message.id)
          .eq("attempts", message.attempts),
      );
    } catch (error) {
      unwrap(
        await db
          .from("email_notifications")
          .update({
            status: message.attempts >= 8 ? "needs_attention" : "queued",
            last_error: error.message,
            next_attempt_at: new Date(
              Date.now() + Math.min(3600000, 30000 * 2 ** message.attempts),
            ).toISOString(),
            lease_until: null,
          })
          .eq("id", message.id)
          .eq("attempts", message.attempts),
      );
    }
  }
  // Provider acceptance is not delivery. Poll the provider for actual delivery state.
  const sent = unwrap(
    await db
      .from("email_notifications")
      .select("id,provider_id")
      .eq("status", "sent")
      .limit(10),
  );
  for (const m of sent) {
    try {
      const response = await fetcher(
        `https://api.resend.com/emails/${encodeURIComponent(m.provider_id)}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!response.ok) continue;
      const event = (await response.json()).last_event;
      const status = {
        delivered: "delivered",
        bounced: "bounced",
        failed: "failed",
      }[event];
      if (status)
        unwrap(
          await db
            .from("email_notifications")
            .update({ status })
            .eq("id", m.id)
            .eq("status", "sent"),
        );
    } catch {
      /* Retry delivery-status retrieval on the next run. */
    }
  }
  return messages.length;
}
if (process.argv[1]?.replace(/\\/g, "/").endsWith("/platform/email-worker.js")) {
  const config = configuration();
  const db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
  let running = true;
  process.on("SIGTERM", () => {
    running = false;
  });
  do {
    try {
      await deliverEmails(db, config, {
        apiKey: process.env.EMAIL_PROVIDER === "mailpit" ? "local-inbox" : process.env.RESEND_API_KEY,
        ...(process.env.EMAIL_PROVIDER === "mailpit" ? { fetcher: mailpitFetcher(process.env.MAILPIT_URL || "http://127.0.0.1:54324") } : {}),
        from: process.env.EMAIL_FROM,
      });
    } catch (error) {
      console.error(error.message);
      if (!process.env.RESEND_API_KEY && process.env.EMAIL_PROVIDER !== "mailpit") process.exitCode = 1;
    }
    if (process.argv.includes("--once") || process.exitCode) break;
    await new Promise((resolve) => setTimeout(resolve, 10000));
  } while (running);
}
