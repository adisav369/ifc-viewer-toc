import type { GraphContext } from "./rule";
import { ALL_RULES } from "./compliance";
import { createComplianceIssue, type ComplianceIssue } from "./inference";

export interface EngineReport {
  totalEvaluated: number;
  totalApplicable: number;
  passed: number;
  failed: number;
  issues: ComplianceIssue[];
}

export function runReasoningEngine(ctx: GraphContext): EngineReport {
  const report: EngineReport = {
    totalEvaluated: 0,
    totalApplicable: 0,
    passed: 0,
    failed: 0,
    issues: [],
  };

  // Snapshot entity list first — we mutate ctx.entities as issues are created,
  // and must not evaluate rules against the issues we generate.
  const snapshot = [...ctx.entities.values()];

  for (const entity of snapshot) {
    for (const rule of ALL_RULES) {
      report.totalEvaluated++;
      if (!rule.applies(entity, ctx)) continue;

      report.totalApplicable++;
      const result = rule.evaluate(entity, ctx);

      if (result.passed) {
        report.passed++;
      } else {
        report.failed++;
        const issue = createComplianceIssue(rule, entity, result, ctx);
        report.issues.push(issue);
      }
    }
  }

  return report;
}