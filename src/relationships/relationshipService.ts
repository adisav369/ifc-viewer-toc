import type { Relationship, RelationshipMetadata } from "./relationship";

let nextId = 1;

export class RelationshipService {
  private relationships: Relationship[] = [];
  private byFrom = new Map<number, Relationship[]>();
  private byTo = new Map<number, Relationship[]>();

  create(
    type: string,
    source: number,
    target: number,
    options: { metadata?: RelationshipMetadata; confidence?: number; createdBy?: string } = {}
  ): Relationship {
    const rel: Relationship = {
      id: `rel-${String(nextId++).padStart(3, "0")}`,
      type,
      source,
      target,
      metadata: options.metadata ?? {},
      confidence: options.confidence ?? 1.0,
      createdBy: options.createdBy ?? "manual",
    };

    this.relationships.push(rel);

    const fromList = this.byFrom.get(source) ?? [];
    fromList.push(rel);
    this.byFrom.set(source, fromList);

    const toList = this.byTo.get(target) ?? [];
    toList.push(rel);
    this.byTo.set(target, toList);

    return rel;
  }

  outgoing(id: number): Relationship[] {
    return this.byFrom.get(id) ?? [];
  }

  incoming(id: number): Relationship[] {
    return this.byTo.get(id) ?? [];
  }

  all(): Relationship[] {
    return this.relationships;
  }
}