import { Observable } from 'rxjs';
import * as L from "leaflet";
import { ILatLng } from './polygon-helpers';
export declare class MapStateService {
    constructor();
    private mapSubject;
    map$: Observable<L.Map>;
    updateMapState(map: L.Map): void;
    updatePolygons(polygons: ILatLng[][][]): void;
}
