import type { Relationship, RelationshipMetadata } from "./relationship";
import { EventBus } from "../core/eventBus";
import type { GraphEvents } from "../core/graphEvents";

let nextId = 1;

export class RelationshipService {
  private relationships: Relationship[] = [];
  private byFrom = new Map<number, Relationship[]>();
  private byTo = new Map<number, Relationship[]>();

  readonly events = new EventBus<GraphEvents>();

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

    this.events.emit("relationships:changed", {
      relationshipId: rel.id,
      type: rel.type,
      source: rel.source,
      target: rel.target,
    });

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

  removeWhere(predicate: (r: Relationship) => boolean) {
    this.relationships = this.relationships.filter((r) => !predicate(r));
    for (const [key, list] of this.byFrom) {
      this.byFrom.set(key, list.filter((r) => !predicate(r)));
    }
    for (const [key, list] of this.byTo) {
      this.byTo.set(key, list.filter((r) => !predicate(r)));
    }
  }
}