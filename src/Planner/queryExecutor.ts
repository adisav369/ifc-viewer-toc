import { Graph } from "../graph/graph";
import { elementsOfType } from "../graph/queries";
import { descendants } from "../graph/traversal";
import { SearchService } from "../search/searchService";
import type { RelationshipService } from "../relationships/relationshipService";
import type { Entity } from "../semantic/entity";
import type { QueryPlan } from "./queryPlanner";
import type { DocumentChunk } from "../documents/documentIndex";
import { chunksForDocument, searchChunks } from "../documents/documentQuery";

export interface ExecutionResult {
  id: number;
  name: string;
  type: string;
  detail?: string;
}

export function executeQuery(
  plan: QueryPlan,
  graph: Graph,
  entities: Map<number, Entity>,
  relationships: RelationshipService,
  searchService: SearchService,
  allChunks: DocumentChunk[]
): ExecutionResult[] {
  switch (plan.action) {
    case "listByNativeTypeKeyword": {
      const nodes = [...graph.nodes.values()].filter((n) =>
        plan.keyword ? n.type.toLowerCase().includes(plan.keyword) : true
      );
      return nodes.map((n) => ({ id: n.id, name: n.name, type: n.type }));
    }

    case "listOnStoreyByKeyword": {
      const storeys = elementsOfType(graph, "IFCBUILDINGSTOREY").filter((s) =>
        s.name.toLowerCase().includes((plan.storey ?? "").toLowerCase())
      );
      const results: ExecutionResult[] = [];
      for (const storey of storeys) {
        for (const id of descendants(graph, storey.id)) {
          const node = graph.getNode(id);
          if (node && (!plan.keyword || node.type.toLowerCase().includes(plan.keyword))) {
            results.push({ id: node.id, name: node.name, type: node.type, detail: storey.name });
          }
        }
      }
      return results;
    }

    case "listRelationshipsFor": {
      const match = searchService.search(plan.targetKeyword ?? "")[0];
      if (!match) return [];
      const rels = relationships
        .incoming(match.entity.id)
        .filter((r) => !plan.relationType || r.type === plan.relationType);
      return rels.map((r) => {
        const source = entities.get(r.source);
        return { id: r.source, name: source?.name ?? "Unknown", type: r.type, detail: `→ ${match.entity.name}` };
      });
    }

    case "queryDocumentContent": {
      const docMatch = searchService.search(plan.targetKeyword ?? "").find((r) => r.entity.entityType === "Document");
      if (!docMatch) return [];

      const docChunks = chunksForDocument(allChunks, docMatch.entity.id);
      const matches = searchChunks(docChunks, plan.term ?? "");
      const top = matches.length ? matches : docChunks.slice(0, 3).map((c) => ({ chunk: c, score: 0.5 }));

      return top.slice(0, 3).map((m) => ({
        id: m.chunk.id,
        name: `${docMatch.entity.name} — Page ${m.chunk.page}`,
        type: "DocumentChunk",
        detail: m.chunk.text.length > 140 ? m.chunk.text.slice(0, 140) + "..." : m.chunk.text,
      }));
    }

    case "search": {
      const results = searchService.search(plan.term ?? "");
      return results.map((r) => ({ id: r.entity.id, name: r.entity.name, type: r.entity.entityType }));
    }
  }
}