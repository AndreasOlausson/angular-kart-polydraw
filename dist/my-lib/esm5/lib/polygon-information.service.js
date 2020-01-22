import * as tslib_1 from "tslib";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { PolygonInfo } from "./polygon-helpers";
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
        this.polygonInformationStorage = [];
    }
    PolygonInformationService.prototype.updatePolygons = function () {
        console.log("updatePolygons: ", this.polygonInformationStorage);
        var newPolygons = null;
        if (this.polygonInformationStorage.length > 0) {
            newPolygons = [];
            this.polygonInformationStorage.forEach(function (v) {
                var test = [];
                v.polygon.forEach(function (poly) {
                    var test2 = [];
                    poly.forEach(function (polygon) {
                        test2 = tslib_1.__spread(polygon);
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
    };
    PolygonInformationService.prototype.saveCurrentState = function () {
        this.polygonInformationSubject.next(this.polygonInformationStorage);
        console.log("saveCurrentState: ", this.polygonInformationStorage);
    };
    PolygonInformationService.prototype.deleteTrashcan = function (polygon) {
        var idx = this.polygonInformationStorage.findIndex(function (v) { return v.polygon[0] === polygon; });
        this.polygonInformationStorage.splice(idx, 1);
        this.updatePolygons();
    };
    PolygonInformationService.prototype.deleteTrashCanOnMulti = function (polygon) {
        var index = 0;
        console.log("DeleteTrashCan: ", polygon);
        console.log("deleteTrashCanOnMulti: ", this.polygonInformationStorage);
        // const idx = this.polygonInformationStorage.findIndex(v => v.polygon.forEach(poly =>{ poly === polygon}) );
        this.polygonInformationStorage.forEach(function (v, i) {
            console.log(v.polygon);
            var id = v.polygon.findIndex(function (poly) { return poly.toString() === polygon.toString(); });
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
    };
    PolygonInformationService.prototype.deletePolygonInformationStorage = function () {
        this.polygonInformationStorage = [];
    };
    PolygonInformationService.prototype.createPolygonInformationStorage = function (arrayOfFeatureGroups) {
        var _this = this;
        console.log("Create Info: ", arrayOfFeatureGroups);
        if (arrayOfFeatureGroups.length > 0) {
            arrayOfFeatureGroups.forEach(function (featureGroup) {
                console.log(featureGroup.getLayers()[0].getLatLngs());
                var polyInfo = new PolygonInfo(featureGroup.getLayers()[0].getLatLngs());
                _this.polygonInformationStorage.push(polyInfo);
            });
            this.updatePolygons();
        }
    };
    PolygonInformationService.ctorParameters = function () { return [
        { type: PolyStateService }
    ]; };
    PolygonInformationService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function PolygonInformationService_Factory() { return new PolygonInformationService(i0.ɵɵinject(i1.PolyStateService)); }, token: PolygonInformationService, providedIn: "root" });
    PolygonInformationService = tslib_1.__decorate([
        Injectable({ providedIn: "root" }),
        tslib_1.__metadata("design:paramtypes", [PolyStateService])
    ], PolygonInformationService);
    return PolygonInformationService;
}());
export { PolygonInformationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQThCLE1BQU0sbUJBQW1CLENBQUM7QUFFNUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7OztBQUd2RDtJQU9FLG1DQUFvQixlQUFpQztRQUFqQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFOckQsOEJBQXlCLEdBQTJCLElBQUksT0FBTyxFQUFpQixDQUFDO1FBQ2pGLHdCQUFtQixHQUE4QixJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDL0YsNkJBQXdCLEdBQStCLElBQUksT0FBTyxFQUFxQixDQUFDO1FBQ3hGLHVCQUFrQixHQUFrQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFakcsOEJBQXlCLEdBQUcsRUFBRSxDQUFDO0lBQ3lCLENBQUM7SUFFekQsa0RBQWMsR0FBZDtRQUNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFFaEUsSUFBSSxXQUFXLEdBQWtCLElBQUksQ0FBQztRQUN0QyxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzdDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFHakIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7Z0JBQ3RDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtnQkFDYixDQUFDLENBQUMsT0FB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QztTQUN2QjtJQUNILENBQUM7O2dCQTFGb0MsZ0JBQWdCOzs7SUFQMUMseUJBQXlCO1FBRHJDLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQztpREFRSSxnQkFBZ0I7T0FQMUMseUJBQXlCLENBa0dyQztvQ0F6R0Q7Q0F5R0MsQUFsR0QsSUFrR0M7U0FsR1kseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xyXG5pbXBvcnQgeyBQb2x5Z29uSW5mbywgUG9seWdvbkRyYXdTdGF0ZXMsIElMYXRMbmcgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcclxuaW1wb3J0IHsgUG9seURyYXdTZXJ2aWNlIH0gZnJvbSBcIi4vcG9seWRyYXcuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBQb2x5U3RhdGVTZXJ2aWNlIH0gZnJvbSBcIi4vbWFwLXN0YXRlLnNlcnZpY2VcIjtcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogXCJyb290XCIgfSlcclxuZXhwb3J0IGNsYXNzIFBvbHlnb25JbmZvcm1hdGlvblNlcnZpY2Uge1xyXG4gIHBvbHlnb25JbmZvcm1hdGlvblN1YmplY3Q6IFN1YmplY3Q8UG9seWdvbkluZm9bXT4gPSBuZXcgU3ViamVjdDxQb2x5Z29uSW5mb1tdPigpO1xyXG4gIHBvbHlnb25JbmZvcm1hdGlvbiQ6IE9ic2VydmFibGU8UG9seWdvbkluZm9bXT4gPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgcG9seWdvbkRyYXdTdGF0ZXNTdWJqZWN0OiBTdWJqZWN0PFBvbHlnb25EcmF3U3RhdGVzPiA9IG5ldyBTdWJqZWN0PFBvbHlnb25EcmF3U3RhdGVzPigpO1xyXG4gIHBvbHlnb25EcmF3U3RhdGVzJDogT2JzZXJ2YWJsZTxQb2x5Z29uRHJhd1N0YXRlcz4gPSB0aGlzLnBvbHlnb25EcmF3U3RhdGVzU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuXHJcbiAgcG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSA9IFtdO1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbWFwU3RhdGVTZXJ2aWNlOiBQb2x5U3RhdGVTZXJ2aWNlKSB7fVxyXG5cclxuICB1cGRhdGVQb2x5Z29ucygpIHtcclxuICAgIGNvbnNvbGUubG9nKFwidXBkYXRlUG9seWdvbnM6IFwiLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG5cclxuICAgIGxldCBuZXdQb2x5Z29uczogSUxhdExuZ1tdW11bXSA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmxlbmd0aCA+IDApIHtcclxuICAgICAgbmV3UG9seWdvbnMgPSBbXTtcclxuICAgICAgXHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZm9yRWFjaCh2ID0+IHtcclxuICAgICAgICBsZXQgdGVzdCA9IFtdXHJcbiAgICAgICAgdi5wb2x5Z29uLmZvckVhY2goKHBvbHkpID0+IHtcclxuICAgICAgICAgIGxldCB0ZXN0MiA9IFtdXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBwb2x5LmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICAgICAgdGVzdDIgPSBbLi4ucG9seWdvbl1cclxuICAgICAgICAgICAgICBpZiAocG9seWdvblswXS50b1N0cmluZygpICE9PSBwb2x5Z29uW3BvbHlnb24ubGVuZ3RoIC0gMV0udG9TdHJpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgdGVzdDIucHVzaChwb2x5Z29uWzBdKTsgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0gIFxyXG4gICAgICAgICAgICB0ZXN0LnB1c2godGVzdDIpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgICBuZXdQb2x5Z29ucy5wdXNoKHRlc3QpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAvLyB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLmhhc1BvbHlnb25zID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMucmVzZXQoKTtcclxuICAgICAgLy8gdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5oYXNQb2x5Z29ucyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tYXBTdGF0ZVNlcnZpY2UudXBkYXRlUG9seWdvbnMobmV3UG9seWdvbnMpO1xyXG4gICAgdGhpcy5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICBzYXZlQ3VycmVudFN0YXRlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdWJqZWN0Lm5leHQodGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcclxuICAgIGNvbnNvbGUubG9nKFwic2F2ZUN1cnJlbnRTdGF0ZTogXCIsIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVUcmFzaGNhbihwb2x5Z29uKSB7XHJcbiAgICBjb25zdCBpZHggPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZmluZEluZGV4KHYgPT4gdi5wb2x5Z29uWzBdID09PSBwb2x5Z29uKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5zcGxpY2UoaWR4LCAxKTtcclxuICAgIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICB9XHJcblxyXG4gIGRlbGV0ZVRyYXNoQ2FuT25NdWx0aShwb2x5Z29uOiBJTGF0TG5nW11bXVtdKSB7XHJcbiAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgY29uc29sZS5sb2coXCJEZWxldGVUcmFzaENhbjogXCIsIHBvbHlnb24pO1xyXG4gICAgY29uc29sZS5sb2coXCJkZWxldGVUcmFzaENhbk9uTXVsdGk6IFwiLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gICAgLy8gY29uc3QgaWR4ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZpbmRJbmRleCh2ID0+IHYucG9seWdvbi5mb3JFYWNoKHBvbHkgPT57IHBvbHkgPT09IHBvbHlnb259KSApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2goKHYsIGkpID0+IHtcclxuICAgICAgY29uc29sZS5sb2codi5wb2x5Z29uKTtcclxuICAgICAgY29uc3QgaWQgPSB2LnBvbHlnb24uZmluZEluZGV4KHBvbHkgPT4gcG9seS50b1N0cmluZygpID09PSBwb2x5Z29uLnRvU3RyaW5nKCkpO1xyXG4gICAgICBpZiAoaWQgPj0gMCkge1xyXG4gICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICB2LnRyYXNoY2FuUG9pbnQuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnNxbUFyZWEuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnBlcmltZXRlci5zcGxpY2UoaWQsIDEpO1xyXG4gICAgICAgIHYucG9seWdvbi5zcGxpY2UoaWQsIDEpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyh2LnBvbHlnb24pO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiSUQ6IFwiLCBpZCk7XHJcbiAgICB9KTtcclxuICAgIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgIGNvbnNvbGUubG9nKFwiSW5kZXg6IFwiLCBpbmRleCk7XHJcbiAgICBpZiAodGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmxlbmd0aCA+IDEpIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhcImRlbGV0ZVRyYXNoQ2FuT25NdWx0aTogXCIsIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCkge1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlID0gW107XHJcbiAgfVxyXG5cclxuICBjcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKGFycmF5T2ZGZWF0dXJlR3JvdXBzKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIkNyZWF0ZSBJbmZvOiBcIiwgYXJyYXlPZkZlYXR1cmVHcm91cHMpO1xyXG4gICAgaWYgKGFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXS5nZXRMYXRMbmdzKCkpO1xyXG4gICAgICAgIGxldCBwb2x5SW5mbyA9IG5ldyBQb2x5Z29uSW5mbyhmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0uZ2V0TGF0TG5ncygpKTtcclxuICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UucHVzaChwb2x5SW5mbyk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==