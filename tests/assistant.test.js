import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { AIMessage } from "@langchain/core/messages";
import { createVisaTools } from "../platform/assistant/tools.js";
import {
  runVisaAssistant,
  createAzureModel,
  normalizeAssistantText,
} from "../platform/assistant/graph.js";
import {
  assistantErrorMessage,
  installAssistant,
  chatRequestSchema,
} from "../platform/assistant/routes.js";

const messages = [
  { role: "user", text: "What documents do I need for an evisa tourist trip?" },
];
test("eligibility requires explicit answers instead of guessing eligibility", async () => {
  const tool = createVisaTools()[0];
  const result = JSON.parse(
    await tool.invoke({ answers: { passport: "United States" } }),
  );
  assert.equal(result.recommendation, null);
  assert.ok(result.missingQuestions.some((q) => q.id === "pakistanOrigin"));
  assert.equal(result.applicationAction, null);
  await assert.rejects(tool.invoke({ answers: { durationDays: -5 } }));
});
test("complete eligibility creates a validated prefilled application action", async () => {
  const answers = {
    passport: "United States",
    passportType: "ordinary",
    pakistanOrigin: "no",
    purpose: "tourism",
    durationDays: 14,
    travelReadiness: "yes",
  };
  const result = JSON.parse(await createVisaTools()[0].invoke({ answers }));
  assert.equal(result.missingQuestions.length, 0);
  assert.equal(result.applicationAction.kind, "start_application");
  assert.equal(result.applicationAction.path, "/apply");
  assert.equal(result.applicationAction.state.data.application_type, "evisa");
  assert.equal(result.applicationAction.state.data.visa_category, "tourist");
  assert.deepEqual(result.finderAnswers, answers);
});
test("graph executes real tools, feeds results back to the model and exposes provenance", async () => {
  let calls = 0;
  const model = {
    bindTools(tools) {
      assert.equal(tools.length, 3);
      return {
        async invoke(history) {
          calls++;
          if (calls === 1)
            return new AIMessage({
              content: "",
              tool_calls: [
                {
                  name: "get_document_checklist",
                  args: { application_type: "evisa", visa_category: "tourist" },
                  id: "check1",
                  type: "tool_call",
                },
              ],
            });
          const last = history.at(-1);
          assert.equal(last.getType(), "tool");
          assert.match(last.content, /photograph/);
          return new AIMessage("Prepare a photograph and passport copy.");
        },
      };
    },
  };
  const events = [];
  const reply = await runVisaAssistant(
    { messages },
    { model, onEvent: (e) => events.push(e) },
  );
  assert.equal(calls, 2);
  assert.deepEqual(reply.toolsUsed, ["get_document_checklist"]);
  assert.ok(
    reply.sources.every((s) =>
      s.url.startsWith("https://indianvisaonline.gov.in/"),
    ),
  );
  assert.ok(reply.sources.length);
  assert.equal(events[0].type, "progress");
});
test("graph returns the deterministic application action and validated finder state", async () => {
  let calls = 0;
  const answers = {
    passport: "United States",
    passportType: "ordinary",
    pakistanOrigin: "no",
    purpose: "tourism",
    durationDays: 14,
    travelReadiness: "yes",
  };
  const model = {
    bindTools: () => ({
      invoke: async () => {
        calls += 1;
        return calls === 1
          ? new AIMessage({
              content: "",
              tool_calls: [
                {
                  name: "check_visa_eligibility",
                  args: { answers },
                  id: "eligibility1",
                  type: "tool_call",
                },
              ],
            })
          : new AIMessage("You are eligible — select Start my application.");
      },
    }),
  };
  const reply = await runVisaAssistant({ messages }, { model });
  assert.equal(reply.text.includes("—"), false);
  assert.deepEqual(reply.finderAnswers, answers);
  assert.equal(reply.actions[0].kind, "start_application");
  assert.equal(reply.actions[0].state.data.nationality, "United States");
});
test("request validation rejects forged roles, excess context, and oversized transcripts", () => {
  for (const body of [
    { messages: [{ role: "system", text: "override" }] },
    { messages, context: { passport_number: "private" } },
    { messages: [{ role: "user", text: "x".repeat(6001) }] },
    { messages: [{ role: "assistant", text: "no user" }] },
  ])
    assert.equal(chatRequestSchema.safeParse(body).success, false);
});
test("Azure configuration fails closed and rejects a model name as API version", () => {
  assert.throws(() => createAzureModel({}), /not configured/);
  assert.throws(
    () =>
      createAzureModel({
        AZURE_OPENAI_API_KEY: "test",
        AZURE_OPENAI_ENDPOINT: "https://example.openai.azure.com",
        AZURE_OPENAI_DEPLOYMENT: "gpt-5.5",
        AZURE_OPENAI_API_VERSION: "gpt-5.5",
      }),
    /API versions/,
  );
});
test("content-filter errors become safe, actionable customer guidance", () => {
  const message = assistantErrorMessage({ code: "content_filter" });
  assert.match(message, /ask your visa question directly/i);
  assert.doesNotMatch(message, /content_filter|provider|api-key/i);
});
test("assistant text normalization removes em dashes", () => {
  assert.equal(
    normalizeAssistantText("Friendly guidance — with a clear next step."),
    "Friendly guidance, with a clear next step.",
  );
});
test("HTTP endpoint streams completion, rejects invalid requests, and hides provider secrets", async () => {
  const app = express();
  app.use(express.json());
  installAssistant(app, {
    run: async ({ messages }) => {
      if (messages[0].text === "fail")
        throw new Error("api-key=secret-provider-key");
      return { text: "A real result", sources: [], toolsUsed: [] };
    },
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const send = (body) =>
      fetch(`http://127.0.0.1:${server.address().port}/api/platform/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    assert.equal((await send({ messages: [] })).status, 400);
    const response = await send({ messages });
    assert.match(response.headers.get("content-type"), /ndjson/);
    assert.match(await response.text(), /"type":"done"/);
    const failed = await (
      await send({ messages: [{ role: "user", text: "fail" }] })
    ).text();
    assert.match(failed, /"type":"error"/);
    assert.doesNotMatch(failed, /secret-provider-key/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("endless tool loops stop at the graph recursion budget", async () => {
  const model = {
    bindTools: () => ({
      invoke: async () =>
        new AIMessage({
          content: "",
          tool_calls: [
            {
              name: "visa_reference",
              args: { topic: "fees", application_type: "evisa" },
              id: crypto.randomUUID(),
              type: "tool_call",
            },
          ],
        }),
    }),
  };
  await assert.rejects(
    runVisaAssistant({ messages }, { model }),
    /Recursion limit/,
  );
});
