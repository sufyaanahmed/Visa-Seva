import { EVISA_CATEGORIES } from "../data/visaEligibilityRules.js";
import { getRequiredDocuments } from "./documentRequirements.js";

export const field = (
  name,
  label,
  type = "text",
  options = null,
  extra = {},
) => ({
  name,
  label,
  type,
  options,
  required: true,
  ...extra,
});
const yesNo = ["yes", "no"];
const passportTypes = [
  "ordinary",
  "diplomatic",
  "official",
  "service",
  "other",
];
const voaAirports = [
  "Bangalore",
  "Chennai",
  "Delhi",
  "Hyderabad",
  "Kolkata",
  "Mumbai",
];

const securityFields = [
  field(
    "security_arrested",
    "Have you ever been arrested, prosecuted, or convicted by a court?",
    "select",
    yesNo,
  ),
  field(
    "security_refused",
    "Have you ever been refused entry, deported, or ordered to leave any country?",
    "select",
    yesNo,
  ),
  field(
    "security_offences",
    "Have you been involved in trafficking, drugs, child abuse, or economic/financial offences?",
    "select",
    yesNo,
  ),
  field(
    "security_national_security",
    "Have you been involved in cybercrime, terrorism, sabotage, espionage, genocide, political killing, or violence?",
    "select",
    yesNo,
  ),
  field(
    "security_advocacy",
    "Have you advocated or supported terrorist violence?",
    "select",
    yesNo,
  ),
  field(
    "security_asylum",
    "Have you sought asylum in any country?",
    "select",
    yesNo,
  ),
  field(
    "security_details",
    "Details for every “Yes” answer",
    "textarea",
    null,
    {
      required: (data) =>
        Object.entries(data).some(
          ([key, value]) =>
            key.startsWith("security_") &&
            key !== "security_details" &&
            value === "yes",
        ),
      visible: (data) =>
        Object.entries(data).some(
          ([key, value]) =>
            key.startsWith("security_") &&
            key !== "security_details" &&
            value === "yes",
        ),
    },
  ),
];

const identityFields = [
  field("surname", "Surname / family name exactly as in passport"),
  field("given_name", "Given name(s) exactly as in passport"),
  field("previous_name_used", "Have you used another name?", "select", yesNo),
  field("previous_name", "Previous name(s)", "text", null, {
    visible: (data) => data.previous_name_used === "yes",
  }),
  field("gender", "Gender", "select", [
    "female",
    "male",
    "non-binary",
    "unspecified",
  ]),
  field("date_of_birth", "Date of birth", "date"),
  field("place_of_birth", "Place of birth"),
  field("country_of_birth", "Country of birth"),
  field(
    "national_id",
    "National identity number (enter NA only where the official form permits)",
  ),
  field("religion", "Religion"),
  field("visible_mark", "Visible identification mark (or NA)"),
  field("education", "Educational qualification"),
  field("nationality_acquisition", "Nationality acquired by", "select", [
    "birth",
    "naturalisation",
  ]),
];

const passportFields = [
  field("passport_number", "Passport number"),
  field("passport_issue_place", "Place of issue"),
  field("passport_issue_date", "Date of issue", "date"),
  field("passport_expiry_date", "Date of expiry", "date"),
  field(
    "other_passport",
    "Do you hold another passport or identity certificate?",
    "select",
    yesNo,
  ),
  field(
    "other_passport_details",
    "Other passport: country, number, issue place/date, nationality and status",
    "textarea",
    null,
    { visible: (data) => data.other_passport === "yes" },
  ),
];

