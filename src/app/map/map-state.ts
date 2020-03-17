//TODO Does this have to be a service?
import "reflect-metadata";
import { injectable, singleton } from 'tsyringe';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as L from "leaflet"
import { ILatLng } from './polygon-helpers';

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