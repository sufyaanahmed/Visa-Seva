import { z } from "zod";
import { getSteps, validateStep } from "../src/domain/applicationForm.js";
import { getRequiredDocuments } from "../src/domain/documentRequirements.js";
import { getEvisaWizardGate } from "../src/domain/visaEligibility.js";
export const routes = ["evisa", "regular", "afghan", "voa", "oci"];
export const answerSchema = z
  .record(
    z.string().max(100),
    z.union([z.string().max(5000), z.boolean(), z.number().finite(), z.null()]),
  )
  .refine(
    (x) => routes.includes(x.application_type),
    "Choose a valid application route",
  )
  .refine((x) => Object.keys(x).length <= 180, "Too many fields");
export function validateApplication(answers, documents) {
  const docs = documents.map((d) => ({
    type: d.type,
    status: "selected-this-session",
  }));
  const errors = Object.assign(
    {},
    ...getSteps(answers.application_type, answers).map((step) =>
      validateStep(step, answers, docs),
    ),
  );
  if (
    answers.application_type === "evisa" &&
    !getEvisaWizardGate(answers).allowed
  )
    errors.eligibility = "Complete the visa eligibility check.";
  // Enforce select membership on the server, including hidden conditional fields.
  for (const step of getSteps(answers.application_type, answers))
    for (const f of step.fields || []) {
      if (
        f.type === "select" &&
        (!f.visible || f.visible(answers)) &&
        answers[f.name] &&
        !f.options.includes(answers[f.name])
      )
        errors[f.name] = "Choose a listed option.";
    }
  return {
    complete: Object.keys(errors).length === 0,
    errors,
    missingDocuments: getRequiredDocuments(answers)
      .filter((r) => !documents.some((d) => d.type === r.type))
      .map((r) => ({ type: r.type, title: r.title })),
  };
}
export const statusLabels = {
  draft: "Draft",
  awaiting_payment: "Awaiting payment",
  submitted: "Submitted",
  under_review: "Under review",
  waiting_for_information: "Waiting for information",
  accepted: "Accepted",
  rejected: "Rejected",
};
