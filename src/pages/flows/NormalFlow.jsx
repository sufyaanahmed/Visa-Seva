import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { getEvisaWizardGate } from '../../domain/visaEligibility';
import { getVisaFeeEstimate } from '../../domain/visaFees';
import FlowGuide from '../../components/FlowGuide';
import Disclosure from '../../components/Disclosure';

const FEE_SCHEDULE = [
  { category: 'e-Tourist (30 Days)', validity: '30 Days Double Entry', feeUsd: '$10 – $25 USD', feeInr: '₹850 – ₹2,100', note: '$10 in April–June; $25 in July–March' },
  { category: 'e-Tourist (1 Year)', validity: '365 Days Multiple Entry', feeUsd: '$40 USD', feeInr: '₹3,350', note: 'Max 180 days continuous stay per visit' },
  { category: 'e-Tourist (5 Years)', validity: '5 Years Multiple Entry', feeUsd: '$80 USD', feeInr: '₹6,700', note: 'Max 180 days continuous stay per calendar year' },
  { category: 'e-Business (1 Year)', validity: '365 Days Multiple Entry', feeUsd: '$80 USD', feeInr: '₹6,700', note: 'Commercial meetings, setup & recruitment' },
  { category: 'e-Conference (30 Days)', validity: '30 Days Single Entry', feeUsd: '$80 USD', feeInr: '₹6,700', note: 'Seminars, symposiums & workshops' },
  { category: 'e-Medical / Attendant', validity: '60 Days Triple Entry', feeUsd: '$80 USD', feeInr: '₹6,700', note: 'Patient treatment and up to 2 attendants' },
  { category: 'e-Student', validity: 'Course Duration (up to 5 Yrs)', feeUsd: '$80 USD', feeInr: '₹6,700', note: 'Registered Study in India institutions' },
];

export default function NormalFlow() {
  const navigate = useNavigate();
  const { state } = useStore();
  const routedByFinder = state.data?.application_type === 'evisa' && getEvisaWizardGate(state.data).allowed;
  const userNationality = state.data?.nationality || state.data?.passport;
  const userFee = getVisaFeeEstimate(state.data?.visa_category || 'tourist', userNationality);

  return (
    <FlowGuide
      title="Apply for an Indian e-Visa"
      intro="Complete your online application, upload documents, pay the government fee, and receive your Electronic Travel Authorization (ETA) prior to arrival."
    >
      {/* User Fee Estimate Banner (if nationality is present) */}
      {userNationality && (
        <div className="mb-8 rounded-xl border border-[#E6DFD3] bg-white p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-accent block mb-1">
            Estimated Fee for {userNationality} ({state.data?.visa_category || 'Tourist'} Category)
          </span>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="font-serif text-2xl font-bold text-primary-dark">
              {userFee.range}
            </span>
            <span className="text-xs text-text/70">{userFee.note}</span>
          </div>
        </div>
      )}

      {/* 3 Step Overview */}
      <ol className="divide-y divide-border border-y border-border my-6">
        {[
          ['01 Prepare Documents', 'Have your passport bio-page (PDF), recent passport photograph (JPEG, auto-compressed), and category-specific invite/letter ready.'],
          ['02 Submit & Pay Online', 'Fill in your personal, passport, and travel particulars exactly as printed on your passport. Government fees are paid securely online via SBI/Axis e-Pay.'],
          ['03 Download & Print ETA', 'Processing typically takes 24 to 72 hours. Once granted, download your Electronic Travel Authorization (ETA) and carry a printed copy for boarding and immigration.'],
        ].map(([title, detail], index) => (
          <li key={title} className="flex gap-4 py-5">
            <span className="text-sm font-bold text-secondary-accent">0{index + 1}</span>
            <div>
              <h2 className="mb-1 font-semibold text-primary">{title}</h2>
              <p className="text-sm leading-relaxed text-text-secondary">{detail}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Official Fee Schedule Accordion */}
      <Disclosure title="Official Government Fee Schedule (USD & INR)">
        <div className="overflow-x-auto my-2">
          <table className="min-w-full text-left text-xs border border-border divide-y divide-border rounded">
            <thead className="bg-slate-50 font-bold text-gray-700">
              <tr>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Validity</th>
                <th className="p-2.5">Fee (USD)</th>
                <th className="p-2.5">Fee (INR)</th>
                <th className="p-2.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white text-gray-800">
              {FEE_SCHEDULE.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-semibold">{row.category}</td>
                  <td className="p-2.5">{row.validity}</td>
                  <td className="p-2.5 font-bold text-primary">{row.feeUsd}</td>
                  <td className="p-2.5 text-gray-600">{row.feeInr}</td>
                  <td className="p-2.5 text-gray-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-gray-500 italic">
            * 20 countries (e.g. Argentina, Fiji, Indonesia, Jamaica, Mauritius, South Africa) are exempt from visa fees (Gratis). Bank card transaction fees (1.5%–2.5%) apply at checkout.
          </p>
        </div>
      </Disclosure>

      <Disclosure title="Photo and document requirements">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li><strong>Photograph</strong>: Square front-facing photo on a light/white background (JPEG, auto-compressed up to 1 MB).</li>
          <li><strong>Passport bio-page</strong>: Clear PDF scan containing personal particulars and photo (10 to 300 KB).</li>
          <li><strong>Supporting documents</strong>: Must be in English, matching your specific category requirements (e.g. business card, hospital letter).</li>
        </ul>
      </Disclosure>

      <p className="text-sm leading-relaxed text-text-secondary">
        Complete your <Link to="/e-arrival" className="text-primary underline font-medium">e-Arrival Card</Link> within 72 hours before arrival. Biometrics are captured upon arrival at Indian immigration.
      </p>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center pt-2">
        <button
          type="button"
          onClick={() => navigate(routedByFinder ? '/apply' : '/guide/visa-finder')}
          className="btn-primary rounded-lg px-6 py-3 font-semibold shadow-sm cursor-pointer"
        >
          {routedByFinder ? 'Continue to Application Form' : 'Find My Visa Route'} →
        </button>
        <a
          href="https://indianvisaonline.gov.in/evisa/"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary underline"
        >
          Official e-Visa portal ↗
        </a>
      </div>
    </FlowGuide>
  );
}

