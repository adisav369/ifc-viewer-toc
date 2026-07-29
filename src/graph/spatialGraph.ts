import { Graph, type GraphNode } from "./graph";

async function getNodeInfo(model: any, localId: number): Promise<GraphNode> {
  const [data] = await model.getItemsData([localId]);
  return {
    id: localId,
    type: data?._category?.value ?? "Unknown",
    name: data?.Name?.value || "(unnamed)",
  };
}

export async function buildSpatialGraph(model: any): Promise<Graph> {
  const tree = await model.getSpatialStructure();
  const graph = new Graph();

  async function walk(node: any, parentId: number | null) {
    let currentId: number | null = null;

    if (typeof node.localId === "number") {
      const info = await getNodeInfo(model, node.localId);
      graph.addNode(info);
      currentId = node.localId;

      if (parentId !== null) {
        graph.addEdge(parentId, node.localId);
      }
    }

    const effectiveParentId = currentId !== null ? currentId : parentId;

    for (const child of node.children ?? []) {
      await walk(child, effectiveParentId);
    }
  }

  await walk(tree, null);
  return graph;
}