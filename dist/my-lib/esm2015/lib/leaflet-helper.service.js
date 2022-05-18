import { Injectable } from "@angular/core";
import * as L from "leaflet";
import * as i0 from "@angular/core";
export class LeafletHelperService {
    constructor() { }
    createPolygon(latLngs) {
        const p = L.polygon(latLngs);
        return p;
    }
}
LeafletHelperService.ɵprov = i0.ɵɵdefineInjectable({ factory: function LeafletHelperService_Factory() { return new LeafletHelperService(); }, token: LeafletHelperService, providedIn: "root" });
LeafletHelperService.decorators = [
    { type: Injectable, args: [{ providedIn: "root" },] }
];
LeafletHelperService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZmxldC1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL215LWxpYi9zcmMvbGliL2xlYWZsZXQtaGVscGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEtBQUssQ0FBQyxNQUFNLFNBQVMsQ0FBQzs7QUFJN0IsTUFBTSxPQUFPLG9CQUFvQjtJQUMvQixnQkFBZSxDQUFDO0lBRWhCLGFBQWEsQ0FBQyxPQUFrQjtRQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs7OztZQVBGLFVBQVUsU0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0ICogYXMgTCBmcm9tIFwibGVhZmxldFwiO1xyXG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSBcIi4vcG9seWdvbi1oZWxwZXJzXCI7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXHJcbmV4cG9ydCBjbGFzcyBMZWFmbGV0SGVscGVyU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICBjcmVhdGVQb2x5Z29uKGxhdExuZ3M6IElMYXRMbmdbXSk6IEwuUG9seWdvbiB7XHJcbiAgICBjb25zdCBwID0gTC5wb2x5Z29uKGxhdExuZ3MpO1xyXG4gICAgcmV0dXJuIHA7XHJcbiAgfVxyXG59XHJcbiJdfQ==