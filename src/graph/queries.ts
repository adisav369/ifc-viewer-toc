import { Graph } from "./graph";
import { descendants, ancestors } from "./traversal";

export function elementsOfType(graph: Graph, type: string) {
  return [...graph.nodes.values()].filter((n) => n.type === type);
}

export function allWalls(graph: Graph) {
  return [...elementsOfType(graph, "IFCWALL"), ...elementsOfType(graph, "IFCWALLSTANDARDCASE")];
}

export function allDoors(graph: Graph) {
  return elementsOfType(graph, "IFCDOOR");
}

export function findChildren(graph: Graph, id: number) {
  return graph.getChildrenIds(id).map((cid) => graph.getNode(cid)).filter(Boolean);
}

export function findParent(graph: Graph, id: number) {
  const pid = graph.getParentId(id);
  return pid !== undefined ? graph.getNode(pid) : undefined;
}

export function findDescendants(graph: Graph, id: number) {
  return descendants(graph, id).map((did) => graph.getNode(did)).filter(Boolean);
}

export function findAncestors(graph: Graph, id: number) {
  return ancestors(graph, id).map((aid) => graph.getNode(aid)).filter(Boolean);
}

export function wallsOnStorey(graph: Graph, storeyId: number) {
  return findDescendants(graph, storeyId).filter(
    (n) => n?.type === "IFCWALL" || n?.type === "IFCWALLSTANDARDCASE"
  );
}
export function ancestorOfType(graph: Graph, id: number, type: string) {
  return findAncestors(graph, id).find((a) => a?.type === type);
}