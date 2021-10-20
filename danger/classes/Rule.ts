//import { DangerDSLType, message, fail } from "danger";

import { danger, DangerDSLType } from "danger";

export class Rule {
    private readonly checkFunction: (danger: DangerDSLType) => Promise<boolean>;
    private readonly readableName: string;

    constructor(checkFunction: (danger: DangerDSLType) => Promise<boolean>, readableName: string) {
        this.checkFunction = checkFunction;
        this.readableName = readableName;
    }

    public async check(danger: DangerDSLType): Promise<void> {
        if (await this.checkFunction(danger)) {
            message(this.readableName);
        } else {
            fail(this.readableName);
        }
    }
}

export class MapChangeRule extends Rule {

    constructor(checkFunction: (danger: DangerDSLType) => Promise<boolean>, readableName: string) {
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