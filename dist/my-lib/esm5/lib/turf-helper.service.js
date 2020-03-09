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
    TurfHelperService.ɵfac = function TurfHelperService_Factory(t) { return new (t || TurfHelperService)(); };
    TurfHelperService.ɵprov = i0.ɵɵdefineInjectable({ token: TurfHelperService, factory: TurfHelperService.ɵfac, providedIn: 'root' });
    return TurfHelperService;
}());
export { TurfHelperService };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(TurfHelperService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return []; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi90dXJmLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUlwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDOztBQUdsQztJQUdFO1FBRFEsc0JBQWlCLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRWhCLGlDQUFLLEdBQUwsVUFBTSxLQUFLLEVBQUUsS0FBSztRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU5QixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDBDQUFjLEdBQWQsVUFDRSxPQUF3QztRQUV4Qyx3Q0FBd0M7UUFDeEMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVyQyxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDckUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLENB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QyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QscURBQXlCLEdBQXpCLFVBQTBCLE1BQWlCO1FBQ3pDLElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO1lBQ2QsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztRQUVILElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV2QyxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7c0ZBblJVLGlCQUFpQjs2REFBakIsaUJBQWlCLFdBQWpCLGlCQUFpQixtQkFESixNQUFNOzRCQVZoQztDQStSQyxBQXJSRCxJQXFSQztTQXBSWSxpQkFBaUI7a0RBQWpCLGlCQUFpQjtjQUQ3QixVQUFVO2VBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0ICogYXMgdHVyZiBmcm9tICdAdHVyZi90dXJmJztcclxuaW1wb3J0IGNvbmNhdmVtYW4gZnJvbSAnY29uY2F2ZW1hbic7XHJcbmltcG9ydCB7IEZlYXR1cmUsIFBvbHlnb24sIE11bHRpUG9seWdvbiwgUG9zaXRpb24gfSBmcm9tICdAdHVyZi90dXJmJztcclxuaW1wb3J0IHsgTWFya2VyUG9zaXRpb24gfSBmcm9tICcuL2VudW1zJztcclxuaW1wb3J0IHsgSUNvbXBhc3MgfSBmcm9tICcuL2ludGVyZmFjZSc7XHJcbmltcG9ydCB7IENvbXBhc3MgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBUdXJmSGVscGVyU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBzaW1wbGlmeVRvbGVyYW5jZSA9IHsgdG9sZXJhbmNlOiAwLjAwMDEsIGhpZ2hRdWFsaXR5OiBmYWxzZSB9O1xyXG4gIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgdW5pb24ocG9seTEsIHBvbHkyKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBjb25zb2xlLmxvZygncG9seTE6ICcsIHBvbHkxKTtcclxuICAgIGNvbnNvbGUubG9nKCdwb2x5MjogJywgcG9seTIpO1xyXG5cclxuICAgIGNvbnN0IHVuaW9uID0gdHVyZi51bmlvbihwb2x5MSwgcG9seTIpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmdldFR1cmZQb2x5Z29uKHVuaW9uKTtcclxuICB9XHJcblxyXG4gIHR1cmZDb25jYXZlbWFuKFxyXG4gICAgZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcInR1cmZDb25jYXZlbWFuXCIsIHBvaW50cyk7XHJcbiAgICBjb25zdCBwb2ludHMgPSB0dXJmLmV4cGxvZGUoZmVhdHVyZSk7XHJcblxyXG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBwb2ludHMuZmVhdHVyZXMubWFwKGYgPT4gZi5nZW9tZXRyeS5jb29yZGluYXRlcyk7XHJcbiAgICByZXR1cm4gdHVyZi5tdWx0aVBvbHlnb24oW1tjb25jYXZlbWFuKGNvb3JkaW5hdGVzKV1dKTtcclxuICB9XHJcblxyXG4gIC8vVE9ETyBhZGQgc29tZSBzb3J0IG9mIGR5bmFtaWMgdG9sZXJhbmNlXHJcbiAgZ2V0U2ltcGxpZmllZChcclxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cclxuICApOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIGNvbnN0IHRvbGVyYW5jZSA9IHRoaXMuc2ltcGxpZnlUb2xlcmFuY2U7XHJcbiAgICBjb25zdCBzaW1wbGlmaWVkID0gdHVyZi5zaW1wbGlmeShwb2x5Z29uLCB0b2xlcmFuY2UpO1xyXG4gICAgcmV0dXJuIHNpbXBsaWZpZWQ7XHJcbiAgfVxyXG5cclxuICBnZXRUdXJmUG9seWdvbihcclxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cclxuICApOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIGxldCB0dXJmUG9seWdvbjtcclxuICAgIGNvbnNvbGUubG9nKCdHZXQgVHVyZlBvbHlnb246JywgcG9seWdvbik7XHJcbiAgICAvLyBpZiAocG9seWdvbi5nZW9tZXRyeSlcclxuICAgIGlmIChwb2x5Z29uLmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJykge1xyXG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtwb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKHBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHR1cmZQb2x5Z29uO1xyXG4gIH1cclxuXHJcbiAgZ2V0TXVsdGlQb2x5Z29uKFxyXG4gICAgcG9seWdvbkFycmF5OiBQb3NpdGlvbltdW11bXVxyXG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgcmV0dXJuIHR1cmYubXVsdGlQb2x5Z29uKHBvbHlnb25BcnJheSk7XHJcbiAgfVxyXG5cclxuICBnZXRLaW5rcyhmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zdCB1bmtpbmsgPSB0dXJmLnVua2lua1BvbHlnb24oZmVhdHVyZSk7XHJcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IFtdO1xyXG4gICAgdHVyZi5mZWF0dXJlRWFjaCh1bmtpbmssIGN1cnJlbnQgPT4ge1xyXG4gICAgICBjb29yZGluYXRlcy5wdXNoKGN1cnJlbnQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGNvb3JkaW5hdGVzO1xyXG4gIH1cclxuXHJcbiAgZ2V0Q29vcmRzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIHJldHVybiB0dXJmLmdldENvb3JkcyhmZWF0dXJlKTtcclxuICB9XHJcblxyXG4gIGhhc0tpbmtzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnN0IGtpbmtzID0gdHVyZi5raW5rcyhmZWF0dXJlKTtcclxuICAgIHJldHVybiBraW5rcy5mZWF0dXJlcy5sZW5ndGggPiAwO1xyXG4gIH1cclxuXHJcbiAgcG9seWdvbkludGVyc2VjdChcclxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogYm9vbGVhbiB7XHJcbiAgICAvLyBjb25zdCBvbGRQb2x5Z29uID0gcG9seWdvbi50b0dlb0pTT04oKTtcclxuICAgIGNvbnN0IHBvbHkgPSBbXTtcclxuICAgIGNvbnN0IHBvbHkyID0gW107XHJcblxyXG4gICAgY29uc29sZS5sb2coJ3BvbHlnb25JbnRlcnNlY3QnLCBwb2x5Z29uLCBsYXRsbmdzKTtcclxuXHJcbiAgICBjb25zdCBsYXRsbmdzQ29vcmRzID0gdHVyZi5nZXRDb29yZHMobGF0bG5ncyk7XHJcbiAgICBsYXRsbmdzQ29vcmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXQgPSB7IHR5cGU6ICdQb2x5Z29uJywgY29vcmRpbmF0ZXM6IFtlbGVtZW50WzBdXSB9O1xyXG5cclxuICAgICAgcG9seS5wdXNoKGZlYXQpO1xyXG4gICAgfSk7XHJcbiAgICBjb25zdCBwb2x5Z29uQ29vcmRzID0gdHVyZi5nZXRDb29yZHMocG9seWdvbik7XHJcbiAgICBwb2x5Z29uQ29vcmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXQgPSB7IHR5cGU6ICdQb2x5Z29uJywgY29vcmRpbmF0ZXM6IFtlbGVtZW50WzBdXSB9O1xyXG5cclxuICAgICAgcG9seTIucHVzaChmZWF0KTtcclxuICAgIH0pO1xyXG4gICAgbGV0IGludGVyc2VjdCA9IGZhbHNlO1xyXG4gICAgbG9vcDE6IGZvciAobGV0IGkgPSAwOyBpIDwgcG9seS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAodGhpcy5nZXRLaW5rcyhwb2x5W2ldKS5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb2x5Mi5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgaWYgKHRoaXMuZ2V0S2lua3MocG9seTJbal0pLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgY29uc3QgdGVzdCA9IHR1cmYuaW50ZXJzZWN0KHBvbHlbaV0sIHBvbHkyW2pdKTtcclxuICAgICAgICAgICAgaWYgKHRlc3Q/Lmdlb21ldHJ5LnR5cGUgPT09ICdQb2ludCcpIHtcclxuICAgICAgICAgICAgICBpbnRlcnNlY3QgPSAhKFxyXG4gICAgICAgICAgICAgICAgdHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24odGVzdCwgcG9seVtpXSkgJiZcclxuICAgICAgICAgICAgICAgIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHRlc3QsIHBvbHkyW2pdKVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0ludGVyc2VjdCB0ZXN0OiAnKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0ZXN0Py5nZW9tZXRyeS50eXBlID09PSAnUG9seWdvbicpIHtcclxuICAgICAgICAgICAgICBpbnRlcnNlY3QgPSAhIXR1cmYuaW50ZXJzZWN0KHBvbHlbaV0sIHBvbHkyW2pdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGludGVyc2VjdCkge1xyXG4gICAgICAgICAgICAgIGJyZWFrIGxvb3AxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGludGVyc2VjdDtcclxuICB9XHJcblxyXG4gIGdldEludGVyc2VjdGlvbihwb2x5MSwgcG9seTIpOiBGZWF0dXJlIHtcclxuICAgIHJldHVybiB0dXJmLmludGVyc2VjdChwb2x5MSwgcG9seTIpO1xyXG4gIH1cclxuICBnZXREaXN0YW5jZShwb2ludDEsIHBvaW50Mik6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdHVyZi5kaXN0YW5jZShwb2ludDEsIHBvaW50Mik7XHJcbiAgfVxyXG5cclxuICBpc1dpdGhpbihwb2x5Z29uMTogUG9zaXRpb25bXSwgcG9seWdvbjI6IFBvc2l0aW9uW10pOiBib29sZWFuIHtcclxuICAgIGNvbnNvbGUubG9nKHBvbHlnb24xKTtcclxuICAgIGNvbnNvbGUubG9nKCdZdHJlOiAnLCBwb2x5Z29uMik7XHJcbiAgICByZXR1cm4gdHVyZi5ib29sZWFuV2l0aGluKFxyXG4gICAgICB0dXJmLnBvbHlnb24oW3BvbHlnb24xXSksXHJcbiAgICAgIHR1cmYucG9seWdvbihbcG9seWdvbjJdKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGVxdWFsUG9seWdvbnMoXHJcbiAgICBwb2x5Z29uMTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIHBvbHlnb24yOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKSB7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMSk7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMik7XHJcbiAgICBjb25zb2xlLmxvZyh0dXJmLmJvb2xlYW5FcXVhbChwb2x5Z29uMSwgcG9seWdvbjIpKTtcclxuICB9XHJcbiAgLy9UT0RPIG9wdGlvbmFsIGFkZCBleHRyYSBtYXJrZXJzIGZvciBOIEUgUyBXIChXZSBoYXZlIHRoZSBjb3JuZXJzIE5XLCBORSwgU0UsIFNXKVxyXG4gIGNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihcclxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBhZGRNaWRwb2ludE1hcmtlcnM6IGJvb2xlYW4gPSBmYWxzZVxyXG4gICk6IEZlYXR1cmU8UG9seWdvbj4ge1xyXG4gICAgY29uc3QgYmJveCA9IHR1cmYuYmJveChwb2x5Z29uLmdlb21ldHJ5KTtcclxuICAgIGNvbnN0IGJib3hQb2x5Z29uID0gdHVyZi5iYm94UG9seWdvbihiYm94KTtcclxuXHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MoYmJveFsxXSwgYmJveFswXSwgYmJveFszXSwgYmJveFsyXSk7XHJcblxyXG4gICAgY29uc3QgY29tcGFzc1Bvc2l0aW9ucyA9IGNvbXBhc3MuZ2V0UG9zaXRpb25zKCk7XHJcblxyXG4gICAgYmJveFBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgIGJib3hQb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzID0gW2NvbXBhc3NQb3NpdGlvbnNdO1xyXG5cclxuICAgIHJldHVybiBiYm94UG9seWdvbjtcclxuICB9XHJcbiAgcG9seWdvblRvTXVsdGlQb2x5Z29uKHBvbHk6IEZlYXR1cmU8UG9seWdvbj4pOiBGZWF0dXJlPE11bHRpUG9seWdvbj4ge1xyXG4gICAgY29uc3QgbXVsdGkgPSB0dXJmLm11bHRpUG9seWdvbihbcG9seS5nZW9tZXRyeS5jb29yZGluYXRlc10pO1xyXG4gICAgcmV0dXJuIG11bHRpO1xyXG4gIH1cclxuICAvL1RPRE8gLWNsZWFudXBcclxuICBpbmplY3RQb2ludFRvUG9seWdvbihwb2x5Z29uLCBwb2ludCkge1xyXG4gICAgY29uc3QgY29vcmRzID0gdHVyZi5nZXRDb29yZHMocG9seWdvbik7XHJcbiAgICBsZXQgbmV3UG9seWdvbjtcclxuICAgIGNvbnNvbGUubG9nKCdwb2x5Z29uOiAnLCBwb2x5Z29uKTtcclxuICAgIGlmIChjb29yZHMubGVuZ3RoIDwgMikge1xyXG4gICAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xyXG4gICAgICBjb25zb2xlLmxvZyh0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykpO1xyXG4gICAgICBjb25zdCBpbmRleCA9IHR1cmYubmVhcmVzdFBvaW50KHBvaW50LCBwb2x5Z29uUG9pbnRzKS5wcm9wZXJ0aWVzXHJcbiAgICAgICAgLmZlYXR1cmVJbmRleDtcclxuICAgICAgY29uc3QgdGVzdCA9IHR1cmYuY29vcmRSZWR1Y2UoXHJcbiAgICAgICAgcG9seWdvblBvaW50cyxcclxuICAgICAgICBmdW5jdGlvbihhY2N1bXVsYXRvciwgb2xkUG9pbnQsIGkpIHtcclxuICAgICAgICAgIGlmIChpbmRleCA9PT0gaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludCwgcG9pbnRdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW11cclxuICAgICAgKTtcclxuICAgICAgY29uc29sZS5sb2coJ3Rlc3QnLCB0ZXN0KTtcclxuICAgICAgbmV3UG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtbdGVzdF1dKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHBvcyA9IFtdO1xyXG4gICAgICBsZXQgY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgICAgY29vcmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgY29uc3QgcG9seWdvbiA9IHR1cmYucG9seWdvbihlbGVtZW50KTtcclxuICAgICAgICAvLyB0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbihwb2ludCwgcG9seWdvbilcclxuICAgICAgICBpZiAodHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pKSB7XHJcbiAgICAgICAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xyXG4gICAgICAgICAgY29uc3QgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykucHJvcGVydGllc1xyXG4gICAgICAgICAgICAuZmVhdHVyZUluZGV4O1xyXG4gICAgICAgICAgY29vcmRpbmF0ZXMgPSB0dXJmLmNvb3JkUmVkdWNlKFxyXG4gICAgICAgICAgICBwb2x5Z29uUG9pbnRzLFxyXG4gICAgICAgICAgICBmdW5jdGlvbihhY2N1bXVsYXRvciwgb2xkUG9pbnQsIGkpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IGkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50LCBwb2ludF07XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50XTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgW11cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnY29vcmRpbmF0ZXMnLCBjb29yZGluYXRlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBvcy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHBvcy5wdXNoKFtjb29yZGluYXRlc10pO1xyXG4gICAgICBuZXdQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24ocG9zKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXdQb2x5Z29uO1xyXG4gIH1cclxuXHJcbiAgcG9seWdvbkRpZmZlcmVuY2UoXHJcbiAgICBwb2x5Z29uMTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIHBvbHlnb24yOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBjb25zdCBkaWZmID0gdHVyZi5kaWZmZXJlbmNlKHBvbHlnb24xLCBwb2x5Z29uMik7XHJcbiAgICBjb25zb2xlLmxvZyhkaWZmKTtcclxuICAgIHJldHVybiB0aGlzLmdldFR1cmZQb2x5Z29uKGRpZmYpO1xyXG4gIH1cclxuICBnZXRCb3VuZGluZ0JveENvbXBhc3NQb3NpdGlvbihcclxuICAgIHBvbHlnb24sXHJcbiAgICBNYXJrZXJQb3NpdGlvbjogSUNvbXBhc3MsXHJcbiAgICB1c2VPZmZzZXQsXHJcbiAgICBvZmZzZXREaXJlY3Rpb25cclxuICApIHtcclxuICAgIGNvbnN0IHAgPSB0aGlzLmdldE11bHRpUG9seWdvbihwb2x5Z29uKTtcclxuICAgIGNvbnN0IGNvbXBhc3MgPSB0aGlzLmdldEJvdW5kaW5nQm94Q29tcGFzcyhwb2x5Z29uKTtcclxuICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XHJcbiAgICBjb25zdCBjb29yZCA9IHRoaXMuZ2V0Q29vcmQoY29tcGFzcy5kaXJlY3Rpb24uTm9ydGgpO1xyXG4gICAgY29uc3QgbmVhcmVzdFBvaW50ID0gdHVyZi5uZWFyZXN0UG9pbnQoY29vcmQsIHBvbHlnb25Qb2ludHMpO1xyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBwcml2YXRlIGdldEJvdW5kaW5nQm94Q29tcGFzcyhwb2x5Z29uKTogQ29tcGFzcyB7XHJcbiAgICBjb25zdCBwID0gdGhpcy5nZXRNdWx0aVBvbHlnb24ocG9seWdvbik7XHJcbiAgICBjb25zdCBjZW50ZXJPZk1hc3MgPSB0dXJmLmNlbnRlck9mTWFzcyhwKTtcclxuICAgIGNvbnN0IGIgPSB0dXJmLmJib3gocCk7XHJcbiAgICBjb25zdCBtaW5YID0gYlswXTtcclxuICAgIGNvbnN0IG1pblkgPSBiWzFdO1xyXG4gICAgY29uc3QgbWF4WCA9IGJbMl07XHJcbiAgICBjb25zdCBtYXhZID0gYlszXTtcclxuICAgIGNvbnN0IGNvbXBhc3MgPSBuZXcgQ29tcGFzcyhtaW5YLCBtaW5ZLCBtYXhYLCBtYXhZKTtcclxuICAgIC8vIGNvbXBhc3MuZGlyZWN0aW9uLkNlbnRlck9mTWFzcyA9IGNlbnRlck9mTWFzcy5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXTtcclxuXHJcbiAgICByZXR1cm4gY29tcGFzcztcclxuICB9XHJcblxyXG4gIGdldE5lYXJlc3RQb2ludEluZGV4KFxyXG4gICAgdGFyZ2V0UG9pbnQ6IHR1cmYuQ29vcmQsXHJcbiAgICBwb2ludHM6IHR1cmYuRmVhdHVyZUNvbGxlY3Rpb248dHVyZi5Qb2ludD5cclxuICApOiBudW1iZXIge1xyXG4gICAgY29uc3QgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludCh0YXJnZXRQb2ludCwgcG9pbnRzKS5wcm9wZXJ0aWVzLmZlYXR1cmVJbmRleDtcclxuICAgIHJldHVybiBpbmRleDtcclxuICB9XHJcbiAgZ2V0Q29vcmQocG9pbnQ6IElMYXRMbmcpOiB0dXJmLkNvb3JkIHtcclxuICAgIGNvbnN0IGNvb3JkID0gdHVyZi5nZXRDb29yZChbcG9pbnQubG5nLCBwb2ludC5sYXRdKTtcclxuICAgIHJldHVybiBjb29yZDtcclxuICB9XHJcbiAgZ2V0RmVhdHVyZVBvaW50Q29sbGVjdGlvbihwb2ludHM6IElMYXRMbmdbXSk6IHR1cmYuRmVhdHVyZUNvbGxlY3Rpb24ge1xyXG4gICAgY29uc3QgcHRzID0gW107XHJcbiAgICBwb2ludHMuZm9yRWFjaCh2ID0+IHtcclxuICAgICAgY29uc3QgcCA9IHR1cmYucG9pbnQoW3YubG5nLCB2LmxhdF0sIHt9KTtcclxuICAgICAgcHRzLnB1c2gocCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBmYyA9IHR1cmYuZmVhdHVyZUNvbGxlY3Rpb24ocHRzKTtcclxuXHJcbiAgICByZXR1cm4gZmM7XHJcbiAgfVxyXG59XHJcbiJdfQ==