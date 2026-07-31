import type { Entity } from "../semantic/entity";
import type { Graph } from "../graph/graph";
import type { RelationshipService } from "../relationships/relationshipService";
import type { DocumentChunk } from "../documents/documentIndex";

export interface GraphContext {
  graph: Graph;
  entities: Map<number, Entity>;
  relationships: RelationshipService;
  chunks: DocumentChunk[];
}

export interface EvidenceRef {
  entityId: number;
  note: string;
}

export interface RuleResult {
  passed: boolean;
  reason: string;
  evidence: EvidenceRef[];
}

export interface Rule {
  id: string;
  name: string;
  severity: "info" | "warning" | "critical";
  applies(entity: Entity, ctx: GraphContext): boolean;
  evaluate(entity: Entity, ctx: GraphContext): RuleResult;
}