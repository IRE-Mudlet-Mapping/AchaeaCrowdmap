import {MudletMapReader} from "mudlet-map-binary-reader";

const inputFile = "./Map/map";
import fs from "fs";
export default MudletMapReader.readBuffer(fs.readFileSync(inputFile));
