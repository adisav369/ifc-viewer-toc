import type { GraphNode } from "../graph/graph";
import type { Entity } from "./entity";
import { IFC_ONTOLOGY, DEFAULT_ENTITY_TYPE, DEFAULT_DOMAIN } from "./ontology";

export function mapIfcNodeToEntity(node: GraphNode): Entity {
  const rule = IFC_ONTOLOGY[node.type];

  return {
    id: node.id,
    entityType: rule?.entityType ?? DEFAULT_ENTITY_TYPE,
    domain: rule?.domain ?? DEFAULT_DOMAIN,
    name: node.name,
    source: {
      system: "IFC",
      nativeType: node.type,
    },
  };
}

export function buildEntityMap(nodes: Map<number, GraphNode>): Map<number, Entity> {
  const entities = new Map<number, Entity>();
  for (const node of nodes.values()) {
    entities.set(node.id, mapIfcNodeToEntity(node));
  }
  return entities;
}