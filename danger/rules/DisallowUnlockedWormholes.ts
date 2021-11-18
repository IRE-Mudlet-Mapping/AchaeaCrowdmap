import * as _ from "lodash";
import { RoomCheckRule } from "../classes/Rule";
import mapModel from "../helpers/MapModel";

const rooms = _.filter(mapModel.rooms, (room) =>
    _.some(room.mSpecialExits, (_, exitCommand) => exitCommand === "worm warp")
        && !_.some(room.mSpecialExitLocks, (exitCommand) => exitCommand === "worm warp")
);

export const disallowUnlockedWormholes = new RoomCheckRule(rooms, 'rooms with unlocked wormholes', false);