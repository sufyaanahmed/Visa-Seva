import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { chatContext, chatHistory, requestVisaChat } from "../api/visaChat";

const welcome = {
  role: "assistant",
  welcome: true,
  text: "Hello! I can help you find a visa route, prepare a document checklist, or understand the application process. What would you like help with?",
  actions: [
    { label: "Find my visa route" },
    { label: "What documents do I need?" },
    { label: "Explain the application steps" },
  ],
};

export default function VisaAssistant() {
  const { state, updateState, updateFinder } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([welcome]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const scrollRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const desktopPointer = window.matchMedia(
      "(min-width: 640px) and (pointer: fine)",
    ).matches;
    if (open && desktopPointer) inputRef.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, progress, open]);
  useEffect(() => () => requestRef.current?.abort(), []);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  const reset = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setMessages([welcome]);
    setInput("");
    setBusy(false);
    setProgress("");
  };
  const send = async (text) => {
    if (!text.trim() || requestRef.current) return;
    text = text.trim();
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 55000);
    const history = chatHistory(messages, text);
    setMessages((previous) => [...previous, { role: "user", text }]);
    setInput("");
    setBusy(true);
    setProgress("Connecting to your assistant");
    try {
      const reply = await requestVisaChat(
        { messages: history, context: chatContext(state.finder?.answers) },
        {
          signal: controller.signal,
          onProgress: (value) => {
            if (requestRef.current === controller) setProgress(value);
          },
        },
      );
      if (requestRef.current === controller) {
        if (reply.finderAnswers)
          updateFinder({
            answers: reply.finderAnswers,
            showResult: Boolean(reply.actions?.length),
          });
        setMessages((previous) => [
          ...previous,
          { role: "assistant", ...reply },
        ]);
      }
    } catch (error) {
      if (requestRef.current === controller)
        setMessages((previous) => [
          ...previous,
          {
            role: "assistant",
            error: true,
            retry: text,
            text: controller.signal.aborted
              ? "The request was stopped or timed out. You can retry below."
              : error.message,
          },
        ]);
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === controller) {
        requestRef.current = null;
        setBusy(false);
        setProgress("");
      }
    }
  };
  const submit = (event) => {
    event.preventDefault();
    send(input);
  };
  const runAction = (action) => {
    if (action.kind !== "start_application") {
      send(action.label);
      return;
    }
    const allowedTypes = new Set(["evisa", "regular", "afghan", "voa"]);
    if (
      action.path !== "/apply" ||
      !allowedTypes.has(action.applicationType) ||
      action.state?.data?.application_type !== action.applicationType ||
      !action.state?.data?.eligibility_ruleset_id ||
      !action.finderAnswers ||
      typeof action.finderAnswers !== "object"
    ) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          error: true,
          text: "I could not open that application safely. Please run the visa check again.",
        },
      ]);
      return;
    }
    updateState(action.state);
    updateFinder({ answers: action.finderAnswers, showResult: true });
    close();
    navigate(action.path);
  };
  const actionClass =
    "min-h-11 w-full rounded-lg border border-[#D4AF37]/40 bg-[#FAF7F0] px-3.5 py-2.5 text-left text-sm font-semibold text-[#162040] shadow-xs transition-all duration-200 hover:border-[#D4AF37] hover:bg-[#F3EFE7] hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37] sm:min-h-0 sm:w-auto sm:py-2 sm:text-xs";

  return (
    <div
      className={
        open
          ? "visa-assistant-shell fixed inset-0 z-[90] font-sans print:hidden sm:inset-auto sm:bottom-6 sm:right-6"
          : "visa-assistant-shell fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[90] font-sans print:hidden sm:bottom-6 sm:right-6"
      }
    >
      {open && (
        <section
          id="visa-assistant"
          role="dialog"
          aria-label="Visa Seva assistant"
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
          className="visa-assistant-panel flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#FAF7F0] shadow-[0_20px_50px_rgba(22,32,64,0.3)] sm:mb-3 sm:h-[min(640px,calc(100dvh-110px))] sm:w-[min(410px,calc(100vw-32px))] sm:rounded-2xl sm:border sm:border-[#D4AF37]/40 sm:backdrop-blur-md"
        >
          {/* Official Consular Header */}
          <header className="visa-assistant-header relative flex shrink-0 items-center justify-between border-b border-[#D4AF37]/30 bg-gradient-to-r from-[#162040] via-[#1E2A4F] to-[#162040] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white sm:px-5 sm:py-4">
            <div className="flex items-center gap-3">
              <img
                src="/emblem.svg"
                alt="Emblem of India"
                className="h-8 w-auto opacity-90 drop-shadow-[0_2px_8px_rgba(212,175,55,0.25)] shrink-0"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(88%) sepia(21%) saturate(1210%) hue-rotate(345deg) brightness(91%) contrast(85%)",
                }}
              />
              <div className="min-w-0">
                <h2 className="text-sm font-serif font-bold tracking-wide text-white">
                  Visa Seva Assistant
                </h2>
                <p className="truncate text-[11px] font-sans text-[#D4AF37]/90 tracking-wider">
                  AI visa preparation support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reset}
                title="Reset conversation"
                aria-label="Reset chat"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer sm:h-9 sm:w-9"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Close assistant"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer sm:h-9 sm:w-9"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 6 12 12M6 18 18 6"
                  />
                </svg>
              </button>
            </div>
          </header>

          {/* Conversation Stream */}
          <div
            ref={scrollRef}
            className="visa-assistant-messages min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 space-y-3 sm:p-4 sm:space-y-4"
          >
            <div
              role="log"
              aria-live="polite"
              aria-label="Conversation"
              className="space-y-4"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "ml-5 flex justify-end sm:ml-8"
                      : "flex flex-col items-start sm:mr-2"
                  }
                >
                  {message.role === "user" ? (
                    <div className="max-w-full break-words rounded-2xl rounded-tr-xs bg-[#1E2A4F] px-4 py-2.5 text-sm text-white shadow-md border border-[#D4AF37]/20">
                      <p className="leading-relaxed">{message.text}</p>
                    </div>
                  ) : (
                    <div className="w-full min-w-0 rounded-2xl rounded-tl-xs bg-white p-3.5 shadow-sm border border-[#EBE5D9] text-[#162040] sm:p-4">
                      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#FAF7F0]">
                        <div className="h-4 w-4 rounded-full bg-[#1E2A4F] flex items-center justify-center text-[9px] text-[#D4AF37] font-bold">
                          ✦
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C4762A]">
                          Visa Guidance
                        </span>
                      </div>
                      <p className="break-words whitespace-pre-wrap text-sm leading-relaxed text-[#1E2A4F]">
                        {message.text}
                      </p>

                      {message.sources?.length > 0 && (
                        <div className="mt-3 space-y-1 border-t border-[#EBE5D9] pt-2">
                          <p className="text-[10px] font-bold uppercase text-[#C4762A]">
                            Guidance sources
                          </p>
                          {message.sources.map((source) => (
                            <a
                              key={source.url}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block break-words text-xs underline"
                            >
                              {source.label} ↗
                            </a>
                          ))}
                        </div>
                      )}
                      {message.toolsUsed?.length > 0 && (
                        <p className="mt-2 text-[10px] text-[#1E2A4F]/60">
                          Checked {message.toolsUsed.length} guidance{" "}
                          {message.toolsUsed.length === 1 ? "tool" : "tools"}
                        </p>
                      )}
                      {message.error && (
                        <button
                          type="button"
                          disabled={busy}
                          className={actionClass + " mt-3"}
                          onClick={() => send(message.retry)}
                        >
                          Retry message
                        </button>
                      )}
                      {message.items && (
                        <ul className="mt-3 space-y-2">
                          {message.items.map((item) => (
                            <li
                              key={item.title}
                              className="rounded-xl border border-[#D4AF37]/30 bg-[#FAF7F0] p-3"
                            >
                              <span className="block text-[11px] font-medium text-[#C4762A]">
                                {item.status}
                              </span>
                              <strong className="text-xs font-serif font-bold text-[#162040]">
                                {item.title}
                              </strong>
                            </li>
                          ))}
                        </ul>
                      )}

                      {message.link && (
                        <a
                          href={message.link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#162040] hover:text-[#C4762A] underline underline-offset-2"
                        >
                          <span>{message.link.label}</span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      )}

                      {message.actions && (
                        <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-gray-100 sm:flex-row sm:flex-wrap">
                          {message.actions.map((action) => (
                            <button
                              type="button"
                              key={action.label}
                              className={actionClass}
                              disabled={busy}
                              onClick={() => runAction(action)}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {busy && (
              <div
                role="status"
                className="rounded-xl border border-[#D4AF37]/30 bg-white p-3 text-sm text-[#162040]"
              >
                <span className="animate-pulse">✦ {progress}…</span>
                <button
                  type="button"
                  className="ml-3 underline"
                  onClick={() => requestRef.current?.abort()}
                >
                  Stop
                </button>
              </div>
            )}
          </div>

          {/* Input & Form Area */}
          <div className="visa-assistant-composer shrink-0 border-t border-[#D4AF37]/30 bg-white px-3.5 pt-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xs sm:p-3.5">
            <form onSubmit={submit} className="flex items-center gap-2">
              <label htmlFor="assistant-input" className="sr-only">
                Message the visa assistant
              </label>
              <input
                ref={inputRef}
                id="assistant-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={6000}
                autoComplete="off"
                placeholder="Ask about your visa or documents…"
                className="min-w-0 flex-1 rounded-xl border border-[#D4AF37]/40 bg-[#FAF7F0] px-3.5 py-2.5 text-base text-[#162040] placeholder:text-[#1E2A4F]/50 outline-none transition-all focus:border-[#D4AF37] focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20 sm:text-sm"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#162040] to-[#1E2A4F] text-[#D4AF37] transition-all hover:shadow-md disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed border border-[#D4AF37]/30 sm:h-10 sm:w-10"
              >
                {/* Upward-facing Airplane SVG */}
                <svg
                  className="h-5 w-5 text-[#D4AF37]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[10.5px] text-[#1E2A4F]/60 px-1">
              <span className="truncate pr-2">
                AI guidance · Verify with official sources
              </span>
              <button
                type="button"
                className="text-[#C4762A] hover:underline font-semibold cursor-pointer"
                onClick={reset}
              >
                Clear chat
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Floating Launcher Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="visa-assistant"
        className={`${open ? "hidden sm:flex" : "flex"} visa-assistant-launcher group relative ml-auto min-h-11 items-center gap-2.5 rounded-full border border-[#D4AF37]/60 bg-gradient-to-r from-[#162040] via-[#1E2A4F] to-[#162040] px-5 py-3.5 text-sm font-serif font-bold text-white shadow-[0_8px_25px_rgba(22,32,64,0.35)] transition-all duration-300 hover:scale-[1.03] hover:border-[#D4AF37] hover:shadow-[0_12px_32px_rgba(212,175,55,0.3)] cursor-pointer`}
      >
        <svg
          className="h-4 w-4 text-[#D4AF37] transition-transform duration-300 group-hover:-translate-y-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-.744-.88l.685-3.42C3.606 15.358 3 13.754 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
          />
        </svg>
        <span className="font-sans text-xs uppercase tracking-wider text-[#D4AF37]">
          {open ? "Close chat" : "Ask Visa Seva"}
        </span>
      </button>
    </div>
  );
}
