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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQVcsTUFBTSxtQkFBbUIsQ0FBQztBQUU1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7O0FBR3ZEO0lBZ0JFLG1DQUFvQixlQUFpQztRQUFqQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFmckQsOEJBQXlCLEdBQTJCLElBQUksT0FBTyxFQUU1RCxDQUFDO1FBQ0osd0JBQW1CLEdBRWYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xELDZCQUF3QixHQUErQixJQUFJLE9BQU8sRUFFL0QsQ0FBQztRQUNKLHVCQUFrQixHQUVkLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVqRCxzQkFBaUIsR0FBc0IsSUFBSSxDQUFDO1FBQzVDLDhCQUF5QixHQUFHLEVBQUUsQ0FBQztRQUU3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxrREFBYyxHQUFkO1FBR0UsSUFBSSxXQUFXLEdBQWtCLElBQUksQ0FBQztRQUN0QyxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzdDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFFakIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7Z0JBQ3RDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FB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QztvQ0F6SUQ7Q0F5SUMsQUFsSUQsSUFrSUM7U0FsSVkseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xyXG5pbXBvcnQgeyBQb2x5Z29uSW5mbywgUG9seWdvbkRyYXdTdGF0ZXMsIElMYXRMbmcgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcclxuaW1wb3J0IHsgUG9seURyYXdTZXJ2aWNlIH0gZnJvbSBcIi4vcG9seWRyYXcuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBQb2x5U3RhdGVTZXJ2aWNlIH0gZnJvbSBcIi4vbWFwLXN0YXRlLnNlcnZpY2VcIjtcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogXCJyb290XCIgfSlcclxuZXhwb3J0IGNsYXNzIFBvbHlnb25JbmZvcm1hdGlvblNlcnZpY2Uge1xyXG4gIHBvbHlnb25JbmZvcm1hdGlvblN1YmplY3Q6IFN1YmplY3Q8UG9seWdvbkluZm9bXT4gPSBuZXcgU3ViamVjdDxcclxuICAgIFBvbHlnb25JbmZvW11cclxuICA+KCk7XHJcbiAgcG9seWdvbkluZm9ybWF0aW9uJDogT2JzZXJ2YWJsZTxcclxuICAgIFBvbHlnb25JbmZvW11cclxuICA+ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG4gIHBvbHlnb25EcmF3U3RhdGVzU3ViamVjdDogU3ViamVjdDxQb2x5Z29uRHJhd1N0YXRlcz4gPSBuZXcgU3ViamVjdDxcclxuICAgIFBvbHlnb25EcmF3U3RhdGVzXHJcbiAgPigpO1xyXG4gIHBvbHlnb25EcmF3U3RhdGVzJDogT2JzZXJ2YWJsZTxcclxuICAgIFBvbHlnb25EcmF3U3RhdGVzXHJcbiAgPiA9IHRoaXMucG9seWdvbkRyYXdTdGF0ZXNTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG5cclxuICBwb2x5Z29uRHJhd1N0YXRlczogUG9seWdvbkRyYXdTdGF0ZXMgPSBudWxsO1xyXG4gIHBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UgPSBbXTtcclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1hcFN0YXRlU2VydmljZTogUG9seVN0YXRlU2VydmljZSkge1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcyA9IG5ldyBQb2x5Z29uRHJhd1N0YXRlcygpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlUG9seWdvbnMoKSB7XHJcbiAgICBcclxuXHJcbiAgICBsZXQgbmV3UG9seWdvbnM6IElMYXRMbmdbXVtdW10gPSBudWxsO1xyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIG5ld1BvbHlnb25zID0gW107XHJcblxyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZm9yRWFjaCh2ID0+IHtcclxuICAgICAgICBsZXQgdGVzdCA9IFtdO1xyXG4gICAgICAgIHYucG9seWdvbi5mb3JFYWNoKHBvbHkgPT4ge1xyXG4gICAgICAgICAgbGV0IHRlc3QyID0gW107XHJcblxyXG4gICAgICAgICAgcG9seS5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICB0ZXN0MiA9IFsuLi5wb2x5Z29uXTtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgIHBvbHlnb25bMF0udG9TdHJpbmcoKSAhPT0gcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDFdLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgdGVzdDIucHVzaChwb2x5Z29uWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZXN0LnB1c2godGVzdDIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG5ld1BvbHlnb25zLnB1c2godGVzdCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5oYXNQb2x5Z29ucyA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnJlc2V0KCk7XHJcbiAgICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuaGFzUG9seWdvbnMgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMubWFwU3RhdGVTZXJ2aWNlLnVwZGF0ZVBvbHlnb25zKG5ld1BvbHlnb25zKTtcclxuICAgIHRoaXMuc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgc2F2ZUN1cnJlbnRTdGF0ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3ViamVjdC5uZXh0KHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSk7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzU3ViamVjdC5uZXh0KHRoaXMucG9seWdvbkRyYXdTdGF0ZXMpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICBkZWxldGVUcmFzaGNhbihwb2x5Z29uKSB7XHJcbiAgICBjb25zdCBpZHggPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZmluZEluZGV4KFxyXG4gICAgICB2ID0+IHYucG9seWdvblswXSA9PT0gcG9seWdvblxyXG4gICAgKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5zcGxpY2UoaWR4LCAxKTtcclxuICAgIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICB9XHJcblxyXG4gIGRlbGV0ZVRyYXNoQ2FuT25NdWx0aShwb2x5Z29uOiBJTGF0TG5nW11bXVtdKSB7XHJcbiAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgXHJcbiAgICBcclxuICAgIC8vIGNvbnN0IGlkeCA9IHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5maW5kSW5kZXgodiA9PiB2LnBvbHlnb24uZm9yRWFjaChwb2x5ID0+eyBwb2x5ID09PSBwb2x5Z29ufSkgKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5mb3JFYWNoKCh2LCBpKSA9PiB7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBpZCA9IHYucG9seWdvbi5maW5kSW5kZXgoXHJcbiAgICAgICAgcG9seSA9PiBwb2x5LnRvU3RyaW5nKCkgPT09IHBvbHlnb24udG9TdHJpbmcoKVxyXG4gICAgICApO1xyXG4gICAgICBpZiAoaWQgPj0gMCkge1xyXG4gICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICB2LnRyYXNoY2FuUG9pbnQuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnNxbUFyZWEuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnBlcmltZXRlci5zcGxpY2UoaWQsIDEpO1xyXG4gICAgICAgIHYucG9seWdvbi5zcGxpY2UoaWQsIDEpO1xyXG5cclxuICAgICAgICBcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgIH0pO1xyXG4gICAgdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgXHJcbiAgICBpZiAodGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmxlbmd0aCA+IDEpIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcblxyXG4gIGRlbGV0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoKSB7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UgPSBbXTtcclxuICB9XHJcblxyXG4gIGNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoYXJyYXlPZkZlYXR1cmVHcm91cHMpIHtcclxuICAgIFxyXG4gICAgaWYgKGFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBwb2x5SW5mbyA9IG5ldyBQb2x5Z29uSW5mbyhcclxuICAgICAgICAgIGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXS5nZXRMYXRMbmdzKClcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5wdXNoKHBvbHlJbmZvKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFjdGl2YXRlKCkge1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5hY3RpdmF0ZSgpO1xyXG4gIH1cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIHNldE1vdmVNb2RlKCkge1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5zZXRNb3ZlTW9kZSgpO1xyXG4gIH1cclxuXHJcbiAgc2V0RnJlZURyYXdNb2RlKCkge1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5zZXRGcmVlRHJhd01vZGUoKTtcclxuICB9XHJcbn1cclxuIl19
