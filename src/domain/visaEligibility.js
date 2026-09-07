import {
  EVISA_ELIGIBLE_NATIONALITIES,
  EVISA_CATEGORIES,
  PURPOSES,
  VISA_RULESET,
  VOA_NATIONALITIES,
  VOA_PURPOSES,
} from '../data/visaEligibilityRules.js';

const purposeByValue = new Map(PURPOSES.map((purpose) => [purpose.value, purpose]));

export function getEvisaWizardGate(data = {}) {
  if (data.eligibility_ruleset_id !== VISA_RULESET.id) {
    return { allowed: false, reason: 'reviewed-ruleset-required' };
  }
  if (data.visa_category === 'student' && data.study_in_india_institution !== 'yes') {
    return { allowed: false, reason: 'study-in-india-required' };
  }
  if (!EVISA_CATEGORIES.includes(data.visa_category)) {
    return { allowed: false, reason: 'unsupported-category' };
  }
  return { allowed: true, reason: null };
}

const recommendation = ({
  type,
  applicationType,
  visaCategory,
  path,
  description,
  rationale,
  cautions = [],
  actionLabel = 'Continue to application',
}) => ({
  type,
  applicationType,
  visaCategory,
  path,
  description,
  rationale,
  cautions,
  actionLabel,
  rulesetId: VISA_RULESET.id,
});

const regularRoute = (description, rationale, cautions = []) => recommendation({
  type: 'Regular / paper visa',
  applicationType: 'regular',
  visaCategory: 'unconfirmed',
  path: '/flow/regular',
  description,
  rationale,
  cautions: [
    ...cautions,
    'Confirm the exact category and documents with the nearest Indian Mission/Post before travel.',
  ],
  actionLabel: 'Review regular visa route',
});

export function isPotentialVoaJourney(answers) {
  const days = Number(answers.durationDays);
  return VOA_NATIONALITIES.has(answers.passport)
    && VOA_PURPOSES.has(answers.purpose)
    && Number.isFinite(days)
    && days > 0
    && days <= 60;
}

