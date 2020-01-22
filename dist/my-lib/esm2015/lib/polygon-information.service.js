import * as tslib_1 from "tslib";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { PolygonInfo } from "./polygon-helpers";
import { PolyStateService } from "./map-state.service";
import * as i0 from "@angular/core";
import * as i1 from "./map-state.service";
let PolygonInformationService = class PolygonInformationService {
    constructor(mapStateService) {
        this.mapStateService = mapStateService;
        this.polygonInformationSubject = new Subject();
        this.polygonInformation$ = this.polygonInformationSubject.asObservable();
        this.polygonDrawStatesSubject = new Subject();
        this.polygonDrawStates$ = this.polygonDrawStatesSubject.asObservable();
        this.polygonInformationStorage = [];
    }
    updatePolygons() {
        console.log("updatePolygons: ", this.polygonInformationStorage);
        let newPolygons = null;
        if (this.polygonInformationStorage.length > 0) {
            newPolygons = [];
            this.polygonInformationStorage.forEach(v => {
                let test = [];
                v.polygon.forEach((poly) => {
                    let test2 = [];
                    poly.forEach(polygon => {
                        test2 = [...polygon];
                        if (polygon[0].toString() !== polygon[polygon.length - 1].toString()) {
                            test2.push(polygon[0]);
                        }
                        test.push(test2);
                    });
                });
                newPolygons.push(test);
            });
            // this.polygonDrawStates.hasPolygons = true;
        }
        else {
            // this.polygonDrawStates.reset();
            // this.polygonDrawStates.hasPolygons = false;
        }
        this.mapStateService.updatePolygons(newPolygons);
        this.saveCurrentState();
    }
    saveCurrentState() {
        this.polygonInformationSubject.next(this.polygonInformationStorage);
        console.log("saveCurrentState: ", this.polygonInformationStorage);
    }
    deleteTrashcan(polygon) {
        const idx = this.polygonInformationStorage.findIndex(v => v.polygon[0] === polygon);
        this.polygonInformationStorage.splice(idx, 1);
        this.updatePolygons();
    }
    deleteTrashCanOnMulti(polygon) {
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
};
PolygonInformationService.ctorParameters = () => [
    { type: PolyStateService }
];
PolygonInformationService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function PolygonInformationService_Factory() { return new PolygonInformationService(i0.ɵɵinject(i1.PolyStateService)); }, token: PolygonInformationService, providedIn: "root" });
PolygonInformationService = tslib_1.__decorate([
    Injectable({ providedIn: "root" }),
    tslib_1.__metadata("design:paramtypes", [PolyStateService])
], PolygonInformationService);
export { PolygonInformationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQThCLE1BQU0sbUJBQW1CLENBQUM7QUFFNUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7OztBQUd2RCxJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUF5QjtJQU9wQyxZQUFvQixlQUFpQztRQUFqQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFOckQsOEJBQXlCLEdBQTJCLElBQUksT0FBTyxFQUFpQixDQUFDO1FBQ2pGLHdCQUFtQixHQUE4QixJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDL0YsNkJBQXdCLEdBQStCLElBQUksT0FBTyxFQUFxQixDQUFDO1FBQ3hGLHVCQUFrQixHQUFrQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFakcsOEJBQXlCLEdBQUcsRUFBRSxDQUFDO0lBQ3lCLENBQUM7SUFFekQsY0FBYztRQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFFaEUsSUFBSSxXQUFXLEdBQWtCLElBQUksQ0FBQztRQUN0QyxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzdDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFHakIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDekMsSUFBSSxJQUFJLEdBQUcs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QUFDO1NBQ3ZCO0lBQ0gsQ0FBQztDQUNGLENBQUE7O1lBM0ZzQyxnQkFBZ0I7OztBQVAxQyx5QkFBeUI7SUFEckMsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDOzZDQVFJLGdCQUFnQjtHQVAxQyx5QkFBeUIsQ0FrR3JDO1NBbEdZLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgeyBTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcclxuaW1wb3J0IHsgUG9seWdvbkluZm8sIFBvbHlnb25EcmF3U3RhdGVzLCBJTGF0TG5nIH0gZnJvbSBcIi4vcG9seWdvbi1oZWxwZXJzXCI7XHJcbmltcG9ydCB7IFBvbHlEcmF3U2VydmljZSB9IGZyb20gXCIuL3BvbHlkcmF3LnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgUG9seVN0YXRlU2VydmljZSB9IGZyb20gXCIuL21hcC1zdGF0ZS5zZXJ2aWNlXCI7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXHJcbmV4cG9ydCBjbGFzcyBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlIHtcclxuICBwb2x5Z29uSW5mb3JtYXRpb25TdWJqZWN0OiBTdWJqZWN0PFBvbHlnb25JbmZvW10+ID0gbmV3IFN1YmplY3Q8UG9seWdvbkluZm9bXT4oKTtcclxuICBwb2x5Z29uSW5mb3JtYXRpb24kOiBPYnNlcnZhYmxlPFBvbHlnb25JbmZvW10+ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG4gIHBvbHlnb25EcmF3U3RhdGVzU3ViamVjdDogU3ViamVjdDxQb2x5Z29uRHJhd1N0YXRlcz4gPSBuZXcgU3ViamVjdDxQb2x5Z29uRHJhd1N0YXRlcz4oKTtcclxuICBwb2x5Z29uRHJhd1N0YXRlcyQ6IE9ic2VydmFibGU8UG9seWdvbkRyYXdTdGF0ZXM+ID0gdGhpcy5wb2x5Z29uRHJhd1N0YXRlc1N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gIHBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UgPSBbXTtcclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1hcFN0YXRlU2VydmljZTogUG9seVN0YXRlU2VydmljZSkge31cclxuXHJcbiAgdXBkYXRlUG9seWdvbnMoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInVwZGF0ZVBvbHlnb25zOiBcIiwgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcclxuXHJcbiAgICBsZXQgbmV3UG9seWdvbnM6IElMYXRMbmdbXVtdW10gPSBudWxsO1xyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIG5ld1BvbHlnb25zID0gW107XHJcbiAgICAgIFxyXG4gICAgICBcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2godiA9PiB7XHJcbiAgICAgICAgbGV0IHRlc3QgPSBbXVxyXG4gICAgICAgIHYucG9seWdvbi5mb3JFYWNoKChwb2x5KSA9PiB7XHJcbiAgICAgICAgICBsZXQgdGVzdDIgPSBbXVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcG9seS5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICAgIHRlc3QyID0gWy4uLnBvbHlnb25dXHJcbiAgICAgICAgICAgICAgaWYgKHBvbHlnb25bMF0udG9TdHJpbmcoKSAhPT0gcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDFdLnRvU3RyaW5nKCkpIHtcclxuICAgICAgICAgICAgICAgIHRlc3QyLnB1c2gocG9seWdvblswXSk7ICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgdGVzdC5wdXNoKHRlc3QyKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgbmV3UG9seWdvbnMucHVzaCh0ZXN0KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5oYXNQb2x5Z29ucyA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnJlc2V0KCk7XHJcbiAgICAgIC8vIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuaGFzUG9seWdvbnMgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMubWFwU3RhdGVTZXJ2aWNlLnVwZGF0ZVBvbHlnb25zKG5ld1BvbHlnb25zKTtcclxuICAgIHRoaXMuc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgc2F2ZUN1cnJlbnRTdGF0ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3ViamVjdC5uZXh0KHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSk7XHJcbiAgICBjb25zb2xlLmxvZyhcInNhdmVDdXJyZW50U3RhdGU6IFwiLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlVHJhc2hjYW4ocG9seWdvbikge1xyXG4gICAgY29uc3QgaWR4ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZpbmRJbmRleCh2ID0+IHYucG9seWdvblswXSA9PT0gcG9seWdvbik7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2Uuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVUcmFzaENhbk9uTXVsdGkocG9seWdvbjogSUxhdExuZ1tdW11bXSkge1xyXG4gICAgbGV0IGluZGV4ID0gMDtcclxuICAgIGNvbnNvbGUubG9nKFwiRGVsZXRlVHJhc2hDYW46IFwiLCBwb2x5Z29uKTtcclxuICAgIGNvbnNvbGUubG9nKFwiZGVsZXRlVHJhc2hDYW5Pbk11bHRpOiBcIiwgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcclxuICAgIC8vIGNvbnN0IGlkeCA9IHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5maW5kSW5kZXgodiA9PiB2LnBvbHlnb24uZm9yRWFjaChwb2x5ID0+eyBwb2x5ID09PSBwb2x5Z29ufSkgKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5mb3JFYWNoKCh2LCBpKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKHYucG9seWdvbik7XHJcbiAgICAgIGNvbnN0IGlkID0gdi5wb2x5Z29uLmZpbmRJbmRleChwb2x5ID0+IHBvbHkudG9TdHJpbmcoKSA9PT0gcG9seWdvbi50b1N0cmluZygpKTtcclxuICAgICAgaWYgKGlkID49IDApIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgdi50cmFzaGNhblBvaW50LnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5zcW1BcmVhLnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5wZXJpbWV0ZXIuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnBvbHlnb24uc3BsaWNlKGlkLCAxKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codi5wb2x5Z29uKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZyhcIklEOiBcIiwgaWQpO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICBjb25zb2xlLmxvZyhcIkluZGV4OiBcIiwgaW5kZXgpO1xyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5sZW5ndGggPiAxKSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJkZWxldGVUcmFzaENhbk9uTXVsdGk6IFwiLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSA9IFtdO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShhcnJheU9mRmVhdHVyZUdyb3Vwcykge1xyXG4gICAgY29uc29sZS5sb2coXCJDcmVhdGUgSW5mbzogXCIsIGFycmF5T2ZGZWF0dXJlR3JvdXBzKTtcclxuICAgIGlmIChhcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0uZ2V0TGF0TG5ncygpKTtcclxuICAgICAgICBsZXQgcG9seUluZm8gPSBuZXcgUG9seWdvbkluZm8oZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdLmdldExhdExuZ3MoKSk7XHJcbiAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnB1c2gocG9seUluZm8pO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=