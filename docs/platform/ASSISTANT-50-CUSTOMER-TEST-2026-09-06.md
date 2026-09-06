# AI assistant 50-customer test — 6 September 2026

## Scope

Fifty distinct customer prompts were sent to the live Azure `gpt-5.5` deployment through the compiled LangGraph agent with concurrency 3. The set covered all ten e-Visa document categories, fees and application steps, incomplete and complete eligibility journeys, regular/Afghan/VoA routes, five languages, unsupported routes, and adversarial wording.

Every normal response was required to contain a substantive answer, invoke the expected structured tool, return HTTPS guidance sources, and avoid exposing the Azure credential.

## Results

- 49/50 prompts initially returned valid tool-backed answers.
- One prompt-injection-style request was rejected by Azure with `content_filter`. No provider detail or credential reached the UI.
- The filtered-message experience was improved to give a safe, actionable rephrase instruction. That exact live case was rerun and passed as a safe block.
- Final disposition: 49 answered and 1 safely blocked; all 50 customer cases handled correctly.
- Tool executions: 23 eligibility checks, 14 document checklists, and 15 reference lookups. A response can invoke more than one tool.
- Initial live-run wall time: 94.81 seconds.
- Per-customer latency: p50 5.238 seconds, p95 10.721 seconds, maximum 11.441 seconds.

## Browser journeys

The real mobile UI was exercised at 375×667 with the local frontend and platform server:

- Open chat from the floating launcher.
- Choose the “What documents do I need?” suggested prompt.
- Supply route and purpose in a conversational follow-up.
- Receive the tool-backed checklist and source links.
- Reset the conversation and verify old content is removed.
- Submit content-filter-triggering wording and receive a safe rephrase message with Retry.
- Stop an in-flight request and receive a retryable stopped state.
- Close and reopen the dialog; verify background scroll unlocks on close.
- Complete a two-turn eligibility check; the agent asks for missing facts before recommending a route.

The click test exposed premature “likely eligible” wording while answers were incomplete. The system instruction was tightened and the exact live journey was rerun. The assistant now asks only for the missing facts and does not preview a route before the eligibility tool returns a recommendation.

## Repeat the test

Run all customers:

```sh
npm run test:assistant:50
```

Run one customer by number:

```sh
npm run test:assistant:50 -- --customer 46
```

This test consumes Azure API quota. Its default concurrency is 3 and each customer has a 60-second timeout.
