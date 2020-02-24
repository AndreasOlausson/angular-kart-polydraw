import { __read, __spread } from "tslib";
import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';
import concaveman from 'concaveman';
import { Compass } from './utils';
import * as i0 from "@angular/core";
var TurfHelperService = /** @class */ (function () {
    function TurfHelperService() {
        this.simplifyTolerance = { tolerance: 0.0001, highQuality: false };
    }
    TurfHelperService.prototype.union = function (poly1, poly2) {
        console.log('poly1: ', poly1);
        console.log('poly2: ', poly2);
        var union = turf.union(poly1, poly2);
        return this.getTurfPolygon(union);
    };
    TurfHelperService.prototype.turfConcaveman = function (feature) {
        //console.log("turfConcaveman", points);
        var points = turf.explode(feature);
        var coordinates = points.features.map(function (f) { return f.geometry.coordinates; });
        return turf.multiPolygon([[concaveman(coordinates)]]);
    };
    //TODO add some sort of dynamic tolerance
    TurfHelperService.prototype.getSimplified = function (polygon) {
        var tolerance = this.simplifyTolerance;
        var simplified = turf.simplify(polygon, tolerance);
        return simplified;
    };
    TurfHelperService.prototype.getTurfPolygon = function (polygon) {
        var turfPolygon;
        console.log('Get TurfPolygon:', polygon);
        // if (polygon.geometry)
        if (polygon.geometry.type === 'Polygon') {
            turfPolygon = turf.multiPolygon([polygon.geometry.coordinates]);
        }
        else {
            turfPolygon = turf.multiPolygon(polygon.geometry.coordinates);
        }
        return turfPolygon;
    };
    TurfHelperService.prototype.getMultiPolygon = function (polygonArray) {
        return turf.multiPolygon(polygonArray);
    };
    TurfHelperService.prototype.getKinks = function (feature) {
        var unkink = turf.unkinkPolygon(feature);
        var coordinates = [];
        turf.featureEach(unkink, function (current) {
            coordinates.push(current);
        });
        return coordinates;
    };
    TurfHelperService.prototype.getCoords = function (feature) {
        return turf.getCoords(feature);
    };
    TurfHelperService.prototype.hasKinks = function (feature) {
        var kinks = turf.kinks(feature);
        return kinks.features.length > 0;
    };
    TurfHelperService.prototype.polygonIntersect = function (polygon, latlngs) {
        // const oldPolygon = polygon.toGeoJSON();
        var poly = [];
        var poly2 = [];
        console.log('polygonIntersect', polygon, latlngs);
        var latlngsCoords = turf.getCoords(latlngs);
        latlngsCoords.forEach(function (element) {
            var feat = { type: 'Polygon', coordinates: [element[0]] };
            poly.push(feat);
        });
        var polygonCoords = turf.getCoords(polygon);
        polygonCoords.forEach(function (element) {
            var feat = { type: 'Polygon', coordinates: [element[0]] };
            poly2.push(feat);
        });
        var intersect = false;
        loop1: for (var i = 0; i < poly.length; i++) {
            if (this.getKinks(poly[i]).length < 2) {
                for (var j = 0; j < poly2.length; j++) {
                    if (this.getKinks(poly2[j]).length < 2) {
                        intersect = !!turf.intersect(poly[i], poly2[j]);
                        if (intersect) {
                            break loop1;
                        }
                    }
                }
            }
        }
        return intersect;
    };
    TurfHelperService.prototype.getIntersection = function (poly1, poly2) {
        return turf.intersect(poly1, poly2);
    };
    TurfHelperService.prototype.getDistance = function (point1, point2) {
        return turf.distance(point1, point2);
    };
    TurfHelperService.prototype.isWithin = function (polygon1, polygon2) {
        console.log(polygon1);
        console.log('Ytre: ', polygon2);
        return turf.booleanWithin(turf.polygon([polygon1]), turf.polygon([polygon2]));
    };
    TurfHelperService.prototype.equalPolygons = function (polygon1, polygon2) {
        console.log(polygon1);
        console.log(polygon2);
        console.log(turf.booleanEqual(polygon1, polygon2));
    };
    //TODO optional add extra markers for N E S W (We have the corners NW, NE, SE, SW)
    TurfHelperService.prototype.convertToBoundingBoxPolygon = function (polygon, addMidpointMarkers) {
        if (addMidpointMarkers === void 0) { addMidpointMarkers = false; }
        var bbox = turf.bbox(polygon.geometry);
        var bboxPolygon = turf.bboxPolygon(bbox);
        var compass = new Compass(bbox[1], bbox[0], bbox[3], bbox[2]);
        var compassPositions = compass.getPositions();
        bboxPolygon.geometry.coordinates = [];
        bboxPolygon.geometry.coordinates = [compassPositions];
        return bboxPolygon;
    };
    TurfHelperService.prototype.polygonToMultiPolygon = function (poly) {
        var multi = turf.multiPolygon([poly.geometry.coordinates]);
        return multi;
    };
    //TODO -cleanup
    TurfHelperService.prototype.injectPointToPolygon = function (polygon, point) {
        var coords = turf.getCoords(polygon);
        var newPolygon;
        console.log('polygon: ', polygon);
        if (coords.length < 2) {
            var polygonPoints = turf.explode(polygon);
            console.log(turf.nearestPoint(point, polygonPoints));
            var index_1 = turf.nearestPoint(point, polygonPoints).properties.featureIndex;
            var test = turf.coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
                if (index_1 === i) {
                    return __spread(accumulator, [oldPoint, point]);
                }
                return __spread(accumulator, [oldPoint]);
            }, []);
            console.log('test', test);
            newPolygon = turf.multiPolygon([[test]]);
        }
        else {
            var pos_1 = [];
            var coordinates_1 = [];
            coords.forEach(function (element) {
                var polygon = turf.polygon(element);
                // turf.booleanPointInPolygon(point, polygon)
                if (turf.booleanPointInPolygon(point, polygon)) {
                    var polygonPoints = turf.explode(polygon);
                    var index_2 = turf.nearestPoint(point, polygonPoints).properties.featureIndex;
                    coordinates_1 = turf.coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
                        if (index_2 === i) {
                            return __spread(accumulator, [oldPoint, point]);
                        }
                        return __spread(accumulator, [oldPoint]);
                    }, []);
                    console.log('coordinates', coordinates_1);
                }
                else {
                    pos_1.push(element);
                }
            });
            pos_1.push([coordinates_1]);
            newPolygon = turf.multiPolygon(pos_1);
        }
        return newPolygon;
    };
    TurfHelperService.prototype.polygonDifference = function (polygon1, polygon2) {
        var diff = turf.difference(polygon1, polygon2);
        console.log(diff);
        return this.getTurfPolygon(diff);
    };
    TurfHelperService.prototype.getBoundingBoxCompassPosition = function (polygon, MarkerPosition, useOffset, offsetDirection) {
        var p = this.getMultiPolygon(polygon);
        var compass = this.getBoundingBoxCompass(polygon);
        var polygonPoints = turf.explode(polygon);
        var coord = this.getCoord(compass.direction.North);
        var nearestPoint = turf.nearestPoint(coord, polygonPoints);
        return null;
    };
    TurfHelperService.prototype.getBoundingBoxCompass = function (polygon) {
        var p = this.getMultiPolygon(polygon);
        var centerOfMass = turf.centerOfMass(p);
        var b = turf.bbox(p);
        var minX = b[0];
        var minY = b[1];
        var maxX = b[2];
        var maxY = b[3];
        var compass = new Compass(minX, minY, maxX, maxY);
        // compass.direction.CenterOfMass = centerOfMass.geometry.coordinates[0][0];
        return compass;
    };
    TurfHelperService.prototype.getNearestPointIndex = function (targetPoint, points) {
        var index = turf.nearestPoint(targetPoint, points).properties.featureIndex;
        return index;
    };
    TurfHelperService.prototype.getCoord = function (point) {
        var coord = turf.getCoord([point.lng, point.lat]);
        return coord;
    };
    TurfHelperService.prototype.getFeaturePointCollection = function (points) {
        var pts = [];
        points.forEach(function (v) {
            var p = turf.point([v.lng, v.lat], {});
            pts.push(p);
        });
        var fc = turf.featureCollection(pts);
        return fc;
    };
    TurfHelperService.ɵfac = function TurfHelperService_Factory(t) { return new (t || TurfHelperService)(); };
    TurfHelperService.ɵprov = i0.ɵɵdefineInjectable({ token: TurfHelperService, factory: TurfHelperService.ɵfac, providedIn: 'root' });
    return TurfHelperService;
}());
export { TurfHelperService };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(TurfHelperService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return []; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi90dXJmLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUlwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDOztBQUdsQztJQUdFO1FBRFEsc0JBQWlCLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRWhCLGlDQUFLLEdBQUwsVUFBTSxLQUFLLEVBQUUsS0FBSztRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU5QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVyQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDBDQUFjLEdBQWQsVUFBZSxPQUF3QztRQUNyRCx3Q0FBd0M7UUFDeEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVuQyxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDckUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLENB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Qjs2REFBakIsaUJBQWlCLFdBQWpCLGlCQUFpQixtQkFESixNQUFNOzRCQVZoQztDQXNQQyxBQTVPRCxJQTRPQztTQTNPWSxpQkFBaUI7a0RBQWpCLGlCQUFpQjtjQUQ3QixVQUFVO2VBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0ICogYXMgdHVyZiBmcm9tICdAdHVyZi90dXJmJztcclxuaW1wb3J0IGNvbmNhdmVtYW4gZnJvbSAnY29uY2F2ZW1hbic7XHJcbmltcG9ydCB7IEZlYXR1cmUsIFBvbHlnb24sIE11bHRpUG9seWdvbiwgUG9zaXRpb24gfSBmcm9tICdAdHVyZi90dXJmJztcclxuaW1wb3J0IHsgTWFya2VyUG9zaXRpb24gfSBmcm9tICcuL2VudW1zJztcclxuaW1wb3J0IHsgSUNvbXBhc3MgfSBmcm9tICcuL2ludGVyZmFjZSc7XHJcbmltcG9ydCB7IENvbXBhc3MgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBUdXJmSGVscGVyU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBzaW1wbGlmeVRvbGVyYW5jZSA9IHsgdG9sZXJhbmNlOiAwLjAwMDEsIGhpZ2hRdWFsaXR5OiBmYWxzZSB9O1xyXG4gIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgdW5pb24ocG9seTEsIHBvbHkyKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBjb25zb2xlLmxvZygncG9seTE6ICcsIHBvbHkxKTtcclxuICAgIGNvbnNvbGUubG9nKCdwb2x5MjogJywgcG9seTIpO1xyXG5cclxuICAgIGxldCB1bmlvbiA9IHR1cmYudW5pb24ocG9seTEsIHBvbHkyKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5nZXRUdXJmUG9seWdvbih1bmlvbik7XHJcbiAgfVxyXG5cclxuICB0dXJmQ29uY2F2ZW1hbihmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICAvL2NvbnNvbGUubG9nKFwidHVyZkNvbmNhdmVtYW5cIiwgcG9pbnRzKTtcclxuICAgIGxldCBwb2ludHMgPSB0dXJmLmV4cGxvZGUoZmVhdHVyZSk7XHJcblxyXG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBwb2ludHMuZmVhdHVyZXMubWFwKGYgPT4gZi5nZW9tZXRyeS5jb29yZGluYXRlcyk7XHJcbiAgICByZXR1cm4gdHVyZi5tdWx0aVBvbHlnb24oW1tjb25jYXZlbWFuKGNvb3JkaW5hdGVzKV1dKTtcclxuICB9XHJcblxyXG5cclxuICAvL1RPRE8gYWRkIHNvbWUgc29ydCBvZiBkeW5hbWljIHRvbGVyYW5jZVxyXG4gIGdldFNpbXBsaWZpZWQocG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPik6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgY29uc3QgdG9sZXJhbmNlID0gdGhpcy5zaW1wbGlmeVRvbGVyYW5jZTtcclxuICAgIGNvbnN0IHNpbXBsaWZpZWQgPSB0dXJmLnNpbXBsaWZ5KHBvbHlnb24sIHRvbGVyYW5jZSk7XHJcbiAgICByZXR1cm4gc2ltcGxpZmllZDtcclxuICB9XHJcblxyXG4gIGdldFR1cmZQb2x5Z29uKHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIGxldCB0dXJmUG9seWdvbjtcclxuICAgIGNvbnNvbGUubG9nKCdHZXQgVHVyZlBvbHlnb246JywgcG9seWdvbik7XHJcbiAgICAvLyBpZiAocG9seWdvbi5nZW9tZXRyeSlcclxuICAgIGlmIChwb2x5Z29uLmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJykge1xyXG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtwb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKHBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHR1cmZQb2x5Z29uO1xyXG4gIH1cclxuXHJcbiAgZ2V0TXVsdGlQb2x5Z29uKHBvbHlnb25BcnJheTogUG9zaXRpb25bXVtdW10pOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIHJldHVybiB0dXJmLm11bHRpUG9seWdvbihwb2x5Z29uQXJyYXkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0S2lua3MoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3QgdW5raW5rID0gdHVyZi51bmtpbmtQb2x5Z29uKGZlYXR1cmUpO1xyXG4gICAgbGV0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICB0dXJmLmZlYXR1cmVFYWNoKHVua2luaywgY3VycmVudCA9PiB7XHJcbiAgICAgIGNvb3JkaW5hdGVzLnB1c2goY3VycmVudCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gY29vcmRpbmF0ZXM7XHJcbiAgfVxyXG5cclxuICBnZXRDb29yZHMoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgcmV0dXJuIHR1cmYuZ2V0Q29vcmRzKGZlYXR1cmUpO1xyXG4gIH1cclxuXHJcbiAgaGFzS2lua3MoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3Qga2lua3MgPSB0dXJmLmtpbmtzKGZlYXR1cmUpO1xyXG4gICAgcmV0dXJuIGtpbmtzLmZlYXR1cmVzLmxlbmd0aCA+IDA7XHJcbiAgfVxyXG5cclxuICBwb2x5Z29uSW50ZXJzZWN0KHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pOiBib29sZWFuIHtcclxuICAgIC8vIGNvbnN0IG9sZFBvbHlnb24gPSBwb2x5Z29uLnRvR2VvSlNPTigpO1xyXG4gICAgbGV0IHBvbHkgPSBbXTtcclxuICAgIGxldCBwb2x5MiA9IFtdO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCdwb2x5Z29uSW50ZXJzZWN0JywgcG9seWdvbiwgbGF0bG5ncyk7XHJcblxyXG4gICAgbGV0IGxhdGxuZ3NDb29yZHMgPSB0dXJmLmdldENvb3JkcyhsYXRsbmdzKTtcclxuICAgIGxhdGxuZ3NDb29yZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgbGV0IGZlYXQgPSB7IHR5cGU6ICdQb2x5Z29uJywgY29vcmRpbmF0ZXM6IFtlbGVtZW50WzBdXSB9O1xyXG5cclxuICAgICAgcG9seS5wdXNoKGZlYXQpO1xyXG4gICAgfSk7XHJcbiAgICBsZXQgcG9seWdvbkNvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKHBvbHlnb24pO1xyXG4gICAgcG9seWdvbkNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICBsZXQgZmVhdCA9IHsgdHlwZTogJ1BvbHlnb24nLCBjb29yZGluYXRlczogW2VsZW1lbnRbMF1dIH07XHJcblxyXG4gICAgICBwb2x5Mi5wdXNoKGZlYXQpO1xyXG4gICAgfSk7XHJcbiAgICBsZXQgaW50ZXJzZWN0ID0gZmFsc2U7XHJcbiAgICBsb29wMTogZm9yIChsZXQgaSA9IDA7IGkgPCBwb2x5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmICh0aGlzLmdldEtpbmtzKHBvbHlbaV0pLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvbHkyLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5nZXRLaW5rcyhwb2x5MltqXSkubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICBpbnRlcnNlY3QgPSAhIXR1cmYuaW50ZXJzZWN0KHBvbHlbaV0sIHBvbHkyW2pdKTtcclxuICAgICAgICAgICAgaWYgKGludGVyc2VjdCkge1xyXG4gICAgICAgICAgICAgIGJyZWFrIGxvb3AxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGludGVyc2VjdDtcclxuICB9XHJcblxyXG4gIGdldEludGVyc2VjdGlvbihwb2x5MSwgcG9seTIpOiBGZWF0dXJlIHtcclxuICAgIHJldHVybiB0dXJmLmludGVyc2VjdChwb2x5MSwgcG9seTIpO1xyXG4gIH1cclxuICBnZXREaXN0YW5jZShwb2ludDEsIHBvaW50Mik6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdHVyZi5kaXN0YW5jZShwb2ludDEsIHBvaW50Mik7XHJcbiAgfVxyXG5cclxuICBpc1dpdGhpbihwb2x5Z29uMTogUG9zaXRpb25bXSwgcG9seWdvbjI6IFBvc2l0aW9uW10pOiBib29sZWFuIHtcclxuICAgIGNvbnNvbGUubG9nKHBvbHlnb24xKTtcclxuICAgIGNvbnNvbGUubG9nKCdZdHJlOiAnLCBwb2x5Z29uMik7XHJcbiAgICByZXR1cm4gdHVyZi5ib29sZWFuV2l0aGluKHR1cmYucG9seWdvbihbcG9seWdvbjFdKSwgdHVyZi5wb2x5Z29uKFtwb2x5Z29uMl0pKTtcclxuICB9XHJcblxyXG4gIGVxdWFsUG9seWdvbnMocG9seWdvbjE6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sIHBvbHlnb24yOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMSk7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMik7XHJcbiAgICBjb25zb2xlLmxvZyh0dXJmLmJvb2xlYW5FcXVhbChwb2x5Z29uMSwgcG9seWdvbjIpKTtcclxuICB9XHJcbiAgLy9UT0RPIG9wdGlvbmFsIGFkZCBleHRyYSBtYXJrZXJzIGZvciBOIEUgUyBXIChXZSBoYXZlIHRoZSBjb3JuZXJzIE5XLCBORSwgU0UsIFNXKVxyXG4gIGNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LCBhZGRNaWRwb2ludE1hcmtlcnM6IGJvb2xlYW4gPSBmYWxzZSk6IEZlYXR1cmU8UG9seWdvbj4ge1xyXG4gICAgY29uc3QgYmJveCA9IHR1cmYuYmJveChwb2x5Z29uLmdlb21ldHJ5KTtcclxuICAgIGNvbnN0IGJib3hQb2x5Z29uID0gdHVyZi5iYm94UG9seWdvbihiYm94KTtcclxuXHJcblxyXG4gICAgY29uc3QgY29tcGFzcyA9IG5ldyBDb21wYXNzKGJib3hbMV0sIGJib3hbMF0sIGJib3hbM10sIGJib3hbMl0pO1xyXG5cclxuICAgIGNvbnN0IGNvbXBhc3NQb3NpdGlvbnMgPSBjb21wYXNzLmdldFBvc2l0aW9ucygpO1xyXG5cclxuICAgIGJib3hQb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzID0gW107XHJcbiAgICBiYm94UG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyA9IFtjb21wYXNzUG9zaXRpb25zXTtcclxuXHJcbiAgICByZXR1cm4gYmJveFBvbHlnb247XHJcbiAgfVxyXG4gIHBvbHlnb25Ub011bHRpUG9seWdvbihwb2x5OiBGZWF0dXJlPFBvbHlnb24+KTogRmVhdHVyZTxNdWx0aVBvbHlnb24+IHtcclxuICAgIGNvbnN0IG11bHRpID0gdHVyZi5tdWx0aVBvbHlnb24oW3BvbHkuZ2VvbWV0cnkuY29vcmRpbmF0ZXNdKTtcclxuICAgIHJldHVybiBtdWx0aTtcclxuICB9XHJcbiAgLy9UT0RPIC1jbGVhbnVwXHJcbiAgaW5qZWN0UG9pbnRUb1BvbHlnb24ocG9seWdvbiwgcG9pbnQpIHtcclxuICAgIGxldCBjb29yZHMgPSB0dXJmLmdldENvb3Jkcyhwb2x5Z29uKTtcclxuICAgIGxldCBuZXdQb2x5Z29uO1xyXG4gICAgY29uc29sZS5sb2coJ3BvbHlnb246ICcsIHBvbHlnb24pO1xyXG4gICAgaWYgKGNvb3Jkcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XHJcbiAgICAgIGNvbnNvbGUubG9nKHR1cmYubmVhcmVzdFBvaW50KHBvaW50LCBwb2x5Z29uUG9pbnRzKSk7XHJcbiAgICAgIGxldCBpbmRleCA9IHR1cmYubmVhcmVzdFBvaW50KHBvaW50LCBwb2x5Z29uUG9pbnRzKS5wcm9wZXJ0aWVzLmZlYXR1cmVJbmRleDtcclxuICAgICAgY29uc3QgdGVzdCA9IHR1cmYuY29vcmRSZWR1Y2UoXHJcbiAgICAgICAgcG9seWdvblBvaW50cyxcclxuICAgICAgICBmdW5jdGlvbihhY2N1bXVsYXRvciwgb2xkUG9pbnQsIGkpIHtcclxuICAgICAgICAgIGlmIChpbmRleCA9PT0gaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludCwgcG9pbnRdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW11cclxuICAgICAgKTtcclxuICAgICAgY29uc29sZS5sb2coJ3Rlc3QnLCB0ZXN0KTtcclxuICAgICAgbmV3UG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtbdGVzdF1dKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBwb3MgPSBbXTtcclxuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGxldCBwb2x5Z29uID0gdHVyZi5wb2x5Z29uKGVsZW1lbnQpO1xyXG4gICAgICAgIC8vIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHBvaW50LCBwb2x5Z29uKVxyXG4gICAgICAgIGlmICh0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbihwb2ludCwgcG9seWdvbikpIHtcclxuICAgICAgICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XHJcbiAgICAgICAgICBsZXQgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykucHJvcGVydGllcy5mZWF0dXJlSW5kZXg7XHJcbiAgICAgICAgICBjb29yZGluYXRlcyA9IHR1cmYuY29vcmRSZWR1Y2UoXHJcbiAgICAgICAgICAgIHBvbHlnb25Qb2ludHMsXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCBvbGRQb2ludCwgaSkge1xyXG4gICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gaSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnQsIHBvaW50XTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnRdO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdjb29yZGluYXRlcycsIGNvb3JkaW5hdGVzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcG9zLnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcG9zLnB1c2goW2Nvb3JkaW5hdGVzXSk7XHJcbiAgICAgIG5ld1BvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihwb3MpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ld1BvbHlnb247XHJcbiAgfVxyXG5cclxuICBwb2x5Z29uRGlmZmVyZW5jZShwb2x5Z29uMTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiwgcG9seWdvbjI6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIGxldCBkaWZmID0gdHVyZi5kaWZmZXJlbmNlKHBvbHlnb24xLCBwb2x5Z29uMik7XHJcbiAgICBjb25zb2xlLmxvZyhkaWZmKTtcclxuICAgIHJldHVybiB0aGlzLmdldFR1cmZQb2x5Z29uKGRpZmYpO1xyXG4gIH1cclxuICBnZXRCb3VuZGluZ0JveENvbXBhc3NQb3NpdGlvbihwb2x5Z29uLCBNYXJrZXJQb3NpdGlvbjogSUNvbXBhc3MsIHVzZU9mZnNldCwgb2Zmc2V0RGlyZWN0aW9uKSB7XHJcbiAgICBjb25zdCBwID0gdGhpcy5nZXRNdWx0aVBvbHlnb24ocG9seWdvbik7XHJcbiAgICBjb25zdCBjb21wYXNzID0gdGhpcy5nZXRCb3VuZGluZ0JveENvbXBhc3MocG9seWdvbik7XHJcbiAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xyXG4gICAgY29uc3QgY29vcmQgPSB0aGlzLmdldENvb3JkKGNvbXBhc3MuZGlyZWN0aW9uLk5vcnRoKTtcclxuICAgIGNvbnN0IG5lYXJlc3RQb2ludCA9IHR1cmYubmVhcmVzdFBvaW50KGNvb3JkLCBwb2x5Z29uUG9pbnRzKTtcclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgcHJpdmF0ZSBnZXRCb3VuZGluZ0JveENvbXBhc3MocG9seWdvbik6IENvbXBhc3Mge1xyXG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0TXVsdGlQb2x5Z29uKHBvbHlnb24pO1xyXG4gICAgY29uc3QgY2VudGVyT2ZNYXNzID0gdHVyZi5jZW50ZXJPZk1hc3MocCk7XHJcbiAgICBjb25zdCBiID0gdHVyZi5iYm94KHApO1xyXG4gICAgY29uc3QgbWluWCA9IGJbMF07XHJcbiAgICBjb25zdCBtaW5ZID0gYlsxXTtcclxuICAgIGNvbnN0IG1heFggPSBiWzJdO1xyXG4gICAgY29uc3QgbWF4WSA9IGJbM107XHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MobWluWCwgbWluWSwgbWF4WCwgbWF4WSk7XHJcbiAgICAvLyBjb21wYXNzLmRpcmVjdGlvbi5DZW50ZXJPZk1hc3MgPSBjZW50ZXJPZk1hc3MuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1bMF07XHJcblxyXG4gICAgcmV0dXJuIGNvbXBhc3M7XHJcbiAgfVxyXG5cclxuICBnZXROZWFyZXN0UG9pbnRJbmRleCh0YXJnZXRQb2ludDogdHVyZi5Db29yZCwgcG9pbnRzOiB0dXJmLkZlYXR1cmVDb2xsZWN0aW9uPHR1cmYuUG9pbnQ+KTogbnVtYmVyIHtcclxuICAgIGxldCBpbmRleCA9IHR1cmYubmVhcmVzdFBvaW50KHRhcmdldFBvaW50LCBwb2ludHMpLnByb3BlcnRpZXMuZmVhdHVyZUluZGV4O1xyXG4gICAgcmV0dXJuIGluZGV4O1xyXG4gIH1cclxuICBnZXRDb29yZChwb2ludDogSUxhdExuZyk6IHR1cmYuQ29vcmQge1xyXG4gICAgY29uc3QgY29vcmQgPSB0dXJmLmdldENvb3JkKFtwb2ludC5sbmcsIHBvaW50LmxhdF0pO1xyXG4gICAgcmV0dXJuIGNvb3JkO1xyXG4gIH1cclxuICBnZXRGZWF0dXJlUG9pbnRDb2xsZWN0aW9uKHBvaW50czogSUxhdExuZ1tdKTogdHVyZi5GZWF0dXJlQ29sbGVjdGlvbiB7XHJcbiAgICBjb25zdCBwdHMgPSBbXTtcclxuICAgIHBvaW50cy5mb3JFYWNoKHYgPT4ge1xyXG4gICAgICBjb25zdCBwID0gdHVyZi5wb2ludChbdi5sbmcsIHYubGF0XSwge30pO1xyXG4gICAgICBwdHMucHVzaChwKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGZjID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihwdHMpO1xyXG5cclxuICAgIHJldHVybiBmYztcclxuICB9XHJcbn0iXX0=