import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, test } from 'node:test';

const storeUrl = new URL('../src/store.jsx', import.meta.url);
const storeSource = await readFile(storeUrl, 'utf8');
const contextOffset = storeSource.indexOf('const StoreContext');
assert.notEqual(contextOffset, -1, 'Store pure-model boundary must remain discoverable');

const pureStoreSource = storeSource
  .slice(0, contextOffset)
  .replace(/^import .*;\r?\n/gm, '');
const storeModuleUrl = `data:text/javascript;base64,${Buffer.from(pureStoreSource).toString('base64')}`;
const { applyDataUpdate, hydrateState, safeDocumentMetadata } = await import(storeModuleUrl);

describe('document selection session state', () => {
  test('editing an earlier answer requires later steps to be validated again', () => {
    const changed = applyDataUpdate({ step: 1, furthestStep: 5, data: { given_name: 'DEMO' }, docs: [] }, 'given_name', '');
    assert.equal(changed.furthestStep, 1);
    const unchanged = applyDataUpdate({ step: 1, furthestStep: 5, data: { given_name: 'DEMO' }, docs: [] }, 'given_name', 'DEMO');
    assert.equal(unchanged.furthestStep, 5);
  });
  test('normalizes an empty browser MIME type from a valid PDF extension', () => {
    const metadata = safeDocumentMetadata({
      type: 'passport',
      name: 'passport.pdf',
      mimeType: '',
      size: 12_000,
    });
    assert.equal(metadata.mimeType, 'application/pdf');
  });
  test('a newly validated selection is valid only for the current session', () => {
    const selected = safeDocumentMetadata({
      type: 'passport',
      extension: 'pdf',
      mimeType: 'application/pdf',
      size: 20_000,
    });

    assert.equal(selected.status, 'selected-this-session');
  });

  test('rehydrated metadata requires file reselection', () => {
    const hydrated = hydrateState({
      data: { application_type: 'evisa', visa_category: 'tourist' },
      docs: [{
        type: 'passport',
        extension: 'pdf',
        mimeType: 'application/pdf',
        size: 20_000,
        status: 'selected-this-session',
      }],
    });

    assert.equal(hydrated.docs[0].status, 'needs-reselection');
  });

  test('changing a purpose-driving field invalidates old document metadata', () => {
    const previous = {
      data: { application_type: 'evisa', visa_category: 'tourist', student_course_type: '' },
      docs: [{ type: 'passport', status: 'selected-this-session' }],
    };
    const changed = applyDataUpdate(previous, 'visa_category', 'student');

    assert.deepEqual(changed.docs, []);
    assert.equal(changed.data.afghan_purpose, '');
    assert.equal(changed.data.student_course_type, '');
  });

  test('updating an unrelated field preserves current-session selections', () => {
    const docs = [{ type: 'passport', status: 'selected-this-session' }];
    const changed = applyDataUpdate({ data: { visa_category: 'tourist' }, docs }, 'given_name', 'DEMO');

    assert.equal(changed.docs, docs);
  });
});
