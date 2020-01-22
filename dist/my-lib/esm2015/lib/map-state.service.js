import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as i0 from "@angular/core";
let PolyStateService = class PolyStateService {
    constructor() {
        this.mapSubject = new BehaviorSubject(null);
        this.map$ = this.mapSubject.asObservable();
        this.polygonSubject = new BehaviorSubject(null);
        this.polygons$ = this.polygonSubject.asObservable();
        this.mapZoomLevel$ = new Observable();
    }
    updateMapState(map) {
        this.mapSubject.next(map);
    }
    updatePolygons(polygons) {
        console.log("map-state", polygons);
        this.polygonSubject.next(polygons);
    }
};
PolyStateService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function PolyStateService_Factory() { return new PolyStateService(); }, token: PolyStateService, providedIn: "root" });
PolyStateService = tslib_1.__decorate([
    Injectable({
        providedIn: 'root'
    }),
    tslib_1.__metadata("design:paramtypes", [])
], PolyStateService);
export { PolyStateService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbWFwLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7O0FBT25ELElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWdCO0lBQ3pCO1FBR1EsZUFBVSxHQUFHLElBQUksZUFBZSxDQUFRLElBQUksQ0FBQyxDQUFDO1FBRXRELFNBQUksR0FBc0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNqRCxtQkFBYyxHQUFHLElBQUksZUFBZSxDQUFnQixJQUFJLENBQUMsQ0FBQztRQUVsRSxjQUFTLEdBQThCLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFMUUsa0JBQWEsR0FBdUIsSUFBSSxVQUFVLEVBQUUsQ0FBQztJQVZyQyxDQUFDO0lBYWpCLGNBQWMsQ0FBQyxHQUFVO1FBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzdCLENBQUM7SUFFRCxjQUFjLENBQUMsUUFBdUI7UUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDdEMsQ0FBQztDQUNKLENBQUE7O0FBdEJZLGdCQUFnQjtJQUg1QixVQUFVLENBQUM7UUFDUixVQUFVLEVBQUUsTUFBTTtLQUNyQixDQUFDOztHQUNXLGdCQUFnQixDQXNCNUI7U0F0QlksZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0ICogYXMgTCBmcm9tIFwibGVhZmxldFwiXHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tICcuL3BvbHlnb24taGVscGVycyc7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgICBwcm92aWRlZEluOiAncm9vdCdcclxufSlcclxuZXhwb3J0IGNsYXNzIFBvbHlTdGF0ZVNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7IH1cclxuICAgIFxyXG5cclxuICAgIHByaXZhdGUgbWFwU3ViamVjdCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8TC5NYXA+KG51bGwpOyBcclxuICAgIFxyXG4gICAgbWFwJDogT2JzZXJ2YWJsZTxMLk1hcD4gPSB0aGlzLm1hcFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgICBwcml2YXRlIHBvbHlnb25TdWJqZWN0ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxJTGF0TG5nW11bXVtdPihudWxsKTsgXHJcblxyXG4gICAgcG9seWdvbnMkOiBPYnNlcnZhYmxlPElMYXRMbmdbXVtdW10+ID0gdGhpcy5wb2x5Z29uU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuXHJcbiAgICBtYXBab29tTGV2ZWwkOiBPYnNlcnZhYmxlPG51bWJlcj4gPSBuZXcgT2JzZXJ2YWJsZSgpO1xyXG5cclxuXHJcbiAgICB1cGRhdGVNYXBTdGF0ZShtYXA6IEwuTWFwKXtcclxuICAgICAgICB0aGlzLm1hcFN1YmplY3QubmV4dChtYXApXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUG9seWdvbnMocG9seWdvbnM6IElMYXRMbmdbXVtdW10pOnZvaWR7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJtYXAtc3RhdGVcIixwb2x5Z29ucyk7XHJcbiAgICAgICAgdGhpcy5wb2x5Z29uU3ViamVjdC5uZXh0KHBvbHlnb25zKVxyXG4gICAgfVxyXG59Il19