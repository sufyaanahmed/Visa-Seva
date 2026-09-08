import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import { evaluateVisaRoute, getFinderQuestions } from '../../domain/visaEligibility.js';
import { applyFinderAnswer, applicationFromFinder, firstUnansweredStep, isValidFinderAnswer } from '../../domain/finderSession.js';
import { countryFlag, searchNationalities } from '../../domain/countries.js';
import { getVisaFeeEstimate } from '../../domain/visaFees.js';
import Disclosure from '../../components/Disclosure.jsx';

const displayValue = (question, value) => question.options?.find((option) => option.value === value)?.label || value || '';

export default function VisaFinder() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { state, updateState, updateFinder, clearLocalDraft } = useStore();
  const finder = state.finder;
  const answers = finder.answers;
  const [countrySearch, setCountrySearch] = useState('');
  const heading = useRef(null);
  const questions = useMemo(() => getFinderQuestions(answers), [answers]);
  const firstMissing = firstUnansweredStep(answers);
  const complete = firstMissing === questions.length;
  const requestedStep = params.has('step') ? Math.max(0, questions.findIndex((q) => q.id === params.get('step'))) : finder.step;
  const safeStep = Math.min(requestedStep, firstMissing, questions.length - 1);
  const currentQ = questions[safeStep];
  const showResult = complete && (params.get('view') === 'result' || (!params.has('step') && finder.showResult));
  const result = showResult ? evaluateVisaRoute(answers) : null;
  const isCurrentAnswerValid = isValidFinderAnswer(currentQ, answers[currentQ.id]);
  const filteredNationalities = useMemo(() => searchNationalities(countrySearch), [countrySearch]);

  const handleStartFresh = async () => {
    await clearLocalDraft();
    updateFinder({ answers: {}, step: 0, showResult: false });
    setCountrySearch('');
    setParams({ step: 'passport' }, { replace: true });
  };

  useEffect(() => {
    if (finder.step !== safeStep || finder.showResult !== showResult) updateFinder({ step: safeStep, showResult });
    if (!params.has('step') && !params.has('view')) {
      setParams(showResult ? { view: 'result' } : { step: currentQ.id }, { replace: true });
    }
  }, [safeStep, showResult, params]);

  useEffect(() => {
    setCountrySearch('');
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [currentQ.id, showResult]);

  const handleSelect = (value) => updateFinder((previous) => applyFinderAnswer(previous, currentQ.id, value));
  const jumpToQuestion = (index) => {
    setParams({ step: questions[index].id });
    updateFinder({ step: index, showResult: false });
  };
  const handleNext = () => {
    if (!isCurrentAnswerValid) return;
    if (safeStep < questions.length - 1) jumpToQuestion(safeStep + 1);
    else if (complete) {
      updateFinder({ showResult: true });
      setParams({ view: 'result' });
    }
  };
  const handleBack = () => { if (safeStep > 0) jumpToQuestion(safeStep - 1); };
  const startApplication = () => {
    const handoff = applicationFromFinder(state, answers, result);
    if (handoff) updateState(handoff);
    navigate(result.path);
  };

  if (result) {
    const isVoa = result.applicationType === 'voa';
    const feeInfo = getVisaFeeEstimate(result.visaCategory || result.applicationType, answers.passport);

    return (
      <div className="min-h-screen bg-[#FAF7F0] px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-white p-6 shadow-sm sm:p-10">
          <p className="mb-3 text-sm text-text-secondary"><span aria-hidden="true">{countryFlag(answers.passport)}</span> {answers.passport} · {answers.durationDays} days</p>
          <h1 ref={heading} tabIndex={-1} className="mb-3 font-serif text-3xl font-bold text-primary outline-none sm:text-4xl">{result.type}</h1>
          <p className="mb-6 leading-relaxed text-text-secondary">{result.description}</p>

          {/* Official Government Fee & Validity Breakdown */}
          <div className="mb-6 rounded-xl border border-[#E6DFD3] bg-slate-50/80 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-accent block mb-0.5">
                  Official Government Fee
                </span>
                <span className="font-serif text-lg font-bold text-primary-dark block">
                  {feeInfo.range}
                </span>
                <p className="text-xs text-text-secondary mt-1">{feeInfo.note}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-accent block mb-0.5">
                  Validity &amp; Stay
                </span>
                <span className="font-semibold text-primary block">
                  {feeInfo.validity}
                </span>
                <p className="text-xs text-text-secondary mt-1">Processing window: 24–72 hours online</p>
              </div>
            </div>
          </div>

          {result.cautions.length > 0 && <p className="mb-6 text-sm leading-relaxed text-text-secondary">{result.cautions[0]}</p>}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={startApplication}
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow active:scale-[0.99] flex items-center gap-2 cursor-pointer"
              >
                <span>{result.actionLabel}</span>
                <span aria-hidden="true">→</span>
              </button>
              {result.applicationType === 'evisa' && (
                <Link
                  to="/flow/normal"
                  className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-primary hover:bg-[#FAF7F0] transition-colors"
                >
                  View Guide
                </Link>
              )}
              <button
                type="button"
                onClick={() => jumpToQuestion(0)}
                className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-primary hover:bg-[#FAF7F0] transition-colors cursor-pointer"
              >
                Edit answers
              </button>
            </div>
            <button
              type="button"
              onClick={handleStartFresh}
              className="text-xs font-semibold text-text-secondary hover:text-red-700 underline decoration-dotted underline-offset-4 transition-colors py-1 cursor-pointer self-start sm:self-center"
              title="Clear previous evaluation and start a new application"
            >
              Start new application
            </button>
          </div>
          <Disclosure title="Why this route?">
            <ul className="list-disc space-y-2 pl-5">{result.rationale.map((reason) => <li key={reason}>{reason}</li>)}</ul>
            {result.cautions.slice(1).map((caution) => <p key={caution} className="mt-3">{caution}</p>)}
          </Disclosure>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12 px-4 flex flex-col items-center relative pattern-kalamkari">
      <div className="absolute inset-0 bg-[#FAF7F0]/90" />
      <div className="max-w-3xl w-full bg-white border border-border-dark flex flex-col min-h-[560px] relative z-10 shadow-sm rounded-xl overflow-hidden">
        <div className="bg-primary px-6 sm:px-8 py-6 sm:py-8 text-white relative border-b border-border-dark pattern-jali">
          <div className="absolute inset-0 bg-primary/95" />
          <div className="relative z-10">
            <p className="text-[0.65rem] font-bold text-secondary-accent uppercase tracking-[0.2em] mb-2 font-sans">Visa finder</p>
            <div className="flex justify-between items-end gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">Find the right visa route</h1>
              <div className="flex items-center gap-3">
                {Object.keys(answers).length > 0 && (
                  <button
                    type="button"
                    onClick={handleStartFresh}
                    className="text-[11px] font-sans text-white/75 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                    title="Start over with a blank questionnaire"
                  >
                    Start over
                  </button>
                )}
                <span className="text-xs font-sans uppercase tracking-widest text-primary-light whitespace-nowrap">Step {safeStep + 1} of {questions.length}</span>
              </div>
            </div>
            
            {/* Live Context Summary Pills */}
            {safeStep > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 pt-2 border-t border-white/10">
                {questions.slice(0, safeStep).map((q, idx) => {
                  const val = answers[q.id];
                  if (!val) return null;
                  const label = displayValue(q, val);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => jumpToQuestion(idx)}
                      className="bg-white/15 hover:bg-white/25 text-white/90 text-[10px] font-sans font-medium px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
                      title={`Edit ${q.title}`}
                    >
                      <span aria-hidden="true" className={q.id === 'passport' ? 'text-base' : 'text-[#D4AF37] font-bold'}>{q.id === 'passport' ? countryFlag(val) : '✓'}</span>
                      <span className="truncate max-w-[140px]">{label}</span>
                      <span className="text-white/50 text-[9px] uppercase">Edit</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="w-full bg-primary-dark h-1 mt-2 overflow-hidden" aria-hidden="true">
              <div className="bg-secondary-accent h-full transition-all duration-500 ease-out" style={{ width: `${((safeStep + 1) / questions.length) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 flex-1 flex flex-col">
          <h2 ref={heading} tabIndex={-1} className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-5 outline-none">{currentQ.title}</h2>
          {currentQ.description && <p className="mb-5 text-sm leading-relaxed text-text-secondary">{currentQ.description}</p>}
          {currentQ.requirements && (
            <ul className="mb-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-secondary marker:text-primary">
              {currentQ.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
            </ul>
          )}
          {currentQ.source && <a href={currentQ.source.url} target="_blank" rel="noreferrer" className="mb-5 text-xs text-primary underline">{currentQ.source.label} ↗</a>}

          {/* Searchable Country Selector */}
          {currentQ.type === 'country_select' && (
            <div className="w-full mb-8">
              <div className="mb-3">
                <label htmlFor="passport-search-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Search country
                </label>
                <div className="relative">
                  <input
                    id="passport-search-input"
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder="Try UAE, United States or Japan"
                    className="w-full bg-[#FAF7F0] border border-border-dark pl-4 pr-16 py-3 text-sm font-sans text-primary focus:outline-none focus:border-secondary-accent rounded"
                  />
                  {countrySearch && (
                    <button
                      type="button"
                      onClick={() => setCountrySearch('')}
                      className="absolute right-3 top-3 text-xs text-gray-500 hover:text-gray-800"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto border border-border-dark bg-white rounded p-1 space-y-0.5">
                {filteredNationalities.length > 0 ? (
                  filteredNationalities.map((country) => {
                    const isSelected = answers[currentQ.id] === country;
                    return (
                      <button
                        key={country}
                        type="button"
                        onClick={() => handleSelect(country)}
                        aria-pressed={isSelected}
                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-[#1E2A4F] text-white font-bold' : 'hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <span className="flex items-center gap-2"><span aria-hidden="true" className="text-base">{countryFlag(country)}</span>{country}</span>
                        {isSelected && <span className="text-[#D4AF37] font-bold text-xs">Selected ✓</span>}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-xs text-gray-500 text-center">
                    No country matches &quot;{countrySearch}&quot;
                  </div>
                )}
              </div>
            </div>
          )}

          {currentQ.type === 'number' && (
            <div className="mb-8">
              <label htmlFor={currentQ.id} className="sr-only">{currentQ.title}</label>
              <div className="flex items-stretch max-w-sm">
                <input
                  id={currentQ.id}
                  type="number"
                  min={currentQ.min}
                  max={currentQ.max}
                  inputMode="numeric"
                  className="min-w-0 flex-1 bg-surface border border-border-dark px-4 py-4 font-sans text-primary focus:outline-none focus:border-secondary-accent"
                  value={answers[currentQ.id] || ''}
                  onChange={(event) => handleSelect(event.target.value)}
                />
                <span className="border border-l-0 border-border-dark px-4 py-4 bg-white text-text-secondary font-sans">{currentQ.suffix}</span>
              </div>
            </div>
          )}

          {currentQ.type === 'select' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {currentQ.options.map((option) => {
                const isSelected = answers[currentQ.id] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`p-5 text-left border transition-all duration-300 font-sans cursor-pointer ${isSelected ? 'border-secondary-accent bg-surface shadow-sm' : 'border-border-dark hover:border-primary-light hover:bg-surface'}`}
                    aria-pressed={isSelected}
                  >
                    <span className="flex items-center">
                      <span className={`w-4 h-4 flex-shrink-0 mr-4 border flex items-center justify-center transition-colors ${isSelected ? 'border-secondary-accent' : 'border-border'}`} aria-hidden="true">
                        {isSelected && <span className="w-2 h-2 bg-secondary-accent" />}
                      </span>
                      <span className={`text-sm tracking-wide ${isSelected ? 'text-primary font-bold' : 'text-text-secondary font-medium'}`}>{option.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {answers[currentQ.id] && <p className="sr-only" aria-live="polite">Selected: {displayValue(currentQ, answers[currentQ.id])}</p>}

          {currentQ.help && <div className="mt-auto"><Disclosure key={currentQ.id} title="Why are we asking this?">{currentQ.help}</Disclosure></div>}

        </div>

        <div className="bg-[#FAF7F0] px-6 sm:px-8 py-5 sm:py-6 border-t border-border-dark flex justify-between items-center gap-4">
          <button type="button" onClick={handleBack} disabled={safeStep === 0} className="text-sm font-medium text-text-secondary hover:text-primary transition-colors disabled:invisible">&larr; Back</button>
          <button
            onClick={handleNext}
            disabled={!isCurrentAnswerValid}
            className={`px-6 sm:px-8 py-3 font-sans font-bold uppercase tracking-widest text-xs sm:text-sm transition-all duration-300 border cursor-pointer ${!isCurrentAnswerValid ? 'bg-[#FAF7F0] border-border text-text-muted cursor-not-allowed' : 'bg-primary border-primary text-white hover:bg-white hover:text-primary'}`}
          >
            {safeStep === questions.length - 1 ? 'See my route' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
