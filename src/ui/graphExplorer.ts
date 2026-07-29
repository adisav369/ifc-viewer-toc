import { Graph } from "../graph/graph";
import { ancestorOfType, findChildren } from "../graph/queries";
import type { Entity } from "../semantic/entity";
import type { RelationshipStore } from "../semantic/relationships";

export function renderGraphExplorer(
  graph: Graph,
  elementId: number,
  entities: Map<number, Entity>,
  relationships: RelationshipStore
) {
  //console.log("DEBUG — relationships param received:", relationships);
  const panel = document.getElementById("graph-explorer")!;
  const elementDiv = document.getElementById("ge-element")!;
  const relDiv = document.getElementById("ge-relationships")!;

  const node = graph.getNode(elementId);
  const entity = entities.get(elementId);
  if (!node) return;

  panel.style.display = "block";

  elementDiv.innerHTML = `
    <div class="row"><span class="label">Type:</span> ${node.type}</div>
    <div class="row"><span class="label">Name:</span> ${node.name}</div>
    <div class="row"><span class="label">Canonical Type:</span> ${entity?.entityType ?? "—"}</div>
    <div class="row"><span class="label">Domain:</span> ${entity?.domain ?? "—"}</div>
  `;

  const project = ancestorOfType(graph, elementId, "IFCPROJECT");
  const site = ancestorOfType(graph, elementId, "IFCSITE");
  const building = ancestorOfType(graph, elementId, "IFCBUILDING");
  const storey = ancestorOfType(graph, elementId, "IFCBUILDINGSTOREY");
  const children = findChildren(graph, elementId);

  const incomingDocs = relationships
    .incoming(elementId)
    .filter((r) => r.type === "DESCRIBES")
    .map((r) => entities.get(r.from)?.name)
    .filter(Boolean);

  relDiv.innerHTML = `
    <div class="row"><span class="label">Project:</span><br>└── ${project?.name ?? "—"}</div>
    <div class="row"><span class="label">Site:</span><br>└── ${site?.name ?? "—"}</div>
    <div class="row"><span class="label">Building:</span><br>└── ${building?.name || "—"}</div>
    <div class="row"><span class="label">Storey:</span><br>└── ${storey?.name ?? "—"}</div>
    <div class="row"><span class="label">Children:</span><br>${
      children.length ? children.map((c) => `└── ${c?.name}`).join("<br>") : "└── (none)"
    }</div>
    <div class="row"><span class="label">DESCRIBED_BY:</span><br>${
      incomingDocs.length ? incomingDocs.map((d) => `└── ${d}`).join("<br>") : "└── (none)"
    }</div>
  `;
}