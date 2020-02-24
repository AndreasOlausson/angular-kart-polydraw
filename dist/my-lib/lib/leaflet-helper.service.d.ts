import * as L from "leaflet";
import { ILatLng } from "./polygon-helpers";
export declare class LeafletHelperService {
    constructor();
    createPolygon(latLngs: ILatLng[]): L.Polygon;
}
