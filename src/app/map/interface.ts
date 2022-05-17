import { ILatLng } from "./polygon-helpers";

export interface ICompass {
    North: ILatLng,
    NorthEast: ILatLng,
    East: ILatLng,
    SouthEast: ILatLng,
    South: ILatLng,
    SouthWest: ILatLng
    West: ILatLng,
    NorthWest: ILatLng,
}