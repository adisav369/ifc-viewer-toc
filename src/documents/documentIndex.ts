export interface DocumentChunk {
  id: number;
  documentId: number;
  page: number;
  text: string;
  position: number;
}

let nextChunkId = -1000000;

function splitIntoChunks(pageText: string, sentencesPerChunk = 3): string[] {
  const sentences = pageText
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
    chunks.push(sentences.slice(i, i + sentencesPerChunk).join(" "));
  }
  return chunks;
}

export function buildDocumentChunks(documentId: number, pages: string[]): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  pages.forEach((pageText, pageIndex) => {
    const pageChunks = splitIntoChunks(pageText);
    pageChunks.forEach((text, position) => {
      chunks.push({
        id: nextChunkId--,
        documentId,
        page: pageIndex + 1,
        text,
        position,
      });
    });
  });
  return chunks;
}