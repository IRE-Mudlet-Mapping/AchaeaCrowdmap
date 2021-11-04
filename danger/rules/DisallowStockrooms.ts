
import * as _ from "lodash";
import { RoomCheckRule } from "../classes/Rule";
import mapModel from "../helpers/MapModel";


const rooms = _.filter(mapModel.rooms, (room) =>
    room.symbol === '$' && room.down !== -1
);

export const disallowStockrooms = new RoomCheckRule(rooms, 'shops with stockrooms');