/**
 * Official Government of India e-Visa, VoA, and OCI Fee Guidelines
 * Reference snapshot: https://indianvisaonline.gov.in/evisa/
 */

export const GRATIS_NATIONALITIES = new Set([
  'Argentina',
  'Cook Islands',
  'Fiji',
  'Indonesia',
  'Jamaica',
  'Kiribati',
  'Marshall Islands',
  'Mauritius',
  'Micronesia',
  'Myanmar',
  'Nauru',
  'Niue',
  'Palau',
  'Papua New Guinea',
  'Samoa',
  'Seychelles',
  'Solomon Islands',
  'South Africa',
  'Tonga',
  'Tuvalu',
  'Vanuatu',
]);

export function getVisaFeeEstimate(category, nationality) {
  if (nationality && GRATIS_NATIONALITIES.has(nationality)) {
    return {
      usd: 0,
      inr: 0,
      range: '$0 USD (Gratis)',
      isGratis: true,
      validity: 'Standard Category Duration',
      note: 'Visa fee is waived (Gratis) by reciprocal government bilateral agreement.',
    };
  }

  const cat = (category || '').toLowerCase();

  if (cat === 'voa') {
    return {
      usd: 24,
      inr: 2000,
      range: '₹2,000 INR (~$24 USD)',
      isGratis: false,
      validity: 'Up to 60 days · Double entry',
      note: 'Payable directly at the designated airport immigration counter upon arrival.',
    };
  }

  if (cat === 'oci') {
    return {
      usd: 275,
      inr: 23000,
      range: '$275 USD',
      isGratis: false,
      validity: 'Lifelong · Multiple entry',
      note: 'Consular processing fee on ociservices.gov.in for new adult OCI registration.',
    };
  }

  if (cat === 'tourist') {
    return {
      usd: 25,
      inr: 2100,
      range: '$10 – $25 USD (30-Day) · $40 (1-Year) · $80 (5-Year)',
      isGratis: false,
      validity: '30 Days Double Entry / 1 Year Multiple Entry / 5 Years Multiple Entry',
      note: '30-day tourist visa: $10 USD (April to June) · $25 USD (July to March). 1-year multiple entry is $40 USD.',
    };
  }

  if (cat === 'business') {
    return {
      usd: 80,
      inr: 6700,
      range: '$80 USD',
      isGratis: false,
      validity: '1 Year Multiple Entry (up to 180 days continuous stay per visit)',
      note: 'Standard fee for business meetings, negotiations, recruitments, and trade ventures.',
    };
  }

  if (cat === 'conference') {
    return {
      usd: 80,
      inr: 6700,
      range: '$80 USD',
      isGratis: false,
      validity: '30 Days Single Entry',
      note: 'Applicable for government/institutional seminars, workshops, and symposiums.',
    };
  }

  if (['medical', 'medical-attendant', 'ayush'].includes(cat)) {
    return {
      usd: 80,
      inr: 6700,
      range: '$80 USD',
      isGratis: false,
      validity: '60 Days Triple Entry',
      note: 'Covers medical patients and up to two eligible attendants.',
    };
  }

  if (cat === 'student') {
    return {
      usd: 80,
      inr: 6700,
      range: '$80 USD',
      isGratis: false,
      validity: 'Duration of Course (up to 5 Years Multiple Entry)',
      note: 'Available for recognised Study in India enrolled institutions.',
    };
  }

  if (cat === 'transit') {
    return {
      usd: 20,
      inr: 1650,
      range: '$20 USD',
      isGratis: false,
      validity: 'Direct Transit (up to 72 hours)',
      note: 'For passengers with confirmed onward international connection.',
    };
  }

  return {
    usd: 80,
    inr: 6700,
    range: '$80 USD',
    isGratis: false,
    validity: 'Standard e-Visa Category Validity',
    note: 'Official Government of India processing fee.',
  };
}
