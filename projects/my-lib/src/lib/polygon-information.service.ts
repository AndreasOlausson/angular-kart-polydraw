import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { PolygonInfo, PolygonDrawStates, ILatLng } from "./polygon-helpers";
import { PolyStateService } from "./map-state.service";

@Injectable({ providedIn: "root" })
export class PolygonInformationService {
  polygonInformationSubject: Subject<PolygonInfo[]> = new Subject<
    PolygonInfo[]
  >();
  polygonInformation$: Observable<
    PolygonInfo[]
  > = this.polygonInformationSubject.asObservable();
  polygonDrawStatesSubject: Subject<PolygonDrawStates> = new Subject<
    PolygonDrawStates
  >();
  polygonDrawStates$: Observable<
    PolygonDrawStates
  > = this.polygonDrawStatesSubject.asObservable();

  polygonDrawStates: PolygonDrawStates = null;
  polygonInformationStorage = [];
  constructor(private mapStateService: PolyStateService) {
    this.polygonDrawStates = new PolygonDrawStates();
  }

  updatePolygons() {
    

    let newPolygons: ILatLng[][][] = null;
    if (this.polygonInformationStorage.length > 0) {
      newPolygons = [];

      this.polygonInformationStorage.forEach(v => {
        let test = [];
        v.polygon.forEach(poly => {
          let test2 = [];

          poly.forEach(polygon => {
            test2 = [...polygon];
            if (
              polygon[0].toString() !== polygon[polygon.length - 1].toString()
            ) {
              test2.push(polygon[0]);
            }
            test.push(test2);
          });
        });

        newPolygons.push(test);
      });

      this.polygonDrawStates.hasPolygons = true;
    } else {
      this.polygonDrawStates.reset();
      this.polygonDrawStates.hasPolygons = false;
    }
    this.mapStateService.updatePolygons(newPolygons);
    this.saveCurrentState();
  }

  saveCurrentState(): void {
    this.polygonInformationSubject.next(this.polygonInformationStorage);
    this.polygonDrawStatesSubject.next(this.polygonDrawStates);
    
  }

  deleteTrashcan(polygon) {
    const idx = this.polygonInformationStorage.findIndex(
      v => v.polygon[0] === polygon
    );
    this.polygonInformationStorage.splice(idx, 1);
    this.updatePolygons();
  }

  deleteTrashCanOnMulti(polygon: ILatLng[][][]) {
    let index = 0;
    
    
    // const idx = this.polygonInformationStorage.findIndex(v => v.polygon.forEach(poly =>{ poly === polygon}) );
    this.polygonInformationStorage.forEach((v, i) => {
      
      const id = v.polygon.findIndex(
        poly => poly.toString() === polygon.toString()
      );
      if (id >= 0) {
        index = i;
        v.trashcanPoint.splice(id, 1);
        v.sqmArea.splice(id, 1);
        v.perimeter.splice(id, 1);
        v.polygon.splice(id, 1);

        
      }
      
    });
    this.updatePolygons();
    
    if (this.polygonInformationStorage.length > 1) {
      this.polygonInformationStorage.splice(index, 1);
    }
    
  }

  deletePolygonInformationStorage() {
    this.polygonInformationStorage = [];
  }

  createPolygonInformationStorage(arrayOfFeatureGroups) {
    
    if (arrayOfFeatureGroups.length > 0) {
      arrayOfFeatureGroups.forEach(featureGroup => {
        
        let polyInfo = new PolygonInfo(
          featureGroup.getLayers()[0].getLatLngs()
        );
        this.polygonInformationStorage.push(polyInfo);
      });
      this.updatePolygons();
    }
  }

  activate() {
    this.polygonDrawStates.activate();
  }
  reset() {
    this.polygonDrawStates.reset();
  }

  setMoveMode() {
    this.polygonDrawStates.setMoveMode();
  }

  setFreeDrawMode() {
    this.polygonDrawStates.setFreeDrawMode();
  }
}
