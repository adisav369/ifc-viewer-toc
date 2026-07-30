export const RelationshipTypes = {
  // Structural
  PART_OF: "PART_OF",
  CONTAINS: "CONTAINS",
  CONNECTED_TO: "CONNECTED_TO",

  // Spatial
  BELONGS_TO: "BELONGS_TO",
  LOCATED_IN: "LOCATED_IN",
  ADJACENT_TO: "ADJACENT_TO",

  // Document
  DESCRIBES: "DESCRIBES",
  REFERENCES: "REFERENCES",

  // Operational (future)
  MEASURES: "MEASURES",
  INSPECTED_BY: "INSPECTED_BY",
  MAINTAINED_BY: "MAINTAINED_BY",

  // Temporal (future)
  UPDATED_BY: "UPDATED_BY",
  SUPERSEDES: "SUPERSEDES",
} as const;

export const RelationshipCategory: Record<string, string> = {
  PART_OF: "Structural",
  CONTAINS: "Structural",
  CONNECTED_TO: "Structural",
  BELONGS_TO: "Spatial",
  LOCATED_IN: "Spatial",
  ADJACENT_TO: "Spatial",
  DESCRIBES: "Document",
  REFERENCES: "Document",
  MEASURES: "Operational",
  INSPECTED_BY: "Operational",
  MAINTAINED_BY: "Operational",
  UPDATED_BY: "Temporal",
  SUPERSEDES: "Temporal",
};