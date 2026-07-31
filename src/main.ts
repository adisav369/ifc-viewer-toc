import * as OBC from "@thatopen/components";
import { createWorld } from "./scene/world";
import { setupIfcLoader } from "./ifc/loader";
import { setupHighlighter } from "./selection/highlighter";
import { buildSpatialGraph } from "./graph/spatialGraph";
import type { Graph } from "./graph/graph";
import { runGraphDemo } from "./graph/demo";
import { findAncestors } from "./graph/queries";
import { renderGraphExplorer } from "./ui/graphExplorer";
import { buildEntityMap } from "./semantic/entityMapper";
import type { Entity } from "./semantic/entity";
import { extractPdf } from "./connectors/documents/pdfConnector";
import { mapDocumentToEntity } from "./connectors/documents/documentMapper";
import { RelationshipService } from "./relationships/relationshipService";
import { RelationshipTypes } from "./relationships/relationshipTypes";
import { allWalls } from "./graph/queries";
import { SearchService } from "./search/searchService";
import { buildSearchIndex } from "./search/searchIndex";
import { setupSearchPanel } from "./ui/searchPanel";
import type { DocumentChunk } from "./documents/documentIndex";
import { ingestDocumentChunks } from "./documents/documentService";
import { renderEvidencePanel } from "./ui/evidencePanel";
import { runReasoningEngine } from "./reasoning/ruleEngine";
import { IssueStore } from "./reasoning/issueStore";


const container = document.getElementById("container")!;
const components = new OBC.Components();

const allChunks: DocumentChunk[] = [];

const world = createWorld(components, container);
components.init();

const searchService = new SearchService();
let currentModelId: string | null = null;

let graph: Graph | null = null;
let entities: Map<number, Entity> | null = null;

let selectedEntityId: number | null = null;

const relationships = new RelationshipService();

const issueStore = new IssueStore();

async function init() {
  await world.camera.controls.setLookAt(78, 20, -2.2, 26, -4, 25);

  const { ifcLoader, fragments } = await setupIfcLoader(components, world);

  const uploadScreen = document.getElementById("upload-screen")!;
  const uploadBtn = document.getElementById("upload-btn")!;
  const fileInput = document.getElementById("file-input") as HTMLInputElement;
  const status = document.getElementById("upload-status")!;

  uploadBtn.onclick = () => fileInput.click();
    const highlighter = setupHighlighter(components, world, (modelIdMap: any) => {
      if (!graph || !entities) return;
      //console.log("DEBUG — relationships at call site:", relationships);
      for (const idSet of Object.values(modelIdMap) as Set<number>[]) {
       for (const id of idSet) {
        selectedEntityId = id;
        renderGraphExplorer(graph, id, entities, relationships, allChunks, issueStore);
       }
      }
    });

  fileInput.onchange = async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    status.textContent = "Converting IFC to Fragments... please wait";

    const data = await file.arrayBuffer();
    const buffer = new Uint8Array(data);

    await ifcLoader.load(buffer, false, file.name, {
      processData: {
        progressCallback: (progress: number) => {
          status.textContent = `Converting... ${Math.round(progress * 100)}%`;
        },
      },
    });

    uploadScreen.style.display = "none";

    const [model] = fragments.list.values();
    if (model) {
      status.textContent = "Building relationship graph...";
      graph = await buildSpatialGraph(model);
      console.log("Graph built. Total nodes:", graph.nodes.size);
      runGraphDemo(graph);
      entities = buildEntityMap(graph.nodes);
      currentModelId = file.name;
      searchService.setIndex(buildSearchIndex(entities));

      setupSearchPanel(searchService, graph, entities, relationships, allChunks, () => selectedEntityId, (id: number) => {
       selectedEntityId = id;
       if (id > 0 && currentModelId) {
        const modelIdMap = { [currentModelId]: new Set([id]) };
        highlighter.highlightByID("select", modelIdMap, true, true);
       }
      });
      const pdfBtn = document.getElementById("pdf-upload-btn") as HTMLButtonElement;
      const pdfInput = document.getElementById("pdf-input") as HTMLInputElement;
      pdfBtn.style.display = "block";

      pdfBtn.onclick = () => pdfInput.click();

      pdfInput.onchange = async () => {
       const file = pdfInput.files?.[0];
       if (!file || !graph || !entities) return;

       console.log("Extracting PDF...");
       const doc = await extractPdf(file);
       console.log("Extracted document:", { title: doc.title, pageCount: doc.pageCount, textPreview: doc.text.slice(0, 200) });

       const docEntity = mapDocumentToEntity(doc);
       entities.set(docEntity.id, docEntity);
       searchService.setIndex(buildSearchIndex(entities));
       console.log("Canonical document entity:", docEntity);

       const walls = allWalls(graph);
       const targetWall = walls[0];
       if (targetWall) {
        const rel = relationships.create(RelationshipTypes.DESCRIBES, docEntity.id, targetWall.id, {
          metadata: { page: 14, section: "Fire Rating" },
          confidence: 1.0,
          createdBy: "manual",
        });
        console.log(`Created relationship ${rel.id}: "${docEntity.name}" ${rel.type} "${targetWall.name}"`);
       }
       const chunks = ingestDocumentChunks(docEntity.id, doc.pages, entities, relationships);
       allChunks.push(...chunks);
       console.log(`Ingested ${chunks.length} chunks for "${docEntity.name}"`);

       searchService.setIndex(buildSearchIndex(entities));
       const report = runReasoningEngine({ graph: graph!, entities, relationships });
       issueStore.clear();
       issueStore.addMany(report.issues);
       console.log("=== Reasoning Engine ===");
       console.log(`Applicable checks: ${report.totalApplicable} | Passed: ${report.passed} | Failed: ${report.failed}`);
       console.log(`Generated ${report.issues.length} compliance issue(s)`);
       console.log(`Applicable checks: ${report.totalApplicable} | Passed: ${report.passed} | Failed: ${report.failed}`);
       console.log(`Generated ${report.issues.length} compliance issue(s)`);
       report.issues.slice(0, 10).forEach((i) => console.log(`  [${i.severity}] ${i.name} — ${i.reason}`));

       searchService.setIndex(buildSearchIndex(entities));
     };
      console.log("Canonical entities built:", entities.size);
      console.log("Sample entity:", [...entities.values()][10]);
    }

  };
}

init();