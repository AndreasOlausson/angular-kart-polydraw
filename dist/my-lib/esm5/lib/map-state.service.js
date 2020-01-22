import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
var PolyStateService = /** @class */ (function () {
    function PolyStateService() {
        this.mapSubject = new BehaviorSubject(null);
        this.map$ = this.mapSubject.asObservable();
        this.polygonSubject = new BehaviorSubject(null);
        this.polygons$ = this.polygonSubject.asObservable();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbWFwLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQzs7QUFPbkQ7SUFDSTtRQUdRLGVBQVUsR0FBRyxJQUFJLGVBQWUsQ0FBUSxJQUFJLENBQUMsQ0FBQztRQUV0RCxTQUFJLEdBQXNCLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDakQsbUJBQWMsR0FBRyxJQUFJLGVBQWUsQ0FBZ0IsSUFBSSxDQUFDLENBQUM7UUFFbEUsY0FBUyxHQUE4QixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBUjFELENBQUM7SUFVakIseUNBQWMsR0FBZCxVQUFlLEdBQVU7UUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDN0IsQ0FBQztJQUVELHlDQUFjLEdBQWQsVUFBZSxRQUF1QjtRQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN0QyxDQUFDOztJQWxCUSxnQkFBZ0I7UUFINUIsVUFBVSxDQUFDO1lBQ1IsVUFBVSxFQUFFLE1BQU07U0FDckIsQ0FBQzs7T0FDVyxnQkFBZ0IsQ0FtQjVCOzJCQTNCRDtDQTJCQyxBQW5CRCxJQW1CQztTQW5CWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCJcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICAgIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgUG9seVN0YXRlU2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG4gICAgXHJcblxyXG4gICAgcHJpdmF0ZSBtYXBTdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxMLk1hcD4obnVsbCk7IFxyXG5cclxuICAgIG1hcCQ6IE9ic2VydmFibGU8TC5NYXA+ID0gdGhpcy5tYXBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG4gICAgcHJpdmF0ZSBwb2x5Z29uU3ViamVjdCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8SUxhdExuZ1tdW11bXT4obnVsbCk7IFxyXG5cclxuICAgIHBvbHlnb25zJDogT2JzZXJ2YWJsZTxJTGF0TG5nW11bXVtdPiA9IHRoaXMucG9seWdvblN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gICAgdXBkYXRlTWFwU3RhdGUobWFwOiBMLk1hcCl7XHJcbiAgICAgICAgdGhpcy5tYXBTdWJqZWN0Lm5leHQobWFwKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVBvbHlnb25zKHBvbHlnb25zOiBJTGF0TG5nW11bXVtdKTp2b2lke1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFwLXN0YXRlXCIscG9seWdvbnMpO1xyXG4gICAgICAgIHRoaXMucG9seWdvblN1YmplY3QubmV4dChwb2x5Z29ucylcclxuICAgIH1cclxufSJdfQ==