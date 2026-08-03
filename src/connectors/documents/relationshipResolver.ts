// connectors/documents/relationshipResolver.ts
import type { DocumentChunk } from "../../documents/documentIndex";
import type { GraphNode } from "../../graph/graph";

export interface ResolvedMatch {
  asset: GraphNode;
  typeCode: string;
  score: number;
}

function normalize(s: string): string {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // á -> a, so accent mismatches don't break matching
    .toLowerCase()
    .trim();
}

// "Muro básico:STB 25.0 WD 12.0" -> "stb 25.0"
// Takes the first two tokens after the family prefix — the letters+number code
// real specs reference — and drops suffixes (WD 12.0, Rot) specs never name.
function extractTypeCode(fullName: string): string {
  const afterColon = fullName.split(":")[1] ?? fullName;
  const tokens = normalize(afterColon).split(" ").filter(Boolean);
  return tokens.slice(0, 2).join(" ");
}

export function resolveDescribes(chunks: DocumentChunk[], candidates: GraphNode[]): ResolvedMatch[] {
  const fullText = normalize(chunks.map((c) => c.text).join(" "));
  const codeScores = new Map<string, number>();

  for (const candidate of candidates) {
    const code = extractTypeCode(candidate.name);
    if (!code || codeScores.has(code)) continue;
    const occurrences = fullText.split(code).length - 1;
    codeScores.set(code, occurrences);
  }

  return candidates
    .map((candidate) => ({ asset: candidate, typeCode: extractTypeCode(candidate.name), score: codeScores.get(extractTypeCode(candidate.name)) ?? 0 }))
    .filter((m) => m.score > 0);
}