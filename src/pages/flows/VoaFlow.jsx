import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import FlowGuide from '../../components/FlowGuide';
import Disclosure from '../../components/Disclosure';
import { countryFlag } from '../../domain/countries';

const VOA_PAGE = 'https://indianvisaonline.gov.in/visa/visa-on-arrival.html';
const nationalities = ['Japan', 'South Korea', 'United Arab Emirates'];
const purposes = ['Tourism', 'Business', 'Conference', 'Medical'];
const airports = ['Bangalore', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Mumbai'];

const confirmations = [
  ['ordinaryPassport', 'I travel on an ordinary passport (Diplomatic and Official passports are excluded).'],
  ['passportValidity', 'My passport will have at least six months of validity at arrival.'],
  ['noIndiaResidence', 'I do not have a residence or occupation in India.'],
  ['onwardTravel', 'I have a confirmed return or onward ticket.'],
  ['sufficientFunds', 'I can cover accommodation, meals and travel for my entire stay. No fixed minimum balance is published.'],
  ['noPakistanOrigin', 'Neither I, nor either parent or grandparent, was born in or permanently resident in Pakistan.'],
  ['admissibility', 'I have not been notified that I am persona non grata or otherwise inadmissible; I understand the Government makes the final assessment.'],
];

export default function VoaFlow() {
  const navigate = useNavigate();
  const { state, updateState, updateFlowDraft } = useStore();
  const [form, setForm] = useState(() => {
    if (state.flowDrafts?.voa) return state.flowDrafts.voa.form;
    const data = state.data.application_type === 'voa' ? state.data : {};
    return {
      nationality: data.nationality || '',
      priorVisa: data.uae_prior_indian_visa && data.uae_prior_indian_visa !== 'not_applicable' ? data.uae_prior_indian_visa : '',
      purpose: data.visa_category === 'tourist' ? 'Tourism' : data.visa_category ? data.visa_category.charAt(0).toUpperCase() + data.visa_category.slice(1) : '',
      days: data.intended_stay_days || '',
      airport: airports.includes(data.arrival_port) ? data.arrival_port : ''
    };
  });
  const [checked, setChecked] = useState(() => {
    if (state.flowDrafts?.voa) return state.flowDrafts.voa.checked;
    if (state.data.application_type !== 'voa' || !state.data.finder_fingerprint) return {};
    const answers = state.finder.answers;
    return {
      ordinaryPassport: answers.passportType === 'ordinary', passportValidity: answers.travelReadiness === 'yes',
      noIndiaResidence: answers.voaIndiaResidenceOrOccupation === 'no', onwardTravel: answers.travelReadiness === 'yes',
      sufficientFunds: answers.travelReadiness === 'yes', noPakistanOrigin: answers.pakistanOrigin === 'no',
      admissibility: answers.voaAdmissibility === 'yes',
    };
  });
  const [attempted, setAttempted] = useState(false);

  const update = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    setAttempted(false);
    updateFlowDraft('voa', { form: next, checked });
  };
  const updateConfirmation = (key, value) => {
    const next = { ...checked, [key]: value };
    setChecked(next);
    setAttempted(false);
    updateFlowDraft('voa', { form, checked: next });
  };
  const allConfirmed = confirmations.every(([key]) => checked[key]);
  const stayDays = Number(form.days);
  const eligible = useMemo(() => (
    nationalities.includes(form.nationality)
    && (form.nationality !== 'United Arab Emirates' || form.priorVisa === 'yes')
    && purposes.includes(form.purpose)
    && Number.isInteger(stayDays)
    && stayDays >= 1
    && stayDays <= 60
    && airports.includes(form.airport)
    && allConfirmed
  ), [form, stayDays, allConfirmed]);

  const hasBasicAnswers = form.nationality && form.purpose && form.days && form.airport
    && (form.nationality !== 'United Arab Emirates' || form.priorVisa);

  const checkEligibility = (event) => {
    event.preventDefault();
    setAttempted(true);
    if (eligible) {
      startFormPreparation();
    }
  };

  const startFormPreparation = () => {
    if (!eligible) return;
    const fingerprint = JSON.stringify({ form, checked });
    if (state.data.voa_form_fingerprint === fingerprint) { navigate('/apply'); return; }
    updateState({
      type: 'voa',
      step: 0,
      data: {
        ...(state?.data || {}),
        application_type: 'voa',
        voa_form_fingerprint: fingerprint,
        nationality: form.nationality,
        visa_category: form.purpose.toLowerCase(),
        intended_stay_days: form.days,
        arrival_port: form.airport,
        passport_type: 'ordinary',
        uae_previous_indian_visa: form.nationality === 'United Arab Emirates' ? form.priorVisa : 'not_applicable',
        no_india_residence_occupation: true,
        onward_ticket_confirmed: true,
        sufficient_funds_confirmed: true,
        pakistan_origin: 'no',
        persona_non_grata: 'no',
        undesirable_person: 'no',
      },
      docs: [],
      submitted: false,
    });
    navigate('/apply');
  };

  const validationErrors = useMemo(() => {
    const errors = [];
    if (!form.nationality) errors.push('Passport nationality is required.');
    if (!form.purpose) errors.push('Permitted purpose of visit is required.');
    if (!form.days) errors.push('Intended stay duration is required.');
    else if (!Number.isInteger(stayDays) || stayDays < 1 || stayDays > 60) errors.push('Stay duration must be between 1 and 60 days.');
    if (!form.airport) errors.push('Designated arrival airport must be selected.');
    if (form.nationality === 'United Arab Emirates' && !form.priorVisa) errors.push('UAE prior Indian visa confirmation is required.');
    if (form.nationality === 'United Arab Emirates' && form.priorVisa === 'no') errors.push('First-time UAE passport holders must apply via regular or e-Visa.');
    if (!allConfirmed) errors.push('All 7 statutory eligibility declarations must be confirmed.');
    return errors;
  }, [form, stayDays, allConfirmed]);

  return (
    <FlowGuide title="Visa on Arrival" intro="For eligible citizens of Japan, South Korea and the UAE. Stay up to 60 days with double entry; the fee is ₹2,000 per person at the airport.">
      <form onSubmit={checkEligibility} className="space-y-7" noValidate>
        <section>
          <h2 className="text-2xl font-bold mb-5 text-gray-900">Your trip</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="text-sm font-bold text-gray-800">
              Passport nationality <span className="text-red-600">*</span>
              <select
                className={`input-field mt-2 font-normal ${attempted && !form.nationality ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                value={form.nationality}
                onChange={(e) => update('nationality', e.target.value)}
                required
              >
                <option value="">Select nationality</option>
                {nationalities.map((item) => <option key={item} value={item}>{countryFlag(item)} {item}</option>)}
              </select>
              {attempted && !form.nationality && (
                <p className="text-xs text-red-600 font-bold mt-1">Please select your nationality.</p>
              )}
            </label>

            <label className="text-sm font-bold text-gray-800">
              Permitted purpose <span className="text-red-600">*</span>
              <select
                className={`input-field mt-2 font-normal ${attempted && !form.purpose ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                value={form.purpose}
                onChange={(e) => update('purpose', e.target.value)}
                required
              >
                <option value="">Select purpose</option>
                {purposes.map((item) => <option key={item}>{item}</option>)}
              </select>
              {attempted && !form.purpose && (
                <p className="text-xs text-red-600 font-bold mt-1">Please select your travel purpose.</p>
              )}
            </label>

            <label className="text-sm font-bold text-gray-800">
              Intended stay (days) <span className="text-red-600">*</span>
              <input
                className={`input-field mt-2 font-normal ${attempted && (!form.days || stayDays < 1 || stayDays > 60) ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                type="number"
                min="1"
                max="60"
                value={form.days}
                onChange={(e) => update('days', e.target.value)}
                placeholder="Maximum 60"
                required
              />
              {attempted && (!form.days || stayDays < 1 || stayDays > 60) && (
                <p className="text-xs text-red-600 font-bold mt-1">
                  {!form.days ? 'Please enter intended stay.' : 'Stay must be between 1 and 60 days.'}
                </p>
              )}
            </label>

            <label className="text-sm font-bold text-gray-800">
              Arrival airport <span className="text-red-600">*</span>
              <select
                className={`input-field mt-2 font-normal ${attempted && !form.airport ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                value={form.airport}
                onChange={(e) => update('airport', e.target.value)}
                required
              >
                <option value="">Select designated airport</option>
                {airports.map((item) => <option key={item}>{item}</option>)}
              </select>
              {attempted && !form.airport && (
                <p className="text-xs text-red-600 font-bold mt-1">Please select a designated arrival airport.</p>
              )}
            </label>
          </div>
          {form.nationality === 'United Arab Emirates' && (
            <fieldset className="mt-5 border border-border p-5 rounded">
              <legend className="px-2 font-bold text-gray-900">UAE prior-visa condition <span className="text-red-600">*</span></legend>
              <p className="text-sm text-text-secondary mb-3">Have you previously obtained an Indian e-Visa or regular/paper visa?</p>
              <div className="flex gap-6">
                {['yes', 'no'].map((value) => (
                  <label key={value} className="flex gap-2 items-center capitalize"><input type="radio" name="priorVisa" value={value} checked={form.priorVisa === value} onChange={(e) => update('priorVisa', e.target.value)} />{value}</label>
                ))}
              </div>
              {attempted && !form.priorVisa && (
                <p className="mt-2 text-xs font-bold text-red-600">Please select whether you held a previous Indian visa.</p>
              )}
              {form.priorVisa === 'no' && <p className="mt-3 text-sm font-bold text-red-700">First-time UAE visitors are not eligible for Visa-on-Arrival; use the official e-Visa or regular/paper route instead.</p>}
            </fieldset>
          )}
        </section>

        <Disclosure title="Your eligibility answers" defaultOpen={!allConfirmed || attempted}>
          <div className="space-y-3">
            {confirmations.map(([key, label]) => (
              <label key={key} className="flex items-start gap-3 py-2 cursor-pointer">
                <input type="checkbox" checked={Boolean(checked[key])} onChange={(e) => updateConfirmation(key, e.target.checked)} className="mt-1" />
                <span className={`text-sm ${attempted && !checked[key] ? 'text-red-700 font-semibold' : 'text-gray-800'}`}>{label}</span>
              </label>
            ))}
          </div>
          {attempted && !allConfirmed && (
            <p className="text-xs text-red-600 font-bold mt-3 border-t border-red-200 pt-2">
              All 7 statutory declarations must be confirmed to qualify for Visa on Arrival.
            </p>
          )}
        </Disclosure>

        <button type="submit" className="btn-primary">Check and continue</button>

        {attempted && (
          <section role="status" className={`border p-6 rounded-xl ${eligible ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300 shadow-sm'}`}>
            <h2 className={`text-xl font-bold mb-2 ${eligible ? 'text-green-950' : 'text-red-950'}`}>{eligible ? 'Ready to prepare your form' : 'Check your trip details'}</h2>
            <p className={`text-sm ${eligible ? 'text-green-900' : 'text-red-900 mb-3'}`}>
              {eligible
                ? 'Prepare Annexure I and bring it to the airport. The Visa Officer makes the final decision.'
                : 'Please resolve the following requirements to proceed:'}
            </p>
            {!eligible && validationErrors.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 text-sm text-red-900 font-medium">
                {validationErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}
            {eligible && (
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={startFormPreparation} className="btn-primary cursor-pointer">Prepare Annexure I Form</button>
                <Link to="/e-arrival" className="btn-secondary">Review e-Arrival Requirements</Link>
              </div>
            )}
          </section>
        )}
      </form>

      <Disclosure title="What to bring to the airport">
        <ul className="list-disc space-y-2 pl-5">
          <li>Completed Annexure I form, passport, return or onward ticket and evidence of funds.</li>
          <li>A completed <Link to="/e-arrival" className="text-primary underline">e-Arrival Card</Link>, submitted within 72 hours before arrival.</li>
          <li>₹2,000 or equivalent foreign currency per person, including children. If granted, this visa cannot be extended or converted.</li>
        </ul>
      </Disclosure>
      <a href={VOA_PAGE} target="_blank" rel="noreferrer" className="inline-block text-sm text-primary underline">Official Visa on Arrival guidance ↗</a>
    </FlowGuide>
  );
}
