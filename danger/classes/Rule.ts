//import { DangerDSLType, message, fail } from "danger";

import { DangerDSLType } from "danger";

declare type ReadableNameGetter = () => string;

export interface Rule {
    check: (danger: DangerDSLType) => Promise<void>;
}

export class RedGreenRule implements Rule {
    private readonly checkFunction: (danger: DangerDSLType) => Promise<boolean>;
    private readonly readableName: ReadableNameGetter;

    constructor(checkFunction: (danger: DangerDSLType) => Promise<boolean>, readableName: ReadableNameGetter | string) {
        this.checkFunction = checkFunction;
        if (typeof readableName === "string") {
            this.readableName = () => readableName;
        } else {
            this.readableName = readableName;
        }
    }

    public async check(danger: DangerDSLType): Promise<void> {
        if (await this.checkFunction(danger)) {
            message(this.readableName(), {icon: ':heavy_check_mark:'});
        } else {
            fail(this.readableName());
        }
    }
}

export class MapChangeRule extends RedGreenRule {

    constructor(checkFunction: (danger: DangerDSLType) => Promise<boolean>, readableName: ReadableNameGetter | string) {
        super(checkFunction, readableName);
    }

    public async check(danger: DangerDSLType) {
        if (danger.git.fileMatch("Map/map").modified) {
            await super.check(danger);
        }
    }
}

export class SimpleFileChangeRule extends MapChangeRule {
    constructor(readableName: string, filePath: string) {
        const checkFunction = async (danger: DangerDSLType) => {
            const file = danger.git.fileMatch(filePath);
            if (!file.edited) {
                return false;
            }
            return true;
        }
        super(checkFunction, readableName);
    }
}