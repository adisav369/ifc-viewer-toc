import * as OBC from "@thatopen/components";
import { createWorld } from "./scene/world";
import { setupIfcLoader } from "./ifc/loader";
import { setupHighlighter } from "./selection/highlighter";
import { buildSpatialGraph, describeElement, traceAncestors, type GraphData } from "./graph/spatialGraph";

const container = document.getElementById("container")!;
const components = new OBC.Components();

const world = createWorld(components, container);
components.init();

let graph: GraphData | null = null;

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
    }

    setupHighlighter(components, world, (modelIdMap: any) => {
      console.log("Raw selection payload:", modelIdMap);
      console.log("Nodes:", graph.nodes.size, "| Parent links:", graph.parentOf.size, "| Children links:", graph.childrenOf.size);
      if (!graph) return;
      for (const idSet of Object.values(modelIdMap) as Set<number>[]) {
        for (const id of idSet) {
          describeElement(graph, id);
          traceAncestors(graph, id);
        }
      }
    });
  };
}

init();