const addressFamilyFields = [
  field("present_address", "Present residential address", "textarea"),
  field("postal_code", "Postal code"),
  field("phone_abroad", "Contact number"),
  field("permanent_same", "Permanent address is the same", "select", yesNo),
  field("permanent_address", "Permanent address", "textarea", null, {
    visible: (data) => data.permanent_same === "no",
  }),
  field(
    "father_details",
    "Father: name, current/previous nationality, place and country of birth",
    "textarea",
  ),
  field(
    "mother_details",
    "Mother: name, current/previous nationality, place and country of birth",
    "textarea",
  ),
  field("marital_status", "Marital status", "select", [
    "single",
    "married",
    "divorced",
    "widowed",
    "other",
  ]),
  field(
    "spouse_details",
    "Spouse: name, current/previous nationality, place and country of birth",
    "textarea",
    null,
    { visible: (data) => data.marital_status === "married" },
  ),
  field(
    "pakistan_origin",
    "Were you, a parent, or grandparent born in or permanently resident in Pakistan / Pakistan-held territory?",
    "select",
    yesNo,
  ),
  field(
    "pakistan_origin_details",
    "Pakistan-origin details",
    "textarea",
    null,
    { visible: (data) => data.pakistan_origin === "yes" },
  ),
];

const employmentFields = [
  field("occupation", "Present occupation"),
  field("designation", "Designation / position"),
  field("employer_name", "Employer or institution name"),
  field("employer_address", "Employer or institution address", "textarea"),
  field("employer_phone", "Employer phone"),
  field(
    "security_service_employment",
    "Have you served in military, police, or a security organisation?",
    "select",
    yesNo,
  ),
  field(
    "security_service_details",
    "Organisation, designation, rank, place, and service dates",
    "textarea",
    null,
    { visible: (data) => data.security_service_employment === "yes" },
  ),
];

const historyReferenceFields = [
  field("places_to_visit", "Places to visit in India"),
  field("places_to_visit_second", "Additional places to visit", "text", null, {
    required: false,
  }),
  field(
    "tour_operator_used",
    "Is this arranged through a hotel or tour operator?",
    "select",
    yesNo,
  ),
  field(
    "tour_operator_details",
    "Hotel / tour operator name, address and contact",
    "textarea",
    null,
    { visible: (data) => data.tour_operator_used === "yes" },
  ),
  field("intended_exit_port", "Intended exit port"),
  field(
    "visited_india_before",
    "Have you visited India before?",
    "select",
    yesNo,
  ),
  field(
    "previous_india_details",
    "Previous India address, cities, visa number/type, issue place/date",
    "textarea",
    null,
    { visible: (data) => data.visited_india_before === "yes" },
  ),
  field(
    "india_refused_before",
    "Have you been refused permission to visit India or extend a stay?",
    "select",
    yesNo,
  ),
  field(
    "india_refusal_details",
    "Refusal / extension-denial details",
    "textarea",
    null,
    { visible: (data) => data.india_refused_before === "yes" },
  ),
  field(
    "countries_visited_10y",
    "Countries visited in the last 10 years (or None)",
  ),
  field(
    "visited_saarc",
    "Visited another SAARC country in the last 3 years?",
    "select",
    yesNo,
  ),
  field(
    "saarc_details",
    "SAARC country, year, and number of visits",
    "textarea",
    null,
    { visible: (data) => data.visited_saarc === "yes" },
  ),
  field(
    "india_reference",
    "Reference in India: name, address, and phone",
    "textarea",
  ),
  field(
    "home_reference",
    "Reference in home country: name, address, and phone",
    "textarea",
  ),
];

export const afghanPurposes = {
  business: [
    "business-venture-investor",
    "other-business",
    "sports",
    "business-dependant",
  ],
  student: [
    "iccr-scholarship",
    "new-structured-study",
    "returning-student",
    "student-dependant",
  ],
  medical: ["patient"],
  "medical-attendant": ["accompanying-patient"],
  entry: [
    "cultural-visit",
    "minor-with-patient",
    "indian-pio-oci-family",
    "property-owner",
    "official-dependant",
    "student-guardian",
    "dependent-parent-of-student",
    "seaman",
    "pio-without-oci-family",
    "minority-community-visit",
  ],
  "un-diplomat": [
    "assigned-to-india",
    "visiting-india",
    "dependant-of-assigned-diplomat",
    "dependant-of-visiting-diplomat",
  ],
};

