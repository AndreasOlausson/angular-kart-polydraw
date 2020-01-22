import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as L from "leaflet"
import { ILatLng } from './polygon-helpers';

@Injectable({
    providedIn: 'root'
})
export class PolyStateService {
    constructor() { }
    

    private mapSubject = new BehaviorSubject<L.Map>(null); 

    map$: Observable<L.Map> = this.mapSubject.asObservable();
    private polygonSubject = new BehaviorSubject<ILatLng[][][]>(null); 

    polygons$: Observable<ILatLng[][][]> = this.polygonSubject.asObservable();

    updateMapState(map: L.Map){
        this.mapSubject.next(map)
    }

    updatePolygons(polygons: ILatLng[][][]):void{
        console.log("map-state",polygons);
        this.polygonSubject.next(polygons)
    }
}