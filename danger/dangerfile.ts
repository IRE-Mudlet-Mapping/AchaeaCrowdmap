import {message, danger} from "danger";
import * as rules from "./rules/index.ts";

Object.values(rules).forEach(rule => rule.check(danger));
