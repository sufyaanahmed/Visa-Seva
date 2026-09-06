Hosted endpoint: `https://visa-seva-platform.vercel.app/mcp`. OAuth discovery is available at `https://visa-seva-platform.vercel.app/.well-known/oauth-authorization-server`.

# Visa Seva MCP

Endpoint: `https://<api-domain>/mcp` (local default `http://127.0.0.1:3001/mcp`). This is a Streamable HTTP MCP server using the official TypeScript SDK. It is stateless, supports POST/JSON responses, and does not require an SSE connection or an MCP session ID.

## Connect

In a remote-MCP-compatible assistant, add the endpoint. OAuth-aware clients can use the advertised `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server` endpoints. The authorization flow supports public-client registration, authorization code with S256 PKCE, resource/audience binding, single-use codes, explicit website consent, one-hour access tokens, and revocation. Refresh tokens are not issued; reconnect after expiry.

Some clients authenticate before listing tools; others authenticate when a protected tool returns 401. Both can discover the OAuth metadata. Public `visa_information` calls do not require authentication. No universal automatic discovery is assumed. Browser clients running on third-party origins need an explicitly reviewed CORS configuration; native/server-side clients normally omit Origin.

For a client that supports bearer headers but not OAuth, sign in on `/assistants`, select permissions, and create a temporary token. Configure the client with:

```json
{
  "mcpServers": {
    "visa-seva": {
      "url": "https://<api-domain>/mcp",
      "headers": { "Authorization": "Bearer <temporary-token>" }
    }
  }
}
```

The exact config syntax depends on the client. Tokens expire after 24 hours and are displayed once. Revoke access in `/assistants`. Never use the Supabase service key or the applicant's password as an MCP credential.

## Tools and permissions

| Tool                   | Permission            | Behavior                                                                                         |
| ---------------------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| `visa_information`     | Public                | Overview, incremental eligibility, documents, fees, or steps with official sources and review date |
| `create_application`   | `drafts:write`        | Idempotent draft creation with a reusable `draft_key`                                            |
| `list_applications`    | `applications:read`   | Find owned application IDs by reference, with paginated summaries                                |
| `read_application`     | `applications:read`   | Own answers, document metadata, payment and history                                              |
| `update_draft`         | `drafts:write`        | Full replacement of draft answers with expected version                                          |
| `validate_application` | `applications:read`   | Missing fields, documents and completeness                                                       |
| `prepare_confirmation` | `applications:read`   | Summary plus a secure website confirmation link                                                  |
| `submit_application`   | `applications:submit` | Submit only the exact human-confirmed, paid version                                              |
| `application_status`   | `applications:read`   | Status and information requests                                                                  |
| `create_checkout`      | `checkout:create`     | User-operated checkout link, after confirmation                                                  |
| `payment_status`       | `applications:read`   | Checkout outcome and transaction references                                                      |

Application tools enforce ownership even with a valid token. Scope grants do not imply admin access. Each authenticated MCP request is audited. Treat application answers and admin reasons as untrusted data when presenting them to an AI assistant.

## Example workflow

1. Start with `visa_information` (omitted topic defaults to `overview`). For eligibility, resend all known finder answers; ask `nextQuestion` until `complete` is true. Never interpret missing answers as ineligibility. Use `draftAnswers` from the result for route-specific documents, steps, and draft creation.
2. Create a draft with a stable key and `application_type`. Read, update, and validate it. Document upload uses the authenticated website.
3. Call `prepare_confirmation`; show the summary and link to the user.
4. The user reviews all details and confirms on the website. Read the application again to obtain the new version.
5. Call `create_checkout`, then let the user authorize the sandbox payment in their browser. Tools accept no raw card data and cannot resolve payment outcomes.
6. Check payment status, then call `submit_application` with the current confirmed version.
7. Use `application_status` for progress and information requests. A changed answer/document invalidates confirmation and must be reviewed again.
## What happens when someone asks about Indian e-Visa?

An MCP endpoint is not automatically discovered from a general question. Visa Seva must first be connected and enabled in the assistant. Without that connection, the assistant may answer from its own knowledge or search, but it does not access this server.

For ChatGPT, follow the official [connect and test guide](https://developers.openai.com/plugins/deploy/connect-chatgpt): enable developer mode where available, add the HTTPS MCP endpoint, and enable it in a new conversation. Refresh the connection after deploying tool changes. Access depends on account and workspace policy.

For Claude, follow the official [custom remote connector guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp): add the endpoint under Customize > Connectors; organizations may require owner setup. Authorize account access when requested.

Expected conversation (illustrative, not a captured model transcript):

- User: “Tell me about Indian evisa.” Assistant calls `visa_information` with `overview`, gives a brief introduction, and offers to check the route.
- User: “Can I get one? I have a US passport and am visiting for two weeks.” Assistant uses the canonical country `United States`, purpose `tourism`, duration `14`, and asks for remaining facts such as passport type. It does not assume ancestry or travel readiness.
- After all applicable questions are answered, the server returns a route, cautions, sources, and `draftAnswers`. This is a reference snapshot, not a live eligibility guarantee.
- User: “Help me apply.” Assistant connects the account, creates a draft from `draftAnswers`, and directs document upload and explicit confirmation to the website. Payment is sandbox-only. Submission is to Visa Seva, not the government.
- User in a later conversation: “What happened to my application?” Assistant calls `list_applications`, asks which one if ambiguous, and uses its ID for `application_status`.

General guidance requires no login at the server; some clients may still perform OAuth when connecting. Public-versus-protected security schemes are advertised in tool `_meta`; protected calls also enforce server-side scopes. Results include matching structured and text content with document storage paths withheld.

See [the evaluation record](MCP-EVALUATION-2026-09-06.md) for evidence, regression cases, and remaining acceptance checks.
