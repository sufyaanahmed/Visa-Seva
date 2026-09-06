import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { countryFlag, searchNationalities } from '../domain/countries';
import { ASSISTANT_ACTIONS, interpretAssistantInput, nextAssistantQuestion, runAssistantTool } from '../domain/visaAssistant';

const welcome = { role: 'assistant', text: 'What can I help you get done?', actions: ASSISTANT_ACTIONS };

function downloadChecklist(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function VisaAssistant() {
  const { state, updateState, updateFinder } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([welcome]);
  const [input, setInput] = useState('');
  const [guiding, setGuiding] = useState(false);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const scrollRef = useRef(null);
  const question = guiding ? nextAssistantQuestion(state) : null;

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, question?.id, open]);

  const close = () => { setOpen(false); triggerRef.current?.focus(); };
  const execute = (tool, label = tool.label) => {
    try {
      const reply = runAssistantTool(tool, { state, updateFinder, updateState, navigate, download: downloadChecklist });
      setMessages((previous) => [...previous, ...(label ? [{ role: 'user', text: label }] : []), { role: 'assistant', ...reply }]);
      if (reply.guiding !== undefined) setGuiding(reply.guiding);
    } catch {
      setMessages((previous) => [...previous, { role: 'assistant', text: 'That action could not finish. Please try again.' }]);
    }
    setInput('');
    inputRef.current?.focus();
  };
  const submit = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    execute(interpretAssistantInput(input, { state, guiding }), input.trim());
  };
  const actionClass = 'rounded-lg border border-[#D4AF37]/40 bg-[#FAF7F0] px-3.5 py-2 text-left text-xs font-semibold text-[#162040] shadow-xs transition-all duration-200 hover:border-[#D4AF37] hover:bg-[#F3EFE7] hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]';

  return (
    <div className="fixed bottom-4 right-4 z-[90] font-sans print:hidden sm:bottom-6 sm:right-6">
      {open && (
        <section 
          id="visa-assistant" 
          role="dialog" 
          aria-label="Visa Seva assistant" 
          onKeyDown={(event) => { if (event.key === 'Escape') close(); }} 
          className="mb-3 flex h-[min(640px,calc(100dvh-110px))] w-[min(410px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-[#FAF7F0] shadow-[0_20px_50px_rgba(22,32,64,0.3)] backdrop-blur-md"
        >
          {/* Official Consular Header */}
          <header className="relative flex items-center justify-between border-b border-[#D4AF37]/30 bg-gradient-to-r from-[#162040] via-[#1E2A4F] to-[#162040] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <img 
                src="/emblem.svg" 
                alt="Emblem of India" 
                className="h-8 w-auto opacity-90 drop-shadow-[0_2px_8px_rgba(212,175,55,0.25)] shrink-0" 
                style={{ filter: 'brightness(0) saturate(100%) invert(88%) sepia(21%) saturate(1210%) hue-rotate(345deg) brightness(91%) contrast(85%)' }} 
              />
              <div>
                <h2 className="text-sm font-serif font-bold tracking-wide text-white">Visa Seva Assistant</h2>
                <p className="text-[11px] font-sans text-[#D4AF37]/90 tracking-wider">Official Consular & Visa Support</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                type="button" 
                onClick={() => { setMessages([welcome]); setGuiding(false); setInput(''); }} 
                title="Reset conversation" 
                aria-label="Reset chat" 
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
              <button 
                type="button" 
                onClick={close} 
                aria-label="Close assistant" 
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M6 18 18 6" />
                </svg>
              </button>
            </div>
          </header>

          {/* Conversation Stream */}
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
            <div role="log" aria-live="polite" aria-label="Conversation" className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={message.role === 'user' ? 'ml-8 flex justify-end' : 'mr-2 flex flex-col items-start'}>
                  {message.role === 'user' ? (
                    <div className="rounded-2xl rounded-tr-xs bg-[#1E2A4F] px-4 py-2.5 text-sm text-white shadow-md border border-[#D4AF37]/20">
                      <p className="leading-relaxed">{message.text}</p>
                    </div>
                  ) : (
                    <div className="w-full rounded-2xl rounded-tl-xs bg-white p-4 shadow-sm border border-[#EBE5D9] text-[#162040]">
                      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#FAF7F0]">
                        <div className="h-4 w-4 rounded-full bg-[#1E2A4F] flex items-center justify-center text-[9px] text-[#D4AF37] font-bold">
                          ✦
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C4762A]">Consular Guidance</span>
                      </div>
                      <p className="text-sm leading-relaxed text-[#1E2A4F]">{message.text}</p>
                      
                      {message.items && (
                        <ul className="mt-3 space-y-2">
                          {message.items.map((item) => (
                            <li key={item.title} className="rounded-xl border border-[#D4AF37]/30 bg-[#FAF7F0] p-3">
                              <span className="block text-[11px] font-medium text-[#C4762A]">{item.status}</span>
                              <strong className="text-xs font-serif font-bold text-[#162040]">{item.title}</strong>
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
                        <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                          {message.actions.map((action) => (
                            <button 
                              type="button" 
                              key={action.label} 
                              className={actionClass} 
                              onClick={() => execute(action)}
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

            {/* Guided Question Block */}
            {question && (
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#D4AF37]/50" aria-live="polite">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C4762A]">Step Required</p>
                </div>
                <p className="text-sm font-serif font-bold text-[#162040]">{question.title}</p>
                {question.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-[#1E2A4F]/80">{question.description}</p>
                )}
                {question.type === 'country_select' ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(input.trim() ? searchNationalities(input).slice(0, 5) : ['United Arab Emirates', 'Japan', 'United States', 'United Kingdom']).map((country) => (
                      <button 
                        type="button" 
                        className={actionClass} 
                        key={country} 
                        onClick={() => execute({ name: 'answer_finder', args: { id: question.id, value: country } }, country)}
                      >
                        <span aria-hidden="true">{countryFlag(country)}</span> {country}
                      </button>
                    ))}
                  </div>
                ) : question.type === 'number' ? (
                  <p className="mt-2 text-xs font-medium text-[#C4762A]">Enter the number of days below and send.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <button 
                        type="button" 
                        className={actionClass} 
                        key={option.value} 
                        onClick={() => execute({ name: 'answer_finder', args: { id: question.id, value: option.value } }, option.label)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input & Form Area */}
          <div className="border-t border-[#D4AF37]/30 bg-white p-3.5 shadow-xs">
            <form onSubmit={submit} className="flex items-center gap-2">
              <label htmlFor="assistant-input" className="sr-only">Message the visa assistant</label>
              <input 
                ref={inputRef} 
                id="assistant-input" 
                value={input} 
                onChange={(event) => setInput(event.target.value)} 
                maxLength={500} 
                autoComplete="off" 
                placeholder={question?.type === 'country_select' ? 'Type nationality or UAE…' : question?.type === 'number' ? 'e.g. 14 days' : 'Type a query or choose an option…'} 
                className="min-w-0 flex-1 rounded-xl border border-[#D4AF37]/40 bg-[#FAF7F0] px-3.5 py-2.5 text-sm text-[#162040] placeholder:text-[#1E2A4F]/50 outline-none transition-all focus:border-[#D4AF37] focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/20" 
              />
              <button 
                type="submit" 
                disabled={!input.trim()} 
                aria-label="Send message" 
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#162040] to-[#1E2A4F] text-[#D4AF37] transition-all hover:shadow-md disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed border border-[#D4AF37]/30"
              >
                {/* Upward-facing Airplane SVG */}
                <svg className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[10.5px] text-[#1E2A4F]/60 px-1">
              <span>National Consular Informatics Division</span>
              <button 
                type="button" 
                className="text-[#C4762A] hover:underline font-semibold cursor-pointer" 
                onClick={() => { setMessages([welcome]); setGuiding(false); setInput(''); }}
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
        onClick={() => open ? close() : setOpen(true)} 
        aria-expanded={open} 
        aria-controls="visa-assistant" 
        className="group relative ml-auto flex items-center gap-2.5 rounded-full border border-[#D4AF37]/60 bg-gradient-to-r from-[#162040] via-[#1E2A4F] to-[#162040] px-5 py-3.5 text-sm font-serif font-bold text-white shadow-[0_8px_25px_rgba(22,32,64,0.35)] transition-all duration-300 hover:scale-[1.03] hover:border-[#D4AF37] hover:shadow-[0_12px_32px_rgba(212,175,55,0.3)] cursor-pointer"
      >
        <svg className="h-4 w-4 text-[#D4AF37] transition-transform duration-300 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-.744-.88l.685-3.42C3.606 15.358 3 13.754 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
        <span className="font-sans text-xs uppercase tracking-wider text-[#D4AF37]">
          {open ? 'Close chat' : 'Ask Visa Seva'}
        </span>
      </button>
    </div>
  );
}
