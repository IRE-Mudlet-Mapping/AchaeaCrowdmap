import type { MudletMap } from "mudlet-map-binary-reader";
import _ from "lodash";
import { MapChangeRule } from "../classes/Rule.ts";
import mapModel from "../helpers/MapModel.ts";

export function createDisallowLockedAreasRule(
  map: Pick<MudletMap, "areaNames" | "areas" | "rooms">
) {
  const areasWithAllRoomsLocked = _.chain(map.areas)
    .map((area, id) => {return {area, id}})
    .filter((obj) => obj.area.rooms.length > 0) // sort out areas with 0 rooms. Those seem to exist.
    .filter((obj) => // find areas with all rooms locked
      _.every(obj.area.rooms, (room) => map.rooms[room].isLocked)
    )
    .map((obj) => obj.id) // extract the ID from the area
    .map((id) => map.areaNames[id])  // translate the area ID to its name
    .value();

  console.log(areasWithAllRoomsLocked)

  return new MapChangeRule(
    async () => areasWithAllRoomsLocked.length === 0,
    areasWithAllRoomsLocked.length === 0
      ? "All areas unlocked."
      : `Found the following locked areas: ${areasWithAllRoomsLocked.toString()}`
  );
}

export const disallowLockedAreas = createDisallowLockedAreasRule(mapModel);
