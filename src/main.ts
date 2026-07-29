import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

// 1. Container for the 3D view
const container = document.getElementById("container")!;

// 2. Central app hub
const components = new OBC.Components();

// 3. World setup — using OrthoPerspectiveCamera for smooth orbit/pan/zoom
const worlds = components.get(OBC.Worlds);
const world = worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>();

world.scene = new OBC.SimpleScene(components);
world.scene.setup();
world.scene.three.background = new THREE.Color(0x202932);

world.renderer = new OBF.PostproductionRenderer(components, container);
world.camera = new OBC.OrthoPerspectiveCamera(components);
await world.camera.controls.setLookAt(78, 20, -2.2, 26, -4, 25);

components.init();

console.log("World ready:", world);

function setupHighlighter() {
  components.get(OBC.Raycasters).get(world);

  const highlighter = components.get(OBF.Highlighter);
  highlighter.setup({
    world,
    selectMaterialDefinition: {
      color: new THREE.Color("#bcf124"),
      opacity: 1,
      transparent: false,
      renderedFaces: 0,
    },
  });

  highlighter.events.select.onHighlight.add(async (modelIdMap) => {
    console.log("Element selected:", modelIdMap);
  });

  highlighter.events.select.onClear.add(() => {
    console.log("Selection cleared");
  });
}

async function setupIfcLoader() {
  const ifcLoader = components.get(OBC.IfcLoader);

  await ifcLoader.setup({
    autoSetWasm: false,
    wasm: {
      path: "https://unpkg.com/web-ifc@0.0.77/",
      absolute: true,
    },
  });

  const workerUrl = await OBC.FragmentsManager.getWorker();
  const fragments = components.get(OBC.FragmentsManager);
  fragments.init(workerUrl);

  world.camera.controls.addEventListener("update", () => fragments.core.update());

  fragments.list.onItemSet.add(({ value: model }) => {
    model.useCamera(world.camera.three);
    world.scene.three.add(model.object);
    fragments.core.update(true);
  });

  fragments.core.models.materials.list.onItemSet.add(({ value: material }) => {
    if (!("isLodMaterial" in material && material.isLodMaterial)) {
      material.polygonOffset = true;
      material.polygonOffsetUnits = 1;
      material.polygonOffsetFactor = Math.random();
    }
  });

  return { ifcLoader, fragments };
}

interface ElementInfo {
  id: number;
  guid: string;
  type: string;
  name: string;
}

async function extractMetadata(model: any) {
  const ids = await model.getItemsIds();
  console.log("Total items:", ids.length);

  const rawData = await model.getItemsData(ids);

  const elements: ElementInfo[] = rawData.map((item: any) => ({
    id: item._localId?.value,
    guid: item._guid?.value,
    type: item._category?.value,
    name: item.Name?.value ?? "(unnamed)",
  }));

  console.log("Clean extracted elements:", elements);
  return elements;
}

async function init() {
  const { ifcLoader, fragments } = await setupIfcLoader();

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
    setupHighlighter();

    const [model] = fragments.list.values();
    if (model) {
      await extractMetadata(model);
    }
  };
}

init();