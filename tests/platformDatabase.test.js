import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const owner = "11111111-1111-4111-8111-111111111111",
  other = "22222222-2222-4222-8222-222222222222",
  reviewer = "33333333-3333-4333-8333-333333333333",
  decider = "44444444-4444-4444-8444-444444444444";
let db;
before(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key,email text); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema public,auth to authenticated,anon,service_role; grant execute on function auth.uid() to public; insert into auth.users values('${owner}','owner@example.com'),('${other}','other@example.com'),('${reviewer}','reviewer@example.com'),('${decider}','decider@example.com');`,
  );
  for (const f of [
    "202609050001_platform.sql",
    "202609050003_oauth.sql",
    "202609090001_application_flow.sql",
    "202609090002_legacy_checkout.sql",
  ])
    await db.exec(
      await readFile(
        new URL(`../supabase/migrations/${f}`, import.meta.url),
        "utf8",
      ),
    );
  await db.exec(
    `insert into platform_roles values('${reviewer}','reviewer'),('${decider}','decision_maker')`,
  );
});
after(async () => db.close());
async function cmd(actor, kind, id, command, payload = {}) {
  return (
    await db.query(
      "select platform_command($1::uuid,$2,$3::uuid,$4,$5::jsonb) as result",
      [actor, kind, id, command, JSON.stringify(payload)],
    )
  ).rows[0].result;
}
async function create(key) {
  return cmd(owner, "applicant", null, "create", {
    draft_key: key,
    answers: { application_type: "regular" },
  });
}
test("draft creation is idempotent per owner and inaccessible to another applicant", async () => {
  const a = await create("draft-one");
  assert.equal((await create("draft-one")).id, a.id);
  await assert.rejects(
    cmd(other, "applicant", a.id, "update", { version: 1, answers: {} }),
    /not found/,
  );
  const separate = await cmd(other, "applicant", null, "create", {
    draft_key: "draft-one",
    answers: { application_type: "regular" },
  });
  assert.notEqual(separate.id, a.id);
});
test("one applicant can retrieve multiple applications with independent persisted statuses", async () => {
  const first = await create("status-first");
  const second = await create("status-second");
  await cmd(owner, "applicant", second.id, "confirm", {
    version: second.version,
  });
  assert.notEqual(first.reference, second.reference);
  await db.exec(
    `set role authenticated;select set_config('request.jwt.claim.sub','${owner}',false);`,
  );
  try {
    const { rows } = await db.query(
      "select id,status from applications where id in ($1,$2)",
      [first.id, second.id],
    );
    assert.equal(rows.length, 2);
    assert.equal(rows.find((row) => row.id === first.id).status, "draft");
    assert.equal(
      rows.find((row) => row.id === second.id).status,
      "awaiting_payment",
    );
  } finally {
    await db.exec("reset role");
  }
});
test("RLS prevents applicants reading others, writing decisions, or assigning roles", async () => {
  await db.exec(
    `set role authenticated;select set_config('request.jwt.claim.sub','${owner}',false);`,
  );
  try {
    const rows = (await db.query("select * from applications")).rows;
    assert.ok(rows.length);
    assert.ok(rows.every((r) => r.owner_id === owner));
    await assert.rejects(
      db.exec("update applications set status='accepted'"),
      /permission denied/,
    );
    await assert.rejects(
      db.exec(`insert into platform_roles values('${owner}','administrator')`),
      /permission denied/,
    );
    await assert.rejects(
      db.exec("select * from agent_grants"),
      /permission denied/,
    );
    await assert.rejects(
      cmd(owner, "admin", rows[0].id, "transition", {
        version: 1,
        status: "accepted",
        reason: "test",
      }),
      /permission denied/,
    );
  } finally {
    await db.exec("reset role");
  }
});
test("null or stale versions cannot mutate a draft; agents cannot approve or pay", async () => {
  let a = await create("version");
  await assert.rejects(
    cmd(owner, "applicant", a.id, "update", { answers: {} }),
    /Version conflict/,
  );
  a = await cmd(owner, "applicant", a.id, "update", {
    version: a.version,
    answers: { application_type: "regular", given_name: "New" },
  });
  await assert.rejects(
    cmd(owner, "applicant", a.id, "update", { version: 1, answers: {} }),
    /Version conflict/,
  );
  await assert.rejects(
    cmd(owner, "agent", a.id, "confirm", { version: a.version }),
    /Human confirmation/,
  );
  await assert.rejects(
    cmd(owner, "agent", a.id, "payment", { outcome: "paid" }),
    /Authorize payment/,
  );
});
test("checkout retries, payment events and submission are durable and separate", async () => {
  let a = await create("payment");
  await assert.rejects(
    cmd(owner, "agent", a.id, "submit", { version: a.version }),
    /Payment and current/,
  );
  a = await cmd(owner, "applicant", a.id, "confirm", { version: a.version });
  assert.equal(a.status, "awaiting_payment");
  const checkout = {
    version: a.version,
    request_key: "attempt1",
    amount: 100,
    currency: "USD",
  };
  await Promise.all([
    cmd(owner, "applicant", a.id, "checkout", checkout),
    cmd(owner, "applicant", a.id, "checkout", {
      ...checkout,
      request_key: "attempt2",
    }),
  ]);
  let sessions = (
    await db.query("select * from payment_sessions where application_id=$1", [
      a.id,
    ])
  ).rows;
  assert.equal(sessions.length, 1);
  a = await cmd(owner, "applicant", a.id, "payment", {
    payment_id: sessions[0].id,
    outcome: "failed",
  });
  assert.equal(a.status, "awaiting_payment");
  assert.equal(a.payment_status, "failed");
  await cmd(owner, "applicant", a.id, "checkout", {
    ...checkout,
    request_key: "retry3",
  });
  sessions = (
    await db.query(
      "select * from payment_sessions where application_id=$1 and status='pending'",
      [a.id],
    )
  ).rows;
  const p = sessions[0];
  await cmd(owner, "applicant", a.id, "payment", {
    payment_id: p.id,
    outcome: "paid",
  });
  await cmd(owner, "applicant", a.id, "payment", {
    payment_id: p.id,
    outcome: "failed",
  });
  a = await cmd(owner, "agent", a.id, "submit", { version: a.version });
  assert.equal(a.status, "submitted");
  assert.equal(a.payment_status, "paid");
  const emails = (
    await db.query(
      "select * from email_notifications where application_id=$1",
      [a.id],
    )
  ).rows;
  assert.equal(emails.length, 1);
  assert.equal(emails[0].recipient, "owner@example.com");
});
test("reviewer cannot accept; decision maker records reason and queues notification atomically", async () => {
  let a = await create("decision");
  a = await cmd(owner, "applicant", a.id, "confirm", { version: a.version });
  await cmd(owner, "applicant", a.id, "checkout", {
    version: a.version,
    request_key: "payment1",
    amount: 100,
    currency: "USD",
  });
  const p = (
    await db.query("select id from payment_sessions where application_id=$1", [
      a.id,
    ])
  ).rows[0];
  await cmd(owner, "applicant", a.id, "payment", {
    payment_id: p.id,
    outcome: "paid",
  });
  a = await cmd(owner, "applicant", a.id, "submit", { version: a.version });
  a = await cmd(reviewer, "admin", a.id, "transition", {
    version: a.version,
    status: "under_review",
    reason: "Review started",
  });
  await assert.rejects(
    cmd(reviewer, "admin", a.id, "transition", {
      version: a.version,
      status: "accepted",
      reason: "All in order",
    }),
    /Decision role/,
  );
  await assert.rejects(
    cmd(decider, "admin", a.id, "transition", {
      version: a.version,
      status: "accepted",
      reason: "",
    }),
    /reason/,
  );
  a = await cmd(decider, "admin", a.id, "transition", {
    version: a.version,
    status: "waiting_for_information",
    reason: "Please replace the passport copy",
  });
  const before = a.version;
  a = await cmd(owner, "agent", a.id, "update", {
    version: a.version,
    answers: { application_type: "regular" },
  });
  assert.ok(a.version > before);
  assert.equal(a.confirmed_version, null);
  assert.equal(a.payment_status, "paid");
  await assert.rejects(
    cmd(owner, "agent", a.id, "submit", { version: a.version }),
    /confirmation/,
  );
  a = await cmd(owner, "applicant", a.id, "confirm", { version: a.version });
  a = await cmd(owner, "agent", a.id, "submit", { version: a.version });
  a = await cmd(reviewer, "admin", a.id, "transition", {
    version: a.version,
    status: "under_review",
    reason: "Replacement reviewed",
  });
  a = await cmd(decider, "admin", a.id, "transition", {
    version: a.version,
    status: "accepted",
    reason: "All documents reviewed. View your next steps.",
  });
  assert.equal(a.status, "accepted");
  await assert.rejects(
    cmd(decider, "admin", a.id, "transition", {
      version: a.version,
      status: "rejected",
      reason: "Changed mind",
    }),
    /Invalid status/,
  );
  const events = (
    await db.query(
      "select * from email_notifications where application_id=$1",
      [a.id],
    )
  ).rows;
  assert.equal(events.length, 4);
  assert.ok(events.some((e) => e.subject.includes("accepted")));
});
test("expired notification attempts are not resent beyond provider idempotency window", async () => {
  await db.exec(
    "update email_notifications set first_attempt_at=now()-interval '25 hours' where status='queued'",
  );
  await db.query("select * from claim_platform_emails()");
  assert.equal(
    (
      await db.query(
        "select count(*)::int as n from email_notifications where status='queued'",
      )
    ).rows[0].n,
    0,
  );
  assert.ok(
    (
      await db.query(
        "select count(*)::int as n from email_notifications where status='needs_attention'",
      )
    ).rows[0].n > 0,
  );
});
test("OAuth authorization codes bind client, redirect, PKCE and audience and are single use", async () => {
  const c = (
    await db.query(
      "insert into platform_oauth_clients(name,redirect_uris) values('Client',array['http://localhost:4567/callback']) returning id",
    )
  ).rows[0];
  await db.query(
    "insert into platform_oauth_requests(client_id,redirect_uri,state,challenge,scopes,resource,owner_id,code_hash) values($1,$2,$3,$4,$5,$6,$7,$8)",
    [
      c.id,
      "http://localhost:4567/callback",
      "state",
      "challenge",
      ["applications:read"],
      "https://api.example.com/mcp",
      owner,
      "code",
    ],
  );
  const redeem = (challenge, resource = "https://api.example.com/mcp") =>
    db.query("select redeem_platform_code($1,$2,$3,$4,$5,$6)", [
      "code",
      c.id,
      "http://localhost:4567/callback",
      challenge,
      resource,
      "tokenhash",
    ]);
  await assert.rejects(redeem("wrong"), /invalid_grant/);
  await assert.rejects(
    redeem("challenge", "https://wrong.example/mcp"),
    /invalid_grant/,
  );
  await redeem("challenge");
  await assert.rejects(redeem("challenge"), /invalid_grant/);
});

test("direct submitted decisions retain decision role and one immutable email event", async () => {
  for (const status of ["accepted", "rejected"]) {
    let a = await create(`direct-${status}`);
    await db.query(
      "update applications set status='submitted',payment_status='paid' where id=$1",
      [a.id],
    );
    await assert.rejects(
      cmd(reviewer, "admin", a.id, "transition", {
        version: a.version,
        status,
        reason: "Reviewed documents",
      }),
      /Decision role/,
    );
    const decided = await cmd(decider, "admin", a.id, "transition", {
      version: a.version,
      status,
      reason: "Reviewed documents",
    });
    assert.equal(decided.status, status);
    await assert.rejects(
      cmd(decider, "admin", a.id, "transition", {
        version: a.version,
        status,
        reason: "Duplicate",
      }),
      /Version conflict/,
    );
    const emails = await db.query(
      "select * from email_notifications where application_id=$1",
      [a.id],
    );
    assert.equal(emails.rows.length, 1);
  }
});
test("cached email authentication links cannot be read by authenticated staff", async () => {
  await db.exec(
    `set role authenticated;select set_config('request.jwt.claim.sub','${decider}',false);`,
  );
  try {
    await assert.rejects(
      db.query("select delivery_payload from email_notifications"),
      /permission denied/,
    );
    await db.query("select subject,status from email_notifications");
  } finally {
    await db.exec("reset role");
  }
});

test("legacy $1 sandbox checkouts can be repriced but owner isolation and provider orders remain protected", async () => {
  let a = await create("legacy-fee");
  a = await cmd(owner, "applicant", a.id, "confirm", { version: a.version });
  await cmd(owner, "applicant", a.id, "checkout", {
    version: a.version,
    request_key: "legacy-fee",
    amount: 100,
    currency: "USD",
  });
  const p = (
    await db.query("select * from payment_sessions where application_id=$1", [
      a.id,
    ])
  ).rows[0];
  async function reprice(actor) {
    return (
      await db.query(
        "select reprice_legacy_payment($1,$2,$3,27500,'USD') as changed",
        [actor, a.id, p.id],
      )
    ).rows[0].changed;
  }
  assert.equal(await reprice(other), false);
  assert.equal(await reprice(owner), true);
  assert.equal(
    (await db.query("select amount from payment_sessions where id=$1", [p.id]))
      .rows[0].amount,
    27500,
  );
  await db.query(
    "update payment_sessions set provider='razorpay',provider_order_id='order_locked' where id=$1",
    [p.id],
  );
  assert.equal(await reprice(owner), false);
  await db.exec("set role authenticated");
  try {
    await assert.rejects(reprice(owner), /permission denied/);
  } finally {
    await db.exec("reset role");
  }
});
