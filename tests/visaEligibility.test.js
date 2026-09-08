import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { evaluateVisaRoute, getEvisaWizardGate } from '../src/domain/visaEligibility.js';
import { VISA_RULESET } from '../src/data/visaEligibilityRules.js';

const readyTraveller = Object.freeze({
  passportType: 'ordinary',
  pakistanOrigin: 'no',
  travelReadiness: 'yes',
});
const eligibleVoaAnswers = (overrides = {}) => ({
  ...readyTraveller,
  passport: 'Japan',
  purpose: 'tourism',
  durationDays: '14',
  voaArrivalPort: 'designated',
  voaIndiaResidenceOrOccupation: 'no',
  voaAdmissibility: 'yes',
  ...overrides,
});

describe('visa route eligibility', () => {
  test('blocks direct e-Visa wizard entry without the reviewed ruleset', () => {
    assert.deepEqual(getEvisaWizardGate({ application_type: 'evisa', visa_category: 'tourist' }), {
      allowed: false,
      reason: 'reviewed-ruleset-required',
    });
  });

  test('requires the Study in India gate for e-Student wizard entry', () => {
    assert.deepEqual(getEvisaWizardGate({ eligibility_ruleset_id: VISA_RULESET.id, visa_category: 'student', study_in_india_institution: 'unsure' }), {
      allowed: false,
      reason: 'study-in-india-required',
    });
    assert.equal(getEvisaWizardGate({ eligibility_ruleset_id: VISA_RULESET.id, visa_category: 'student', study_in_india_institution: 'yes' }).allowed, true);
  });

  test('rejects a stale or invented e-Visa category at wizard entry', () => {
    assert.deepEqual(getEvisaWizardGate({ eligibility_ruleset_id: VISA_RULESET.id, visa_category: 'miscellaneous' }), {
      allowed: false,
      reason: 'unsupported-category',
    });
  });
  test('routes an Afghan passport to the distinct Afghan application type', () => {
    const result = evaluateVisaRoute({
      ...readyTraveller,
      passport: 'Afghanistan',
      purpose: 'medical',
      durationDays: '30',
    });

    assert.equal(result.applicationType, 'afghan');
    assert.equal(result.path, '/flow/afghan');
    assert.equal(result.visaCategory, 'unselected');
  });

  test('does not claim e-Visa eligibility for a clearly ineligible nationality', () => {
    for (const passport of ['Algeria', 'Bangladesh', 'Bhutan', 'Nepal', 'Iran', 'Iraq']) {
      const result = evaluateVisaRoute({
        ...readyTraveller,
        passport,
        purpose: 'tourism',
        durationDays: '14',
      });

      assert.equal(result.applicationType, 'regular', passport);
    }
  });

  test('routes qualifying study to e-Student instead of always using paper visa', () => {
    const result = evaluateVisaRoute({
      ...readyTraveller,
      passport: 'United States',
      purpose: 'study',
      durationDays: '180',
      studyInIndiaInstitution: 'yes',
    });

    assert.equal(result.applicationType, 'evisa');
    assert.equal(result.visaCategory, 'student');
    assert.equal(result.path, '/flow/normal');
    assert.match(result.type, /e-Student/);
  });

  test('supports Japan and South Korea across every published VoA purpose', () => {
    for (const passport of ['Japan', 'South Korea']) {
      for (const purpose of ['tourism', 'business', 'conference', 'medical']) {
        const result = evaluateVisaRoute(eligibleVoaAnswers({ passport, purpose }));
        assert.equal(result.applicationType, 'voa', `${passport}/${purpose}`);
      }
    }
  });

  test('supports a UAE traveller who confirms a previous Indian visa', () => {
    const result = evaluateVisaRoute(eligibleVoaAnswers({
      passport: 'United Arab Emirates',
      purpose: 'medical',
      durationDays: '30',
      uaePriorVisa: 'yes',
    }));

    assert.equal(result.applicationType, 'voa');
    assert.equal(result.visaCategory, 'medical');
  });

  test('falls back to e-Visa for a first-time UAE visitor', () => {
    const result = evaluateVisaRoute(eligibleVoaAnswers({
      passport: 'United Arab Emirates',
      purpose: 'medical',
      durationDays: '30',
      uaePriorVisa: 'no',
    }));

    assert.equal(result.applicationType, 'evisa');
    assert.ok(result.rationale.some((reason) => reason.includes('first-time')));
  });

  test('enforces the exact 60-day VoA boundary', () => {
    const sixtyDays = evaluateVisaRoute(eligibleVoaAnswers({
      purpose: 'conference',
      durationDays: '60',
    }));
    const sixtyOneDays = evaluateVisaRoute(eligibleVoaAnswers({
      purpose: 'conference',
      durationDays: '61',
    }));

    assert.equal(sixtyDays.applicationType, 'voa');
    assert.notEqual(sixtyOneDays.applicationType, 'voa');
  });

  test('excludes non-ordinary passports from online recommendations', () => {
    for (const passportType of ['diplomatic', 'official', 'other-document']) {
      const result = evaluateVisaRoute({
        ...readyTraveller,
        passport: 'United States',
        passportType,
        purpose: 'tourism',
        durationDays: '14',
      });

      assert.equal(result.applicationType, 'regular', passportType);
    }
  });

  test('routes a Pakistan passport to regular visa', () => {
    const result = evaluateVisaRoute({
      ...readyTraveller,
      passport: 'Pakistan',
      purpose: 'tourism',
      durationDays: '14',
    });

    assert.equal(result.applicationType, 'regular');
  });

  test('routes Pakistani-origin applicants to regular visa', () => {
    const result = evaluateVisaRoute({
      ...readyTraveller,
      passport: 'United States',
      pakistanOrigin: 'yes',
      purpose: 'business',
      durationDays: '14',
    });

    assert.equal(result.applicationType, 'regular');
  });

  test('uses a safe fallback when passport and travel readiness is invalid', () => {
    const result = evaluateVisaRoute({
      ...readyTraveller,
      passport: 'Japan',
      purpose: 'tourism',
      durationDays: '14',
      travelReadiness: 'no',
      voaArrivalPort: 'designated',
      voaIndiaResidenceOrOccupation: 'no',
      voaAdmissibility: 'yes',
    });

    assert.equal(result.applicationType, 'regular');
    assert.match(result.description, /not confirmed/);
  });

  test('routes employment to a regular visa', () => {
    const result = evaluateVisaRoute({
      ...readyTraveller,
      passport: 'United States',
      purpose: 'employment',
      durationDays: '90',
    });

    assert.equal(result.applicationType, 'regular');
    assert.match(result.description, /Employment/);
  });

  test('uses official review for an uncertain purpose', () => {
    const result = evaluateVisaRoute({
      ...readyTraveller,
      passport: 'United States',
      purpose: 'other',
      durationDays: '14',
    });

    assert.equal(result.applicationType, 'regular');
    assert.match(result.description, /should not be guessed/);
  });

  test('routes existing OCI cardholders to visa-free e-Arrival guidance', () => {
    const resultByPurpose = evaluateVisaRoute({
      ...readyTraveller,
      passport: 'United Kingdom',
      purpose: 'oci-holder',
      durationDays: '90',
    });
    assert.equal(resultByPurpose.applicationType, 'oci_holder');
    assert.equal(resultByPurpose.path, '/e-arrival');
    assert.match(resultByPurpose.type, /OCI Cardholder/);

    const resultByFlag = evaluateVisaRoute({
      ...readyTraveller,
      passport: 'United States',
      hasOciCard: 'cardholder',
      purpose: 'tourism',
      durationDays: '30',
    });
    assert.equal(resultByFlag.applicationType, 'oci_holder');
    assert.equal(resultByFlag.path, '/e-arrival');
  });

  test('routes new OCI applicants to official OCI guidance and checklist', () => {
    const result = evaluateVisaRoute({
      ...readyTraveller,
      passport: 'Canada',
      purpose: 'oci-apply',
      durationDays: '30',
    });
    assert.equal(result.applicationType, 'oci_applicant');
    assert.equal(result.path, '/guide/oci');
    assert.match(result.actionLabel, /OCI Application Guide/);
  });

  test('excludes Pakistani-origin applicants from OCI registration under Section 7A', () => {
    const result = evaluateVisaRoute({
      ...readyTraveller,
      passport: 'United States',
      pakistanOrigin: 'yes',
      purpose: 'oci-apply',
      durationDays: '30',
    });
    assert.equal(result.applicationType, 'regular');
    assert.match(result.description, /Section 7A/);
  });
});
