import { Graph } from "../graph/graph";
import { ancestorOfType, findChildren } from "../graph/queries";

export function renderGraphExplorer(graph: Graph, elementId: number) {
  const panel = document.getElementById("graph-explorer")!;
  const elementDiv = document.getElementById("ge-element")!;
  const relDiv = document.getElementById("ge-relationships")!;

  const node = graph.getNode(elementId);
  if (!node) return;

  panel.style.display = "block";

  elementDiv.innerHTML = `
    <div class="row"><span class="label">Type:</span> ${node.type}</div>
    <div class="row"><span class="label">Name:</span> ${node.name}</div>
  `;

  const project = ancestorOfType(graph, elementId, "IFCPROJECT");
  const site = ancestorOfType(graph, elementId, "IFCSITE");
  const building = ancestorOfType(graph, elementId, "IFCBUILDING");
  const storey = ancestorOfType(graph, elementId, "IFCBUILDINGSTOREY");
  const children = findChildren(graph, elementId);

  relDiv.innerHTML = `
    <div class="row"><span class="label">Project:</span><br>└── ${project?.name ?? "—"}</div>
    <div class="row"><span class="label">Site:</span><br>└── ${site?.name ?? "—"}</div>
    <div class="row"><span class="label">Building:</span><br>└── ${building?.name || "—"}</div>
    <div class="row"><span class="label">Storey:</span><br>└── ${storey?.name ?? "—"}</div>
    <div class="row"><span class="label">Children:</span><br>${
      children.length
        ? children.map((c) => `└── ${c?.name}`).join("<br>")
        : "└── (none)"
    }</div>
  `;
}