import mudletMapBinaryReader from "mudlet-map-binary-reader";

const inputFile = "./Map/map";
export default mudletMapBinaryReader.MudletMapReader.read(inputFile);
