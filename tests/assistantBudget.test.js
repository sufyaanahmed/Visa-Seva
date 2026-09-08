import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  createBudgetFetch,
  reservationCost,
} from "../platform/assistant/budget.js";
const body = JSON.stringify({
  model: "gpt-5.5",
  messages: [{ role: "user", content: "Hello" }],
  max_completion_tokens: 1800,
});

test("budget serializes competing calls, settles once, retains old-day charges and denies public access", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon;create role authenticated;create role service_role;",
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202609080001_ai_budget.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const ids = Array.from(
      { length: 20 },
      (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    );
    const results = await Promise.all(
      ids.map((id) =>
        db.query("select reserve_ai_budget($1,1000000) ok", [id]),
      ),
    );
    assert.equal(results.filter((x) => x.rows[0].ok).length, 10);
    assert.equal(
      (await db.query("select charged_micro_usd from ai_budget_days")).rows[0]
        .charged_micro_usd,
      10000000,
    );
    await assert.rejects(
      db.query("select settle_ai_budget($1,1000001)", [ids[0]]),
      /Invalid settlement/,
    );
    await db.query("select settle_ai_budget($1,100)", [ids[0]]);
    await db.query("select settle_ai_budget($1,0)", [ids[0]]);
    assert.equal(
      (await db.query("select charged_micro_usd from ai_budget_days")).rows[0]
        .charged_micro_usd,
      9000100,
    );
    await assert.rejects(
      db.query("select reserve_ai_budget($1,1)", [ids[0]]),
      /duplicate key/,
    );
    assert.equal(
      (await db.query("select charged_micro_usd from ai_budget_days")).rows[0]
        .charged_micro_usd,
      9000100,
    );
    // Carry an outstanding reservation over midnight; settling refunds its own day.
    await db.exec(
      "insert into ai_budget_days values('2000-01-01',1000);insert into ai_budget_reservations(id,day,reserved_micro_usd) values('11111111-1111-4111-8111-111111111111','2000-01-01',1000);",
    );
    await db.query(
      "select settle_ai_budget('11111111-1111-4111-8111-111111111111',100)",
    );
    assert.equal(
      (
        await db.query(
          "select charged_micro_usd from ai_budget_days where day='2000-01-01'",
        )
      ).rows[0].charged_micro_usd,
      100,
    );
    await db.exec("set role authenticated");
    await assert.rejects(
      db.query("select reserve_ai_budget($1,1)", [ids[19]]),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from ai_budget_days"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});

test("exhausted or unavailable ledger never contacts Azure", async () => {
  for (const reply of [{ data: false }, { error: { message: "offline" } }]) {
    let calls = 0;
    const run = createBudgetFetch({ rpc: async () => reply }, async () => {
      calls++;
    });
    await assert.rejects(
      run("https://example.openai.azure.com", { body }),
      /AI_BUDGET/,
    );
    assert.equal(calls, 0);
  }
});
test("each physical call reserves before sending and reconciles all input/output tokens", async () => {
  const events = [];
  const run = createBudgetFetch(
    {
      rpc: async (name, args) => {
        events.push({ name, args });
        return { data: true };
      },
    },
    async () => {
      events.push({ name: "azure" });
      return Response.json({
        usage: { prompt_tokens: 100, completion_tokens: 200 },
      });
    },
  );
  await run("https://example.openai.azure.com", { body });
  assert.deepEqual(
    events.map((x) => x.name),
    ["reserve_ai_budget", "azure", "settle_ai_budget"],
  );
  assert.equal(events[0].args.amount, reservationCost(body));
  assert.equal(events[2].args.amount, 6500);
  assert.equal(events[0].args.reservation_id, events[2].args.reservation_id);
});
test("uncertain responses retain reservations; unsupported pricing and oversized requests are rejected", async () => {
  for (const response of [
    () => {
      throw Error("timeout");
    },
    () => Response.json({}),
    () =>
      Response.json({ usage: { prompt_tokens: -1, completion_tokens: 10 } }),
  ]) {
    const calls = [];
    const run = createBudgetFetch(
      {
        rpc: async (name) => {
          calls.push(name);
          return { data: true };
        },
      },
      async () => response(),
    );
    try {
      await run("https://example.openai.azure.com", { body });
    } catch {}
    assert.deepEqual(calls, ["reserve_ai_budget"]);
  }
  for (const patch of [
    { model: "gpt-5.4" },
    { stream: true },
    { service_tier: "priority" },
    { max_completion_tokens: 5000 },
    { messages: ["x".repeat(100001)] },
  ])
    assert.throws(
      () => reservationCost(JSON.stringify({ ...JSON.parse(body), ...patch })),
      /AI_BUDGET/,
    );
});

test("real Azure SDK wiring cannot retry a denied reservation and surfaces the daily limit", async () => {
  const { createAzureModel } = await import("../platform/assistant/graph.js");
  const { assistantErrorMessage } =
    await import("../platform/assistant/routes.js");
  let reservations = 0;
  const model = createAzureModel(
    {
      AZURE_OPENAI_API_KEY: "test",
      AZURE_OPENAI_ENDPOINT: "https://example.openai.azure.com",
      AZURE_OPENAI_DEPLOYMENT: "gpt-5.5",
    },
    {
      db: {
        rpc: async () => {
          reservations++;
          return { data: false };
        },
      },
    },
  );
  let error;
  try {
    await model.invoke("Hello");
  } catch (e) {
    error = e;
  }
  assert.ok(error);
  assert.equal(reservations, 1);
  assert.match(assistantErrorMessage(error), /daily limit/);
});
