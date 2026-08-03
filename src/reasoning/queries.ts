import type { GraphContext } from "./rule";
import type { Relationship } from "../relationships/relationship";
import { RelationshipTypes } from "../relationships/relationshipTypes";
import type { ComplianceIssue } from "./inference";

export function findDescribingDocuments(entityId: number, ctx: GraphContext): Relationship[] {
  return ctx.relationships.incoming(entityId).filter((r) => r.type === RelationshipTypes.DESCRIBES);
}

export function findIssuesAffecting(entityId: number, ctx: GraphContext): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  for (const entity of ctx.entities.values()) {
    if (entity.entityType === "ComplianceIssue" && (entity as ComplianceIssue).affectsId === entityId) {
      issues.push(entity as ComplianceIssue);
    }
  }
  return issues;
}