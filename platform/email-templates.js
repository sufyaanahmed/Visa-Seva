export const notificationTemplates = {
  submitted: {
    alias: "visa-application-submitted",
    title: "Application received",
    message:
      "Your application has been submitted. Follow its progress using the secure link below.",
    cta: "Track application",
  },
  waiting_for_information: {
    alias: "visa-application-continue",
    title: "Your application needs attention",
    message:
      "Please provide the requested information so your application can continue.",
    cta: "Continue application",
  },
  accepted: {
    alias: "visa-application-accepted",
    title: "Application accepted",
    message:
      "A decision has been recorded for your application. Open your application for details and next steps.",
    cta: "View decision",
  },
  rejected: {
    alias: "visa-application-rejected",
    title: "Application decision",
    message:
      "Your application was not accepted. The reason and next steps are included below.",
    cta: "View decision",
  },
};
export function templateDefinition(value) {
  return {
    name: value.alias,
    alias: value.alias,
    variables: [
      "APPLICANT_NAME",
      "APPLICATION_ID",
      "TRACKING_LINK",
      "REMARKS",
      "REMARKS_MORE",
    ].map((key) => ({ key, type: "string" })),
    html: `<!doctype html><html><body style="margin:0;background:#faf7f0;font-family:Arial,sans-serif;color:#1e2a4f"><table role="presentation" width="100%"><tr><td style="padding:36px 16px"><table role="presentation" style="max-width:560px;width:100%;margin:auto;background:white;border:1px solid #e6dfd3;border-radius:12px"><tr><td style="padding:32px"><p style="font-size:12px;letter-spacing:2px;color:#bd7028">INDIA VISA SEVA</p><h1 style="font-size:28px">${value.title}</h1><p>Hello {{{APPLICANT_NAME}}},</p><p style="line-height:1.7">${value.message}</p><p>Application <strong>{{{APPLICATION_ID}}}</strong></p><div style="white-space:pre-wrap;line-height:1.7">{{{REMARKS}}}{{{REMARKS_MORE}}}</div><p style="margin:28px 0"><a href="{{{TRACKING_LINK}}}" style="display:inline-block;background:#1e2a4f;color:white;padding:14px 22px;text-decoration:none;border-radius:6px">${value.cta}</a></p><p style="font-size:12px;color:#666;line-height:1.6">This secure link signs you in. Keep it private. If it expires, request a new link from My applications.</p></td></tr></table></td></tr></table></body></html>`,
  };
}
export const escapeEmailText = (text) =>
  String(text || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export async function notificationPayload(db, config, message, from) {
  const { data: app, error } = await db
    .from("applications")
    .select("id,reference,owner_id,answers")
    .eq("id", message.application_id)
    .single();
  if (error || !app)
    throw new Error("Notification application could not be loaded.");
  const { data: history, error: historyError } = await db
    .from("application_history")
    .select("to_status,reason")
    .eq("id", message.history_id)
    .eq("application_id", app.id)
    .single();
  if (historyError || !notificationTemplates[history?.to_status])
    throw new Error("Notification status is not supported.");
  const { data: owner, error: ownerError } = await db.auth.admin.getUserById(
    app.owner_id,
  );
  if (
    ownerError ||
    owner?.user?.email?.toLowerCase() !== message.recipient.toLowerCase()
  )
    throw new Error(
      "Notification recipient no longer matches the application owner.",
    );
  const { data: link, error: linkError } = await db.auth.admin.generateLink({
    type: "magiclink",
    email: message.recipient,
  });
  if (linkError || !link?.properties?.hashed_token)
    throw new Error("Unable to prepare the secure application link.");
  const url = new URL("/auth/confirm", config.publicUrl);
  url.searchParams.set("token_hash", link.properties.hashed_token);
  url.searchParams.set("next", `/applications/${app.id}`);
  const remarks = escapeEmailText(history.reason || "");
  return {
    from,
    to: [message.recipient],
    subject: message.subject,
    template: {
      id: notificationTemplates[history.to_status].alias,
      variables: {
        APPLICANT_NAME: escapeEmailText(
          [app.answers.given_name, app.answers.surname]
            .filter(Boolean)
            .join(" ") || "Applicant",
        ).slice(0, 1900),
        APPLICATION_ID: app.reference,
        TRACKING_LINK: url.href,
        REMARKS: remarks.slice(0, 2000),
        REMARKS_MORE: remarks.slice(2000, 4000),
      },
    },
  };
}
