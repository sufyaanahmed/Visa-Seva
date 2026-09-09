import schedule from "../data/visaFeeSchedule.json" with { type: "json" };
import { calculateApplicationFee } from "./applicationFees.js";
export const GRATIS_NATIONALITIES = new Set(
  Object.entries(schedule.tourist)
    .filter(([, v]) => v.every((x) => x === 0))
    .map(([name]) => name),
);
export function getVisaFeeEstimate(category, nationality) {
  const route = ["oci", "voa", "afghan", "regular"].includes(category)
    ? category
    : "evisa";
  const quote = calculateApplicationFee({
    application_type: route,
    visa_category: category,
    nationality,
    visa_validity: "30-days",
    expected_arrival_date: "2026-10-01",
  });
  if (route === "voa")
    return {
      usd: null,
      inr: 2000,
      range: "₹2,000 INR at arrival",
      isGratis: false,
      validity: "Up to 60 days",
      note: "Pay at the designated arrival airport.",
    };
  if (quote.amount == null)
    return {
      usd: null,
      inr: null,
      range: "Check the official fee schedule",
      isGratis: false,
      validity: "Category-specific",
      note: quote.reason,
    };
  let range =
    quote.baseAmount === 0
      ? "$0 USD (Gratis)"
      : `$${quote.baseAmount / 100} USD`;
  if (category === "tourist") {
    const a = {
      application_type: "evisa",
      visa_category: "tourist",
      nationality,
      expected_arrival_date: "2026-10-01",
    };
    range = ["30-days", "1-year", "5-years"]
      .map(
        (visa_validity) =>
          `$${calculateApplicationFee({ ...a, visa_validity }).baseAmount / 100} (${visa_validity.replaceAll("-", " ")})`,
      )
      .join(" · ");
  }
  return {
    usd: quote.baseAmount / 100,
    inr: null,
    range,
    isGratis: quote.baseAmount === 0,
    validity: category === "oci" ? "Lifelong" : "Depends on selected validity",
    note:
      route === "evisa"
        ? "Nationality-specific fee. A 3% bank charge applies; 30-day tourist fees also depend on arrival season."
        : "Registration fee. Check local filing and service charges with your mission.",
  };
}
