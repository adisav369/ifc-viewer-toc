export interface GraphNode {
  id: number;
  type: string;
  name: string;
}

export type RelationType = "CONTAINS";

export interface GraphEdge {
  from: number;
  to: number;
  relation: RelationType;
}

export class Graph {
  nodes = new Map<number, GraphNode>();
  edges: GraphEdge[] = [];

  private childrenIndex = new Map<number, number[]>();
  private parentIndex = new Map<number, number>();

  addNode(node: GraphNode) {
    this.nodes.set(node.id, node);
  }

  addEdge(from: number, to: number, relation: RelationType = "CONTAINS") {
    this.edges.push({ from, to, relation });
    this.parentIndex.set(to, from);

    const siblings = this.childrenIndex.get(from) ?? [];
    siblings.push(to);
    this.childrenIndex.set(from, siblings);
  }

  getNode(id: number): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getParentId(id: number): number | undefined {
    return this.parentIndex.get(id);
  }

  getChildrenIds(id: number): number[] {
    return this.childrenIndex.get(id) ?? [];
  }
}