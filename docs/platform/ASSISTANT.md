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

`START → agent → tools → agent → END` is a real compiled LangGraph StateGraph. The Azure model chooses structured tools; ToolNode validates and executes them, then feeds results back into the model. A 10-step recursion limit, 45-second request deadline, bounded input history, provider timeout and one retry limit resource usage. Requests are aborted when clients disconnect.

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
