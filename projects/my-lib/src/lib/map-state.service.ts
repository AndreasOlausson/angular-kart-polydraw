import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as L from "leaflet"
import { ILatLng } from './polygon-helpers';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PolyStateService {
    constructor() { }
    

    private mapSubject = new BehaviorSubject<L.Map>(null); 
    
    map$: Observable<L.Map> = this.mapSubject.asObservable();
    private polygonSubject = new BehaviorSubject<ILatLng[][][]>(null); 

    polygons$: Observable<ILatLng[][][]> = this.polygonSubject.asObservable();
    private mapStateSubject = new BehaviorSubject<MapStateModel>(new MapStateModel());
    mapState$: Observable<MapStateModel> = this.mapStateSubject.asObservable();
    mapZoomLevel$: Observable<number>  = this.mapState$.pipe(map((state: MapStateModel) => state.mapBoundState.zoom));

    private updateMapStates(newState: any): void {
        let state = this.mapStateSubject.value;
        state = { ...state, ...newState };

        this.mapStateSubject.next(state);
    }


    updateMapState(map: L.Map){
        this.mapSubject.next(map)
    }

    updatePolygons(polygons: ILatLng[][][]):void{
        console.log("map-state",polygons);
        this.polygonSubject.next(polygons)
    }
    updateMapBounds(mapBounds: MapBoundsState) {
        this.updateMapStates({ mapBoundState: mapBounds });
    }
}

class MapStateModel {
    constructor(
      
        public mapBoundState: MapBoundsState = new MapBoundsState(null, 11)) { }
}
class MapBoundsState {
    constructor(
        public bounds: L.LatLngBounds,
        public zoom: number) { }
}