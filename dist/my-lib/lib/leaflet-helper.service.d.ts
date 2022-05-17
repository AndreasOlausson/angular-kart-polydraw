import * as L from "leaflet";
import { ILatLng } from "./polygon-helpers";
import * as i0 from "@angular/core";
export declare class LeafletHelperService {
    constructor();
    createPolygon(latLngs: ILatLng[]): L.Polygon;
    static ɵfac: i0.ɵɵFactoryDeclaration<LeafletHelperService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<LeafletHelperService>;
}
