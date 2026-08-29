import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { DangerDSLType } from "danger";
import type { Rule } from "../classes/Rule.ts";
import { createRoomMarkRules } from "../rules/CheckRoomMarks.ts";
import { checkCorrectBranch } from "../rules/CorrectBranch.ts";
import { createDisallowLockedAreasRule } from "../rules/DisallowLockedAreas.ts";
import { createDisallowStockroomsRule } from "../rules/DisallowStockrooms.ts";
import { createDisallowUnlockedWormholesRule } from "../rules/DisallowUnlockedWormholes.ts";
import { createDisallowWingsExitsRule } from "../rules/DisallowWingsExits.ts";
import { updateChangelog } from "../rules/UpdateChangelog.ts";
import { updateMainMapFile } from "../rules/UpdateMainMapFile.ts";
import { updateVersionFile } from "../rules/UpdateVersionFile.ts";
import { warnDangerChangesWithoutTests } from "../rules/WarnDangerChangesWithoutTests.ts";

const results = {
  failures: [] as string[],
  messages: [] as string[],
  warnings: [] as string[],
};

Object.assign(globalThis, {
  fail: (text: string) => results.failures.push(text),
  message: (text: string) => results.messages.push(text),
  warn: (text: string) => results.warnings.push(text),
});

function resetResults() {
  results.failures.length = 0;
  results.messages.length = 0;
  results.warnings.length = 0;
}

function createDanger({
  base = "development",
  created = [],
  deleted = [],
  diffs = {},
  modified = [],
  withPullRequest = true,
}: {
  base?: string;
  created?: string[];
  deleted?: string[];
  diffs?: Record<string, { before: string; after: string }>;
  modified?: string[];
  withPullRequest?: boolean;
} = {}) {
  const matches = (files: string[], pattern: string) => files.includes(pattern);

  return {
    git: {
      created_files: created,
      deleted_files: deleted,
      modified_files: modified,
      diffForFile: async (path: string) => diffs[path],
      fileMatch: (pattern: string) => {
        const isCreated = matches(created, pattern);
        const isDeleted = matches(deleted, pattern);
        const isModified = matches(modified, pattern);
        return {
          created: isCreated,
          deleted: isDeleted,
          edited: isCreated || isDeleted || isModified,
          modified: isModified,
        };
      },
    },
    github: withPullRequest ? { pr: { base: { ref: base } } } : undefined,
  } as unknown as DangerDSLType;
}

function loadMapFixture(name: string) {
  return JSON.parse(
    readFileSync(new URL(`./maps/${name}.json`, import.meta.url), "utf8")
  );
}

async function check(rule: Rule, danger = createDanger({ modified: ["Map/map"] })) {
  resetResults();
  await rule.check(danger);
  return results;
}

test("CorrectBranch warns only for a non-development target", async () => {
  assert.equal((await check(checkCorrectBranch)).warnings.length, 0);
  assert.equal(
    (
      await check(
        checkCorrectBranch,
        createDanger({ withPullRequest: false })
      )
    ).warnings.length,
    0
  );
  assert.match(
    (await check(checkCorrectBranch, createDanger({ base: "main" }))).warnings[0],
    /target branch/
  );
});

test("UpdateMainMapFile warns when the main map is unchanged", async () => {
  assert.equal((await check(updateMainMapFile)).warnings.length, 0);
  assert.match(
    (await check(updateMainMapFile, createDanger())).warnings[0],
    /Main map file not edited/
  );
});

test("UpdateChangelog requires a changelog edit with a map change", async () => {
  assert.equal(
    (await check(updateChangelog, createDanger({ modified: ["Map/map"] })))
      .failures.length,
    1
  );
  assert.equal(
    (
      await check(
        updateChangelog,
        createDanger({ modified: ["Map/map", "Map/changelog.txt"] })
      )
    ).messages.length,
    1
  );
  assert.equal((await check(updateChangelog, createDanger())).failures.length, 0);
});

