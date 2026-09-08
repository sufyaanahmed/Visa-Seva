import { test } from "node:test";
import assert from "node:assert/strict";
import { validateApplication, answerSchema } from "../platform/rules.js";
import { getSteps } from "../src/domain/applicationForm.js";
import { deliverEmails } from "../platform/email-worker.js";
test("shared completeness includes conditional fields, server documents, and declarations", () => {
  const report = validateApplication(
    {
      application_type: "regular",
      visa_category: "employment",
      marital_status: "married",
    },
    [],
  );
  assert.equal(report.complete, false);
  assert.ok(report.errors.spouse_details);
  assert.ok(report.errors.review_accuracy);
  assert.equal(report.missingDocuments.length, 3);
  assert.ok(getSteps("regular", {}).some((s) => s.id === "security"));
});
test("unknown select values and unsupported routes do not pass validation", () => {
  assert.throws(() => answerSchema.parse({ application_type: "unknown" }));
  const r = validateApplication(
    { application_type: "regular", passport_type: "forged" },
    [],
  );
  assert.equal(r.errors.passport_type, "Choose a listed option.");
  assert.throws(() =>
    answerSchema.parse({
      application_type: "regular",
      bad: { nested: "object" },
    }),
  );
});
test("email retry uses immutable content and stable provider idempotency key", async () => {
  const updates = [];
  const db = {
    rpc: async () => ({
      data: [
        {
          id: "mail-1",
          application_id: "app-1",
          recipient: "applicant@example.com",
          subject: "Status changed",
          body: "Your application is submitted.",
          attempts: 1,
        },
      ],
    }),
    from() {
      return {
        update(value) {
          updates.push(value);
          return this;
        },
        select() {
          return this;
        },
        eq() {
          return this;
        },
        limit: async () => ({ data: [] }),
        then(resolve) {
          resolve({ data: null });
        },
      };
    },
  };
  const requests = [];
  const opts = {
    apiKey: "test-key",
    from: "Visa Seva <status@example.com>",
    fetcher: async (url, req) => {
      requests.push(req);
      return { ok: true, json: async () => ({ id: "provider-1" }) };
    },
  };
  await deliverEmails(db, { publicUrl: "https://visa.example.com" }, opts);
  await deliverEmails(db, { publicUrl: "https://visa.example.com" }, opts);
  assert.equal(
    requests[0].headers["Idempotency-Key"],
    requests[1].headers["Idempotency-Key"],
  );
  assert.equal(requests[0].body, requests[1].body);
  assert.equal(updates[0].status, "sent");
  assert.match(
    JSON.parse(requests[0].body).text,
    /https:\/\/visa.example.com\/applications\/app-1/,
  );
});
test("email failure remains retryable and missing credentials do not consume queued messages", async () => {
  let called = false;
  await assert.rejects(
    deliverEmails(
      {
        rpc: () => {
          called = true;
        },
      },
      {},
      {},
    ),
    /RESEND_API_KEY/,
  );
  assert.equal(called, false);
  const updates = [];
  const db = {
    rpc: async () => ({ data: [{ id: "m", attempts: 2 }] }),
    from() {
      return {
        update(v) {
          updates.push(v);
          return this;
        },
        select() {
          return this;
        },
        eq() {
          return this;
        },
        limit: async () => ({ data: [] }),
        then(r) {
          r({ data: null });
        },
      };
    },
  };
  await deliverEmails(
    db,
    { publicUrl: "https://example.com" },
    {
      apiKey: "test",
      from: "test@example.com",
      fetcher: async () => ({ ok: false, status: 503 }),
    },
  );
  assert.equal(updates[0].status, "queued");
  assert.match(updates[0].last_error, /503/);
});

test("calendar validation rejects impossible dates and accepts leap days", async () => {
  const { isCalendarDate, validateStep } =
    await import("../src/domain/applicationForm.js");
  for (const value of [
    "2026-02-31",
    "2025-02-29",
    "2026-13-01",
    "2026-00-10",
    "2026-04-31",
    "not-a-date",
  ])
    assert.equal(isCalendarDate(value), false, value);
  assert.equal(isCalendarDate("2024-02-29"), true);
  const report = validateStep(
    {
      id: "test",
      fields: [{ name: "arrival_date", type: "date", required: true }],
    },
    { arrival_date: "2026-02-31" },
    [],
  );
  assert.equal(report.arrival_date, "Enter a valid calendar date.");
});


test("OCI drafts are accepted by the backend and use category-specific completeness", async () => {
  const { demoFixture } = await import("../src/domain/demoFixtures.js");
  const { getRequiredDocuments } = await import("../src/domain/documentRequirements.js");
  for (const oci_category of ["former-indian", "descendant-child", "foreign-spouse"]) {
    const answers = demoFixture("oci", { oci_category });
    answers.review_accuracy = true;
    answers.review_consent = true;
    assert.equal(answerSchema.parse(answers).application_type, "oci");
    const documents = getRequiredDocuments(answers).map(({ type }) => ({ type }));
    const report = validateApplication(answers, documents);
    assert.deepEqual(report.errors, {}, oci_category);
    assert.equal(report.complete, true);
    assert.ok(validateApplication(answers, []).missingDocuments.length > 0);
  }
});
