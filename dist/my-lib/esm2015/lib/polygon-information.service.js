import { __decorate, __metadata } from "tslib";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { PolygonInfo, PolygonDrawStates } from "./polygon-helpers";
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
        this.polygonDrawStates = null;
        this.polygonInformationStorage = [];
        this.polygonDrawStates = new PolygonDrawStates();
    }
    updatePolygons() {
        console.log("updatePolygons: ", this.polygonInformationStorage);
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
};
PolygonInformationService.ctorParameters = () => [
    { type: PolyStateService }
];
PolygonInformationService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PolygonInformationService_Factory() { return new PolygonInformationService(i0.ɵɵinject(i1.PolyStateService)); }, token: PolygonInformationService, providedIn: "root" });
PolygonInformationService = __decorate([
    Injectable({ providedIn: "root" }),
    __metadata("design:paramtypes", [PolyStateService])
], PolygonInformationService);
export { PolygonInformationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vcG9seWRyYXcvIiwic291cmNlcyI6WyJsaWIvcG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQWMsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBVyxNQUFNLG1CQUFtQixDQUFDO0FBRTVFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDOzs7QUFHdkQsSUFBYSx5QkFBeUIsR0FBdEMsTUFBYSx5QkFBeUI7SUFnQnBDLFlBQW9CLGVBQWlDO1FBQWpDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtRQWZyRCw4QkFBeUIsR0FBMkIsSUFBSSxPQUFPLEVBRTVELENBQUM7UUFDSix3QkFBbUIsR0FFZixJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDbEQsNkJBQXdCLEdBQStCLElBQUksT0FBTyxFQUUvRCxDQUFDO1FBQ0osdUJBQWtCLEdBRWQsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksRUFBRSxDQUFDO1FBRWpELHNCQUFpQixHQUFzQixJQUFJLENBQUM7UUFDNUMsOEJBQXlCLEdBQUcsRUFBRSxDQUFDO1FBRTdCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7SUFDbkQsQ0FBQztJQUVELGNBQWM7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBRWhFLElBQUksV0FBVyxHQUFrQixJQUFJLENBQUM7UUFDdEMsSUFBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM3QyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBRWpCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3pDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDZCxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDdkIsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO29CQUVmLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ3JCLEtBQUssR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7d0JBQ3JCLElBQ0UsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUNoRTs0QkFDQSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUN4Qjt3QkFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNuQixDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFFSCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDM0M7YUFBTTtZQUNMLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUM1QztRQUNELElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDM0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsY0FBYyxDQUFDLE9BQU87UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFNBQVMsQ0FDbEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FDOUIsQ0FBQztRQUNGLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQscUJBQXFCLENBQUMsT0FBc0I7UUFDMUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3ZFLDZHQUE2RztRQUM3RyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUM1QixJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQy9DLENBQUM7WUFDRixJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ1gsS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDVixDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRXhCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3hCO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUIsSUFBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM3QyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNqRDtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVELCtCQUErQjtRQUM3QixJQUFJLENBQUMseUJBQXlCLEdBQUcsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFFRCwrQkFBK0IsQ0FBQyxvQkFBb0I7UUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUNuRCxJQUFJLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLFFBQVEsR0FBRyxJQUFJLFdBQVcsQ0FDNUIsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUN6QyxDQUFDO2dCQUNGLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDdkI7SUFDSCxDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBQ0QsS0FBSztRQUNILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0NBQ0YsQ0FBQTs7WUFsSHNDLGdCQUFnQjs7O0FBaEIxQyx5QkFBeUI7SUFEckMsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO3FDQWlCSSxnQkFBZ0I7R0FoQjFDLHlCQUF5QixDQWtJckM7U0FsSVkseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xyXG5pbXBvcnQgeyBQb2x5Z29uSW5mbywgUG9seWdvbkRyYXdTdGF0ZXMsIElMYXRMbmcgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcclxuaW1wb3J0IHsgUG9seURyYXdTZXJ2aWNlIH0gZnJvbSBcIi4vcG9seWRyYXcuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBQb2x5U3RhdGVTZXJ2aWNlIH0gZnJvbSBcIi4vbWFwLXN0YXRlLnNlcnZpY2VcIjtcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogXCJyb290XCIgfSlcclxuZXhwb3J0IGNsYXNzIFBvbHlnb25JbmZvcm1hdGlvblNlcnZpY2Uge1xyXG4gIHBvbHlnb25JbmZvcm1hdGlvblN1YmplY3Q6IFN1YmplY3Q8UG9seWdvbkluZm9bXT4gPSBuZXcgU3ViamVjdDxcclxuICAgIFBvbHlnb25JbmZvW11cclxuICA+KCk7XHJcbiAgcG9seWdvbkluZm9ybWF0aW9uJDogT2JzZXJ2YWJsZTxcclxuICAgIFBvbHlnb25JbmZvW11cclxuICA+ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG4gIHBvbHlnb25EcmF3U3RhdGVzU3ViamVjdDogU3ViamVjdDxQb2x5Z29uRHJhd1N0YXRlcz4gPSBuZXcgU3ViamVjdDxcclxuICAgIFBvbHlnb25EcmF3U3RhdGVzXHJcbiAgPigpO1xyXG4gIHBvbHlnb25EcmF3U3RhdGVzJDogT2JzZXJ2YWJsZTxcclxuICAgIFBvbHlnb25EcmF3U3RhdGVzXHJcbiAgPiA9IHRoaXMucG9seWdvbkRyYXdTdGF0ZXNTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG5cclxuICBwb2x5Z29uRHJhd1N0YXRlczogUG9seWdvbkRyYXdTdGF0ZXMgPSBudWxsO1xyXG4gIHBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UgPSBbXTtcclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1hcFN0YXRlU2VydmljZTogUG9seVN0YXRlU2VydmljZSkge1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcyA9IG5ldyBQb2x5Z29uRHJhd1N0YXRlcygpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlUG9seWdvbnMoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInVwZGF0ZVBvbHlnb25zOiBcIiwgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcclxuXHJcbiAgICBsZXQgbmV3UG9seWdvbnM6IElMYXRMbmdbXVtdW10gPSBudWxsO1xyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIG5ld1BvbHlnb25zID0gW107XHJcblxyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZm9yRWFjaCh2ID0+IHtcclxuICAgICAgICBsZXQgdGVzdCA9IFtdO1xyXG4gICAgICAgIHYucG9seWdvbi5mb3JFYWNoKHBvbHkgPT4ge1xyXG4gICAgICAgICAgbGV0IHRlc3QyID0gW107XHJcblxyXG4gICAgICAgICAgcG9seS5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICB0ZXN0MiA9IFsuLi5wb2x5Z29uXTtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgIHBvbHlnb25bMF0udG9TdHJpbmcoKSAhPT0gcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDFdLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgdGVzdDIucHVzaChwb2x5Z29uWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZXN0LnB1c2godGVzdDIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG5ld1BvbHlnb25zLnB1c2godGVzdCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5oYXNQb2x5Z29ucyA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnJlc2V0KCk7XHJcbiAgICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuaGFzUG9seWdvbnMgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMubWFwU3RhdGVTZXJ2aWNlLnVwZGF0ZVBvbHlnb25zKG5ld1BvbHlnb25zKTtcclxuICAgIHRoaXMuc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgc2F2ZUN1cnJlbnRTdGF0ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3ViamVjdC5uZXh0KHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSk7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzU3ViamVjdC5uZXh0KHRoaXMucG9seWdvbkRyYXdTdGF0ZXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJzYXZlQ3VycmVudFN0YXRlOiBcIiwgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcclxuICB9XHJcblxyXG4gIGRlbGV0ZVRyYXNoY2FuKHBvbHlnb24pIHtcclxuICAgIGNvbnN0IGlkeCA9IHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5maW5kSW5kZXgoXHJcbiAgICAgIHYgPT4gdi5wb2x5Z29uWzBdID09PSBwb2x5Z29uXHJcbiAgICApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnNwbGljZShpZHgsIDEpO1xyXG4gICAgdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlVHJhc2hDYW5Pbk11bHRpKHBvbHlnb246IElMYXRMbmdbXVtdW10pIHtcclxuICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICBjb25zb2xlLmxvZyhcIkRlbGV0ZVRyYXNoQ2FuOiBcIiwgcG9seWdvbik7XHJcbiAgICBjb25zb2xlLmxvZyhcImRlbGV0ZVRyYXNoQ2FuT25NdWx0aTogXCIsIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSk7XHJcbiAgICAvLyBjb25zdCBpZHggPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZmluZEluZGV4KHYgPT4gdi5wb2x5Z29uLmZvckVhY2gocG9seSA9PnsgcG9seSA9PT0gcG9seWdvbn0pICk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZm9yRWFjaCgodiwgaSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZyh2LnBvbHlnb24pO1xyXG4gICAgICBjb25zdCBpZCA9IHYucG9seWdvbi5maW5kSW5kZXgoXHJcbiAgICAgICAgcG9seSA9PiBwb2x5LnRvU3RyaW5nKCkgPT09IHBvbHlnb24udG9TdHJpbmcoKVxyXG4gICAgICApO1xyXG4gICAgICBpZiAoaWQgPj0gMCkge1xyXG4gICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICB2LnRyYXNoY2FuUG9pbnQuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnNxbUFyZWEuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnBlcmltZXRlci5zcGxpY2UoaWQsIDEpO1xyXG4gICAgICAgIHYucG9seWdvbi5zcGxpY2UoaWQsIDEpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyh2LnBvbHlnb24pO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiSUQ6IFwiLCBpZCk7XHJcbiAgICB9KTtcclxuICAgIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgIGNvbnNvbGUubG9nKFwiSW5kZXg6IFwiLCBpbmRleCk7XHJcbiAgICBpZiAodGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmxlbmd0aCA+IDEpIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhcImRlbGV0ZVRyYXNoQ2FuT25NdWx0aTogXCIsIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCkge1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlID0gW107XHJcbiAgfVxyXG5cclxuICBjcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKGFycmF5T2ZGZWF0dXJlR3JvdXBzKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIkNyZWF0ZSBJbmZvOiBcIiwgYXJyYXlPZkZlYXR1cmVHcm91cHMpO1xyXG4gICAgaWYgKGFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXS5nZXRMYXRMbmdzKCkpO1xyXG4gICAgICAgIGxldCBwb2x5SW5mbyA9IG5ldyBQb2x5Z29uSW5mbyhcclxuICAgICAgICAgIGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXS5nZXRMYXRMbmdzKClcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5wdXNoKHBvbHlJbmZvKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFjdGl2YXRlKCkge1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5hY3RpdmF0ZSgpO1xyXG4gIH1cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIHNldE1vdmVNb2RlKCkge1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5zZXRNb3ZlTW9kZSgpO1xyXG4gIH1cclxuXHJcbiAgc2V0RnJlZURyYXdNb2RlKCkge1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5zZXRGcmVlRHJhd01vZGUoKTtcclxuICB9XHJcbn1cclxuIl19