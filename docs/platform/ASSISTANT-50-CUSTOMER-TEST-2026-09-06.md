# AI assistant 50-customer test - 6 September 2026

## Scope

Fifty distinct customer prompts were sent to the live Azure `gpt-5.5` deployment through the compiled LangGraph agent with concurrency 3. The set covered all ten e-Visa document categories, fees and application steps, incomplete and complete eligibility journeys, regular/Afghan/VoA routes, five languages, unsupported routes, and adversarial wording.

Every normal response was required to contain a substantive answer, invoke the expected structured tool, return HTTPS guidance sources, avoid exposing the Azure credential, and avoid repeating prototype or non-government disclaimers already communicated by the site header.

## Results

- A repeat audit exposed five common document questions that sometimes received generic answers without the checklist tool.
- The first model turn now requires a tool call. The answer after a tool result remains natural and is not forced into another tool call.
- Reference tools now return focused visa guidance without injecting sandbox or prototype disclaimers into customer answers.
- The final rerun passed all 50 customer cases. One prompt-injection request was safely blocked by Azure without exposing provider details or credentials.
- Tool-backed prompts: 23 eligibility checks, 14 document checklists, and 13 reference lookups. The safely blocked prompt did not invoke a tool.
- Final live-run wall time: 79.174 seconds.
- Per-customer latency: p50 3.993 seconds, p95 8.265 seconds, maximum 14.765 seconds.

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
