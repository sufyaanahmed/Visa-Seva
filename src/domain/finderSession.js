import { PASSPORT_NATIONALITIES, VISA_RULESET } from '../data/visaEligibilityRules.js';
import { getFinderQuestions } from './visaEligibility.js';

export function isValidFinderAnswer(question, value) {
  if (question.type === 'country_select') return PASSPORT_NATIONALITIES.includes(value);
  if (question.type === 'number') return value !== '' && Number.isInteger(Number(value)) && Number(value) >= question.min && Number(value) <= question.max;
  return question.options.some((option) => option.value === value);
}

export function firstUnansweredStep(answers) {
  const questions = getFinderQuestions(answers);
  const missing = questions.findIndex((question) => !isValidFinderAnswer(question, answers[question.id]));
  return missing < 0 ? questions.length : missing;
}

export function applyFinderAnswer(finder = {}, id, value) {
  const previous = finder.answers || {};
  const question = getFinderQuestions(previous).find((item) => item.id === id);
  if (!question || (value !== '' && !isValidFinderAnswer(question, value))) return finder;
  if (previous[id] === value) return finder;
  const answers = { ...previous, [id]: value };
  if (id === 'passport' && previous.passport) {
    delete answers.passportType;
    delete answers.travelReadiness;
  }
  if (id === 'purpose' && previous.purpose) delete answers.travelReadiness;
  // Clear answers to questions that no longer apply. Going back or
  // selecting the same answer must never erase the rest of the journey.
  const visibleIds = new Set(getFinderQuestions(answers).map((item) => item.id));
  Object.keys(answers).forEach((key) => { if (!visibleIds.has(key)) delete answers[key]; });
  return { ...finder, answers, showResult: false };
}

export const finderFingerprint = (answers) => JSON.stringify(
  getFinderQuestions(answers).map(({ id }) => [id, answers[id]]),
);

export function applicationFromFinder(state, answers, result) {
  const fingerprint = finderFingerprint(answers);
  if (state.data?.finder_fingerprint === fingerprint && state.data.application_type === result.applicationType) return null;
  return {
    type: result.applicationType,
    step: 0,
    data: {
      application_type: result.applicationType,
      visa_category: result.visaCategory,
      nationality: answers.passport,
      passport_type: answers.passportType,
      pakistan_origin: answers.pakistanOrigin || 'not_applicable',
      purpose_intent: answers.purpose,
      intended_stay_days: Number(answers.durationDays),
      study_in_india_institution: answers.studyInIndiaInstitution || 'not_applicable',
      uae_prior_indian_visa: answers.uaePriorVisa || 'not_applicable',
      voa_arrival_port_gate: answers.voaArrivalPort || 'not_applicable',
      eligibility_ruleset_id: VISA_RULESET.id,
      eligibility_reviewed_date: VISA_RULESET.reviewedDate,
      finder_fingerprint: fingerprint,
    },
    flowDrafts: {},
    docs: [],
    backend: null,
    submitted: false,
  };
}

export const flowPath = (type) => ({ evisa: '/flow/normal', regular: '/flow/regular', afghan: '/flow/afghan', voa: '/flow/voa', oci: '/guide/oci' }[type] || '/guide/visa-finder');
