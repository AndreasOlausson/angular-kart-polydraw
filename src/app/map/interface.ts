import { ILatLng } from "./polygon-helpers";
//TODO CenterOfMass & BoundingBoxCenter
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