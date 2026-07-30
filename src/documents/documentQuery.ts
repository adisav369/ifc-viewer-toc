import type { DocumentChunk } from "./documentIndex";

export interface ChunkMatch {
  chunk: DocumentChunk;
  score: number;
}

export function searchChunks(chunks: DocumentChunk[], query: string): ChunkMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: ChunkMatch[] = [];
  for (const chunk of chunks) {
    const text = chunk.text.toLowerCase();
    if (text.includes(q)) {
      const score = text.startsWith(q) ? 0.9 : 0.7;
      results.push({ chunk, score });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results;
}

export function chunksForDocument(chunks: DocumentChunk[], documentId: number): DocumentChunk[] {
  return chunks
    .filter((c) => c.documentId === documentId)
    .sort((a, b) => a.page - b.page || a.position - b.position);
}