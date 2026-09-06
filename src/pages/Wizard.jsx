import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { flowPath } from '../domain/finderSession';
import ContextHelp from '../components/ContextHelp';
import SmartDocuments, { getRequiredDocuments } from '../components/SmartDocuments';
import OfficialApplicationDossier from '../components/OfficialApplicationDossier';
import { field, getSteps, validateStep, isVisible, isRequired, afghanPurposes } from '../domain/applicationForm.js';
import { getEvisaWizardGate } from '../domain/visaEligibility';
import { useStore, formatReference } from '../store';
import Auth from '../platform/Auth';
import { platformEnabled, saveApplication, supabase, APPLICATION_ACCESS_UNAVAILABLE } from '../platform/client';

const demoFixture = (type, current) => {
  const futureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };
  const common = {
    surname: 'MORGAN', given_name: 'ALEX', date_of_birth: '1992-05-14', previous_name_used: 'no', gender: 'unspecified',
    place_of_birth: 'Example City', country_of_birth: type === 'afghan' ? 'Afghanistan' : 'Canada', national_id: 'NA', religion: 'Not specified', visible_mark: 'NA', education: 'Graduate', nationality_acquisition: 'birth',
    passport_number: 'P1234567', passport_issue_place: 'Example City', passport_issue_date: '2024-01-15', passport_expiry_date: '2034-01-14', other_passport: 'no',
    present_address: '100 Example Street, Toronto', postal_code: '000000', phone_abroad: '+10000000000', permanent_same: 'yes',
    father_details: 'JAMES MORGAN; Canadian; Toronto', mother_details: 'SARAH MORGAN; Canadian; Toronto', marital_status: 'single', pakistan_origin: 'no',
    occupation: 'Software tester', designation: 'Test analyst', employer_name: 'Maple Studio', employer_address: '200 Sample Road, Toronto', employer_phone: '+10000000001', security_service_employment: 'no',
    places_to_visit: 'Delhi and Agra', tour_operator_used: 'no', intended_exit_port: 'Delhi', visited_india_before: 'no', india_refused_before: 'no', countries_visited_10y: 'None', visited_saarc: 'no',
    india_reference: 'Central Hotel, Example Road, Delhi; +910000000000', home_reference: 'Home Contact, 100 Example Street; +10000000002',
    security_arrested: 'no', security_refused: 'no', security_offences: 'no', security_national_security: 'no', security_advocacy: 'no', security_asylum: 'no',
    email: 'alex.morgan@example.invalid', confirm_email: 'alex.morgan@example.invalid', expected_arrival_date: futureDate(45), instructions_ready: true, resident_two_years: 'yes',
  };
  if (type === 'voa') return {
    application_type: 'voa', nationality: current.nationality || 'Japan', visa_category: current.visa_category || 'tourism', intended_stay_days: current.intended_stay_days || '14', passport_type: current.passport_type || 'ordinary', no_india_residence_occupation: true, onward_ticket_confirmed: true, sufficient_funds_confirmed: true,
    uae_previous_indian_visa: current.uae_previous_indian_visa || (current.nationality === 'United Arab Emirates' ? 'yes' : 'not_applicable'),
    pakistan_origin: 'no', persona_non_grata: 'no', undesirable_person: 'no', surname: 'TANAKA', given_name: 'YUKI', date_of_birth: '1992-05-14', previous_nationality: 'NA', dual_nationality: 'no', marital_status: 'single',
    father_details: 'KENJI TANAKA; JAPAN', mother_details: 'AKIKO TANAKA; JAPAN', occupation: 'Designer', passport_number: 'TR1234567', passport_expiry_date: '2034-01-14', permanent_address: '100 Example Street, Tokyo',
    email: 'yuki.tanaka@example.invalid', phone_abroad: '+81000000000', address_in_india: 'Central Hotel, Delhi', phone_india: '+910000000000', india_reference: 'Central Hotel, Example Road, Delhi; +910000000000',
    arrival_date: futureDate(45), arrival_flight: 'AI101', arrival_port: 'Delhi', onward_date: futureDate(59), onward_flight: 'AI102', final_destination: 'Tokyo', declaration_place: 'Tokyo', declaration_date: futureDate(1), typed_name: 'YUKI TANAKA', voa_truthful: true, voa_airport_process: true, voa_nonextendable: true,
  };
  if (type === 'afghan') {
    const category = current.visa_category || 'medical';
    const purpose = current.afghan_purpose || afghanPurposes[category]?.[0] || '';
    return {
      ...common,
      application_type: 'afghan',
      nationality: 'Afghanistan',
      passport_type: current.passport_type || 'ordinary',
      visa_category: category,
      afghan_purpose: purpose,
      tazkira_number: '123456789',
      address_in_india: 'Hospital Guest House, Delhi',
      principal_applicant_id: category === 'medical-attendant' || ['business-dependant', 'student-dependant'].includes(purpose) ? 'VS2026A00001' : current.principal_applicant_id,
      is_minor: 'no',
    };
  }
  if (type === 'regular') return { ...common, application_type: 'regular', nationality: 'Canada', country_of_application: 'Canada', passport_type: 'ordinary', visa_category: 'employment' };
  return {
    ...common,
    application_type: 'evisa',
    nationality: current.nationality || 'Canada',
    passport_type: current.passport_type || 'ordinary',
    arrival_port: current.arrival_port || 'Delhi Airport',
    visa_category: current.visa_category || 'tourist',
    student_course_type: current.visa_category === 'student' ? (current.student_course_type || 'general-course') : current.student_course_type,
    eligibility_ruleset_id: current.eligibility_ruleset_id,
    eligibility_reviewed_date: current.eligibility_reviewed_date,
    purpose_intent: current.purpose_intent,
    intended_stay_days: current.intended_stay_days,
    study_in_india_institution: current.study_in_india_institution,
  };
};

