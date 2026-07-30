import { Graph } from "../graph/graph";
import { ancestorOfType, findChildren } from "../graph/queries";
import type { Entity } from "../semantic/entity";
import type { RelationshipService } from "../relationships/relationshipService";
import type { DocumentChunk } from "../documents/documentIndex";
import { chunksForDocument } from "../documents/documentQuery";

export function renderGraphExplorer(
  graph: Graph,
  elementId: number,
  entities: Map<number, Entity>,
  relationships: RelationshipService,
  allChunks: DocumentChunk[] = []
) {
  const panel = document.getElementById("graph-explorer")!;
  const elementDiv = document.getElementById("ge-element")!;
  const relDiv = document.getElementById("ge-relationships")!;

  const node = graph.getNode(elementId);
  const entity = entities.get(elementId);
  if (!entity) return;

  panel.style.display = "block";

  if (node) {
    elementDiv.innerHTML = `
      <div class="row"><span class="label">Type:</span> ${node.type}</div>
      <div class="row"><span class="label">Name:</span> ${node.name}</div>
      <div class="row"><span class="label">Canonical Type:</span> ${entity.entityType}</div>
      <div class="row"><span class="label">Domain:</span> ${entity.domain}</div>
    `;

    const project = ancestorOfType(graph, elementId, "IFCPROJECT");
    const site = ancestorOfType(graph, elementId, "IFCSITE");
    const building = ancestorOfType(graph, elementId, "IFCBUILDING");
    const storey = ancestorOfType(graph, elementId, "IFCBUILDINGSTOREY");
    const children = findChildren(graph, elementId);

    const incoming = relationships.incoming(elementId);
    const relationshipRows = incoming.map((r) => {
      const sourceEntity = entities.get(r.source);
      const metaEntries = Object.entries(r.metadata).map(([k, v]) => `${k}: ${v}`).join(" · ");
      return `
        <div class="row">
          <span class="label">${r.type}</span><br>
          └── ${sourceEntity?.name ?? "Unknown"}<br>
          ${metaEntries ? `&nbsp;&nbsp;&nbsp;&nbsp;${metaEntries}<br>` : ""}
          &nbsp;&nbsp;&nbsp;&nbsp;Confidence: ${r.confidence}<br>
          &nbsp;&nbsp;&nbsp;&nbsp;Created By: ${r.createdBy}
        </div>`;
    }).join("");

    relDiv.innerHTML = `
      <div class="row"><span class="label">Project:</span><br>└── ${project?.name ?? "—"}</div>
      <div class="row"><span class="label">Site:</span><br>└── ${site?.name ?? "—"}</div>
      <div class="row"><span class="label">Building:</span><br>└── ${building?.name || "—"}</div>
      <div class="row"><span class="label">Storey:</span><br>└── ${storey?.name ?? "—"}</div>
      <div class="row"><span class="label">Children:</span><br>${
        children.length ? children.map((c) => `└── ${c?.name}`).join("<br>") : "└── (none)"
      }</div>
      <div class="row"><span class="label">Relationships:</span></div>
      ${relationshipRows || '<div class="row">└── (none)</div>'}
    `;
    return;
  }

  if (entity.entityType === "Document") {
    elementDiv.innerHTML = `
      <div class="row"><span class="label">Type:</span> Document</div>
      <div class="row"><span class="label">Name:</span> ${entity.name}</div>
      <div class="row"><span class="label">Domain:</span> ${entity.domain}</div>
    `;

    const outgoing = relationships.outgoing(elementId);
    const describesRows = outgoing.filter((r) => r.type === "DESCRIBES").map((r) => {
      const target = entities.get(r.target);
      return `<div class="row">└── DESCRIBES → ${target?.name ?? "Unknown"}</div>`;
    }).join("");

    const docChunks = chunksForDocument(allChunks, elementId);
    const chunkRows = docChunks.slice(0, 5).map((c) => `
      <div class="row">
        └── Page ${c.page}<br>
        &nbsp;&nbsp;&nbsp;&nbsp;"${c.text.length > 120 ? c.text.slice(0, 120) + "..." : c.text}"
      </div>`).join("");

    relDiv.innerHTML = `
      <div class="row"><span class="label">Describes:</span></div>
      ${describesRows || '<div class="row">└── (none)</div>'}
      <div class="row"><span class="label">Chunks (${docChunks.length}):</span></div>
      ${chunkRows || '<div class="row">└── (none)</div>'}
    `;
    return;
  }

  if (entity.entityType === "DocumentChunk") {
    elementDiv.innerHTML = `
      <div class="row"><span class="label">Type:</span> Document Chunk</div>
      <div class="row"><span class="label">Name:</span> ${entity.name}</div>
    `;

    const parentRel = relationships.incoming(elementId).find((r) => r.type === "HAS_CHUNK");
    const parentDoc = parentRel ? entities.get(parentRel.source) : undefined;
    const chunk = allChunks.find((c) => c.id === elementId);

    relDiv.innerHTML = `
      <div class="row"><span class="label">From Document:</span><br>└── ${parentDoc?.name ?? "—"}</div>
      <div class="row"><span class="label">Page:</span><br>└── ${chunk?.page ?? "—"}</div>
      <div class="row"><span class="label">Text:</span><br>"${chunk?.text ?? ""}"</div>
    `;
    return;
  }

  elementDiv.innerHTML = `
    <div class="row"><span class="label">Type:</span> ${entity.entityType}</div>
    <div class="row"><span class="label">Name:</span> ${entity.name}</div>
    <div class="row"><span class="label">Domain:</span> ${entity.domain}</div>
  `;
  relDiv.innerHTML = `<div class="row">└── (no additional detail)</div>`;
}