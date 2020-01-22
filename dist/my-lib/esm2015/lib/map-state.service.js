import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
let PolyStateService = class PolyStateService {
    constructor() {
        this.mapSubject = new BehaviorSubject(null);
        this.map$ = this.mapSubject.asObservable();
        this.polygonSubject = new BehaviorSubject(null);
        this.polygons$ = this.polygonSubject.asObservable();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbWFwLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQzs7QUFPbkQsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBZ0I7SUFDekI7UUFHUSxlQUFVLEdBQUcsSUFBSSxlQUFlLENBQVEsSUFBSSxDQUFDLENBQUM7UUFFdEQsU0FBSSxHQUFzQixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2pELG1CQUFjLEdBQUcsSUFBSSxlQUFlLENBQWdCLElBQUksQ0FBQyxDQUFDO1FBRWxFLGNBQVMsR0FBOEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQVIxRCxDQUFDO0lBVWpCLGNBQWMsQ0FBQyxHQUFVO1FBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzdCLENBQUM7SUFFRCxjQUFjLENBQUMsUUFBdUI7UUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDdEMsQ0FBQztDQUNKLENBQUE7O0FBbkJZLGdCQUFnQjtJQUg1QixVQUFVLENBQUM7UUFDUixVQUFVLEVBQUUsTUFBTTtLQUNyQixDQUFDOztHQUNXLGdCQUFnQixDQW1CNUI7U0FuQlksZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0ICogYXMgTCBmcm9tIFwibGVhZmxldFwiXHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tICcuL3BvbHlnb24taGVscGVycyc7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgICBwcm92aWRlZEluOiAncm9vdCdcclxufSlcclxuZXhwb3J0IGNsYXNzIFBvbHlTdGF0ZVNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7IH1cclxuICAgIFxyXG5cclxuICAgIHByaXZhdGUgbWFwU3ViamVjdCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8TC5NYXA+KG51bGwpOyBcclxuXHJcbiAgICBtYXAkOiBPYnNlcnZhYmxlPEwuTWFwPiA9IHRoaXMubWFwU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuICAgIHByaXZhdGUgcG9seWdvblN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PElMYXRMbmdbXVtdW10+KG51bGwpOyBcclxuXHJcbiAgICBwb2x5Z29ucyQ6IE9ic2VydmFibGU8SUxhdExuZ1tdW11bXT4gPSB0aGlzLnBvbHlnb25TdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG5cclxuICAgIHVwZGF0ZU1hcFN0YXRlKG1hcDogTC5NYXApe1xyXG4gICAgICAgIHRoaXMubWFwU3ViamVjdC5uZXh0KG1hcClcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVQb2x5Z29ucyhwb2x5Z29uczogSUxhdExuZ1tdW11bXSk6dm9pZHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC1zdGF0ZVwiLHBvbHlnb25zKTtcclxuICAgICAgICB0aGlzLnBvbHlnb25TdWJqZWN0Lm5leHQocG9seWdvbnMpXHJcbiAgICB9XHJcbn0iXX0=