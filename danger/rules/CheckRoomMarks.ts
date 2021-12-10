import * as fs from "fs";
import * as yaml from "js-yaml";
import * as _ from "lodash";
import { MapChangeRule } from "../classes/Rule";
import mapModel from "../helpers/MapModel";

const allowedRoomMarks = yaml.load(
  fs.readFileSync("./danger/rules/allowed_room_marks.yaml", "utf-8")
);
const allowedRoomMarkNames = Object.keys(allowedRoomMarks);

const existingRoomMarks = _.mapValues(
  JSON.parse(mapModel.rooms[1].userData.gotoMapping),
  (value) => parseInt(value)
);
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

export const roomMarksNotFoundRule = new MapChangeRule(
  async () => roomMarksNotFound.length === 0,
  roomMarksNotFound.length === 0
    ? "Found no missing room marks."
    : `The following room marks are missing: ${roomMarksNotFound.toString()}`
);

export const roomMarksExtraRule = new MapChangeRule(
  async () => roomMarksExtra.length === 0,
  roomMarksExtra.length === 0
    ? "Found no extra room marks."
    : `The following room marks are not in the whitelist: ${roomMarksExtra.toString()}`
);

export const roomMarksMovedRule = new MapChangeRule(
  async () => roomMarksMoved.length === 0,
  roomMarksMoved.length === 0
    ? "Found no moved room marks"
    : `The following room marks were moved: ${roomMarksMoved.toString()}`
);
