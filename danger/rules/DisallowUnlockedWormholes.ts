import _ from "lodash";
import { RoomCheckRule } from "../classes/Rule.ts";
import mapModel from "../helpers/MapModel.ts";

const rooms = _.filter(mapModel.rooms, (room) =>
    Object.hasOwn(room.mSpecialExits, "worm warp") &&
    !room.mSpecialExitLocks?.includes("worm warp")
);

export const disallowUnlockedWormholes = new RoomCheckRule(rooms, 'rooms with unlocked wormholes', false);
