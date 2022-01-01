const { MudletMapReader } = require("mudlet-map-binary-reader");

const inputFile = "./Map/map";
const mapData = MudletMapReader.read(inputFile);
MudletMapReader.export(mapData, './Map/')