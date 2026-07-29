import { Graph } from "./graph";

export function parent(graph: Graph, id: number): number | undefined {
  return graph.getParentId(id);
}

export function children(graph: Graph, id: number): number[] {
  return graph.getChildrenIds(id);
}

export function ancestors(graph: Graph, id: number): number[] {
  const result: number[] = [];
  let currentId = graph.getParentId(id);
  while (currentId !== undefined) {
    result.push(currentId);
    currentId = graph.getParentId(currentId);
  }
  return result;
}

export function descendants(graph: Graph, id: number): number[] {
  const result: number[] = [];
  const stack = [...graph.getChildrenIds(id)];
  while (stack.length > 0) {
    const current = stack.pop()!;
    result.push(current);
    stack.push(...graph.getChildrenIds(current));
  }
  return result;
}