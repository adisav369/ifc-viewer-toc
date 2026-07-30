import type { SearchableEntity, SearchResult } from "./searchTypes";

export class SearchService {
  private index: SearchableEntity[] = [];

  setIndex(index: SearchableEntity[]) {
    this.index = index;
  }

  search(query: string, limit = 20): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];

    for (const entity of this.index) {
      const fields = [entity.name, entity.entityType, entity.domain, entity.nativeType]
        .filter(Boolean)
        .map((f) => f.toLowerCase());

      let bestScore = 0;
      for (const field of fields) {
        if (field === q) bestScore = Math.max(bestScore, 1.0);
        else if (field.startsWith(q)) bestScore = Math.max(bestScore, 0.9);
        else if (field.includes(q)) bestScore = Math.max(bestScore, 0.7);
      }

      if (bestScore > 0) results.push({ entity, score: bestScore });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}