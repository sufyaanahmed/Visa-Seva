import {
  VISA_RULESET,
  EVISA_CATEGORIES,
} from "../src/data/visaEligibilityRules.js";
import {
  evaluateVisaRoute,
  getFinderQuestions,
} from "../src/domain/visaEligibility.js";
import {
  applicationFromFinder,
  isValidFinderAnswer,
} from "../src/domain/finderSession.js";
import { getSteps } from "../src/domain/applicationForm.js";
import { getRequiredDocuments } from "../src/domain/documentRequirements.js";
export function reference(topic = "overview", answers = {}) {
  answers = { application_type: "evisa", ...answers };
  const common = {
    reviewedDate: VISA_RULESET.reviewedDate,
    automaticallySynchronized: false,
    serviceNotice:
      "Visa Seva is an assistance platform, not the Government of India. Guidance is a reviewed snapshot; verify current rules with official sources. Checkout is sandbox-only. Submission here is not government filing or visa approval.",
    sources: VISA_RULESET.sources,
  };
  if (topic === "categories")
    return {
      ...common,
      categories: EVISA_CATEGORIES,
      routes: ["evisa", "regular", "afghan", "voa"],
    };
  if (topic === "overview")
    return {
      ...common,
      summary:
        "Explore Indian e-Visa categories, check your route, and prepare an application. Eligibility depends on passport nationality and type, trip purpose, stay length, and other conditions.",
      nextTool: "visa_information",
      nextArguments: { topic: "eligibility" },
      firstQuestion: getFinderQuestions({})[0],
      workflow: [
        "Check eligibility without signing in.",
        "Review documents and fees for the recommended route.",
        "Connect your account only when you want to create or access a draft.",
        "Upload documents and explicitly confirm on the website.",
        "Complete sandbox checkout in the browser; platform submission does not file with the government.",
      ],
    };
  if (topic === "eligibility") {
    const questions = getFinderQuestions(answers);
    const missing = questions.filter(
      (q) => !isValidFinderAnswer(q, answers[q.id]),
    );
    const result = missing.length ? null : evaluateVisaRoute(answers);
    return {
      ...common,
      questions,
      complete: missing.length === 0,
      missingFields: missing.map((q) => q.id),
      nextQuestion: missing[0] || null,
      recommendation: result,
      draftAnswers: result
        ? applicationFromFinder({}, answers, result).data
        : null,
      guidance: missing.length
        ? "Ask the next question and resend all known answers. Missing or invalid answers are not a visa refusal. Do not guess personal facts or request passport numbers for this check."
        : "Present this route with its cautions and official sources. Use draftAnswers for documents, steps, or an explicitly requested draft; this is not visa approval.",
    };
  }
  if (topic === "documents")
    return { ...common, documents: getRequiredDocuments(answers) };
  if (topic === "steps")
    return {
      ...common,
      steps: getSteps(answers.application_type, answers).map((s) => ({
        id: s.id,
        title: s.title,
        fields: s.fields
          ?.filter((f) => !f.visible || f.visible(answers))
          .map((f) => ({
            name: f.name,
            label: f.label,
            type: f.type,
            options: f.options,
            required:
              typeof f.required === "function"
                ? f.required(answers)
                : f.required !== false,
          })),
      })),
    };
  return {
    ...common,
    fees: {
      note: "Government fees depend on nationality, category, and visa duration. Check the official portal for the applicable fee. Sandbox checkout uses a separate test amount.",
      source: "https://indianvisaonline.gov.in/evisa/tvoa.html",
    },
  };
}
