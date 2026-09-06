import test from "node:test";
import assert from "node:assert/strict";
import {
  chatContext,
  chatHistory,
  requestVisaChat,
} from "../src/api/visaChat.js";

test("context strips identity fields, empty answers and normalizes finder day strings", () => {
  assert.deepEqual(
    chatContext({
      passport: "Japan",
      durationDays: "14",
      passportType: "",
      passport_number: "private",
    }),
    { passport: "Japan", durationDays: 14 },
  );
});
test("history is bounded and retry does not repeat failed user turns", () => {
  const history = chatHistory(
    [
      { role: "assistant", welcome: true, text: "welcome" },
      { role: "user", text: "failed request" },
      { role: "assistant", text: "unavailable", error: true },
    ],
    "failed request",
  );
  assert.deepEqual(history, [{ role: "user", text: "failed request" }]);
  const bounded = chatHistory(
    Array.from({ length: 30 }, (_, i) => ({
      role: i % 2 ? "assistant" : "user",
      text: "x".repeat(6000),
    })),
    "hello",
  );
  assert.ok(bounded.length <= 20);
  assert.ok(bounded.reduce((n, m) => n + m.text.length, 0) <= 24000);
});
test("client handles NDJSON split across network chunks and reports progress", async (t) => {
  const bytes = new TextEncoder().encode(
    JSON.stringify({ type: "progress", text: "Checking" }) +
      "\n" +
      JSON.stringify({ type: "done", text: "नमस्ते", sources: [] }) +
      "\n",
  );
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
            controller.close();
          },
        }),
      ),
  );
  const progress = [];
  const reply = await requestVisaChat(
    {},
    { onProgress: (p) => progress.push(p) },
  );
  assert.equal(reply.text, "नमस्ते");
  assert.deepEqual(progress, ["Checking"]);
});
test("client rejects interrupted streams instead of showing partial answers", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response('{"type":"progress","text":"Thinking"}\n'),
  );
  await assert.rejects(requestVisaChat({}), /interrupted/);
});