const makeEvisaSteps = () => [
  {
    id: "registration",
    title: "Registration & Route",
    description:
      "Enter your registration details, passport category, and arrival port to initialize your application.",
    fields: [
      field("nationality", "Passport nationality", "text", null, {
        readOnly: true,
      }),
      field("passport_type", "Passport type", "select", passportTypes),
      field("arrival_port", "Arrival checkpoint", "text", null, {
        help: "The official portal requires arrival via designated international checkpoints. Select your intended entry port.",
      }),
      field("email", "Email address", "email"),
      field("confirm_email", "Re-enter email address", "email"),
      field("expected_arrival_date", "Expected arrival date", "date"),
      field("visa_category", "e-Visa category", "select", EVISA_CATEGORIES, {
        readOnly: true,
      }),
      field(
        "student_course_type",
        "e-Student course type",
        "select",
        ["general-course", "medical-paramedical"],
        {
          visible: (data) => data.visa_category === "student",
          help: "Medical and paramedical courses can require an additional Ministry approval or NOC.",
        },
      ),
      field(
        "instructions_ready",
        "I have reviewed current official eligibility and have the required documents",
        "checkbox",
      ),
    ],
  },
  {
    id: "identity",
    title: "Identity",
    fields: [
      ...identityFields,
      field(
        "resident_two_years",
        "Have you lived in the application country for at least two years?",
        "select",
        yesNo,
      ),
    ],
  },
  { id: "passport", title: "Passport", fields: passportFields },
  { id: "family", title: "Address & family", fields: addressFamilyFields },
  { id: "employment", title: "Employment", fields: employmentFields },
  {
    id: "travel",
    title: "Travel, history & references",
    fields: historyReferenceFields,
  },
  { id: "security", title: "Security questions", fields: securityFields },
  {
    id: "documents",
    title: "Photo & documents",
    description:
      "Please ensure your photograph is a square JPEG (10 KB – 1 MB). All other supporting documents must be in PDF format (10 KB – 300 KB) and in English.",
  },
  { id: "review", title: "Review & Submission" },
];

const makeAfghanSteps = (data) => [
  {
    id: "afghan-route",
    title: "Afghan category & purpose",
    description:
      "Dedicated online visa and travel authorization application route for Afghan passport holders.",
    fields: [
      field("nationality", "Nationality", "text", null, { readOnly: true }),
      field("passport_type", "Passport type", "select", passportTypes, {
        help: "Diplomatic-passport edge cases need verification; UN Diplomat is a visa category, not a passport type.",
      }),
      field("visa_category", "Afghan visa category", "select", [
        "business",
        "student",
        "medical",
        "medical-attendant",
        "entry",
        "un-diplomat",
      ]),
      field(
        "afghan_purpose",
        "Official category purpose / subtype",
        "select",
        afghanPurposes[data.visa_category] || [],
      ),
      field("email", "Email address", "email"),
    ],
  },
  {
    id: "identity",
    title: "Applicant identity",
    fields: [...identityFields, field("tazkira_number", "Tazkira number")],
  },
  { id: "passport", title: "Passport", fields: passportFields },
  { id: "family", title: "Address & family", fields: addressFamilyFields },
  {
    id: "employment",
    title: "Employment / study context",
    fields: employmentFields,
  },
  {
    id: "travel",
    title: "Travel & references",
    fields: [
      field("expected_arrival_date", "Expected arrival date", "date"),
      field("places_to_visit", "Places to visit in India"),
      field("address_in_india", "Address in India", "textarea"),
      field(
        "india_reference",
        "Reference in India: name, address and phone",
        "textarea",
      ),
      field(
        "home_reference",
        "Reference in Afghanistan / residence country: name, address and phone",
        "textarea",
      ),
      field(
        "principal_applicant_id",
        "Principal patient/student/business applicant reference",
        "text",
        null,
        {
          required: (values) =>
            values.visa_category === "medical-attendant" ||
            ["business-dependant", "student-dependant"].includes(
              values.afghan_purpose,
            ),
          visible: (values) =>
            values.visa_category === "medical-attendant" ||
            ["business-dependant", "student-dependant"].includes(
              values.afghan_purpose,
            ),
        },
      ),
      field("is_minor", "Is the applicant a minor?", "select", yesNo),
    ],
  },
  { id: "security", title: "Security declarations", fields: securityFields },
  {
    id: "documents",
    title: "Required evidence",
    description:
      "Upload a clear photograph (JPEG/JPG) and all required supporting documents in PDF format.",
  },
  { id: "review", title: "Final review" },
];

