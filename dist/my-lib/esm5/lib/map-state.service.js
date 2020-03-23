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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbWFwLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUduRCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7O0FBS3JDO0lBQ0k7UUFHUSxlQUFVLEdBQUcsSUFBSSxlQUFlLENBQVEsSUFBSSxDQUFDLENBQUM7UUFFdEQsU0FBSSxHQUFzQixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2pELG1CQUFjLEdBQUcsSUFBSSxlQUFlLENBQWdCLElBQUksQ0FBQyxDQUFDO1FBRWxFLGNBQVMsR0FBOEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsRSxvQkFBZSxHQUFHLElBQUksZUFBZSxDQUFnQixJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFDbEYsY0FBUyxHQUE4QixJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzNFLGtCQUFhLEdBQXdCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQW9CLElBQUssT0FBQSxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDLENBQUM7SUFYbEcsQ0FBQztJQWFULDBDQUFlLEdBQXZCLFVBQXdCLFFBQWE7UUFDakMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7UUFDdkMsS0FBSyx5QkFBUSxLQUFLLEdBQUssUUFBUSxDQUFFLENBQUM7UUFFbEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUdELHlDQUFjLEdBQWQsVUFBZSxHQUFVO1FBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzdCLENBQUM7SUFFRCx5Q0FBYyxHQUFkLFVBQWUsUUFBdUI7UUFFbEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDdEMsQ0FBQztJQUNELDBDQUFlLEdBQWYsVUFBZ0IsU0FBeUI7UUFDckMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7O0lBaENRLGdCQUFnQjtRQUg1QixVQUFVLENBQUM7WUFDUixVQUFVLEVBQUUsTUFBTTtTQUNyQixDQUFDOztPQUNXLGdCQUFnQixDQWlDNUI7MkJBMUNEO0NBMENDLEFBakNELElBaUNDO1NBakNZLGdCQUFnQjtBQW1DN0I7SUFDSSx1QkFFVyxhQUE0RDtRQUE1RCw4QkFBQSxFQUFBLG9CQUFvQyxjQUFjLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUE1RCxrQkFBYSxHQUFiLGFBQWEsQ0FBK0M7SUFBSSxDQUFDO0lBQ2hGLG9CQUFDO0FBQUQsQ0FBQyxBQUpELElBSUM7QUFDRDtJQUNJLHdCQUNXLE1BQXNCLEVBQ3RCLElBQVk7UUFEWixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUN0QixTQUFJLEdBQUosSUFBSSxDQUFRO0lBQUksQ0FBQztJQUNoQyxxQkFBQztBQUFELENBQUMsQUFKRCxJQUlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0ICogYXMgTCBmcm9tIFwibGVhZmxldFwiXHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tICcuL3BvbHlnb24taGVscGVycyc7XHJcbmltcG9ydCB7IG1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICAgIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgUG9seVN0YXRlU2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG4gICAgXHJcblxyXG4gICAgcHJpdmF0ZSBtYXBTdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxMLk1hcD4obnVsbCk7IFxyXG4gICAgXHJcbiAgICBtYXAkOiBPYnNlcnZhYmxlPEwuTWFwPiA9IHRoaXMubWFwU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuICAgIHByaXZhdGUgcG9seWdvblN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PElMYXRMbmdbXVtdW10+KG51bGwpOyBcclxuXHJcbiAgICBwb2x5Z29ucyQ6IE9ic2VydmFibGU8SUxhdExuZ1tdW11bXT4gPSB0aGlzLnBvbHlnb25TdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG4gICAgcHJpdmF0ZSBtYXBTdGF0ZVN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PE1hcFN0YXRlTW9kZWw+KG5ldyBNYXBTdGF0ZU1vZGVsKCkpO1xyXG4gICAgbWFwU3RhdGUkOiBPYnNlcnZhYmxlPE1hcFN0YXRlTW9kZWw+ID0gdGhpcy5tYXBTdGF0ZVN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgICBtYXBab29tTGV2ZWwkOiBPYnNlcnZhYmxlPG51bWJlcj4gID0gdGhpcy5tYXBTdGF0ZSQucGlwZShtYXAoKHN0YXRlOiBNYXBTdGF0ZU1vZGVsKSA9PiBzdGF0ZS5tYXBCb3VuZFN0YXRlLnpvb20pKTtcclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZU1hcFN0YXRlcyhuZXdTdGF0ZTogYW55KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHN0YXRlID0gdGhpcy5tYXBTdGF0ZVN1YmplY3QudmFsdWU7XHJcbiAgICAgICAgc3RhdGUgPSB7IC4uLnN0YXRlLCAuLi5uZXdTdGF0ZSB9O1xyXG5cclxuICAgICAgICB0aGlzLm1hcFN0YXRlU3ViamVjdC5uZXh0KHN0YXRlKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgdXBkYXRlTWFwU3RhdGUobWFwOiBMLk1hcCl7XHJcbiAgICAgICAgdGhpcy5tYXBTdWJqZWN0Lm5leHQobWFwKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVBvbHlnb25zKHBvbHlnb25zOiBJTGF0TG5nW11bXVtdKTp2b2lke1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucG9seWdvblN1YmplY3QubmV4dChwb2x5Z29ucylcclxuICAgIH1cclxuICAgIHVwZGF0ZU1hcEJvdW5kcyhtYXBCb3VuZHM6IE1hcEJvdW5kc1N0YXRlKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVNYXBTdGF0ZXMoeyBtYXBCb3VuZFN0YXRlOiBtYXBCb3VuZHMgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE1hcFN0YXRlTW9kZWwge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBtYXBCb3VuZFN0YXRlOiBNYXBCb3VuZHNTdGF0ZSA9IG5ldyBNYXBCb3VuZHNTdGF0ZShudWxsLCAxMSkpIHsgfVxyXG59XHJcbmNsYXNzIE1hcEJvdW5kc1N0YXRlIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyBib3VuZHM6IEwuTGF0TG5nQm91bmRzLFxyXG4gICAgICAgIHB1YmxpYyB6b29tOiBudW1iZXIpIHsgfVxyXG59Il19
