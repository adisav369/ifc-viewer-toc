import type { GraphContext, CheckResult } from "./rule";
import { ALL_RULES as COMPLIANCE_RULES } from "./compliance";
import { RISK_RULES } from "./risk";
import { createComplianceIssue, type ComplianceIssue } from "./inference";

const ALL_RULES = [...COMPLIANCE_RULES, ...RISK_RULES];

export interface EngineReport {
  totalEvaluated: number;
  totalApplicable: number;
  passed: number;
  failed: number;
  issues: ComplianceIssue[];
  allResults: CheckResult[];
}

export function runReasoningEngine(ctx: GraphContext): EngineReport {
  const report: EngineReport = {
    totalEvaluated: 0,
    totalApplicable: 0,
    passed: 0,
    failed: 0,
    issues: [],
    allResults: [],
  };

  const snapshot = [...ctx.entities.values()];

  for (const entity of snapshot) {
    for (const rule of ALL_RULES) {
      report.totalEvaluated++;
      if (!rule.applies(entity, ctx)) continue;

      report.totalApplicable++;
      const result = rule.evaluate(entity, ctx);

      report.allResults.push({
        entityId: entity.id,
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        passed: result.passed,
        reason: result.reason,
      });

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