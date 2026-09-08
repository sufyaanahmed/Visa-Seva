# Visa Seva AI assistant

The floating chat calls `POST /api/platform/chat` on the Express platform (also routed through the Vercel function). Start both `npm run platform:dev` and `npm run dev` locally. The platform's existing Supabase configuration is still required at startup.

Set these **server-side** environment variables in `.env` locally and in the hosting provider for deployments:

```
AZURE_OPENAI_API_KEY=<secret>
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5.5
AZURE_OPENAI_API_VERSION=v1
```

The deployment must exist in your Azure resource. `gpt-5.5` is a deployment name, not an API version. This integration uses `/openai/v1/chat/completions`, with no dated API-version parameter. Never put secrets in `VITE_` variables, commit env files, or enable request/header logging.

## Agent and tools

`START → agent → tools → agent → END` is a real compiled LangGraph StateGraph. The Azure model chooses structured tools; ToolNode validates and executes them, then feeds results back into the model. A 10-step recursion limit, 45-second request deadline, bounded input history, provider timeout and disabled automatic retries limit resource usage. Requests are aborted when clients disconnect.

- `check_visa_eligibility`: uses the existing reviewed eligibility engine. Missing answers return questions instead of an eligibility determination.
- `get_document_checklist`: returns route/category-specific requirements and file limits.
- `visa_reference`: retrieves categories, fee guidance, and application steps.

After a complete eligibility check, the server returns a deterministic `Start my application` action. The browser validates the action, saves only the reviewed finder answers, creates the matching local application state, and opens `/apply`. Long conversations keep validated finder answers outside the text transcript so early facts remain available after old chat messages are trimmed.

The assistant never completes identity fields, uploads, declarations, payment authorization, or final submission for the customer. Those steps require direct customer review and input. The assistant must not claim that opening or preparing the form filed a government application.

Assistant replies are normalized to remove em dashes. The system prompt requires simple, friendly and professional language with short sentences and familiar words.

All tools are read-only and reuse the portal's rules. They cannot modify applications, make payments, access account records, execute code, or fetch arbitrary URLs. The chat is an AI preparation aid, not government approval. Rule snapshots are not automatically refreshed; official sources and review dates travel with results.

The endpoint is public so visitors can explore visa routes before signing in. It has a separate 12-request/minute per-IP limiter and the platform's existing origin/body protections. In-memory rate limits apply per server instance; configure shared gateway/WAF quotas before high-volume multi-instance production use. No transcript is saved server-side. Each request contains a bounded client transcript plus finder answers; do not send identity scans or secrets. Reload/reset clears the in-memory browser conversation. Multiple instances do not require sticky sessions.

NDJSON events carry tool progress, the final reply plus deterministic source links, or a sanitized error. The UI supports stop, reset, retry, and conversation history; model text is rendered as text, never HTML. There is no canned-response fallback on Azure failure.

## Verification

- `npm test`: includes real graph/tool-loop tests with an injected model and HTTP error/validation tests.
- `npm run build`: checks browser compilation.
- `node --env-file=.env scripts/assistant-smoke.mjs`: real Azure model and tool execution (uses API quota). Errors print only status/code, never credentials.
- `npm run test:assistant:long`: three real multi-turn application conversations with 26 customer turns. It verifies retained eligibility facts, simple output without em dashes, correct route selection, and the final application action.

References: [LangGraph graph API](https://docs.langchain.com/oss/javascript/langgraph/use-graph-api), [Azure v1 API lifecycle](https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/foundry/openai/includes/api-version-lifecycle-content.md).

## Daily spending cutoff

Production model calls reserve budget atomically in Supabase before contacting Azure. The shared limit is $10 USD per UTC day (resets at 05:30 India time), enforced by `reserve_ai_budget`. Apply migration `202609080001_ai_budget.sql` before deploying the API. Only the service role may reserve or settle funds; clients cannot reset counters. No environment flag disables this guard.

Each physical GPT-5.5 call reserves a conservative input estimate plus the full 1,800-token output allowance, then reconciles Azure token usage. Cached inputs are charged at the regular input price. Missing usage, timeouts, failed requests and failed settlements retain the reservation. Database failures block new calls. Retries are disabled, and every tool-loop model call reserves separately. The counter starts at deployment; it does not import earlier Azure charges.

Pricing: GPT-5.5 Global Standard short-context input $5 and output $30 per million tokens, verified with the [Azure Retail Prices API](https://prices.azure.com/api/retail/prices) on 2026-09-08. Payloads are restricted to 100 KB and standard processing. Changing deployment, pricing or context limits requires updating and reviewing the guard. This is a conservative application usage limit, excluding taxes and other Azure services; direct use of the Azure credential outside this backend is not covered.

Read `ai_budget_days` for charged/reserved USD micro-units and `ai_budget_reservations` for settled requests. An uncertain request remains charged for its admission day. Do not automatically refund stale reservations.
