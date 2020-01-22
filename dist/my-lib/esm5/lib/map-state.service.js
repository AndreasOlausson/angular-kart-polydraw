import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
var MapStateService = /** @class */ (function () {
    function MapStateService() {
        this.mapSubject = new BehaviorSubject(null);
        this.map$ = this.mapSubject.asObservable();
        this.polygonSubject = new BehaviorSubject(null);
        this.polygons$ = this.polygonSubject.asObservable();
    }
    MapStateService.prototype.updateMapState = function (map) {
        this.mapSubject.next(map);
    };
    MapStateService.prototype.updatePolygons = function (polygons) {
        console.log("map-state", polygons);
        this.polygonSubject.next(polygons);
    };
    MapStateService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function MapStateService_Factory() { return new MapStateService(); }, token: MapStateService, providedIn: "root" });
    MapStateService = tslib_1.__decorate([
        Injectable({
            providedIn: 'root'
        }),
        tslib_1.__metadata("design:paramtypes", [])
    ], MapStateService);
    return MapStateService;
}());
export { MapStateService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbWFwLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQzs7QUFPbkQ7SUFDSTtRQUdRLGVBQVUsR0FBRyxJQUFJLGVBQWUsQ0FBUSxJQUFJLENBQUMsQ0FBQztRQUV0RCxTQUFJLEdBQXNCLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDakQsbUJBQWMsR0FBRyxJQUFJLGVBQWUsQ0FBZ0IsSUFBSSxDQUFDLENBQUM7UUFFbEUsY0FBUyxHQUE4QixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBUjFELENBQUM7SUFVakIsd0NBQWMsR0FBZCxVQUFlLEdBQVU7UUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDN0IsQ0FBQztJQUVELHdDQUFjLEdBQWQsVUFBZSxRQUF1QjtRQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN0QyxDQUFDOztJQWxCUSxlQUFlO1FBSDNCLFVBQVUsQ0FBQztZQUNSLFVBQVUsRUFBRSxNQUFNO1NBQ3JCLENBQUM7O09BQ1csZUFBZSxDQW1CM0I7MEJBM0JEO0NBMkJDLEFBbkJELElBbUJDO1NBbkJZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCJcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICAgIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgTWFwU3RhdGVTZXJ2aWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkgeyB9XHJcbiAgICBcclxuXHJcbiAgICBwcml2YXRlIG1hcFN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PEwuTWFwPihudWxsKTsgXHJcblxyXG4gICAgbWFwJDogT2JzZXJ2YWJsZTxMLk1hcD4gPSB0aGlzLm1hcFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgICBwcml2YXRlIHBvbHlnb25TdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxJTGF0TG5nW11bXVtdPihudWxsKTsgXHJcblxyXG4gICAgcG9seWdvbnMkOiBPYnNlcnZhYmxlPElMYXRMbmdbXVtdW10+ID0gdGhpcy5wb2x5Z29uU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuXHJcbiAgICB1cGRhdGVNYXBTdGF0ZShtYXA6IEwuTWFwKXtcclxuICAgICAgICB0aGlzLm1hcFN1YmplY3QubmV4dChtYXApXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUG9seWdvbnMocG9seWdvbnM6IElMYXRMbmdbXVtdW10pOnZvaWR7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJtYXAtc3RhdGVcIixwb2x5Z29ucyk7XHJcbiAgICAgICAgdGhpcy5wb2x5Z29uU3ViamVjdC5uZXh0KHBvbHlnb25zKVxyXG4gICAgfVxyXG59Il19