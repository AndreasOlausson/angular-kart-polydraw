import { __decorate, __metadata } from "tslib";
import { Injectable } from "@angular/core";
import * as L from "leaflet";
import * as i0 from "@angular/core";
let LeafletHelperService = class LeafletHelperService {
    constructor() {
    }
    createPolygon(latLngs) {
        const p = L.polygon(latLngs);
        return p;
    }
};
LeafletHelperService.ɵprov = i0.ɵɵdefineInjectable({ factory: function LeafletHelperService_Factory() { return new LeafletHelperService(); }, token: LeafletHelperService, providedIn: "root" });
LeafletHelperService = __decorate([
    Injectable({ providedIn: "root" }),
    __metadata("design:paramtypes", [])
], LeafletHelperService);
export { LeafletHelperService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZmxldC1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9sZWFmbGV0LWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDOztBQUk3QixJQUFhLG9CQUFvQixHQUFqQyxNQUFhLG9CQUFvQjtJQUMvQjtJQUFlLENBQUM7SUFFaEIsYUFBYSxDQUFDLE9BQWtCO1FBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0IsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0NBQ0YsQ0FBQTs7QUFQWSxvQkFBb0I7SUFEaEMsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDOztHQUN0QixvQkFBb0IsQ0FPaEM7U0FQWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0ICogYXMgTCBmcm9tIFwibGVhZmxldFwiO1xyXG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSBcIi4vcG9seWdvbi1oZWxwZXJzXCI7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXHJcbmV4cG9ydCBjbGFzcyBMZWFmbGV0SGVscGVyU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICBjcmVhdGVQb2x5Z29uKGxhdExuZ3M6IElMYXRMbmdbXSk6IEwuUG9seWdvbiB7XHJcbiAgICBjb25zdCBwID0gTC5wb2x5Z29uKGxhdExuZ3MpO1xyXG4gICAgcmV0dXJuIHA7XHJcbiAgfVxyXG59XHJcbiJdfQ==