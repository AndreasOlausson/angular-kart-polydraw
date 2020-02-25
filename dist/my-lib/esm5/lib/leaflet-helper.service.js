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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZmxldC1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9sZWFmbGV0LWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDOztBQUk3QjtJQUNFO0lBQWUsQ0FBQztJQUVoQiw0Q0FBYSxHQUFiLFVBQWMsT0FBa0I7UUFDOUIsSUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7O0lBTlUsb0JBQW9CO1FBRGhDLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQzs7T0FDdEIsb0JBQW9CLENBT2hDOytCQVpEO0NBWUMsQUFQRCxJQU9DO1NBUFksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCAqIGFzIEwgZnJvbSBcImxlYWZsZXRcIjtcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gXCIuL3BvbHlnb24taGVscGVyc1wiO1xyXG5cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiBcInJvb3RcIiB9KVxyXG5leHBvcnQgY2xhc3MgTGVhZmxldEhlbHBlclNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgY3JlYXRlUG9seWdvbihsYXRMbmdzOiBJTGF0TG5nW10pOiBMLlBvbHlnb24ge1xyXG4gICAgY29uc3QgcCA9IEwucG9seWdvbihsYXRMbmdzKTtcclxuICAgIHJldHVybiBwO1xyXG4gIH1cclxufVxyXG4iXX0=