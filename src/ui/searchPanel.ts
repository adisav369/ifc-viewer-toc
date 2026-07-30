import { Graph } from "../graph/graph";
import type { Entity } from "../semantic/entity";
import type { RelationshipService } from "../relationships/relationshipService";
import { SearchService } from "../search/searchService";
import type { DocumentChunk } from "../documents/documentIndex";
import { parseIntent } from "../planner/intentParser";
import { planQuery } from "../planner/queryPlanner";
import { executeQuery } from "../planner/queryExecutor";
import { renderGraphExplorer } from "./graphExplorer";
import { findRelatedDocuments } from "../retrieval/contextRetriever";
import { retrieveEvidence } from "../retrieval/chunkRetriever";
import { renderEvidencePanel } from "./evidencePanel";

export function setupSearchPanel(
  searchService: SearchService,
  graph: Graph,
  entities: Map<number, Entity>,
  relationships: RelationshipService,
  allChunks: DocumentChunk[],
  getSelectedEntityId: () => number | null,
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
      renderEvidencePanel([]);
      return;
    }

    const intent = parseIntent(query);
    const plan = planQuery(intent);
    console.log("Intent:", intent, "| Plan:", plan);

    if (plan.action === "contextualQuery") {
      const selectedId = getSelectedEntityId();

      if (selectedId === null) {
        resultsDiv.innerHTML = `<div class="search-result-meta">Select an element first, then ask about "it".</div>`;
        renderEvidencePanel([]);
        return;
      }

      const docs = findRelatedDocuments(selectedId, entities, relationships);
      const evidence = retrieveEvidence(docs, plan.term ?? "", allChunks);
      renderEvidencePanel(evidence);

      resultsDiv.innerHTML = evidence.length
        ? `<div class="search-result-meta">${evidence.length} evidence item(s) — see Evidence panel below.</div>`
        : `<div class="search-result-meta">No related documents found for the selected element.</div>`;
      return;
    }

    renderEvidencePanel([]);

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