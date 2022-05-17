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
LeafletHelperService.ɵfac = function LeafletHelperService_Factory(t) { return new (t || LeafletHelperService)(); };
LeafletHelperService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: LeafletHelperService, factory: LeafletHelperService.ɵfac, providedIn: "root" });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LeafletHelperService, [{
        type: Injectable,
        args: [{ providedIn: "root" }]
    }], function () { return []; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZmxldC1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9sZWFmbGV0LWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxLQUFLLENBQUMsTUFBTSxTQUFTLENBQUM7O0FBSTdCLE1BQU0sT0FBTyxvQkFBb0I7SUFDL0IsZ0JBQWUsQ0FBQztJQUVoQixhQUFhLENBQUMsT0FBa0I7UUFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7O3dGQU5VLG9CQUFvQjswRUFBcEIsb0JBQW9CLFdBQXBCLG9CQUFvQixtQkFEUCxNQUFNO3VGQUNuQixvQkFBb0I7Y0FEaEMsVUFBVTtlQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCI7XHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogXCJyb290XCIgfSlcclxuZXhwb3J0IGNsYXNzIExlYWZsZXRIZWxwZXJTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gIGNyZWF0ZVBvbHlnb24obGF0TG5nczogSUxhdExuZ1tdKTogTC5Qb2x5Z29uIHtcclxuICAgIGNvbnN0IHAgPSBMLnBvbHlnb24obGF0TG5ncyk7XHJcbiAgICByZXR1cm4gcDtcclxuICB9XHJcbn1cclxuIl19