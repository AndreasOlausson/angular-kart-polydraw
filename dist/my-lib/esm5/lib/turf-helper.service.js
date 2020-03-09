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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi90dXJmLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUlwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDOztBQUlsQztJQUVFO1FBRFEsc0JBQWlCLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRWhCLGlDQUFLLEdBQUwsVUFBTSxLQUFLLEVBQUUsS0FBSztRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU5QixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDBDQUFjLEdBQWQsVUFDRSxPQUF3QztRQUV4Qyx3Q0FBd0M7UUFDeEMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVyQyxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDckUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLENB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QyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QscURBQXlCLEdBQXpCLFVBQTBCLE1BQWlCO1FBQ3pDLElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO1lBQ2QsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztRQUVILElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV2QyxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7O0lBblJVLGlCQUFpQjtRQUQ3QixVQUFVLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7O09BQ3RCLGlCQUFpQixDQW9SN0I7NEJBL1JEO0NBK1JDLEFBcFJELElBb1JDO1NBcFJZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgdHVyZiBmcm9tICdAdHVyZi90dXJmJztcbmltcG9ydCBjb25jYXZlbWFuIGZyb20gJ2NvbmNhdmVtYW4nO1xuaW1wb3J0IHsgRmVhdHVyZSwgUG9seWdvbiwgTXVsdGlQb2x5Z29uLCBQb3NpdGlvbiB9IGZyb20gJ0B0dXJmL3R1cmYnO1xuaW1wb3J0IHsgTWFya2VyUG9zaXRpb24gfSBmcm9tICcuL2VudW1zJztcbmltcG9ydCB7IElDb21wYXNzIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgQ29tcGFzcyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBUdXJmSGVscGVyU2VydmljZSB7XG4gIHByaXZhdGUgc2ltcGxpZnlUb2xlcmFuY2UgPSB7IHRvbGVyYW5jZTogMC4wMDAxLCBoaWdoUXVhbGl0eTogZmFsc2UgfTtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIHVuaW9uKHBvbHkxLCBwb2x5Mik6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xuICAgIGNvbnNvbGUubG9nKCdwb2x5MTogJywgcG9seTEpO1xuICAgIGNvbnNvbGUubG9nKCdwb2x5MjogJywgcG9seTIpO1xuXG4gICAgY29uc3QgdW5pb24gPSB0dXJmLnVuaW9uKHBvbHkxLCBwb2x5Mik7XG5cbiAgICByZXR1cm4gdGhpcy5nZXRUdXJmUG9seWdvbih1bmlvbik7XG4gIH1cblxuICB0dXJmQ29uY2F2ZW1hbihcbiAgICBmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xuICAgIC8vY29uc29sZS5sb2coXCJ0dXJmQ29uY2F2ZW1hblwiLCBwb2ludHMpO1xuICAgIGNvbnN0IHBvaW50cyA9IHR1cmYuZXhwbG9kZShmZWF0dXJlKTtcblxuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gcG9pbnRzLmZlYXR1cmVzLm1hcChmID0+IGYuZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuICAgIHJldHVybiB0dXJmLm11bHRpUG9seWdvbihbW2NvbmNhdmVtYW4oY29vcmRpbmF0ZXMpXV0pO1xuICB9XG5cbiAgLy9UT0RPIGFkZCBzb21lIHNvcnQgb2YgZHluYW1pYyB0b2xlcmFuY2VcbiAgZ2V0U2ltcGxpZmllZChcbiAgICBwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xuICAgIGNvbnN0IHRvbGVyYW5jZSA9IHRoaXMuc2ltcGxpZnlUb2xlcmFuY2U7XG4gICAgY29uc3Qgc2ltcGxpZmllZCA9IHR1cmYuc2ltcGxpZnkocG9seWdvbiwgdG9sZXJhbmNlKTtcbiAgICByZXR1cm4gc2ltcGxpZmllZDtcbiAgfVxuXG4gIGdldFR1cmZQb2x5Z29uKFxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XG4gICAgbGV0IHR1cmZQb2x5Z29uO1xuICAgIGNvbnNvbGUubG9nKCdHZXQgVHVyZlBvbHlnb246JywgcG9seWdvbik7XG4gICAgLy8gaWYgKHBvbHlnb24uZ2VvbWV0cnkpXG4gICAgaWYgKHBvbHlnb24uZ2VvbWV0cnkudHlwZSA9PT0gJ1BvbHlnb24nKSB7XG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtwb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHR1cmZQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24ocG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyk7XG4gICAgfVxuICAgIHJldHVybiB0dXJmUG9seWdvbjtcbiAgfVxuXG4gIGdldE11bHRpUG9seWdvbihcbiAgICBwb2x5Z29uQXJyYXk6IFBvc2l0aW9uW11bXVtdXG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xuICAgIHJldHVybiB0dXJmLm11bHRpUG9seWdvbihwb2x5Z29uQXJyYXkpO1xuICB9XG5cbiAgZ2V0S2lua3MoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xuICAgIGNvbnN0IHVua2luayA9IHR1cmYudW5raW5rUG9seWdvbihmZWF0dXJlKTtcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IFtdO1xuICAgIHR1cmYuZmVhdHVyZUVhY2godW5raW5rLCBjdXJyZW50ID0+IHtcbiAgICAgIGNvb3JkaW5hdGVzLnB1c2goY3VycmVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29vcmRpbmF0ZXM7XG4gIH1cblxuICBnZXRDb29yZHMoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xuICAgIHJldHVybiB0dXJmLmdldENvb3JkcyhmZWF0dXJlKTtcbiAgfVxuXG4gIGhhc0tpbmtzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcbiAgICBjb25zdCBraW5rcyA9IHR1cmYua2lua3MoZmVhdHVyZSk7XG4gICAgcmV0dXJuIGtpbmtzLmZlYXR1cmVzLmxlbmd0aCA+IDA7XG4gIH1cblxuICBwb2x5Z29uSW50ZXJzZWN0KFxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXG4gICAgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxuICApOiBib29sZWFuIHtcbiAgICAvLyBjb25zdCBvbGRQb2x5Z29uID0gcG9seWdvbi50b0dlb0pTT04oKTtcbiAgICBjb25zdCBwb2x5ID0gW107XG4gICAgY29uc3QgcG9seTIgPSBbXTtcblxuICAgIGNvbnNvbGUubG9nKCdwb2x5Z29uSW50ZXJzZWN0JywgcG9seWdvbiwgbGF0bG5ncyk7XG5cbiAgICBjb25zdCBsYXRsbmdzQ29vcmRzID0gdHVyZi5nZXRDb29yZHMobGF0bG5ncyk7XG4gICAgbGF0bG5nc0Nvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgY29uc3QgZmVhdCA9IHsgdHlwZTogJ1BvbHlnb24nLCBjb29yZGluYXRlczogW2VsZW1lbnRbMF1dIH07XG5cbiAgICAgIHBvbHkucHVzaChmZWF0KTtcbiAgICB9KTtcbiAgICBjb25zdCBwb2x5Z29uQ29vcmRzID0gdHVyZi5nZXRDb29yZHMocG9seWdvbik7XG4gICAgcG9seWdvbkNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgY29uc3QgZmVhdCA9IHsgdHlwZTogJ1BvbHlnb24nLCBjb29yZGluYXRlczogW2VsZW1lbnRbMF1dIH07XG5cbiAgICAgIHBvbHkyLnB1c2goZmVhdCk7XG4gICAgfSk7XG4gICAgbGV0IGludGVyc2VjdCA9IGZhbHNlO1xuICAgIGxvb3AxOiBmb3IgKGxldCBpID0gMDsgaSA8IHBvbHkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmdldEtpbmtzKHBvbHlbaV0pLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb2x5Mi5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmICh0aGlzLmdldEtpbmtzKHBvbHkyW2pdKS5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXN0ID0gdHVyZi5pbnRlcnNlY3QocG9seVtpXSwgcG9seTJbal0pO1xuICAgICAgICAgICAgaWYgKHRlc3Q/Lmdlb21ldHJ5LnR5cGUgPT09ICdQb2ludCcpIHtcbiAgICAgICAgICAgICAgaW50ZXJzZWN0ID0gIShcbiAgICAgICAgICAgICAgICB0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbih0ZXN0LCBwb2x5W2ldKSAmJlxuICAgICAgICAgICAgICAgIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHRlc3QsIHBvbHkyW2pdKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSW50ZXJzZWN0IHRlc3Q6ICcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0ZXN0Py5nZW9tZXRyeS50eXBlID09PSAnUG9seWdvbicpIHtcbiAgICAgICAgICAgICAgaW50ZXJzZWN0ID0gISF0dXJmLmludGVyc2VjdChwb2x5W2ldLCBwb2x5MltqXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbnRlcnNlY3QpIHtcbiAgICAgICAgICAgICAgYnJlYWsgbG9vcDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGludGVyc2VjdDtcbiAgfVxuXG4gIGdldEludGVyc2VjdGlvbihwb2x5MSwgcG9seTIpOiBGZWF0dXJlIHtcbiAgICByZXR1cm4gdHVyZi5pbnRlcnNlY3QocG9seTEsIHBvbHkyKTtcbiAgfVxuICBnZXREaXN0YW5jZShwb2ludDEsIHBvaW50Mik6IG51bWJlciB7XG4gICAgcmV0dXJuIHR1cmYuZGlzdGFuY2UocG9pbnQxLCBwb2ludDIpO1xuICB9XG5cbiAgaXNXaXRoaW4ocG9seWdvbjE6IFBvc2l0aW9uW10sIHBvbHlnb24yOiBQb3NpdGlvbltdKTogYm9vbGVhbiB7XG4gICAgY29uc29sZS5sb2cocG9seWdvbjEpO1xuICAgIGNvbnNvbGUubG9nKCdZdHJlOiAnLCBwb2x5Z29uMik7XG4gICAgcmV0dXJuIHR1cmYuYm9vbGVhbldpdGhpbihcbiAgICAgIHR1cmYucG9seWdvbihbcG9seWdvbjFdKSxcbiAgICAgIHR1cmYucG9seWdvbihbcG9seWdvbjJdKVxuICAgICk7XG4gIH1cblxuICBlcXVhbFBvbHlnb25zKFxuICAgIHBvbHlnb24xOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxuICAgIHBvbHlnb24yOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XG4gICkge1xuICAgIGNvbnNvbGUubG9nKHBvbHlnb24xKTtcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMik7XG4gICAgY29uc29sZS5sb2codHVyZi5ib29sZWFuRXF1YWwocG9seWdvbjEsIHBvbHlnb24yKSk7XG4gIH1cbiAgLy9UT0RPIG9wdGlvbmFsIGFkZCBleHRyYSBtYXJrZXJzIGZvciBOIEUgUyBXIChXZSBoYXZlIHRoZSBjb3JuZXJzIE5XLCBORSwgU0UsIFNXKVxuICBjb252ZXJ0VG9Cb3VuZGluZ0JveFBvbHlnb24oXG4gICAgcG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcbiAgICBhZGRNaWRwb2ludE1hcmtlcnM6IGJvb2xlYW4gPSBmYWxzZVxuICApOiBGZWF0dXJlPFBvbHlnb24+IHtcbiAgICBjb25zdCBiYm94ID0gdHVyZi5iYm94KHBvbHlnb24uZ2VvbWV0cnkpO1xuICAgIGNvbnN0IGJib3hQb2x5Z29uID0gdHVyZi5iYm94UG9seWdvbihiYm94KTtcblxuICAgIGNvbnN0IGNvbXBhc3MgPSBuZXcgQ29tcGFzcyhiYm94WzFdLCBiYm94WzBdLCBiYm94WzNdLCBiYm94WzJdKTtcblxuICAgIGNvbnN0IGNvbXBhc3NQb3NpdGlvbnMgPSBjb21wYXNzLmdldFBvc2l0aW9ucygpO1xuXG4gICAgYmJveFBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMgPSBbXTtcbiAgICBiYm94UG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyA9IFtjb21wYXNzUG9zaXRpb25zXTtcblxuICAgIHJldHVybiBiYm94UG9seWdvbjtcbiAgfVxuICBwb2x5Z29uVG9NdWx0aVBvbHlnb24ocG9seTogRmVhdHVyZTxQb2x5Z29uPik6IEZlYXR1cmU8TXVsdGlQb2x5Z29uPiB7XG4gICAgY29uc3QgbXVsdGkgPSB0dXJmLm11bHRpUG9seWdvbihbcG9seS5nZW9tZXRyeS5jb29yZGluYXRlc10pO1xuICAgIHJldHVybiBtdWx0aTtcbiAgfVxuICAvL1RPRE8gLWNsZWFudXBcbiAgaW5qZWN0UG9pbnRUb1BvbHlnb24ocG9seWdvbiwgcG9pbnQpIHtcbiAgICBjb25zdCBjb29yZHMgPSB0dXJmLmdldENvb3Jkcyhwb2x5Z29uKTtcbiAgICBsZXQgbmV3UG9seWdvbjtcbiAgICBjb25zb2xlLmxvZygncG9seWdvbjogJywgcG9seWdvbik7XG4gICAgaWYgKGNvb3Jkcy5sZW5ndGggPCAyKSB7XG4gICAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xuICAgICAgY29uc29sZS5sb2codHVyZi5uZWFyZXN0UG9pbnQocG9pbnQsIHBvbHlnb25Qb2ludHMpKTtcbiAgICAgIGNvbnN0IGluZGV4ID0gdHVyZi5uZWFyZXN0UG9pbnQocG9pbnQsIHBvbHlnb25Qb2ludHMpLnByb3BlcnRpZXNcbiAgICAgICAgLmZlYXR1cmVJbmRleDtcbiAgICAgIGNvbnN0IHRlc3QgPSB0dXJmLmNvb3JkUmVkdWNlKFxuICAgICAgICBwb2x5Z29uUG9pbnRzLFxuICAgICAgICBmdW5jdGlvbihhY2N1bXVsYXRvciwgb2xkUG9pbnQsIGkpIHtcbiAgICAgICAgICBpZiAoaW5kZXggPT09IGkpIHtcbiAgICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50LCBwb2ludF07XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50XTtcbiAgICAgICAgfSxcbiAgICAgICAgW11cbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZygndGVzdCcsIHRlc3QpO1xuICAgICAgbmV3UG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtbdGVzdF1dKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcG9zID0gW107XG4gICAgICBsZXQgY29vcmRpbmF0ZXMgPSBbXTtcbiAgICAgIGNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICBjb25zdCBwb2x5Z29uID0gdHVyZi5wb2x5Z29uKGVsZW1lbnQpO1xuICAgICAgICAvLyB0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbihwb2ludCwgcG9seWdvbilcbiAgICAgICAgaWYgKHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHBvaW50LCBwb2x5Z29uKSkge1xuICAgICAgICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykucHJvcGVydGllc1xuICAgICAgICAgICAgLmZlYXR1cmVJbmRleDtcbiAgICAgICAgICBjb29yZGluYXRlcyA9IHR1cmYuY29vcmRSZWR1Y2UoXG4gICAgICAgICAgICBwb2x5Z29uUG9pbnRzLFxuICAgICAgICAgICAgZnVuY3Rpb24oYWNjdW11bGF0b3IsIG9sZFBvaW50LCBpKSB7XG4gICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50LCBwb2ludF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnRdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFtdXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnY29vcmRpbmF0ZXMnLCBjb29yZGluYXRlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcG9zLnB1c2goZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcG9zLnB1c2goW2Nvb3JkaW5hdGVzXSk7XG4gICAgICBuZXdQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24ocG9zKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1BvbHlnb247XG4gIH1cblxuICBwb2x5Z29uRGlmZmVyZW5jZShcbiAgICBwb2x5Z29uMTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcbiAgICBwb2x5Z29uMjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxuICApOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcbiAgICBjb25zdCBkaWZmID0gdHVyZi5kaWZmZXJlbmNlKHBvbHlnb24xLCBwb2x5Z29uMik7XG4gICAgY29uc29sZS5sb2coZGlmZik7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VHVyZlBvbHlnb24oZGlmZik7XG4gIH1cbiAgZ2V0Qm91bmRpbmdCb3hDb21wYXNzUG9zaXRpb24oXG4gICAgcG9seWdvbixcbiAgICBNYXJrZXJQb3NpdGlvbjogSUNvbXBhc3MsXG4gICAgdXNlT2Zmc2V0LFxuICAgIG9mZnNldERpcmVjdGlvblxuICApIHtcbiAgICBjb25zdCBwID0gdGhpcy5nZXRNdWx0aVBvbHlnb24ocG9seWdvbik7XG4gICAgY29uc3QgY29tcGFzcyA9IHRoaXMuZ2V0Qm91bmRpbmdCb3hDb21wYXNzKHBvbHlnb24pO1xuICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XG4gICAgY29uc3QgY29vcmQgPSB0aGlzLmdldENvb3JkKGNvbXBhc3MuZGlyZWN0aW9uLk5vcnRoKTtcbiAgICBjb25zdCBuZWFyZXN0UG9pbnQgPSB0dXJmLm5lYXJlc3RQb2ludChjb29yZCwgcG9seWdvblBvaW50cyk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBwcml2YXRlIGdldEJvdW5kaW5nQm94Q29tcGFzcyhwb2x5Z29uKTogQ29tcGFzcyB7XG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0TXVsdGlQb2x5Z29uKHBvbHlnb24pO1xuICAgIGNvbnN0IGNlbnRlck9mTWFzcyA9IHR1cmYuY2VudGVyT2ZNYXNzKHApO1xuICAgIGNvbnN0IGIgPSB0dXJmLmJib3gocCk7XG4gICAgY29uc3QgbWluWCA9IGJbMF07XG4gICAgY29uc3QgbWluWSA9IGJbMV07XG4gICAgY29uc3QgbWF4WCA9IGJbMl07XG4gICAgY29uc3QgbWF4WSA9IGJbM107XG4gICAgY29uc3QgY29tcGFzcyA9IG5ldyBDb21wYXNzKG1pblgsIG1pblksIG1heFgsIG1heFkpO1xuICAgIC8vIGNvbXBhc3MuZGlyZWN0aW9uLkNlbnRlck9mTWFzcyA9IGNlbnRlck9mTWFzcy5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXTtcblxuICAgIHJldHVybiBjb21wYXNzO1xuICB9XG5cbiAgZ2V0TmVhcmVzdFBvaW50SW5kZXgoXG4gICAgdGFyZ2V0UG9pbnQ6IHR1cmYuQ29vcmQsXG4gICAgcG9pbnRzOiB0dXJmLkZlYXR1cmVDb2xsZWN0aW9uPHR1cmYuUG9pbnQ+XG4gICk6IG51bWJlciB7XG4gICAgY29uc3QgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludCh0YXJnZXRQb2ludCwgcG9pbnRzKS5wcm9wZXJ0aWVzLmZlYXR1cmVJbmRleDtcbiAgICByZXR1cm4gaW5kZXg7XG4gIH1cbiAgZ2V0Q29vcmQocG9pbnQ6IElMYXRMbmcpOiB0dXJmLkNvb3JkIHtcbiAgICBjb25zdCBjb29yZCA9IHR1cmYuZ2V0Q29vcmQoW3BvaW50LmxuZywgcG9pbnQubGF0XSk7XG4gICAgcmV0dXJuIGNvb3JkO1xuICB9XG4gIGdldEZlYXR1cmVQb2ludENvbGxlY3Rpb24ocG9pbnRzOiBJTGF0TG5nW10pOiB0dXJmLkZlYXR1cmVDb2xsZWN0aW9uIHtcbiAgICBjb25zdCBwdHMgPSBbXTtcbiAgICBwb2ludHMuZm9yRWFjaCh2ID0+IHtcbiAgICAgIGNvbnN0IHAgPSB0dXJmLnBvaW50KFt2LmxuZywgdi5sYXRdLCB7fSk7XG4gICAgICBwdHMucHVzaChwKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGZjID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihwdHMpO1xuXG4gICAgcmV0dXJuIGZjO1xuICB9XG59XG4iXX0=