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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbWFwLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUduRCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7O0FBS3JDO0lBQ0k7UUFHUSxlQUFVLEdBQUcsSUFBSSxlQUFlLENBQVEsSUFBSSxDQUFDLENBQUM7UUFFdEQsU0FBSSxHQUFzQixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2pELG1CQUFjLEdBQUcsSUFBSSxlQUFlLENBQWdCLElBQUksQ0FBQyxDQUFDO1FBRWxFLGNBQVMsR0FBOEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsRSxvQkFBZSxHQUFHLElBQUksZUFBZSxDQUFnQixJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFDbEYsY0FBUyxHQUE4QixJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzNFLGtCQUFhLEdBQXdCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQW9CLElBQUssT0FBQSxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDLENBQUM7SUFYbEcsQ0FBQztJQWFULDBDQUFlLEdBQXZCLFVBQXdCLFFBQWE7UUFDakMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7UUFDdkMsS0FBSyx5QkFBUSxLQUFLLEdBQUssUUFBUSxDQUFFLENBQUM7UUFFbEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUdELHlDQUFjLEdBQWQsVUFBZSxHQUFVO1FBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzdCLENBQUM7SUFFRCx5Q0FBYyxHQUFkLFVBQWUsUUFBdUI7UUFFbEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDdEMsQ0FBQztJQUNELDBDQUFlLEdBQWYsVUFBZ0IsU0FBeUI7UUFDckMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7O0lBaENRLGdCQUFnQjtRQUg1QixVQUFVLENBQUM7WUFDUixVQUFVLEVBQUUsTUFBTTtTQUNyQixDQUFDOztPQUNXLGdCQUFnQixDQWlDNUI7MkJBMUNEO0NBMENDLEFBakNELElBaUNDO1NBakNZLGdCQUFnQjtBQW1DN0I7SUFDSSx1QkFFVyxhQUE0RDtRQUE1RCw4QkFBQSxFQUFBLG9CQUFvQyxjQUFjLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUE1RCxrQkFBYSxHQUFiLGFBQWEsQ0FBK0M7SUFBSSxDQUFDO0lBQ2hGLG9CQUFDO0FBQUQsQ0FBQyxBQUpELElBSUM7QUFDRDtJQUNJLHdCQUNXLE1BQXNCLEVBQ3RCLElBQVk7UUFEWixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUN0QixTQUFJLEdBQUosSUFBSSxDQUFRO0lBQUksQ0FBQztJQUNoQyxxQkFBQztBQUFELENBQUMsQUFKRCxJQUlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tICcuL3BvbHlnb24taGVscGVycyc7XG5pbXBvcnQgeyBtYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbkBJbmplY3RhYmxlKHtcbiAgICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgUG9seVN0YXRlU2VydmljZSB7XG4gICAgY29uc3RydWN0b3IoKSB7IH1cbiAgICBcblxuICAgIHByaXZhdGUgbWFwU3ViamVjdCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8TC5NYXA+KG51bGwpOyBcbiAgICBcbiAgICBtYXAkOiBPYnNlcnZhYmxlPEwuTWFwPiA9IHRoaXMubWFwU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICBwcml2YXRlIHBvbHlnb25TdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxJTGF0TG5nW11bXVtdPihudWxsKTsgXG5cbiAgICBwb2x5Z29ucyQ6IE9ic2VydmFibGU8SUxhdExuZ1tdW11bXT4gPSB0aGlzLnBvbHlnb25TdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICAgIHByaXZhdGUgbWFwU3RhdGVTdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxNYXBTdGF0ZU1vZGVsPihuZXcgTWFwU3RhdGVNb2RlbCgpKTtcbiAgICBtYXBTdGF0ZSQ6IE9ic2VydmFibGU8TWFwU3RhdGVNb2RlbD4gPSB0aGlzLm1hcFN0YXRlU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgICBtYXBab29tTGV2ZWwkOiBPYnNlcnZhYmxlPG51bWJlcj4gID0gdGhpcy5tYXBTdGF0ZSQucGlwZShtYXAoKHN0YXRlOiBNYXBTdGF0ZU1vZGVsKSA9PiBzdGF0ZS5tYXBCb3VuZFN0YXRlLnpvb20pKTtcblxuICAgIHByaXZhdGUgdXBkYXRlTWFwU3RhdGVzKG5ld1N0YXRlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgbGV0IHN0YXRlID0gdGhpcy5tYXBTdGF0ZVN1YmplY3QudmFsdWU7XG4gICAgICAgIHN0YXRlID0geyAuLi5zdGF0ZSwgLi4ubmV3U3RhdGUgfTtcblxuICAgICAgICB0aGlzLm1hcFN0YXRlU3ViamVjdC5uZXh0KHN0YXRlKTtcbiAgICB9XG5cblxuICAgIHVwZGF0ZU1hcFN0YXRlKG1hcDogTC5NYXApe1xuICAgICAgICB0aGlzLm1hcFN1YmplY3QubmV4dChtYXApXG4gICAgfVxuXG4gICAgdXBkYXRlUG9seWdvbnMocG9seWdvbnM6IElMYXRMbmdbXVtdW10pOnZvaWR7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnBvbHlnb25TdWJqZWN0Lm5leHQocG9seWdvbnMpXG4gICAgfVxuICAgIHVwZGF0ZU1hcEJvdW5kcyhtYXBCb3VuZHM6IE1hcEJvdW5kc1N0YXRlKSB7XG4gICAgICAgIHRoaXMudXBkYXRlTWFwU3RhdGVzKHsgbWFwQm91bmRTdGF0ZTogbWFwQm91bmRzIH0pO1xuICAgIH1cbn1cblxuY2xhc3MgTWFwU3RhdGVNb2RlbCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICBcbiAgICAgICAgcHVibGljIG1hcEJvdW5kU3RhdGU6IE1hcEJvdW5kc1N0YXRlID0gbmV3IE1hcEJvdW5kc1N0YXRlKG51bGwsIDExKSkgeyB9XG59XG5jbGFzcyBNYXBCb3VuZHNTdGF0ZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyBib3VuZHM6IEwuTGF0TG5nQm91bmRzLFxuICAgICAgICBwdWJsaWMgem9vbTogbnVtYmVyKSB7IH1cbn0iXX0=