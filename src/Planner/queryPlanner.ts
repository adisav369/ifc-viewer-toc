import type { Intent } from "./intentParser";

export interface QueryPlan {
  action: "listByNativeTypeKeyword" | "listOnStoreyByKeyword" | "listRelationshipsFor" | "search";
  keyword?: string;
  storey?: string;
  relationType?: string;
  targetKeyword?: string;
  term?: string;
}

export function planQuery(intent: Intent): QueryPlan {
  switch (intent.type) {
    case "FindElements":
      return { action: "listByNativeTypeKeyword", keyword: intent.keyword };
    case "FindOnStorey":
      return { action: "listOnStoreyByKeyword", keyword: intent.keyword, storey: intent.storey };
    case "FindRelationshipsFor":
      return { action: "listRelationshipsFor", relationType: intent.relationType, targetKeyword: intent.targetKeyword };
    case "Search":
      return { action: "search", term: intent.term };
  }
}