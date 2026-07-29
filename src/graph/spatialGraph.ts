export interface GraphNode {
  id: number;
  type: string;
  name: string;
}

export interface GraphData {
  nodes: Map<number, GraphNode>;
  parentOf: Map<number, number>;
  childrenOf: Map<number, number[]>;
}

async function getNodeInfo(model: any, localId: number): Promise<GraphNode> {
  const [data] = await model.getItemsData([localId]);
  return {
    id: localId,
    type: data?._category?.value ?? "Unknown",
    name: data?.Name?.value || "(unnamed)",
  };
}

export async function buildSpatialGraph(model: any): Promise<GraphData> {
  const tree = await model.getSpatialStructure();
  console.log("Raw spatial structure:", tree);

  const nodes = new Map<number, GraphNode>();
  const parentOf = new Map<number, number>();
  const childrenOf = new Map<number, number[]>();

  let totalCalls = 0;
  let skipped = 0;
  const sampleSkips: any[] = [];

  async function walk(node: any, parentId: number | null) {
  let currentId: number | null = null;

  if (typeof node.localId === "number") {
    const info = await getNodeInfo(model, node.localId);
    nodes.set(node.localId, info);
    currentId = node.localId;

    if (parentId !== null) {
      parentOf.set(node.localId, parentId);
      const siblings = childrenOf.get(parentId) ?? [];
      siblings.push(node.localId);
      childrenOf.set(parentId, siblings);
    }
  }

  const effectiveParentId = currentId !== null ? currentId : parentId;

  for (const child of node.children ?? []) {
    await walk(child, effectiveParentId);
  }
 }

  await walk(tree, null);

  console.log("Total walk() calls:", totalCalls);
  console.log("Skipped (no parent recorded):", skipped);
  console.log("Sample skipped nodes:", sampleSkips);

  return { nodes, parentOf, childrenOf };
}

function findAncestorOfType(graph: GraphData, elementId: number, type: string): GraphNode | undefined {
  let currentId = graph.parentOf.get(elementId);
  while (currentId !== undefined) {
    const node = graph.nodes.get(currentId);
    if (node && node.type === type) return node;
    currentId = graph.parentOf.get(currentId);
  }
  return undefined;
}

export function describeElement(graph: GraphData, elementId: number) {
  const element = graph.nodes.get(elementId);
  if (!element) {
    console.log("No graph data for this element.");
    return;
  }

  const storey = findAncestorOfType(graph, elementId, "IFCBUILDINGSTOREY");
  const building = findAncestorOfType(graph, elementId, "IFCBUILDING");
  const parentId = graph.parentOf.get(elementId);
  const parent = parentId !== undefined ? graph.nodes.get(parentId) : undefined;

  console.log(`Element\n↓\n${element.name}`);
  if (building) console.log(`↓\nBuilding\n${building.name}`);
  if (storey) console.log(`↓\nStorey\n${storey.name}`);
  console.log(`↓\nRelationships`);
  if (storey) console.log(`BELONGS_TO → ${storey.name}`);
  if (building) console.log(`PART_OF → ${building.name}`);
  console.log(`TYPE → ${element.type}`);
  if (parent) console.log(`PARENT → ${parent.name}`);
}

export function traceAncestors(graph: GraphData, elementId: number) {
  console.log("--- Ancestor trace ---");
  console.log("Has parent entry for this ID?", graph.parentOf.has(elementId));
  let currentId: number | undefined = elementId;
  while (currentId !== undefined) {
    const node = graph.nodes.get(currentId);
    console.log(`${node?.type ?? "?"} — ${node?.name ?? "?"} (id: ${currentId})`);
    currentId = graph.parentOf.get(currentId);
  }
  console.log("--- End trace ---");
}