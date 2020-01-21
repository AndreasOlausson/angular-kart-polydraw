import * as tslib_1 from "tslib";
import { Injectable } from "@angular/core";
import * as L from "leaflet";
import * as i0 from "@angular/core";
let LeafletHelperService = class LeafletHelperService {
    constructor() { }
    createPolygon(latLngs) {
        const p = L.polygon(latLngs);
        return p;
    }
};
LeafletHelperService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function LeafletHelperService_Factory() { return new LeafletHelperService(); }, token: LeafletHelperService, providedIn: "root" });
LeafletHelperService = tslib_1.__decorate([
    Injectable({ providedIn: "root" }),
    tslib_1.__metadata("design:paramtypes", [])
], LeafletHelperService);
export { LeafletHelperService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZmxldC1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9sZWFmbGV0LWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDOztBQUk3QixJQUFhLG9CQUFvQixHQUFqQyxNQUFhLG9CQUFvQjtJQUMvQixnQkFBZSxDQUFDO0lBRWhCLGFBQWEsQ0FBQyxPQUFrQjtRQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztDQUNGLENBQUE7O0FBUFksb0JBQW9CO0lBRGhDLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQzs7R0FDdEIsb0JBQW9CLENBT2hDO1NBUFksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCAqIGFzIEwgZnJvbSBcImxlYWZsZXRcIjtcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gXCIuL3BvbHlnb24taGVscGVyc1wiO1xyXG5cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiBcInJvb3RcIiB9KVxyXG5leHBvcnQgY2xhc3MgTGVhZmxldEhlbHBlclNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgY3JlYXRlUG9seWdvbihsYXRMbmdzOiBJTGF0TG5nW10pOiBMLlBvbHlnb24ge1xyXG4gICAgY29uc3QgcCA9IEwucG9seWdvbihsYXRMbmdzKTtcclxuICAgIHJldHVybiBwO1xyXG4gIH1cclxufVxyXG4iXX0=