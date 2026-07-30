export type Intent =
  | { type: "FindElements"; keyword?: string }
  | { type: "FindOnStorey"; storey: string; keyword?: string }
  | { type: "FindRelationshipsFor"; relationType: string; targetKeyword: string }
  | { type: "QueryDocumentContent"; docKeyword: string; topic: string }
  | { type: "ContextualQuestion"; topic: string }
  | { type: "Search"; term: string };

const ELEMENT_KEYWORDS = ["wall", "door", "window", "beam", "column", "space", "room"];

export function parseIntent(query: string): Intent {
  const q = query.trim().toLowerCase();

  const contextualMatch =
    q.match(/what (?:is|are) its (.+)/) ||
    q.match(/what (?:is|are) the (.+?) of (?:this|it)/);
  if (contextualMatch) {
    return { type: "ContextualQuestion", topic: contextualMatch[1].trim() };
  }

  const chunkQueryMatch = q.match(/what does (?:the )?(.+?) say about (.+)/);
  if (chunkQueryMatch) {
    return { type: "QueryDocumentContent", docKeyword: chunkQueryMatch[1].trim(), topic: chunkQueryMatch[2].trim() };
  }

  const describesMatch = q.match(/(?:documents?|specifications?)\s+describ\w*\s+(?:this\s+)?(.+)/);
  if (describesMatch) {
    return { type: "FindRelationshipsFor", relationType: "DESCRIBES", targetKeyword: describesMatch[1].trim() };
  }

  const describedByMatch = q.match(/(.+?)\s+described by\s+(?:the\s+)?(.+)/);
  if (describedByMatch) {
    return { type: "FindRelationshipsFor", relationType: "DESCRIBES", targetKeyword: describedByMatch[1].trim() };
  }

  const storeyMatch = q.match(/(.*)\bon\s+(level\s*\d+|storey\s*\d+|ground floor)/);
  if (storeyMatch) {
    const keyword = ELEMENT_KEYWORDS.find((k) => storeyMatch[1].includes(k));
    return { type: "FindOnStorey", storey: storeyMatch[2].trim(), keyword };
  }

  const keyword = ELEMENT_KEYWORDS.find((k) => q.includes(k));
  if (keyword && (q.startsWith("show") || q.startsWith("find") || q.startsWith("list") || q === keyword || q === keyword + "s")) {
    return { type: "FindElements", keyword };
  }

  return { type: "Search", term: query };
}