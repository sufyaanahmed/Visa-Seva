import { runVisaAssistant } from "../platform/assistant/graph.js";
const messages = [
  {
    role: "user",
    text: "Give me a document checklist for an evisa tourist visit. Use the document tool.",
  },
];
try {
  const reply = await runVisaAssistant(
    { messages },
    { onEvent: (e) => console.log(e.text), signal: AbortSignal.timeout(45000) },
  );
  if (
    !reply.toolsUsed.includes("get_document_checklist") ||
    !reply.sources.length ||
    !reply.text.trim()
  )
    throw new Error("Missing tool execution or response");
  console.log(JSON.stringify(reply, null, 2));
} catch (error) {
  console.error(
    "Assistant smoke failed:",
    error.name,
    "status:",
    error.status || "unavailable",
    "code:",
    error.code || error.cause?.code || "unavailable",
  );
  process.exitCode = 1;
}
