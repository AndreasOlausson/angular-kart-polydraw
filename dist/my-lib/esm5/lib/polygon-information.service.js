import { __read, __spreadArray } from "tslib";
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
                        test2 = __spreadArray([], __read(polygon));
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
    PolygonInformationService.ɵfac = function PolygonInformationService_Factory(t) { return new (t || PolygonInformationService)(i0.ɵɵinject(i1.PolyStateService)); };
    PolygonInformationService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: PolygonInformationService, factory: PolygonInformationService.ɵfac, providedIn: "root" });
    return PolygonInformationService;
}());
export { PolygonInformationService };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PolygonInformationService, [{
        type: Injectable,
        args: [{ providedIn: "root" }]
    }], function () { return [{ type: i1.PolyStateService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQVcsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7O0FBRXZEO0lBaUJFLG1DQUFvQixlQUFpQztRQUFqQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFmckQsOEJBQXlCLEdBQTJCLElBQUksT0FBTyxFQUU1RCxDQUFDO1FBQ0osd0JBQW1CLEdBRWYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xELDZCQUF3QixHQUErQixJQUFJLE9BQU8sRUFFL0QsQ0FBQztRQUNKLHVCQUFrQixHQUVkLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVqRCxzQkFBaUIsR0FBc0IsSUFBSSxDQUFDO1FBQzVDLDhCQUF5QixHQUFHLEVBQUUsQ0FBQztRQUU3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxrREFBYyxHQUFkO1FBR0UsSUFBSSxXQUFXLEdBQWtCLElBQUksQ0FBQztRQUN0QyxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzdDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFFakIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7Z0JBQ3RDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDZCxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7b0JBQ3BCLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztvQkFFZixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTzt3QkFDbEIsS0FBSyw0QkFBTyxPQUFPLEVBQUMsQ0FBQzt3QkFDckIsSUFDRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQ2hFOzRCQUNBLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ3hCO3dCQUNELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ25CLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUVILFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUMzQzthQUFNO1lBQ0wsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1NBQzVDO1FBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELG9EQUFnQixHQUFoQjtRQUNFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUU3RCxDQUFDO0lBRUQsa0RBQWMsR0FBZCxVQUFlLE9BQU87UUFDcEIsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFNBQVMsQ0FDbEQsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sRUFBeEIsQ0FBd0IsQ0FDOUIsQ0FBQztRQUNGLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQseURBQXFCLEdBQXJCLFVBQXNCLE9BQXNCO1FBQzFDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUdkLDZHQUE2RztRQUM3RyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7WUFFMUMsSUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQzVCLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBdEMsQ0FBc0MsQ0FDL0MsQ0FBQztZQUNGLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDWCxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUNWLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDOUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUd6QjtRQUVILENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXRCLElBQUksSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDN0MsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDakQ7SUFFSCxDQUFDO0lBRUQsbUVBQStCLEdBQS9CO1FBQ0UsSUFBSSxDQUFDLHlCQUF5QixHQUFHLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBRUQsbUVBQStCLEdBQS9CLFVBQWdDLG9CQUFvQjtRQUFwRCxpQkFZQztRQVZDLElBQUksb0JBQW9CLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxZQUFZO2dCQUV2QyxJQUFJLFFBQVEsR0FBRyxJQUFJLFdBQVcsQ0FDNUIsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUN6QyxDQUFDO2dCQUNGLEtBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDdkI7SUFDSCxDQUFDO0lBRUQsNENBQVEsR0FBUjtRQUNFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBQ0QseUNBQUssR0FBTDtRQUNFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsK0NBQVcsR0FBWDtRQUNFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsbURBQWUsR0FBZjtRQUNFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQyxDQUFDO3NHQWpJVSx5QkFBeUI7bUZBQXpCLHlCQUF5QixXQUF6Qix5QkFBeUIsbUJBRFosTUFBTTtvQ0FMaEM7Q0F3SUMsQUFuSUQsSUFtSUM7U0FsSVkseUJBQXlCO3VGQUF6Qix5QkFBeUI7Y0FEckMsVUFBVTtlQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgeyBTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSBcInJ4anNcIjtcclxuaW1wb3J0IHsgUG9seWdvbkluZm8sIFBvbHlnb25EcmF3U3RhdGVzLCBJTGF0TG5nIH0gZnJvbSBcIi4vcG9seWdvbi1oZWxwZXJzXCI7XHJcbmltcG9ydCB7IFBvbHlTdGF0ZVNlcnZpY2UgfSBmcm9tIFwiLi9tYXAtc3RhdGUuc2VydmljZVwiO1xyXG5cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiBcInJvb3RcIiB9KVxyXG5leHBvcnQgY2xhc3MgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSB7XHJcbiAgcG9seWdvbkluZm9ybWF0aW9uU3ViamVjdDogU3ViamVjdDxQb2x5Z29uSW5mb1tdPiA9IG5ldyBTdWJqZWN0PFxyXG4gICAgUG9seWdvbkluZm9bXVxyXG4gID4oKTtcclxuICBwb2x5Z29uSW5mb3JtYXRpb24kOiBPYnNlcnZhYmxlPFxyXG4gICAgUG9seWdvbkluZm9bXVxyXG4gID4gPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgcG9seWdvbkRyYXdTdGF0ZXNTdWJqZWN0OiBTdWJqZWN0PFBvbHlnb25EcmF3U3RhdGVzPiA9IG5ldyBTdWJqZWN0PFxyXG4gICAgUG9seWdvbkRyYXdTdGF0ZXNcclxuICA+KCk7XHJcbiAgcG9seWdvbkRyYXdTdGF0ZXMkOiBPYnNlcnZhYmxlPFxyXG4gICAgUG9seWdvbkRyYXdTdGF0ZXNcclxuICA+ID0gdGhpcy5wb2x5Z29uRHJhd1N0YXRlc1N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gIHBvbHlnb25EcmF3U3RhdGVzOiBQb2x5Z29uRHJhd1N0YXRlcyA9IG51bGw7XHJcbiAgcG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSA9IFtdO1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbWFwU3RhdGVTZXJ2aWNlOiBQb2x5U3RhdGVTZXJ2aWNlKSB7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzID0gbmV3IFBvbHlnb25EcmF3U3RhdGVzKCk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb2x5Z29ucygpIHtcclxuICAgIFxyXG5cclxuICAgIGxldCBuZXdQb2x5Z29uczogSUxhdExuZ1tdW11bXSA9IG51bGw7XHJcbiAgICBpZiAodGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmxlbmd0aCA+IDApIHtcclxuICAgICAgbmV3UG9seWdvbnMgPSBbXTtcclxuXHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5mb3JFYWNoKHYgPT4ge1xyXG4gICAgICAgIGxldCB0ZXN0ID0gW107XHJcbiAgICAgICAgdi5wb2x5Z29uLmZvckVhY2gocG9seSA9PiB7XHJcbiAgICAgICAgICBsZXQgdGVzdDIgPSBbXTtcclxuXHJcbiAgICAgICAgICBwb2x5LmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICAgIHRlc3QyID0gWy4uLnBvbHlnb25dO1xyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgcG9seWdvblswXS50b1N0cmluZygpICE9PSBwb2x5Z29uW3BvbHlnb24ubGVuZ3RoIC0gMV0udG9TdHJpbmcoKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICB0ZXN0Mi5wdXNoKHBvbHlnb25bMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRlc3QucHVzaCh0ZXN0Mik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbmV3UG9seWdvbnMucHVzaCh0ZXN0KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLmhhc1BvbHlnb25zID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMucmVzZXQoKTtcclxuICAgICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5oYXNQb2x5Z29ucyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tYXBTdGF0ZVNlcnZpY2UudXBkYXRlUG9seWdvbnMobmV3UG9seWdvbnMpO1xyXG4gICAgdGhpcy5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICBzYXZlQ3VycmVudFN0YXRlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdWJqZWN0Lm5leHQodGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXNTdWJqZWN0Lm5leHQodGhpcy5wb2x5Z29uRHJhd1N0YXRlcyk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIGRlbGV0ZVRyYXNoY2FuKHBvbHlnb24pIHtcclxuICAgIGNvbnN0IGlkeCA9IHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5maW5kSW5kZXgoXHJcbiAgICAgIHYgPT4gdi5wb2x5Z29uWzBdID09PSBwb2x5Z29uXHJcbiAgICApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnNwbGljZShpZHgsIDEpO1xyXG4gICAgdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlVHJhc2hDYW5Pbk11bHRpKHBvbHlnb246IElMYXRMbmdbXVtdW10pIHtcclxuICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy8gY29uc3QgaWR4ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZpbmRJbmRleCh2ID0+IHYucG9seWdvbi5mb3JFYWNoKHBvbHkgPT57IHBvbHkgPT09IHBvbHlnb259KSApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2goKHYsIGkpID0+IHtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGlkID0gdi5wb2x5Z29uLmZpbmRJbmRleChcclxuICAgICAgICBwb2x5ID0+IHBvbHkudG9TdHJpbmcoKSA9PT0gcG9seWdvbi50b1N0cmluZygpXHJcbiAgICAgICk7XHJcbiAgICAgIGlmIChpZCA+PSAwKSB7XHJcbiAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgIHYudHJhc2hjYW5Qb2ludC5zcGxpY2UoaWQsIDEpO1xyXG4gICAgICAgIHYuc3FtQXJlYS5zcGxpY2UoaWQsIDEpO1xyXG4gICAgICAgIHYucGVyaW1ldGVyLnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5wb2x5Z29uLnNwbGljZShpZCwgMSk7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICBcclxuICAgIGlmICh0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UubGVuZ3RoID4gMSkge1xyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2Uuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuXHJcbiAgZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSA9IFtdO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShhcnJheU9mRmVhdHVyZUdyb3Vwcykge1xyXG4gICAgXHJcbiAgICBpZiAoYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCkge1xyXG4gICAgICBhcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHBvbHlJbmZvID0gbmV3IFBvbHlnb25JbmZvKFxyXG4gICAgICAgICAgZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdLmdldExhdExuZ3MoKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnB1c2gocG9seUluZm8pO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYWN0aXZhdGUoKSB7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLmFjdGl2YXRlKCk7XHJcbiAgfVxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgc2V0TW92ZU1vZGUoKSB7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnNldE1vdmVNb2RlKCk7XHJcbiAgfVxyXG5cclxuICBzZXRGcmVlRHJhd01vZGUoKSB7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnNldEZyZWVEcmF3TW9kZSgpO1xyXG4gIH1cclxufVxyXG4iXX0=