import * as L from "leaflet";
import * as turf from "@turf/turf";
var PolygonUtil = /** @class */ (function () {
    function PolygonUtil() {
    }
    PolygonUtil.getCenter = function (polygon) {
        var pi = Math.PI;
        var x = 0;
        var y = 0;
        var z = 0;
        polygon.forEach(function (v) {
            var lat1 = v.lat;
            var lon1 = v.lng;
            lat1 = lat1 * pi / 180;
            lon1 = lon1 * pi / 180;
            x += Math.cos(lat1) * Math.cos(lon1);
            y += Math.cos(lat1) * Math.sin(lon1);
            z += Math.sin(lat1);
        });
        var lng = Math.atan2(y, x);
        var hyp = Math.sqrt(x * x + y * y);
        var lat = Math.atan2(z, hyp);
        lat = lat * 180 / pi;
        lng = lng * 180 / pi;
        var center = { lat: lat, lng: lng };
        return center;
    };
    PolygonUtil.getSouthWest = function (polygon) {
        var bounds = this.getBounds(polygon);
        return bounds.getNorthWest();
    };
    PolygonUtil.getNorthEast = function (polygon) {
        var bounds = this.getBounds(polygon);
        return bounds.getNorthEast();
    };
    PolygonUtil.getNorthWest = function (polygon) {
        var bounds = this.getBounds(polygon);
        return bounds.getNorthWest();
    };
    PolygonUtil.getSouthEast = function (polygon) {
        var bounds = this.getBounds(polygon);
        return bounds.getSouthEast();
    };
    PolygonUtil.getNorth = function (polygon) {
        var bounds = this.getBounds(polygon);
        return bounds.getNorth();
    };
    PolygonUtil.getSouth = function (polygon) {
        var bounds = this.getBounds(polygon);
        return bounds.getSouth();
    };
    PolygonUtil.getWest = function (polygon) {
        var bounds = this.getBounds(polygon);
        return bounds.getWest();
    };
    PolygonUtil.getEast = function (polygon) {
        var bounds = this.getBounds(polygon);
        return bounds.getEast();
    };
    PolygonUtil.getSqmArea = function (polygon) {
        var poly = new L.Polygon(polygon);
        var geoJsonPoly = poly.toGeoJSON();
        var area = turf.area((geoJsonPoly));
        return area;
    };
    PolygonUtil.getPerimeter = function (polygon) {
        var poly = new L.Polygon(polygon);
        var geoJsonPoly = poly.toGeoJSON();
        var perimeter = turf.length((geoJsonPoly), { units: "meters" });
        return perimeter;
    };
    PolygonUtil.getPolygonChecksum = function (polygon) {
        var uniqueLatLngs = polygon.filter(function (v, i, a) {
            return a.indexOf(a.find(function (x) { return x.lat === v.lat && x.lng === v.lng; })) === i;
        });
        return uniqueLatLngs.reduce(function (a, b) { return +a + +b.lat; }, 0) * uniqueLatLngs.reduce(function (a, b) { return +a + +b.lng; }, 0);
    };
    PolygonUtil.getMidPoint = function (point1, point2) {
        var p1 = turf.point([point1.lng, point1.lat]);
        var p2 = turf.point([point2.lng, point2.lat]);
        var midpoint = turf.midpoint(p1, p2);
        var returnPoint = {
            lat: midpoint.geometry.coordinates[1],
            lng: midpoint.geometry.coordinates[0]
        };
        return returnPoint;
    };
    PolygonUtil.getBounds = function (polygon) {
        var tmpLatLng = [];
        polygon.forEach(function (ll) {
            if (isNaN(ll.lat) || isNaN(ll.lng)) {
            }
            tmpLatLng.push(ll);
        });
        var polyLine = new L.Polyline(tmpLatLng);
        var bounds = polyLine.getBounds();
        return bounds;
    };
    return PolygonUtil;
}());
export { PolygonUtil };
//export class FreedrawSubtract extends L.FreeDraw {
//    constructor() {
//        //this will become L.FreeDraw
//        super(null);
//        //call methods in freedraw by this
//        const foo = this.size();
//        this.consoleLogNumberOfPolygons(foo);
//    }
//    consoleLogNumberOfPolygons(size: number): void {
//        console.log("Number of polygons: ", size);
//    }
//}
//# sourceMappingURL=polygon.util.js.map