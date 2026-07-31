import type { ComplianceIssue } from "./inference";

export class IssueStore {
  private byAsset = new Map<number, ComplianceIssue[]>();

  add(issue: ComplianceIssue) {
    const list = this.byAsset.get(issue.affectsId) ?? [];
    list.push(issue);
    this.byAsset.set(issue.affectsId, list);
  }

  addMany(issues: ComplianceIssue[]) {
    for (const issue of issues) this.add(issue);
  }

  forAsset(assetId: number): ComplianceIssue[] {
    return this.byAsset.get(assetId) ?? [];
  }

  clear() {
    this.byAsset.clear();
  }

  get total(): number {
    return [...this.byAsset.values()].reduce((n, list) => n + list.length, 0);
  }
}