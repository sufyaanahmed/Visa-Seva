import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

for (const configured of [false, true]) {
  test(`status uses secure application access with configuration ${configured ? 'present' : 'missing'}`, async () => {
    const server = await createServer({
      envDir: false,
      define: {
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(configured ? 'https://status-test.supabase.co' : ''),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(configured ? 'test-anon-key' : ''),
      },
      server: { middlewareMode: true, hmr: false },
      appType: 'custom',
    });
    try {
      const { default: Status } = await server.ssrLoadModule('/src/pages/Status.jsx');
      const { default: Applications } = await server.ssrLoadModule('/src/platform/Applications.jsx');
      assert.equal(Status, Applications);
      const html = renderToString(React.createElement(Status));
      if (configured) {
        assert.match(html, /Opening your application/);
      } else {
        assert.match(html, /Application access unavailable/);
        assert.match(html, /role="alert"/);
        const { api, saveApplication, APPLICATION_ACCESS_UNAVAILABLE } = await server.ssrLoadModule('/src/platform/client.js');
        for (const request of [() => api('/applications'), () => saveApplication({})]) {
          await assert.rejects(request, { message: APPLICATION_ACCESS_UNAVAILABLE });
        }
      }
      assert.doesNotMatch(html, /VS2026E00001|Sam Altman|GRANTED|Load example/);
    } finally {
      await server.close();
    }
  });
}
