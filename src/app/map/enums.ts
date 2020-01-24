//TODO We have DrawModes in differnet places, refactor!
export enum DrawMode {
    Off = 0,
    Add = 1,
    Edit = 2,
    Subtract = 4,
    AppendMarker = 8,
    LoadPredefined = 16
}
//TODO: Add centerOfMass and BoundingBoxCenter
//Issue: For the above, we can't use the polygon edges, we have to add stand alone divIcons
export enum MarkerPosition {
    // // CenterOfMass = 0,
    // North = 1,
    // East = 2,
    // South = 3,
    // West = 4,
    // NorthEast = 5,
    // NorthWest = 6,
    // SouthEast = 7,
    // SouthWest = 8,
    // // BoundingBoxCenter = 9
    SouthWest = 0,
    South = 1,
    SouthEast = 2,
    East = 3,
    NorthEast = 4,
    North = 5,
    NorthWest = 6,
    West = 7
    // CenterOfMass = 8
    ,
    // BoundingBoxCenter = 9
}