export default function Wizard() {
  return <WizardForm />;
}

function WizardForm() {
  const { state, updateState, updateData } = useStore();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [errors, setErrors] = useState({});
  const [backendSync, setBackendSync] = useState({ status: 'idle', message: '' });
  const [accessPrompt, setAccessPrompt] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const stepHeadingRef = useRef(null);
  const errorSummaryRef = useRef(null);
  const previousStepRef = useRef(state.step);
  const appType = ['evisa', 'afghan', 'voa', 'regular'].includes(state.data.application_type) ? state.data.application_type : 'evisa';
  const steps = getSteps(appType, state.data);
  const stepIndex = Math.min(state.step, steps.length - 1);
  const step = steps[stepIndex];

  useEffect(() => {
    const requested = steps.findIndex((item) => item.id === params.get('step'));
    const furthest = Math.max(state.furthestStep || 0, state.step);
    if (requested >= 0 && requested <= furthest) {
      if (requested !== state.step) updateState({ step: requested });
    } else {
      setParams({ step: step.id }, { replace: true });
    }
  }, [params]);

  useEffect(() => {
    if (state.step !== stepIndex) updateState({ step: stepIndex });
  }, [state.step, stepIndex]);

  useEffect(() => {
    if (previousStepRef.current === stepIndex) return;
    previousStepRef.current = stepIndex;
    setErrors({});
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
    stepHeadingRef.current?.focus({ preventScroll: true });
  }, [stepIndex]);

  const evisaGate = appType === 'evisa' ? getEvisaWizardGate(state.data) : { allowed: true, reason: null };
  const evisaRouteBlocked = !evisaGate.allowed;

  if (evisaRouteBlocked) {
    const studyGateMissing = evisaGate.reason === 'study-in-india-required';
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white border border-amber-300 shadow-sm rounded mt-12">
        <p className="text-sm font-bold uppercase tracking-widest text-amber-700 mb-3">Eligibility check required</p>
        <h1 className="text-3xl font-bold mb-4">Return to the Visa Finder</h1>
        <p className="text-text-secondary mb-6">{studyGateMissing
          ? 'The e-Student journey requires confirmation that the admitting institution is registered on the Government Study in India programme.'
          : evisaGate.reason === 'unsupported-category'
            ? 'Please use the visa finder to choose a supported category.'
            : 'Find your visa route before starting the application.'}</p>
        <button type="button" onClick={() => navigate('/guide/visa-finder')} className="btn-primary">Find my visa route</button>
      </div>
    );
  }

  if (state.submitted) {
    return <OfficialApplicationDossier state={state} />;
  }

  const handleNext = async (event) => {
    event.preventDefault();
    const found = validateStep(step, state.data, state.docs);
    setErrors(found);
    if (Object.keys(found).length) {
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    if (platformEnabled && (await supabase.auth.getSession()).data.session && stepIndex < steps.length - 1) {
      setBackendSync({ status: 'saving', message: 'Saving your draft…' });
      try {
        await saveApplication(state, (cloud, docs) => updateState({ cloud, ...(docs ? { docs } : {}) }));
        setBackendSync({ status: 'saved', message: 'Your progress is saved.' });
      } catch (error) {
        setBackendSync({ status: 'error', message: error.message });
        return;
      }
    }
    if (stepIndex < steps.length - 1) {
      updateState({ step: stepIndex + 1 });
      setParams({ step: steps[stepIndex + 1].id });
      window.scrollTo(0, 0);
    } else {
      setBackendSync({ status: 'saving', message: 'Preparing your application…' });
      try {
        if (!platformEnabled) throw new Error(APPLICATION_ACCESS_UNAVAILABLE);
        if (!(await supabase.auth.getSession()).data.session) { setAccessPrompt(true); setBackendSync({ status: 'idle', message: '' }); return; }
        const app = await saveApplication(state, (cloud, docs) => updateState({ cloud, ...(docs ? { docs } : {}) }));
        navigate(`/applications/${app.id}`);
      } catch (error) {
        setBackendSync({
          status: 'error',
          message: error.message,
        });
      }
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setErrors({});
      updateState({ step: stepIndex - 1 });
      setParams({ step: steps[stepIndex - 1].id });
      setMobileMenuOpen(false);
      window.scrollTo(0, 0);
    } else {
      navigate(flowPath(appType));
    }
  };

  const jumpToStep = (index) => {
    if (index <= stepIndex && index !== stepIndex) {
      setErrors({});
      updateState({ step: index });
      setParams({ step: steps[index].id });
      setMobileMenuOpen(false);
      window.scrollTo(0, 0);
    }
  };

  const fillDemoData = () => {
    const fixture = demoFixture(appType, state.data);
    Object.entries(fixture).forEach(([name, value]) => updateData(name, value));
    setErrors({});
  };

  const renderField = (item) => {
    if (!isVisible(item, state.data)) return null;
    const required = isRequired(item, state.data);
    const value = state.data[item.name] ?? (item.type === 'checkbox' ? false : '');
    const classes = `input-field w-full ${errors[item.name] ? 'border-red-500' : ''}`;
    const errorId = `${item.name}-error`;
    return (
      <div key={item.name} className={item.type === 'checkbox' ? 'max-w-2xl' : 'max-w-xl'}>
        {item.type === 'checkbox' ? (
          <label htmlFor={item.name} className="flex gap-3 items-start font-medium text-gray-900">
            <input id={item.name} type="checkbox" className="mt-1 h-4 w-4" checked={value === true} aria-invalid={Boolean(errors[item.name])} aria-describedby={errors[item.name] ? errorId : undefined} onChange={(event) => updateData(item.name, event.target.checked)} />
            <span>{item.label}{required && <span className="text-red-600 ml-1">*</span>}</span>
          </label>
        ) : (
          <>
            <label htmlFor={item.name} className="block font-bold mb-1 text-gray-900">{item.label}{required && <span className="text-red-600 ml-1">*</span>}{item.help && <ContextHelp text={item.help} />}</label>
            {item.type === 'select' ? (
              <select id={item.name} required={required} className={classes} value={value} aria-invalid={Boolean(errors[item.name])} aria-describedby={errors[item.name] ? errorId : undefined} onChange={(event) => updateData(item.name, event.target.value)} disabled={item.readOnly}>
                <option value="">Choose an option</option>
                {(item.options || []).map((option) => <option key={option} value={option}>{String(option).replace(/-/g, ' ')}</option>)}
              </select>
            ) : item.type === 'textarea' ? (
              <textarea id={item.name} required={required} className={classes} rows="3" value={value} aria-invalid={Boolean(errors[item.name])} aria-describedby={errors[item.name] ? errorId : undefined} onChange={(event) => updateData(item.name, event.target.value)} readOnly={item.readOnly} />
            ) : (
              <input id={item.name} type={item.type} required={required} className={classes} value={value} aria-invalid={Boolean(errors[item.name])} aria-describedby={errors[item.name] ? errorId : undefined} onChange={(event) => updateData(item.name, event.target.value)} readOnly={item.readOnly} min={item.type === 'number' ? 1 : undefined} />
            )}
          </>
        )}
        {item.name === 'passport_expiry_date' && value && (
          <p className="text-[11px] text-[#C4762A] font-medium mt-1">
            Note: Indian Immigration requires your passport to remain valid for at least 6 months from your intended arrival date.
          </p>
        )}
        {errors[item.name] && <p id={errorId} className="text-sm text-red-700 font-bold mt-1">{errors[item.name]}</p>}
      </div>
    );
  };

  const progressPercent = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 mb-16">
      {/* ── MOBILE / TABLET COMPACT STEP BAR (< 1024px) ── */}
      <div className="lg:hidden mb-6 bg-white border border-border rounded-lg shadow-sm overflow-hidden sticky top-2 z-30">
        <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-border bg-slate-50/75">
          <div className="pr-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4762A] block mb-0.5">
              Step {stepIndex + 1} of {steps.length} ({progressPercent}%)
            </span>
            <h2 className="text-sm sm:text-base font-serif font-bold text-gray-900 leading-tight truncate max-w-[220px] sm:max-w-xs">
              {step.title}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fillDemoData}
              className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 font-bold rounded hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Autofill
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-1 text-xs font-bold text-[#1E2A4F] bg-white border border-border px-2.5 py-1 rounded shadow-xs hover:bg-slate-50 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-wizard-steps"
            >
              <span>{mobileMenuOpen ? 'Close' : 'Steps'}</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Continuous progress line */}
        <div className="w-full bg-gray-100 h-1.5">
          <div
            className="bg-[#1E2A4F] h-1.5 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Expandable step list sheet */}
        {mobileMenuOpen && (
          <nav id="mobile-wizard-steps" aria-label="Mobile application preparation steps" className="p-3 bg-white divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {steps.map((item, index) => {
              const isCompleted = index < stepIndex;
              const isCurrent = index === stepIndex;
              const isClickable = index <= stepIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => jumpToStep(index)}
                  className={`w-full text-left py-2.5 px-2 flex items-center justify-between text-xs transition-colors rounded ${
                    isCurrent
                      ? 'bg-slate-100 font-bold text-[#1E2A4F]'
                      : isCompleted
                        ? 'text-gray-700 hover:bg-slate-50 cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-[#176B45] text-white'
                        : isCurrent
                          ? 'bg-[#1E2A4F] text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  {isCurrent && <span className="text-[10px] font-bold text-[#C4762A] uppercase">Active</span>}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* ── 2-COLUMN MASTER-DETAIL CONTAINER (DESKTOP & MOBILE WRAPPER) ── */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* ── DESKTOP VERTICAL STEPPER SIDEBAR (≥ 1024px) ── */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-6 bg-white border border-border rounded-lg shadow-sm overflow-hidden" aria-label="Application progress">
          <div className="p-5 border-b border-border bg-slate-50/75">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C4762A]">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <span className="text-xs font-bold text-gray-600 font-mono">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#1E2A4F] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Vertical Step Timeline */}
          <nav aria-label="Application preparation steps" className="p-4">
            <ol className="relative border-l-2 border-gray-200 ml-3 space-y-5 my-2">
              {steps.map((item, index) => {
                const isCompleted = index < stepIndex;
                const isCurrent = index === stepIndex;
                const isClickable = index <= stepIndex;
                return (
                  <li key={item.id} className="relative pl-6" aria-current={isCurrent ? 'step' : undefined}>
                    <span className={`absolute -left-[11px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                      isCompleted
                        ? 'bg-[#176B45] border-[#176B45] text-white'
                        : isCurrent
                          ? 'bg-[#1E2A4F] border-[#1E2A4F] text-white shadow-sm ring-4 ring-blue-100'
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </span>
                    {isClickable ? (
                      <button
                        type="button"
                        onClick={() => jumpToStep(index)}
                        className={`text-left text-xs font-sans transition-colors block w-full focus:outline-none hover:text-primary ${
                          isCurrent
                            ? 'font-bold text-[#1E2A4F] text-sm'
                            : 'text-gray-600'
                        }`}
                      >
                        {item.title}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 font-sans block cursor-not-allowed">
                        {item.title}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Sidebar Footer Metadata & Demo Action */}
          <div className="p-4 border-t border-border bg-slate-50/50 space-y-3">
            <div className="text-[11px] text-gray-600">
              <span className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-0.5">Reference ID</span>
              <span className="font-mono text-xs text-[#1E2A4F] break-all font-semibold">{formatReference(state.identifiers?.temporaryDemoId)}</span>
            </div>
            <button
              type="button"
              onClick={fillDemoData}
              className="w-full text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 py-2 px-3 font-bold rounded transition-colors text-center shadow-2xs cursor-pointer"
            >
              Autofill
            </button>
          </div>
        </aside>

        {/* ── RIGHT MAIN FORM CANVAS ── */}
        <main className="flex-1 w-full bg-white p-6 md:p-10 border border-border rounded-lg shadow-sm">
          <div className="mb-8 border-b border-border pb-6">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-2">
              <div>
                <h1 ref={stepHeadingRef} tabIndex="-1" className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 focus:outline-none">{step.title}</h1>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest block">Step {stepIndex + 1} of {steps.length}</span>
              </div>
            </div>

            <div className="lg:hidden mt-3 bg-slate-50 border border-slate-200 p-2.5 rounded text-xs text-slate-700 flex justify-between items-center">
              <div>
                <strong>Reference:</strong> <span className="font-mono text-[11px]">{formatReference(state.identifiers?.temporaryDemoId)}</span>
              </div>
            </div>
          </div>

          {accessPrompt && <section className="mb-8 rounded-lg border border-border bg-background p-4" aria-label="Secure email access">
            <Auth initialEmail={state.data.email || ''}><div className="p-5"><p>Your email is verified. Your answers are ready to save.</p><button type="button" className="platform-primary mt-4" disabled={backendSync.status === 'saving'} onClick={async () => {
              setBackendSync({ status: 'saving', message: 'Saving your progress…' });
              try { const app = await saveApplication(state, (cloud, docs) => updateState({ cloud, ...(docs ? { docs } : {}) })); setAccessPrompt(false); setBackendSync({ status: 'saved', message: 'Your progress is saved.' }); if (stepIndex === steps.length - 1) navigate(`/applications/${app.id}`); }
              catch (error) { setBackendSync({ status: 'error', message: error.message }); }
            }}>Save and continue</button></div></Auth>
            <button type="button" className="platform-link" onClick={() => setAccessPrompt(false)}>Keep filling my application</button>
          </section>}
          {step.description && <p className="text-text-secondary text-sm sm:text-base mb-8 pb-4 border-b border-border leading-relaxed">{step.description}</p>}

          {platformEnabled && <div className="mb-5 flex items-center justify-between gap-4"><button type="button" className="platform-secondary" disabled={backendSync.status === 'saving'} onClick={async () => {
            if (!(await supabase.auth.getSession()).data.session) { setAccessPrompt(true); return; }
            setBackendSync({ status: 'saving', message: 'Saving your draft…' });
            try { await saveApplication(state, (cloud, docs) => updateState({ cloud, ...(docs ? { docs } : {}) })); setBackendSync({ status: 'saved', message: 'Your progress is saved.' }); }
            catch (error) { setBackendSync({ status: 'error', message: error.message }); }
          }}>Save my progress</button><button type="button" className="platform-link" onClick={() => navigate('/applications')}>My applications</button></div>}
          {platformEnabled && backendSync.status === 'saved' && <p role="status" className="mb-4 text-sm text-green-800">{backendSync.message}</p>}
          <form onSubmit={handleNext} noValidate>
            <fieldset className="min-w-0" disabled={backendSync.status === 'saving'}>
            {backendSync.status === 'error' && (
              <div role="alert" className="mb-8 border-l-4 border-red-600 bg-red-50 p-5 text-red-950">
                <strong className="block mb-1">We couldn’t finish preparing your application</strong>
                <p className="text-sm">{backendSync.message}</p>
              </div>
            )}
            {Object.keys(errors).length > 0 && (
              <div ref={errorSummaryRef} tabIndex="-1" role="alert" aria-labelledby="wizard-error-heading" className="mb-8 border-l-4 border-red-600 bg-red-50 p-5 text-red-950 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-red-700">
                <h2 id="wizard-error-heading" className="font-bold text-lg mb-2">Check this step before continuing</h2>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {Object.entries(errors).map(([name, message]) => {
                    const label = (step.fields || []).find((item) => item.name === name)?.label
                      || ({ documents: 'Required documents', review_accuracy: 'Review confirmation' })[name]
                      || name.replace(/_/g, ' ');
                    return <li key={name}><a href={`#${name}`} className="font-bold underline">{label}: {message}</a></li>;
                  })}
                </ul>
              </div>
            )}
            {step.fields && <div className="space-y-6">{step.fields.map(renderField)}</div>}
            {step.id === 'documents' && <div id="documents" tabIndex="-1" aria-invalid={Boolean(errors.documents)} aria-describedby={errors.documents ? 'documents-error' : undefined} className="mb-8"><SmartDocuments />{errors.documents && <p id="documents-error" className="mt-4 text-sm font-bold text-red-700">{errors.documents}</p>}</div>}
            
            {/* ── ENHANCED STRUCTURED REVIEW (STEP 8) WITH DIRECT JUMP-TO-EDIT ── */}
            {step.id === 'review' && (
              <div className="space-y-6">
                <div className="border border-amber-300 bg-amber-50 p-4 rounded text-sm text-amber-950">
                  <strong className="block mb-1">Comprehensive Pre-Submission Verification</strong>
                  Please verify each section below. Use the &quot;Edit&quot; button on any section to make quick adjustments.
                </div>

                {/* Section A: Applicant Bio-Data */}
                <div className="bg-[#FAF7F0] border border-gray-200 rounded-lg p-5">
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200">
                    <h3 className="font-serif font-bold text-sm text-[#1E2A4F] uppercase tracking-wider">
                      Applicant Bio-Data & Identity
                    </h3>
                    <button
                      type="button"
                      onClick={() => jumpToStep(1)}
                      className="text-xs font-bold text-[#C4762A] hover:text-[#1E2A4F] uppercase tracking-wider underline cursor-pointer"
                    >
                      Edit Bio-Data
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-gray-500 block">Surname</span><strong>{state.data.surname || 'Not provided'}</strong></div>
                    <div><span className="text-gray-500 block">Given Name</span><strong>{state.data.given_name || 'Not provided'}</strong></div>
                    <div><span className="text-gray-500 block">Date of Birth</span><strong>{state.data.date_of_birth || 'Not provided'}</strong></div>
                    <div><span className="text-gray-500 block">Gender</span><strong>{state.data.gender || 'Not provided'}</strong></div>
                  </div>
                </div>

                {/* Section B: Passport & Nationality */}
                <div className="bg-[#FAF7F0] border border-gray-200 rounded-lg p-5">
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200">
                    <h3 className="font-serif font-bold text-sm text-[#1E2A4F] uppercase tracking-wider">
                      Passport & Nationality
                    </h3>
                    <button
                      type="button"
                      onClick={() => jumpToStep(2)}
                      className="text-xs font-bold text-[#C4762A] hover:text-[#1E2A4F] uppercase tracking-wider underline cursor-pointer"
                    >
                      Edit Passport
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-gray-500 block">Nationality</span><strong>{state.data.nationality || 'Not provided'}</strong></div>
                    <div><span className="text-gray-500 block">Passport No.</span><strong className="font-mono">{state.data.passport_number || 'Not provided'}</strong></div>
                    <div><span className="text-gray-500 block">Issue Date</span><strong>{state.data.passport_issue_date || 'Not provided'}</strong></div>
                    <div><span className="text-gray-500 block">Expiry Date</span><strong>{state.data.passport_expiry_date || 'Not provided'}</strong></div>
                  </div>
                </div>

                {/* Section C: Travel & Reference */}
                <div className="bg-[#FAF7F0] border border-gray-200 rounded-lg p-5">
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200">
                    <h3 className="font-serif font-bold text-sm text-[#1E2A4F] uppercase tracking-wider">
                      Travel Details & References
                    </h3>
                    <button
                      type="button"
                      onClick={() => jumpToStep(5)}
                      className="text-xs font-bold text-[#C4762A] hover:text-[#1E2A4F] uppercase tracking-wider underline cursor-pointer"
                    >
                      Edit Travel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div><span className="text-gray-500 block">Arrival Checkpoint</span><strong>{state.data.arrival_port || 'Not provided'}</strong></div>
                    <div><span className="text-gray-500 block">Expected Arrival</span><strong>{state.data.expected_arrival_date || state.data.arrival_date || 'Not provided'}</strong></div>
                    <div><span className="text-gray-500 block">India Reference</span><strong className="truncate block">{state.data.india_reference || 'Not provided'}</strong></div>
                  </div>
                </div>

                {/* Section D: Uploaded Documents */}
                <div className="bg-[#FAF7F0] border border-gray-200 rounded-lg p-5">
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200">
                    <h3 className="font-serif font-bold text-sm text-[#1E2A4F] uppercase tracking-wider">
                      Document Evidence
                    </h3>
                    <button
                      type="button"
                      onClick={() => jumpToStep(steps.findIndex((s) => s.id === 'documents'))}
                      className="text-xs font-bold text-[#C4762A] hover:text-[#1E2A4F] uppercase tracking-wider underline cursor-pointer"
                    >
                      Edit Documents
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {state.docs && state.docs.length > 0 ? (
                      state.docs.map((doc) => (
                        <div key={doc.type} className="flex items-center justify-between text-gray-700 bg-white p-2 rounded border border-gray-200">
                          <span className="font-medium uppercase">{doc.type.replace(/_/g, ' ')}</span>
                          <span className="text-[#176B45] font-bold">Validated ({doc.extension?.toUpperCase()})</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No document files selected</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {renderField(field('review_accuracy', 'I reviewed every prepared field and document status for accuracy', 'checkbox'))}
                </div>
              </div>
            )}

            <div className="mt-12 flex gap-4 pt-6 border-t border-border">
              <button type="button" onClick={handleBack} className="btn-secondary">Back</button>
              <button type="submit" disabled={backendSync.status === 'saving'} className="btn-primary ml-auto disabled:opacity-60">{backendSync.status === 'saving' ? 'Preparing application…' : stepIndex === steps.length - 1 ? 'Review and checkout' : 'Save and continue'}</button>
            </div>
          </fieldset>
          </form>
        </main>
      </div>
    </div>
  );
}