export function getFinderQuestions(answers) {
  const questions = [
    {
      id: 'passport',
      title: 'Which country issued your passport?',
      type: 'country_select',
      help: 'Your passport nationality determines which visa routes are available.',
    },
    {
      id: 'passportType',
      title: 'What type of passport do you have?',
      type: 'select',
      options: [
        { value: 'ordinary', label: 'Ordinary passport' },
        { value: 'diplomatic', label: 'Diplomatic passport' },
        { value: 'official', label: 'Official / service passport' },
        { value: 'other-document', label: 'Laissez-passer or another travel document' },
      ],
      help: 'e-Visa and Visa on Arrival require an ordinary passport. Other documents need a different route.',
    },
    {
      id: 'pakistanOrigin',
      title: 'Were you, a parent or a grandparent born in or permanently resident in Pakistan?',
      type: 'select',
      options: [
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Yes' },
        { value: 'unsure', label: 'I am not sure' },
      ],
      when: (state) => Boolean(state.passport) && state.passport !== 'Afghanistan',
      help: 'Pakistan-origin rules can require the regular visa route even when the current passport was issued elsewhere.',
    },
    {
      id: 'purpose',
      title: 'What is the main purpose of this trip?',
      type: 'select',
      options: PURPOSES,
      help: 'Different purposes use different categories and evidence. Employment is not an e-Visa purpose.',
    },
    {
      id: 'durationDays',
      title: 'How many days will you stay in India?',
      type: 'number',
      min: 1,
      max: 3650,
      suffix: 'days',
      help: 'Use the intended continuous stay, not the overall validity printed on a visa. Visa-on-Arrival is limited to 60 days.',
    },
    {
      id: 'studyInIndiaInstitution',
      title: 'Is the admitting institution registered on the Government Study in India programme?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
      when: (state) => state.purpose === 'study',
      help: 'The current portal includes e-Student routes, but eligibility depends on the recognised institution and course evidence.',
    },
    {
      id: 'uaePriorVisa',
      title: 'Have you previously obtained an Indian e-Visa or regular/paper visa?',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'unsure', label: 'I am not sure' },
      ],
      when: (state) => state.passport === 'United Arab Emirates' && VOA_PURPOSES.has(state.purpose),
      help: 'This is a specific condition for UAE citizens considering Visa-on-Arrival. First-time UAE visitors must use e-Visa or a regular visa.',
    },
    {
      id: 'voaArrivalPort',
      title: 'Will you arrive at one of these airports?',
      description: 'Bengaluru, Chennai, Delhi, Hyderabad, Kolkata or Mumbai.',
      type: 'select',
      options: [
        { value: 'designated', label: 'Yes' },
        { value: 'other', label: 'No' },
        { value: 'unsure', label: 'I have not decided' },
      ],
      when: isPotentialVoaJourney,
      help: 'Visa on Arrival is available only at these six airports.',
    },
    {
      id: 'voaIndiaResidenceOrOccupation',
      title: 'Do you have a residence or occupation in India?',
      type: 'select',
      options: [
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Yes' },
        { value: 'unsure', label: 'I am not sure' },
      ],
      when: isPotentialVoaJourney,
      help: 'The published Visa-on-Arrival facility is for travellers who do not have a residence or occupation in India.',
    },
    {
      id: 'voaAdmissibility',
      title: 'Are you free of any entry restrictions for India?',
      description: 'Answer Yes if you have not been declared persona non grata or an undesirable person by the Indian authorities.',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'unsure', label: 'I need official review' },
      ],
      when: isPotentialVoaJourney,
      help: 'An Immigration Officer makes the final decision. This finder cannot resolve immigration alerts or admissibility records.',
    },
    {
      id: 'travelReadiness',
      title: 'Are your passport and travel plans ready?',
      requirements: [
        'Passport valid for at least six months.',
        'Two blank passport pages for an e-Visa.',
        'A return or onward ticket.',
        'Enough money for accommodation, meals and travel throughout your stay. Official guidance specifies no fixed minimum balance.',
      ],
      source: { label: 'Official travel requirements', url: 'https://indianvisaonline.gov.in/evisa/tvoa.html' },
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
      help: 'These are published baseline conditions. Visa-on-Arrival also requires no residence or occupation in India and remains subject to assessment on arrival.',
    },
  ];

  return questions.filter((question) => !question.when || question.when(answers));
}

