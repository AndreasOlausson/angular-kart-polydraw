import { Observable } from 'rxjs';
import * as L from "leaflet";
import { ILatLng } from './polygon-helpers';
export declare class PolyStateService {
    constructor();
    private mapSubject;
    map$: Observable<L.Map>;
    private polygonSubject;
    polygons$: Observable<ILatLng[][][]>;
    private mapStateSubject;
    mapState$: Observable<MapStateModel>;
    mapZoomLevel$: Observable<number>;
    private updateMapStates;
    updateMapState(map: L.Map): void;
    updatePolygons(polygons: ILatLng[][][]): void;
    updateMapBounds(mapBounds: MapBoundsState): void;
}
declare class MapStateModel {
    mapBoundState: MapBoundsState;
    constructor(mapBoundState?: MapBoundsState);
}
declare class MapBoundsState {
    bounds: L.LatLngBounds;
    zoom: number;
    constructor(bounds: L.LatLngBounds, zoom: number);
}
export {};
