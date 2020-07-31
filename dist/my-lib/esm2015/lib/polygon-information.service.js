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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQVcsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7O0FBR3ZELElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBZ0JwQyxZQUFvQixlQUFpQztRQUFqQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFmckQsOEJBQXlCLEdBQTJCLElBQUksT0FBTyxFQUU1RCxDQUFDO1FBQ0osd0JBQW1CLEdBRWYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xELDZCQUF3QixHQUErQixJQUFJLE9BQU8sRUFFL0QsQ0FBQztRQUNKLHVCQUFrQixHQUVkLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVqRCxzQkFBaUIsR0FBc0IsSUFBSSxDQUFDO1FBQzVDLDhCQUF5QixHQUFHLEVBQUUsQ0FBQztRQUU3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxjQUFjO1FBR1osSUFBSSxXQUFXLEdBQWtCLElBQUksQ0FBQztRQUN0QyxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzdDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFFakIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtn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c291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xyXG5pbXBvcnQgeyBQb2x5Z29uSW5mbywgUG9seWdvbkRyYXdTdGF0ZXMsIElMYXRMbmcgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcclxuaW1wb3J0IHsgUG9seVN0YXRlU2VydmljZSB9IGZyb20gXCIuL21hcC1zdGF0ZS5zZXJ2aWNlXCI7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXHJcbmV4cG9ydCBjbGFzcyBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlIHtcclxuICBwb2x5Z29uSW5mb3JtYXRpb25TdWJqZWN0OiBTdWJqZWN0PFBvbHlnb25JbmZvW10+ID0gbmV3IFN1YmplY3Q8XHJcbiAgICBQb2x5Z29uSW5mb1tdXHJcbiAgPigpO1xyXG4gIHBvbHlnb25JbmZvcm1hdGlvbiQ6IE9ic2VydmFibGU8XHJcbiAgICBQb2x5Z29uSW5mb1tdXHJcbiAgPiA9IHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuICBwb2x5Z29uRHJhd1N0YXRlc1N1YmplY3Q6IFN1YmplY3Q8UG9seWdvbkRyYXdTdGF0ZXM+ID0gbmV3IFN1YmplY3Q8XHJcbiAgICBQb2x5Z29uRHJhd1N0YXRlc1xyXG4gID4oKTtcclxuICBwb2x5Z29uRHJhd1N0YXRlcyQ6IE9ic2VydmFibGU8XHJcbiAgICBQb2x5Z29uRHJhd1N0YXRlc1xyXG4gID4gPSB0aGlzLnBvbHlnb25EcmF3U3RhdGVzU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuXHJcbiAgcG9seWdvbkRyYXdTdGF0ZXM6IFBvbHlnb25EcmF3U3RhdGVzID0gbnVsbDtcclxuICBwb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlID0gW107XHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtYXBTdGF0ZVNlcnZpY2U6IFBvbHlTdGF0ZVNlcnZpY2UpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMgPSBuZXcgUG9seWdvbkRyYXdTdGF0ZXMoKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvbHlnb25zKCkge1xyXG4gICAgXHJcblxyXG4gICAgbGV0IG5ld1BvbHlnb25zOiBJTGF0TG5nW11bXVtdID0gbnVsbDtcclxuICAgIGlmICh0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UubGVuZ3RoID4gMCkge1xyXG4gICAgICBuZXdQb2x5Z29ucyA9IFtdO1xyXG5cclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2godiA9PiB7XHJcbiAgICAgICAgbGV0IHRlc3QgPSBbXTtcclxuICAgICAgICB2LnBvbHlnb24uZm9yRWFjaChwb2x5ID0+IHtcclxuICAgICAgICAgIGxldCB0ZXN0MiA9IFtdO1xyXG5cclxuICAgICAgICAgIHBvbHkuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgdGVzdDIgPSBbLi4ucG9seWdvbl07XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICBwb2x5Z29uWzBdLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bcG9seWdvbi5sZW5ndGggLSAxXS50b1N0cmluZygpXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgIHRlc3QyLnB1c2gocG9seWdvblswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVzdC5wdXNoKHRlc3QyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBuZXdQb2x5Z29ucy5wdXNoKHRlc3QpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuaGFzUG9seWdvbnMgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5yZXNldCgpO1xyXG4gICAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLmhhc1BvbHlnb25zID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLm1hcFN0YXRlU2VydmljZS51cGRhdGVQb2x5Z29ucyhuZXdQb2x5Z29ucyk7XHJcbiAgICB0aGlzLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcblxyXG4gIHNhdmVDdXJyZW50U3RhdGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN1YmplY3QubmV4dCh0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlc1N1YmplY3QubmV4dCh0aGlzLnBvbHlnb25EcmF3U3RhdGVzKTtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgZGVsZXRlVHJhc2hjYW4ocG9seWdvbikge1xyXG4gICAgY29uc3QgaWR4ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZpbmRJbmRleChcclxuICAgICAgdiA9PiB2LnBvbHlnb25bMF0gPT09IHBvbHlnb25cclxuICAgICk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2Uuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVUcmFzaENhbk9uTXVsdGkocG9seWdvbjogSUxhdExuZ1tdW11bXSkge1xyXG4gICAgbGV0IGluZGV4ID0gMDtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvLyBjb25zdCBpZHggPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZmluZEluZGV4KHYgPT4gdi5wb2x5Z29uLmZvckVhY2gocG9seSA9PnsgcG9seSA9PT0gcG9seWdvbn0pICk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZm9yRWFjaCgodiwgaSkgPT4ge1xyXG4gICAgICBcclxuICAgICAgY29uc3QgaWQgPSB2LnBvbHlnb24uZmluZEluZGV4KFxyXG4gICAgICAgIHBvbHkgPT4gcG9seS50b1N0cmluZygpID09PSBwb2x5Z29uLnRvU3RyaW5nKClcclxuICAgICAgKTtcclxuICAgICAgaWYgKGlkID49IDApIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgdi50cmFzaGNhblBvaW50LnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5zcW1BcmVhLnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5wZXJpbWV0ZXIuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnBvbHlnb24uc3BsaWNlKGlkLCAxKTtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICB9KTtcclxuICAgIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgIFxyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5sZW5ndGggPiAxKSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgfVxyXG5cclxuICBkZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCkge1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlID0gW107XHJcbiAgfVxyXG5cclxuICBjcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKGFycmF5T2ZGZWF0dXJlR3JvdXBzKSB7XHJcbiAgICBcclxuICAgIGlmIChhcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcG9seUluZm8gPSBuZXcgUG9seWdvbkluZm8oXHJcbiAgICAgICAgICBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0uZ2V0TGF0TG5ncygpXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UucHVzaChwb2x5SW5mbyk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhY3RpdmF0ZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuYWN0aXZhdGUoKTtcclxuICB9XHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICBzZXRNb3ZlTW9kZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuc2V0TW92ZU1vZGUoKTtcclxuICB9XHJcblxyXG4gIHNldEZyZWVEcmF3TW9kZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuc2V0RnJlZURyYXdNb2RlKCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==