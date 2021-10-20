//import { DangerDSLType } from "danger";
import { MapChangeRule } from "../classes/Rule";

const versionFilePath = "Map/version.txt";

export const updateVersionFile = new MapChangeRule(
    async (danger: DangerDSLType) => {
        const versionFile = danger.git.fileMatch(versionFilePath);
        if (!versionFile.edited) {
            return false;
        }
        const versionFileDiff = await danger.git.diffForFile(versionFilePath);
        if (parseInt(versionFileDiff.before) + 1 != parseInt(versionFileDiff.after)) {
            return false;
        }
        return true;
    },
    "Updated `version.txt` by 1."
);