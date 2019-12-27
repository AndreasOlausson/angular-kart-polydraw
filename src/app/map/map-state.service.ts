import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as L from "leaflet"

@Injectable({
    providedIn: 'root'
})
export class MapStateService {
    constructor() { }
    

    private mapSubject = new BehaviorSubject<L.Map>(null); 

    map$: Observable<L.Map> = this.mapSubject.asObservable();

    updateMapState(map: L.Map){
        this.mapSubject.next(map)
    }
}