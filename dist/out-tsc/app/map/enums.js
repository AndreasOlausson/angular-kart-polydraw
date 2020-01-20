export var DrawMode;
(function (DrawMode) {
    DrawMode[DrawMode["Off"] = 0] = "Off";
    DrawMode[DrawMode["Add"] = 1] = "Add";
    DrawMode[DrawMode["Edit"] = 2] = "Edit";
    DrawMode[DrawMode["Subtract"] = 4] = "Subtract";
    DrawMode[DrawMode["AppendMarker"] = 8] = "AppendMarker";
    DrawMode[DrawMode["LoadPredefined"] = 16] = "LoadPredefined";
})(DrawMode || (DrawMode = {}));
export var MarkerPlacement;
(function (MarkerPlacement) {
    MarkerPlacement[MarkerPlacement["CenterOfMass"] = 0] = "CenterOfMass";
    MarkerPlacement[MarkerPlacement["North"] = 1] = "North";
    MarkerPlacement[MarkerPlacement["East"] = 2] = "East";
    MarkerPlacement[MarkerPlacement["South"] = 3] = "South";
    MarkerPlacement[MarkerPlacement["West"] = 4] = "West";
    MarkerPlacement[MarkerPlacement["NorthEast"] = 5] = "NorthEast";
    MarkerPlacement[MarkerPlacement["NorthWest"] = 6] = "NorthWest";
    MarkerPlacement[MarkerPlacement["SouthEast"] = 7] = "SouthEast";
    MarkerPlacement[MarkerPlacement["SouthWest"] = 8] = "SouthWest";
    MarkerPlacement[MarkerPlacement["BoundingBoxCenter"] = 9] = "BoundingBoxCenter";
})(MarkerPlacement || (MarkerPlacement = {}));
//# sourceMappingURL=enums.js.map