import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey || apiKey === "re_xxxxxxxxx") {
  console.error("❌ Error: Please set your valid RESEND_API_KEY in the .env file.");
  process.exit(1);
}

const resend = new Resend(apiKey);
const fromArg = process.argv.find((a) => a.startsWith("--from="));
const fromEmail = fromArg
  ? fromArg.replace("--from=", "")
  : process.env.EMAIL_FROM || "onboarding@resend.dev";
const targetEmail =
  process.argv.find((a) => a.includes("@") && !a.startsWith("--from=")) ||
  "ahmedsemailis@gmail.com";

console.log(`Sending test email to ${targetEmail} from ${fromEmail}...`);

async function send() {
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail.includes("<") ? fromEmail : `Visa Seva <${fromEmail}>`,
      to: [targetEmail],
      subject: "Visa Seva - Resend Integration Test",
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Resend Connected Successfully!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Your Visa Seva application is now successfully configured with the Resend API.
          </p>
          <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #0284c7;">
            <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Status:</strong> Active & Ready to send Magic Links and Notifications</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">Government of India · Ministry of Home Affairs · Visa Seva Portal</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Failed to send email via Resend:", error);
    } else {
      console.log("✅ Email sent successfully! Message ID:", data.id);
    }
  } catch (err) {
    console.error("❌ Exception during send:", err.message);
  }
}

send();
