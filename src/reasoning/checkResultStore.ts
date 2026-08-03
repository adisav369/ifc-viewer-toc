import type { CheckResult } from "./rule";

export class CheckResultStore {
  private byAsset = new Map<number, CheckResult[]>();

  add(result: CheckResult) {
    const list = this.byAsset.get(result.entityId) ?? [];
    list.push(result);
    this.byAsset.set(result.entityId, list);
  }

  addMany(results: CheckResult[]) {
    for (const r of results) this.add(r);
  }

  forAsset(assetId: number): CheckResult[] {
    return this.byAsset.get(assetId) ?? [];
  }

  clear() {
    this.byAsset.clear();
  }
}