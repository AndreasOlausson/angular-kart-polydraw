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
    // CenterOfMass = 0,
    MarkerPlacement[MarkerPlacement["North"] = 1] = "North";
    MarkerPlacement[MarkerPlacement["East"] = 2] = "East";
    MarkerPlacement[MarkerPlacement["South"] = 3] = "South";
    MarkerPlacement[MarkerPlacement["West"] = 4] = "West";
    MarkerPlacement[MarkerPlacement["NorthEast"] = 5] = "NorthEast";
    MarkerPlacement[MarkerPlacement["NorthWest"] = 6] = "NorthWest";
    MarkerPlacement[MarkerPlacement["SouthEast"] = 7] = "SouthEast";
    MarkerPlacement[MarkerPlacement["SouthWest"] = 8] = "SouthWest";
    // BoundingBoxCenter = 9
})(MarkerPlacement || (MarkerPlacement = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvZW51bXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFOLElBQVksUUFPWDtBQVBELFdBQVksUUFBUTtJQUNoQixxQ0FBTyxDQUFBO0lBQ1AscUNBQU8sQ0FBQTtJQUNQLHVDQUFRLENBQUE7SUFDUiwrQ0FBWSxDQUFBO0lBQ1osdURBQWdCLENBQUE7SUFDaEIsNERBQW1CLENBQUE7QUFDdkIsQ0FBQyxFQVBXLFFBQVEsS0FBUixRQUFRLFFBT25CO0FBQ0QsTUFBTSxDQUFOLElBQVksZUFXWDtBQVhELFdBQVksZUFBZTtJQUN2QixvQkFBb0I7SUFDcEIsdURBQVMsQ0FBQTtJQUNULHFEQUFRLENBQUE7SUFDUix1REFBUyxDQUFBO0lBQ1QscURBQVEsQ0FBQTtJQUNSLCtEQUFhLENBQUE7SUFDYiwrREFBYSxDQUFBO0lBQ2IsK0RBQWEsQ0FBQTtJQUNiLCtEQUFhLENBQUE7SUFDYix3QkFBd0I7QUFDNUIsQ0FBQyxFQVhXLGVBQWUsS0FBZixlQUFlLFFBVzFCIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gRHJhd01vZGUge1xyXG4gICAgT2ZmID0gMCxcclxuICAgIEFkZCA9IDEsXHJcbiAgICBFZGl0ID0gMixcclxuICAgIFN1YnRyYWN0ID0gNCxcclxuICAgIEFwcGVuZE1hcmtlciA9IDgsXHJcbiAgICBMb2FkUHJlZGVmaW5lZCA9IDE2XHJcbn1cclxuZXhwb3J0IGVudW0gTWFya2VyUGxhY2VtZW50IHtcclxuICAgIC8vIENlbnRlck9mTWFzcyA9IDAsXHJcbiAgICBOb3J0aCA9IDEsXHJcbiAgICBFYXN0ID0gMixcclxuICAgIFNvdXRoID0gMyxcclxuICAgIFdlc3QgPSA0LFxyXG4gICAgTm9ydGhFYXN0ID0gNSxcclxuICAgIE5vcnRoV2VzdCA9IDYsXHJcbiAgICBTb3V0aEVhc3QgPSA3LFxyXG4gICAgU291dGhXZXN0ID0gOCxcclxuICAgIC8vIEJvdW5kaW5nQm94Q2VudGVyID0gOVxyXG59XHJcblxyXG5cclxuIl19