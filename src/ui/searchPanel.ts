import { Graph } from "../graph/graph";
import type { Entity } from "../semantic/entity";
import type { RelationshipService } from "../relationships/relationshipService";
import { SearchService } from "../search/searchService";
import type { DocumentChunk } from "../documents/documentIndex";
import { parseIntent } from "../planner/intentParser";
import { planQuery } from "../planner/queryPlanner";
import { executeQuery } from "../planner/queryExecutor";
import { renderGraphExplorer } from "./graphExplorer";

export function setupSearchPanel(
  searchService: SearchService,
  graph: Graph,
  entities: Map<number, Entity>,
  relationships: RelationshipService,
  allChunks: DocumentChunk[],
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

    const intent = parseIntent(query);
    const plan = planQuery(intent);
    console.log("Intent:", intent, "| Plan:", plan);

    const results = executeQuery(plan, graph, entities, relationships, searchService, allChunks);

    resultsDiv.innerHTML =
      results
        .map(
          (r) => `
        <div class="search-result-item" data-id="${r.id}">
          <div class="search-result-name">${r.name}</div>
          <div class="search-result-meta">${r.type}${r.detail ? " · " + r.detail : ""}</div>
        </div>`
        )
        .join("") || `<div class="search-result-meta">No results</div>`;

    resultsDiv.querySelectorAll(".search-result-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = Number((el as HTMLElement).dataset.id);
        renderGraphExplorer(graph, id, entities, relationships, allChunks);
        onSelect(id);
      });
    });
  };
}