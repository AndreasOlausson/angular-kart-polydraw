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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZmxldC1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3BvbHlkcmF3LyIsInNvdXJjZXMiOlsibGliL2xlYWZsZXQtaGVscGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxLQUFLLENBQUMsTUFBTSxTQUFTLENBQUM7O0FBSTdCLElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO0lBQy9CO0lBQWUsQ0FBQztJQUVoQixhQUFhLENBQUMsT0FBa0I7UUFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7Q0FDRixDQUFBOztBQVBZLG9CQUFvQjtJQURoQyxVQUFVLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7O0dBQ3RCLG9CQUFvQixDQU9oQztTQVBZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCI7XHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogXCJyb290XCIgfSlcclxuZXhwb3J0IGNsYXNzIExlYWZsZXRIZWxwZXJTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gIGNyZWF0ZVBvbHlnb24obGF0TG5nczogSUxhdExuZ1tdKTogTC5Qb2x5Z29uIHtcclxuICAgIGNvbnN0IHAgPSBMLnBvbHlnb24obGF0TG5ncyk7XHJcbiAgICByZXR1cm4gcDtcclxuICB9XHJcbn1cclxuIl19