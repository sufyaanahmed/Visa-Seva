import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const platformBase = (
  import.meta.env.VITE_PLATFORM_API_URL ||
  "https://visa-seva-platform.vercel.app"
).replace(/\/$/, "");
const mcpUrl = `${platformBase}/mcp`;

const assistants = [
  {
    name: "ChatGPT",
    url: "https://chatgpt.com/plugins",
    logo: "/brands/chatgpt.svg",
  },
  {
    name: "Claude",
    url: "https://claude.ai/customize/connectors",
    logo: "/brands/claude.svg",
  },
];

export default function AIAssistants() {
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  function showNotice(message) {
    window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 3600);
  }

  async function prepareConnection(assistant) {
    try {
      await navigator.clipboard.writeText(mcpUrl);
      showNotice(`Ready for ${assistant.name}`);
    } catch {
      showNotice("Use manual setup below");
    }
  }

  async function copyEndpoint() {
    try {
      await navigator.clipboard.writeText(mcpUrl);
      showNotice("Address copied");
    } catch {
      showNotice("Select the address to copy it");
    }
  }

  return (
    <div className="relative overflow-hidden bg-[#FAF7F0] px-6 py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(30,42,79,.12) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, black, transparent 46%)",
        }}
      />

      <main className="relative mx-auto max-w-4xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#C4762A]">
          Visa Seva in your assistant
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl font-serif text-4xl font-bold leading-tight text-[#1E2A4F] sm:text-6xl">
          Fill your Indian visa application with ChatGPT or Claude
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#1E2A4F]/70">
          Choose one to get started.
        </p>

        <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
          {assistants.map((assistant) => (
            <a
              key={assistant.name}
              href={assistant.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => prepareConnection(assistant)}
              className="group flex items-center justify-between rounded-2xl border border-[#D4AF37]/35 bg-white p-5 text-left shadow-[0_12px_32px_rgba(30,42,79,.08)] transition-all hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-[0_18px_40px_rgba(30,42,79,.13)]"
            >
              <span className="flex items-center gap-4">
                <span
                  className="grid h-12 w-12 place-items-center"
                  aria-hidden="true"
                >
                  <img
                    src={assistant.logo}
                    alt=""
                    className="h-12 w-12 object-contain"
                  />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#846B26]">
                    Open setup
                  </span>
                  <span className="mt-1 block font-serif text-2xl font-bold text-[#1E2A4F]">
                    {assistant.name}
                  </span>
                </span>
              </span>
              <span
                className="text-2xl text-[#C4762A] transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </a>
          ))}
        </div>

        <details className="mx-auto mt-10 max-w-2xl rounded-xl border border-[#E1DACB] bg-white text-left">
          <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-[#1E2A4F]">
            Set up manually
          </summary>
          <div className="border-t border-[#E1DACB] p-5">
            <p className="text-sm leading-6 text-[#1E2A4F]/65">
              Add this address as a custom remote MCP connector:
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-[#111A31] px-4 py-3 text-xs text-white">
                {mcpUrl}
              </code>
              <button
                type="button"
                onClick={copyEndpoint}
                className="rounded-lg bg-[#1E2A4F] px-5 py-3 text-sm font-bold text-white"
              >
                Copy
              </button>
            </div>
          </div>
        </details>

        <p className="mx-auto mt-7 max-w-2xl text-sm leading-6 text-[#1E2A4F]/60">
          You approve account access only when working with a saved application.
          Setup availability depends on your assistant plan or workspace.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-bold">
          <Link
            to="/guide/visa-finder"
            className="text-[#8B1C1C] underline underline-offset-4"
          >
            Use the visa finder instead
          </Link>
          <Link
            to="/assistants"
            className="text-[#8B1C1C] underline underline-offset-4"
          >
            Manage assistant access
          </Link>
        </div>
      </main>

      {notice && (
        <div
          className="fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#1E2A4F] px-4 py-2.5 text-sm font-semibold text-white shadow-xl"
          role="status"
        >
          <span
            className="grid h-5 w-5 place-items-center rounded-full bg-[#138808] text-xs"
            aria-hidden="true"
          >
            ✓
          </span>
          {notice}
        </div>
      )}
    </div>
  );
}
