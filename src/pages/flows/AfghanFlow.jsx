import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import FlowGuide from '../../components/FlowGuide';
import Disclosure from '../../components/Disclosure';

const categories = [
  { value: 'business', label: 'Business Visa', note: 'Business, investment, sports and eligible dependant purposes have different evidence requirements.' },
  { value: 'student', label: 'Student Visa', note: 'Scholarship, new or returning study, and eligible dependant purposes are assessed separately.' },
  { value: 'medical', label: 'Medical Visa', note: 'For the patient travelling for treatment in India.' },
  { value: 'medical-attendant', label: 'Medical Attendant Visa', note: 'For an Afghan national accompanying the principal patient.' },
  { value: 'entry', label: 'Entry Visa', note: 'Covers several defined family, cultural, official, property, student-guardian and other purposes.' },
  { value: 'un-diplomat', label: 'UN Diplomat Visa', note: 'For qualifying UN assignment, visit and dependant purposes.' },
];

export default function AfghanFlow() {
  const navigate = useNavigate();
  const { state, updateState, updateFlowDraft } = useStore();
  const [category, setCategory] = useState(state.flowDrafts?.afghan?.category || (state.data.application_type === 'afghan' && categories.some((item) => item.value === state.data.visa_category) ? state.data.visa_category : ''));
  const [showCategoryError, setShowCategoryError] = useState(false);

  const startApplication = () => {
    if (!categories.some((item) => item.value === category)) {
      setShowCategoryError(true);
      return;
    }

    if (state.data.application_type !== 'afghan' || state.data.visa_category !== category) updateState({
      type: 'afghan',
      step: 0,
      data: { ...(state?.data || {}), application_type: 'afghan', visa_category: category, nationality: 'Afghanistan' },
      docs: [],
      submitted: false,
    });
    navigate('/apply');
  };

  return (
    <FlowGuide title="Visa for Afghan nationals" intro="Choose your category to apply through the dedicated Afghan visa portal.">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Choose your visa category</h2>
          <fieldset>
            <legend className="sr-only">Afghan visa category</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((item) => (
                <label key={item.value} className={`border p-5 rounded cursor-pointer transition ${category === item.value ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'border-border bg-white hover:border-primary-light'}`}>
                  <span className="flex items-start gap-3">
                    <input type="radio" name="afghan-category" value={item.value} checked={category === item.value} onChange={() => { setCategory(item.value); updateFlowDraft('afghan', { category: item.value }); setShowCategoryError(false); }} className="mt-1" />
                    <span>
                      <strong className="block text-gray-900 mb-1">{item.label}</strong>
                      <span className="block text-sm text-text-secondary leading-relaxed">{item.note}</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {showCategoryError && <p role="alert" className="mt-3 text-sm font-bold text-red-700">Choose one of the six official categories to continue.</p>}
        </section>

        <Disclosure title="Documents to prepare">
          <ul className="list-disc pl-6 space-y-2 text-gray-800">
            <li>A recent, clear, front-facing photograph with a white background.</li>
            <li>A clear copy of the passport bio page containing the applicant&apos;s particulars.</li>
            <li>A clear copy of the <strong>National Identity Card (Tazkira)</strong>.</li>
            <li>All documents required for the selected category and purpose; invitation letters and business cards must be in English.</li>
          </ul>
        </Disclosure>

        <section>
          <h2 className="text-2xl font-bold mb-5 text-gray-900">Before you travel</h2>
          <ol className="space-y-4 text-text-secondary">
            {[
              ['Wait for the official decision', 'Before travel, confirm the Electronic Travel Authorization status is GRANTED on the Check Status portal.'],
              ['Carry the right documents', 'Print and carry the ETA and travel on the passport used in the application. If that passport was replaced, carry both the old and new passports.'],
              ['Complete arrival steps', 'Complete the separate e-Arrival Card within 72 hours before arrival. Biometrics are captured upon arrival at immigration.'],
            ].map(([title, detail], index) => (
              <li key={title} className="flex gap-4 py-3">
                <span className="flex-none w-8 h-8 rounded-full bg-primary text-white grid place-items-center font-bold">{index + 1}</span>
                <p><strong className="block text-gray-900 mb-1">{title}</strong>{detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="pt-6 border-t border-border flex flex-wrap items-center gap-4">
          <button type="button" onClick={startApplication} className="btn-primary rounded-md">
            Continue application →
          </button>
        </div>
      </div>
    </FlowGuide>
  );
}
