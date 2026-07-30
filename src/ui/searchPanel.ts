import { SearchService } from "../search/searchService";
import { Graph } from "../graph/graph";
import type { Entity } from "../semantic/entity";
import type { RelationshipService } from "../relationships/relationshipService";
import { renderGraphExplorer } from "./graphExplorer";

export function setupSearchPanel(
  searchService: SearchService,
  graph: Graph,
  entities: Map<number, Entity>,
  relationships: RelationshipService,
  onSelect: (id: number) => void
) {
  const panel = document.getElementById("search-panel")!;
  const input = document.getElementById("search-input") as HTMLInputElement;
  const resultsDiv = document.getElementById("search-results")!;

  panel.style.display = "block";

  input.oninput = () => {
    const query = input.value;

    if (!query.trim()) {
      resultsDiv.innerHTML = "";
      return;
    }

    const results = searchService.search(query);

    resultsDiv.innerHTML =
      results
        .map(
          (r) => `
        <div class="search-result-item" data-id="${r.entity.id}">
          <div class="search-result-name">${r.entity.name}</div>
          <div class="search-result-meta">${r.entity.entityType} · ${r.entity.domain} · score ${r.score.toFixed(2)}</div>
        </div>`
        )
        .join("") || `<div class="search-result-meta">No results</div>`;

    resultsDiv.querySelectorAll(".search-result-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = Number((el as HTMLElement).dataset.id);
        renderGraphExplorer(graph, id, entities, relationships);
        onSelect(id);
      });
    });
  };
}