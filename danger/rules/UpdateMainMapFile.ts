import { DangerDSLType } from "danger";
import { SanityCheckRule } from "../classes/Rule";

export const updateMainMapFile = new SanityCheckRule(
  async (danger: DangerDSLType) => {
    const file = danger.git.fileMatch('Map/map');
    return file.edited;
  },
  "Main map file not edited. Are you sure you uploaded the file with the correct name?"
);