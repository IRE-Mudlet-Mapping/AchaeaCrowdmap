import type { MudletMap } from "mudlet-map-binary-reader";
import _ from "lodash";
import { RoomCheckRule } from "../classes/Rule.ts";
import mapModel from "../helpers/MapModel.ts";

export function createDisallowWingsExitsRule(map: Pick<MudletMap, "rooms">) {
  const rooms = _.filter(map.rooms, (room) =>
    _.some(room.mSpecialExits, (_, exitCommand) => exitCommand.includes("duana"))
  );

  return new RoomCheckRule(rooms, 'rooms with wings exits');
}

export const disallowWingsExits = createDisallowWingsExitsRule(mapModel);
