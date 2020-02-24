import { __decorate, __metadata } from "tslib";
import { Injectable } from "@angular/core";
import * as L from "leaflet";
import * as i0 from "@angular/core";
var LeafletHelperService = /** @class */ (function () {
    function LeafletHelperService() {
    }
    LeafletHelperService.prototype.createPolygon = function (latLngs) {
        var p = L.polygon(latLngs);
        return p;
    };
    LeafletHelperService.ɵprov = i0.ɵɵdefineInjectable({ factory: function LeafletHelperService_Factory() { return new LeafletHelperService(); }, token: LeafletHelperService, providedIn: "root" });
    LeafletHelperService = __decorate([
        Injectable({ providedIn: "root" }),
        __metadata("design:paramtypes", [])
    ], LeafletHelperService);
    return LeafletHelperService;
}());
export { LeafletHelperService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZmxldC1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3BvbHlkcmF3LyIsInNvdXJjZXMiOlsibGliL2xlYWZsZXQtaGVscGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxLQUFLLENBQUMsTUFBTSxTQUFTLENBQUM7O0FBSTdCO0lBQ0U7SUFBZSxDQUFDO0lBRWhCLDRDQUFhLEdBQWIsVUFBYyxPQUFrQjtRQUM5QixJQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs7SUFOVSxvQkFBb0I7UUFEaEMsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDOztPQUN0QixvQkFBb0IsQ0FPaEM7K0JBWkQ7Q0FZQyxBQVBELElBT0M7U0FQWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0ICogYXMgTCBmcm9tIFwibGVhZmxldFwiO1xyXG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSBcIi4vcG9seWdvbi1oZWxwZXJzXCI7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXHJcbmV4cG9ydCBjbGFzcyBMZWFmbGV0SGVscGVyU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICBjcmVhdGVQb2x5Z29uKGxhdExuZ3M6IElMYXRMbmdbXSk6IEwuUG9seWdvbiB7XHJcbiAgICBjb25zdCBwID0gTC5wb2x5Z29uKGxhdExuZ3MpO1xyXG4gICAgcmV0dXJuIHA7XHJcbiAgfVxyXG59XHJcbiJdfQ==