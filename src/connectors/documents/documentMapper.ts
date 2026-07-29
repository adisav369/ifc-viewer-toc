import type { Entity } from "../../semantic/entity";
import type { ExtractedDocument } from "./pdfConnector";

let nextDocId = -1;

export function mapDocumentToEntity(doc: ExtractedDocument): Entity {
  const id = nextDocId--;

  return {
    id,
    entityType: "Document",
    domain: "Documents",
    name: doc.title,
    source: {
      system: "PDF",
      nativeType: "Document",
    },
  };
}