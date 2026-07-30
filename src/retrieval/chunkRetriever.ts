import type { Entity } from "../semantic/entity";
import type { DocumentChunk } from "../documents/documentIndex";
import { chunksForDocument, searchChunks } from "../documents/documentQuery";
import type { Evidence } from "./retrievalTypes";

export function retrieveEvidence(
  documents: Entity[],
  keywords: string,
  allChunks: DocumentChunk[],
  limit = 3
): Evidence[] {
  const evidence: Evidence[] = [];

  for (const doc of documents) {
    const docChunks = chunksForDocument(allChunks, doc.id);
    const matches = keywords.trim()
      ? searchChunks(docChunks, keywords)
      : docChunks.slice(0, limit).map((c) => ({ chunk: c, score: 0.5 }));

    for (const m of matches.slice(0, limit)) {
      evidence.push({
        documentId: doc.id,
        documentName: doc.name,
        page: m.chunk.page,
        confidence: m.score,
        text: m.chunk.text,
      });
    }
  }

  evidence.sort((a, b) => b.confidence - a.confidence);
  return evidence.slice(0, limit);
}