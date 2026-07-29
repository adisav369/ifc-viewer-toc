export interface OntologyRule {
  entityType: string;
  domain: string;
}

export const IFC_ONTOLOGY: Record<string, OntologyRule> = {
  IFCWALL: { entityType: "PhysicalAsset", domain: "BIM" },
  IFCWALLSTANDARDCASE: { entityType: "PhysicalAsset", domain: "BIM" },
  IFCDOOR: { entityType: "PhysicalAsset", domain: "BIM" },
  IFCWINDOW: { entityType: "PhysicalAsset", domain: "BIM" },
  IFCBEAM: { entityType: "StructuralAsset", domain: "BIM" },
  IFCCOLUMN: { entityType: "StructuralAsset", domain: "BIM" },
  IFCSPACE: { entityType: "Space", domain: "BIM" },
  IFCBUILDINGSTOREY: { entityType: "Storey", domain: "BIM" },
  IFCBUILDING: { entityType: "Facility", domain: "BIM" },
  IFCSITE: { entityType: "Site", domain: "BIM" },
  IFCPROJECT: { entityType: "Project", domain: "BIM" },
};

export const DEFAULT_ENTITY_TYPE = "Unknown";
export const DEFAULT_DOMAIN = "BIM";