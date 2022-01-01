//import { DangerDSLType, message, warn, fail } from "danger";

import { DangerDSLType } from "danger";
import * as _ from "lodash";

/**
 * Type alias for a function that returns a human readable name.
 */
declare type ruleCheckMessageConstructor = () => string;

/**
 * Common interface for all rules.
 */
export interface Rule {
    /**
     * Central check function that is ran by danger.
     *
     * @param {DangerDSLType} danger The data danger can provide about the change.
     */
    check: (danger: DangerDSLType) => Promise<void>;
}

/**
 * Rule for sanity checks. It is usually silent, but prints a warning in case the check function returns a negative result.
 */
export class SanityCheckRule implements Rule {
    private readonly checkFunction: (danger: DangerDSLType) => Promise<boolean>;
    private readonly ruleCheckMessage: ruleCheckMessageConstructor;


    /**
     * Constructor of the rule.
     *
     * @param {(danger: DangerDSLType) => Promise<boolean>} checkFunction The implementation of the error check.
     * @param {ruleCheckMessageConstructor | string} ruleCheckMessage Function that returns a human readable string or that string directly.
     * Shown by danger in the resulting table.
     */
     constructor(checkFunction: (danger: DangerDSLType) => Promise<boolean>, ruleCheckMessage: ruleCheckMessageConstructor | string) {
        this.checkFunction = checkFunction;
        if (typeof ruleCheckMessage === "string") {
            this.ruleCheckMessage = () => ruleCheckMessage;
        } else {
            this.ruleCheckMessage = ruleCheckMessage;
        }
    }

    public async check(danger: DangerDSLType) {
        if (!await this.checkFunction(danger)) {
            warn(this.ruleCheckMessage());
        }
    };

}

/**
 * Rule that decides, whether the change is good (green) or contains errors (red).
 */
export class RedGreenRule implements Rule {
    private readonly checkFunction: (danger: DangerDSLType) => Promise<boolean>;
    private readonly ruleCheckMessage: ruleCheckMessageConstructor;

    /**
     * Constructor of the rule.
     *
     * @param {(danger: DangerDSLType) => Promise<boolean>} checkFunction The implementation of the error check.
     * @param {ruleCheckMessageConstructor | string} ruleCheckMessage Function that returns a human readable string or that string directly.
     * Shown by danger in the resulting table.
     */
    constructor(checkFunction: (danger: DangerDSLType) => Promise<boolean>, ruleCheckMessage: ruleCheckMessageConstructor | string) {
        this.checkFunction = checkFunction;
        if (typeof ruleCheckMessage === "string") {
            this.ruleCheckMessage = () => ruleCheckMessage;
        } else {
            this.ruleCheckMessage = ruleCheckMessage;
        }
    }

    public async check(danger: DangerDSLType): Promise<void> {
        if (await this.checkFunction(danger)) {
            message(this.ruleCheckMessage(), {icon: ':heavy_check_mark:'});
        } else {
            fail(this.ruleCheckMessage());
        }
    }
}

/**
 * Red/Green rule that only runs if the main map file was changed.
 */
export class MapChangeRule extends RedGreenRule {

    /**
     * Constructor of the rule.
     *
     * @param {(danger: DangerDSLType) => Promise<boolean>} checkFunction The implementation of the error check.
     * @param {ruleCheckMessageConstructor | string} ruleCheckMessage Function that returns a human readable string or that string directly.
     * Shown by danger in the resulting table.
     */
    constructor(checkFunction: (danger: DangerDSLType) => Promise<boolean>, ruleCheckMessage: ruleCheckMessageConstructor | string) {
        super(checkFunction, ruleCheckMessage);
    }

    public async check(danger: DangerDSLType) {
        if (danger.git.fileMatch("Map/map").modified) {
            await super.check(danger);
        }
    }
}

/**
 * Rule that checks, whether a given file was changed if the main map file was changed.
 */
export class SimpleFileChangeRule extends MapChangeRule {

    /**
     * Constructor of the rule.
     *
     * @param {string} readableFileName Human readable name of the file that must have changed.
     * @param {string} filePath The path of the file that must have changed. Relative to the project root.
     */
    constructor(readableFileName: string, filePath: string) {
        const checkFunction = async (danger: DangerDSLType) => {
            const file = danger.git.fileMatch(filePath);
            if (!file.edited) {
                return false;
            }
            return true;
        }
        super(checkFunction, `Updated ${readableFileName}.`);
    }
}

/**
 * Rule that checks, whether a pre-filtered array of rooms does not contain any items.
 */
export class RoomCheckRule extends MapChangeRule {

    /**
     * Constructor of the rule.
     *
     * @param filteredRooms Array or pre-filtered rooms. If this array contains any items, the check fails.
     * @param roomProperty Human readable description of the property that is checked.
     * @param echoFoundRooms Whether to echo the IDs of the found rooms. Defaults to true.
     */
    constructor(filteredRooms: any[], roomProperty: string, echoFoundRooms: boolean = true){

        const checkFunction = (_danger: DangerDSLType) =>
            Promise.resolve(filteredRooms.length === 0);

        let ruleCheckMessage: string;

        if (filteredRooms.length === 0) {
            ruleCheckMessage = `No ${roomProperty}.`;
        } else if (echoFoundRooms) {
            ruleCheckMessage = `Found ${roomProperty}: ${_.map(filteredRooms, (room) => room.id).toString()}`;
        } else {
            ruleCheckMessage = `Found ${roomProperty}.`;
        }

        super(checkFunction, ruleCheckMessage);
    }
}