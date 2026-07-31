export type GraphEvents = {
  "relationships:changed": { relationshipId: number; type: string; from: number; to: number };
};