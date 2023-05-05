import * as _ from "lodash";
import { MapChangeRule } from "../classes/Rule";
import mapModel from "../helpers/MapModel";

const areasWithAllRoomsLocked = _.chain(mapModel.areas)
  .map((area, id) => {return {area, id}})
  .filter((obj) => obj.area.rooms.length > 0) // sort out areas with 0 rooms. Those seem to exist.
  .filter((obj) => // find areas with all rooms locked
    _.every(obj.area.rooms, (room) => mapModel.rooms[room].isLocked)
  )
  .map((obj) => obj.id) // extract the ID from the area
  .map((id) => mapModel.areaNames[id])  // translate the area ID to its name
  .value();

console.log(areasWithAllRoomsLocked)

export const disallowLockedAreas = new MapChangeRule(
  async () => areasWithAllRoomsLocked.length === 0,
  areasWithAllRoomsLocked.length === 0
    ? "All areas unlocked."
    : `Found the following locked areas: ${areasWithAllRoomsLocked.toString()}`
);
