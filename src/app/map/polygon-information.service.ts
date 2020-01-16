import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { PolygonInfo, PolygonDrawStates, ILatLng } from "./polygon-helpers";
import { MapHelperService } from "./map-helper.service";

@Injectable({ providedIn: "root" })
export class PolygonInformationService {
  polygonInformationSubject: Subject<PolygonInfo[]> = new Subject<PolygonInfo[]>();
  polygonInformation$: Observable<PolygonInfo[]> = this.polygonInformationSubject.asObservable();
  polygonDrawStatesSubject: Subject<PolygonDrawStates> = new Subject<PolygonDrawStates>();
  polygonDrawStates$: Observable<PolygonDrawStates> = this.polygonDrawStatesSubject.asObservable();

  polygonInformationStorage = [];
  constructor() {}

  updatePolygons() {
    console.log("updatePolygons: ", this.polygonInformationStorage);

    let newPolygons: ILatLng[][][] = null;
    if (this.polygonInformationStorage.length > 0) {
      newPolygons = [];
      
      
      this.polygonInformationStorage.forEach(v => {
        console.log(v.polygon);
        let test = []
        v.polygon.forEach((poly,i) => {
              
            test = [...poly[0]]
            if (poly[0][0].toString() !== poly[0][poly[0].length - 1].toString()) {
                test.push(poly[0][0]);             
            }
            newPolygons.push([test])
        });
      });

      // this.polygonDrawStates.hasPolygons = true;
    } else {
      // this.polygonDrawStates.reset();
      // this.polygonDrawStates.hasPolygons = false;
    }

    this.saveCurrentState();
  }

  saveCurrentState(): void {
    this.polygonInformationSubject.next(this.polygonInformationStorage);
    console.log("saveCurrentState");
  }

  deleteTrashcan(polygon) {
    const idx = this.polygonInformationStorage.findIndex(v => v.polygon[0] === polygon);
    this.polygonInformationStorage.splice(idx, 1);
    this.updatePolygons();
  }

  deleteTrashCanOnMulti(polygon: ILatLng[][]) {
    let index = 0;
    console.log("DeleteTrashCan: ", polygon);
    console.log("deleteTrashCanOnMulti: ", this.polygonInformationStorage);
    // const idx = this.polygonInformationStorage.findIndex(v => v.polygon.forEach(poly =>{ poly === polygon}) );
    this.polygonInformationStorage.forEach((v, i) => {
      console.log(v.polygon);
      const id = v.polygon.findIndex(poly => poly.toString() === polygon.toString());
      if (id >= 0) {
        index = i;
        v.trashcanPoint.splice(id, 1);
        v.sqmArea.splice(id, 1);
        v.perimeter.splice(id, 1);
        v.polygon.splice(id, 1);

        console.log(v.polygon);
      }
      console.log("ID: ", id);
    });
    this.updatePolygons();
    console.log("Index: ", index);
    if (this.polygonInformationStorage.length > 1) {
      this.polygonInformationStorage.splice(index, 1);
    }
    console.log("deleteTrashCanOnMulti: ", this.polygonInformationStorage);
  }

  deletePolygonInformationStorage() {
    this.polygonInformationStorage = [];
  }

  createPolygonInformationStorage(arrayOfFeatureGroups) {
    console.log("Create Info: ", arrayOfFeatureGroups);
    if (arrayOfFeatureGroups.length > 0) {
      arrayOfFeatureGroups.forEach(featureGroup => {
        console.log(featureGroup.getLayers()[0].getLatLngs());
        let polyInfo = new PolygonInfo(featureGroup.getLayers()[0].getLatLngs());
        this.polygonInformationStorage.push(polyInfo);
      });
      this.updatePolygons();
    }
  }
}
