import type { Rule, GraphContext, RuleResult } from "./rule";
import type { Entity } from "../semantic/entity";
import { RelationshipTypes } from "../relationships/relationshipTypes";
import { chunksForDocument, searchChunks } from "../documents/documentQuery";

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

export const FireRatedAssetMustBeSpecified: Rule = {
  id: "FIRE-001",
  name: "Documented assets must have a fire rating specified in their governing document",
  severity: "critical",

  applies(entity: Entity, ctx: GraphContext): boolean {
    if (entity.entityType !== "PhysicalAsset") return false;
    const describingDocs = ctx.relationships.incoming(entity.id).filter((r) => r.type === RelationshipTypes.DESCRIBES);
    return describingDocs.length > 0;
  },

  evaluate(entity: Entity, ctx: GraphContext): RuleResult {
    const describingDocs = ctx.relationships.incoming(entity.id).filter((r) => r.type === RelationshipTypes.DESCRIBES);

    for (const rel of describingDocs) {
      const docId = rel.source;
      const docChunks = chunksForDocument(ctx.chunks, docId);
      const matches = searchChunks(docChunks, "fire rating");

      if (matches.length > 0) {
        const doc = ctx.entities.get(docId);
        const best = matches[0].chunk;
        return {
          passed: true,
          reason: `Fire rating specified in "${doc?.name ?? "document"}" (page ${best.page})`,
          evidence: [{
            entityId: docId,
            note: best.text.length > 150 ? `${best.text.slice(0, 150)}...` : best.text,
          }],
        };
      }
    }

    const firstDocId = describingDocs[0].source;
    const firstDoc = ctx.entities.get(firstDocId);
    return {
      passed: false,
      reason: `Documented by "${firstDoc?.name ?? "document"}" but no fire rating found in its text`,
      evidence: describingDocs.map((r) => ({
        entityId: r.source,
        note: `${ctx.entities.get(r.source)?.name ?? "document"} was checked — no fire rating mention found`,
      })),
    };
  },
};

export const ALL_RULES: Rule[] = [AssetMustBeDocumented, FireRatedAssetMustBeSpecified];