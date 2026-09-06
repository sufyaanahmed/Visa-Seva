# AI assistant long-conversation test — 6 September 2026

Three live conversations with 26 customer turns were run against the Azure `gpt-5.5` deployment and the real LangGraph tools.

## Results

- US tourist e-Visa: 8 turns, passed in 35.633 seconds, retained 6 validated finder fields, returned an e-Visa application action.
- Returning UAE visitor: 11 turns, passed in 53.181 seconds, retained 10 validated finder fields, returned a Visa on Arrival application action.
- Afghan medical travel: 7 turns, passed in 29.979 seconds, retained 5 validated finder fields, returned an Afghan application action.
- Total: 3/3 conversations and 26/26 customer turns passed.
- Every response was non-empty and contained no em dash characters.
- Final application actions used `/apply` and carried application state matching the deterministic eligibility result.

The browser test then submitted a complete US tourist request, received the `Start my application` button, clicked it, and verified that `/apply?step=registration` opened with `United States` and `ordinary` already filled.

The application is prepared locally. The customer must still enter identity details, upload documents, review declarations, authorize payment, and submit. The assistant does not claim that preparation is an official government filing.

Run the live test again with:

```sh
npm run test:assistant:long
```

The test consumes Azure API quota.
