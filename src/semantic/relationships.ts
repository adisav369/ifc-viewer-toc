export interface Relationship {
  from: number;
  to: number;
  type: string;
}

export class RelationshipStore {
  private relationships: Relationship[] = [];
  private byFrom = new Map<number, Relationship[]>();
  private byTo = new Map<number, Relationship[]>();

  add(from: number, type: string, to: number) {
    const rel: Relationship = { from, to, type };
    this.relationships.push(rel);

    const fromList = this.byFrom.get(from) ?? [];
    fromList.push(rel);
    this.byFrom.set(from, fromList);

    const toList = this.byTo.get(to) ?? [];
    toList.push(rel);
    this.byTo.set(to, toList);
  }

  outgoing(id: number): Relationship[] {
    return this.byFrom.get(id) ?? [];
  }

  incoming(id: number): Relationship[] {
    return this.byTo.get(id) ?? [];
  }
}