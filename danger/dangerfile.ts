import {message, danger} from "danger";
import * as rules from "./rules";

Object.values(rules).forEach(rule => rule.check(danger))

const newFiles = danger.git.created_files.join("- ")
message("New Files in this PR: \n - " + newFiles);
