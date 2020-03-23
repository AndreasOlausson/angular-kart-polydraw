export var DrawMode;
(function (DrawMode) {
    DrawMode[DrawMode["Off"] = 0] = "Off";
    DrawMode[DrawMode["Add"] = 1] = "Add";
    DrawMode[DrawMode["Edit"] = 2] = "Edit";
    DrawMode[DrawMode["Subtract"] = 4] = "Subtract";
    DrawMode[DrawMode["AppendMarker"] = 8] = "AppendMarker";
    DrawMode[DrawMode["LoadPredefined"] = 16] = "LoadPredefined";
})(DrawMode || (DrawMode = {}));
export var MarkerPosition;
(function (MarkerPosition) {
    // CenterOfMass = 0,
    MarkerPosition[MarkerPosition["North"] = 1] = "North";
    MarkerPosition[MarkerPosition["East"] = 2] = "East";
    MarkerPosition[MarkerPosition["South"] = 3] = "South";
    MarkerPosition[MarkerPosition["West"] = 4] = "West";
    MarkerPosition[MarkerPosition["NorthEast"] = 5] = "NorthEast";
    MarkerPosition[MarkerPosition["NorthWest"] = 6] = "NorthWest";
    MarkerPosition[MarkerPosition["SouthEast"] = 7] = "SouthEast";
    MarkerPosition[MarkerPosition["SouthWest"] = 8] = "SouthWest";
    // BoundingBoxCenter = 9
})(MarkerPosition || (MarkerPosition = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvZW51bXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFOLElBQVksUUFPWDtBQVBELFdBQVksUUFBUTtJQUNoQixxQ0FBTyxDQUFBO0lBQ1AscUNBQU8sQ0FBQTtJQUNQLHVDQUFRLENBQUE7SUFDUiwrQ0FBWSxDQUFBO0lBQ1osdURBQWdCLENBQUE7SUFDaEIsNERBQW1CLENBQUE7QUFDdkIsQ0FBQyxFQVBXLFFBQVEsS0FBUixRQUFRLFFBT25CO0FBQ0QsTUFBTSxDQUFOLElBQVksY0FXWDtBQVhELFdBQVksY0FBYztJQUN0QixvQkFBb0I7SUFDcEIscURBQVMsQ0FBQTtJQUNULG1EQUFRLENBQUE7SUFDUixxREFBUyxDQUFBO0lBQ1QsbURBQVEsQ0FBQTtJQUNSLDZEQUFhLENBQUE7SUFDYiw2REFBYSxDQUFBO0lBQ2IsNkRBQWEsQ0FBQTtJQUNiLDZEQUFhLENBQUE7SUFDYix3QkFBd0I7QUFDNUIsQ0FBQyxFQVhXLGNBQWMsS0FBZCxjQUFjLFFBV3pCIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gRHJhd01vZGUge1xuICAgIE9mZiA9IDAsXG4gICAgQWRkID0gMSxcbiAgICBFZGl0ID0gMixcbiAgICBTdWJ0cmFjdCA9IDQsXG4gICAgQXBwZW5kTWFya2VyID0gOCxcbiAgICBMb2FkUHJlZGVmaW5lZCA9IDE2XG59XG5leHBvcnQgZW51bSBNYXJrZXJQb3NpdGlvbiB7XG4gICAgLy8gQ2VudGVyT2ZNYXNzID0gMCxcbiAgICBOb3J0aCA9IDEsXG4gICAgRWFzdCA9IDIsXG4gICAgU291dGggPSAzLFxuICAgIFdlc3QgPSA0LFxuICAgIE5vcnRoRWFzdCA9IDUsXG4gICAgTm9ydGhXZXN0ID0gNixcbiAgICBTb3V0aEVhc3QgPSA3LFxuICAgIFNvdXRoV2VzdCA9IDgsXG4gICAgLy8gQm91bmRpbmdCb3hDZW50ZXIgPSA5XG59XG5cblxuIl19