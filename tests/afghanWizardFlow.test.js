import { test } from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import { MemoryRouter } from 'react-router-dom';
import { getSteps, validateStep, afghanPurposes } from '../src/domain/applicationForm.js';
import { demoFixture } from '../src/domain/demoFixtures.js';

test('Afghan categories ignore a stale hidden confirmation email throughout the form', () => {
  for (const [visa_category, purposes] of Object.entries(afghanPurposes)) {
    for (const afghan_purpose of purposes) {
      const data = demoFixture('afghan', { visa_category, afghan_purpose, email: 'traveller@example.com', confirm_email: 'old@example.invalid' });
      for (const step of getSteps('afghan', data)) {
        assert.equal(validateStep(step, data, []).confirm_email, undefined, `${visa_category}/${afghan_purpose}/${step.id}`);
      }
    }
  }
  const data = demoFixture('evisa', { email: 'traveller@example.com', confirm_email: 'other@example.com' });
  const registration = getSteps('evisa', data).find(s => s.id === 'registration');
  assert.equal(validateStep(registration, data).confirm_email, 'Email addresses must match.');
  assert.equal(demoFixture('evisa', { email: 'traveller@example.com' }).confirm_email, 'traveller@example.com');
});

test('signed-in Afghan applicant can autofill and advance without any document upload', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
  const originals = Object.fromEntries(['window','document','sessionStorage','localStorage','fetch','IS_REACT_ACT_ENVIRONMENT'].map(k => [k, globalThis[k]]));
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, sessionStorage: dom.window.sessionStorage, localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true });
  dom.window.scrollTo = () => {};
  dom.window.requestAnimationFrame = fn => fn();
  let server, root;
  try {
    server = await createServer({ envDir: false, define: { 'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://wizard-test.supabase.co'), 'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('test-key') }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
    const { default: Wizard } = await server.ssrLoadModule('/src/pages/Wizard.jsx');
    const { StoreProvider, useStore } = await server.ssrLoadModule('/src/store.jsx');
    const client = await server.ssrLoadModule('/src/platform/client.js');
    client.supabase.auth.getSession = async () => ({ data: { session: { access_token: 'test-session' } } });
    const { createRoot } = await import('react-dom/client');
    let snapshot;
    function Seed() {
      const { state, updateState } = useStore();
      snapshot = state;
      React.useEffect(() => updateState({ step: 0, submitted: false, docs: [], data: { application_type: 'afghan', nationality: 'Afghanistan', visa_category: 'business', email: 'traveller@example.com' } }), []);
      return React.createElement(Wizard);
    }
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, method: options.method });
      const payload = options.body ? JSON.parse(options.body) : {};
      return new Response(JSON.stringify({ id: 'draft-one', version: calls.length, answers: payload.answers || snapshot.data, documents: [] }));
    };
    root = createRoot(document.getElementById('root'));
    await act(async () => root.render(React.createElement(MemoryRouter, { initialEntries: ['/apply?step=afghan-route'] }, React.createElement(StoreProvider, {}, React.createElement(Seed)))));
    const autofill = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Autofill');
    await act(async () => autofill.click());
    assert.equal(snapshot.docs.length, 0, 'autofill must not invent completed documents');
    assert.equal(client.selectedFiles.size, 0, 'autofill must not create fake file bytes');
    // A pending document from a previous step must not block saving this answer.
    client.selectedFiles.set('photograph', new File(['invalid JPEG'], 'photo.jpg', { type: 'image/jpeg' }));
    await act(async () => document.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })));
    assert.equal(document.querySelector('h1').textContent, 'Applicant identity');
    assert.ok(calls.some(c => c.method === 'POST'), 'draft saved to API');
    assert.ok(calls.every(c => !c.url.includes('/documents')), 'no document operations on step 1');
    assert.equal(client.selectedFiles.size, 1, 'pending selection is retained');
    const documents = getSteps('afghan', snapshot.data).find(s => s.id === 'documents');
    assert.match(validateStep(documents, snapshot.data, []).documents, /Select every required item/);
    client.selectedFiles.clear();
    await client.supabase.auth.dispose();
  } finally {
    if (root) await act(async () => root.unmount());
    await server?.close();
    dom.window.close();
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});
