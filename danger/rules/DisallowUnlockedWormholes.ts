import * as _ from "lodash";
import { RoomCheckRule } from "../classes/Rule";
import mapModel from "../helpers/MapModel";

const exitLocked = (room: MudletRoom, target: number) => {
    return room.mSpecialExitLocks?.some(specialTarget => specialTarget === target) ?? false;
}

const rooms = _.filter(mapModel.rooms, (room) =>
    _.some(room.mSpecialExits, (target, exitCommand) =>
        exitCommand === "worm warp" && !exitLocked(room, target)
    )
);

export const disallowUnlockedWormholes = new RoomCheckRule(rooms, 'rooms with unlocked wormholes', false);