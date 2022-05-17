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
    LeafletHelperService.ɵfac = function LeafletHelperService_Factory(t) { return new (t || LeafletHelperService)(); };
    LeafletHelperService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: LeafletHelperService, factory: LeafletHelperService.ɵfac, providedIn: "root" });
    return LeafletHelperService;
}());
export { LeafletHelperService };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LeafletHelperService, [{
        type: Injectable,
        args: [{ providedIn: "root" }]
    }], function () { return []; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZmxldC1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9sZWFmbGV0LWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxLQUFLLENBQUMsTUFBTSxTQUFTLENBQUM7O0FBRzdCO0lBRUU7SUFBZSxDQUFDO0lBRWhCLDRDQUFhLEdBQWIsVUFBYyxPQUFrQjtRQUM5QixJQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs0RkFOVSxvQkFBb0I7OEVBQXBCLG9CQUFvQixXQUFwQixvQkFBb0IsbUJBRFAsTUFBTTsrQkFKaEM7Q0FZQyxBQVJELElBUUM7U0FQWSxvQkFBb0I7dUZBQXBCLG9CQUFvQjtjQURoQyxVQUFVO2VBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCAqIGFzIEwgZnJvbSBcImxlYWZsZXRcIjtcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gXCIuL3BvbHlnb24taGVscGVyc1wiO1xyXG5cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiBcInJvb3RcIiB9KVxyXG5leHBvcnQgY2xhc3MgTGVhZmxldEhlbHBlclNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgY3JlYXRlUG9seWdvbihsYXRMbmdzOiBJTGF0TG5nW10pOiBMLlBvbHlnb24ge1xyXG4gICAgY29uc3QgcCA9IEwucG9seWdvbihsYXRMbmdzKTtcclxuICAgIHJldHVybiBwO1xyXG4gIH1cclxufVxyXG4iXX0=