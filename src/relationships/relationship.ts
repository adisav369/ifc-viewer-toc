export interface RelationshipMetadata {
  [key: string]: string | number | boolean | undefined;
}

export interface Relationship {
  id: string;
  type: string;
  source: number;
  target: number;
  metadata: RelationshipMetadata;
  confidence: number;
  createdBy: string;
}