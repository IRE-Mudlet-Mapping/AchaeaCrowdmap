const { MudletMapReader } = require("mudlet-map-binary-reader");

const inputFile = "./Map/map";
const mapData = MudletMapReader.read(inputFile);
MudletMapReader.exportJson(mapData, './Map/map.json', false)
MudletMapReader.exportJson(mapData, './Map/map_mini.json', true)
MudletMapReader.export(mapData, './Map/')