import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PolygonInfo, PolygonDrawStates } from './polygon-helpers';
import { PolyStateService } from './map-state.service';
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
        console.log('updatePolygons: ', this.polygonInformationStorage);
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
        console.log('saveCurrentState: ', this.polygonInformationStorage);
    };
    PolygonInformationService.prototype.deleteTrashcan = function (polygon) {
        var idx = this.polygonInformationStorage.findIndex(function (v) { return v.polygon[0] === polygon; });
        this.polygonInformationStorage.splice(idx, 1);
        this.updatePolygons();
    };
    PolygonInformationService.prototype.deleteTrashCanOnMulti = function (polygon) {
        var index = 0;
        console.log('DeleteTrashCan: ', polygon);
        console.log('deleteTrashCanOnMulti: ', this.polygonInformationStorage);
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
            console.log('ID: ', id);
        });
        this.updatePolygons();
        console.log('Index: ', index);
        if (this.polygonInformationStorage.length > 1) {
            this.polygonInformationStorage.splice(index, 1);
        }
        console.log('deleteTrashCanOnMulti: ', this.polygonInformationStorage);
    };
    PolygonInformationService.prototype.deletePolygonInformationStorage = function () {
        this.polygonInformationStorage = [];
    };
    PolygonInformationService.prototype.createPolygonInformationStorage = function (arrayOfFeatureGroups) {
        var _this = this;
        console.log('Create Info: ', arrayOfFeatureGroups);
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
    PolygonInformationService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function PolygonInformationService_Factory() { return new PolygonInformationService(i0.ɵɵinject(i1.PolyStateService)); }, token: PolygonInformationService, providedIn: "root" });
    PolygonInformationService = tslib_1.__decorate([
        Injectable({ providedIn: 'root' }),
        tslib_1.__metadata("design:paramtypes", [PolyStateService])
    ], PolygonInformationService);
    return PolygonInformationService;
}());
export { PolygonInformationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQVcsTUFBTSxtQkFBbUIsQ0FBQztBQUU1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7O0FBR3ZEO0lBZ0JFLG1DQUFvQixlQUFpQztRQUFqQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFmckQsOEJBQXlCLEdBQTJCLElBQUksT0FBTyxFQUU1RCxDQUFDO1FBQ0osd0JBQW1CLEdBRWYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xELDZCQUF3QixHQUErQixJQUFJLE9BQU8sRUFFL0QsQ0FBQztRQUNKLHVCQUFrQixHQUVkLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVoRCxzQkFBaUIsR0FBc0IsSUFBSSxDQUFDO1FBQzdDLDhCQUF5QixHQUFHLEVBQUUsQ0FBQztRQUU3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxrREFBYyxHQUFkO1FBQ0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUVoRSxJQUFJLFdBQVcsR0FBa0IsSUFBSSxDQUFDO1FBQ3RDLElBQUksSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDN0MsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUVqQixJQUFJLENB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QUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxRQUFRLEdBQUcsSUFBSSxXQUFXLENBQzVCLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FDekMsQ0FBQztnQkFDRixLQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3ZCO0lBQ0gsQ0FBQztJQUdELDRDQUFRLEdBQVI7UUFDRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDbkMsQ0FBQztJQUNELHlDQUFLLEdBQUw7UUFDRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELCtDQUFXLEdBQVg7UUFDRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELG1EQUFlLEdBQWY7UUFDRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLENBQUE7SUFDMUMsQ0FBQzs7Z0JBbEhvQyxnQkFBZ0I7OztJQWhCMUMseUJBQXlCO1FBRHJDLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQztpREFpQkksZ0JBQWdCO09BaEIxQyx5QkFBeUIsQ0FtSXJDO29DQTFJRDtDQTBJQyxBQW5JRCxJQW1JQztTQW5JWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgUG9seWdvbkluZm8sIFBvbHlnb25EcmF3U3RhdGVzLCBJTGF0TG5nIH0gZnJvbSAnLi9wb2x5Z29uLWhlbHBlcnMnO1xyXG5pbXBvcnQgeyBQb2x5RHJhd1NlcnZpY2UgfSBmcm9tICcuL3BvbHlkcmF3LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBQb2x5U3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi9tYXAtc3RhdGUuc2VydmljZSc7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxyXG5leHBvcnQgY2xhc3MgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSB7XHJcbiAgcG9seWdvbkluZm9ybWF0aW9uU3ViamVjdDogU3ViamVjdDxQb2x5Z29uSW5mb1tdPiA9IG5ldyBTdWJqZWN0PFxyXG4gICAgUG9seWdvbkluZm9bXVxyXG4gID4oKTtcclxuICBwb2x5Z29uSW5mb3JtYXRpb24kOiBPYnNlcnZhYmxlPFxyXG4gICAgUG9seWdvbkluZm9bXVxyXG4gID4gPSB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgcG9seWdvbkRyYXdTdGF0ZXNTdWJqZWN0OiBTdWJqZWN0PFBvbHlnb25EcmF3U3RhdGVzPiA9IG5ldyBTdWJqZWN0PFxyXG4gICAgUG9seWdvbkRyYXdTdGF0ZXNcclxuICA+KCk7XHJcbiAgcG9seWdvbkRyYXdTdGF0ZXMkOiBPYnNlcnZhYmxlPFxyXG4gICAgUG9seWdvbkRyYXdTdGF0ZXNcclxuICA+ID0gdGhpcy5wb2x5Z29uRHJhd1N0YXRlc1N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gICBwb2x5Z29uRHJhd1N0YXRlczogUG9seWdvbkRyYXdTdGF0ZXMgPSBudWxsO1xyXG4gIHBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UgPSBbXTtcclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1hcFN0YXRlU2VydmljZTogUG9seVN0YXRlU2VydmljZSkge1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcyA9IG5ldyBQb2x5Z29uRHJhd1N0YXRlcygpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlUG9seWdvbnMoKSB7XHJcbiAgICBjb25zb2xlLmxvZygndXBkYXRlUG9seWdvbnM6ICcsIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSk7XHJcblxyXG4gICAgbGV0IG5ld1BvbHlnb25zOiBJTGF0TG5nW11bXVtdID0gbnVsbDtcclxuICAgIGlmICh0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UubGVuZ3RoID4gMCkge1xyXG4gICAgICBuZXdQb2x5Z29ucyA9IFtdO1xyXG5cclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2godiA9PiB7XHJcbiAgICAgICAgbGV0IHRlc3QgPSBbXTtcclxuICAgICAgICB2LnBvbHlnb24uZm9yRWFjaChwb2x5ID0+IHtcclxuICAgICAgICAgIGxldCB0ZXN0MiA9IFtdO1xyXG5cclxuICAgICAgICAgIHBvbHkuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgdGVzdDIgPSBbLi4ucG9seWdvbl07XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICBwb2x5Z29uWzBdLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bcG9seWdvbi5sZW5ndGggLSAxXS50b1N0cmluZygpXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgIHRlc3QyLnB1c2gocG9seWdvblswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVzdC5wdXNoKHRlc3QyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBuZXdQb2x5Z29ucy5wdXNoKHRlc3QpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuaGFzUG9seWdvbnMgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5yZXNldCgpO1xyXG4gICAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLmhhc1BvbHlnb25zID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLm1hcFN0YXRlU2VydmljZS51cGRhdGVQb2x5Z29ucyhuZXdQb2x5Z29ucyk7XHJcbiAgICB0aGlzLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcblxyXG4gIHNhdmVDdXJyZW50U3RhdGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN1YmplY3QubmV4dCh0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gICAgdGhpcy5wb2x5Z29uRHJhd1N0YXRlc1N1YmplY3QubmV4dCh0aGlzLnBvbHlnb25EcmF3U3RhdGVzKTtcclxuICAgIGNvbnNvbGUubG9nKCdzYXZlQ3VycmVudFN0YXRlOiAnLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlVHJhc2hjYW4ocG9seWdvbikge1xyXG4gICAgY29uc3QgaWR4ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZpbmRJbmRleChcclxuICAgICAgdiA9PiB2LnBvbHlnb25bMF0gPT09IHBvbHlnb25cclxuICAgICk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2Uuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVUcmFzaENhbk9uTXVsdGkocG9seWdvbjogSUxhdExuZ1tdW11bXSkge1xyXG4gICAgbGV0IGluZGV4ID0gMDtcclxuICAgIGNvbnNvbGUubG9nKCdEZWxldGVUcmFzaENhbjogJywgcG9seWdvbik7XHJcbiAgICBjb25zb2xlLmxvZygnZGVsZXRlVHJhc2hDYW5Pbk11bHRpOiAnLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gICAgLy8gY29uc3QgaWR4ID0gdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZpbmRJbmRleCh2ID0+IHYucG9seWdvbi5mb3JFYWNoKHBvbHkgPT57IHBvbHkgPT09IHBvbHlnb259KSApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2goKHYsIGkpID0+IHtcclxuICAgICAgY29uc29sZS5sb2codi5wb2x5Z29uKTtcclxuICAgICAgY29uc3QgaWQgPSB2LnBvbHlnb24uZmluZEluZGV4KFxyXG4gICAgICAgIHBvbHkgPT4gcG9seS50b1N0cmluZygpID09PSBwb2x5Z29uLnRvU3RyaW5nKClcclxuICAgICAgKTtcclxuICAgICAgaWYgKGlkID49IDApIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgdi50cmFzaGNhblBvaW50LnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5zcW1BcmVhLnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgdi5wZXJpbWV0ZXIuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICB2LnBvbHlnb24uc3BsaWNlKGlkLCAxKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2codi5wb2x5Z29uKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZygnSUQ6ICcsIGlkKTtcclxuICAgIH0pO1xyXG4gICAgdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgY29uc29sZS5sb2coJ0luZGV4OiAnLCBpbmRleCk7XHJcbiAgICBpZiAodGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmxlbmd0aCA+IDEpIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZygnZGVsZXRlVHJhc2hDYW5Pbk11bHRpOiAnLCB0aGlzLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UpO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSA9IFtdO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShhcnJheU9mRmVhdHVyZUdyb3Vwcykge1xyXG4gICAgY29uc29sZS5sb2coJ0NyZWF0ZSBJbmZvOiAnLCBhcnJheU9mRmVhdHVyZUdyb3Vwcyk7XHJcbiAgICBpZiAoYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCkge1xyXG4gICAgICBhcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdLmdldExhdExuZ3MoKSk7XHJcbiAgICAgICAgbGV0IHBvbHlJbmZvID0gbmV3IFBvbHlnb25JbmZvKFxyXG4gICAgICAgICAgZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdLmdldExhdExuZ3MoKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLnB1c2gocG9seUluZm8pO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIGFjdGl2YXRlKCl7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLmFjdGl2YXRlKClcclxuICB9XHJcbiAgcmVzZXQoKXtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIHNldE1vdmVNb2RlKCl7XHJcbiAgICB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnNldE1vdmVNb2RlKCk7XHJcbiAgfVxyXG5cclxuICBzZXRGcmVlRHJhd01vZGUoKXtcclxuICAgIHRoaXMucG9seWdvbkRyYXdTdGF0ZXMuc2V0RnJlZURyYXdNb2RlKClcclxuICB9XHJcbn1cclxuIl19