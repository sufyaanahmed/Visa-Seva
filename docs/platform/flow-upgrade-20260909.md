# Application flow and payment integration

The wizard validates the complete application at Review, saves files and answers,
records the applicant's confirmation, and opens checkout directly. A captured
payment leads to Final submit and the application's tracking page. The status page
can resume the same checkout after reload; it never creates a second order to
resolve an uncertain payment.

## Payment configuration

Set server-only `PAYMENT_PROVIDER=razorpay`, `RAZORPAY_KEY_ID` and
`RAZORPAY_KEY_SECRET`. This integration requires an `rzp_test_` key and deliberately
rejects live keys. Razorpay creates orders in the quoted currency. The server
verifies callback signatures, order ownership, amount, currency, and captured
payment state. A refresh reconciles the existing order with Razorpay. Test mode
never charges actual money. The previous simulated-payment endpoint is disabled
when Razorpay is configured.

Tourist fees use the Government's 8 September 2026 country/validity schedule;
business and medical fees use its 15 April 2026 schedule. The checked-in table is
shared by the frontend and backend. Tourist validity is an explicit required field.
Quotes add the published 3% e-Visa bank charge. OCI registration is USD 275.
Afghan visas are gratis. Regular visas are paid through the responsible mission;
VoA is paid at arrival. These external payments are recorded as `external`, never
as money received by the platform. Unsupported online category fees fail closed
until an official schedule is added, rather than using a fabricated default.

Sources checked 9 September 2026:
- https://indianvisaonline.gov.in/evisa/images/Etourist_fee_final.pdf
- https://indianvisaonline.gov.in/evisa/images/eTV_revised_fee_final.pdf
- https://ociservices.gov.in/onlineOCI/faq
- https://www.indianembassyrome.gov.in/eoi.php?id=fees
- https://www.indianvisaonline.gov.in/visa/visa-fee.html

## Emails

Run `node --env-file=.env.hosted.local scripts/provision-email-templates.mjs`
to provision the four aliases in the configured Resend account. Existing template
content is preserved. Submitted, waiting-for-information, accepted and rejected
events map to the submitted, continue, accepted and rejected templates respectively.
Each includes the applicant name, public reference, remarks and an authentication
link to that exact application. An expired link retains the application destination
when requesting fresh access.

The worker caches an immutable provider payload before its first send to preserve
idempotency across retries. This payload includes a single-use authentication token
and is not readable by authenticated staff or exposed through the admin API. The
normal email outbox and delivery reconciliation cron continue to handle retries.

## Decisions and documents

Decision makers and administrators may accept or reject submitted applications
without an intermediate review status. Reviewers cannot issue final decisions.
Acceptance validates completeness. Version checks, mandatory remarks, history and
notifications remain atomic in PostgreSQL. Documents open in a keyboard-accessible
modal served from Supabase's separate storage origin, using short-lived signed URLs.

Apply migration `202609090001_application_flow.sql` before deploying the API. It
extends the existing provider/status constraints, adds durable order recovery and
restricts email payload column access without changing existing application rows.

Apply `202609090002_legacy_checkout.sql` as well. It allows the server to update an
uncharged legacy sandbox checkout to the calculated fee, with owner and confirmation
checks. A Razorpay order, started provider request, or terminal payment is never
repriced. Both migrations were applied to the hosted project and registered in its
migration history.

## Verification

- 137 automated tests pass, including direct submitted decisions, reviewer role
  restrictions, legacy checkout repricing, payment signature binding, fee tiers,
  conditional autofill, email templates, and safe deep links.
- A synthetic OCI application with seven stored documents completed a USD 275
  Razorpay test payment, production submission, inline PDF preview, and direct
  acceptance. Its payment reference is `pay_TZtUQSjGp3m12h`.
- A synthetic Afghan medical application with four stored documents completed
  gratis submission, request for information, email-link access, resubmission
  without a second payment, and direct rejection.
- Actual submitted and continue email links were followed from signed-out browser
  sessions and opened their specific authenticated application pages.
- The public credential-autofill button was removed. The existing admin password
  was retained at the user's explicit request.

Production verification records: `VS-F880C5E918B047F5` (OCI) and
`VS-E6117AD103DC4B1B` (Afghan). These contain synthetic application data only.
