import { performance } from "node:perf_hooks";
import {
  createAzureModel,
  runVisaAssistant,
} from "../platform/assistant/graph.js";

const conversations = [
  {
    name: "US tourist e-Visa application",
    expectedType: "evisa",
    turns: [
      "Hello, I would like your help applying for a visa to India.",
      "My passport is from the United States.",
      "It is an ordinary passport.",
      "No, neither I nor my parents or grandparents have Pakistan origin.",
      "The trip is for tourism.",
      "I plan to stay for 14 days.",
      "Yes, my passport and travel plans meet all the readiness requirements.",
      "Thank you. Please start my application now.",
    ],
  },
  {
    name: "returning UAE visitor asking for Visa on Arrival",
    expectedType: "voa",
    turns: [
      "Hi, can you help me apply for the right visa for a holiday in India?",
      "I have a United Arab Emirates passport.",
      "It is an ordinary passport.",
      "No Pakistan origin for me, my parents or my grandparents.",
      "I want to visit for tourism for 12 days.",
      "Yes, I had an Indian visa before.",
      "I will arrive at one of the listed Visa on Arrival airports.",
      "I do not have a residence or occupation in India.",
      "Yes, I am free of the entry restrictions you listed.",
      "My passport, onward ticket, funds and travel plans are ready.",
      "Great. Please start the application for me.",
    ],
  },
  {
    name: "Afghan medical application",
    expectedType: "afghan",
    turns: [
      "Good morning. I need help applying to travel to India for medical care.",
      "I hold an Afghanistan passport.",
      "It is an ordinary passport.",
      "My purpose is medical treatment.",
      "The expected stay is 30 days.",
      "Yes, the passport and travel arrangements meet the readiness checks.",
      "Please open the correct application for me.",
    ],
  },
];

const model = createAzureModel();
const results = [];

for (const conversation of conversations) {
  const started = performance.now();
  const history = [];
  let context = {};
  let finalReply;
  let failure;
  for (let index = 0; index < conversation.turns.length; index += 1) {
    const userText = conversation.turns[index];
    history.push({ role: "user", text: userText });
    try {
      const reply = await runVisaAssistant(
        { messages: history.slice(-19), context },
        { model, signal: AbortSignal.timeout(60000) },
      );
      if (reply.text.includes("—"))
        throw new Error("assistant response contained an em dash");
      if (!reply.text.trim())
        throw new Error("assistant returned an empty reply");
      if (reply.finderAnswers) context = reply.finderAnswers;
      history.push({ role: "assistant", text: reply.text });
      finalReply = reply;
      console.log(
        `[${conversation.name}] turn ${index + 1}/${conversation.turns.length} PASS (${reply.toolsUsed.join(", ") || "conversation"})`,
      );
    } catch (error) {
      failure = `${error.name}: ${error.code || error.message}`;
      break;
    }
  }

  const action = finalReply?.actions?.find(
    (candidate) => candidate.kind === "start_application",
  );
  if (!failure && !action)
    failure = "final reply did not offer Start my application";
  if (!failure && action.applicationType !== conversation.expectedType)
    failure = `expected ${conversation.expectedType}, got ${action.applicationType}`;
  if (!failure && action.path !== "/apply")
    failure = `unexpected application path ${action.path}`;
  if (
    !failure &&
    action.state?.data?.application_type !== conversation.expectedType
  )
    failure = "prefilled application state did not match the verified route";

  results.push({
    name: conversation.name,
    passed: !failure,
    failure,
    turns: conversation.turns.length,
    durationMs: Math.round(performance.now() - started),
    applicationType: action?.applicationType,
    retainedFinderFields: Object.keys(context).length,
  });
}

const summary = {
  conversations: results.length,
  turns: results.reduce((sum, result) => sum + result.turns, 0),
  passed: results.filter((result) => result.passed).length,
  failed: results.filter((result) => !result.passed).length,
  results,
};
console.log(`ASSISTANT_LONG_CONVERSATION_SUMMARY=${JSON.stringify(summary)}`);
if (summary.failed) process.exitCode = 1;