test("UpdateVersionFile requires an increment of exactly one", async () => {
  const valid = createDanger({
    diffs: { "Map/version.txt": { before: "41", after: "42" } },
    modified: ["Map/map", "Map/version.txt"],
  });
  const invalid = createDanger({
    diffs: { "Map/version.txt": { before: "41", after: "43" } },
    modified: ["Map/map", "Map/version.txt"],
  });

  assert.equal((await check(updateVersionFile, valid)).messages.length, 1);
  assert.equal((await check(updateVersionFile, invalid)).failures.length, 1);
});

test("DisallowWingsExits rejects duana special exits", async () => {
  const maps = loadMapFixture("wings-exits");
  assert.equal(
    (await check(createDisallowWingsExitsRule(maps.valid))).messages.length,
    1
  );
  assert.match(
    (await check(createDisallowWingsExitsRule(maps.invalid))).failures[0],
    /rooms with wings exits: 1/
  );
});

test("DisallowStockrooms rejects shops with a down exit", async () => {
  const maps = loadMapFixture("stockrooms");
  assert.equal(
    (await check(createDisallowStockroomsRule(maps.valid))).messages.length,
    1
  );
  assert.match(
    (await check(createDisallowStockroomsRule(maps.invalid))).failures[0],
    /shops with stockrooms: 1/
  );
});

test("DisallowUnlockedWormholes accepts locked and rejects unlocked wormholes", async () => {
  const maps = loadMapFixture("wormholes");
  assert.equal(
    (await check(createDisallowUnlockedWormholesRule(maps.locked))).messages
      .length,
    1
  );
  assert.match(
    (await check(createDisallowUnlockedWormholesRule(maps.unlocked))).failures[0],
    /unlocked wormholes/
  );
});

test("DisallowLockedAreas rejects areas whose non-empty room set is locked", async () => {
  const maps = loadMapFixture("locked-areas");
  assert.equal(
    (await check(createDisallowLockedAreasRule(maps.valid))).messages.length,
    1
  );
  assert.match(
    (await check(createDisallowLockedAreasRule(maps.invalid))).failures[0],
    /Closed/
  );
});

test("room mark rules detect missing, extra, and moved marks", async () => {
  const maps = loadMapFixture("room-marks");
  const valid = createRoomMarkRules(maps.valid, maps.allowed);
  for (const rule of Object.values(valid)) {
    assert.equal((await check(rule)).messages.length, 1);
  }

  assert.match(
    (await check(createRoomMarkRules(maps.missing, maps.allowed).roomMarksNotFoundRule))
      .failures[0],
    /bank/
  );
  assert.match(
    (await check(createRoomMarkRules(maps.extra, maps.allowed).roomMarksExtraRule))
      .failures[0],
    /shop/
  );
  assert.match(
    (await check(createRoomMarkRules(maps.moved, maps.allowed).roomMarksMovedRule))
      .failures[0],
    /home \(from 10 to 11\)/
  );
});

test("Danger source changes warn unless tests change too", async () => {
  assert.match(
    (
      await check(
        warnDangerChangesWithoutTests,
        createDanger({ modified: ["danger/rules/UpdateChangelog.ts"] })
      )
    ).warnings[0],
    /without corresponding test changes/
  );
  assert.equal(
    (
      await check(
        warnDangerChangesWithoutTests,
        createDanger({
          created: ["danger/tests/maps/changelog.json"],
          modified: ["danger/rules/UpdateChangelog.ts"],
        })
      )
    ).warnings.length,
    0
  );
  assert.equal(
    (
      await check(
        warnDangerChangesWithoutTests,
        createDanger({
          deleted: ["danger/tests/obsolete.test.ts"],
          modified: ["danger/rules/UpdateChangelog.ts"],
        })
      )
    ).warnings.length,
    1
  );
  assert.equal(
    (
      await check(
        warnDangerChangesWithoutTests,
        createDanger({ modified: ["Map/changelog.txt"] })
      )
    ).warnings.length,
    0
  );
});
