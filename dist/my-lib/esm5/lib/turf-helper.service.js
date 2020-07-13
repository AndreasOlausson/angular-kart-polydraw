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
        var union = turf.union(poly1, poly2);
        return this.getTurfPolygon(union);
    };
    TurfHelperService.prototype.turfConcaveman = function (feature) {
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
        return turf.booleanWithin(turf.polygon([polygon1]), turf.polygon([polygon2]));
    };
    TurfHelperService.prototype.equalPolygons = function (polygon1, polygon2) {
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
        if (coords.length < 2) {
            var polygonPoints = turf.explode(polygon);
            var index_1 = turf.nearestPoint(point, polygonPoints).properties
                .featureIndex;
            var test = turf.coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
                if (index_1 === i) {
                    return __spread(accumulator, [oldPoint, point]);
                }
                return __spread(accumulator, [oldPoint]);
            }, []);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi90dXJmLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUlwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDOztBQUdsQztJQUdFO1FBRFEsc0JBQWlCLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRWhCLGlDQUFLLEdBQUwsVUFBTSxLQUFLLEVBQUUsS0FBSztRQUloQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDBDQUFjLEdBQWQsVUFDRSxPQUF3QztRQUd4QyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXJDLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQXRCLENBQXNCLENBQUMsQ0FBQztRQUNyRSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQseUNBQXlDO0lBQ3pDLHlDQUFhLEdBQWIsVUFDRSxPQUF3QztRQUV4QyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMs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QUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxvQ0FBUSxHQUFSLFVBQVMsS0FBYztRQUNyQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNwRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxxREFBeUIsR0FBekIsVUFBMEIsTUFBaUI7UUFDekMsSUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7WUFDZCxJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztzRkFuUlUsaUJBQWlCOzZEQUFqQixpQkFBaUIsV0FBakIsaUJBQWlCLG1CQURKLE1BQU07NEJBVmhDO0NBK1JDLEFBclJELElBcVJDO1NBcFJZLGlCQUFpQjtrREFBakIsaUJBQWlCO2NBRDdCLFVBQVU7ZUFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgKiBhcyB0dXJmIGZyb20gJ0B0dXJmL3R1cmYnO1xyXG5pbXBvcnQgY29uY2F2ZW1hbiBmcm9tICdjb25jYXZlbWFuJztcclxuaW1wb3J0IHsgRmVhdHVyZSwgUG9seWdvbiwgTXVsdGlQb2x5Z29uLCBQb3NpdGlvbiB9IGZyb20gJ0B0dXJmL3R1cmYnO1xyXG5pbXBvcnQgeyBNYXJrZXJQb3NpdGlvbiB9IGZyb20gJy4vZW51bXMnO1xyXG5pbXBvcnQgeyBJQ29tcGFzcyB9IGZyb20gJy4vaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgQ29tcGFzcyB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSAnLi9wb2x5Z29uLWhlbHBlcnMnO1xyXG5cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcclxuZXhwb3J0IGNsYXNzIFR1cmZIZWxwZXJTZXJ2aWNlIHtcclxuICBwcml2YXRlIHNpbXBsaWZ5VG9sZXJhbmNlID0geyB0b2xlcmFuY2U6IDAuMDAwMSwgaGlnaFF1YWxpdHk6IGZhbHNlIH07XHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICB1bmlvbihwb2x5MSwgcG9seTIpOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIFxyXG4gICAgXHJcblxyXG4gICAgY29uc3QgdW5pb24gPSB0dXJmLnVuaW9uKHBvbHkxLCBwb2x5Mik7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VHVyZlBvbHlnb24odW5pb24pO1xyXG4gIH1cclxuXHJcbiAgdHVyZkNvbmNhdmVtYW4oXHJcbiAgICBmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBcclxuICAgIGNvbnN0IHBvaW50cyA9IHR1cmYuZXhwbG9kZShmZWF0dXJlKTtcclxuXHJcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IHBvaW50cy5mZWF0dXJlcy5tYXAoZiA9PiBmLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcclxuICAgIHJldHVybiB0dXJmLm11bHRpUG9seWdvbihbW2NvbmNhdmVtYW4oY29vcmRpbmF0ZXMpXV0pO1xyXG4gIH1cclxuXHJcbiAgLy9UT0RPIGFkZCBzb21lIHNvcnQgb2YgZHluYW1pYyB0b2xlcmFuY2VcclxuICBnZXRTaW1wbGlmaWVkKFxyXG4gICAgcG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgY29uc3QgdG9sZXJhbmNlID0gdGhpcy5zaW1wbGlmeVRvbGVyYW5jZTtcclxuICAgIGNvbnN0IHNpbXBsaWZpZWQgPSB0dXJmLnNpbXBsaWZ5KHBvbHlnb24sIHRvbGVyYW5jZSk7XHJcbiAgICByZXR1cm4gc2ltcGxpZmllZDtcclxuICB9XHJcblxyXG4gIGdldFR1cmZQb2x5Z29uKFxyXG4gICAgcG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgbGV0IHR1cmZQb2x5Z29uO1xyXG4gICAgXHJcbiAgICAvLyBpZiAocG9seWdvbi5nZW9tZXRyeSlcclxuICAgIGlmIChwb2x5Z29uLmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJykge1xyXG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtwb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKHBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHR1cmZQb2x5Z29uO1xyXG4gIH1cclxuXHJcbiAgZ2V0TXVsdGlQb2x5Z29uKFxyXG4gICAgcG9seWdvbkFycmF5OiBQb3NpdGlvbltdW11bXVxyXG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgcmV0dXJuIHR1cmYubXVsdGlQb2x5Z29uKHBvbHlnb25BcnJheSk7XHJcbiAgfVxyXG5cclxuICBnZXRLaW5rcyhmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zdCB1bmtpbmsgPSB0dXJmLnVua2lua1BvbHlnb24oZmVhdHVyZSk7XHJcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IFtdO1xyXG4gICAgdHVyZi5mZWF0dXJlRWFjaCh1bmtpbmssIGN1cnJlbnQgPT4ge1xyXG4gICAgICBjb29yZGluYXRlcy5wdXNoKGN1cnJlbnQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGNvb3JkaW5hdGVzO1xyXG4gIH1cclxuXHJcbiAgZ2V0Q29vcmRzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIHJldHVybiB0dXJmLmdldENvb3JkcyhmZWF0dXJlKTtcclxuICB9XHJcblxyXG4gIGhhc0tpbmtzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnN0IGtpbmtzID0gdHVyZi5raW5rcyhmZWF0dXJlKTtcclxuICAgIHJldHVybiBraW5rcy5mZWF0dXJlcy5sZW5ndGggPiAwO1xyXG4gIH1cclxuXHJcbiAgcG9seWdvbkludGVyc2VjdChcclxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogYm9vbGVhbiB7XHJcbiAgICAvLyBjb25zdCBvbGRQb2x5Z29uID0gcG9seWdvbi50b0dlb0pTT04oKTtcclxuICAgIGNvbnN0IHBvbHkgPSBbXTtcclxuICAgIGNvbnN0IHBvbHkyID0gW107XHJcblxyXG4gICAgXHJcblxyXG4gICAgY29uc3QgbGF0bG5nc0Nvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKGxhdGxuZ3MpO1xyXG4gICAgbGF0bG5nc0Nvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICBjb25zdCBmZWF0ID0geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbZWxlbWVudFswXV0gfTtcclxuXHJcbiAgICAgIHBvbHkucHVzaChmZWF0KTtcclxuICAgIH0pO1xyXG4gICAgY29uc3QgcG9seWdvbkNvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKHBvbHlnb24pO1xyXG4gICAgcG9seWdvbkNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICBjb25zdCBmZWF0ID0geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbZWxlbWVudFswXV0gfTtcclxuXHJcbiAgICAgIHBvbHkyLnB1c2goZmVhdCk7XHJcbiAgICB9KTtcclxuICAgIGxldCBpbnRlcnNlY3QgPSBmYWxzZTtcclxuICAgIGxvb3AxOiBmb3IgKGxldCBpID0gMDsgaSA8IHBvbHkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMuZ2V0S2lua3MocG9seVtpXSkubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9seTIubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgIGlmICh0aGlzLmdldEtpbmtzKHBvbHkyW2pdKS5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlc3QgPSB0dXJmLmludGVyc2VjdChwb2x5W2ldLCBwb2x5MltqXSk7XHJcbiAgICAgICAgICAgIGlmICh0ZXN0Py5nZW9tZXRyeS50eXBlID09PSAnUG9pbnQnKSB7XHJcbiAgICAgICAgICAgICAgaW50ZXJzZWN0ID0gIShcclxuICAgICAgICAgICAgICAgIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHRlc3QsIHBvbHlbaV0pICYmXHJcbiAgICAgICAgICAgICAgICB0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbih0ZXN0LCBwb2x5MltqXSlcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRlc3Q/Lmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJykge1xyXG4gICAgICAgICAgICAgIGludGVyc2VjdCA9ICEhdHVyZi5pbnRlcnNlY3QocG9seVtpXSwgcG9seTJbal0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSB7XHJcbiAgICAgICAgICAgICAgYnJlYWsgbG9vcDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaW50ZXJzZWN0O1xyXG4gIH1cclxuXHJcbiAgZ2V0SW50ZXJzZWN0aW9uKHBvbHkxLCBwb2x5Mik6IEZlYXR1cmUge1xyXG4gICAgcmV0dXJuIHR1cmYuaW50ZXJzZWN0KHBvbHkxLCBwb2x5Mik7XHJcbiAgfVxyXG4gIGdldERpc3RhbmNlKHBvaW50MSwgcG9pbnQyKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0dXJmLmRpc3RhbmNlKHBvaW50MSwgcG9pbnQyKTtcclxuICB9XHJcblxyXG4gIGlzV2l0aGluKHBvbHlnb24xOiBQb3NpdGlvbltdLCBwb2x5Z29uMjogUG9zaXRpb25bXSk6IGJvb2xlYW4ge1xyXG4gICAgXHJcbiAgICBcclxuICAgIHJldHVybiB0dXJmLmJvb2xlYW5XaXRoaW4oXHJcbiAgICAgIHR1cmYucG9seWdvbihbcG9seWdvbjFdKSxcclxuICAgICAgdHVyZi5wb2x5Z29uKFtwb2x5Z29uMl0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZXF1YWxQb2x5Z29ucyhcclxuICAgIHBvbHlnb24xOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgcG9seWdvbjI6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cclxuICApIHtcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICB9XHJcbiAgLy9UT0RPIG9wdGlvbmFsIGFkZCBleHRyYSBtYXJrZXJzIGZvciBOIEUgUyBXIChXZSBoYXZlIHRoZSBjb3JuZXJzIE5XLCBORSwgU0UsIFNXKVxyXG4gIGNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihcclxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBhZGRNaWRwb2ludE1hcmtlcnM6IGJvb2xlYW4gPSBmYWxzZVxyXG4gICk6IEZlYXR1cmU8UG9seWdvbj4ge1xyXG4gICAgY29uc3QgYmJveCA9IHR1cmYuYmJveChwb2x5Z29uLmdlb21ldHJ5KTtcclxuICAgIGNvbnN0IGJib3hQb2x5Z29uID0gdHVyZi5iYm94UG9seWdvbihiYm94KTtcclxuXHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MoYmJveFsxXSwgYmJveFswXSwgYmJveFszXSwgYmJveFsyXSk7XHJcblxyXG4gICAgY29uc3QgY29tcGFzc1Bvc2l0aW9ucyA9IGNvbXBhc3MuZ2V0UG9zaXRpb25zKCk7XHJcblxyXG4gICAgYmJveFBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgIGJib3hQb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzID0gW2NvbXBhc3NQb3NpdGlvbnNdO1xyXG5cclxuICAgIHJldHVybiBiYm94UG9seWdvbjtcclxuICB9XHJcbiAgcG9seWdvblRvTXVsdGlQb2x5Z29uKHBvbHk6IEZlYXR1cmU8UG9seWdvbj4pOiBGZWF0dXJlPE11bHRpUG9seWdvbj4ge1xyXG4gICAgY29uc3QgbXVsdGkgPSB0dXJmLm11bHRpUG9seWdvbihbcG9seS5nZW9tZXRyeS5jb29yZGluYXRlc10pO1xyXG4gICAgcmV0dXJuIG11bHRpO1xyXG4gIH1cclxuICAvL1RPRE8gLWNsZWFudXBcclxuICBpbmplY3RQb2ludFRvUG9seWdvbihwb2x5Z29uLCBwb2ludCkge1xyXG4gICAgY29uc3QgY29vcmRzID0gdHVyZi5nZXRDb29yZHMocG9seWdvbik7XHJcbiAgICBsZXQgbmV3UG9seWdvbjtcclxuICAgIFxyXG4gICAgaWYgKGNvb3Jkcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBpbmRleCA9IHR1cmYubmVhcmVzdFBvaW50KHBvaW50LCBwb2x5Z29uUG9pbnRzKS5wcm9wZXJ0aWVzXHJcbiAgICAgICAgLmZlYXR1cmVJbmRleDtcclxuICAgICAgY29uc3QgdGVzdCA9IHR1cmYuY29vcmRSZWR1Y2UoXHJcbiAgICAgICAgcG9seWdvblBvaW50cyxcclxuICAgICAgICBmdW5jdGlvbihhY2N1bXVsYXRvciwgb2xkUG9pbnQsIGkpIHtcclxuICAgICAgICAgIGlmIChpbmRleCA9PT0gaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludCwgcG9pbnRdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW11cclxuICAgICAgKTtcclxuICAgICAgXHJcbiAgICAgIG5ld1BvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihbW3Rlc3RdXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBwb3MgPSBbXTtcclxuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBvbHlnb24gPSB0dXJmLnBvbHlnb24oZWxlbWVudCk7XHJcbiAgICAgICAgLy8gdHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pXHJcbiAgICAgICAgaWYgKHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHBvaW50LCBwb2x5Z29uKSkge1xyXG4gICAgICAgICAgY29uc3QgcG9seWdvblBvaW50cyA9IHR1cmYuZXhwbG9kZShwb2x5Z29uKTtcclxuICAgICAgICAgIGNvbnN0IGluZGV4ID0gdHVyZi5uZWFyZXN0UG9pbnQocG9pbnQsIHBvbHlnb25Qb2ludHMpLnByb3BlcnRpZXNcclxuICAgICAgICAgICAgLmZlYXR1cmVJbmRleDtcclxuICAgICAgICAgIGNvb3JkaW5hdGVzID0gdHVyZi5jb29yZFJlZHVjZShcclxuICAgICAgICAgICAgcG9seWdvblBvaW50cyxcclxuICAgICAgICAgICAgZnVuY3Rpb24oYWNjdW11bGF0b3IsIG9sZFBvaW50LCBpKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSBpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludCwgcG9pbnRdO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludF07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtdXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBvcy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHBvcy5wdXNoKFtjb29yZGluYXRlc10pO1xyXG4gICAgICBuZXdQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24ocG9zKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXdQb2x5Z29uO1xyXG4gIH1cclxuXHJcbiAgcG9seWdvbkRpZmZlcmVuY2UoXHJcbiAgICBwb2x5Z29uMTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIHBvbHlnb24yOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBjb25zdCBkaWZmID0gdHVyZi5kaWZmZXJlbmNlKHBvbHlnb24xLCBwb2x5Z29uMik7XHJcbiAgICBcclxuICAgIHJldHVybiB0aGlzLmdldFR1cmZQb2x5Z29uKGRpZmYpO1xyXG4gIH1cclxuICBnZXRCb3VuZGluZ0JveENvbXBhc3NQb3NpdGlvbihcclxuICAgIHBvbHlnb24sXHJcbiAgICBNYXJrZXJQb3NpdGlvbjogSUNvbXBhc3MsXHJcbiAgICB1c2VPZmZzZXQsXHJcbiAgICBvZmZzZXREaXJlY3Rpb25cclxuICApIHtcclxuICAgIGNvbnN0IHAgPSB0aGlzLmdldE11bHRpUG9seWdvbihwb2x5Z29uKTtcclxuICAgIGNvbnN0IGNvbXBhc3MgPSB0aGlzLmdldEJvdW5kaW5nQm94Q29tcGFzcyhwb2x5Z29uKTtcclxuICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XHJcbiAgICBjb25zdCBjb29yZCA9IHRoaXMuZ2V0Q29vcmQoY29tcGFzcy5kaXJlY3Rpb24uTm9ydGgpO1xyXG4gICAgY29uc3QgbmVhcmVzdFBvaW50ID0gdHVyZi5uZWFyZXN0UG9pbnQoY29vcmQsIHBvbHlnb25Qb2ludHMpO1xyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBwcml2YXRlIGdldEJvdW5kaW5nQm94Q29tcGFzcyhwb2x5Z29uKTogQ29tcGFzcyB7XHJcbiAgICBjb25zdCBwID0gdGhpcy5nZXRNdWx0aVBvbHlnb24ocG9seWdvbik7XHJcbiAgICBjb25zdCBjZW50ZXJPZk1hc3MgPSB0dXJmLmNlbnRlck9mTWFzcyhwKTtcclxuICAgIGNvbnN0IGIgPSB0dXJmLmJib3gocCk7XHJcbiAgICBjb25zdCBtaW5YID0gYlswXTtcclxuICAgIGNvbnN0IG1pblkgPSBiWzFdO1xyXG4gICAgY29uc3QgbWF4WCA9IGJbMl07XHJcbiAgICBjb25zdCBtYXhZID0gYlszXTtcclxuICAgIGNvbnN0IGNvbXBhc3MgPSBuZXcgQ29tcGFzcyhtaW5YLCBtaW5ZLCBtYXhYLCBtYXhZKTtcclxuICAgIC8vIGNvbXBhc3MuZGlyZWN0aW9uLkNlbnRlck9mTWFzcyA9IGNlbnRlck9mTWFzcy5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXTtcclxuXHJcbiAgICByZXR1cm4gY29tcGFzcztcclxuICB9XHJcblxyXG4gIGdldE5lYXJlc3RQb2ludEluZGV4KFxyXG4gICAgdGFyZ2V0UG9pbnQ6IHR1cmYuQ29vcmQsXHJcbiAgICBwb2ludHM6IHR1cmYuRmVhdHVyZUNvbGxlY3Rpb248dHVyZi5Qb2ludD5cclxuICApOiBudW1iZXIge1xyXG4gICAgY29uc3QgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludCh0YXJnZXRQb2ludCwgcG9pbnRzKS5wcm9wZXJ0aWVzLmZlYXR1cmVJbmRleDtcclxuICAgIHJldHVybiBpbmRleDtcclxuICB9XHJcbiAgZ2V0Q29vcmQocG9pbnQ6IElMYXRMbmcpOiB0dXJmLkNvb3JkIHtcclxuICAgIGNvbnN0IGNvb3JkID0gdHVyZi5nZXRDb29yZChbcG9pbnQubG5nLCBwb2ludC5sYXRdKTtcclxuICAgIHJldHVybiBjb29yZDtcclxuICB9XHJcbiAgZ2V0RmVhdHVyZVBvaW50Q29sbGVjdGlvbihwb2ludHM6IElMYXRMbmdbXSk6IHR1cmYuRmVhdHVyZUNvbGxlY3Rpb24ge1xyXG4gICAgY29uc3QgcHRzID0gW107XHJcbiAgICBwb2ludHMuZm9yRWFjaCh2ID0+IHtcclxuICAgICAgY29uc3QgcCA9IHR1cmYucG9pbnQoW3YubG5nLCB2LmxhdF0sIHt9KTtcclxuICAgICAgcHRzLnB1c2gocCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBmYyA9IHR1cmYuZmVhdHVyZUNvbGxlY3Rpb24ocHRzKTtcclxuXHJcbiAgICByZXR1cm4gZmM7XHJcbiAgfVxyXG59XHJcbiJdfQ==