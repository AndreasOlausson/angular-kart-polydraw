import { __decorate, __metadata, __read, __spread } from "tslib";
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
    TurfHelperService.ɵprov = i0.ɵɵdefineInjectable({ factory: function TurfHelperService_Factory() { return new TurfHelperService(); }, token: TurfHelperService, providedIn: "root" });
    TurfHelperService = __decorate([
        Injectable({ providedIn: 'root' }),
        __metadata("design:paramtypes", [])
    ], TurfHelperService);
    return TurfHelperService;
}());
export { TurfHelperService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3BvbHlkcmF3LyIsInNvdXJjZXMiOlsibGliL3R1cmYtaGVscGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxLQUFLLElBQUksTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFDO0FBSXBDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7O0FBSWxDO0lBRUU7UUFEUSxzQkFBaUIsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO0lBQ3ZELENBQUM7SUFFaEIsaUNBQUssR0FBTCxVQUFNLEtBQUssRUFBRSxLQUFLO1FBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTlCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXJDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsMENBQWMsR0FBZCxVQUFlLE9BQXdDO1FBQ3JELHdDQUF3QztRQUN4QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRW5DLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQXRCLENBQXNCLENBQUMsQ0FBQztRQUNyRSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFVBQVUs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QWlCO1FBRDdCLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQzs7T0FDdEIsaUJBQWlCLENBMk83Qjs0QkF0UEQ7Q0FzUEMsQUEzT0QsSUEyT0M7U0EzT1ksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0ICogYXMgdHVyZiBmcm9tICdAdHVyZi90dXJmJztcclxuaW1wb3J0IGNvbmNhdmVtYW4gZnJvbSAnY29uY2F2ZW1hbic7XHJcbmltcG9ydCB7IEZlYXR1cmUsIFBvbHlnb24sIE11bHRpUG9seWdvbiwgUG9zaXRpb24gfSBmcm9tICdAdHVyZi90dXJmJztcclxuaW1wb3J0IHsgTWFya2VyUG9zaXRpb24gfSBmcm9tICcuL2VudW1zJztcclxuaW1wb3J0IHsgSUNvbXBhc3MgfSBmcm9tICcuL2ludGVyZmFjZSc7XHJcbmltcG9ydCB7IENvbXBhc3MgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBUdXJmSGVscGVyU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBzaW1wbGlmeVRvbGVyYW5jZSA9IHsgdG9sZXJhbmNlOiAwLjAwMDEsIGhpZ2hRdWFsaXR5OiBmYWxzZSB9O1xyXG4gIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgdW5pb24ocG9seTEsIHBvbHkyKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBjb25zb2xlLmxvZygncG9seTE6ICcsIHBvbHkxKTtcclxuICAgIGNvbnNvbGUubG9nKCdwb2x5MjogJywgcG9seTIpO1xyXG5cclxuICAgIGxldCB1bmlvbiA9IHR1cmYudW5pb24ocG9seTEsIHBvbHkyKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5nZXRUdXJmUG9seWdvbih1bmlvbik7XHJcbiAgfVxyXG5cclxuICB0dXJmQ29uY2F2ZW1hbihmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICAvL2NvbnNvbGUubG9nKFwidHVyZkNvbmNhdmVtYW5cIiwgcG9pbnRzKTtcclxuICAgIGxldCBwb2ludHMgPSB0dXJmLmV4cGxvZGUoZmVhdHVyZSk7XHJcblxyXG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBwb2ludHMuZmVhdHVyZXMubWFwKGYgPT4gZi5nZW9tZXRyeS5jb29yZGluYXRlcyk7XHJcbiAgICByZXR1cm4gdHVyZi5tdWx0aVBvbHlnb24oW1tjb25jYXZlbWFuKGNvb3JkaW5hdGVzKV1dKTtcclxuICB9XHJcblxyXG5cclxuICAvL1RPRE8gYWRkIHNvbWUgc29ydCBvZiBkeW5hbWljIHRvbGVyYW5jZVxyXG4gIGdldFNpbXBsaWZpZWQocG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPik6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgY29uc3QgdG9sZXJhbmNlID0gdGhpcy5zaW1wbGlmeVRvbGVyYW5jZTtcclxuICAgIGNvbnN0IHNpbXBsaWZpZWQgPSB0dXJmLnNpbXBsaWZ5KHBvbHlnb24sIHRvbGVyYW5jZSk7XHJcbiAgICByZXR1cm4gc2ltcGxpZmllZDtcclxuICB9XHJcblxyXG4gIGdldFR1cmZQb2x5Z29uKHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIGxldCB0dXJmUG9seWdvbjtcclxuICAgIGNvbnNvbGUubG9nKCdHZXQgVHVyZlBvbHlnb246JywgcG9seWdvbik7XHJcbiAgICAvLyBpZiAocG9seWdvbi5nZW9tZXRyeSlcclxuICAgIGlmIChwb2x5Z29uLmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJykge1xyXG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtwb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKHBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHR1cmZQb2x5Z29uO1xyXG4gIH1cclxuXHJcbiAgZ2V0TXVsdGlQb2x5Z29uKHBvbHlnb25BcnJheTogUG9zaXRpb25bXVtdW10pOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIHJldHVybiB0dXJmLm11bHRpUG9seWdvbihwb2x5Z29uQXJyYXkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0S2lua3MoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3QgdW5raW5rID0gdHVyZi51bmtpbmtQb2x5Z29uKGZlYXR1cmUpO1xyXG4gICAgbGV0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICB0dXJmLmZlYXR1cmVFYWNoKHVua2luaywgY3VycmVudCA9PiB7XHJcbiAgICAgIGNvb3JkaW5hdGVzLnB1c2goY3VycmVudCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gY29vcmRpbmF0ZXM7XHJcbiAgfVxyXG5cclxuICBnZXRDb29yZHMoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgcmV0dXJuIHR1cmYuZ2V0Q29vcmRzKGZlYXR1cmUpO1xyXG4gIH1cclxuXHJcbiAgaGFzS2lua3MoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3Qga2lua3MgPSB0dXJmLmtpbmtzKGZlYXR1cmUpO1xyXG4gICAgcmV0dXJuIGtpbmtzLmZlYXR1cmVzLmxlbmd0aCA+IDA7XHJcbiAgfVxyXG5cclxuICBwb2x5Z29uSW50ZXJzZWN0KHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pOiBib29sZWFuIHtcclxuICAgIC8vIGNvbnN0IG9sZFBvbHlnb24gPSBwb2x5Z29uLnRvR2VvSlNPTigpO1xyXG4gICAgbGV0IHBvbHkgPSBbXTtcclxuICAgIGxldCBwb2x5MiA9IFtdO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCdwb2x5Z29uSW50ZXJzZWN0JywgcG9seWdvbiwgbGF0bG5ncyk7XHJcblxyXG4gICAgbGV0IGxhdGxuZ3NDb29yZHMgPSB0dXJmLmdldENvb3JkcyhsYXRsbmdzKTtcclxuICAgIGxhdGxuZ3NDb29yZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgbGV0IGZlYXQgPSB7IHR5cGU6ICdQb2x5Z29uJywgY29vcmRpbmF0ZXM6IFtlbGVtZW50WzBdXSB9O1xyXG5cclxuICAgICAgcG9seS5wdXNoKGZlYXQpO1xyXG4gICAgfSk7XHJcbiAgICBsZXQgcG9seWdvbkNvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKHBvbHlnb24pO1xyXG4gICAgcG9seWdvbkNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICBsZXQgZmVhdCA9IHsgdHlwZTogJ1BvbHlnb24nLCBjb29yZGluYXRlczogW2VsZW1lbnRbMF1dIH07XHJcblxyXG4gICAgICBwb2x5Mi5wdXNoKGZlYXQpO1xyXG4gICAgfSk7XHJcbiAgICBsZXQgaW50ZXJzZWN0ID0gZmFsc2U7XHJcbiAgICBsb29wMTogZm9yIChsZXQgaSA9IDA7IGkgPCBwb2x5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmICh0aGlzLmdldEtpbmtzKHBvbHlbaV0pLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvbHkyLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5nZXRLaW5rcyhwb2x5MltqXSkubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICBpbnRlcnNlY3QgPSAhIXR1cmYuaW50ZXJzZWN0KHBvbHlbaV0sIHBvbHkyW2pdKTtcclxuICAgICAgICAgICAgaWYgKGludGVyc2VjdCkge1xyXG4gICAgICAgICAgICAgIGJyZWFrIGxvb3AxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGludGVyc2VjdDtcclxuICB9XHJcblxyXG4gIGdldEludGVyc2VjdGlvbihwb2x5MSwgcG9seTIpOiBGZWF0dXJlIHtcclxuICAgIHJldHVybiB0dXJmLmludGVyc2VjdChwb2x5MSwgcG9seTIpO1xyXG4gIH1cclxuICBnZXREaXN0YW5jZShwb2ludDEsIHBvaW50Mik6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdHVyZi5kaXN0YW5jZShwb2ludDEsIHBvaW50Mik7XHJcbiAgfVxyXG5cclxuICBpc1dpdGhpbihwb2x5Z29uMTogUG9zaXRpb25bXSwgcG9seWdvbjI6IFBvc2l0aW9uW10pOiBib29sZWFuIHtcclxuICAgIGNvbnNvbGUubG9nKHBvbHlnb24xKTtcclxuICAgIGNvbnNvbGUubG9nKCdZdHJlOiAnLCBwb2x5Z29uMik7XHJcbiAgICByZXR1cm4gdHVyZi5ib29sZWFuV2l0aGluKHR1cmYucG9seWdvbihbcG9seWdvbjFdKSwgdHVyZi5wb2x5Z29uKFtwb2x5Z29uMl0pKTtcclxuICB9XHJcblxyXG4gIGVxdWFsUG9seWdvbnMocG9seWdvbjE6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sIHBvbHlnb24yOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMSk7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMik7XHJcbiAgICBjb25zb2xlLmxvZyh0dXJmLmJvb2xlYW5FcXVhbChwb2x5Z29uMSwgcG9seWdvbjIpKTtcclxuICB9XHJcbiAgLy9UT0RPIG9wdGlvbmFsIGFkZCBleHRyYSBtYXJrZXJzIGZvciBOIEUgUyBXIChXZSBoYXZlIHRoZSBjb3JuZXJzIE5XLCBORSwgU0UsIFNXKVxyXG4gIGNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LCBhZGRNaWRwb2ludE1hcmtlcnM6IGJvb2xlYW4gPSBmYWxzZSk6IEZlYXR1cmU8UG9seWdvbj4ge1xyXG4gICAgY29uc3QgYmJveCA9IHR1cmYuYmJveChwb2x5Z29uLmdlb21ldHJ5KTtcclxuICAgIGNvbnN0IGJib3hQb2x5Z29uID0gdHVyZi5iYm94UG9seWdvbihiYm94KTtcclxuXHJcblxyXG4gICAgY29uc3QgY29tcGFzcyA9IG5ldyBDb21wYXNzKGJib3hbMV0sIGJib3hbMF0sIGJib3hbM10sIGJib3hbMl0pO1xyXG5cclxuICAgIGNvbnN0IGNvbXBhc3NQb3NpdGlvbnMgPSBjb21wYXNzLmdldFBvc2l0aW9ucygpO1xyXG5cclxuICAgIGJib3hQb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzID0gW107XHJcbiAgICBiYm94UG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyA9IFtjb21wYXNzUG9zaXRpb25zXTtcclxuXHJcbiAgICByZXR1cm4gYmJveFBvbHlnb247XHJcbiAgfVxyXG4gIHBvbHlnb25Ub011bHRpUG9seWdvbihwb2x5OiBGZWF0dXJlPFBvbHlnb24+KTogRmVhdHVyZTxNdWx0aVBvbHlnb24+IHtcclxuICAgIGNvbnN0IG11bHRpID0gdHVyZi5tdWx0aVBvbHlnb24oW3BvbHkuZ2VvbWV0cnkuY29vcmRpbmF0ZXNdKTtcclxuICAgIHJldHVybiBtdWx0aTtcclxuICB9XHJcbiAgLy9UT0RPIC1jbGVhbnVwXHJcbiAgaW5qZWN0UG9pbnRUb1BvbHlnb24ocG9seWdvbiwgcG9pbnQpIHtcclxuICAgIGxldCBjb29yZHMgPSB0dXJmLmdldENvb3Jkcyhwb2x5Z29uKTtcclxuICAgIGxldCBuZXdQb2x5Z29uO1xyXG4gICAgY29uc29sZS5sb2coJ3BvbHlnb246ICcsIHBvbHlnb24pO1xyXG4gICAgaWYgKGNvb3Jkcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XHJcbiAgICAgIGNvbnNvbGUubG9nKHR1cmYubmVhcmVzdFBvaW50KHBvaW50LCBwb2x5Z29uUG9pbnRzKSk7XHJcbiAgICAgIGxldCBpbmRleCA9IHR1cmYubmVhcmVzdFBvaW50KHBvaW50LCBwb2x5Z29uUG9pbnRzKS5wcm9wZXJ0aWVzLmZlYXR1cmVJbmRleDtcclxuICAgICAgY29uc3QgdGVzdCA9IHR1cmYuY29vcmRSZWR1Y2UoXHJcbiAgICAgICAgcG9seWdvblBvaW50cyxcclxuICAgICAgICBmdW5jdGlvbihhY2N1bXVsYXRvciwgb2xkUG9pbnQsIGkpIHtcclxuICAgICAgICAgIGlmIChpbmRleCA9PT0gaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludCwgcG9pbnRdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW11cclxuICAgICAgKTtcclxuICAgICAgY29uc29sZS5sb2coJ3Rlc3QnLCB0ZXN0KTtcclxuICAgICAgbmV3UG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtbdGVzdF1dKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBwb3MgPSBbXTtcclxuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGxldCBwb2x5Z29uID0gdHVyZi5wb2x5Z29uKGVsZW1lbnQpO1xyXG4gICAgICAgIC8vIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHBvaW50LCBwb2x5Z29uKVxyXG4gICAgICAgIGlmICh0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbihwb2ludCwgcG9seWdvbikpIHtcclxuICAgICAgICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XHJcbiAgICAgICAgICBsZXQgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykucHJvcGVydGllcy5mZWF0dXJlSW5kZXg7XHJcbiAgICAgICAgICBjb29yZGluYXRlcyA9IHR1cmYuY29vcmRSZWR1Y2UoXHJcbiAgICAgICAgICAgIHBvbHlnb25Qb2ludHMsXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCBvbGRQb2ludCwgaSkge1xyXG4gICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gaSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnQsIHBvaW50XTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnRdO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdjb29yZGluYXRlcycsIGNvb3JkaW5hdGVzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcG9zLnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcG9zLnB1c2goW2Nvb3JkaW5hdGVzXSk7XHJcbiAgICAgIG5ld1BvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihwb3MpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ld1BvbHlnb247XHJcbiAgfVxyXG5cclxuICBwb2x5Z29uRGlmZmVyZW5jZShwb2x5Z29uMTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiwgcG9seWdvbjI6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIGxldCBkaWZmID0gdHVyZi5kaWZmZXJlbmNlKHBvbHlnb24xLCBwb2x5Z29uMik7XHJcbiAgICBjb25zb2xlLmxvZyhkaWZmKTtcclxuICAgIHJldHVybiB0aGlzLmdldFR1cmZQb2x5Z29uKGRpZmYpO1xyXG4gIH1cclxuICBnZXRCb3VuZGluZ0JveENvbXBhc3NQb3NpdGlvbihwb2x5Z29uLCBNYXJrZXJQb3NpdGlvbjogSUNvbXBhc3MsIHVzZU9mZnNldCwgb2Zmc2V0RGlyZWN0aW9uKSB7XHJcbiAgICBjb25zdCBwID0gdGhpcy5nZXRNdWx0aVBvbHlnb24ocG9seWdvbik7XHJcbiAgICBjb25zdCBjb21wYXNzID0gdGhpcy5nZXRCb3VuZGluZ0JveENvbXBhc3MocG9seWdvbik7XHJcbiAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xyXG4gICAgY29uc3QgY29vcmQgPSB0aGlzLmdldENvb3JkKGNvbXBhc3MuZGlyZWN0aW9uLk5vcnRoKTtcclxuICAgIGNvbnN0IG5lYXJlc3RQb2ludCA9IHR1cmYubmVhcmVzdFBvaW50KGNvb3JkLCBwb2x5Z29uUG9pbnRzKTtcclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgcHJpdmF0ZSBnZXRCb3VuZGluZ0JveENvbXBhc3MocG9seWdvbik6IENvbXBhc3Mge1xyXG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0TXVsdGlQb2x5Z29uKHBvbHlnb24pO1xyXG4gICAgY29uc3QgY2VudGVyT2ZNYXNzID0gdHVyZi5jZW50ZXJPZk1hc3MocCk7XHJcbiAgICBjb25zdCBiID0gdHVyZi5iYm94KHApO1xyXG4gICAgY29uc3QgbWluWCA9IGJbMF07XHJcbiAgICBjb25zdCBtaW5ZID0gYlsxXTtcclxuICAgIGNvbnN0IG1heFggPSBiWzJdO1xyXG4gICAgY29uc3QgbWF4WSA9IGJbM107XHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MobWluWCwgbWluWSwgbWF4WCwgbWF4WSk7XHJcbiAgICAvLyBjb21wYXNzLmRpcmVjdGlvbi5DZW50ZXJPZk1hc3MgPSBjZW50ZXJPZk1hc3MuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1bMF07XHJcblxyXG4gICAgcmV0dXJuIGNvbXBhc3M7XHJcbiAgfVxyXG5cclxuICBnZXROZWFyZXN0UG9pbnRJbmRleCh0YXJnZXRQb2ludDogdHVyZi5Db29yZCwgcG9pbnRzOiB0dXJmLkZlYXR1cmVDb2xsZWN0aW9uPHR1cmYuUG9pbnQ+KTogbnVtYmVyIHtcclxuICAgIGxldCBpbmRleCA9IHR1cmYubmVhcmVzdFBvaW50KHRhcmdldFBvaW50LCBwb2ludHMpLnByb3BlcnRpZXMuZmVhdHVyZUluZGV4O1xyXG4gICAgcmV0dXJuIGluZGV4O1xyXG4gIH1cclxuICBnZXRDb29yZChwb2ludDogSUxhdExuZyk6IHR1cmYuQ29vcmQge1xyXG4gICAgY29uc3QgY29vcmQgPSB0dXJmLmdldENvb3JkKFtwb2ludC5sbmcsIHBvaW50LmxhdF0pO1xyXG4gICAgcmV0dXJuIGNvb3JkO1xyXG4gIH1cclxuICBnZXRGZWF0dXJlUG9pbnRDb2xsZWN0aW9uKHBvaW50czogSUxhdExuZ1tdKTogdHVyZi5GZWF0dXJlQ29sbGVjdGlvbiB7XHJcbiAgICBjb25zdCBwdHMgPSBbXTtcclxuICAgIHBvaW50cy5mb3JFYWNoKHYgPT4ge1xyXG4gICAgICBjb25zdCBwID0gdHVyZi5wb2ludChbdi5sbmcsIHYubGF0XSwge30pO1xyXG4gICAgICBwdHMucHVzaChwKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGZjID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihwdHMpO1xyXG5cclxuICAgIHJldHVybiBmYztcclxuICB9XHJcbn0iXX0=