export function evaluateVisaRoute(answers) {
  const purpose = purposeByValue.get(answers.purpose);
  const days = Number(answers.durationDays);

  if (answers.hasOciCard === 'cardholder' || answers.purpose === 'oci-holder') {
    return recommendation({
      type: 'OCI Cardholder (Visa-Free Entry)',
      applicationType: 'oci_holder',
      visaCategory: 'oci',
      path: '/e-arrival',
      description: 'OCI cardholders enjoy lifelong multi-purpose entry to India without needing a visa. Simply carry your valid foreign passport and physical OCI card booklet.',
      rationale: [
        'You indicated holding a valid Overseas Citizen of India (OCI) card.',
        'OCI cardholders are exempt from Indian visa requirements for tourism, business, study, and residential stays.',
        'Ensure you complete the mandatory e-Arrival card within 72 hours of travel.',
      ],
      cautions: [
        'Carry your valid foreign passport along with your physical OCI booklet.',
        'OCI cardholders visiting protected/restricted areas (RAP/PAP) or conducting research/journalism require prior official permission.',
      ],
      actionLabel: 'Complete e-Arrival Card',
    });
  }

  if (answers.hasOciCard === 'apply_new' || answers.purpose === 'oci-apply') {
    if (answers.passport === 'Pakistan' || answers.passport === 'Bangladesh' || answers.pakistanOrigin === 'yes') {
      return regularRoute(
        'Applicants of Pakistani or Bangladeshi origin are not eligible for OCI registration under Section 7A of the Citizenship Act, 1955.',
        ['Persons who have ever been citizens of Pakistan or Bangladesh (or whose parents/grandparents held citizenship) must apply for a regular visa.'],
      );
    }
    return recommendation({
      type: 'OCI Card Application Guidance',
      applicationType: 'oci_applicant',
      visaCategory: 'oci',
      path: '/guide/oci',
      description: 'Foreign nationals of Indian origin, former Indian citizens, and eligible spouses/children can apply for lifelong Overseas Citizenship of India.',
      rationale: [
        'OCI provides multi-purpose, multiple-entry, lifelong visa-free travel to India.',
        'Applications are submitted online via the official MHA portal (ociservices.gov.in) and processed through your nearest Indian Mission/Post.',
        'Standard processing time is 4–8 weeks. If urgent travel is required, an interim e-Visa can be obtained.',
      ],
      cautions: [
        'Former Indian citizens must possess an official Surrender Certificate for their cancelled Indian passport before OCI approval.',
        'Foreign spouses must be in a registered marriage lasting at least 2 continuous years prior to submission.',
      ],
      actionLabel: 'View OCI Application Guide',
    });
  }

  if (answers.passport === 'Afghanistan') {
    return recommendation({
      type: 'Afghan online visa',
      applicationType: 'afghan',
      visaCategory: 'unselected',
      path: '/flow/afghan',
      description: 'Apply through the dedicated portal for Afghan nationals.',
      rationale: [
        'The Government portal publishes a separate Afghan-national route with its own categories and documents.',
        answers.passportType === 'ordinary'
          ? 'You selected an ordinary Afghan passport.'
          : 'Your passport type may be an edge case, so the dedicated portal or Indian Mission must confirm the route.',
      ],
      cautions: [
        'Choose among the dedicated Business, Student, Medical, Medical Attendant, Entry or UN Diplomat categories on the official service.',
      ],
      actionLabel: 'Review Afghan visa route',
    });
  }

  if (answers.passport === 'Pakistan') {
    return regularRoute(
      'Pakistani passport holders are directed to the regular visa process at an Indian Mission/Post.',
      ['You selected a Pakistan-issued passport; the standard e-Visa and Visa-on-Arrival routes do not apply.'],
    );
  }

  if (answers.pakistanOrigin !== 'no') {
    return regularRoute(
      'Pakistani-origin cases require the regular visa route or individual official review.',
      [answers.pakistanOrigin === 'yes'
        ? 'Your Pakistan birth, residence or ancestry connection requires an individual review.'
        : 'The Pakistan-origin question is unresolved, so this finder will not assert e-Visa eligibility.'],
    );
  }

  if (answers.passportType !== 'ordinary') {
    return regularRoute(
      'This passport or travel document requires a different visa route.',
      ['e-Visa and Visa-on-Arrival require an eligible ordinary passport.'],
    );
  }

  if (!purpose || purpose.value === 'employment' || purpose.value === 'other') {
    return regularRoute(
      purpose?.value === 'employment'
        ? 'Employment or paid work requires a regular visa.'
        : 'This purpose needs category-specific review and should not be guessed by an automated finder.',
      [`Trip purpose: ${purpose?.label || 'not confirmed'}.`],
    );
  }

  if (answers.travelReadiness !== 'yes') {
    return regularRoute(
      'The baseline passport or travel-readiness conditions are not confirmed.',
      [answers.travelReadiness === 'no'
        ? 'At least one published passport validity, blank-page, onward-travel or funds condition is not met.'
        : 'The baseline conditions are uncertain, so this finder will not assert online eligibility.'],
      ['Resolve passport validity and travel-document requirements before making any non-refundable booking or payment.'],
    );
  }

  if (answers.purpose === 'study' && answers.studyInIndiaInstitution !== 'yes') {
    return regularRoute(
      'Confirm your institution’s Study in India registration before applying for an e-Student visa.',
      [answers.studyInIndiaInstitution === 'no'
        ? 'You indicated that the institution is not registered on Study in India.'
        : 'The institution registration is unconfirmed.'],
      ['Study is not automatically a paper-visa case; verify the institution and course on the official services first.'],
    );
  }

  const canUseVoa = isPotentialVoaJourney(answers)
    && answers.voaArrivalPort === 'designated'
    && answers.voaIndiaResidenceOrOccupation === 'no'
    && answers.voaAdmissibility === 'yes'
    && (answers.passport !== 'United Arab Emirates' || answers.uaePriorVisa === 'yes');

  if (canUseVoa) {
    return recommendation({
      type: 'Visa on Arrival',
      applicationType: 'voa',
      visaCategory: purpose.evisaCategory,
      path: '/flow/voa',
      description: 'You may qualify for a visa at the airport. Indian immigration makes the final decision on arrival.',
      rationale: [
        `${answers.passport} is one of the three published Visa-on-Arrival nationalities.`,
        `${purpose.label} is a permitted purpose and ${days} ${days === 1 ? 'day is' : 'days are'} within the 60-day maximum.`,
        'You selected a designated Visa-on-Arrival airport and confirmed the baseline travel conditions.',
        'You confirmed no residence or occupation in India and no known adverse-admissibility exclusion.',
        ...(answers.passport === 'United Arab Emirates'
          ? ['You confirmed a previous Indian e-Visa or regular/paper visa.']
          : []),
      ],
      cautions: [
        'Bring a completed Annexure I form and submit your e-Arrival Card within 72 hours before arrival.',
      ],
      actionLabel: 'Prepare for arrival',
    });
  }

  if (!Number.isFinite(days) || days < 1 || days > purpose.finderStayLimitDays) {
    return regularRoute(
      'The intended continuous stay is outside the conservative limit used by this finder for the selected online category.',
      [`You entered ${Number.isFinite(days) ? `${days} days` : 'an invalid duration'}; the limit used here for ${purpose.label.toLowerCase()} is ${purpose.finderStayLimitDays} days.`],
      ['Visa validity and permitted continuous stay are different. Ask the official service or an Indian Mission/Post to confirm the correct category.'],
    );
  }

  if (!EVISA_ELIGIBLE_NATIONALITIES.has(answers.passport)) {
    return regularRoute(
      'We could not confirm e-Visa eligibility for this passport.',
      [`${answers.passport} was not found in the e-Visa nationality list used by this finder.`],
      [],
    );
  }

  const voaFallback = [];
  if (isPotentialVoaJourney(answers)) {
    if (answers.passport === 'United Arab Emirates' && answers.uaePriorVisa !== 'yes') {
      voaFallback.push('Visa-on-Arrival is unavailable to a first-time or unconfirmed UAE visitor, so the online route is the safer recommendation.');
    }
    if (answers.voaArrivalPort !== 'designated') {
      voaFallback.push('Visa on Arrival requires entry through one of the six designated airports.');
    }
    if (answers.voaIndiaResidenceOrOccupation !== 'no' || answers.voaAdmissibility !== 'yes') {
      voaFallback.push('The Visa-on-Arrival residence/occupation or admissibility conditions are not fully confirmed.');
    }
  } else if (VOA_NATIONALITIES.has(answers.passport) && VOA_PURPOSES.has(answers.purpose) && days > 60) {
    voaFallback.push(`${days} days exceeds the exact 60-day Visa-on-Arrival limit.`);
  }

  return recommendation({
    type: purpose.value === 'study' ? 'e-Student visa' : 'e-Visa',
    applicationType: 'evisa',
    visaCategory: purpose.evisaCategory,
    path: '/flow/normal',
    description: 'You can apply online for this trip. Check the current requirements on the official portal before applying.',
    rationale: [
      `${answers.passport} is listed as an eligible e-Visa nationality.`,
      `${purpose.label} uses the ${purpose.value === 'study' ? 'e-Student' : `e-${purpose.evisaCategory}`} category.`,
      ...voaFallback,
    ],
    cautions: [],
    actionLabel: 'Continue with e-Visa',
  });
}
