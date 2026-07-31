import { MudletMapReader } from "mudlet-map-binary-reader";
import fs from "fs";
import yargs from "yargs";

const argv = yargs(process.argv).option("base-dir", {
  default: ".",
  type: "string",
  description: "The base directory to use the Maps directory from",
})
.help()
.argv;

const inputFile = `${argv.baseDir}/Map/map`;
const inputBuffer = fs.readFileSync(inputFile);
const mapData = MudletMapReader.readBuffer(inputBuffer);
const readableMap = MudletMapReader.exportJson(mapData, false);
fs.writeFileSync(`${argv.baseDir}/Map/map.json`, readableMap, "utf-8");
const miniMap = MudletMapReader.exportJson(mapData, true)
fs.writeFileSync(`${argv.baseDir}/Map/map-mini.json`, miniMap, "utf-8");
const {mapData: exportMapData, colors} = MudletMapReader.export(mapData);
fs.writeFileSync(`${argv.baseDir}/Map/mapExport.json`, JSON.stringify(exportMapData), "utf-8");
fs.writeFileSync(`${argv.baseDir}/Map/mapExport.js`, `mapData = ${JSON.stringify(exportMapData)}`, "utf-8");
fs.writeFileSync(`${argv.baseDir}/Map/colours.json`, JSON.stringify(colors), "utf-8");
fs.writeFileSync(`${argv.baseDir}/Map/colours.js`, `colours = ${JSON.stringify(colors)}`, "utf-8");
