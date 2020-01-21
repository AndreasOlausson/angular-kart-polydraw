import * as L from "leaflet";
import { ILatLng } from "./polygon-helpers";
export declare class PolygonUtil {
    static getCenter(polygon: ILatLng[]): ILatLng;
    static getSouthWest(polygon: ILatLng[]): ILatLng;
    static getNorthEast(polygon: ILatLng[]): ILatLng;
    static getNorthWest(polygon: ILatLng[]): ILatLng;
    static getSouthEast(polygon: ILatLng[]): ILatLng;
    static getNorth(polygon: ILatLng[]): number;
    static getSouth(polygon: ILatLng[]): number;
    static getWest(polygon: ILatLng[]): number;
    static getEast(polygon: ILatLng[]): number;
    static getSqmArea(polygon: ILatLng[]): number;
    static getPerimeter(polygon: ILatLng[]): number;
    static getPolygonChecksum(polygon: ILatLng[]): number;
    static getMidPoint(point1: ILatLng, point2: ILatLng): ILatLng;
    static getBounds(polygon: ILatLng[]): L.LatLngBounds;
}
