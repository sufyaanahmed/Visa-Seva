import { test } from "node:test";
import assert from "node:assert/strict";
import { reference } from "../platform/reference.js";
import { getEvisaWizardGate } from "../src/domain/visaEligibility.js";
const traveller = {
  passport: "United States",
  passportType: "ordinary",
  pakistanOrigin: "no",
  purpose: "tourism",
  durationDays: 14,
  travelReadiness: "yes",
};

test("broad and incomplete questions ask for facts without assigning a route", () => {
  assert.equal(reference().firstQuestion.id, "passport");
  for (const answers of [
    {},
    { passport: "United States" },
    { ...traveller, durationDays: 0 },
    { ...traveller, passport: "US" },
  ]) {
    const result = reference("eligibility", answers);
    assert.equal(result.complete, false);
    assert.equal(result.recommendation, null);
    assert.equal(result.draftAnswers, null);
    assert.ok(result.nextQuestion);
  }
});

test("complete tourist conversation hands off valid application fields and documents", () => {
  const result = reference("eligibility", traveller);
  assert.equal(result.complete, true);
  assert.equal(result.recommendation.applicationType, "evisa");
  assert.equal(result.draftAnswers.nationality, "United States");
  assert.equal(getEvisaWizardGate(result.draftAnswers).allowed, true);
  assert.equal(reference("documents", result.draftAnswers).documents.length, 2);
  assert.ok(reference("steps", result.draftAnswers).steps.length);
  assert.equal(result.automaticallySynchronized, false);
  assert.match(result.serviceNotice, /not government filing/);
});

test("conditional study and arrival questions must be answered before handoff", () => {
  const study = { ...traveller, purpose: "study", durationDays: 30 };
  assert.equal(
    reference("eligibility", study).nextQuestion.id,
    "studyInIndiaInstitution",
  );
  const result = reference("eligibility", {
    ...study,
    studyInIndiaInstitution: "yes",
  });
  assert.equal(result.draftAnswers.visa_category, "student");
  assert.equal(getEvisaWizardGate(result.draftAnswers).allowed, true);
  assert.equal(
    reference("eligibility", { ...traveller, passport: "Japan" }).nextQuestion
      .id,
    "voaArrivalPort",
  );
});

test("confirmed unsupported trips retain conservative route and fee guidance", () => {
  for (const overrides of [
    { passport: "Pakistan" },
    { purpose: "employment" },
    { pakistanOrigin: "yes" },
    { passportType: "diplomatic" },
  ]) {
    assert.equal(
      reference("eligibility", { ...traveller, ...overrides }).recommendation
        .applicationType,
      "regular",
    );
  }
  assert.match(reference("fees").fees.note, /Government fees depend/);
});
