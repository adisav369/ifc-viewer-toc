import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

export function setupHighlighter(
  components: OBC.Components,
  world: any,
  onSelect: (modelIdMap: any) => void
) {
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

  highlighter.events.select.onHighlight.add(onSelect);

  highlighter.events.select.onClear.add(() => {
    console.log("Selection cleared");
  });
}