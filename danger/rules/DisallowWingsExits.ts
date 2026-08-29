
import _ from "lodash";
import { RoomCheckRule } from "../classes/Rule.ts";
import mapModel from "../helpers/MapModel.ts";

const rooms = _.filter(mapModel.rooms, (room) =>
    _.some(room.mSpecialExits, (_, exitCommand) => exitCommand.includes("duana"))
);

export const disallowWingsExits = new RoomCheckRule(rooms, 'rooms with wings exits');
