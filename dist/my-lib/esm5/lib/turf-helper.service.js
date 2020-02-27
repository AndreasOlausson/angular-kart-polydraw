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
        var _a, _b;
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
                        var test = turf.intersect(poly[i], poly2[j]);
                        if (((_a = test) === null || _a === void 0 ? void 0 : _a.geometry.type) === 'Point') {
                            intersect = !(turf.booleanPointInPolygon(test, poly[i]) &&
                                turf.booleanPointInPolygon(test, poly2[j]));
                            console.log('Intersect test: ');
                        }
                        else if (((_b = test) === null || _b === void 0 ? void 0 : _b.geometry.type) === 'Polygon') {
                            intersect = !!turf.intersect(poly[i], poly2[j]);
                        }
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
            var index_1 = turf.nearestPoint(point, polygonPoints).properties
                .featureIndex;
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
                    var index_2 = turf.nearestPoint(point, polygonPoints).properties
                        .featureIndex;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi90dXJmLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUlwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDOztBQUlsQztJQUVFO1FBRFEsc0JBQWlCLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRWhCLGlDQUFLLEdBQUwsVUFBTSxLQUFLLEVBQUUsS0FBSztRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU5QixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDBDQUFjLEdBQWQsVUFDRSxPQUF3QztRQUV4Qyx3Q0FBd0M7UUFDeEMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVyQyxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDckUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLENB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QyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QscURBQXlCLEdBQXpCLFVBQTBCLE1BQWlCO1FBQ3pDLElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO1lBQ2QsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztRQUVILElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV2QyxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7O0lBblJVLGlCQUFpQjtRQUQ3QixVQUFVLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7O09BQ3RCLGlCQUFpQixDQW9SN0I7NEJBL1JEO0NBK1JDLEFBcFJELElBb1JDO1NBcFJZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCAqIGFzIHR1cmYgZnJvbSAnQHR1cmYvdHVyZic7XHJcbmltcG9ydCBjb25jYXZlbWFuIGZyb20gJ2NvbmNhdmVtYW4nO1xyXG5pbXBvcnQgeyBGZWF0dXJlLCBQb2x5Z29uLCBNdWx0aVBvbHlnb24sIFBvc2l0aW9uIH0gZnJvbSAnQHR1cmYvdHVyZic7XHJcbmltcG9ydCB7IE1hcmtlclBvc2l0aW9uIH0gZnJvbSAnLi9lbnVtcyc7XHJcbmltcG9ydCB7IElDb21wYXNzIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBDb21wYXNzIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tICcuL3BvbHlnb24taGVscGVycyc7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxyXG5leHBvcnQgY2xhc3MgVHVyZkhlbHBlclNlcnZpY2Uge1xyXG4gIHByaXZhdGUgc2ltcGxpZnlUb2xlcmFuY2UgPSB7IHRvbGVyYW5jZTogMC4wMDAxLCBoaWdoUXVhbGl0eTogZmFsc2UgfTtcclxuICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gIHVuaW9uKHBvbHkxLCBwb2x5Mik6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgY29uc29sZS5sb2coJ3BvbHkxOiAnLCBwb2x5MSk7XHJcbiAgICBjb25zb2xlLmxvZygncG9seTI6ICcsIHBvbHkyKTtcclxuXHJcbiAgICBjb25zdCB1bmlvbiA9IHR1cmYudW5pb24ocG9seTEsIHBvbHkyKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5nZXRUdXJmUG9seWdvbih1bmlvbik7XHJcbiAgfVxyXG5cclxuICB0dXJmQ29uY2F2ZW1hbihcclxuICAgIGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cclxuICApOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIC8vY29uc29sZS5sb2coXCJ0dXJmQ29uY2F2ZW1hblwiLCBwb2ludHMpO1xyXG4gICAgY29uc3QgcG9pbnRzID0gdHVyZi5leHBsb2RlKGZlYXR1cmUpO1xyXG5cclxuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gcG9pbnRzLmZlYXR1cmVzLm1hcChmID0+IGYuZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xyXG4gICAgcmV0dXJuIHR1cmYubXVsdGlQb2x5Z29uKFtbY29uY2F2ZW1hbihjb29yZGluYXRlcyldXSk7XHJcbiAgfVxyXG5cclxuICAvL1RPRE8gYWRkIHNvbWUgc29ydCBvZiBkeW5hbWljIHRvbGVyYW5jZVxyXG4gIGdldFNpbXBsaWZpZWQoXHJcbiAgICBwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBjb25zdCB0b2xlcmFuY2UgPSB0aGlzLnNpbXBsaWZ5VG9sZXJhbmNlO1xyXG4gICAgY29uc3Qgc2ltcGxpZmllZCA9IHR1cmYuc2ltcGxpZnkocG9seWdvbiwgdG9sZXJhbmNlKTtcclxuICAgIHJldHVybiBzaW1wbGlmaWVkO1xyXG4gIH1cclxuXHJcbiAgZ2V0VHVyZlBvbHlnb24oXHJcbiAgICBwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBsZXQgdHVyZlBvbHlnb247XHJcbiAgICBjb25zb2xlLmxvZygnR2V0IFR1cmZQb2x5Z29uOicsIHBvbHlnb24pO1xyXG4gICAgLy8gaWYgKHBvbHlnb24uZ2VvbWV0cnkpXHJcbiAgICBpZiAocG9seWdvbi5nZW9tZXRyeS50eXBlID09PSAnUG9seWdvbicpIHtcclxuICAgICAgdHVyZlBvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihbcG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlc10pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHVyZlBvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihwb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0dXJmUG9seWdvbjtcclxuICB9XHJcblxyXG4gIGdldE11bHRpUG9seWdvbihcclxuICAgIHBvbHlnb25BcnJheTogUG9zaXRpb25bXVtdW11cclxuICApOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIHJldHVybiB0dXJmLm11bHRpUG9seWdvbihwb2x5Z29uQXJyYXkpO1xyXG4gIH1cclxuXHJcbiAgZ2V0S2lua3MoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3QgdW5raW5rID0gdHVyZi51bmtpbmtQb2x5Z29uKGZlYXR1cmUpO1xyXG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgIHR1cmYuZmVhdHVyZUVhY2godW5raW5rLCBjdXJyZW50ID0+IHtcclxuICAgICAgY29vcmRpbmF0ZXMucHVzaChjdXJyZW50KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBjb29yZGluYXRlcztcclxuICB9XHJcblxyXG4gIGdldENvb3JkcyhmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICByZXR1cm4gdHVyZi5nZXRDb29yZHMoZmVhdHVyZSk7XHJcbiAgfVxyXG5cclxuICBoYXNLaW5rcyhmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zdCBraW5rcyA9IHR1cmYua2lua3MoZmVhdHVyZSk7XHJcbiAgICByZXR1cm4ga2lua3MuZmVhdHVyZXMubGVuZ3RoID4gMDtcclxuICB9XHJcblxyXG4gIHBvbHlnb25JbnRlcnNlY3QoXHJcbiAgICBwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICk6IGJvb2xlYW4ge1xyXG4gICAgLy8gY29uc3Qgb2xkUG9seWdvbiA9IHBvbHlnb24udG9HZW9KU09OKCk7XHJcbiAgICBjb25zdCBwb2x5ID0gW107XHJcbiAgICBjb25zdCBwb2x5MiA9IFtdO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCdwb2x5Z29uSW50ZXJzZWN0JywgcG9seWdvbiwgbGF0bG5ncyk7XHJcblxyXG4gICAgY29uc3QgbGF0bG5nc0Nvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKGxhdGxuZ3MpO1xyXG4gICAgbGF0bG5nc0Nvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICBjb25zdCBmZWF0ID0geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbZWxlbWVudFswXV0gfTtcclxuXHJcbiAgICAgIHBvbHkucHVzaChmZWF0KTtcclxuICAgIH0pO1xyXG4gICAgY29uc3QgcG9seWdvbkNvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKHBvbHlnb24pO1xyXG4gICAgcG9seWdvbkNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICBjb25zdCBmZWF0ID0geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbZWxlbWVudFswXV0gfTtcclxuXHJcbiAgICAgIHBvbHkyLnB1c2goZmVhdCk7XHJcbiAgICB9KTtcclxuICAgIGxldCBpbnRlcnNlY3QgPSBmYWxzZTtcclxuICAgIGxvb3AxOiBmb3IgKGxldCBpID0gMDsgaSA8IHBvbHkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMuZ2V0S2lua3MocG9seVtpXSkubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9seTIubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgIGlmICh0aGlzLmdldEtpbmtzKHBvbHkyW2pdKS5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlc3QgPSB0dXJmLmludGVyc2VjdChwb2x5W2ldLCBwb2x5MltqXSk7XHJcbiAgICAgICAgICAgIGlmICh0ZXN0Py5nZW9tZXRyeS50eXBlID09PSAnUG9pbnQnKSB7XHJcbiAgICAgICAgICAgICAgaW50ZXJzZWN0ID0gIShcclxuICAgICAgICAgICAgICAgIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHRlc3QsIHBvbHlbaV0pICYmXHJcbiAgICAgICAgICAgICAgICB0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbih0ZXN0LCBwb2x5MltqXSlcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbnRlcnNlY3QgdGVzdDogJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGVzdD8uZ2VvbWV0cnkudHlwZSA9PT0gJ1BvbHlnb24nKSB7XHJcbiAgICAgICAgICAgICAgaW50ZXJzZWN0ID0gISF0dXJmLmludGVyc2VjdChwb2x5W2ldLCBwb2x5MltqXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpbnRlcnNlY3QpIHtcclxuICAgICAgICAgICAgICBicmVhayBsb29wMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpbnRlcnNlY3Q7XHJcbiAgfVxyXG5cclxuICBnZXRJbnRlcnNlY3Rpb24ocG9seTEsIHBvbHkyKTogRmVhdHVyZSB7XHJcbiAgICByZXR1cm4gdHVyZi5pbnRlcnNlY3QocG9seTEsIHBvbHkyKTtcclxuICB9XHJcbiAgZ2V0RGlzdGFuY2UocG9pbnQxLCBwb2ludDIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHR1cmYuZGlzdGFuY2UocG9pbnQxLCBwb2ludDIpO1xyXG4gIH1cclxuXHJcbiAgaXNXaXRoaW4ocG9seWdvbjE6IFBvc2l0aW9uW10sIHBvbHlnb24yOiBQb3NpdGlvbltdKTogYm9vbGVhbiB7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMSk7XHJcbiAgICBjb25zb2xlLmxvZygnWXRyZTogJywgcG9seWdvbjIpO1xyXG4gICAgcmV0dXJuIHR1cmYuYm9vbGVhbldpdGhpbihcclxuICAgICAgdHVyZi5wb2x5Z29uKFtwb2x5Z29uMV0pLFxyXG4gICAgICB0dXJmLnBvbHlnb24oW3BvbHlnb24yXSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBlcXVhbFBvbHlnb25zKFxyXG4gICAgcG9seWdvbjE6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBwb2x5Z29uMjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICkge1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbjEpO1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbjIpO1xyXG4gICAgY29uc29sZS5sb2codHVyZi5ib29sZWFuRXF1YWwocG9seWdvbjEsIHBvbHlnb24yKSk7XHJcbiAgfVxyXG4gIC8vVE9ETyBvcHRpb25hbCBhZGQgZXh0cmEgbWFya2VycyBmb3IgTiBFIFMgVyAoV2UgaGF2ZSB0aGUgY29ybmVycyBOVywgTkUsIFNFLCBTVylcclxuICBjb252ZXJ0VG9Cb3VuZGluZ0JveFBvbHlnb24oXHJcbiAgICBwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgYWRkTWlkcG9pbnRNYXJrZXJzOiBib29sZWFuID0gZmFsc2VcclxuICApOiBGZWF0dXJlPFBvbHlnb24+IHtcclxuICAgIGNvbnN0IGJib3ggPSB0dXJmLmJib3gocG9seWdvbi5nZW9tZXRyeSk7XHJcbiAgICBjb25zdCBiYm94UG9seWdvbiA9IHR1cmYuYmJveFBvbHlnb24oYmJveCk7XHJcblxyXG4gICAgY29uc3QgY29tcGFzcyA9IG5ldyBDb21wYXNzKGJib3hbMV0sIGJib3hbMF0sIGJib3hbM10sIGJib3hbMl0pO1xyXG5cclxuICAgIGNvbnN0IGNvbXBhc3NQb3NpdGlvbnMgPSBjb21wYXNzLmdldFBvc2l0aW9ucygpO1xyXG5cclxuICAgIGJib3hQb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzID0gW107XHJcbiAgICBiYm94UG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyA9IFtjb21wYXNzUG9zaXRpb25zXTtcclxuXHJcbiAgICByZXR1cm4gYmJveFBvbHlnb247XHJcbiAgfVxyXG4gIHBvbHlnb25Ub011bHRpUG9seWdvbihwb2x5OiBGZWF0dXJlPFBvbHlnb24+KTogRmVhdHVyZTxNdWx0aVBvbHlnb24+IHtcclxuICAgIGNvbnN0IG11bHRpID0gdHVyZi5tdWx0aVBvbHlnb24oW3BvbHkuZ2VvbWV0cnkuY29vcmRpbmF0ZXNdKTtcclxuICAgIHJldHVybiBtdWx0aTtcclxuICB9XHJcbiAgLy9UT0RPIC1jbGVhbnVwXHJcbiAgaW5qZWN0UG9pbnRUb1BvbHlnb24ocG9seWdvbiwgcG9pbnQpIHtcclxuICAgIGNvbnN0IGNvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKHBvbHlnb24pO1xyXG4gICAgbGV0IG5ld1BvbHlnb247XHJcbiAgICBjb25zb2xlLmxvZygncG9seWdvbjogJywgcG9seWdvbik7XHJcbiAgICBpZiAoY29vcmRzLmxlbmd0aCA8IDIpIHtcclxuICAgICAgY29uc3QgcG9seWdvblBvaW50cyA9IHR1cmYuZXhwbG9kZShwb2x5Z29uKTtcclxuICAgICAgY29uc29sZS5sb2codHVyZi5uZWFyZXN0UG9pbnQocG9pbnQsIHBvbHlnb25Qb2ludHMpKTtcclxuICAgICAgY29uc3QgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykucHJvcGVydGllc1xyXG4gICAgICAgIC5mZWF0dXJlSW5kZXg7XHJcbiAgICAgIGNvbnN0IHRlc3QgPSB0dXJmLmNvb3JkUmVkdWNlKFxyXG4gICAgICAgIHBvbHlnb25Qb2ludHMsXHJcbiAgICAgICAgZnVuY3Rpb24oYWNjdW11bGF0b3IsIG9sZFBvaW50LCBpKSB7XHJcbiAgICAgICAgICBpZiAoaW5kZXggPT09IGkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnQsIHBvaW50XTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50XTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFtdXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCd0ZXN0JywgdGVzdCk7XHJcbiAgICAgIG5ld1BvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihbW3Rlc3RdXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBwb3MgPSBbXTtcclxuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBvbHlnb24gPSB0dXJmLnBvbHlnb24oZWxlbWVudCk7XHJcbiAgICAgICAgLy8gdHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pXHJcbiAgICAgICAgaWYgKHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHBvaW50LCBwb2x5Z29uKSkge1xyXG4gICAgICAgICAgY29uc3QgcG9seWdvblBvaW50cyA9IHR1cmYuZXhwbG9kZShwb2x5Z29uKTtcclxuICAgICAgICAgIGNvbnN0IGluZGV4ID0gdHVyZi5uZWFyZXN0UG9pbnQocG9pbnQsIHBvbHlnb25Qb2ludHMpLnByb3BlcnRpZXNcclxuICAgICAgICAgICAgLmZlYXR1cmVJbmRleDtcclxuICAgICAgICAgIGNvb3JkaW5hdGVzID0gdHVyZi5jb29yZFJlZHVjZShcclxuICAgICAgICAgICAgcG9seWdvblBvaW50cyxcclxuICAgICAgICAgICAgZnVuY3Rpb24oYWNjdW11bGF0b3IsIG9sZFBvaW50LCBpKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSBpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludCwgcG9pbnRdO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludF07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtdXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2Nvb3JkaW5hdGVzJywgY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwb3MucHVzaChlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBwb3MucHVzaChbY29vcmRpbmF0ZXNdKTtcclxuICAgICAgbmV3UG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKHBvcyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3UG9seWdvbjtcclxuICB9XHJcblxyXG4gIHBvbHlnb25EaWZmZXJlbmNlKFxyXG4gICAgcG9seWdvbjE6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBwb2x5Z29uMjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgY29uc3QgZGlmZiA9IHR1cmYuZGlmZmVyZW5jZShwb2x5Z29uMSwgcG9seWdvbjIpO1xyXG4gICAgY29uc29sZS5sb2coZGlmZik7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRUdXJmUG9seWdvbihkaWZmKTtcclxuICB9XHJcbiAgZ2V0Qm91bmRpbmdCb3hDb21wYXNzUG9zaXRpb24oXHJcbiAgICBwb2x5Z29uLFxyXG4gICAgTWFya2VyUG9zaXRpb246IElDb21wYXNzLFxyXG4gICAgdXNlT2Zmc2V0LFxyXG4gICAgb2Zmc2V0RGlyZWN0aW9uXHJcbiAgKSB7XHJcbiAgICBjb25zdCBwID0gdGhpcy5nZXRNdWx0aVBvbHlnb24ocG9seWdvbik7XHJcbiAgICBjb25zdCBjb21wYXNzID0gdGhpcy5nZXRCb3VuZGluZ0JveENvbXBhc3MocG9seWdvbik7XHJcbiAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xyXG4gICAgY29uc3QgY29vcmQgPSB0aGlzLmdldENvb3JkKGNvbXBhc3MuZGlyZWN0aW9uLk5vcnRoKTtcclxuICAgIGNvbnN0IG5lYXJlc3RQb2ludCA9IHR1cmYubmVhcmVzdFBvaW50KGNvb3JkLCBwb2x5Z29uUG9pbnRzKTtcclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgcHJpdmF0ZSBnZXRCb3VuZGluZ0JveENvbXBhc3MocG9seWdvbik6IENvbXBhc3Mge1xyXG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0TXVsdGlQb2x5Z29uKHBvbHlnb24pO1xyXG4gICAgY29uc3QgY2VudGVyT2ZNYXNzID0gdHVyZi5jZW50ZXJPZk1hc3MocCk7XHJcbiAgICBjb25zdCBiID0gdHVyZi5iYm94KHApO1xyXG4gICAgY29uc3QgbWluWCA9IGJbMF07XHJcbiAgICBjb25zdCBtaW5ZID0gYlsxXTtcclxuICAgIGNvbnN0IG1heFggPSBiWzJdO1xyXG4gICAgY29uc3QgbWF4WSA9IGJbM107XHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MobWluWCwgbWluWSwgbWF4WCwgbWF4WSk7XHJcbiAgICAvLyBjb21wYXNzLmRpcmVjdGlvbi5DZW50ZXJPZk1hc3MgPSBjZW50ZXJPZk1hc3MuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1bMF07XHJcblxyXG4gICAgcmV0dXJuIGNvbXBhc3M7XHJcbiAgfVxyXG5cclxuICBnZXROZWFyZXN0UG9pbnRJbmRleChcclxuICAgIHRhcmdldFBvaW50OiB0dXJmLkNvb3JkLFxyXG4gICAgcG9pbnRzOiB0dXJmLkZlYXR1cmVDb2xsZWN0aW9uPHR1cmYuUG9pbnQ+XHJcbiAgKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGluZGV4ID0gdHVyZi5uZWFyZXN0UG9pbnQodGFyZ2V0UG9pbnQsIHBvaW50cykucHJvcGVydGllcy5mZWF0dXJlSW5kZXg7XHJcbiAgICByZXR1cm4gaW5kZXg7XHJcbiAgfVxyXG4gIGdldENvb3JkKHBvaW50OiBJTGF0TG5nKTogdHVyZi5Db29yZCB7XHJcbiAgICBjb25zdCBjb29yZCA9IHR1cmYuZ2V0Q29vcmQoW3BvaW50LmxuZywgcG9pbnQubGF0XSk7XHJcbiAgICByZXR1cm4gY29vcmQ7XHJcbiAgfVxyXG4gIGdldEZlYXR1cmVQb2ludENvbGxlY3Rpb24ocG9pbnRzOiBJTGF0TG5nW10pOiB0dXJmLkZlYXR1cmVDb2xsZWN0aW9uIHtcclxuICAgIGNvbnN0IHB0cyA9IFtdO1xyXG4gICAgcG9pbnRzLmZvckVhY2godiA9PiB7XHJcbiAgICAgIGNvbnN0IHAgPSB0dXJmLnBvaW50KFt2LmxuZywgdi5sYXRdLCB7fSk7XHJcbiAgICAgIHB0cy5wdXNoKHApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgZmMgPSB0dXJmLmZlYXR1cmVDb2xsZWN0aW9uKHB0cyk7XHJcblxyXG4gICAgcmV0dXJuIGZjO1xyXG4gIH1cclxufVxyXG4iXX0=