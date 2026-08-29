import type { MudletMap } from "mudlet-map-binary-reader";
import _ from "lodash";
import { RoomCheckRule } from "../classes/Rule.ts";
import mapModel from "../helpers/MapModel.ts";

export function createDisallowStockroomsRule(map: Pick<MudletMap, "rooms">) {
  const rooms = _.filter(map.rooms, (room) =>
    room.symbol === '$' && room.down !== -1
  );

  return new RoomCheckRule(rooms, 'shops with stockrooms');
}

export const disallowStockrooms = createDisallowStockroomsRule(mapModel);
