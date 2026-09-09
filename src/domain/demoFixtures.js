import { afghanPurposes } from './applicationForm.js';

export const demoFixture = (type, current = {}) => {
  const futureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };
  const nationality = current.nationality || (type === 'afghan' ? 'Afghanistan' : type === 'voa' ? 'Japan' : 'Canada');
  const countryOfBirth = current.country_of_birth || (type === 'afghan' ? 'Afghanistan' : nationality);
  const countryOfApp = current.country_of_application || nationality;

  const common = {
    surname: current.surname || 'MORGAN',
    given_name: current.given_name || 'ALEX',
    date_of_birth: current.date_of_birth || '1992-05-14',
    previous_name_used: current.previous_name_used || 'no',
    gender: current.gender || 'unspecified',
    place_of_birth: current.place_of_birth || 'Example City',
    country_of_birth: countryOfBirth,
    national_id: current.national_id || 'NA',
    religion: current.religion || 'Not specified',
    visible_mark: current.visible_mark || 'NA',
    education: current.education || 'Graduate',
    nationality_acquisition: current.nationality_acquisition || 'birth',
    passport_number: current.passport_number || 'P1234567',
    passport_issue_place: current.passport_issue_place || 'Example City',
    passport_issue_date: current.passport_issue_date || '2024-01-15',
    passport_expiry_date: current.passport_expiry_date || '2034-01-14',
    other_passport: current.other_passport || 'no',
    present_address: current.present_address || `100 Example Street, ${nationality}`,
    postal_code: current.postal_code || '000000',
    phone_abroad: current.phone_abroad || '+10000000000',
    permanent_same: current.permanent_same || 'yes',
    father_details: current.father_details || `JAMES MORGAN; ${nationality}; City`,
    mother_details: current.mother_details || `SARAH MORGAN; ${nationality}; City`,
    marital_status: current.marital_status || 'single',
    pakistan_origin: current.pakistan_origin || 'no',
    occupation: current.occupation || 'Software tester',
    designation: current.designation || 'Test analyst',
    employer_name: current.employer_name || 'Example Studio',
    employer_address: current.employer_address || `200 Sample Road, ${nationality}`,
    employer_phone: current.employer_phone || '+10000000001',
    security_service_employment: current.security_service_employment || 'no',
    places_to_visit: current.places_to_visit || 'Delhi and Agra',
    tour_operator_used: current.tour_operator_used || 'no',
    intended_exit_port: current.intended_exit_port || 'Delhi',
    visited_india_before: current.visited_india_before || 'no',
    india_refused_before: current.india_refused_before || 'no',
    countries_visited_10y: current.countries_visited_10y || 'None',
    visited_saarc: current.visited_saarc || 'no',
    india_reference: current.india_reference || 'Central Hotel, Example Road, Delhi; +910000000000',
    home_reference: current.home_reference || `Home Contact, 100 Example Street; +10000000002`,
    security_arrested: current.security_arrested || 'no',
    security_refused: current.security_refused || 'no',
    security_offences: current.security_offences || 'no',
    security_national_security: current.security_national_security || 'no',
    security_advocacy: current.security_advocacy || 'no',
    security_asylum: current.security_asylum || 'no',
    email: current.email || 'alex.morgan@example.invalid',
    confirm_email: current.confirm_email || current.email || 'alex.morgan@example.invalid',
    expected_arrival_date: current.expected_arrival_date || futureDate(45),
    instructions_ready: current.instructions_ready !== undefined ? current.instructions_ready : true,
    resident_two_years: current.resident_two_years || 'yes',
  };
  if (type === 'voa') return {
    application_type: 'voa',
    nationality: nationality,
    visa_category: current.visa_category || 'tourism',
    intended_stay_days: current.intended_stay_days || '14',
    passport_type: current.passport_type || 'ordinary',
    no_india_residence_occupation: current.no_india_residence_occupation !== undefined ? current.no_india_residence_occupation : true,
    onward_ticket_confirmed: current.onward_ticket_confirmed !== undefined ? current.onward_ticket_confirmed : true,
    sufficient_funds_confirmed: current.sufficient_funds_confirmed !== undefined ? current.sufficient_funds_confirmed : true,
    uae_previous_indian_visa: current.uae_previous_indian_visa || (nationality === 'United Arab Emirates' ? 'yes' : 'not_applicable'),
    pakistan_origin: current.pakistan_origin || 'no',
    persona_non_grata: current.persona_non_grata || 'no',
    undesirable_person: current.undesirable_person || 'no',
    surname: current.surname || 'TANAKA',
    given_name: current.given_name || 'YUKI',
    date_of_birth: current.date_of_birth || '1992-05-14',
    previous_nationality: current.previous_nationality || 'NA',
    dual_nationality: current.dual_nationality || 'no',
    marital_status: current.marital_status || 'single',
    father_details: current.father_details || `KENJI TANAKA; ${nationality}`,
    mother_details: current.mother_details || `AKIKO TANAKA; ${nationality}`,
    occupation: current.occupation || 'Designer',
    passport_number: current.passport_number || 'TR1234567',
    passport_expiry_date: current.passport_expiry_date || '2034-01-14',
    permanent_address: current.permanent_address || `100 Example Street, ${nationality}`,
    email: current.email || 'yuki.tanaka@example.invalid',
    phone_abroad: current.phone_abroad || '+81000000000',
    address_in_india: current.address_in_india || 'Central Hotel, Delhi',
    phone_india: current.phone_india || '+910000000000',
    india_reference: current.india_reference || 'Central Hotel, Example Road, Delhi; +910000000000',
    arrival_date: current.arrival_date || futureDate(45),
    arrival_flight: current.arrival_flight || 'AI101',
    arrival_port: current.arrival_port || 'Delhi',
    onward_date: current.onward_date || futureDate(59),
    onward_flight: current.onward_flight || 'AI102',
    final_destination: current.final_destination || nationality,
    declaration_place: current.declaration_place || nationality,
    declaration_date: current.declaration_date || futureDate(1),
    typed_name: current.typed_name || 'YUKI TANAKA',
    voa_truthful: current.voa_truthful !== undefined ? current.voa_truthful : true,
    voa_airport_process: current.voa_airport_process !== undefined ? current.voa_airport_process : true,
    voa_nonextendable: current.voa_nonextendable !== undefined ? current.voa_nonextendable : true,
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
      tazkira_number: current.tazkira_number || '123456789',
      address_in_india: current.address_in_india || 'Hospital Guest House, Delhi',
      principal_applicant_id: category === 'medical-attendant' || ['business-dependant', 'student-dependant'].includes(purpose) ? (current.principal_applicant_id || 'VS2026A00001') : current.principal_applicant_id,
      is_minor: current.is_minor || 'no',
    };
  }
  if (type === 'regular') return {
    ...common,
    application_type: 'regular',
    nationality: nationality,
    country_of_application: countryOfApp,
    passport_type: current.passport_type || 'ordinary',
    visa_category: current.visa_category || 'employment'
  };
  if (type === 'oci') {
    const ociCat = current.oci_category || 'former-indian';
    const isSpouse = ociCat === 'foreign-spouse';
    const isDescendant = ['descendant-child', 'descendant-grandchild'].includes(ociCat);
    const country = current.country_of_application || current.nationality || 'Canada';

    return {
      ...common,
      application_type: 'oci',
      oci_category: ociCat,
      is_minor: current.is_minor || 'no',
      country_of_application: country,
      application_center: current.application_center || 'High Commission of India, Ottawa',
      email: current.email || 'alex.morgan@example.invalid',
      phone: current.phone || '+16135550199',

      surname: current.surname || 'MORGAN',
      given_name: current.given_name || 'ALEX',
      previous_name_used: current.previous_name_used || 'no',
      previous_name: current.previous_name || '',
      gender: current.gender && ['male', 'female', 'other'].includes(current.gender) ? current.gender : 'male',
      date_of_birth: current.date_of_birth || '1992-05-14',
      place_of_birth: current.place_of_birth || (isDescendant ? 'Toronto' : 'Mumbai'),
      country_of_birth: current.country_of_birth || (isDescendant ? country : 'India'),
      marital_status: current.marital_status || (isSpouse ? 'married' : 'single'),
      occupation: current.occupation || 'Software Engineer',
      visible_mark: current.visible_mark || 'Mole on right cheek',

      nationality: current.nationality || country,
      passport_number: current.passport_number || 'CAN9876543',
      passport_issue_place: current.passport_issue_place || 'Ottawa',
      passport_issue_date: current.passport_issue_date || '2023-05-10',
      passport_expiry_date: current.passport_expiry_date || '2033-05-09',
      foreign_citizenship_date: current.foreign_citizenship_date || '2022-01-15',
      foreign_citizenship_mode: current.foreign_citizenship_mode || (isDescendant ? 'birth' : 'naturalization'),
      naturalization_cert_no: current.naturalization_cert_no || (isDescendant ? 'NA' : 'CAN-NAT-2022-9988'),

      father_name: current.father_name || 'RAJESH MORGAN',
      father_nationality: current.father_nationality || (isDescendant ? country : 'India'),
      father_former_indian: current.father_former_indian || 'yes',
      mother_name: current.mother_name || 'PRIYA MORGAN',
      mother_nationality: current.mother_nationality || (isDescendant ? country : 'India'),
      mother_former_indian: current.mother_former_indian || 'yes',
      spouse_name: current.spouse_name || (isSpouse ? 'PRIYA SHARMA' : ''),
      spouse_nationality: current.spouse_nationality || (isSpouse ? 'India' : ''),
      spouse_oci_or_indian: current.spouse_oci_or_indian || (isSpouse ? 'yes' : 'na'),
      marriage_date: current.marriage_date || (isSpouse ? '2020-06-18' : ''),

      basis_of_origin: current.basis_of_origin || (ociCat === 'former-indian' ? 'self-former-indian' : isSpouse ? 'foreign-spouse-basis' : ociCat === 'descendant-grandchild' ? 'grandparent-origin' : 'parent-origin'),
      previous_indian_passport: current.previous_indian_passport || (ociCat === 'former-indian' ? 'Z1234567' : 'NA'),
      surrender_cert_number: current.surrender_cert_number || (ociCat === 'former-indian' ? 'SC/OTT/2022/9941' : 'NA'),
      ancestor_name_details: current.ancestor_name_details || (isDescendant ? 'Father Mr. Rajesh Morgan born in New Delhi in 1965, Indian Passport No: A8765432' : ''),
      permanent_address: current.permanent_address || `100 Example Street, Ottawa, ON, ${country}`,

      pakistan_origin: current.pakistan_origin || 'no',
      military_service: current.military_service || 'no',
      military_details: current.military_details || '',
      prior_criminal_offense: current.prior_criminal_offense || 'no',

      review_accuracy: current.review_accuracy !== undefined ? current.review_accuracy : true,
    };
  }
  return {
    ...common,
    application_type: 'evisa',
    nationality: nationality,
    country_of_application: countryOfApp,
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
