import type { MudletRoom } from "mudlet-map-binary-reader";
import * as fs from "fs";
import * as yaml from "js-yaml";
import _ from "lodash";
import { MapChangeRule } from "../classes/Rule.ts";
import mapModel from "../helpers/MapModel.ts";

type RoomMarkMap = {
  rooms: Record<number, Pick<MudletRoom, "userData">>;
};

const allowedRoomMarks = yaml.load(
  fs.readFileSync("./danger/rules/allowed_room_marks.yaml", "utf-8")
) as Record<string, number>;

export function createRoomMarkRules(
  map: RoomMarkMap,
  allowedRoomMarks: Record<string, number>
) {
  const existingRoomMarks = _.mapValues(
    JSON.parse(map.rooms[1].userData.gotoMapping),
    (value) => parseInt(value)
  );
  const allowedRoomMarkNames = Object.keys(allowedRoomMarks);
  const existingRoomMarkNames = Object.keys(existingRoomMarks);
  const roomMarksNotFound = _.difference(
    allowedRoomMarkNames,
    existingRoomMarkNames
  );
  const roomMarksExtra = _.difference(
    existingRoomMarkNames,
    allowedRoomMarkNames
  );
  const commonRoomMarks = _.intersection(
    allowedRoomMarkNames,
    existingRoomMarkNames
  );
  const roomMarksMoved = _.chain(commonRoomMarks)
    .filter((name) => allowedRoomMarks[name] !== existingRoomMarks[name])
    .map(
      (name) =>
        `${name} (from ${allowedRoomMarks[name]} to ${existingRoomMarks[name]})`
    )
    .value();

  return {
    roomMarksNotFoundRule: new MapChangeRule(
      async () => roomMarksNotFound.length === 0,
      roomMarksNotFound.length === 0
        ? "Found no missing room marks."
        : `The following room marks are missing: ${roomMarksNotFound.toString()}`
    ),
    roomMarksExtraRule: new MapChangeRule(
      async () => roomMarksExtra.length === 0,
      roomMarksExtra.length === 0
        ? "Found no extra room marks."
        : `The following room marks are not in the whitelist: ${roomMarksExtra.toString()}`
    ),
    roomMarksMovedRule: new MapChangeRule(
      async () => roomMarksMoved.length === 0,
      roomMarksMoved.length === 0
        ? "Found no moved room marks"
        : `The following room marks were moved: ${roomMarksMoved.toString()}`
    ),
  };
}

export const {
  roomMarksNotFoundRule,
  roomMarksExtraRule,
  roomMarksMovedRule,
} = createRoomMarkRules(mapModel, allowedRoomMarks);
