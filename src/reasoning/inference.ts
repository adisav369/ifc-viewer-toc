import type { Entity } from "../semantic/entity";
import type { GraphContext, Rule, RuleResult } from "./rule";
import { RelationshipTypes } from "../relationships/relationshipTypes";

let nextIssueId = -2000000;

export interface ComplianceIssue extends Entity {
  severity: "info" | "warning" | "critical";
  reason: string;
  ruleId: string;
  affectsId: number;
}

export function createComplianceIssue(
  rule: Rule,
  affectedEntity: Entity,
  result: RuleResult,
  ctx: GraphContext
): ComplianceIssue {
  const issue: ComplianceIssue = {
    id: nextIssueId--,
    entityType: "ComplianceIssue",
    domain: "Reasoning",
    name: `${rule.id}: ${affectedEntity.name}`,
    source: { system: "ReasoningEngine", nativeType: "ComplianceIssue" },
    severity: rule.severity,
    reason: result.reason,
    ruleId: rule.id,
    affectsId: affectedEntity.id,
  };

  // Write the generated knowledge back into the graph as a first-class entity
  ctx.entities.set(issue.id, issue);

  // AFFECTS edge: issue → the asset it concerns
  ctx.relationships.create(RelationshipTypes.AFFECTS ?? "AFFECTS", issue.id, affectedEntity.id, {
    metadata: { ruleId: rule.id, severity: rule.severity },
    confidence: 1.0,
    createdBy: "inference",
  });

  return issue;
}