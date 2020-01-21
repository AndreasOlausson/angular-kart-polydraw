import { ILatLng } from "./polygon-helpers";
export interface ICompass {
    North: ILatLng;
    East: ILatLng;
    South: ILatLng;
    West: ILatLng;
    NorthEast: ILatLng;
    NorthWest: ILatLng;
    SouthEast: ILatLng;
    SouthWest: ILatLng;
}
