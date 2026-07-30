import type { Entity } from "../semantic/entity";
import type { RelationshipService } from "../relationships/relationshipService";
import { RelationshipTypes } from "../relationships/relationshipTypes";

export function findRelatedDocuments(
  selectedEntityId: number,
  entities: Map<number, Entity>,
  relationships: RelationshipService
): Entity[] {
  const incoming = relationships
    .incoming(selectedEntityId)
    .filter((r) => r.type === RelationshipTypes.DESCRIBES);

  const docs: Entity[] = [];
  for (const rel of incoming) {
    const doc = entities.get(rel.source);
    if (doc) docs.push(doc);
  }
  return docs;
}