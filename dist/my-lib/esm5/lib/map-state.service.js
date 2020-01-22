import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as i0 from "@angular/core";
var PolyStateService = /** @class */ (function () {
    function PolyStateService() {
        this.mapSubject = new BehaviorSubject(null);
        this.map$ = this.mapSubject.asObservable();
        this.polygonSubject = new BehaviorSubject(null);
        this.polygons$ = this.polygonSubject.asObservable();
        this.mapZoomLevel$ = new Observable();
    }
    PolyStateService.prototype.updateMapState = function (map) {
        this.mapSubject.next(map);
    };
    PolyStateService.prototype.updatePolygons = function (polygons) {
        console.log("map-state", polygons);
        this.polygonSubject.next(polygons);
    };
    PolyStateService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function PolyStateService_Factory() { return new PolyStateService(); }, token: PolyStateService, providedIn: "root" });
    PolyStateService = tslib_1.__decorate([
        Injectable({
            providedIn: 'root'
        }),
        tslib_1.__metadata("design:paramtypes", [])
    ], PolyStateService);
    return PolyStateService;
}());
export { PolyStateService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbWFwLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7O0FBT25EO0lBQ0k7UUFHUSxlQUFVLEdBQUcsSUFBSSxlQUFlLENBQVEsSUFBSSxDQUFDLENBQUM7UUFFdEQsU0FBSSxHQUFzQixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2pELG1CQUFjLEdBQUcsSUFBSSxlQUFlLENBQWdCLElBQUksQ0FBQyxDQUFDO1FBRWxFLGNBQVMsR0FBOEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUUxRSxrQkFBYSxHQUF1QixJQUFJLFVBQVUsRUFBRSxDQUFDO0lBVnJDLENBQUM7SUFhakIseUNBQWMsR0FBZCxVQUFlLEdBQVU7UUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDN0IsQ0FBQztJQUVELHlDQUFjLEdBQWQsVUFBZSxRQUF1QjtRQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN0QyxDQUFDOztJQXJCUSxnQkFBZ0I7UUFINUIsVUFBVSxDQUFDO1lBQ1IsVUFBVSxFQUFFLE1BQU07U0FDckIsQ0FBQzs7T0FDVyxnQkFBZ0IsQ0FzQjVCOzJCQTlCRDtDQThCQyxBQXRCRCxJQXNCQztTQXRCWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCJcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICAgIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgUG9seVN0YXRlU2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG4gICAgXHJcblxyXG4gICAgcHJpdmF0ZSBtYXBTdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxMLk1hcD4obnVsbCk7IFxyXG4gICAgXHJcbiAgICBtYXAkOiBPYnNlcnZhYmxlPEwuTWFwPiA9IHRoaXMubWFwU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuICAgIHByaXZhdGUgcG9seWdvblN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PElMYXRMbmdbXVtdW10+KG51bGwpOyBcclxuXHJcbiAgICBwb2x5Z29ucyQ6IE9ic2VydmFibGU8SUxhdExuZ1tdW11bXT4gPSB0aGlzLnBvbHlnb25TdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG5cclxuICAgIG1hcFpvb21MZXZlbCQ6IE9ic2VydmFibGU8bnVtYmVyPiA9IG5ldyBPYnNlcnZhYmxlKCk7XHJcblxyXG5cclxuICAgIHVwZGF0ZU1hcFN0YXRlKG1hcDogTC5NYXApe1xyXG4gICAgICAgIHRoaXMubWFwU3ViamVjdC5uZXh0KG1hcClcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVQb2x5Z29ucyhwb2x5Z29uczogSUxhdExuZ1tdW11bXSk6dm9pZHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC1zdGF0ZVwiLHBvbHlnb25zKTtcclxuICAgICAgICB0aGlzLnBvbHlnb25TdWJqZWN0Lm5leHQocG9seWdvbnMpXHJcbiAgICB9XHJcbn0iXX0=