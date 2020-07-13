import { __assign } from "tslib";
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
        this.polygonSubject.next(polygons);
    };
    PolyStateService.prototype.updateMapBounds = function (mapBounds) {
        this.updateMapStates({ mapBoundState: mapBounds });
    };
    PolyStateService.ɵfac = function PolyStateService_Factory(t) { return new (t || PolyStateService)(); };
    PolyStateService.ɵprov = i0.ɵɵdefineInjectable({ token: PolyStateService, factory: PolyStateService.ɵfac, providedIn: 'root' });
    return PolyStateService;
}());
export { PolyStateService };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(PolyStateService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], function () { return []; }, null); })();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbWFwLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUduRCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7O0FBRXJDO0lBSUk7UUFHUSxlQUFVLEdBQUcsSUFBSSxlQUFlLENBQVEsSUFBSSxDQUFDLENBQUM7UUFFdEQsU0FBSSxHQUFzQixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2pELG1CQUFjLEdBQUcsSUFBSSxlQUFlLENBQWdCLElBQUksQ0FBQyxDQUFDO1FBRWxFLGNBQVMsR0FBOEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsRSxvQkFBZSxHQUFHLElBQUksZUFBZSxDQUFnQixJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFDbEYsY0FBUyxHQUE4QixJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzNFLGtCQUFhLEdBQXdCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQW9CLElBQUssT0FBQSxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDLENBQUM7SUFYbEcsQ0FBQztJQWFULDBDQUFlLEdBQXZCLFVBQXdCLFFBQWE7UUFDakMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7UUFDdkMsS0FBSyx5QkFBUSxLQUFLLEdBQUssUUFBUSxDQUFFLENBQUM7UUFFbEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUdELHlDQUFjLEdBQWQsVUFBZSxHQUFVO1FBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzdCLENBQUM7SUFFRCx5Q0FBYyxHQUFkLFVBQWUsUUFBdUI7UUFFbEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDdEMsQ0FBQztJQUNELDBDQUFlLEdBQWYsVUFBZ0IsU0FBeUI7UUFDckMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7b0ZBaENRLGdCQUFnQjs0REFBaEIsZ0JBQWdCLFdBQWhCLGdCQUFnQixtQkFGYixNQUFNOzJCQVB0QjtDQTBDQyxBQXBDRCxJQW9DQztTQWpDWSxnQkFBZ0I7a0RBQWhCLGdCQUFnQjtjQUg1QixVQUFVO2VBQUM7Z0JBQ1IsVUFBVSxFQUFFLE1BQU07YUFDckI7O0FBb0NEO0lBQ0ksdUJBRVcsYUFBNEQ7UUFBNUQsOEJBQUEsRUFBQSxvQkFBb0MsY0FBYyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7UUFBNUQsa0JBQWEsR0FBYixhQUFhLENBQStDO0lBQUksQ0FBQztJQUNoRixvQkFBQztBQUFELENBQUMsQUFKRCxJQUlDO0FBQ0Q7SUFDSSx3QkFDVyxNQUFzQixFQUN0QixJQUFZO1FBRFosV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFDdEIsU0FBSSxHQUFKLElBQUksQ0FBUTtJQUFJLENBQUM7SUFDaEMscUJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCAqIGFzIEwgZnJvbSBcImxlYWZsZXRcIlxyXG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSAnLi9wb2x5Z29uLWhlbHBlcnMnO1xyXG5pbXBvcnQgeyBtYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgICBwcm92aWRlZEluOiAncm9vdCdcclxufSlcclxuZXhwb3J0IGNsYXNzIFBvbHlTdGF0ZVNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7IH1cclxuICAgIFxyXG5cclxuICAgIHByaXZhdGUgbWFwU3ViamVjdCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8TC5NYXA+KG51bGwpOyBcclxuICAgIFxyXG4gICAgbWFwJDogT2JzZXJ2YWJsZTxMLk1hcD4gPSB0aGlzLm1hcFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgICBwcml2YXRlIHBvbHlnb25TdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxJTGF0TG5nW11bXVtdPihudWxsKTsgXHJcblxyXG4gICAgcG9seWdvbnMkOiBPYnNlcnZhYmxlPElMYXRMbmdbXVtdW10+ID0gdGhpcy5wb2x5Z29uU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuICAgIHByaXZhdGUgbWFwU3RhdGVTdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxNYXBTdGF0ZU1vZGVsPihuZXcgTWFwU3RhdGVNb2RlbCgpKTtcclxuICAgIG1hcFN0YXRlJDogT2JzZXJ2YWJsZTxNYXBTdGF0ZU1vZGVsPiA9IHRoaXMubWFwU3RhdGVTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG4gICAgbWFwWm9vbUxldmVsJDogT2JzZXJ2YWJsZTxudW1iZXI+ICA9IHRoaXMubWFwU3RhdGUkLnBpcGUobWFwKChzdGF0ZTogTWFwU3RhdGVNb2RlbCkgPT4gc3RhdGUubWFwQm91bmRTdGF0ZS56b29tKSk7XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVNYXBTdGF0ZXMobmV3U3RhdGU6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGxldCBzdGF0ZSA9IHRoaXMubWFwU3RhdGVTdWJqZWN0LnZhbHVlO1xyXG4gICAgICAgIHN0YXRlID0geyAuLi5zdGF0ZSwgLi4ubmV3U3RhdGUgfTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXBTdGF0ZVN1YmplY3QubmV4dChzdGF0ZSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHVwZGF0ZU1hcFN0YXRlKG1hcDogTC5NYXApe1xyXG4gICAgICAgIHRoaXMubWFwU3ViamVjdC5uZXh0KG1hcClcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVQb2x5Z29ucyhwb2x5Z29uczogSUxhdExuZ1tdW11bXSk6dm9pZHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBvbHlnb25TdWJqZWN0Lm5leHQocG9seWdvbnMpXHJcbiAgICB9XHJcbiAgICB1cGRhdGVNYXBCb3VuZHMobWFwQm91bmRzOiBNYXBCb3VuZHNTdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlTWFwU3RhdGVzKHsgbWFwQm91bmRTdGF0ZTogbWFwQm91bmRzIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBNYXBTdGF0ZU1vZGVsIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICBcclxuICAgICAgICBwdWJsaWMgbWFwQm91bmRTdGF0ZTogTWFwQm91bmRzU3RhdGUgPSBuZXcgTWFwQm91bmRzU3RhdGUobnVsbCwgMTEpKSB7IH1cclxufVxyXG5jbGFzcyBNYXBCb3VuZHNTdGF0ZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgYm91bmRzOiBMLkxhdExuZ0JvdW5kcyxcclxuICAgICAgICBwdWJsaWMgem9vbTogbnVtYmVyKSB7IH1cclxufSJdfQ==