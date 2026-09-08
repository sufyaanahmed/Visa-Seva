import { randomUUID } from "node:crypto";

// Azure GPT-5.5 Global Standard, short context, USD per million tokens.
// Verified against Azure Retail Prices API on 2026-09-08. Cached inputs are
// deliberately charged at the full input rate for a conservative cutoff.
export const INPUT_MICRO_USD = 5;
export const OUTPUT_MICRO_USD = 30;
export const MAX_OUTPUT_TOKENS = 1800;
export const budgetError = (code = "AI_BUDGET_UNAVAILABLE") =>
  Object.assign(new Error(code), { code });

export function reservationCost(body) {
  const request = JSON.parse(body);
  const bytes = Buffer.byteLength(body, "utf8");
  if (
    request.model !== "gpt-5.5" ||
    request.stream ||
    bytes > 100000 ||
    request.max_completion_tokens !== MAX_OUTPUT_TOKENS ||
    (request.service_tier && request.service_tier !== "default")
  )
    throw budgetError();
  // UTF-8 bytes upper-bound text tokens; allow extra room for message framing
  // and tool serialization. Keeping the whole payload below 100 KB also
  // prevents the long-context price tier from being reached.
  return (
    (bytes + 8192) * INPUT_MICRO_USD + MAX_OUTPUT_TOKENS * OUTPUT_MICRO_USD
  );
}

export function createBudgetFetch(db, fetcher = fetch) {
  return async (url, init) => {
    if (!db || typeof init?.body !== "string") throw budgetError();
    const reserved = reservationCost(init.body);
    const id = randomUUID();
    let result;
    try {
      result = await db.rpc("reserve_ai_budget", {
        reservation_id: id,
        amount: reserved,
      });
    } catch {
      throw budgetError();
    }
    if (result.error) throw budgetError();
    if (result.data !== true) throw budgetError("AI_BUDGET_EXHAUSTED");
    // A timeout, crash or missing usage keeps the reservation charged. Never
    // refund uncertain requests, and never automatically retry a model call.
    const response = await fetcher(url, init);
    if (response.ok) {
      try {
        const { usage } = await response.clone().json();
        const input = usage?.prompt_tokens,
          output = usage?.completion_tokens;
        if (
          Number.isSafeInteger(input) &&
          input >= 0 &&
          Number.isSafeInteger(output) &&
          output >= 0 &&
          input + output > 0
        ) {
          const actual = input * INPUT_MICRO_USD + output * OUTPUT_MICRO_USD;
          if (actual > reserved) throw budgetError();
          const settled = await db.rpc("settle_ai_budget", {
            reservation_id: id,
            amount: actual,
          });
          if (settled.error) throw budgetError();
        }
      } catch {
        /* Retain the full reservation if accounting cannot finish. */
      }
    }
    return response;
  };
}
