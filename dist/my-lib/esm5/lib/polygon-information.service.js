import * as tslib_1 from "tslib";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { PolygonInfo } from "./polygon-helpers";
import { MapStateService } from "./map-state.service";
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
        { type: MapStateService }
    ]; };
    PolygonInformationService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function PolygonInformationService_Factory() { return new PolygonInformationService(i0.ɵɵinject(i1.MapStateService)); }, token: PolygonInformationService, providedIn: "root" });
    PolygonInformationService = tslib_1.__decorate([
        Injectable({ providedIn: "root" }),
        tslib_1.__metadata("design:paramtypes", [MapStateService])
    ], PolygonInformationService);
    return PolygonInformationService;
}());
export { PolygonInformationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQThCLE1BQU0sbUJBQW1CLENBQUM7QUFFNUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDOzs7QUFHdEQ7SUFPRSxtQ0FBb0IsZUFBZ0M7UUFBaEMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBTnBELDhCQUF5QixHQUEyQixJQUFJLE9BQU8sRUFBaUIsQ0FBQztRQUNqRix3QkFBbUIsR0FBOEIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQy9GLDZCQUF3QixHQUErQixJQUFJLE9BQU8sRUFBcUIsQ0FBQztRQUN4Rix1QkFBa0IsR0FBa0MsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksRUFBRSxDQUFDO1FBRWpHLDhCQUF5QixHQUFHLEVBQUUsQ0FBQztJQUN3QixDQUFDO0lBRXhELGtEQUFjLEdBQWQ7UUFDRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBRWhFLElBQUksV0FBVyxHQUFrQixJQUFJLENBQUM7UUFDdEMsSUFBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM3QyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBR2pCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO2dCQUN0QyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUE7Z0JBQ2IsQ0FBQyxDQUFDLE9BQU8s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U0FDdkI7SUFDSCxDQUFDOztnQkExRm9DLGVBQWU7OztJQVB6Qyx5QkFBeUI7UUFEckMsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO2lEQVFJLGVBQWU7T0FQekMseUJBQXlCLENBa0dyQztvQ0F6R0Q7Q0F5R0MsQUFsR0QsSUFrR0M7U0FsR1kseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tIFwicnhqc1wiO1xyXG5pbXBvcnQgeyBQb2x5Z29uSW5mbywgUG9seWdvbkRyYXdTdGF0ZXMsIElMYXRMbmcgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcclxuaW1wb3J0IHsgUG9seURyYXdTZXJ2aWNlIH0gZnJvbSBcIi4vcG9seWRyYXcuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBNYXBTdGF0ZVNlcnZpY2UgfSBmcm9tIFwiLi9tYXAtc3RhdGUuc2VydmljZVwiO1xyXG5cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiBcInJvb3RcIiB9KVxyXG5leHBvcnQgY2xhc3MgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSB7XHJcbiAgcG9seWdvbkluZm9ybWF0aW9uU3ViamVjdDogU3ViamVjdDxQb2x5Z29uSW5mb1tdPiA9IG5ldyBTdWJqZWN0PFBvbHlnb25JbmZvW10+KCk7XHJcbiAgcG9seWdvbkluZm9ybWF0aW9uJDogT2JzZXJ2YWJsZTxQb2x5Z29uSW5mb1tdPiA9IHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuICBwb2x5Z29uRHJhd1N0YXRlc1N1YmplY3Q6IFN1YmplY3Q8UG9seWdvbkRyYXdTdGF0ZXM+ID0gbmV3IFN1YmplY3Q8UG9seWdvbkRyYXdTdGF0ZXM+KCk7XHJcbiAgcG9seWdvbkRyYXdTdGF0ZXMkOiBPYnNlcnZhYmxlPFBvbHlnb25EcmF3U3RhdGVzPiA9IHRoaXMucG9seWdvbkRyYXdTdGF0ZXNTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG5cclxuICBwb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlID0gW107XHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtYXBTdGF0ZVNlcnZpY2U6IE1hcFN0YXRlU2VydmljZSkge31cclxuXHJcbiAgdXBkYXRlUG9seWdvbnMoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInVwZGF0ZVBvbHlnb25zOiBcIiwgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcclxuXHJcbiAgICBsZXQgbmV3UG9seWdvbnM6IElMYXRMbmdbXVtdW10gPSBudWxsO1xyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIG5ld1BvbHlnb25zID0gW107XHJcbiAgICAgIFxyXG4gICAgICBcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2godiA9PiB7XHJcbiAgICAgICAgbGV0IHRlc3QgPSBbXVxyXG4gICAgICAgIHYucG9seWdvbi5mb3JFYWNoKChwb2x5KSA9PiB7XHJcbiAgICAgICAgICBsZXQgdGVzdDIgPSBbXVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcG9seS5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICAgIHRlc3QyID0gWy4uLnBvbHlnb25dXHJcbiAgICAgICAgICAgICAgaWYgKHBvbHlnb25bMF0udG9TdHJpbmcoKSAhPT0gcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDFdLnRvU3RyaW5nKCkpIHtcclxuICAgICAgICAgICAgICAgIHRlc3QyLnB1c2gocG9seWdvblswXSk7ICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgdGVzdC5wdXNoKHRlc3QyKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgbmV3UG9seWdvbnMucHVzaCh0ZXN0KVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5oYXNQb2x5Z29ucyA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnJlc2V0KCk7XHJcbiAgICAgIC8vIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuaGFzUG9seWdvbnMgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHRoaXMubWFwU3RhdGVTZXJ2aWNlLnVwZGF0ZVBvbHlnb25zKG5ld1BvbHlnb25zKTtcclxuICAgIHRoaXMuc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgc2F2ZUN1cnJlbnRTdGF0ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3ViamVjdC5uZXh0KHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSk7XHJcbiAgICBjb25zb2xlLmxvZyhcInNhdmVDdXJyZW50U3RhdGU6IFwiLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlVHJhc2hjYW4ocG9seWdvbikge1xyXG4gICAgY29uc3QgaWR4ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZpbmRJbmRleCh2ID0+IHYucG9seWdvblswXSA9PT0gcG9seWdvbik7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2Uuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVUcmFzaENhbk9uTXVsdGkocG9seWdvbjogSUxhdExuZ1tdW11bXSkge1xyXG4gICAgbGV0IGluZGV4ID0gMDtcclxuICAgIGNvbnNvbGUubG9nKFwiRGVsZXRlVHJhc2hDYW46IFwiLCBwb2x5Z29uKTtcclxuICAgIGNvbnNvbGUubG9nKFwiZGVsZXRlVHJhc2hDYW5Pbk11bHRpOiBcIiwgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcclxuICAgIC8vIGNvbnN0IGlkeCA9IHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5maW5kSW5kZXgodiA9PiB2LnBvbHlnb24uZm9yRWFjaChwb2x5ID0+eyBwb2x5ID09PSBwb2x5Z29ufSkgKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5mb3JFYWNoKCh2LCBpKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKHYucG9seWdvbik7XHJcbiAgICAgIGNvbnN0IGlkID0gdi5wb2x5Z29uLmZpbmRJbmRleChwb2x5ID0+IHBvbHkudG9TdHJpbmcoKSA9PT0gcG9seWdvbi50b1N0cmluZygpKTtcclxuICAgICAgaWYgKGlkID49IDApIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgdi50cmFzaGNhblBvaW50LnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5zcW1BcmVhLnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5wZXJpbWV0ZXIuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnBvbHlnb24uc3BsaWNlKGlkLCAxKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codi5wb2x5Z29uKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZyhcIklEOiBcIiwgaWQpO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICBjb25zb2xlLmxvZyhcIkluZGV4OiBcIiwgaW5kZXgpO1xyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5sZW5ndGggPiAxKSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJkZWxldGVUcmFzaENhbk9uTXVsdGk6IFwiLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSA9IFtdO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShhcnJheU9mRmVhdHVyZUdyb3Vwcykge1xyXG4gICAgY29uc29sZS5sb2coXCJDcmVhdGUgSW5mbzogXCIsIGFycmF5T2ZGZWF0dXJlR3JvdXBzKTtcclxuICAgIGlmIChhcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0uZ2V0TGF0TG5ncygpKTtcclxuICAgICAgICBsZXQgcG9seUluZm8gPSBuZXcgUG9seWdvbkluZm8oZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdLmdldExhdExuZ3MoKSk7XHJcbiAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnB1c2gocG9seUluZm8pO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=