const makeVoaSteps = () => [
  {
    id: "voa-applicant",
    title: "Annexure I: applicant",
    fields: [
      field("surname", "Surname / family name"),
      field("given_name", "Given name(s)"),
      field("date_of_birth", "Date of birth", "date"),
      field("previous_nationality", "Previous nationality (or NA)"),
      field(
        "dual_nationality",
        "Do you hold another nationality?",
        "select",
        yesNo,
      ),
      field(
        "dual_nationality_details",
        "Other / dual nationality details",
        "textarea",
        null,
        { visible: (data) => data.dual_nationality === "yes" },
      ),
      field("marital_status", "Marital status", "select", [
        "single",
        "married",
        "divorced",
        "widowed",
        "other",
      ]),
      field("father_details", "Father name and nationality", "textarea"),
      field("mother_details", "Mother name and nationality", "textarea"),
      field("spouse_details", "Spouse name and nationality", "textarea", null, {
        visible: (data) => data.marital_status === "married",
      }),
      field("occupation", "Occupation"),
    ],
  },
  {
    id: "voa-passport",
    title: "Annexure I: passport & contacts",
    fields: [
      field("passport_number", "Passport number"),
      field("passport_expiry_date", "Passport expiry date", "date"),
      field("permanent_address", "Permanent address abroad", "textarea"),
      field("email", "Email address", "email"),
      field("phone_abroad", "Contact number abroad"),
      field("address_in_india", "Address in India", "textarea"),
      field("phone_india", "Contact number in India"),
      field(
        "india_reference",
        "Reference in India: name, address and phone",
        "textarea",
      ),
    ],
  },
  {
    id: "voa-travel",
    title: "Annexure I: travel",
    fields: [
      field("arrival_date", "Arrival date", "date"),
      field("arrival_flight", "Arrival flight number"),
      field(
        "arrival_port",
        "Designated arrival airport",
        "select",
        voaAirports,
      ),
      field("onward_date", "Return / onward date", "date"),
      field("onward_flight", "Return / onward flight number"),
      field("final_destination", "Final destination"),
    ],
  },
  {
    id: "voa-declaration",
    title: "Annexure I: declaration",
    description:
      "The generated copy must still be printed and signed for presentation to the Visa Officer.",
    fields: [
      field("declaration_place", "Place of declaration"),
      field("declaration_date", "Date of declaration", "date"),
      field("typed_name", "Applicant name for the prepared form"),
      field(
        "voa_truthful",
        "I declare that these details are true and complete",
        "checkbox",
      ),
      field(
        "voa_airport_process",
        "I understand this prepares a form only; a Visa Officer assesses the request at the airport",
        "checkbox",
      ),
      field(
        "voa_nonextendable",
        "I understand a granted VoA is non-extendable and non-convertible",
        "checkbox",
      ),
    ],
  },
  { id: "review", title: "Review & print preparation" },
];

const makeRegularSteps = () => [
  {
    id: "regular-route",
    title: "Paper visa route",
    description:
      "Choose your visa category and the country where you will apply.",
    fields: [
      field("nationality", "Passport nationality"),
      field("country_of_application", "Country / mission where applying"),
      field("passport_type", "Passport type", "select", passportTypes),
      field("visa_category", "Paper visa category", "select", [
        "tourist",
        "business",
        "employment",
        "student",
        "medical",
        "conference",
        "entry",
        "transit",
        "research",
        "other",
      ]),
      field("email", "Email address", "email"),
    ],
  },
  { id: "identity", title: "Identity", fields: identityFields },
  { id: "passport", title: "Passport", fields: passportFields },
  {
    id: "family",
    title: "Address, family & employment",
    fields: [...addressFamilyFields, ...employmentFields],
  },
  {
    id: "travel",
    title: "Travel & references",
    fields: [
      field("expected_arrival_date", "Expected arrival date", "date"),
      ...historyReferenceFields,
    ],
  },
  { id: "security", title: "Security declarations", fields: securityFields },
  {
    id: "documents",
    title: "Document Readiness",
    description:
      "Upload the required documents for verification and consular submission checklist.",
  },
  { id: "review", title: "Review & print handoff" },
];

