import { __decorate, __metadata, __read, __spread } from "tslib";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { PolygonInfo, PolygonDrawStates } from "./polygon-helpers";
import { PolyStateService } from "./map-state.service";
import * as i0 from "@angular/core";
import * as i1 from "./map-state.service";
var PolygonInformationService = /** @class */ (function () {
    function PolygonInformationService(mapStateService) {
        this.mapStateService = mapStateService;
        this.polygonInformationSubject = new Subject();
        this.polygonInformation$ = this.polygonInformationSubject.asObservable();
        this.polygonDrawStatesSubject = new Subject();
        this.polygonDrawStates$ = this.polygonDrawStatesSubject.asObservable();
        this.polygonDrawStates = null;
        this.polygonInformationStorage = [];
        this.polygonDrawStates = new PolygonDrawStates();
    }
    PolygonInformationService.prototype.updatePolygons = function () {
        var newPolygons = null;
        if (this.polygonInformationStorage.length > 0) {
            newPolygons = [];
            this.polygonInformationStorage.forEach(function (v) {
                var test = [];
                v.polygon.forEach(function (poly) {
                    var test2 = [];
                    poly.forEach(function (polygon) {
                        test2 = __spread(polygon);
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
    };
    PolygonInformationService.prototype.saveCurrentState = function () {
        this.polygonInformationSubject.next(this.polygonInformationStorage);
        this.polygonDrawStatesSubject.next(this.polygonDrawStates);
    };
    PolygonInformationService.prototype.deleteTrashcan = function (polygon) {
        var idx = this.polygonInformationStorage.findIndex(function (v) { return v.polygon[0] === polygon; });
        this.polygonInformationStorage.splice(idx, 1);
        this.updatePolygons();
    };
    PolygonInformationService.prototype.deleteTrashCanOnMulti = function (polygon) {
        var index = 0;
        // const idx = this.polygonInformationStorage.findIndex(v => v.polygon.forEach(poly =>{ poly === polygon}) );
        this.polygonInformationStorage.forEach(function (v, i) {
            var id = v.polygon.findIndex(function (poly) { return poly.toString() === polygon.toString(); });
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
    };
    PolygonInformationService.prototype.deletePolygonInformationStorage = function () {
        this.polygonInformationStorage = [];
    };
    PolygonInformationService.prototype.createPolygonInformationStorage = function (arrayOfFeatureGroups) {
        var _this = this;
        if (arrayOfFeatureGroups.length > 0) {
            arrayOfFeatureGroups.forEach(function (featureGroup) {
                var polyInfo = new PolygonInfo(featureGroup.getLayers()[0].getLatLngs());
                _this.polygonInformationStorage.push(polyInfo);
            });
            this.updatePolygons();
        }
    };
    PolygonInformationService.prototype.activate = function () {
        this.polygonDrawStates.activate();
    };
    PolygonInformationService.prototype.reset = function () {
        this.polygonDrawStates.reset();
    };
    PolygonInformationService.prototype.setMoveMode = function () {
        this.polygonDrawStates.setMoveMode();
    };
    PolygonInformationService.prototype.setFreeDrawMode = function () {
        this.polygonDrawStates.setFreeDrawMode();
    };
    PolygonInformationService.ctorParameters = function () { return [
        { type: PolyStateService }
    ]; };
    PolygonInformationService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PolygonInformationService_Factory() { return new PolygonInformationService(i0.ɵɵinject(i1.PolyStateService)); }, token: PolygonInformationService, providedIn: "root" });
    PolygonInformationService = __decorate([
        Injectable({ providedIn: "root" }),
        __metadata("design:paramtypes", [PolyStateService])
    ], PolygonInformationService);
    return PolygonInformationService;
}());
export { PolygonInformationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQVcsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7O0FBR3ZEO0lBZ0JFLG1DQUFvQixlQUFpQztRQUFqQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFmckQsOEJBQXlCLEdBQTJCLElBQUksT0FBTyxFQUU1RCxDQUFDO1FBQ0osd0JBQW1CLEdBRWYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xELDZCQUF3QixHQUErQixJQUFJLE9BQU8sRUFFL0QsQ0FBQztRQUNKLHVCQUFrQixHQUVkLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVqRCxzQkFBaUIsR0FBc0IsSUFBSSxDQUFDO1FBQzVDLDhCQUF5QixHQUFHLEVBQUUsQ0FBQztRQUU3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxrREFBYyxHQUFkO1FBR0UsSUFBSSxXQUFXLEdBQWtCLElBQUksQ0FBQztRQUN0QyxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzdDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFFakIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7Z0JBQ3RDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FB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QztvQ0F4SUQ7Q0F3SUMsQUFsSUQsSUFrSUM7U0FsSVkseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xyXG5pbXBvcnQgeyBQb2x5Z29uSW5mbywgUG9seWdvbkRyYXdTdGF0ZXMsIElMYXRMbmcgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcclxuaW1wb3J0IHsgUG9seVN0YXRlU2VydmljZSB9IGZyb20gXCIuL21hcC1zdGF0ZS5zZXJ2aWNlXCI7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXHJcbmV4cG9ydCBjbGFzcyBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlIHtcclxuICBwb2x5Z29uSW5mb3JtYXRpb25TdWJqZWN0OiBTdWJqZWN0PFBvbHlnb25JbmZvW10+ID0gbmV3IFN1YmplY3Q8XHJcbiAgICBQb2x5Z29uSW5mb1tdXHJcbiAgPigpO1xyXG4gIHBvbHlnb25JbmZvcm1hdGlvbiQ6IE9ic2VydmFibGU8XHJcbiAgICBQb2x5Z29uSW5mb1tdXHJcbiAgPiA9IHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuICBwb2x5Z29uRHJhd1N0YXRlc1N1YmplY3Q6IFN1YmplY3Q8UG9seWdvbkRyYXdTdGF0ZXM+ID0gbmV3IFN1YmplY3Q8XHJcbiAgICBQb2x5Z29uRHJhd1N0YXRlc1xyXG4gID4oKTtcclxuICBwb2x5Z29uRHJhd1N0YXRlcyQ6IE9ic2VydmFibGU8XHJcbiAgICBQb2x5Z29uRHJhd1N0YXRlc1xyXG4gID4gPSB0aGlzLnBvbHlnb25EcmF3U3RhdGVzU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuXHJcbiAgcG9seWdvbkRyYXdTdGF0ZXM6IFBvbHlnb25EcmF3U3RhdGVzID0gbnVsbDtcclxuICBwb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlID0gW107XHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtYXBTdGF0ZVNlcnZpY2U6IFBvbHlTdGF0ZVNlcnZpY2UpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMgPSBuZXcgUG9seWdvbkRyYXdTdGF0ZXMoKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvbHlnb25zKCkge1xyXG4gICAgXHJcblxyXG4gICAgbGV0IG5ld1BvbHlnb25zOiBJTGF0TG5nW11bXVtdID0gbnVsbDtcclxuICAgIGlmICh0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UubGVuZ3RoID4gMCkge1xyXG4gICAgICBuZXdQb2x5Z29ucyA9IFtdO1xyXG5cclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2godiA9PiB7XHJcbiAgICAgICAgbGV0IHRlc3QgPSBbXTtcclxuICAgICAgICB2LnBvbHlnb24uZm9yRWFjaChwb2x5ID0+IHtcclxuICAgICAgICAgIGxldCB0ZXN0MiA9IFtdO1xyXG5cclxuICAgICAgICAgIHBvbHkuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgdGVzdDIgPSBbLi4ucG9seWdvbl07XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICBwb2x5Z29uWzBdLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bcG9seWdvbi5sZW5ndGggLSAxXS50b1N0cmluZygpXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgIHRlc3QyLnB1c2gocG9seWdvblswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVzdC5wdXNoKHRlc3QyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBuZXdQb2x5Z29ucy5wdXNoKHRlc3QpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuaGFzUG9seWdvbnMgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5yZXNldCgpO1xyXG4gICAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLmhhc1BvbHlnb25zID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLm1hcFN0YXRlU2VydmljZS51cGRhdGVQb2x5Z29ucyhuZXdQb2x5Z29ucyk7XHJcbiAgICB0aGlzLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcblxyXG4gIHNhdmVDdXJyZW50U3RhdGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN1YmplY3QubmV4dCh0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlc1N1YmplY3QubmV4dCh0aGlzLnBvbHlnb25EcmF3U3RhdGVzKTtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgZGVsZXRlVHJhc2hjYW4ocG9seWdvbikge1xyXG4gICAgY29uc3QgaWR4ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZpbmRJbmRleChcclxuICAgICAgdiA9PiB2LnBvbHlnb25bMF0gPT09IHBvbHlnb25cclxuICAgICk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2Uuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVUcmFzaENhbk9uTXVsdGkocG9seWdvbjogSUxhdExuZ1tdW11bXSkge1xyXG4gICAgbGV0IGluZGV4ID0gMDtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvLyBjb25zdCBpZHggPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZmluZEluZGV4KHYgPT4gdi5wb2x5Z29uLmZvckVhY2gocG9seSA9PnsgcG9seSA9PT0gcG9seWdvbn0pICk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZm9yRWFjaCgodiwgaSkgPT4ge1xyXG4gICAgICBcclxuICAgICAgY29uc3QgaWQgPSB2LnBvbHlnb24uZmluZEluZGV4KFxyXG4gICAgICAgIHBvbHkgPT4gcG9seS50b1N0cmluZygpID09PSBwb2x5Z29uLnRvU3RyaW5nKClcclxuICAgICAgKTtcclxuICAgICAgaWYgKGlkID49IDApIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgdi50cmFzaGNhblBvaW50LnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5zcW1BcmVhLnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5wZXJpbWV0ZXIuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnBvbHlnb24uc3BsaWNlKGlkLCAxKTtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICB9KTtcclxuICAgIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgIFxyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5sZW5ndGggPiAxKSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgfVxyXG5cclxuICBkZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCkge1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlID0gW107XHJcbiAgfVxyXG5cclxuICBjcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKGFycmF5T2ZGZWF0dXJlR3JvdXBzKSB7XHJcbiAgICBcclxuICAgIGlmIChhcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcG9seUluZm8gPSBuZXcgUG9seWdvbkluZm8oXHJcbiAgICAgICAgICBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0uZ2V0TGF0TG5ncygpXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UucHVzaChwb2x5SW5mbyk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhY3RpdmF0ZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuYWN0aXZhdGUoKTtcclxuICB9XHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICBzZXRNb3ZlTW9kZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuc2V0TW92ZU1vZGUoKTtcclxuICB9XHJcblxyXG4gIHNldEZyZWVEcmF3TW9kZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuc2V0RnJlZURyYXdNb2RlKCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==