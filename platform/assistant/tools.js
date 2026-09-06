import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { reference } from "../reference.js";
import {
  getFinderQuestions,
  evaluateVisaRoute,
} from "../../src/domain/visaEligibility.js";
import {
  VISA_RULESET,
  PASSPORT_NATIONALITIES,
  PURPOSES,
  EVISA_CATEGORIES,
} from "../../src/data/visaEligibilityRules.js";
import { applicationFromFinder } from "../../src/domain/finderSession.js";

const choice = (...values) => z.enum(values).optional();
export const finderSchema = z
  .object({
    passport: z.enum(PASSPORT_NATIONALITIES).optional(),
    passportType: choice(
      "ordinary",
      "diplomatic",
      "official",
      "other-document",
    ),
    pakistanOrigin: choice("yes", "no", "unsure"),
    purpose: z.enum(PURPOSES.map((p) => p.value)).optional(),
    durationDays: z.number().int().min(1).max(3650).optional(),
    studyInIndiaInstitution: choice("yes", "no"),
    uaePriorVisa: choice("yes", "no", "unsure"),
    voaArrivalPort: choice("designated", "other", "unsure"),
    voaIndiaResidenceOrOccupation: choice("yes", "no", "unsure"),
    voaAdmissibility: choice("yes", "no", "unsure"),
    travelReadiness: choice("yes", "no"),
  })
  .strict();
const documentSchema = z
  .object({
    application_type: z.enum(["evisa", "regular", "afghan", "voa"]),
    visa_category: z.string().max(60),
    afghan_purpose: z.string().max(60).optional(),
    is_minor: choice("yes", "no"),
  })
  .strict();

export const TOOL_LABELS = {
  check_visa_eligibility: "Checking visa eligibility",
  get_document_checklist: "Preparing document checklist",
  visa_reference: "Looking up visa guidance",
};

export function createVisaTools() {
  return [
    tool(
      ({ answers }) => {
        const missing = getFinderQuestions(answers).filter(
          (q) => answers[q.id] === undefined,
        );
        const recommendation = missing.length
          ? null
          : evaluateVisaRoute(answers);
        return JSON.stringify({
          reviewedDate: VISA_RULESET.reviewedDate,
          sources: VISA_RULESET.sources,
          finderAnswers: answers,
          missingQuestions: missing,
          // Never let incomplete answers fall through the route engine to an eligibility claim.
          recommendation,
          applicationAction: recommendation
            ? {
                kind: "start_application",
                label: "Start my application",
                path: "/apply",
                applicationType: recommendation.applicationType,
                finderAnswers: answers,
                state: applicationFromFinder({}, answers, recommendation),
              }
            : null,
        });
      },
      {
        name: "check_visa_eligibility",
        description:
          "Evaluate the reviewed visa rules. Pass only facts explicitly supplied by the traveller. Empty answers returns required questions. Ask missing questions before claiming eligibility; never assume yes/no answers. Call this again with all known answers when the traveller asks to start or apply, so a verified application action can be created.",
        schema: z.object({ answers: finderSchema }),
      },
    ),
    tool((answers) => JSON.stringify(reference("documents", answers)), {
      name: "get_document_checklist",
      description: `Get route/category-specific document requirements and file limits. Ask for the route and category if unknown. e-Visa categories: ${EVISA_CATEGORIES.join(", ")}.`,
      schema: documentSchema,
    }),
    tool(
      ({ topic, application_type }) =>
        JSON.stringify(reference(topic, { application_type })),
      {
        name: "visa_reference",
        description:
          "Retrieve reviewed visa categories, fee guidance or application steps. Fees are not live quotations. Includes official sources and review date.",
        schema: z.object({
          topic: z.enum(["categories", "fees", "steps"]),
          application_type: z.enum(["evisa", "regular", "afghan", "voa"]),
        }),
      },
    ),
  ];
}
