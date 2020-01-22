import { ICompass } from "./interface";
import * as L from "leaflet";
import { ILatLng } from "./polygon-helpers";
import { MarkerPosition } from "./enums";
export declare class PolyDrawUtil {
    static getBounds(polygon: ILatLng[], padding?: number): L.LatLngBounds;
}
export declare class Compass {
    direction: ICompass;
    constructor(minLat?: number, minLng?: number, maxLat?: number, maxLng?: number);
    getDirection(direction: MarkerPosition): ILatLng;
    getPositions(startNode?: MarkerPosition, clockwise?: boolean, addClosingNode?: boolean): number[][];
}
