import { Graph } from "./graph";
import { elementsOfType, wallsOnStorey, findAncestors } from "./queries";

export function runGraphDemo(graph: Graph) {
  console.log("\n========== GRAPH QUERY ENGINE DEMO ==========");

  const storeys = elementsOfType(graph, "IFCBUILDINGSTOREY");
  console.log(`\nFound ${storeys.length} storey(s).`);

  if (storeys.length > 0) {
    const storey = storeys[0];
    const walls = wallsOnStorey(graph, storey.id);
    console.log(`\nStorey:\n${storey.name}\n↓\nWalls`);
    walls.length === 0
      ? console.log("(none found directly on this storey)")
      : walls.forEach((w) => console.log(w?.name));
  }

  const doors = elementsOfType(graph, "IFCDOOR");
  console.log(`\nFound ${doors.length} door(s).`);

  if (doors.length > 0) {
    const door = doors[0];
    const chain = findAncestors(graph, door.id);
    console.log(`\nDoor\n${door.name}`);
    chain.forEach((a) => console.log(`↓\n${a?.type}\n${a?.name}`));
  }

  console.log("\n========== END DEMO ==========\n");
}