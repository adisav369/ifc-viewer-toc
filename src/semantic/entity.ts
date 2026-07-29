export interface EntitySource {
  system: string;
  nativeType: string;
}

export interface Entity {
  id: number;
  entityType: string;
  domain: string;
  name: string;
  source: EntitySource;
}