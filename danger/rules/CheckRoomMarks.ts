import * as fs from "fs";
import * as yaml from "js-yaml";
import * as _ from "lodash";
import { MapChangeRule } from "../classes/Rule";
import mapModel from "../helpers/MapModel";

const allowedRoomMarks = yaml.load(
  fs.readFileSync("./danger/rules/allowed_room_marks.yaml", "utf-8")
);

const allowedRoomMarkNames = Object.keys(allowedRoomMarks);
const existingRoomMarks = JSON.parse(mapModel.rooms[1].userData.gotoMapping);
const existingRoomMarkNames = Object.keys(existingRoomMarks);

const roomMarksNotFound = _.difference(
  allowedRoomMarkNames,
  existingRoomMarkNames
);
const roomMarksExtra = _.difference(
  existingRoomMarkNames,
  allowedRoomMarkNames
);

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
