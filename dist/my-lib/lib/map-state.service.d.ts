import { Observable } from 'rxjs';
import * as L from "leaflet";
import { ILatLng } from './polygon-helpers';
import * as i0 from "@angular/core";
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
    static ɵfac: i0.ɵɵFactoryDef<PolyStateService>;
    static ɵprov: i0.ɵɵInjectableDef<PolyStateService>;
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