export const ociCategoryOptions = [
  "former-indian",
  "descendant-child",
  "descendant-grandchild",
  "foreign-spouse",
];

const ociCategoryFields = [
  field("oci_category", "OCI Qualifying Category", "select", ociCategoryOptions, {
    help: "Choose whether you are applying as a former Indian citizen, descendant of Indian origin, or foreign spouse.",
  }),
  field("is_minor", "Is the applicant a minor child?", "select", yesNo),
  field("country_of_application", "Country / jurisdiction where applying"),
  field("application_center", "Nearest Indian Mission / VFS Consular Center"),
  field("email", "Contact Email address", "email"),
  field("phone", "Contact Phone number"),
];

const ociIdentityFields = [
  field("surname", "Surname / Family Name"),
  field("given_name", "Given Name(s)"),
  field("previous_name_used", "Have you ever changed your name?", "select", yesNo),
  field("previous_name", "Previous Name / Maiden Name", "text", null, {
    visible: (data) => data.previous_name_used === "yes",
  }),
  field("gender", "Gender", "select", ["male", "female", "other"]),
  field("date_of_birth", "Date of Birth", "date"),
  field("place_of_birth", "Place / City of Birth"),
  field("country_of_birth", "Country of Birth"),
  field("marital_status", "Marital Status", "select", [
    "single",
    "married",
    "divorced",
    "widowed",
    "other",
  ]),
  field("occupation", "Current Profession / Occupation"),
  field("visible_mark", "Visible distinguishing mark (e.g. mole, scar, or NA)"),
];

const ociPassportFields = [
  field("nationality", "Current Foreign Nationality / Passport Country"),
  field("passport_number", "Current Foreign Passport Number"),
  field("passport_issue_place", "Passport Place of Issue"),
  field("passport_issue_date", "Passport Issue Date", "date"),
  field("passport_expiry_date", "Passport Expiry Date", "date"),
  field("foreign_citizenship_date", "Date Foreign Citizenship Acquired", "date"),
  field("foreign_citizenship_mode", "Mode of Acquisition of Foreign Citizenship", "select", [
    "birth",
    "naturalization",
    "registration",
    "descent",
  ]),
  field("naturalization_cert_no", "Naturalization Certificate / Registration No."),
];

const ociFamilyFields = [
  field("father_name", "Father's Full Name"),
  field("father_nationality", "Father's Current Nationality"),
  field("father_former_indian", "Was father an Indian citizen / of Indian origin?", "select", yesNo),
  field("mother_name", "Mother's Full Name"),
  field("mother_nationality", "Mother's Current Nationality"),
  field("mother_former_indian", "Was mother an Indian citizen / of Indian origin?", "select", yesNo),
  field("spouse_name", "Spouse's Full Name", "text", null, {
    visible: (data) => data.marital_status === "married",
  }),
  field("spouse_nationality", "Spouse's Nationality", "text", null, {
    visible: (data) => data.marital_status === "married",
  }),
  field("spouse_oci_or_indian", "Is spouse an Indian Citizen or OCI cardholder?", "select", ["yes", "no", "na"], {
    visible: (data) => data.marital_status === "married",
  }),
  field("marriage_date", "Date of Marriage Registration", "date", null, {
    visible: (data) => data.marital_status === "married" || data.oci_category === "foreign-spouse",
  }),
];

const ociOriginFields = [
  field("basis_of_origin", "Basis on which OCI is claimed", "select", [
    "self-former-indian",
    "parent-origin",
    "grandparent-origin",
    "great-grandparent-origin",
    "foreign-spouse-basis",
  ]),
  field("previous_indian_passport", "Previous Indian Passport Number (or NA)"),
  field("surrender_cert_number", "Surrender Certificate Number (for former citizens)", "text", null, {
    visible: (data) => data.oci_category === "former-indian" || data.basis_of_origin === "self-former-indian",
  }),
  field("ancestor_name_details", "Ancestor's Name & Indian Connection details", "textarea", null, {
    visible: (data) => ["descendant-child", "descendant-grandchild"].includes(data.oci_category) || ["parent-origin", "grandparent-origin", "great-grandparent-origin"].includes(data.basis_of_origin),
  }),
  field("permanent_address", "Current Residential Address in Foreign Country", "textarea"),
];

