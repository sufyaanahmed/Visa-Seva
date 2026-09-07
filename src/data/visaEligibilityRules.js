// This is a reviewed reference snapshot, not a live policy feed. Keep the
// metadata and source links with every rules update so recommendations remain
// explainable and auditable.
export const VISA_RULESET = Object.freeze({
  id: 'india-visa-route-finder-2026-08-27',
  effectiveDate: '2026-08-27',
  reviewedDate: '2026-08-27',
  automaticallySynchronized: false,
  sources: Object.freeze([
    { label: 'Government of India e-Visa portal', url: 'https://indianvisaonline.gov.in/evisa/' },
    { label: 'Government of India Visa on Arrival guidance', url: 'https://indianvisaonline.gov.in/visa/visa-on-arrival.html' },
    { label: 'Dedicated Afghan visa portal', url: 'https://indianvisaonline.gov.in/avisa/index.html' },
  ]),
});

// Passport choices include countries outside the e-Visa programme so the
// finder can explicitly redirect them instead of silently treating them as
// eligible. Territories in the reviewed Government list are also included.
export const PASSPORT_NATIONALITIES = Object.freeze([
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Anguilla',
  'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus',
  'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Cayman Islands',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Cook Islands', 'Costa Rica', "Cote d'Ivoire", 'Croatia', 'Cuba',
  'Cyprus', 'Czechia', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti',
  'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji',
  'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
  'Gibraltar', 'Greece', 'Grenada', 'Guatemala', 'Guernsey', 'Guinea',
  'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati',
  'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia',
  'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
  'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
  'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
  'Niue', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestine State', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Turks and Caicos Islands', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen',
  'Zambia', 'Zimbabwe',
].sort((a, b) => a.localeCompare(b)));

// Conservative transcription of the reviewed live eligibility snapshot.
// Omitted nationalities must never receive an e-Visa recommendation.
export const EVISA_ELIGIBLE_NATIONALITIES = new Set([
  'Albania', 'Andorra', 'Angola', 'Anguilla', 'Antigua and Barbuda', 'Argentina',
  'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain',
  'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Cayman Islands', 'Chile',
  'Colombia', 'Comoros', 'Cook Islands', 'Costa Rica', "Cote d'Ivoire", 'Croatia',
  'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'Ecuador', 'El Salvador', 'Equatorial Guinea', 'Eritrea',
  'Estonia', 'Eswatini', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
  'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Grenada', 'Guatemala', 'Guernsey',
  'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'Indonesia',
  'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey',
  'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lesotho', 'Liberia', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Niue',
  'Norway', 'Oman', 'Palau', 'Palestine State', 'Panama', 'Papua New Guinea',
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Senegal', 'Serbia',
  'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka',
  'Suriname', 'Sweden', 'Switzerland', 'Taiwan', 'Tajikistan', 'Tanzania',
  'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Turks and Caicos Islands',
  'Tuvalu', 'United Arab Emirates', 'Ukraine', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Zambia', 'Zimbabwe',
]);

export const PURPOSES = Object.freeze([
  { value: 'tourism', label: 'Tourism, sightseeing, short course or short volunteer visit', evisaCategory: 'tourist', finderStayLimitDays: 180 },
  { value: 'business', label: 'Business meetings or commercial activity', evisaCategory: 'business', finderStayLimitDays: 180 },
  { value: 'conference', label: 'Conference, seminar or workshop', evisaCategory: 'conference', finderStayLimitDays: 30 },
  { value: 'medical', label: 'Medical or Ayush treatment', evisaCategory: 'medical', finderStayLimitDays: 365 },
  { value: 'medical-attendant', label: 'Accompanying an e-Medical patient', evisaCategory: 'medical-attendant', finderStayLimitDays: 365 },
  { value: 'study', label: 'Full-time study at an Indian institution', evisaCategory: 'student', finderStayLimitDays: 365 },
  { value: 'transit', label: 'Transit through India', evisaCategory: 'transit', finderStayLimitDays: 30 },
  { value: 'family', label: 'Family, dependant or qualifying entry visit', evisaCategory: 'family', finderStayLimitDays: 365 },
  { value: 'film', label: 'Film production', evisaCategory: 'film', finderStayLimitDays: 365 },
  { value: 'production-investment', label: 'Production investment', evisaCategory: 'production-investment', finderStayLimitDays: 180 },
  { value: 'oci-holder', label: 'Travel as an OCI (Overseas Citizen of India) cardholder', evisaCategory: null, finderStayLimitDays: 3650 },
  { value: 'oci-apply', label: 'Apply for a new OCI (Overseas Citizen of India) card', evisaCategory: null, finderStayLimitDays: 3650 },
  { value: 'employment', label: 'Employment or paid work in India', evisaCategory: null },
  { value: 'other', label: 'Another purpose or I am not sure', evisaCategory: null },
]);

export const EVISA_CATEGORIES = Object.freeze([
  ...new Set(PURPOSES.map((purpose) => purpose.evisaCategory).filter(Boolean)),
]);

export const VOA_NATIONALITIES = new Set(['Japan', 'South Korea', 'United Arab Emirates']);
export const VOA_PURPOSES = new Set(['tourism', 'business', 'conference', 'medical']);
