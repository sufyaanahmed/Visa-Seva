import { z } from "zod";
import { rateLimit } from "express-rate-limit";
import { finderSchema } from "./tools.js";
import { runVisaAssistant } from "./graph.js";

export function assistantErrorMessage(error, aborted = false) {
  const budgetCode = error?.code || error?.cause?.code;
  if (budgetCode === "AI_BUDGET_EXHAUSTED")
    return "The AI assistant has reached its daily limit. Please try again after 00:00 UTC. You can still use the Visa Finder and your applications.";
  if (aborted) return "The assistant took too long. Please try again.";
  const providerCode =
    error?.code || error?.cause?.code || error?.error?.code || "";
  if (providerCode === "content_filter")
    return "That wording could not be processed. Please ask your visa question directly without instructions to bypass eligibility or safety checks.";
  return "The AI assistant is temporarily unavailable. Please try again shortly.";
}

export const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            text: z.string().trim().min(1).max(6000),
          })
          .strict(),
      )
      .min(1)
      .max(20),
    context: finderSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.messages.at(-1)?.role !== "user" ||
      value.messages.reduce((n, m) => n + m.text.length, 0) > 24000
    )
      ctx.addIssue({ code: "custom", message: "Invalid conversation." });
  });

export function installAssistant(app, { run = runVisaAssistant, db } = {}) {
  app.post(
    "/api/platform/chat",
    rateLimit({
      windowMs: 60000,
      limit: 12,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        error: "Too many messages. Please wait a minute and try again.",
      },
    }),
    async (req, res) => {
      const parsed = chatRequestSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({
          error:
            "Send a message of up to 6,000 characters with a valid conversation.",
        });
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);
      const disconnect = () => {
        if (!res.writableEnded) controller.abort();
      };
      res.on("close", disconnect);
      const emit = (event) => {
        if (!res.destroyed && !res.writableEnded)
          res.write(`${JSON.stringify(event)}\n`);
      };
      res.status(200).set({
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      });
      res.flushHeaders();
      emit({ type: "progress", text: "Thinking about your question" });
      try {
        const reply = await run(parsed.data, {
          signal: controller.signal,
          db,
          onEvent: emit,
        });
        emit({ type: "done", ...reply });
      } catch (error) {
        // Never serialize provider exceptions: they can contain request headers or user data.
        emit({
          type: "error",
          text: assistantErrorMessage(error, controller.signal.aborted),
        });
      } finally {
        clearTimeout(timer);
        res.off("close", disconnect);
        res.end();
      }
    },
  );
}