const ociSecurityFields = [
  field("pakistan_origin", "Were you, your parents or grandparents ever citizens of Pakistan or Bangladesh?", "select", yesNo),
  field("military_service", "Have you ever served in military / police / security forces?", "select", yesNo),
  field("military_details", "Organization, rank and service details", "textarea", null, {
    visible: (data) => data.military_service === "yes",
  }),
  field("prior_criminal_offense", "Have you ever been convicted of a criminal offense?", "select", yesNo),
];

const makeOciSteps = (data = {}) => [
  {
    id: "oci-category",
    title: "OCI Registration & Category",
    description: "Select your OCI qualifying category and consular jurisdiction.",
    fields: ociCategoryFields,
  },
  {
    id: "identity",
    title: "Applicant Identity",
    description: "Enter your personal details exactly as appearing on your passport.",
    fields: ociIdentityFields,
  },
  {
    id: "passport",
    title: "Passport & Foreign Citizenship",
    description: "Provide your current valid foreign passport and citizenship details.",
    fields: ociPassportFields,
  },
  {
    id: "family",
    title: "Family & Lineage",
    description: "Enter parental, family, and spousal particulars.",
    fields: ociFamilyFields,
  },
  {
    id: "origin",
    title: "Indian Origin & Renunciation",
    description: "Details of previous Indian citizenship or ancestral lineage.",
    fields: ociOriginFields,
  },
  {
    id: "security",
    title: "Security & Declarations",
    description: "Mandatory statutory declarations under Section 7A of the Citizenship Act, 1955.",
    fields: ociSecurityFields,
  },
  {
    id: "documents",
    title: "Photo, Signature & Evidence",
    description: "Upload your photograph, signature / thumb impression, and required evidence PDFs.",
  },
  {
    id: "review",
    title: "Review & MHA Application Dossier",
    description: "Verify all Part-A and Part-B details before generating your submission package.",
  },
];

export const getSteps = (type, data) => {
  if (type === "oci") return makeOciSteps(data);
  if (type === "afghan") return makeAfghanSteps(data);
  if (type === "voa") return makeVoaSteps();
  if (type === "regular") return makeRegularSteps();
  return makeEvisaSteps();
};

export const isVisible = (item, data) => !item.visible || item.visible(data);
export const isRequired = (item, data) =>
  isVisible(item, data) &&
  (typeof item.required === "function"
    ? item.required(data)
    : item.required !== false);

export const isCalendarDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};

