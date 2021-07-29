import "reflect-metadata";
import { singleton } from 'tsyringe';
import { BehaviorSubject, Observable } from 'rxjs';
import * as L from "leaflet"
import { ILatLng } from './polygon-helpers';
import { Injectable } from "@angular/core";

@Injectable()
@singleton()
export class MapStateService {
    constructor() { }
    
    private mapSubject = new BehaviorSubject<L.Map>(null); 

    map$: Observable<L.Map> = this.mapSubject.asObservable();

    updateMapState(map: L.Map){
        this.mapSubject.next(map)
    }
    updatePolygons(polygons: ILatLng[][][]):void{
        console.log("map-state",polygons);
    }
}