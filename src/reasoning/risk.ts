import type { Rule, GraphContext, RuleResult } from "./rule";
import type { Entity } from "../semantic/entity";
import { findIssuesAffecting } from "./queries";

const REVIEW_THRESHOLD = 1; // see constitution known-gaps: raise once co-occurring failures are possible

export const AssetWithIssuesRequiresReview: Rule = {
  id: "RISK-001",
  name: "Assets with active compliance issues require review",
  severity: "info",

  applies(entity: Entity): boolean {
    return entity.entityType === "PhysicalAsset" || entity.entityType === "StructuralAsset";
  },

  evaluate(entity: Entity, ctx: GraphContext): RuleResult {
    const affectingIssues = findIssuesAffecting(entity.id, ctx);

    if (affectingIssues.length >= REVIEW_THRESHOLD) {
      return {
        passed: false,
        reason: `${affectingIssues.length} active compliance issue(s) require review`,
        evidence: affectingIssues.map((issue) => ({
          entityId: issue.id,
          note: `${issue.ruleId}: ${issue.reason}`,
        })),
      };
    }

    return {
      passed: true,
      reason: "No active compliance issues",
      evidence: [],
    };
  },
};

export const RISK_RULES: Rule[] = [AssetWithIssuesRequiresReview];