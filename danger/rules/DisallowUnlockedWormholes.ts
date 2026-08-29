import type { MudletMap } from "mudlet-map-binary-reader";
import _ from "lodash";
import { RoomCheckRule } from "../classes/Rule.ts";
import mapModel from "../helpers/MapModel.ts";

export function createDisallowUnlockedWormholesRule(
  map: Pick<MudletMap, "rooms">
) {
  const rooms = _.filter(map.rooms, (room) =>
    Object.hasOwn(room.mSpecialExits, "worm warp") &&
    !room.mSpecialExitLocks?.includes("worm warp")
  );

  return new RoomCheckRule(rooms, 'rooms with unlocked wormholes', false);
}

export const disallowUnlockedWormholes =
  createDisallowUnlockedWormholesRule(mapModel);
