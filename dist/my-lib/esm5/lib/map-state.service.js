import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
var MapStateService = /** @class */ (function () {
    function MapStateService() {
        this.mapSubject = new BehaviorSubject(null);
        this.map$ = this.mapSubject.asObservable();
    }
    MapStateService.prototype.updateMapState = function (map) {
        this.mapSubject.next(map);
    };
    MapStateService.prototype.updatePolygons = function (polygons) {
        console.log("map-state", polygons);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbWFwLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQzs7QUFPbkQ7SUFDSTtRQUdRLGVBQVUsR0FBRyxJQUFJLGVBQWUsQ0FBUSxJQUFJLENBQUMsQ0FBQztRQUV0RCxTQUFJLEdBQXNCLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7SUFMekMsQ0FBQztJQU9qQix3Q0FBYyxHQUFkLFVBQWUsR0FBVTtRQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUM3QixDQUFDO0lBRUQsd0NBQWMsR0FBZCxVQUFlLFFBQXVCO1FBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7O0lBZFEsZUFBZTtRQUgzQixVQUFVLENBQUM7WUFDUixVQUFVLEVBQUUsTUFBTTtTQUNyQixDQUFDOztPQUNXLGVBQWUsQ0FlM0I7MEJBdkJEO0NBdUJDLEFBZkQsSUFlQztTQWZZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCJcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICAgIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgTWFwU3RhdGVTZXJ2aWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkgeyB9XHJcbiAgICBcclxuXHJcbiAgICBwcml2YXRlIG1hcFN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PEwuTWFwPihudWxsKTsgXHJcblxyXG4gICAgbWFwJDogT2JzZXJ2YWJsZTxMLk1hcD4gPSB0aGlzLm1hcFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gICAgdXBkYXRlTWFwU3RhdGUobWFwOiBMLk1hcCl7XHJcbiAgICAgICAgdGhpcy5tYXBTdWJqZWN0Lm5leHQobWFwKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVBvbHlnb25zKHBvbHlnb25zOiBJTGF0TG5nW11bXVtdKTp2b2lke1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFwLXN0YXRlXCIscG9seWdvbnMpO1xyXG4gICAgfVxyXG59Il19