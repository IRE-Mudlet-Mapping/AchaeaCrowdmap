const { MudletMapReader } = require("mudlet-map-binary-reader");
const yargs = require("yargs");

const argv = yargs.option("base-dir", {
  default: ".",
  type: "string",
  description: "The base directory to use the Maps directory from",
})
.help()
.argv;

const inputFile = `${argv.baseDir}/Map/map`;
const mapData = MudletMapReader.read(inputFile);
MudletMapReader.exportJson(mapData, `${argv.baseDir}/Map/map.json`, false)
MudletMapReader.exportJson(mapData, `${argv.baseDir}/Map/map_mini.json`, true)
MudletMapReader.export(mapData, `${argv.baseDir}/Map/`)