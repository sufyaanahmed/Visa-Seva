# Admin portal audit, 6 September 2026

## Fixes

- Separate access checks, queue loading, record loading and decision submission so one request cannot unlock another operation.
- Retry the failed operation: access checks reload access, queue failures reload the queue, and record failures reload that application.
- Cancel stale record responses when returning to the queue. Clear stale rows after a failed queue refresh.
- Lock decision submission and navigation while saving. Reject whitespace-only reasons and guard duplicate submissions.
- Show confirmation after a saved decision. If the subsequent record reload fails, hide the old form and retry the reload without posting the decision again.
- Preserve a reason after a failed decision request and offer a record reload for version conflicts.
- Return to the last available page when queue counts shrink. Do not mistake a failed queue request for an empty search result.
- Show an explicit empty document state.
- Give submitted, under-review and information-request cases primary visual weight. Keep intake and completed counts as compact secondary filters.
- Move the review action above supporting details, show the staff role in the header and collapse the full application answers until requested.
- Use a clear row action, selected filter state, full-width sign-in action and a single-column mobile layout.

## Verification

- Eleven React DOM interaction regression tests cover failed access and missing roles, detail retries, stale detail responses, clean queue hierarchy, reviewer/decision-maker/administrator choices, successful writes followed by failed refreshes, version conflicts, queue failures, duplicate submissions, pagination and navigation during pending requests.
- The complete shared checkout test suite passed: 101 tests, zero failures. This includes tests being added concurrently by the chatbot and MCP tasks.
- The production admin build passed using `npm run platform:admin-build -- /private/tmp/visa-seva-admin-audit`.
- All ten hosted integration scenarios passed against the dedicated Supabase project with synthetic applicants and staff. Coverage includes staff authentication, authorization boundaries, private document upload/download, requests for information, resubmission without a second charge, acceptance/rejection, decision reasons and queued notifications.
- Browser verification on the existing hosted admin deployment confirmed a valid staff session, status filtering, application details, recorded decision history, queued email visibility and returning to the filtered queue. No console errors were reported during those checks.
- Whitespace validation passed for the changed admin source and tests.

## Scope

The admin UI fixes are local and have not been deployed by this audit. Hosted integration validates the existing backend; the new UI failure-handling behavior is covered by the React interaction tests. Concurrent chatbot and MCP edits were preserved.

Email notifications remain queued until outbound delivery is configured. The tests do not claim external email delivery. Payments remain sandbox transactions.
