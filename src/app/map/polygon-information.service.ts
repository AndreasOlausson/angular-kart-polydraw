import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { PolygonInfo, PolygonDrawStates } from './polygon-helpers';

@Injectable({providedIn: 'root'})
export class PolygonInformationService {

    polygonInformationSubject: Subject<PolygonInfo[]> = new Subject<PolygonInfo[]>();
    polygonInformation$: Observable<PolygonInfo[]> = this.polygonInformationSubject.asObservable();
    polygonDrawStatesSubject: Subject<PolygonDrawStates> = new Subject<PolygonDrawStates>();
    polygonDrawStates$: Observable<PolygonDrawStates> = this.polygonDrawStatesSubject.asObservable();

    polygonInformationStorage = [];
    constructor() { }
    

    updatePolygons() {
        console.log("updatePolygons: ", this.polygonInformationStorage);
    
        let polygons = null;
    
        if (this.polygonInformationStorage.length > 0) {
          polygons = [];
          this.polygonInformationStorage.forEach(v => {
            if (v.polygon[0].toString() !== v.polygon[v.polygon.length - 1].toString()) {
              v.polygon.push(v.polygon[0]);
            }
            polygons.push(v.polygon);
          });
        }
    
        this.saveCurrentState();
      }

      saveCurrentState(): void {
        console.log("saveCurrentState");
      }

      deleteTrashcan(polygon) {
        const idx = this.polygonInformationStorage.findIndex(v => v.polygon === polygon);
        this.polygonInformationStorage.splice(idx, 1);
      }

      deletePolygonInformationStorage() {
        this.polygonInformationStorage = [];
      }

      createPolygonInformationStorage(arrayOfFeatureGroups) {
        if (arrayOfFeatureGroups.length > 0) {
         /*  arrayOfFeatureGroups.forEach(featureGroup => {
            // let polyInfo = new PolygonInfo(featureGroup.getLayers()[0].getLatLngs()[0]);
            this.polygonInformationStorage.push(polyInfo);
          }); */
          this.updatePolygons();
        }
      }
}