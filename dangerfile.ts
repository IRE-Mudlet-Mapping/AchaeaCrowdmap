import {message, danger} from "danger"

const newFiles = danger.git.created_files.join("- ")
message("New Files in this PR: \n - " + newFiles);
