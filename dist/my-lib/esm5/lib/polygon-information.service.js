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
        console.log("updatePolygons: ", this.polygonInformationStorage);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQVcsTUFBTSxtQkFBbUIsQ0FBQztBQUU1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7O0FBR3ZEO0lBZ0JFLG1DQUFvQixlQUFpQztRQUFqQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFmckQsOEJBQXlCLEdBQTJCLElBQUksT0FBTyxFQUU1RCxDQUFDO1FBQ0osd0JBQW1CLEdBRWYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xELDZCQUF3QixHQUErQixJQUFJLE9BQU8sRUFFL0QsQ0FBQztRQUNKLHVCQUFrQixHQUVkLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVqRCxzQkFBaUIsR0FBc0IsSUFBSSxDQUFDO1FBQzVDLDhCQUF5QixHQUFHLEVBQUUsQ0FBQztRQUU3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxrREFBYyxHQUFkO1FBQ0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUVoRSxJQUFJLFdBQVcsR0FBa0IsSUFBSSxDQUFDO1FBQ3RDLElBQUksSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDN0MsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUVqQixJQUFJLENB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QyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLFFBQVEsR0FBRyxJQUFJLFdBQVcsQ0FDNUIsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUN6QyxDQUFDO2dCQUNGLEtBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDdkI7SUFDSCxDQUFDO0lBRUQsNENBQVEsR0FBUjtRQUNFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBQ0QseUNBQUssR0FBTDtRQUNFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsK0NBQVcsR0FBWDtRQUNFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsbURBQWUsR0FBZjtRQUNFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQyxDQUFDOztnQkFqSG9DLGdCQUFnQjs7O0lBaEIxQyx5QkFBeUI7UUFEckMsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO3lDQWlCSSxnQkFBZ0I7T0FoQjFDLHlCQUF5QixDQWtJckM7b0NBeklEO0NBeUlDLEFBbElELElBa0lDO1NBbElZLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBQb2x5Z29uSW5mbywgUG9seWdvbkRyYXdTdGF0ZXMsIElMYXRMbmcgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcbmltcG9ydCB7IFBvbHlEcmF3U2VydmljZSB9IGZyb20gXCIuL3BvbHlkcmF3LnNlcnZpY2VcIjtcbmltcG9ydCB7IFBvbHlTdGF0ZVNlcnZpY2UgfSBmcm9tIFwiLi9tYXAtc3RhdGUuc2VydmljZVwiO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXG5leHBvcnQgY2xhc3MgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSB7XG4gIHBvbHlnb25JbmZvcm1hdGlvblN1YmplY3Q6IFN1YmplY3Q8UG9seWdvbkluZm9bXT4gPSBuZXcgU3ViamVjdDxcbiAgICBQb2x5Z29uSW5mb1tdXG4gID4oKTtcbiAgcG9seWdvbkluZm9ybWF0aW9uJDogT2JzZXJ2YWJsZTxcbiAgICBQb2x5Z29uSW5mb1tdXG4gID4gPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIHBvbHlnb25EcmF3U3RhdGVzU3ViamVjdDogU3ViamVjdDxQb2x5Z29uRHJhd1N0YXRlcz4gPSBuZXcgU3ViamVjdDxcbiAgICBQb2x5Z29uRHJhd1N0YXRlc1xuICA+KCk7XG4gIHBvbHlnb25EcmF3U3RhdGVzJDogT2JzZXJ2YWJsZTxcbiAgICBQb2x5Z29uRHJhd1N0YXRlc1xuICA+ID0gdGhpcy5wb2x5Z29uRHJhd1N0YXRlc1N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG5cbiAgcG9seWdvbkRyYXdTdGF0ZXM6IFBvbHlnb25EcmF3U3RhdGVzID0gbnVsbDtcbiAgcG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSA9IFtdO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1hcFN0YXRlU2VydmljZTogUG9seVN0YXRlU2VydmljZSkge1xuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMgPSBuZXcgUG9seWdvbkRyYXdTdGF0ZXMoKTtcbiAgfVxuXG4gIHVwZGF0ZVBvbHlnb25zKCkge1xuICAgIGNvbnNvbGUubG9nKFwidXBkYXRlUG9seWdvbnM6IFwiLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xuXG4gICAgbGV0IG5ld1BvbHlnb25zOiBJTGF0TG5nW11bXVtdID0gbnVsbDtcbiAgICBpZiAodGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmxlbmd0aCA+IDApIHtcbiAgICAgIG5ld1BvbHlnb25zID0gW107XG5cbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5mb3JFYWNoKHYgPT4ge1xuICAgICAgICBsZXQgdGVzdCA9IFtdO1xuICAgICAgICB2LnBvbHlnb24uZm9yRWFjaChwb2x5ID0+IHtcbiAgICAgICAgICBsZXQgdGVzdDIgPSBbXTtcblxuICAgICAgICAgIHBvbHkuZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgICAgICAgIHRlc3QyID0gWy4uLnBvbHlnb25dO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBwb2x5Z29uWzBdLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bcG9seWdvbi5sZW5ndGggLSAxXS50b1N0cmluZygpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgdGVzdDIucHVzaChwb2x5Z29uWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlc3QucHVzaCh0ZXN0Mik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ld1BvbHlnb25zLnB1c2godGVzdCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5oYXNQb2x5Z29ucyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMucmVzZXQoKTtcbiAgICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuaGFzUG9seWdvbnMgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5tYXBTdGF0ZVNlcnZpY2UudXBkYXRlUG9seWdvbnMobmV3UG9seWdvbnMpO1xuICAgIHRoaXMuc2F2ZUN1cnJlbnRTdGF0ZSgpO1xuICB9XG5cbiAgc2F2ZUN1cnJlbnRTdGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN1YmplY3QubmV4dCh0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXNTdWJqZWN0Lm5leHQodGhpcy5wb2x5Z29uRHJhd1N0YXRlcyk7XG4gICAgY29uc29sZS5sb2coXCJzYXZlQ3VycmVudFN0YXRlOiBcIiwgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcbiAgfVxuXG4gIGRlbGV0ZVRyYXNoY2FuKHBvbHlnb24pIHtcbiAgICBjb25zdCBpZHggPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZmluZEluZGV4KFxuICAgICAgdiA9PiB2LnBvbHlnb25bMF0gPT09IHBvbHlnb25cbiAgICApO1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5zcGxpY2UoaWR4LCAxKTtcbiAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XG4gIH1cblxuICBkZWxldGVUcmFzaENhbk9uTXVsdGkocG9seWdvbjogSUxhdExuZ1tdW11bXSkge1xuICAgIGxldCBpbmRleCA9IDA7XG4gICAgY29uc29sZS5sb2coXCJEZWxldGVUcmFzaENhbjogXCIsIHBvbHlnb24pO1xuICAgIGNvbnNvbGUubG9nKFwiZGVsZXRlVHJhc2hDYW5Pbk11bHRpOiBcIiwgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcbiAgICAvLyBjb25zdCBpZHggPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZmluZEluZGV4KHYgPT4gdi5wb2x5Z29uLmZvckVhY2gocG9seSA9PnsgcG9seSA9PT0gcG9seWdvbn0pICk7XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2goKHYsIGkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKHYucG9seWdvbik7XG4gICAgICBjb25zdCBpZCA9IHYucG9seWdvbi5maW5kSW5kZXgoXG4gICAgICAgIHBvbHkgPT4gcG9seS50b1N0cmluZygpID09PSBwb2x5Z29uLnRvU3RyaW5nKClcbiAgICAgICk7XG4gICAgICBpZiAoaWQgPj0gMCkge1xuICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgIHYudHJhc2hjYW5Qb2ludC5zcGxpY2UoaWQsIDEpO1xuICAgICAgICB2LnNxbUFyZWEuc3BsaWNlKGlkLCAxKTtcbiAgICAgICAgdi5wZXJpbWV0ZXIuc3BsaWNlKGlkLCAxKTtcbiAgICAgICAgdi5wb2x5Z29uLnNwbGljZShpZCwgMSk7XG5cbiAgICAgICAgY29uc29sZS5sb2codi5wb2x5Z29uKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKFwiSUQ6IFwiLCBpZCk7XG4gICAgfSk7XG4gICAgdGhpcy51cGRhdGVQb2x5Z29ucygpO1xuICAgIGNvbnNvbGUubG9nKFwiSW5kZXg6IFwiLCBpbmRleCk7XG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2Uuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coXCJkZWxldGVUcmFzaENhbk9uTXVsdGk6IFwiLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xuICB9XG5cbiAgZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpIHtcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UgPSBbXTtcbiAgfVxuXG4gIGNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoYXJyYXlPZkZlYXR1cmVHcm91cHMpIHtcbiAgICBjb25zb2xlLmxvZyhcIkNyZWF0ZSBJbmZvOiBcIiwgYXJyYXlPZkZlYXR1cmVHcm91cHMpO1xuICAgIGlmIChhcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XG4gICAgICBhcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXS5nZXRMYXRMbmdzKCkpO1xuICAgICAgICBsZXQgcG9seUluZm8gPSBuZXcgUG9seWdvbkluZm8oXG4gICAgICAgICAgZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdLmdldExhdExuZ3MoKVxuICAgICAgICApO1xuICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UucHVzaChwb2x5SW5mbyk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcbiAgICB9XG4gIH1cblxuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLmFjdGl2YXRlKCk7XG4gIH1cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5yZXNldCgpO1xuICB9XG5cbiAgc2V0TW92ZU1vZGUoKSB7XG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5zZXRNb3ZlTW9kZSgpO1xuICB9XG5cbiAgc2V0RnJlZURyYXdNb2RlKCkge1xuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuc2V0RnJlZURyYXdNb2RlKCk7XG4gIH1cbn1cbiJdfQ==