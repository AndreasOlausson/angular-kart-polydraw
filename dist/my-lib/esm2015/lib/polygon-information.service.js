import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { PolygonInfo, PolygonDrawStates } from "./polygon-helpers";
import { PolyStateService } from "./map-state.service";
import * as i0 from "@angular/core";
import * as i1 from "./map-state.service";
export class PolygonInformationService {
    constructor(mapStateService) {
        this.mapStateService = mapStateService;
        this.polygonInformationSubject = new Subject();
        this.polygonInformation$ = this.polygonInformationSubject.asObservable();
        this.polygonDrawStatesSubject = new Subject();
        this.polygonDrawStates$ = this.polygonDrawStatesSubject.asObservable();
        this.polygonDrawStates = null;
        this.polygonInformationStorage = [];
        this.polygonDrawStates = new PolygonDrawStates();
    }
    updatePolygons() {
        let newPolygons = null;
        if (this.polygonInformationStorage.length > 0) {
            newPolygons = [];
            this.polygonInformationStorage.forEach(v => {
                let test = [];
                v.polygon.forEach(poly => {
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
            this.polygonDrawStates.hasPolygons = true;
        }
        else {
            this.polygonDrawStates.reset();
            this.polygonDrawStates.hasPolygons = false;
        }
        this.mapStateService.updatePolygons(newPolygons);
        this.saveCurrentState();
    }
    saveCurrentState() {
        this.polygonInformationSubject.next(this.polygonInformationStorage);
        this.polygonDrawStatesSubject.next(this.polygonDrawStates);
    }
    deleteTrashcan(polygon) {
        const idx = this.polygonInformationStorage.findIndex(v => v.polygon[0] === polygon);
        this.polygonInformationStorage.splice(idx, 1);
        this.updatePolygons();
    }
    deleteTrashCanOnMulti(polygon) {
        let index = 0;
        // const idx = this.polygonInformationStorage.findIndex(v => v.polygon.forEach(poly =>{ poly === polygon}) );
        this.polygonInformationStorage.forEach((v, i) => {
            const id = v.polygon.findIndex(poly => poly.toString() === polygon.toString());
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
                let polyInfo = new PolygonInfo(featureGroup.getLayers()[0].getLatLngs());
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
PolygonInformationService.ɵfac = function PolygonInformationService_Factory(t) { return new (t || PolygonInformationService)(i0.ɵɵinject(i1.PolyStateService)); };
PolygonInformationService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: PolygonInformationService, factory: PolygonInformationService.ɵfac, providedIn: "root" });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PolygonInformationService, [{
        type: Injectable,
        args: [{ providedIn: "root" }]
    }], function () { return [{ type: i1.PolyStateService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQWMsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBVyxNQUFNLG1CQUFtQixDQUFDO0FBQzVFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDOzs7QUFHdkQsTUFBTSxPQUFPLHlCQUF5QjtJQWdCcEMsWUFBb0IsZUFBaUM7UUFBakMsb0JBQWUsR0FBZixlQUFlLENBQWtCO1FBZnJELDhCQUF5QixHQUEyQixJQUFJLE9BQU8sRUFFNUQsQ0FBQztRQUNKLHdCQUFtQixHQUVmLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsRCw2QkFBd0IsR0FBK0IsSUFBSSxPQUFPLEVBRS9ELENBQUM7UUFDSix1QkFBa0IsR0FFZCxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFakQsc0JBQWlCLEdBQXNCLElBQUksQ0FBQztRQUM1Qyw4QkFBeUIsR0FBRyxFQUFFLENBQUM7UUFFN0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztJQUNuRCxDQUFDO0lBRUQsY0FBYztRQUdaLElBQUksV0FBVyxHQUFrQixJQUFJLENBQUM7UUFDdEMsSUFBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM3QyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBRWpCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3pDLElBQUksSUFB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cm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgeyBTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcclxuaW1wb3J0IHsgUG9seWdvbkluZm8sIFBvbHlnb25EcmF3U3RhdGVzLCBJTGF0TG5nIH0gZnJvbSBcIi4vcG9seWdvbi1oZWxwZXJzXCI7XHJcbmltcG9ydCB7IFBvbHlTdGF0ZVNlcnZpY2UgfSBmcm9tIFwiLi9tYXAtc3RhdGUuc2VydmljZVwiO1xyXG5cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiBcInJvb3RcIiB9KVxyXG5leHBvcnQgY2xhc3MgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSB7XHJcbiAgcG9seWdvbkluZm9ybWF0aW9uU3ViamVjdDogU3ViamVjdDxQb2x5Z29uSW5mb1tdPiA9IG5ldyBTdWJqZWN0PFxyXG4gICAgUG9seWdvbkluZm9bXVxyXG4gID4oKTtcclxuICBwb2x5Z29uSW5mb3JtYXRpb24kOiBPYnNlcnZhYmxlPFxyXG4gICAgUG9seWdvbkluZm9bXVxyXG4gID4gPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgcG9seWdvbkRyYXdTdGF0ZXNTdWJqZWN0OiBTdWJqZWN0PFBvbHlnb25EcmF3U3RhdGVzPiA9IG5ldyBTdWJqZWN0PFxyXG4gICAgUG9seWdvbkRyYXdTdGF0ZXNcclxuICA+KCk7XHJcbiAgcG9seWdvbkRyYXdTdGF0ZXMkOiBPYnNlcnZhYmxlPFxyXG4gICAgUG9seWdvbkRyYXdTdGF0ZXNcclxuICA+ID0gdGhpcy5wb2x5Z29uRHJhd1N0YXRlc1N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gIHBvbHlnb25EcmF3U3RhdGVzOiBQb2x5Z29uRHJhd1N0YXRlcyA9IG51bGw7XHJcbiAgcG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSA9IFtdO1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbWFwU3RhdGVTZXJ2aWNlOiBQb2x5U3RhdGVTZXJ2aWNlKSB7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzID0gbmV3IFBvbHlnb25EcmF3U3RhdGVzKCk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb2x5Z29ucygpIHtcclxuICAgIFxyXG5cclxuICAgIGxldCBuZXdQb2x5Z29uczogSUxhdExuZ1tdW11bXSA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmxlbmd0aCA+IDApIHtcclxuICAgICAgbmV3UG9seWdvbnMgPSBbXTtcclxuXHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5mb3JFYWNoKHYgPT4ge1xyXG4gICAgICAgIGxldCB0ZXN0ID0gW107XHJcbiAgICAgICAgdi5wb2x5Z29uLmZvckVhY2gocG9seSA9PiB7XHJcbiAgICAgICAgICBsZXQgdGVzdDIgPSBbXTtcclxuXHJcbiAgICAgICAgICBwb2x5LmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICAgIHRlc3QyID0gWy4uLnBvbHlnb25dO1xyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgcG9seWdvblswXS50b1N0cmluZygpICE9PSBwb2x5Z29uW3BvbHlnb24ubGVuZ3RoIC0gMV0udG9TdHJpbmcoKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICB0ZXN0Mi5wdXNoKHBvbHlnb25bMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRlc3QucHVzaCh0ZXN0Mik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbmV3UG9seWdvbnMucHVzaCh0ZXN0KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLmhhc1BvbHlnb25zID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMucmVzZXQoKTtcclxuICAgICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5oYXNQb2x5Z29ucyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tYXBTdGF0ZVNlcnZpY2UudXBkYXRlUG9seWdvbnMobmV3UG9seWdvbnMpO1xyXG4gICAgdGhpcy5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICBzYXZlQ3VycmVudFN0YXRlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdWJqZWN0Lm5leHQodGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXNTdWJqZWN0Lm5leHQodGhpcy5wb2x5Z29uRHJhd1N0YXRlcyk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIGRlbGV0ZVRyYXNoY2FuKHBvbHlnb24pIHtcclxuICAgIGNvbnN0IGlkeCA9IHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5maW5kSW5kZXgoXHJcbiAgICAgIHYgPT4gdi5wb2x5Z29uWzBdID09PSBwb2x5Z29uXHJcbiAgICApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnNwbGljZShpZHgsIDEpO1xyXG4gICAgdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlVHJhc2hDYW5Pbk11bHRpKHBvbHlnb246IElMYXRMbmdbXVtdW10pIHtcclxuICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy8gY29uc3QgaWR4ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZpbmRJbmRleCh2ID0+IHYucG9seWdvbi5mb3JFYWNoKHBvbHkgPT57IHBvbHkgPT09IHBvbHlnb259KSApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2goKHYsIGkpID0+IHtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGlkID0gdi5wb2x5Z29uLmZpbmRJbmRleChcclxuICAgICAgICBwb2x5ID0+IHBvbHkudG9TdHJpbmcoKSA9PT0gcG9seWdvbi50b1N0cmluZygpXHJcbiAgICAgICk7XHJcbiAgICAgIGlmIChpZCA+PSAwKSB7XHJcbiAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgIHYudHJhc2hjYW5Qb2ludC5zcGxpY2UoaWQsIDEpO1xyXG4gICAgICAgIHYuc3FtQXJlYS5zcGxpY2UoaWQsIDEpO1xyXG4gICAgICAgIHYucGVyaW1ldGVyLnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5wb2x5Z29uLnNwbGljZShpZCwgMSk7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICBcclxuICAgIGlmICh0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UubGVuZ3RoID4gMSkge1xyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2Uuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuXHJcbiAgZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSA9IFtdO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShhcnJheU9mRmVhdHVyZUdyb3Vwcykge1xyXG4gICAgXHJcbiAgICBpZiAoYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCkge1xyXG4gICAgICBhcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHBvbHlJbmZvID0gbmV3IFBvbHlnb25JbmZvKFxyXG4gICAgICAgICAgZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdLmdldExhdExuZ3MoKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnB1c2gocG9seUluZm8pO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYWN0aXZhdGUoKSB7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLmFjdGl2YXRlKCk7XHJcbiAgfVxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgc2V0TW92ZU1vZGUoKSB7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnNldE1vdmVNb2RlKCk7XHJcbiAgfVxyXG5cclxuICBzZXRGcmVlRHJhd01vZGUoKSB7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnNldEZyZWVEcmF3TW9kZSgpO1xyXG4gIH1cclxufVxyXG4iXX0=