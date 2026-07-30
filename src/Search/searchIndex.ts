import type { Entity } from "../semantic/entity";
import type { SearchableEntity } from "./searchTypes";

export function buildSearchIndex(entities: Map<number, Entity>): SearchableEntity[] {
  const index: SearchableEntity[] = [];
  for (const entity of entities.values()) {
    index.push({
      id: entity.id,
      name: entity.name,
      entityType: entity.entityType,
      domain: entity.domain,
      nativeType: entity.source.nativeType,
    });
  }
  return index;
}