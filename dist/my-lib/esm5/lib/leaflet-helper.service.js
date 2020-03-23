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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZmxldC1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9sZWFmbGV0LWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDOztBQUk3QjtJQUNFO0lBQWUsQ0FBQztJQUVoQiw0Q0FBYSxHQUFiLFVBQWMsT0FBa0I7UUFDOUIsSUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7O0lBTlUsb0JBQW9CO1FBRGhDLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQzs7T0FDdEIsb0JBQW9CLENBT2hDOytCQVpEO0NBWUMsQUFQRCxJQU9DO1NBUFksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCI7XG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSBcIi4vcG9seWdvbi1oZWxwZXJzXCI7XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogXCJyb290XCIgfSlcbmV4cG9ydCBjbGFzcyBMZWFmbGV0SGVscGVyU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBjcmVhdGVQb2x5Z29uKGxhdExuZ3M6IElMYXRMbmdbXSk6IEwuUG9seWdvbiB7XG4gICAgY29uc3QgcCA9IEwucG9seWdvbihsYXRMbmdzKTtcbiAgICByZXR1cm4gcDtcbiAgfVxufVxuIl19