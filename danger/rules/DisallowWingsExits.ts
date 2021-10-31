
//import { DangerDSLType } from "danger";
import { MudletMapReader } from "mudlet-map-binary-reader";
import * as _ from "lodash";
import { MapChangeRule } from "../classes/Rule";

const inputFile = "./Map/map"

const mapModel = MudletMapReader.read(inputFile);
const rooms = _.filter(mapModel.rooms, (room) =>
    _.some(room.mSpecialExits, (_, exitCommand) => exitCommand.match("duana"))
);

export const disallowWingsExits = new MapChangeRule(
    (_danger: DangerDSLType) => Promise.resolve(rooms.length === 0),
    () => {
        if (rooms.length === 0) {
            return 'No rooms with wings exits.'
        }
        return `Found rooms with wings exits: ${_.map(rooms, (room) => room.id).toString()}`
    }
)