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

const container = document.getElementById("container")!;
const components = new OBC.Components();

const world = createWorld(components, container);
components.init();

let graph: Graph | null = null;
let entities: Map<number, Entity> | null = null;

async function init() {
  await world.camera.controls.setLookAt(78, 20, -2.2, 26, -4, 25);

  const { ifcLoader, fragments } = await setupIfcLoader(components, world);

  const uploadScreen = document.getElementById("upload-screen")!;
  const uploadBtn = document.getElementById("upload-btn")!;
  const fileInput = document.getElementById("file-input") as HTMLInputElement;
  const status = document.getElementById("upload-status")!;

  uploadBtn.onclick = () => fileInput.click();

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
      console.log("Canonical entities built:", entities.size);
      console.log("Sample entity:", [...entities.values()][10]);
    }

    setupHighlighter(components, world, (modelIdMap: any) => {
      if (!graph || !entities) return;
      for (const idSet of Object.values(modelIdMap) as Set<number>[]) {
       for (const id of idSet) {
        renderGraphExplorer(graph, id, entities);
       }
      }
    });
  };
}

init();