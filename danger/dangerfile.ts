import {message, danger} from "danger";
import * as rules from "./rules";

Object.values(rules).forEach(rule => rule.check(danger));
