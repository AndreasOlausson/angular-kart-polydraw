import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
let MapStateService = class MapStateService {
    constructor() {
        this.mapSubject = new BehaviorSubject(null);
        this.map$ = this.mapSubject.asObservable();
    }
    updateMapState(map) {
        this.mapSubject.next(map);
    }
    updatePolygons(polygons) {
        console.log("map-state", polygons);
    }
};
MapStateService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function MapStateService_Factory() { return new MapStateService(); }, token: MapStateService, providedIn: "root" });
MapStateService = tslib_1.__decorate([
    Injectable({
        providedIn: 'root'
    }),
    tslib_1.__metadata("design:paramtypes", [])
], MapStateService);
export { MapStateService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXN0YXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbWFwLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQzs7QUFPbkQsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZTtJQUN4QjtRQUdRLGVBQVUsR0FBRyxJQUFJLGVBQWUsQ0FBUSxJQUFJLENBQUMsQ0FBQztRQUV0RCxTQUFJLEdBQXNCLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7SUFMekMsQ0FBQztJQU9qQixjQUFjLENBQUMsR0FBVTtRQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUM3QixDQUFDO0lBRUQsY0FBYyxDQUFDLFFBQXVCO1FBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FDSixDQUFBOztBQWZZLGVBQWU7SUFIM0IsVUFBVSxDQUFDO1FBQ1IsVUFBVSxFQUFFLE1BQU07S0FDckIsQ0FBQzs7R0FDVyxlQUFlLENBZTNCO1NBZlksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCAqIGFzIEwgZnJvbSBcImxlYWZsZXRcIlxyXG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSAnLi9wb2x5Z29uLWhlbHBlcnMnO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBNYXBTdGF0ZVNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7IH1cclxuICAgIFxyXG5cclxuICAgIHByaXZhdGUgbWFwU3ViamVjdCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8TC5NYXA+KG51bGwpOyBcclxuXHJcbiAgICBtYXAkOiBPYnNlcnZhYmxlPEwuTWFwPiA9IHRoaXMubWFwU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuXHJcbiAgICB1cGRhdGVNYXBTdGF0ZShtYXA6IEwuTWFwKXtcclxuICAgICAgICB0aGlzLm1hcFN1YmplY3QubmV4dChtYXApXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUG9seWdvbnMocG9seWdvbnM6IElMYXRMbmdbXVtdW10pOnZvaWR7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJtYXAtc3RhdGVcIixwb2x5Z29ucyk7XHJcbiAgICB9XHJcbn0iXX0=