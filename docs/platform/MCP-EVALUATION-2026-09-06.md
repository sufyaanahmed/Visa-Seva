# MCP evaluation — 2026-09-06

## Verdict and scope

The deployed endpoint responded successfully to a real MCP SDK initialize, tools/list, and public tools/call. Transport works. The first-question experience had a reproducible eligibility bug. This change fixes the local implementation; it has not been deployed or tested inside logged-in ChatGPT/Claude clients.

No government rules were changed or independently revalidated in this audit. The existing reference snapshot is dated 2026-08-27 and is explicitly not automatically synchronized.

## Findings and changes

| Finding | Evidence | Update |
| --- | --- | --- |
| Empty answers yielded a regular visa recommendation mentioning Pakistan origin | Reproduced on hosted endpoint with `visa_information({topic: "eligibility"})` | Return no recommendation/draft until applicable answers are valid; provide missing fields and the next question |
| Broad questions lacked an entry point | Topic previously mandatory and no overview existed | Default overview with first question and workflow |
| Assistant had to infer how finder fields map to drafts | Finder uses `passport`, draft uses `nationality`, and wizard requires a ruleset marker | Reuse website handoff mapping as `draftAnswers` |
| Returning users needed an unknown UUID | Every existing application read tool required an ID | Add scoped, paginated `list_applications`; omit answers from summaries |
| Discovery gave weak guidance about authentication and workflow | Minimal server/tool descriptions | Add server instructions, scoped metadata, bounded primitive inputs, structured results |
| Checkout treated as closed-world; service limits were easy to miss | Existing annotation and tool descriptions | Mark external checkout accurately; disclose sandbox and government-filing boundary |

## Automated regression cases

`tests/platformReference.test.js` covers broad questions, incomplete and invalid answers, completed US tourist handoff, conditional student/arrival questions, unsupported routes, and fee caveats. `tests/platformHttp.test.js` uses the official MCP SDK over HTTP to verify discovery, default overview, partial eligibility, malformed arguments, structured content, scoped metadata, listing summaries, and denied writes with read-only permissions. Existing database tests cover ownership, stale versions, human confirmation, payments, and single-use OAuth codes.

These are deterministic protocol and workflow checks. They do not prove how either model chooses tools or phrases responses.

## In-product acceptance set after deployment

Run each prompt in ChatGPT and Claude with the connector enabled, recording model/version, tool selected, arguments, output, permission prompts, and final response:

| Prompt / situation | Expected behavior |
| --- | --- |
| “Tell me about Indian evisa” | Public overview; no invented personal facts or unsolicited draft |
| “US passport, holiday for 14 days” | Canonical country; ask remaining eligibility questions; no premature verdict |
| “I have an official passport” | After gathering required facts, retain conservative route/cautions |
| “I am studying in India” | Ask Study in India institution condition |
| “How much does it cost?” | Distinguish variable government fees from sandbox payment |
| “Start my application” | OAuth and explicit intent; stable draft key; mapped answers |
| “Check my application” without an ID | List owned summaries; clarify ambiguous selection |
| Read-only grant, then “change my application” | Scope denial; no write |
| “Submit it” before confirmation/payment | Refuse premature submission through existing server/database guards |
| “Book my flight” | No unrelated tool invocation |
| Expired or revoked authorization | Reconnect; no access to protected records |

Release limitations: OAuth has no refresh tokens, so OAuth grants require reconnecting after one hour. Browser clients with third-party Origin headers need deliberately configured CORS. Directory publication/discovery is a separate distribution step; merely hosting `/mcp` does not make ordinary ChatGPT/Claude questions invoke Visa Seva. Government filing is not implemented.

## Verification results

- Hosted read-only probe: initialize passed; 10 existing tools listed; public eligibility call reproduced the empty-answer bug.
- Updated local MCP SDK integration: passed, including 11-tool discovery and public/protected behavior. Focused platform suite: 35/35 passed.
- Full suite at the recorded run: 84 of 85 tests passed. The sole failure was a concurrently added assistant HTTP test (`tests/assistant.test.js:50`, expected 400 but received 500), outside this MCP change.
- Frontend production build: passed.
- No hosted deployment or signed-in ChatGPT/Claude acceptance run was performed.
