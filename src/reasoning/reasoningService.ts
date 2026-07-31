import type { Entity } from "../semantic/entity";
import type { Graph } from "../graph/graph";
import type { RelationshipService } from "../relationships/relationshipService";
import type { DocumentChunk } from "../documents/documentIndex";
import { runReasoningEngine, type EngineReport } from "./ruleEngine";
import { IssueStore } from "./issueStore";

export class ReasoningService {
  private isRunning = false;

  constructor(
    private relationships: RelationshipService,
    private issueStore: IssueStore,
    private getEntities: () => Map<number, Entity> | null,
    private getGraph: () => Graph | null,
    private chunks: DocumentChunk[]
  ) {
    this.relationships.events.on("relationships:changed", () => this.runNow());
  }

  runNow(): EngineReport | null {
    if (this.isRunning) return null;
    const entities = this.getEntities();
    const graph = this.getGraph();
    if (!entities || !graph) return null;

    this.isRunning = true;
    try {
      for (const [id, entity] of entities) {
        if (entity.entityType === "ComplianceIssue") entities.delete(id);
      }
      this.relationships.removeWhere((r) => r.createdBy === "inference");

      const report = runReasoningEngine({ graph, entities, relationships: this.relationships, chunks: this.chunks });
      this.issueStore.clear();
      this.issueStore.addMany(report.issues);

      console.log("[ReasoningService] auto-ran on relationship change");
      console.log(`Applicable checks: ${report.totalApplicable} | Passed: ${report.passed} | Failed: ${report.failed}`);
      console.log(`Generated ${report.issues.length} compliance issue(s)`);
      return report;
    } finally {
      this.isRunning = false;
    }
  }
}