import type { Rule, GraphContext, RuleResult } from "./rule";
import type { Entity } from "../semantic/entity";
import { RelationshipTypes } from "../relationships/relationshipTypes";

export const AssetMustBeDocumented: Rule = {
  id: "DOC-001",
  name: "Physical assets must be described by at least one document",
  severity: "warning",

  applies(entity: Entity): boolean {
    return entity.entityType === "PhysicalAsset" || entity.entityType === "StructuralAsset";
  },

  evaluate(entity: Entity, ctx: GraphContext): RuleResult {
    const describingDocs = ctx.relationships
      .incoming(entity.id)
      .filter((r) => r.type === RelationshipTypes.DESCRIBES);

    if (describingDocs.length > 0) {
      const docNames = describingDocs
        .map((r) => ctx.entities.get(r.source)?.name)
        .filter(Boolean);
      return {
        passed: true,
        reason: `Documented by: ${docNames.join(", ")}`,
        evidence: describingDocs.map((r) => ({
          entityId: r.source,
          note: `${ctx.entities.get(r.source)?.name ?? "document"} describes this asset`,
        })),
      };
    }

    return {
      passed: false,
      reason: "No specification or document describes this asset",
      evidence: [],
    };
  },
};

export const ALL_RULES: Rule[] = [AssetMustBeDocumented];