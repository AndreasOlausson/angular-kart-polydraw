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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQVcsTUFBTSxtQkFBbUIsQ0FBQztBQUU1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7O0FBR3ZELElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBZ0JwQyxZQUFvQixlQUFpQztRQUFqQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFmckQsOEJBQXlCLEdBQTJCLElBQUksT0FBTyxFQUU1RCxDQUFDO1FBQ0osd0JBQW1CLEdBRWYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xELDZCQUF3QixHQUErQixJQUFJLE9BQU8sRUFFL0QsQ0FBQztRQUNKLHVCQUFrQixHQUVkLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVqRCxzQkFBaUIsR0FBc0IsSUFBSSxDQUFDO1FBQzVDLDhCQUF5QixHQUFHLEVBQUUsQ0FBQztRQUU3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxjQUFjO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUVoRSxJQUFJLFdBQVcsR0FBa0IsSUFBSSxDQUFDO1FBQ3RDLElBQUksSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDN0MsV0FBVyxHQUFH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U0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxRQUFRLEdBQUcsSUFBSSxXQUFXLENBQzVCLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FDekMsQ0FBQztnQkFDRixJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3ZCO0lBQ0gsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUNELEtBQUs7UUFDSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELGVBQWU7UUFDYixJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0MsQ0FBQztDQUNGLENBQUE7O1lBbEhzQyxnQkFBZ0I7OztBQWhCMUMseUJBQXlCO0lBRHJDLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQztxQ0FpQkksZ0JBQWdCO0dBaEIxQyx5QkFBeUIsQ0FrSXJDO1NBbElZLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgeyBTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcclxuaW1wb3J0IHsgUG9seWdvbkluZm8sIFBvbHlnb25EcmF3U3RhdGVzLCBJTGF0TG5nIH0gZnJvbSBcIi4vcG9seWdvbi1oZWxwZXJzXCI7XHJcbmltcG9ydCB7IFBvbHlEcmF3U2VydmljZSB9IGZyb20gXCIuL3BvbHlkcmF3LnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgUG9seVN0YXRlU2VydmljZSB9IGZyb20gXCIuL21hcC1zdGF0ZS5zZXJ2aWNlXCI7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXHJcbmV4cG9ydCBjbGFzcyBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlIHtcclxuICBwb2x5Z29uSW5mb3JtYXRpb25TdWJqZWN0OiBTdWJqZWN0PFBvbHlnb25JbmZvW10+ID0gbmV3IFN1YmplY3Q8XHJcbiAgICBQb2x5Z29uSW5mb1tdXHJcbiAgPigpO1xyXG4gIHBvbHlnb25JbmZvcm1hdGlvbiQ6IE9ic2VydmFibGU8XHJcbiAgICBQb2x5Z29uSW5mb1tdXHJcbiAgPiA9IHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuICBwb2x5Z29uRHJhd1N0YXRlc1N1YmplY3Q6IFN1YmplY3Q8UG9seWdvbkRyYXdTdGF0ZXM+ID0gbmV3IFN1YmplY3Q8XHJcbiAgICBQb2x5Z29uRHJhd1N0YXRlc1xyXG4gID4oKTtcclxuICBwb2x5Z29uRHJhd1N0YXRlcyQ6IE9ic2VydmFibGU8XHJcbiAgICBQb2x5Z29uRHJhd1N0YXRlc1xyXG4gID4gPSB0aGlzLnBvbHlnb25EcmF3U3RhdGVzU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuXHJcbiAgcG9seWdvbkRyYXdTdGF0ZXM6IFBvbHlnb25EcmF3U3RhdGVzID0gbnVsbDtcclxuICBwb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlID0gW107XHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtYXBTdGF0ZVNlcnZpY2U6IFBvbHlTdGF0ZVNlcnZpY2UpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMgPSBuZXcgUG9seWdvbkRyYXdTdGF0ZXMoKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvbHlnb25zKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJ1cGRhdGVQb2x5Z29uczogXCIsIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSk7XHJcblxyXG4gICAgbGV0IG5ld1BvbHlnb25zOiBJTGF0TG5nW11bXVtdID0gbnVsbDtcclxuICAgIGlmICh0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UubGVuZ3RoID4gMCkge1xyXG4gICAgICBuZXdQb2x5Z29ucyA9IFtdO1xyXG5cclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2godiA9PiB7XHJcbiAgICAgICAgbGV0IHRlc3QgPSBbXTtcclxuICAgICAgICB2LnBvbHlnb24uZm9yRWFjaChwb2x5ID0+IHtcclxuICAgICAgICAgIGxldCB0ZXN0MiA9IFtdO1xyXG5cclxuICAgICAgICAgIHBvbHkuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgdGVzdDIgPSBbLi4ucG9seWdvbl07XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICBwb2x5Z29uWzBdLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bcG9seWdvbi5sZW5ndGggLSAxXS50b1N0cmluZygpXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgIHRlc3QyLnB1c2gocG9seWdvblswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVzdC5wdXNoKHRlc3QyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBuZXdQb2x5Z29ucy5wdXNoKHRlc3QpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuaGFzUG9seWdvbnMgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5yZXNldCgpO1xyXG4gICAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLmhhc1BvbHlnb25zID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLm1hcFN0YXRlU2VydmljZS51cGRhdGVQb2x5Z29ucyhuZXdQb2x5Z29ucyk7XHJcbiAgICB0aGlzLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcblxyXG4gIHNhdmVDdXJyZW50U3RhdGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN1YmplY3QubmV4dCh0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlc1N1YmplY3QubmV4dCh0aGlzLnBvbHlnb25EcmF3U3RhdGVzKTtcclxuICAgIGNvbnNvbGUubG9nKFwic2F2ZUN1cnJlbnRTdGF0ZTogXCIsIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVUcmFzaGNhbihwb2x5Z29uKSB7XHJcbiAgICBjb25zdCBpZHggPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZmluZEluZGV4KFxyXG4gICAgICB2ID0+IHYucG9seWdvblswXSA9PT0gcG9seWdvblxyXG4gICAgKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5zcGxpY2UoaWR4LCAxKTtcclxuICAgIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICB9XHJcblxyXG4gIGRlbGV0ZVRyYXNoQ2FuT25NdWx0aShwb2x5Z29uOiBJTGF0TG5nW11bXVtdKSB7XHJcbiAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgY29uc29sZS5sb2coXCJEZWxldGVUcmFzaENhbjogXCIsIHBvbHlnb24pO1xyXG4gICAgY29uc29sZS5sb2coXCJkZWxldGVUcmFzaENhbk9uTXVsdGk6IFwiLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gICAgLy8gY29uc3QgaWR4ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZpbmRJbmRleCh2ID0+IHYucG9seWdvbi5mb3JFYWNoKHBvbHkgPT57IHBvbHkgPT09IHBvbHlnb259KSApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2goKHYsIGkpID0+IHtcclxuICAgICAgY29uc29sZS5sb2codi5wb2x5Z29uKTtcclxuICAgICAgY29uc3QgaWQgPSB2LnBvbHlnb24uZmluZEluZGV4KFxyXG4gICAgICAgIHBvbHkgPT4gcG9seS50b1N0cmluZygpID09PSBwb2x5Z29uLnRvU3RyaW5nKClcclxuICAgICAgKTtcclxuICAgICAgaWYgKGlkID49IDApIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgdi50cmFzaGNhblBvaW50LnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5zcW1BcmVhLnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5wZXJpbWV0ZXIuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnBvbHlnb24uc3BsaWNlKGlkLCAxKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codi5wb2x5Z29uKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZyhcIklEOiBcIiwgaWQpO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICBjb25zb2xlLmxvZyhcIkluZGV4OiBcIiwgaW5kZXgpO1xyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5sZW5ndGggPiAxKSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJkZWxldGVUcmFzaENhbk9uTXVsdGk6IFwiLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSA9IFtdO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShhcnJheU9mRmVhdHVyZUdyb3Vwcykge1xyXG4gICAgY29uc29sZS5sb2coXCJDcmVhdGUgSW5mbzogXCIsIGFycmF5T2ZGZWF0dXJlR3JvdXBzKTtcclxuICAgIGlmIChhcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0uZ2V0TGF0TG5ncygpKTtcclxuICAgICAgICBsZXQgcG9seUluZm8gPSBuZXcgUG9seWdvbkluZm8oXHJcbiAgICAgICAgICBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0uZ2V0TGF0TG5ncygpXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UucHVzaChwb2x5SW5mbyk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhY3RpdmF0ZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuYWN0aXZhdGUoKTtcclxuICB9XHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICBzZXRNb3ZlTW9kZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuc2V0TW92ZU1vZGUoKTtcclxuICB9XHJcblxyXG4gIHNldEZyZWVEcmF3TW9kZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuc2V0RnJlZURyYXdNb2RlKCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==