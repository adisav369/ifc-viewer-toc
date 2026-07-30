export interface SearchableEntity {
  id: number;
  name: string;
  entityType: string;
  domain: string;
  nativeType: string;
}

export interface SearchResult {
  entity: SearchableEntity;
  score: number;
}