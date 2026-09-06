import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createApp, configuration } from "../platform/server.js";
const config = {
  publicUrl: "http://127.0.0.1:5173",
  adminUrl: "http://admin.localhost:5173",
  apiUrl: "http://127.0.0.1:3001",
  sandboxAmount: 100,
};
const id = "11111111-1111-4111-8111-111111111111";
function stubDb() {
  return {
    auth: {
      getUser: async (token) =>
        token === "human"
          ? { data: { user: { id } } }
          : { data: { user: null }, error: { message: "invalid" } },
    },
    from(table) {
      if (table === "platform_audit")
        return { insert: async () => ({ data: null }) };
      let inserted;
      const query = {
        insert(value) {
          inserted = value;
          return this;
        },
        single: async () => ({ data: { id, ...inserted } }),
        select() {
          return this;
        },
        eq() {
          return this;
        },
        order() {
          return this;
        },
        range: async () => ({
          data: [{ id, reference: "VS-TEST", answers: { surname: "Private" } }],
          count: 1,
        }),
        is() {
          return this;
        },
        gt() {
          return this;
        },
        maybeSingle: async () => ({
          data:
            table === "agent_grants"
              ? { owner_id: id, scopes: ["applications:read"] }
              : null,
        }),
      };
      return query;
    },
  };
}
async function withServer(fn) {
  const server = createApp(stubDb(), config).listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
}
test("HTTP authentication, origin rejection, and server-side admin guard", async () =>
  withServer(async (base) => {
    assert.equal((await fetch(`${base}/health`)).status, 200);
    assert.equal(
      (
        await fetch(`${base}/health`, {
          headers: { Origin: "https://attacker.invalid" },
        })
      ).status,
      403,
    );
    assert.equal(
      (await fetch(`${base}/api/platform/applications`)).status,
      401,
    );
    assert.equal(
      (
        await fetch(`${base}/api/platform/admin/counts`, {
          headers: { Authorization: "Bearer human" },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await fetch(`${base}/api/platform/me`, {
          headers: { Authorization: "Bearer vs_agent_something" },
        })
      ).status,
      401,
    );
    const r = await fetch(`${base}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "read_application", arguments: { id } },
      }),
    });
    assert.equal(r.status, 401);
    assert.match(r.headers.get("www-authenticate"), /oauth-protected-resource/);
  }));
test("real MCP SDK initializes, discovers focused tools, returns official sources, and enforces scopes", async () =>
  withServer(async (base) => {
    const client = new Client({
      name: "platform-integration-test",
      version: "1",
    });
    await client.connect(
      new StreamableHTTPClientTransport(new URL(`${base}/mcp`)),
    );
    try {
      const { tools } = await client.listTools();
      assert.equal(tools.length, 11);
      assert.ok(tools.some((t) => t.name === "create_checkout"));
      assert.deepEqual(
        tools.find((t) => t.name === "visa_information")._meta.securitySchemes,
        [{ type: "noauth" }],
      );
      assert.equal(
        tools.find((t) => t.name === "create_checkout").annotations
          .openWorldHint,
        true,
      );
      const overview = await client.callTool({
        name: "visa_information",
        arguments: {},
      });
      assert.equal(overview.structuredContent.firstQuestion.id, "passport");
      assert.deepEqual(
        overview.structuredContent,
        JSON.parse(overview.content[0].text),
      );
      const partial = await client.callTool({
        name: "visa_information",
        arguments: {
          topic: "eligibility",
          answers: { passport: "United States" },
        },
      });
      assert.equal(partial.structuredContent.recommendation, null);
      assert.equal(partial.structuredContent.nextQuestion.id, "passportType");
      const invalid = await client.callTool({
        name: "visa_information",
        arguments: {
          topic: "eligibility",
          answers: { passport: { nested: true } },
        },
      });
      assert.equal(invalid.isError, true);
      const result = await client.callTool({
        name: "visa_information",
        arguments: {
          topic: "documents",
          answers: { application_type: "regular" },
        },
      });
      assert.equal(result.isError, undefined);
      const data = JSON.parse(result.content[0].text);
      assert.equal(data.documents[0].maxBytes, 300 * 1024);
      assert.ok(
        data.sources.every((s) =>
          s.url.startsWith("https://indianvisaonline.gov.in/"),
        ),
      );
    } finally {
      await client.close();
    }
    const scoped = new Client({ name: "read-only-assistant", version: "1" });
    await scoped.connect(
      new StreamableHTTPClientTransport(new URL(`${base}/mcp`), {
        requestInit: { headers: { Authorization: "Bearer vs_agent_readonly" } },
      }),
    );
    try {
      const found = await scoped.callTool({
        name: "list_applications",
        arguments: {},
      });
      assert.equal(found.structuredContent.applications[0].id, id);
      assert.equal(found.structuredContent.applications[0].answers, undefined);
      const result = await scoped.callTool({
        name: "update_draft",
        arguments: { id, version: 1, answers: { application_type: "regular" } },
      });
      assert.equal(result.isError, true);
      assert.match(result.content[0].text, /drafts:write/);
    } finally {
      await scoped.close();
    }
  }));
test("configuration fails closed on absent secrets or insecure hosted URLs", () => {
  assert.throws(() => configuration({}), /SUPABASE_URL/);
  assert.throws(
    () =>
      configuration({
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "test",
        PUBLIC_APP_URL: "http://example.com",
        ADMIN_APP_URL: "https://admin.example.com",
        PLATFORM_API_URL: "https://api.example.com",
      }),
    /HTTPS/,
  );
});

test("OAuth discovery and public-client registration validate redirects", async () =>
  withServer(async (base) => {
    const metadata = await (
      await fetch(`${base}/.well-known/oauth-authorization-server`)
    ).json();
    assert.deepEqual(metadata.code_challenge_methods_supported, ["S256"]);
    const response = await fetch(`${base}/oauth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: "Test client",
        redirect_uris: ["http://127.0.0.1:3456/callback"],
      }),
    });
    assert.equal(response.status, 201);
    const client = await response.json();
    assert.equal(client.client_id, id);
    assert.equal(client.token_endpoint_auth_method, "none");
    const bad = await fetch(`${base}/oauth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: "Test client",
        redirect_uris: ["javascript:alert(1)"],
      }),
    });
    assert.equal(bad.status, 400);
  }));
