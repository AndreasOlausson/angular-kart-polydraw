import { ILatLng } from "./polygon-helpers";

export interface ICompass {
    // CenterOfMass: ILatLng,
    North: ILatLng,
    East: ILatLng,
    South: ILatLng,
    West: ILatLng,
    NorthEast: ILatLng,
    NorthWest: ILatLng,
    SouthEast: ILatLng,
    SouthWest: ILatLng
    // BoundingBoxCenter: ILatLng
}