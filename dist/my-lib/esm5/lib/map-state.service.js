import { __assign, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as i0 from "@angular/core";
var PolyStateService = /** @class */ (function () {
    function PolyStateService() {
        this.mapSubject = new BehaviorSubject(null);
        this.map$ = this.mapSubject.asObservable();
        this.polygonSubject = new BehaviorSubject(null);
        this.polygons$ = this.polygonSubject.asObservable();
        this.mapStateSubject = new BehaviorSubject(new MapStateModel());
        this.mapState$ = this.mapStateSubject.asObservable();
        this.mapZoomLevel$ = this.mapState$.pipe(map(function (state) { return state.mapBoundState.zoom; }));
    }
    PolyStateService.prototype.updateMapStates = function (newState) {
        var state = this.mapStateSubject.value;
        state = __assign(__assign({}, state), newState);
        this.mapStateSubject.next(state);
    };
    PolyStateService.prototype.updateMapState = function (map) {
        this.mapSubject.next(map);
    };
    PolyStateService.prototype.updatePolygons = function (polygons) {
        console.log("map-state", polygons);
        this.polygonSubject.next(polygons);
    };
    PolyStateService.prototype.updateMapBounds = function (mapBounds) {
        this.updateMapStates({ mapBoundState: mapBounds });
    };
    PolyStateService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PolyStateService_Factory() { return new PolyStateService(); }, token: PolyStateService, providedIn: "root" });
    PolyStateService = __decorate([
        Injectable({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [])
    ], PolyStateService);
    return PolyStateService;
}());
export { PolyStateService };
var MapStateModel = /** @class */ (function () {
    function MapStateModel(mapBoundState) {
        if (mapBoundState === void 0) { mapBoundState = new MapBoundsState(null, 11); }
        this.mapBoundState = mapBoundState;
    }
    return MapStateModel;
}());
var MapBoundsState = /** @class */ (function () {
    function MapBoundsState(bounds, zoom) {
        this.bounds = bounds;
        this.zoom = zoom;
    }
    return MapBoundsState;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9wb2x5ZHJhdy8iLCJzb3VyY2VzIjpbImxpYi9tYXAtc3RhdGUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZUFBZSxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBR25ELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7QUFLckM7SUFDSTtRQUdRLGVBQVUsR0FBRyxJQUFJLGVBQWUsQ0FBUSxJQUFJLENBQUMsQ0FBQztRQUV0RCxTQUFJLEdBQXNCLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDakQsbUJBQWMsR0FBRyxJQUFJLGVBQWUsQ0FBZ0IsSUFBSSxDQUFDLENBQUM7UUFFbEUsY0FBUyxHQUE4QixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xFLG9CQUFlLEdBQUcsSUFBSSxlQUFlLENBQWdCLElBQUksYUFBYSxFQUFFLENBQUMsQ0FBQztRQUNsRixjQUFTLEdBQThCLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDM0Usa0JBQWEsR0FBd0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBb0IsSUFBSyxPQUFBLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUF4QixDQUF3QixDQUFDLENBQUMsQ0FBQztJQVhsRyxDQUFDO0lBYVQsMENBQWUsR0FBdkIsVUFBd0IsUUFBYTtRQUNqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQztRQUN2QyxLQUFLLHlCQUFRLEtBQUssR0FBSyxRQUFRLENBQUUsQ0FBQztRQUVsQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBR0QseUNBQWMsR0FBZCxVQUFlLEdBQVU7UUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDN0IsQ0FBQztJQUVELHlDQUFjLEdBQWQsVUFBZSxRQUF1QjtRQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN0QyxDQUFDO0lBQ0QsMENBQWUsR0FBZixVQUFnQixTQUF5QjtRQUNyQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDdkQsQ0FBQzs7SUFoQ1EsZ0JBQWdCO1FBSDVCLFVBQVUsQ0FBQztZQUNSLFVBQVUsRUFBRSxNQUFNO1NBQ3JCLENBQUM7O09BQ1csZ0JBQWdCLENBaUM1QjsyQkExQ0Q7Q0EwQ0MsQUFqQ0QsSUFpQ0M7U0FqQ1ksZ0JBQWdCO0FBbUM3QjtJQUNJLHVCQUVXLGFBQTREO1FBQTVELDhCQUFBLEVBQUEsb0JBQW9DLGNBQWMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQTVELGtCQUFhLEdBQWIsYUFBYSxDQUErQztJQUFJLENBQUM7SUFDaEYsb0JBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUNEO0lBQ0ksd0JBQ1csTUFBc0IsRUFDdEIsSUFBWTtRQURaLFdBQU0sR0FBTixNQUFNLENBQWdCO1FBQ3RCLFNBQUksR0FBSixJQUFJLENBQVE7SUFBSSxDQUFDO0lBQ2hDLHFCQUFDO0FBQUQsQ0FBQyxBQUpELElBSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCJcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcclxuaW1wb3J0IHsgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBQb2x5U3RhdGVTZXJ2aWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkgeyB9XHJcbiAgICBcclxuXHJcbiAgICBwcml2YXRlIG1hcFN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PEwuTWFwPihudWxsKTsgXHJcbiAgICBcclxuICAgIG1hcCQ6IE9ic2VydmFibGU8TC5NYXA+ID0gdGhpcy5tYXBTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG4gICAgcHJpdmF0ZSBwb2x5Z29uU3ViamVjdCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8SUxhdExuZ1tdW11bXT4obnVsbCk7IFxyXG5cclxuICAgIHBvbHlnb25zJDogT2JzZXJ2YWJsZTxJTGF0TG5nW11bXVtdPiA9IHRoaXMucG9seWdvblN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgICBwcml2YXRlIG1hcFN0YXRlU3ViamVjdCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8TWFwU3RhdGVNb2RlbD4obmV3IE1hcFN0YXRlTW9kZWwoKSk7XHJcbiAgICBtYXBTdGF0ZSQ6IE9ic2VydmFibGU8TWFwU3RhdGVNb2RlbD4gPSB0aGlzLm1hcFN0YXRlU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuICAgIG1hcFpvb21MZXZlbCQ6IE9ic2VydmFibGU8bnVtYmVyPiAgPSB0aGlzLm1hcFN0YXRlJC5waXBlKG1hcCgoc3RhdGU6IE1hcFN0YXRlTW9kZWwpID0+IHN0YXRlLm1hcEJvdW5kU3RhdGUuem9vbSkpO1xyXG5cclxuICAgIHByaXZhdGUgdXBkYXRlTWFwU3RhdGVzKG5ld1N0YXRlOiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc3RhdGUgPSB0aGlzLm1hcFN0YXRlU3ViamVjdC52YWx1ZTtcclxuICAgICAgICBzdGF0ZSA9IHsgLi4uc3RhdGUsIC4uLm5ld1N0YXRlIH07XHJcblxyXG4gICAgICAgIHRoaXMubWFwU3RhdGVTdWJqZWN0Lm5leHQoc3RhdGUpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB1cGRhdGVNYXBTdGF0ZShtYXA6IEwuTWFwKXtcclxuICAgICAgICB0aGlzLm1hcFN1YmplY3QubmV4dChtYXApXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUG9seWdvbnMocG9seWdvbnM6IElMYXRMbmdbXVtdW10pOnZvaWR7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJtYXAtc3RhdGVcIixwb2x5Z29ucyk7XHJcbiAgICAgICAgdGhpcy5wb2x5Z29uU3ViamVjdC5uZXh0KHBvbHlnb25zKVxyXG4gICAgfVxyXG4gICAgdXBkYXRlTWFwQm91bmRzKG1hcEJvdW5kczogTWFwQm91bmRzU3RhdGUpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZU1hcFN0YXRlcyh7IG1hcEJvdW5kU3RhdGU6IG1hcEJvdW5kcyB9KTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTWFwU3RhdGVNb2RlbCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgXHJcbiAgICAgICAgcHVibGljIG1hcEJvdW5kU3RhdGU6IE1hcEJvdW5kc1N0YXRlID0gbmV3IE1hcEJvdW5kc1N0YXRlKG51bGwsIDExKSkgeyB9XHJcbn1cclxuY2xhc3MgTWFwQm91bmRzU3RhdGUge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIGJvdW5kczogTC5MYXRMbmdCb3VuZHMsXHJcbiAgICAgICAgcHVibGljIHpvb206IG51bWJlcikgeyB9XHJcbn0iXX0=