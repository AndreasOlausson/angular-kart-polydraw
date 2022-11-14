import { ILatLng } from "./polygon-helpers";
import { MarkerPosition } from "./enums";
import { Feature, MultiPolygon, Polygon } from "@turf/turf";

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

export interface IMarkerPositions {
    DeleteMarker: number,
    MenuMarker: number,
    InfoMarker: number
}

export interface IMarkerPositionIndexMap {
    polygonIndex: number,
    markerPosition: MarkerPosition,
    occupied: boolean
}

export interface PolygonLayerParams {
    latlngs: Feature<Polygon | MultiPolygon>, 
    simplify?: boolean, 
    dynamicTolerance?: boolean,
    markerParams? : MarkerParams
}

export interface MarkerParams {
    hidden?: boolean,
    markerClass: string,
    hiddenModuloLevel?: number
}