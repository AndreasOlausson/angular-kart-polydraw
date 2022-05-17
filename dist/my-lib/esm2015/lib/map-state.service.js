import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as i0 from "@angular/core";
export class PolyStateService {
    constructor() {
        this.mapSubject = new BehaviorSubject(null);
        this.map$ = this.mapSubject.asObservable();
        this.polygonSubject = new BehaviorSubject(null);
        this.polygons$ = this.polygonSubject.asObservable();
        this.mapStateSubject = new BehaviorSubject(new MapStateModel());
        this.mapState$ = this.mapStateSubject.asObservable();
        this.mapZoomLevel$ = this.mapState$.pipe(map((state) => state.mapBoundState.zoom));
    }
    updateMapStates(newState) {
        let state = this.mapStateSubject.value;
        state = Object.assign(Object.assign({}, state), newState);
        this.mapStateSubject.next(state);
    }
    updateMapState(map) {
        this.mapSubject.next(map);
    }
    updatePolygons(polygons) {
        this.polygonSubject.next(polygons);
    }
    updateMapBounds(mapBounds) {
        this.updateMapStates({ mapBoundState: mapBounds });
    }
}
PolyStateService.ɵfac = function PolyStateService_Factory(t) { return new (t || PolyStateService)(); };
PolyStateService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: PolyStateService, factory: PolyStateService.ɵfac, providedIn: 'root' });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PolyStateService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], function () { return []; }, null); })();
class MapStateModel {
    constructor(mapBoundState = new MapBoundsState(null, 11)) {
        this.mapBoundState = mapBoundState;
    }
}
class MapBoundsState {
    constructor(bounds, zoom) {
        this.bounds = bounds;
        this.zoom = zoom;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbWFwLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZUFBZSxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBR25ELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7QUFLckMsTUFBTSxPQUFPLGdCQUFnQjtJQUN6QjtRQUdRLGVBQVUsR0FBRyxJQUFJLGVBQWUsQ0FBUSxJQUFJLENBQUMsQ0FBQztRQUV0RCxTQUFJLEdBQXNCLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDakQsbUJBQWMsR0FBRyxJQUFJLGVBQWUsQ0FBZ0IsSUFBSSxDQUFDLENBQUM7UUFFbEUsY0FBUyxHQUE4QixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xFLG9CQUFlLEdBQUcsSUFBSSxlQUFlLENBQWdCLElBQUksYUFBYSxFQUFFLENBQUMsQ0FBQztRQUNsRixjQUFTLEdBQThCLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDM0Usa0JBQWEsR0FBd0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBb0IsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBWGxHLENBQUM7SUFhVCxlQUFlLENBQUMsUUFBYTtRQUNqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQztRQUN2QyxLQUFLLG1DQUFRLEtBQUssR0FBSyxRQUFRLENBQUUsQ0FBQztRQUVsQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBR0QsY0FBYyxDQUFDLEdBQVU7UUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDN0IsQ0FBQztJQUVELGNBQWMsQ0FBQyxRQUF1QjtRQUVsQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN0QyxDQUFDO0lBQ0QsZUFBZSxDQUFDLFNBQXlCO1FBQ3JDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUN2RCxDQUFDOztnRkFoQ1EsZ0JBQWdCO3NFQUFoQixnQkFBZ0IsV0FBaEIsZ0JBQWdCLG1CQUZiLE1BQU07dUZBRVQsZ0JBQWdCO2NBSDVCLFVBQVU7ZUFBQztnQkFDUixVQUFVLEVBQUUsTUFBTTthQUNyQjs7QUFvQ0QsTUFBTSxhQUFhO0lBQ2YsWUFFVyxnQkFBZ0MsSUFBSSxjQUFjLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUE1RCxrQkFBYSxHQUFiLGFBQWEsQ0FBK0M7SUFBSSxDQUFDO0NBQy9FO0FBQ0QsTUFBTSxjQUFjO0lBQ2hCLFlBQ1csTUFBc0IsRUFDdEIsSUFBWTtRQURaLFdBQU0sR0FBTixNQUFNLENBQWdCO1FBQ3RCLFNBQUksR0FBSixJQUFJLENBQVE7SUFBSSxDQUFDO0NBQy9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0ICogYXMgTCBmcm9tIFwibGVhZmxldFwiXHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tICcuL3BvbHlnb24taGVscGVycyc7XHJcbmltcG9ydCB7IG1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICAgIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgUG9seVN0YXRlU2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG4gICAgXHJcblxyXG4gICAgcHJpdmF0ZSBtYXBTdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxMLk1hcD4obnVsbCk7IFxyXG4gICAgXHJcbiAgICBtYXAkOiBPYnNlcnZhYmxlPEwuTWFwPiA9IHRoaXMubWFwU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuICAgIHByaXZhdGUgcG9seWdvblN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PElMYXRMbmdbXVtdW10+KG51bGwpOyBcclxuXHJcbiAgICBwb2x5Z29ucyQ6IE9ic2VydmFibGU8SUxhdExuZ1tdW11bXT4gPSB0aGlzLnBvbHlnb25TdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG4gICAgcHJpdmF0ZSBtYXBTdGF0ZVN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PE1hcFN0YXRlTW9kZWw+KG5ldyBNYXBTdGF0ZU1vZGVsKCkpO1xyXG4gICAgbWFwU3RhdGUkOiBPYnNlcnZhYmxlPE1hcFN0YXRlTW9kZWw+ID0gdGhpcy5tYXBTdGF0ZVN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgICBtYXBab29tTGV2ZWwkOiBPYnNlcnZhYmxlPG51bWJlcj4gID0gdGhpcy5tYXBTdGF0ZSQucGlwZShtYXAoKHN0YXRlOiBNYXBTdGF0ZU1vZGVsKSA9PiBzdGF0ZS5tYXBCb3VuZFN0YXRlLnpvb20pKTtcclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZU1hcFN0YXRlcyhuZXdTdGF0ZTogYW55KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHN0YXRlID0gdGhpcy5tYXBTdGF0ZVN1YmplY3QudmFsdWU7XHJcbiAgICAgICAgc3RhdGUgPSB7IC4uLnN0YXRlLCAuLi5uZXdTdGF0ZSB9O1xyXG5cclxuICAgICAgICB0aGlzLm1hcFN0YXRlU3ViamVjdC5uZXh0KHN0YXRlKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgdXBkYXRlTWFwU3RhdGUobWFwOiBMLk1hcCl7XHJcbiAgICAgICAgdGhpcy5tYXBTdWJqZWN0Lm5leHQobWFwKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVBvbHlnb25zKHBvbHlnb25zOiBJTGF0TG5nW11bXVtdKTp2b2lke1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMucG9seWdvblN1YmplY3QubmV4dChwb2x5Z29ucylcclxuICAgIH1cclxuICAgIHVwZGF0ZU1hcEJvdW5kcyhtYXBCb3VuZHM6IE1hcEJvdW5kc1N0YXRlKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVNYXBTdGF0ZXMoeyBtYXBCb3VuZFN0YXRlOiBtYXBCb3VuZHMgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE1hcFN0YXRlTW9kZWwge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBtYXBCb3VuZFN0YXRlOiBNYXBCb3VuZHNTdGF0ZSA9IG5ldyBNYXBCb3VuZHNTdGF0ZShudWxsLCAxMSkpIHsgfVxyXG59XHJcbmNsYXNzIE1hcEJvdW5kc1N0YXRlIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyBib3VuZHM6IEwuTGF0TG5nQm91bmRzLFxyXG4gICAgICAgIHB1YmxpYyB6b29tOiBudW1iZXIpIHsgfVxyXG59Il19