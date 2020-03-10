import { ILatLng } from "./polygon-helpers";

export interface ICompass {
    SouthEast: ILatLng,
    SouthWest: ILatLng
    West: ILatLng,
    NorthWest: ILatLng,
    North: ILatLng,
    NorthEast: ILatLng,
    East: ILatLng,
    South: ILatLng,
}