export const validateStep = (step, data, docs) => {
  const errors = {};
  (step.fields || [])
    .filter((item) => isVisible(item, data))
    .forEach((item) => {
      const value = data[item.name];
      if (
        isRequired(item, data) &&
        (item.type === "checkbox"
          ? value !== true
          : String(value ?? "").trim() === "")
      )
        errors[item.name] = "This field is required.";
      if (
        item.type === "email" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
      )
        errors[item.name] = "Enter a complete email address.";
      if (item.type === "date" && value && !isCalendarDate(value))
        errors[item.name] = "Enter a valid calendar date.";
      if (item.name.includes("phone") && value) {
        const phone = String(value).trim();
        const digitCount = phone.replace(/\D/g, "").length;
        if (
          !/^\+?[0-9][0-9 ()-]*$/.test(phone) ||
          digitCount < 7 ||
          digitCount > 20
        )
          errors[item.name] =
            "Enter a valid phone number using 7–20 digits and common separators.";
      }
    });

  if (
    (step.fields || []).some((item) => item.name === "confirm_email" && isVisible(item, data)) &&
    data.email &&
    data.confirm_email &&
    String(data.email).trim().toLowerCase() !==
      String(data.confirm_email).trim().toLowerCase()
  )
    errors.confirm_email = "Email addresses must match.";
  const today = new Date().toISOString().slice(0, 10);
  if (data.date_of_birth && data.date_of_birth >= today)
    errors.date_of_birth = "Date of birth must be in the past.";
  if (data.passport_issue_date && data.passport_issue_date > today)
    errors.passport_issue_date = "Passport issue date cannot be in the future.";
  if (
    data.passport_issue_date &&
    data.passport_expiry_date &&
    data.passport_expiry_date <= data.passport_issue_date
  )
    errors.passport_expiry_date =
      "Passport expiry date must be after its issue date.";
  if (
    data.expected_arrival_date &&
    data.passport_expiry_date &&
    data.passport_expiry_date <= data.expected_arrival_date
  )
    errors.passport_expiry_date =
      "Passport must remain valid after the expected arrival date.";
  if (step.id === "documents") {
    const missing = getRequiredDocuments(data).filter(
      (requirement) =>
        !docs.some(
          (document) =>
            document.type === requirement.type &&
            ["selected-this-session", "uploaded"].includes(document.status),
        ),
    );
    if (missing.length)
      errors.documents = `Select every required item before continuing: ${missing.map((item) => item.title).join(", ")}.`;
  }
  if (step.id === "registration") {
    if (data.passport_type && data.passport_type !== "ordinary")
      errors.passport_type =
        "The published e-Visa route excludes Diplomatic, Official, Service, and other non-ordinary travel documents.";
    if (
      ["afghanistan", "pakistan"].includes(
        String(data.nationality || "")
          .trim()
          .toLowerCase(),
      )
    )
      errors.nationality =
        "This nationality must use a different official route.";
    if (data.expected_arrival_date) {
      const arrival = new Date(`${data.expected_arrival_date}T00:00:00`);
      const earliest = new Date();
      earliest.setHours(0, 0, 0, 0);
      earliest.setDate(earliest.getDate() + 4);
      const latest = new Date();
      latest.setHours(0, 0, 0, 0);
      latest.setDate(latest.getDate() + 120);
      if (arrival < earliest || arrival > latest)
        errors.expected_arrival_date =
          "Choose a date within the published e-Visa application window (at least 4 days and no more than 120 days ahead).";
    }
  }
  if (
    step.id === "family" &&
    data.application_type === "evisa" &&
    data.pakistan_origin === "yes"
  )
    errors.pakistan_origin =
      "Pakistani-origin cases require the appropriate regular/paper visa route.";
  if (
    step.id === "security" &&
    (data.application_type === "oci" || data.pakistan_origin === "yes") &&
    data.pakistan_origin === "yes"
  ) {
    errors.pakistan_origin =
      "Under Section 7A of the Citizenship Act, 1955, persons of Pakistani or Bangladeshi origin are ineligible for OCI registration and must apply for a regular visa.";
  }
  if (
    step.id === "afghan-route" &&
    data.passport_type &&
    data.passport_type !== "ordinary"
  )
    errors.passport_type =
      "This passport-type edge case requires confirmation with the official portal or Indian consular authority.";

  if (
    step.id === "voa-travel" &&
    data.passport_expiry_date &&
    data.arrival_date
  ) {
    const expiry = new Date(`${data.passport_expiry_date}T00:00:00`);
    const arrival = new Date(`${data.arrival_date}T00:00:00`);
    arrival.setMonth(arrival.getMonth() + 6);
    if (expiry < arrival)
      errors.arrival_date =
        "The passport must remain valid for at least six months after arrival for the Visa on Arrival route.";
    if (data.onward_date && data.onward_date < data.arrival_date)
      errors.onward_date = "Onward date cannot be before arrival.";
  }
  if (step.id === "review") {
    const missing = getRequiredDocuments(data).filter(
      (requirement) =>
        !docs.some(
          (document) =>
            document.type === requirement.type &&
            ["selected-this-session", "uploaded"].includes(document.status),
        ),
    );
    if (missing.length)
      errors.review_accuracy = `Required document selections changed or are missing: ${missing.map((item) => item.title).join(", ")}.`;
    if (!data.review_accuracy)
      errors.review_accuracy =
        "Confirm that you reviewed the prepared details.";
  }
  return errors;
};
