import { getFinderQuestions } from "../domain/visaEligibility.js";
import { isValidFinderAnswer } from "../domain/finderSession.js";
const base = (import.meta.env?.VITE_PLATFORM_API_URL || "").replace(/\/$/, "");

export function chatHistory(messages, text) {
  const history = messages
    .filter(
      (m, index) =>
        !m.error &&
        !m.welcome &&
        !(m.role === "user" && messages[index + 1]?.error) &&
        ["user", "assistant"].includes(m.role),
    )
    .map(({ role, text }) => ({ role, text: text.slice(0, 6000) }))
    .slice(-19);
  while (history.reduce((n, m) => n + m.text.length, text.length) > 24000)
    history.shift();
  return [...history, { role: "user", text }];
}

export function chatContext(answers = {}) {
  return Object.fromEntries(
    getFinderQuestions(answers)
      .filter((q) => isValidFinderAnswer(q, answers[q.id]))
      .map((q) => [
        q.id,
        q.type === "number" ? Number(answers[q.id]) : answers[q.id],
      ]),
  );
}

export async function requestVisaChat(body, { signal, onProgress } = {}) {
  const response = await fetch(`${base}/api/platform/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.error || "The assistant could not connect. Please try again.",
    );
  }
  if (!response.body)
    throw new Error("Chat streaming is unavailable in this browser.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.type === "progress") onProgress?.(event.text);
        if (event.type === "error") throw new Error(event.text);
        if (event.type === "done") return event;
      }
      if (done)
        throw new Error("The response was interrupted. Please try again.");
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
