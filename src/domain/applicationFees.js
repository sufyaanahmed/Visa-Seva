import schedule from "../data/visaFeeSchedule.json" with { type: "json" };
export const feeSources = {
  tourist:
    "https://indianvisaonline.gov.in/evisa/images/Etourist_fee_final.pdf",
  other:
    "https://indianvisaonline.gov.in/evisa/images/eTV_revised_fee_final.pdf",
  oci: "https://ociservices.gov.in/onlineOCI/faq",
};
const aliases = {
  "united states": "United States Of",
  "united states of america": "United States Of",
  "united kingdom": "United Kingdom (UK)",
  "south korea": "Republic Of Korea",
  czechia: "Czech Republic",
  "north macedonia": "Macedonia",
  niue: "Niue Island",
  "saint kitts and nevis": "Saint Christopher And",
  "saint vincent and the grenadines": "Saint Vincent And The",
  "vatican city": "Vatican City - Holy",
  eswatini: "Swaziland",
  "timor-leste": "East Timor",
  cameroon: "Cameroon Republic",
  niger: "Niger Republic",
};
const normalize = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
function countryRow(table, name) {
  const key =
    aliases[
      String(name || "")
        .trim()
        .toLowerCase()
    ] || name;
  return Object.entries(table).find(
    ([country]) => normalize(country) === normalize(key),
  )?.[1];
}
export const formatFee = (fee) =>
  fee?.amount == null
    ? "Fee to be confirmed"
    : new Intl.NumberFormat("en", {
        style: "currency",
        currency: fee.currency,
      }).format(fee.amount / 100);
export function calculateApplicationFee(answers) {
  const {
    application_type: route,
    visa_category: category,
    nationality,
  } = answers;
  let base, source, label;
  if (route === "regular")
    return {
      amount: null,
      currency: "USD",
      collection: "external",
      label: "Pay through your Indian Mission",
      reason:
        "Your Indian Mission confirms the fee for your nationality, category and duration. Payment is collected through its filing process.",
      source: "https://www.indianvisaonline.gov.in/visa/visa-fee.html",
    };
  if (route === "voa")
    return {
      amount: 200000,
      baseAmount: 200000,
      bankCharge: 0,
      currency: "INR",
      collection: "external",
      label: "Visa on Arrival · Pay at the airport",
      source:
        "https://www.mha.gov.in/sites/default/files/2022-07/AnnexIII_01022018%5B1%5D.pdf",
    };
  if (route === "afghan" && nationality === "Afghanistan") {
    base = 0;
    source = "https://www.indianembassyrome.gov.in/eoi.php?id=fees";
    label = "Afghan visa · Gratis";
  } else if (route === "oci") {
    base = 275;
    source = feeSources.oci;
    label = "OCI registration";
  } else if (route === "evisa" && category === "tourist") {
    const validity = answers.visa_validity;
    if (!["30-days", "1-year", "5-years"].includes(validity))
      return {
        amount: null,
        currency: "USD",
        reason: "Choose a tourist visa validity.",
        source: feeSources.tourist,
      };
    const row = countryRow(schedule.tourist, nationality);
    const month = Number(
      String(answers.expected_arrival_date || "").slice(5, 7),
    );
    if (validity === "30-days" && (!month || month > 12))
      return {
        amount: null,
        currency: "USD",
        reason: "Choose your arrival date.",
        source: feeSources.tourist,
      };
    base =
      row?.[
        validity === "5-years"
          ? 3
          : validity === "1-year"
            ? 2
            : month >= 4 && month <= 6
              ? 0
              : 1
      ];
    source = feeSources.tourist;
    label = `Tourist e-Visa · ${validity.replaceAll("-", " ")}`;
  } else if (
    route === "evisa" &&
    ["business", "medical", "medical-attendant"].includes(category)
  ) {
    base = countryRow(schedule.other, nationality)?.[
      ["business", "medical", "medical-attendant"].indexOf(category)
    ];
    source = feeSources.other;
    label = `${category} e-Visa`;
  }
  if (base == null)
    return {
      amount: null,
      currency: "USD",
      reason:
        route === "voa"
          ? "₹2,000 payable at the arrival airport."
          : "The consular fee must be confirmed for this route before online payment.",
      source: source || "https://indianvisaonline.gov.in/",
    };
  const baseAmount = Math.round(base * 100);
  const bankCharge = route === "evisa" ? Math.round(baseAmount * 0.03) : 0;
  return {
    amount: baseAmount + bankCharge,
    baseAmount,
    bankCharge,
    currency: "USD",
    label,
    source,
    reviewed: schedule.reviewed,
  };
}
