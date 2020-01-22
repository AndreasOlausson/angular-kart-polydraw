import { Observable } from 'rxjs';
import * as L from "leaflet";
import { ILatLng } from './polygon-helpers';
export declare class PolyStateService {
    constructor();
    private mapSubject;
    map$: Observable<L.Map>;
    private polygonSubject;
    polygons$: Observable<ILatLng[][][]>;
    mapZoomLevel$: Observable<number>;
    updateMapState(map: L.Map): void;
    updatePolygons(polygons: ILatLng[][][]): void;
}
