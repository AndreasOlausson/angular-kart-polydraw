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
    TurfHelperService.ɵprov = i0.ɵɵdefineInjectable({ factory: function TurfHelperService_Factory() { return new TurfHelperService(); }, token: TurfHelperService, providedIn: "root" });
    TurfHelperService = __decorate([
        Injectable({ providedIn: 'root' }),
        __metadata("design:paramtypes", [])
    ], TurfHelperService);
    return TurfHelperService;
}());
export { TurfHelperService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi90dXJmLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUlwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDOztBQUlsQztJQUVFO1FBRFEsc0JBQWlCLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRWhCLGlDQUFLLEdBQUwsVUFBTSxLQUFLLEVBQUUsS0FBSztRQUloQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDBDQUFjLEdBQWQsVUFDRSxPQUF3QztRQUd4QyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXJDLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQXRCLENBQXNCLENBQUMsQ0FBQztRQUNyRSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQseUNBQXlDO0lBQ3pDLHlDQUFhLEdBQWIsVUFDRSxPQUF3QztRQUV4QyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMs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QUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxvQ0FBUSxHQUFSLFVBQVMsS0FBYztRQUNyQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNwRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxxREFBeUIsR0FBekIsVUFBMEIsTUFBaUI7UUFDekMsSUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7WUFDZCxJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQzs7SUFuUlUsaUJBQWlCO1FBRDdCLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQzs7T0FDdEIsaUJBQWlCLENBb1I3Qjs0QkEvUkQ7Q0ErUkMsQUFwUkQsSUFvUkM7U0FwUlksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyB0dXJmIGZyb20gJ0B0dXJmL3R1cmYnO1xuaW1wb3J0IGNvbmNhdmVtYW4gZnJvbSAnY29uY2F2ZW1hbic7XG5pbXBvcnQgeyBGZWF0dXJlLCBQb2x5Z29uLCBNdWx0aVBvbHlnb24sIFBvc2l0aW9uIH0gZnJvbSAnQHR1cmYvdHVyZic7XG5pbXBvcnQgeyBNYXJrZXJQb3NpdGlvbiB9IGZyb20gJy4vZW51bXMnO1xuaW1wb3J0IHsgSUNvbXBhc3MgfSBmcm9tICcuL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBDb21wYXNzIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSAnLi9wb2x5Z29uLWhlbHBlcnMnO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIFR1cmZIZWxwZXJTZXJ2aWNlIHtcbiAgcHJpdmF0ZSBzaW1wbGlmeVRvbGVyYW5jZSA9IHsgdG9sZXJhbmNlOiAwLjAwMDEsIGhpZ2hRdWFsaXR5OiBmYWxzZSB9O1xuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgdW5pb24ocG9seTEsIHBvbHkyKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XG4gICAgXG4gICAgXG5cbiAgICBjb25zdCB1bmlvbiA9IHR1cmYudW5pb24ocG9seTEsIHBvbHkyKTtcblxuICAgIHJldHVybiB0aGlzLmdldFR1cmZQb2x5Z29uKHVuaW9uKTtcbiAgfVxuXG4gIHR1cmZDb25jYXZlbWFuKFxuICAgIGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XG4gICAgXG4gICAgY29uc3QgcG9pbnRzID0gdHVyZi5leHBsb2RlKGZlYXR1cmUpO1xuXG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBwb2ludHMuZmVhdHVyZXMubWFwKGYgPT4gZi5nZW9tZXRyeS5jb29yZGluYXRlcyk7XG4gICAgcmV0dXJuIHR1cmYubXVsdGlQb2x5Z29uKFtbY29uY2F2ZW1hbihjb29yZGluYXRlcyldXSk7XG4gIH1cblxuICAvL1RPRE8gYWRkIHNvbWUgc29ydCBvZiBkeW5hbWljIHRvbGVyYW5jZVxuICBnZXRTaW1wbGlmaWVkKFxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XG4gICAgY29uc3QgdG9sZXJhbmNlID0gdGhpcy5zaW1wbGlmeVRvbGVyYW5jZTtcbiAgICBjb25zdCBzaW1wbGlmaWVkID0gdHVyZi5zaW1wbGlmeShwb2x5Z29uLCB0b2xlcmFuY2UpO1xuICAgIHJldHVybiBzaW1wbGlmaWVkO1xuICB9XG5cbiAgZ2V0VHVyZlBvbHlnb24oXG4gICAgcG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxuICApOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcbiAgICBsZXQgdHVyZlBvbHlnb247XG4gICAgXG4gICAgLy8gaWYgKHBvbHlnb24uZ2VvbWV0cnkpXG4gICAgaWYgKHBvbHlnb24uZ2VvbWV0cnkudHlwZSA9PT0gJ1BvbHlnb24nKSB7XG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtwb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHR1cmZQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24ocG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyk7XG4gICAgfVxuICAgIHJldHVybiB0dXJmUG9seWdvbjtcbiAgfVxuXG4gIGdldE11bHRpUG9seWdvbihcbiAgICBwb2x5Z29uQXJyYXk6IFBvc2l0aW9uW11bXVtdXG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xuICAgIHJldHVybiB0dXJmLm11bHRpUG9seWdvbihwb2x5Z29uQXJyYXkpO1xuICB9XG5cbiAgZ2V0S2lua3MoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xuICAgIGNvbnN0IHVua2luayA9IHR1cmYudW5raW5rUG9seWdvbihmZWF0dXJlKTtcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IFtdO1xuICAgIHR1cmYuZmVhdHVyZUVhY2godW5raW5rLCBjdXJyZW50ID0+IHtcbiAgICAgIGNvb3JkaW5hdGVzLnB1c2goY3VycmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29vcmRpbmF0ZXM7XG4gIH1cblxuICBnZXRDb29yZHMoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xuICAgIHJldHVybiB0dXJmLmdldENvb3JkcyhmZWF0dXJlKTtcbiAgfVxuXG4gIGhhc0tpbmtzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcbiAgICBjb25zdCBraW5rcyA9IHR1cmYua2lua3MoZmVhdHVyZSk7XG4gICAgcmV0dXJuIGtpbmtzLmZlYXR1cmVzLmxlbmd0aCA+IDA7XG4gIH1cblxuICBwb2x5Z29uSW50ZXJzZWN0KFxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXG4gICAgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxuICApOiBib29sZWFuIHtcbiAgICAvLyBjb25zdCBvbGRQb2x5Z29uID0gcG9seWdvbi50b0dlb0pTT04oKTtcbiAgICBjb25zdCBwb2x5ID0gW107XG4gICAgY29uc3QgcG9seTIgPSBbXTtcblxuICAgIFxuXG4gICAgY29uc3QgbGF0bG5nc0Nvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKGxhdGxuZ3MpO1xuICAgIGxhdGxuZ3NDb29yZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGNvbnN0IGZlYXQgPSB7IHR5cGU6ICdQb2x5Z29uJywgY29vcmRpbmF0ZXM6IFtlbGVtZW50WzBdXSB9O1xuXG4gICAgICBwb2x5LnB1c2goZmVhdCk7XG4gICAgfSk7XG4gICAgY29uc3QgcG9seWdvbkNvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKHBvbHlnb24pO1xuICAgIHBvbHlnb25Db29yZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGNvbnN0IGZlYXQgPSB7IHR5cGU6ICdQb2x5Z29uJywgY29vcmRpbmF0ZXM6IFtlbGVtZW50WzBdXSB9O1xuXG4gICAgICBwb2x5Mi5wdXNoKGZlYXQpO1xuICAgIH0pO1xuICAgIGxldCBpbnRlcnNlY3QgPSBmYWxzZTtcbiAgICBsb29wMTogZm9yIChsZXQgaSA9IDA7IGkgPCBwb2x5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5nZXRLaW5rcyhwb2x5W2ldKS5sZW5ndGggPCAyKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9seTIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5nZXRLaW5rcyhwb2x5MltqXSkubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgY29uc3QgdGVzdCA9IHR1cmYuaW50ZXJzZWN0KHBvbHlbaV0sIHBvbHkyW2pdKTtcbiAgICAgICAgICAgIGlmICh0ZXN0Py5nZW9tZXRyeS50eXBlID09PSAnUG9pbnQnKSB7XG4gICAgICAgICAgICAgIGludGVyc2VjdCA9ICEoXG4gICAgICAgICAgICAgICAgdHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24odGVzdCwgcG9seVtpXSkgJiZcbiAgICAgICAgICAgICAgICB0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbih0ZXN0LCBwb2x5MltqXSlcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRlc3Q/Lmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJykge1xuICAgICAgICAgICAgICBpbnRlcnNlY3QgPSAhIXR1cmYuaW50ZXJzZWN0KHBvbHlbaV0sIHBvbHkyW2pdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGludGVyc2VjdCkge1xuICAgICAgICAgICAgICBicmVhayBsb29wMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW50ZXJzZWN0O1xuICB9XG5cbiAgZ2V0SW50ZXJzZWN0aW9uKHBvbHkxLCBwb2x5Mik6IEZlYXR1cmUge1xuICAgIHJldHVybiB0dXJmLmludGVyc2VjdChwb2x5MSwgcG9seTIpO1xuICB9XG4gIGdldERpc3RhbmNlKHBvaW50MSwgcG9pbnQyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdHVyZi5kaXN0YW5jZShwb2ludDEsIHBvaW50Mik7XG4gIH1cblxuICBpc1dpdGhpbihwb2x5Z29uMTogUG9zaXRpb25bXSwgcG9seWdvbjI6IFBvc2l0aW9uW10pOiBib29sZWFuIHtcbiAgICBcbiAgICBcbiAgICByZXR1cm4gdHVyZi5ib29sZWFuV2l0aGluKFxuICAgICAgdHVyZi5wb2x5Z29uKFtwb2x5Z29uMV0pLFxuICAgICAgdHVyZi5wb2x5Z29uKFtwb2x5Z29uMl0pXG4gICAgKTtcbiAgfVxuXG4gIGVxdWFsUG9seWdvbnMoXG4gICAgcG9seWdvbjE6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXG4gICAgcG9seWdvbjI6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cbiAgKSB7XG4gICAgXG4gICAgXG4gICAgXG4gIH1cbiAgLy9UT0RPIG9wdGlvbmFsIGFkZCBleHRyYSBtYXJrZXJzIGZvciBOIEUgUyBXIChXZSBoYXZlIHRoZSBjb3JuZXJzIE5XLCBORSwgU0UsIFNXKVxuICBjb252ZXJ0VG9Cb3VuZGluZ0JveFBvbHlnb24oXG4gICAgcG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcbiAgICBhZGRNaWRwb2ludE1hcmtlcnM6IGJvb2xlYW4gPSBmYWxzZVxuICApOiBGZWF0dXJlPFBvbHlnb24+IHtcbiAgICBjb25zdCBiYm94ID0gdHVyZi5iYm94KHBvbHlnb24uZ2VvbWV0cnkpO1xuICAgIGNvbnN0IGJib3hQb2x5Z29uID0gdHVyZi5iYm94UG9seWdvbihiYm94KTtcblxuICAgIGNvbnN0IGNvbXBhc3MgPSBuZXcgQ29tcGFzcyhiYm94WzFdLCBiYm94WzBdLCBiYm94WzNdLCBiYm94WzJdKTtcblxuICAgIGNvbnN0IGNvbXBhc3NQb3NpdGlvbnMgPSBjb21wYXNzLmdldFBvc2l0aW9ucygpO1xuXG4gICAgYmJveFBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMgPSBbXTtcbiAgICBiYm94UG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyA9IFtjb21wYXNzUG9zaXRpb25zXTtcblxuICAgIHJldHVybiBiYm94UG9seWdvbjtcbiAgfVxuICBwb2x5Z29uVG9NdWx0aVBvbHlnb24ocG9seTogRmVhdHVyZTxQb2x5Z29uPik6IEZlYXR1cmU8TXVsdGlQb2x5Z29uPiB7XG4gICAgY29uc3QgbXVsdGkgPSB0dXJmLm11bHRpUG9seWdvbihbcG9seS5nZW9tZXRyeS5jb29yZGluYXRlc10pO1xuICAgIHJldHVybiBtdWx0aTtcbiAgfVxuICAvL1RPRE8gLWNsZWFudXBcbiAgaW5qZWN0UG9pbnRUb1BvbHlnb24ocG9seWdvbiwgcG9pbnQpIHtcbiAgICBjb25zdCBjb29yZHMgPSB0dXJmLmdldENvb3Jkcyhwb2x5Z29uKTtcbiAgICBsZXQgbmV3UG9seWdvbjtcbiAgICBcbiAgICBpZiAoY29vcmRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XG4gICAgICBcbiAgICAgIGNvbnN0IGluZGV4ID0gdHVyZi5uZWFyZXN0UG9pbnQocG9pbnQsIHBvbHlnb25Qb2ludHMpLnByb3BlcnRpZXNcbiAgICAgICAgLmZlYXR1cmVJbmRleDtcbiAgICAgIGNvbnN0IHRlc3QgPSB0dXJmLmNvb3JkUmVkdWNlKFxuICAgICAgICBwb2x5Z29uUG9pbnRzLFxuICAgICAgICBmdW5jdGlvbihhY2N1bXVsYXRvciwgb2xkUG9pbnQsIGkpIHtcbiAgICAgICAgICBpZiAoaW5kZXggPT09IGkpIHtcbiAgICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50LCBwb2ludF07XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50XTtcbiAgICAgICAgfSxcbiAgICAgICAgW11cbiAgICAgICk7XG4gICAgICBcbiAgICAgIG5ld1BvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihbW3Rlc3RdXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHBvcyA9IFtdO1xuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gW107XG4gICAgICBjb29yZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgY29uc3QgcG9seWdvbiA9IHR1cmYucG9seWdvbihlbGVtZW50KTtcbiAgICAgICAgLy8gdHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pXG4gICAgICAgIGlmICh0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbihwb2ludCwgcG9seWdvbikpIHtcbiAgICAgICAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0gdHVyZi5uZWFyZXN0UG9pbnQocG9pbnQsIHBvbHlnb25Qb2ludHMpLnByb3BlcnRpZXNcbiAgICAgICAgICAgIC5mZWF0dXJlSW5kZXg7XG4gICAgICAgICAgY29vcmRpbmF0ZXMgPSB0dXJmLmNvb3JkUmVkdWNlKFxuICAgICAgICAgICAgcG9seWdvblBvaW50cyxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCBvbGRQb2ludCwgaSkge1xuICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludCwgcG9pbnRdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50XTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbXVxuICAgICAgICAgICk7XG4gICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcG9zLnB1c2goZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcG9zLnB1c2goW2Nvb3JkaW5hdGVzXSk7XG4gICAgICBuZXdQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24ocG9zKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1BvbHlnb247XG4gIH1cblxuICBwb2x5Z29uRGlmZmVyZW5jZShcbiAgICBwb2x5Z29uMTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcbiAgICBwb2x5Z29uMjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxuICApOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcbiAgICBjb25zdCBkaWZmID0gdHVyZi5kaWZmZXJlbmNlKHBvbHlnb24xLCBwb2x5Z29uMik7XG4gICAgXG4gICAgcmV0dXJuIHRoaXMuZ2V0VHVyZlBvbHlnb24oZGlmZik7XG4gIH1cbiAgZ2V0Qm91bmRpbmdCb3hDb21wYXNzUG9zaXRpb24oXG4gICAgcG9seWdvbixcbiAgICBNYXJrZXJQb3NpdGlvbjogSUNvbXBhc3MsXG4gICAgdXNlT2Zmc2V0LFxuICAgIG9mZnNldERpcmVjdGlvblxuICApIHtcbiAgICBjb25zdCBwID0gdGhpcy5nZXRNdWx0aVBvbHlnb24ocG9seWdvbik7XG4gICAgY29uc3QgY29tcGFzcyA9IHRoaXMuZ2V0Qm91bmRpbmdCb3hDb21wYXNzKHBvbHlnb24pO1xuICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XG4gICAgY29uc3QgY29vcmQgPSB0aGlzLmdldENvb3JkKGNvbXBhc3MuZGlyZWN0aW9uLk5vcnRoKTtcbiAgICBjb25zdCBuZWFyZXN0UG9pbnQgPSB0dXJmLm5lYXJlc3RQb2ludChjb29yZCwgcG9seWdvblBvaW50cyk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBwcml2YXRlIGdldEJvdW5kaW5nQm94Q29tcGFzcyhwb2x5Z29uKTogQ29tcGFzcyB7XG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0TXVsdGlQb2x5Z29uKHBvbHlnb24pO1xuICAgIGNvbnN0IGNlbnRlck9mTWFzcyA9IHR1cmYuY2VudGVyT2ZNYXNzKHApO1xuICAgIGNvbnN0IGIgPSB0dXJmLmJib3gocCk7XG4gICAgY29uc3QgbWluWCA9IGJbMF07XG4gICAgY29uc3QgbWluWSA9IGJbMV07XG4gICAgY29uc3QgbWF4WCA9IGJbMl07XG4gICAgY29uc3QgbWF4WSA9IGJbM107XG4gICAgY29uc3QgY29tcGFzcyA9IG5ldyBDb21wYXNzKG1pblgsIG1pblksIG1heFgsIG1heFkpO1xuICAgIC8vIGNvbXBhc3MuZGlyZWN0aW9uLkNlbnRlck9mTWFzcyA9IGNlbnRlck9mTWFzcy5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXTtcblxuICAgIHJldHVybiBjb21wYXNzO1xuICB9XG5cbiAgZ2V0TmVhcmVzdFBvaW50SW5kZXgoXG4gICAgdGFyZ2V0UG9pbnQ6IHR1cmYuQ29vcmQsXG4gICAgcG9pbnRzOiB0dXJmLkZlYXR1cmVDb2xsZWN0aW9uPHR1cmYuUG9pbnQ+XG4gICk6IG51bWJlciB7XG4gICAgY29uc3QgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludCh0YXJnZXRQb2ludCwgcG9pbnRzKS5wcm9wZXJ0aWVzLmZlYXR1cmVJbmRleDtcbiAgICByZXR1cm4gaW5kZXg7XG4gIH1cbiAgZ2V0Q29vcmQocG9pbnQ6IElMYXRMbmcpOiB0dXJmLkNvb3JkIHtcbiAgICBjb25zdCBjb29yZCA9IHR1cmYuZ2V0Q29vcmQoW3BvaW50LmxuZywgcG9pbnQubGF0XSk7XG4gICAgcmV0dXJuIGNvb3JkO1xuICB9XG4gIGdldEZlYXR1cmVQb2ludENvbGxlY3Rpb24ocG9pbnRzOiBJTGF0TG5nW10pOiB0dXJmLkZlYXR1cmVDb2xsZWN0aW9uIHtcbiAgICBjb25zdCBwdHMgPSBbXTtcbiAgICBwb2ludHMuZm9yRWFjaCh2ID0+IHtcbiAgICAgIGNvbnN0IHAgPSB0dXJmLnBvaW50KFt2LmxuZywgdi5sYXRdLCB7fSk7XG4gICAgICBwdHMucHVzaChwKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGZjID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihwdHMpO1xuXG4gICAgcmV0dXJuIGZjO1xuICB9XG59XG4iXX0=