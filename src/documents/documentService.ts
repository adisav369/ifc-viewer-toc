import type { Entity } from "../semantic/entity";
import type { DocumentChunk } from "./documentIndex";
import { buildDocumentChunks } from "./documentIndex";
import type { RelationshipService } from "../relationships/relationshipService";
import { RelationshipTypes } from "../relationships/relationshipTypes";

export function mapChunkToEntity(chunk: DocumentChunk): Entity {
  return {
    id: chunk.id,
    entityType: "DocumentChunk",
    domain: "Documents",
    name: `Page ${chunk.page}, chunk ${chunk.position + 1}`,
    source: {
      system: "PDF",
      nativeType: "DocumentChunk",
    },
  };
}

export function ingestDocumentChunks(
  documentId: number,
  pages: string[],
  entities: Map<number, Entity>,
  relationships: RelationshipService
): DocumentChunk[] {
  const chunks = buildDocumentChunks(documentId, pages);

  for (const chunk of chunks) {
    const entity = mapChunkToEntity(chunk);
    entities.set(entity.id, entity);
    relationships.create(RelationshipTypes.HAS_CHUNK, documentId, chunk.id, {
      metadata: { page: chunk.page, position: chunk.position },
      confidence: 1.0,
      createdBy: "connector",
    });
  }

  return chunks;
}