import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { getSteps, validateStep, isVisible } from '../src/domain/applicationForm.js';
import { getRequiredDocuments } from '../src/domain/documentRequirements.js';
import { demoFixture } from '../src/domain/demoFixtures.js';

describe('OCI Application Form & Requirements', () => {
  test('generates the complete 8-step OCI registration workflow', () => {
    const steps = getSteps('oci', { oci_category: 'former-indian' });
    assert.equal(steps.length, 8);
    const stepIds = steps.map((s) => s.id);
    assert.deepEqual(stepIds, [
      'oci-category',
      'identity',
      'passport',
      'family',
      'origin',
      'security',
      'documents',
      'review',
    ]);
  });

  test('requires photo and signature in JPEG specifications for all OCI applicants', () => {
    const docs = getRequiredDocuments({ application_type: 'oci', oci_category: 'former-indian' });
    const byType = new Map(docs.map((d) => [d.type, d]));

    const photo = byType.get('photograph');
    assert.ok(photo, 'Photograph requirement must be present');
    assert.deepEqual(photo.extensions, ['jpg', 'jpeg']);
    assert.deepEqual(photo.mimeTypes, ['image/jpeg']);
    assert.equal(photo.minBytes, null);
    assert.equal(photo.maxBytes, 200 * 1024);
    assert.equal(photo.square, true);

    const sig = byType.get('signature');
    assert.ok(sig, 'Signature requirement must be present');
    assert.deepEqual(sig.extensions, ['jpg', 'jpeg']);
    assert.deepEqual(sig.mimeTypes, ['image/jpeg']);
    assert.equal(sig.minBytes, null);
    assert.equal(sig.maxBytes, 200 * 1024);
  });

  test('demands surrender certificate and cancelled passport for former Indian citizens', () => {
    const docs = getRequiredDocuments({ application_type: 'oci', oci_category: 'former-indian' });
    const types = docs.map((d) => d.type);

    assert.ok(types.includes('surrender_certificate'));
    assert.ok(types.includes('cancelled_indian_passport'));
    assert.ok(types.includes('naturalization_certificate'));
    assert.ok(types.includes('passport'));
    assert.ok(types.includes('address_proof'));
  });

  test('demands birth certificate and ancestral origin proof for descendants', () => {
    const docs = getRequiredDocuments({ application_type: 'oci', oci_category: 'descendant-child' });
    const types = docs.map((d) => d.type);

    assert.ok(types.includes('birth_certificate'));
    assert.ok(types.includes('ancestor_origin_proof'));
    assert.ok(types.includes('passport'));
  });

  test('demands marriage certificate, spouse Indian proof, and joint declaration for foreign spouses', () => {
    const docs = getRequiredDocuments({ application_type: 'oci', oci_category: 'foreign-spouse' });
    const types = docs.map((d) => d.type);

    assert.ok(types.includes('marriage_certificate'));
    assert.ok(types.includes('spouse_indian_proof'));
    assert.ok(types.includes('joint_declaration'));
    assert.ok(types.includes('passport'));
  });

  test('enforces Section 7A statutory bar against Pakistani/Bangladeshi nationality', () => {
    const steps = getSteps('oci', {});
    const securityStep = steps.find((s) => s.id === 'security');

    const blockedData = {
      application_type: 'oci',
      pakistan_origin: 'yes',
      military_service: 'no',
      prior_criminal_offense: 'no',
    };

    const errors = validateStep(securityStep, blockedData);
    assert.ok(errors.pakistan_origin);
    assert.match(errors.pakistan_origin, /Section 7A/);

    const validData = {
      ...blockedData,
      pakistan_origin: 'no',
    };
    const validErrors = validateStep(securityStep, validData);
    assert.equal(Object.keys(validErrors).length, 0);
  });

  test('conditionally renders category-specific origin fields based on oci_category', () => {
    const steps = getSteps('oci', { oci_category: 'former-indian' });
    const originStep = steps.find((s) => s.id === 'origin');
    const surrenderField = originStep.fields.find((f) => f.name === 'surrender_cert_number');
    const ancestorField = originStep.fields.find((f) => f.name === 'ancestor_name_details');

    const familyStep = steps.find((s) => s.id === 'family');
    const marriageDateField = familyStep.fields.find((f) => f.name === 'marriage_date');

    assert.ok(isVisible(surrenderField, { oci_category: 'former-indian' }));
    assert.ok(!isVisible(surrenderField, { oci_category: 'foreign-spouse' }));

    assert.ok(isVisible(ancestorField, { oci_category: 'descendant-child' }));
    assert.ok(!isVisible(ancestorField, { oci_category: 'former-indian' }));

    assert.ok(isVisible(marriageDateField, { oci_category: 'foreign-spouse' }));
    assert.ok(!isVisible(marriageDateField, { oci_category: 'former-indian', marital_status: 'single' }));
  });

  test('demo autofill fixture completely populates all visible fields without errors', () => {
    const categories = ['former-indian', 'descendant-child', 'foreign-spouse'];

    for (const cat of categories) {
      const data = demoFixture('oci', { oci_category: cat });
      const steps = getSteps('oci', data);

      for (const step of steps) {
        if (['documents', 'review'].includes(step.id)) continue;
        if (step.fields) {
          for (const f of step.fields) {
            if (isVisible(f, data)) {
              assert.notEqual(
                data[f.name],
                undefined,
                `Field "${f.name}" in step "${step.id}" must not be undefined for category "${cat}"`,
              );
              assert.notEqual(
                data[f.name],
                '',
                `Field "${f.name}" in step "${step.id}" must not be empty for category "${cat}"`,
              );
            }
          }
        }
        const errors = validateStep(step, data);
        assert.deepEqual(
          errors,
          {},
          `Step "${step.id}" must have 0 validation errors with demo autofill data for category "${cat}"`,
        );
      }
    }
  });
});
