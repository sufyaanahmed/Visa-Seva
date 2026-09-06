import express from "express";
import { installAssistant } from "./assistant/routes.js";
import { rateLimit } from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ApiError, createService, hash, unwrap } from "./service.js";
import { handleMcp } from "./mcp.js";
import { reference } from "./reference.js";
import { installOAuth } from "./oauth.js";
export const SCOPES = [
  "applications:read",
  "drafts:write",
  "applications:submit",
  "checkout:create",
];
export function createApp(db, config) {
  const app = express();
  const service = createService(db, config);
  const origins = new Set([config.publicUrl, config.adminUrl]);
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Cache-Control", "no-store");
    const origin = req.get("Origin");
    if (origin && !origins.has(origin))
      return res.status(403).json({ error: "Origin not allowed." });
    if (origin) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Vary", "Origin");
    }
    res.set(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, MCP-Protocol-Version, Accept",
    );
    res.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS",
    );
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(
    rateLimit({
      windowMs: 60000,
      limit: 180,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: "256kb" }));
  app.get("/health", (_req, res) =>
    res.json({ ok: true, service: "visa-seva-platform" }),
  );
  const human = async (req, _res, next) => {
    const token = req.get("Authorization")?.replace(/^Bearer /i, "");
    if (!token || token.startsWith("vs_agent_"))
      throw new ApiError(401, "Sign in to continue.");
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user)
      throw new ApiError(401, "Your session expired. Sign in again.");
    req.actor = { id: data.user.id, kind: "applicant" };
    next();
  };
  installOAuth(app, db, config, human, SCOPES);
  app.post("/mcp", async (req, res) => {
    const token = req.get("Authorization")?.replace(/^Bearer /i, "");
    if (
      !token &&
      req.body?.method === "tools/call" &&
      req.body?.params?.name !== "visa_information"
    ) {
      res.set(
        "WWW-Authenticate",
        `Bearer resource_metadata="${config.apiUrl}/.well-known/oauth-protected-resource"`,
      );
      throw new ApiError(401, "Connect your assistant to continue.");
    }
    if (token) {
      const grant = unwrap(
        await db
          .from("agent_grants")
          .select("*")
          .eq("token_hash", hash(token))
          .is("revoked_at", null)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle(),
      );
      if (!grant) {
        res.set(
          "WWW-Authenticate",
          `Bearer resource_metadata="${config.apiUrl}/.well-known/oauth-protected-resource"`,
        );
        throw new ApiError(401, "Assistant authorization expired or revoked.");
      }
      req.actor = {
        id: grant.owner_id,
        kind: "agent",
        scopes: grant.scopes,
        grantId: grant.id,
      };
      unwrap(
        await db
          .from("platform_audit")
          .insert({
            actor_id: grant.owner_id,
            actor_kind: "agent",
            action: `mcp:${String(req.body?.params?.name || req.body?.method || "request").slice(0, 100)}`,
          }),
      );
    }
    return handleMcp(req, res, service, config);
  });
  app.get("/mcp", (_req, res) => res.status(405).set("Allow", "POST").end());
  app.get("/api/platform/reference/:topic", (req, res) =>
    res.json(
      reference(
        z
          .enum(["categories", "eligibility", "documents", "fees", "steps"])
          .parse(req.params.topic),
      ),
    ),
  );
  installAssistant(app);
  app.use("/api/platform", human);
  app.get("/api/platform/me", async (req, res) =>
    res.json({ id: req.actor.id, role: await service.role(req.actor) }),
  );
  app.get("/api/platform/config", (_req, res) =>
    res.json({
      paymentMode: "sandbox",
      amount: config.sandboxAmount,
      currency: "USD",
      mcpUrl: `${config.apiUrl}/mcp`,
    }),
  );
  app.get("/api/platform/applications", async (req, res) =>
    res.json(
      await service.list(req.actor, {
        status: req.query.status,
        search: String(req.query.search || ""),
        page: Math.max(0, Math.min(1000, Number(req.query.page) || 0)),
      }),
    ),
  );
  app.post("/api/platform/applications", async (req, res) =>
    res
      .status(201)
      .json(
        await service.create(
          req.actor,
          req.body.answers,
          z.string().min(8).max(100).parse(req.body.draft_key),
        ),
      ),
  );
  const appId = (req) => z.string().uuid().parse(req.params.id);
  const version = (req) => z.number().int().positive().parse(req.body.version);
  app.get("/api/platform/applications/:id", async (req, res) =>
    res.json(await service.get(req.actor, appId(req))),
  );
  app.patch("/api/platform/applications/:id", async (req, res) =>
    res.json(
      await service.update(
        req.actor,
        appId(req),
        req.body.answers,
        version(req),
      ),
    ),
  );
  app.post("/api/platform/applications/:id/validate", async (req, res) =>
    res.json(await service.validate(req.actor, appId(req))),
  );
  app.post("/api/platform/applications/:id/confirm", async (req, res) =>
    res.json(await service.confirm(req.actor, appId(req), version(req))),
  );
  app.post("/api/platform/applications/:id/submit", async (req, res) =>
    res.json(await service.submit(req.actor, appId(req), version(req))),
  );
  app.post("/api/platform/applications/:id/reopen", async (req, res) =>
    res.json(await service.command(req.actor, appId(req), "reopen")),
  );
  app.post("/api/platform/applications/:id/checkout", async (req, res) =>
    res.json(
      await service.checkout(
        req.actor,
        appId(req),
        version(req),
        z.string().min(8).max(100).parse(req.body.request_key),
      ),
    ),
  );
  app.post(
    "/api/platform/applications/:id/payments/:paymentId",
    async (req, res) =>
      res.json(
        await service.command(req.actor, appId(req), "payment", {
          payment_id: z.string().uuid().parse(req.params.paymentId),
          outcome: z
            .enum(["processing", "paid", "failed", "cancelled", "pending"])
            .parse(req.body.outcome),
        }),
      ),
  );
  app.post(
    "/api/platform/applications/:id/documents/:type",
    express.raw({ type: "application/octet-stream", limit: "10mb" }),
    async (req, res) =>
      res.json(
        await service.upload(
          req.actor,
          appId(req),
          z.string().max(100).parse(req.params.type),
          req.body,
          z.coerce.number().int().positive().parse(req.query.version),
        ),
      ),
  );
  app.delete(
    "/api/platform/applications/:id/documents/:type",
    async (req, res) =>
      res.json(
        await service.command(req.actor, appId(req), "remove_document", {
          version: version(req),
          type: z.string().max(100).parse(req.params.type),
        }),
      ),
  );
  app.get(
    "/api/platform/applications/:id/documents/:documentId",
    async (req, res) =>
      res.json(
        await service.download(
          req.actor,
          appId(req),
          z.string().uuid().parse(req.params.documentId),
        ),
      ),
  );
  app.post("/api/platform/agents", async (req, res) =>
    res.json(
      await service.grant(
        req.actor,
        z.string().min(1).max(80).parse(req.body.label),
        z.array(z.enum(SCOPES)).min(1).max(4).parse(req.body.scopes),
      ),
    ),
  );
  app.get("/api/platform/agents", async (req, res) =>
    res.json(
      unwrap(
        await db
          .from("agent_grants")
          .select("id,label,scopes,expires_at,revoked_at")
          .eq("owner_id", req.actor.id),
      ),
    ),
  );
  app.delete("/api/platform/agents/:id", async (req, res) => {
    unwrap(
      await db
        .from("agent_grants")
        .update({ revoked_at: new Date().toISOString() })
        .eq("owner_id", req.actor.id)
        .eq("id", z.string().uuid().parse(req.params.id)),
    );
    unwrap(
      await db
        .from("platform_audit")
        .insert({
          actor_id: req.actor.id,
          actor_kind: "applicant",
          action: "agent_grant_revoked",
        }),
    );
    res.sendStatus(204);
  });
  app.use("/api/platform/admin", async (req, _res, next) => {
    req.actor.kind = "admin";
    if (!(await service.role(req.actor)))
      throw new ApiError(403, "Admin access required.");
    next();
  });
  app.get("/api/platform/admin/applications", async (req, res) =>
    res.json(
      await service.list(req.actor, {
        status: req.query.status,
        search: String(req.query.search || ""),
        page: Math.max(0, Math.min(1000, Number(req.query.page) || 0)),
      }),
    ),
  );
  app.get("/api/platform/admin/counts", async (_req, res) => {
    const statuses = [
      "draft",
      "awaiting_payment",
      "submitted",
      "under_review",
      "waiting_for_information",
      "accepted",
      "rejected",
    ];
    const counts = await Promise.all(
      statuses.map(async (status) => {
        const r = await db
          .from("applications")
          .select("id", { count: "exact", head: true })
          .eq("status", status);
        unwrap(r);
        return [status, r.count];
      }),
    );
    res.json(Object.fromEntries(counts));
  });
  app.get("/api/platform/admin/applications/:id", async (req, res) => {
    const a = await service.get(req.actor, appId(req));
    const emails = unwrap(
      await db
        .from("email_notifications")
        .select("*")
        .eq("application_id", a.id)
        .order("created_at"),
    );
    res.json({ ...a, emails });
  });
  app.get(
    "/api/platform/admin/applications/:id/documents/:documentId",
    async (req, res) =>
      res.json(
        await service.download(
          req.actor,
          appId(req),
          z.string().uuid().parse(req.params.documentId),
        ),
      ),
  );
  app.post(
    "/api/platform/admin/applications/:id/transition",
    async (req, res) =>
      res.json(
        await service.command(req.actor, appId(req), "transition", {
          version: version(req),
          status: z
            .enum([
              "under_review",
              "waiting_for_information",
              "accepted",
              "rejected",
            ])
            .parse(req.body.status),
          reason: z.string().trim().min(3).max(4000).parse(req.body.reason),
        }),
      ),
  );
  app.use((err, _req, res, _next) => {
    const status = err instanceof z.ZodError ? 400 : err.status || 500;
    res
      .status(status)
      .json({
        error:
          status === 500
            ? "Something went wrong. Please try again."
            : err instanceof z.ZodError
              ? "Check the submitted fields."
              : err.message,
        details: err.details,
      });
  });
  return app;
}
export function configuration(env = process.env) {
  for (const key of [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PUBLIC_APP_URL",
    "ADMIN_APP_URL",
    "PLATFORM_API_URL",
  ])
    if (!env[key])
      throw new Error(`${key} is required. See docs/platform/README.md.`);
  const urls = ["PUBLIC_APP_URL", "ADMIN_APP_URL", "PLATFORM_API_URL"].map(
    (k) => new URL(env[k]),
  );
  if (
    urls.some(
      (u) =>
        u.protocol !== "https:" &&
        !["localhost", "127.0.0.1", "admin.localhost"].includes(u.hostname),
    )
  )
    throw new Error("Hosted platform URLs require HTTPS.");
  const sandboxAmount = Number(env.SANDBOX_AMOUNT_CENTS || 100);
  if (!Number.isSafeInteger(sandboxAmount) || sandboxAmount < 0)
    throw new Error("Invalid sandbox amount");
  return {
    publicUrl: urls[0].origin,
    adminUrl: urls[1].origin,
    apiUrl: urls[2].origin,
    sandboxAmount,
  };
}
if (process.argv[1]?.endsWith("/platform/server.js")) {
  const config = configuration();
  const db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const server = createApp(db, config).listen(
    Number(process.env.PLATFORM_PORT || 3001),
    process.env.PLATFORM_HOST || "127.0.0.1",
    () =>
      console.log(
        "Visa Seva platform listening on port",
        process.env.PLATFORM_PORT || 3001,
      ),
  );
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  process.on("SIGTERM", () => server.close());
  process.on("SIGINT", () => server.close());
}
