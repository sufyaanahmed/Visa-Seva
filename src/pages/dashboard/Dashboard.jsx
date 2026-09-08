import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRequiredDocuments } from '../../components/SmartDocuments';
import { useStore, formatReference } from '../../store';

import { Navigate } from 'react-router-dom';
const flowDetails = {
  evisa: {
    label: 'Standard e-Visa Application',
    steps: [
      ['registration', 'Registration & route'],
      ['identity', 'Identity'],
      ['passport', 'Passport'],
      ['family', 'Address & family'],
      ['employment', 'Employment'],
      ['travel', 'Travel, history & references'],
      ['security', 'Security questions'],
      ['documents', 'Photo & documents'],
      ['review', 'Review & Submission'],
    ],
  },
  afghan: {
    label: 'Dedicated Afghan Visa / ETA',
    steps: [
      ['route', 'Category & purpose'],
      ['identity', 'Applicant identity'],
      ['passport', 'Passport'],
      ['family', 'Address & family'],
      ['employment', 'Employment / study context'],
      ['travel', 'Travel & references'],
      ['security', 'Security declarations'],
      ['documents', 'Required evidence'],
      ['review', 'Final review'],
    ],
  },
  voa: {
    label: 'Visa on Arrival Annexure I Preparation',
    steps: [
      ['eligibility', 'VoA eligibility'],
      ['applicant', 'Annexure I applicant details'],
      ['passport', 'Passport & contacts'],
      ['travel', 'Travel details'],
      ['declaration', 'Declaration'],
      ['review', 'Review & print preparation'],
    ],
  },
  regular: {
    label: 'Regular / Paper Visa Preparation',
    steps: [
      ['route', 'Paper visa route'],
      ['identity', 'Identity'],
      ['passport', 'Passport'],
      ['family', 'Address, family & employment'],
      ['travel', 'Travel & references'],
      ['security', 'Security declarations'],
      ['documents', 'Document Readiness'],
      ['review', 'Review & print handoff'],
    ],
  },
  oci: {
    label: 'Overseas Citizen of India (OCI) Registration',
    steps: [
      ['oci-category', 'Category & Jurisdiction'],
      ['identity', 'Applicant Identity'],
      ['passport', 'Passport & Foreign Citizenship'],
      ['family', 'Family & Lineage'],
      ['origin', 'Indian Origin & Renunciation'],
      ['security', 'Security & Declarations'],
      ['documents', 'Photo, Signature & Evidence'],
      ['review', 'Review & MHA Application Dossier'],
    ],
  },
};

import { isMeaningfulDraft } from '../../store';

export default function Dashboard() {
  const { state, clearLocalDraft, persistence } = useStore();
  const navigate = useNavigate();
  const eraseAndLeave = async () => {
    const result = await clearLocalDraft();
    if (result.ok) navigate('/guide/visa-finder', { replace: true });
    return result;
  };

  if (!isMeaningfulDraft(state)) {
    return <Navigate to="/guide/visa-finder" replace />;
  }

  const appType = flowDetails[state.data?.application_type] ? state.data.application_type : 'evisa';
  const flow = flowDetails[appType];
  const currentStep = Math.min(Math.max(Number(state.step) || 0, 0), flow.steps.length - 1);
  const progressPercent = state.submitted ? 100 : Math.round((currentStep / flow.steps.length) * 100);
  const documents = Array.isArray(state.docs) ? state.docs : [];
  const requiredDocuments = getRequiredDocuments(state.data || {});
  const documentStep = flow.steps.findIndex(([id]) => id === 'documents');
  const missingDocuments = requiredDocuments.filter((requirement) => !documents.some((document) => document.type === requirement.type && document.status === 'selected-this-session'));
  const documentCheckReached = documentStep >= 0 && currentStep >= documentStep;
  const documentsComplete = requiredDocuments.length > 0 && missingDocuments.length === 0;

  const outcome = state.outcome;
  const statusLabel = outcome === 'form-prepared'
    ? 'Form prepared'
    : outcome === 'demo-preparation-complete'
      ? 'Application Prepared'
      : 'Active Draft';
  const completionCopy = outcome === 'form-prepared'
    ? 'Your Annexure I summary is prepared and ready to review and print.'
    : 'Your application is ready to review and print.';
  const reference = outcome === 'form-prepared'
    ? state.identifiers?.formPreparationId
    : state.identifiers?.finalDemoId || state.identifiers?.temporaryDemoId;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-serif font-bold mb-2">Application Dashboard</h1>
      <p className="text-text-secondary mb-8">Your application progress and documents.</p>

      <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden flex flex-col">
        <div className="bg-[#0b2540] text-white p-6 md:p-8">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <p className="text-[#f0cc91] text-xs font-bold uppercase tracking-widest mb-1">Service Category</p>
              <h2 className="text-2xl font-bold">{flow.label}</h2>
            </div>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{statusLabel}</span>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>{state.submitted ? 'Preparation complete' : `Step ${currentStep + 1} of ${flow.steps.length}`}</span>
              <span className="font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#163a5f] h-2 rounded-full overflow-hidden" role="progressbar" aria-label="Application progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progressPercent}>
              <div className="bg-[#f0cc91] h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col">
          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <span className="block text-xs uppercase tracking-wider text-text-secondary mb-1">Application Reference ID</span>
            <strong className="font-mono break-all text-base text-[#0b2540]">{formatReference(reference) || 'Available when you start'}</strong>
          </div>

          <h3 className="font-bold text-lg mb-4 text-gray-900">Application Milestones</h3>
          <ol className="space-y-3 mb-8">
            {flow.steps.map(([id, label], index) => {
              const isDocumentStep = id === 'documents';
              const complete = state.submitted || index < currentStep || (isDocumentStep && documentsComplete);
              const warning = isDocumentStep && documentCheckReached && missingDocuments.length > 0;
              return (
                <li key={id} className="flex items-start gap-3">
                  <span aria-hidden="true" className={complete ? 'text-green-600 font-bold' : warning ? 'text-amber-600 font-bold' : 'text-gray-400'}>{complete ? '✓' : warning ? '⚠' : '○'}</span>
                  <span className={complete ? 'text-gray-900' : warning ? 'text-amber-800 font-bold' : index === currentStep ? 'text-gray-900 font-bold' : 'text-gray-500'}>
                    {label}{warning ? `: ${missingDocuments.length} required item${missingDocuments.length === 1 ? '' : 's'} missing` : ''}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-auto pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            {!state.submitted ? (
              <div className="flex flex-col sm:flex-row items-center w-full gap-4">
                <Link to="/apply" className="btn-primary inline-flex items-center gap-2 mr-auto">{missingDocuments.length && documentCheckReached ? 'Continue document checks' : 'Continue application'} &rarr;</Link>
                <button type="button" onClick={eraseAndLeave} className="text-sm font-bold text-red-700 hover:text-red-900 transition-colors cursor-pointer">Start Over (Discard Draft)</button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center w-full gap-4">
                <div className="mr-auto">
                  <p className="text-sm text-green-800 font-bold mb-3">{completionCopy}</p>
                  <Link to="/apply" className="btn-secondary inline-block">View application &rarr;</Link>
                </div>
                <button type="button" onClick={eraseAndLeave} className="text-sm font-bold text-red-700 hover:text-red-900 transition-colors cursor-pointer">Start New Application</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
