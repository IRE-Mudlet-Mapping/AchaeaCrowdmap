import type { DangerDSLType } from "danger";
import { SanityCheckRule } from "../classes/Rule.ts";

export const warnDangerChangesWithoutTests = new SanityCheckRule(
  async (danger: DangerDSLType) => {
    const changedFiles = [
      ...danger.git.modified_files,
      ...danger.git.created_files,
      ...danger.git.deleted_files,
    ];
    const dangerFilesChanged = changedFiles.some(
      (path) => path.startsWith("danger/") && !path.startsWith("danger/tests/")
    );
    const dangerTestsChanged = [
      ...danger.git.modified_files,
      ...danger.git.created_files,
    ].some((path) => path.startsWith("danger/tests/"));

    return !dangerFilesChanged || dangerTestsChanged;
  },
  "Danger files changed without corresponding test changes."
);
