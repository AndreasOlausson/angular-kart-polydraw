import * as tslib_1 from "tslib";
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
                    return tslib_1.__spread(accumulator, [oldPoint, point]);
                }
                return tslib_1.__spread(accumulator, [oldPoint]);
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
                            return tslib_1.__spread(accumulator, [oldPoint, point]);
                        }
                        return tslib_1.__spread(accumulator, [oldPoint]);
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
    TurfHelperService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function TurfHelperService_Factory() { return new TurfHelperService(); }, token: TurfHelperService, providedIn: "root" });
    TurfHelperService = tslib_1.__decorate([
        Injectable({ providedIn: 'root' }),
        tslib_1.__metadata("design:paramtypes", [])
    ], TurfHelperService);
    return TurfHelperService;
}());
export { TurfHelperService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi90dXJmLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUlwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDOztBQUlsQztJQUVFO1FBRFEsc0JBQWlCLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRWhCLGlDQUFLLEdBQUwsVUFBTSxLQUFLLEVBQUUsS0FBSztRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU5QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVyQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDBDQUFjLEdBQWQsVUFBZSxPQUF3QztRQUNyRCx3Q0FBd0M7UUFDeEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVuQyxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDckUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUdELHlDQUF5QztJQUN6Qyx5Q0FBYSxHQUFiLFVBQWMsT0FBd0M7UUFDcEQsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQ3pDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFRCwwQ0FBYyxHQUFkLFVBQWUsT0FBd0M7UUFDckQsSUFBSSxXQUFXLENBQUM7UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6Qyx3QkFBd0I7UUFDeEIsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDdkMsV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7U0FDakU7YUFBTTtZQUNMLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDL0Q7UUFDRCxPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBRUQsMkNBQWUsR0FBZixVQUFnQixZQUE0QjtRQUMxQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELG9DQUFRLEdBQVIsVUFBUyxPQUF3QztRQUMvQyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxVQUFBLE9BQU87WUFDOUIsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxxQ0FBUyxHQUFULFVBQVUsT0FBd0M7UUFDaEQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxvQ0FBUSxHQUFSLFVBQVMsT0FBd0M7UUFDL0MsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsNENBQWdCLEdBQWhCLFVBQWlCLE9BQXdDLEVBQUUsT0FBd0M7UUFDakcsMENBQTBDO1FBQzFDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUVmLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWxELElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU87WUFDM0IsSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFMUQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU87WUFDM0IsSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFMUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN0QixLQUFLLEVBQUUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0MsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNyQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTt3QkFDdEMsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDaEQsSUFBSSxTQUFTLEVBQUU7NEJBQ2IsTUFBTSxLQUFLLENBQUM7eUJBQ2I7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUVELDJDQUFlLEdBQWYsVUFBZ0IsS0FBSyxFQUFFLEtBQUs7UUFDMUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ0QsdUNBQVcsR0FBWCxVQUFZLE1BQU0sRUFBRSxNQUFNO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELG9DQUFRLEdBQVIsVUFBUyxRQUFvQixFQUFFLFFBQW9CO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDaEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVELHlDQUFhLEdBQWIsVUFBYyxRQUF5QyxFQUFFLFFBQXlDO1FBQ2hHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUNELGtGQUFrRjtJQUNsRix1REFBMkIsR0FBM0IsVUFBNEIsT0FBd0MsRUFBRSxrQkFBbUM7UUFBbkMsbUNBQUEsRUFBQSwwQkFBbUM7UUFDdkcsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUczQyxJQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVoRSxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVoRCxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXRELE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFDRCxpREFBcUIsR0FBckIsVUFBc0IsSUFBc0I7UUFDMUMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUM3RCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxlQUFlO0lBQ2YsZ0RBQW9CLEdBQXBCLFVBQXFCLE9BQU8sRUFBRSxLQUFLO1FBQ2pDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsSUFBSSxVQUFVLENBQUM7UUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3JCLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksT0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUM7WUFDNUUsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FDM0IsYUFBYSxFQUNiLFVBQVMsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDO2dCQUMvQixJQUFJLE9BQUssS0FBSyxDQUFDLEVBQUU7b0JBQ2Ysd0JBQVcsV0FBVyxHQUFFLFFBQVEsRUFBRSxLQUFLLEdBQUU7aUJBQzFDO2dCQUNELHdCQUFXLFdBQVcsR0FBRSxRQUFRLEdBQUU7WUFDcEMsQ0FBQyxFQUNELEVBQUUsQ0FDSCxDQUFDO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUIsVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxQzthQUFNO1lBQ0wsSUFBSSxLQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ2IsSUFBSSxhQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPO2dCQUNwQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNwQyw2Q0FBNkM7Z0JBQzdDLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBRTtvQkFDOUMsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDNUMsSUFBSSxPQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQztvQkFDNUUsYUFBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQzVCLGFBQWEsRUFDYixVQUFTLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQzt3QkFDL0IsSUFBSSxPQUFLLEtBQUssQ0FBQyxFQUFFOzRCQUNmLHdCQUFXLFdBQVcsR0FBRSxRQUFRLEVBQUUsS0FBSyxHQUFFO3lCQUMxQzt3QkFDRCx3QkFBVyxXQUFXLEdBQUUsUUFBUSxHQUFFO29CQUNwQyxDQUFDLEVBQ0QsRUFBRSxDQUNILENBQUM7b0JBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsYUFBVyxDQUFDLENBQUM7aUJBQ3pDO3FCQUFNO29CQUNMLEtBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ25CO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBVyxDQUFDLENBQUMsQ0FBQztZQUN4QixVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFHLENBQUMsQ0FBQztTQUNyQztRQUNELE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFRCw2Q0FBaUIsR0FBakIsVUFBa0IsUUFBeUMsRUFBRSxRQUF5QztRQUNwRyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBQ0QseURBQTZCLEdBQTdCLFVBQThCLE9BQU8sRUFBRSxjQUF3QixFQUFFLFNBQVMsRUFBRSxlQUFlO1FBQ3pGLElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JELElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRTdELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNPLGlEQUFxQixHQUE3QixVQUE4QixPQUFPO1FBQ25DLElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQyxJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLElBQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixJQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLElBQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixJQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwRCw0RUFBNEU7UUFFNUUsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELGdEQUFvQixHQUFwQixVQUFxQixXQUF1QixFQUFFLE1BQTBDO1FBQ3RGLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUM7UUFDM0UsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0Qsb0NBQVEsR0FBUixVQUFTLEtBQWM7UUFDckIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QscURBQXlCLEdBQXpCLFVBQTBCLE1BQWlCO1FBQ3pDLElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO1lBQ2QsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztRQUVILElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV2QyxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7O0lBMU9VLGlCQUFpQjtRQUQ3QixVQUFVLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7O09BQ3RCLGlCQUFpQixDQTJPN0I7NEJBdFBEO0NBc1BDLEFBM09ELElBMk9DO1NBM09ZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCAqIGFzIHR1cmYgZnJvbSAnQHR1cmYvdHVyZic7XHJcbmltcG9ydCBjb25jYXZlbWFuIGZyb20gJ2NvbmNhdmVtYW4nO1xyXG5pbXBvcnQgeyBGZWF0dXJlLCBQb2x5Z29uLCBNdWx0aVBvbHlnb24sIFBvc2l0aW9uIH0gZnJvbSAnQHR1cmYvdHVyZic7XHJcbmltcG9ydCB7IE1hcmtlclBvc2l0aW9uIH0gZnJvbSAnLi9lbnVtcyc7XHJcbmltcG9ydCB7IElDb21wYXNzIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBDb21wYXNzIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tICcuL3BvbHlnb24taGVscGVycyc7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxyXG5leHBvcnQgY2xhc3MgVHVyZkhlbHBlclNlcnZpY2Uge1xyXG4gIHByaXZhdGUgc2ltcGxpZnlUb2xlcmFuY2UgPSB7IHRvbGVyYW5jZTogMC4wMDAxLCBoaWdoUXVhbGl0eTogZmFsc2UgfTtcclxuICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gIHVuaW9uKHBvbHkxLCBwb2x5Mik6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgY29uc29sZS5sb2coJ3BvbHkxOiAnLCBwb2x5MSk7XHJcbiAgICBjb25zb2xlLmxvZygncG9seTI6ICcsIHBvbHkyKTtcclxuXHJcbiAgICBsZXQgdW5pb24gPSB0dXJmLnVuaW9uKHBvbHkxLCBwb2x5Mik7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VHVyZlBvbHlnb24odW5pb24pO1xyXG4gIH1cclxuXHJcbiAgdHVyZkNvbmNhdmVtYW4oZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPik6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcInR1cmZDb25jYXZlbWFuXCIsIHBvaW50cyk7XHJcbiAgICBsZXQgcG9pbnRzID0gdHVyZi5leHBsb2RlKGZlYXR1cmUpO1xyXG5cclxuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gcG9pbnRzLmZlYXR1cmVzLm1hcChmID0+IGYuZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xyXG4gICAgcmV0dXJuIHR1cmYubXVsdGlQb2x5Z29uKFtbY29uY2F2ZW1hbihjb29yZGluYXRlcyldXSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy9UT0RPIGFkZCBzb21lIHNvcnQgb2YgZHluYW1pYyB0b2xlcmFuY2VcclxuICBnZXRTaW1wbGlmaWVkKHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIGNvbnN0IHRvbGVyYW5jZSA9IHRoaXMuc2ltcGxpZnlUb2xlcmFuY2U7XHJcbiAgICBjb25zdCBzaW1wbGlmaWVkID0gdHVyZi5zaW1wbGlmeShwb2x5Z29uLCB0b2xlcmFuY2UpO1xyXG4gICAgcmV0dXJuIHNpbXBsaWZpZWQ7XHJcbiAgfVxyXG5cclxuICBnZXRUdXJmUG9seWdvbihwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBsZXQgdHVyZlBvbHlnb247XHJcbiAgICBjb25zb2xlLmxvZygnR2V0IFR1cmZQb2x5Z29uOicsIHBvbHlnb24pO1xyXG4gICAgLy8gaWYgKHBvbHlnb24uZ2VvbWV0cnkpXHJcbiAgICBpZiAocG9seWdvbi5nZW9tZXRyeS50eXBlID09PSAnUG9seWdvbicpIHtcclxuICAgICAgdHVyZlBvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihbcG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlc10pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdHVyZlBvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihwb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0dXJmUG9seWdvbjtcclxuICB9XHJcblxyXG4gIGdldE11bHRpUG9seWdvbihwb2x5Z29uQXJyYXk6IFBvc2l0aW9uW11bXVtdKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICByZXR1cm4gdHVyZi5tdWx0aVBvbHlnb24ocG9seWdvbkFycmF5KTtcclxuICB9XHJcblxyXG4gIGdldEtpbmtzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnN0IHVua2luayA9IHR1cmYudW5raW5rUG9seWdvbihmZWF0dXJlKTtcclxuICAgIGxldCBjb29yZGluYXRlcyA9IFtdO1xyXG4gICAgdHVyZi5mZWF0dXJlRWFjaCh1bmtpbmssIGN1cnJlbnQgPT4ge1xyXG4gICAgICBjb29yZGluYXRlcy5wdXNoKGN1cnJlbnQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGNvb3JkaW5hdGVzO1xyXG4gIH1cclxuXHJcbiAgZ2V0Q29vcmRzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIHJldHVybiB0dXJmLmdldENvb3JkcyhmZWF0dXJlKTtcclxuICB9XHJcblxyXG4gIGhhc0tpbmtzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnN0IGtpbmtzID0gdHVyZi5raW5rcyhmZWF0dXJlKTtcclxuICAgIHJldHVybiBraW5rcy5mZWF0dXJlcy5sZW5ndGggPiAwO1xyXG4gIH1cclxuXHJcbiAgcG9seWdvbkludGVyc2VjdChwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LCBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KTogYm9vbGVhbiB7XHJcbiAgICAvLyBjb25zdCBvbGRQb2x5Z29uID0gcG9seWdvbi50b0dlb0pTT04oKTtcclxuICAgIGxldCBwb2x5ID0gW107XHJcbiAgICBsZXQgcG9seTIgPSBbXTtcclxuXHJcbiAgICBjb25zb2xlLmxvZygncG9seWdvbkludGVyc2VjdCcsIHBvbHlnb24sIGxhdGxuZ3MpO1xyXG5cclxuICAgIGxldCBsYXRsbmdzQ29vcmRzID0gdHVyZi5nZXRDb29yZHMobGF0bG5ncyk7XHJcbiAgICBsYXRsbmdzQ29vcmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgIGxldCBmZWF0ID0geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbZWxlbWVudFswXV0gfTtcclxuXHJcbiAgICAgIHBvbHkucHVzaChmZWF0KTtcclxuICAgIH0pO1xyXG4gICAgbGV0IHBvbHlnb25Db29yZHMgPSB0dXJmLmdldENvb3Jkcyhwb2x5Z29uKTtcclxuICAgIHBvbHlnb25Db29yZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgbGV0IGZlYXQgPSB7IHR5cGU6ICdQb2x5Z29uJywgY29vcmRpbmF0ZXM6IFtlbGVtZW50WzBdXSB9O1xyXG5cclxuICAgICAgcG9seTIucHVzaChmZWF0KTtcclxuICAgIH0pO1xyXG4gICAgbGV0IGludGVyc2VjdCA9IGZhbHNlO1xyXG4gICAgbG9vcDE6IGZvciAobGV0IGkgPSAwOyBpIDwgcG9seS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAodGhpcy5nZXRLaW5rcyhwb2x5W2ldKS5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb2x5Mi5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgaWYgKHRoaXMuZ2V0S2lua3MocG9seTJbal0pLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgaW50ZXJzZWN0ID0gISF0dXJmLmludGVyc2VjdChwb2x5W2ldLCBwb2x5MltqXSk7XHJcbiAgICAgICAgICAgIGlmIChpbnRlcnNlY3QpIHtcclxuICAgICAgICAgICAgICBicmVhayBsb29wMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpbnRlcnNlY3Q7XHJcbiAgfVxyXG5cclxuICBnZXRJbnRlcnNlY3Rpb24ocG9seTEsIHBvbHkyKTogRmVhdHVyZSB7XHJcbiAgICByZXR1cm4gdHVyZi5pbnRlcnNlY3QocG9seTEsIHBvbHkyKTtcclxuICB9XHJcbiAgZ2V0RGlzdGFuY2UocG9pbnQxLCBwb2ludDIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHR1cmYuZGlzdGFuY2UocG9pbnQxLCBwb2ludDIpO1xyXG4gIH1cclxuXHJcbiAgaXNXaXRoaW4ocG9seWdvbjE6IFBvc2l0aW9uW10sIHBvbHlnb24yOiBQb3NpdGlvbltdKTogYm9vbGVhbiB7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMSk7XHJcbiAgICBjb25zb2xlLmxvZygnWXRyZTogJywgcG9seWdvbjIpO1xyXG4gICAgcmV0dXJuIHR1cmYuYm9vbGVhbldpdGhpbih0dXJmLnBvbHlnb24oW3BvbHlnb24xXSksIHR1cmYucG9seWdvbihbcG9seWdvbjJdKSk7XHJcbiAgfVxyXG5cclxuICBlcXVhbFBvbHlnb25zKHBvbHlnb24xOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LCBwb2x5Z29uMjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbjEpO1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbjIpO1xyXG4gICAgY29uc29sZS5sb2codHVyZi5ib29sZWFuRXF1YWwocG9seWdvbjEsIHBvbHlnb24yKSk7XHJcbiAgfVxyXG4gIC8vVE9ETyBvcHRpb25hbCBhZGQgZXh0cmEgbWFya2VycyBmb3IgTiBFIFMgVyAoV2UgaGF2ZSB0aGUgY29ybmVycyBOVywgTkUsIFNFLCBTVylcclxuICBjb252ZXJ0VG9Cb3VuZGluZ0JveFBvbHlnb24ocG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiwgYWRkTWlkcG9pbnRNYXJrZXJzOiBib29sZWFuID0gZmFsc2UpOiBGZWF0dXJlPFBvbHlnb24+IHtcclxuICAgIGNvbnN0IGJib3ggPSB0dXJmLmJib3gocG9seWdvbi5nZW9tZXRyeSk7XHJcbiAgICBjb25zdCBiYm94UG9seWdvbiA9IHR1cmYuYmJveFBvbHlnb24oYmJveCk7XHJcblxyXG5cclxuICAgIGNvbnN0IGNvbXBhc3MgPSBuZXcgQ29tcGFzcyhiYm94WzFdLCBiYm94WzBdLCBiYm94WzNdLCBiYm94WzJdKTtcclxuXHJcbiAgICBjb25zdCBjb21wYXNzUG9zaXRpb25zID0gY29tcGFzcy5nZXRQb3NpdGlvbnMoKTtcclxuXHJcbiAgICBiYm94UG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyA9IFtdO1xyXG4gICAgYmJveFBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMgPSBbY29tcGFzc1Bvc2l0aW9uc107XHJcblxyXG4gICAgcmV0dXJuIGJib3hQb2x5Z29uO1xyXG4gIH1cclxuICBwb2x5Z29uVG9NdWx0aVBvbHlnb24ocG9seTogRmVhdHVyZTxQb2x5Z29uPik6IEZlYXR1cmU8TXVsdGlQb2x5Z29uPiB7XHJcbiAgICBjb25zdCBtdWx0aSA9IHR1cmYubXVsdGlQb2x5Z29uKFtwb2x5Lmdlb21ldHJ5LmNvb3JkaW5hdGVzXSk7XHJcbiAgICByZXR1cm4gbXVsdGk7XHJcbiAgfVxyXG4gIC8vVE9ETyAtY2xlYW51cFxyXG4gIGluamVjdFBvaW50VG9Qb2x5Z29uKHBvbHlnb24sIHBvaW50KSB7XHJcbiAgICBsZXQgY29vcmRzID0gdHVyZi5nZXRDb29yZHMocG9seWdvbik7XHJcbiAgICBsZXQgbmV3UG9seWdvbjtcclxuICAgIGNvbnNvbGUubG9nKCdwb2x5Z29uOiAnLCBwb2x5Z29uKTtcclxuICAgIGlmIChjb29yZHMubGVuZ3RoIDwgMikge1xyXG4gICAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xyXG4gICAgICBjb25zb2xlLmxvZyh0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykpO1xyXG4gICAgICBsZXQgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykucHJvcGVydGllcy5mZWF0dXJlSW5kZXg7XHJcbiAgICAgIGNvbnN0IHRlc3QgPSB0dXJmLmNvb3JkUmVkdWNlKFxyXG4gICAgICAgIHBvbHlnb25Qb2ludHMsXHJcbiAgICAgICAgZnVuY3Rpb24oYWNjdW11bGF0b3IsIG9sZFBvaW50LCBpKSB7XHJcbiAgICAgICAgICBpZiAoaW5kZXggPT09IGkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnQsIHBvaW50XTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50XTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFtdXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCd0ZXN0JywgdGVzdCk7XHJcbiAgICAgIG5ld1BvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihbW3Rlc3RdXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgcG9zID0gW107XHJcbiAgICAgIGxldCBjb29yZGluYXRlcyA9IFtdO1xyXG4gICAgICBjb29yZHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICBsZXQgcG9seWdvbiA9IHR1cmYucG9seWdvbihlbGVtZW50KTtcclxuICAgICAgICAvLyB0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbihwb2ludCwgcG9seWdvbilcclxuICAgICAgICBpZiAodHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pKSB7XHJcbiAgICAgICAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xyXG4gICAgICAgICAgbGV0IGluZGV4ID0gdHVyZi5uZWFyZXN0UG9pbnQocG9pbnQsIHBvbHlnb25Qb2ludHMpLnByb3BlcnRpZXMuZmVhdHVyZUluZGV4O1xyXG4gICAgICAgICAgY29vcmRpbmF0ZXMgPSB0dXJmLmNvb3JkUmVkdWNlKFxyXG4gICAgICAgICAgICBwb2x5Z29uUG9pbnRzLFxyXG4gICAgICAgICAgICBmdW5jdGlvbihhY2N1bXVsYXRvciwgb2xkUG9pbnQsIGkpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IGkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50LCBwb2ludF07XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50XTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgW11cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnY29vcmRpbmF0ZXMnLCBjb29yZGluYXRlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBvcy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHBvcy5wdXNoKFtjb29yZGluYXRlc10pO1xyXG4gICAgICBuZXdQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24ocG9zKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXdQb2x5Z29uO1xyXG4gIH1cclxuXHJcbiAgcG9seWdvbkRpZmZlcmVuY2UocG9seWdvbjE6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sIHBvbHlnb24yOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBsZXQgZGlmZiA9IHR1cmYuZGlmZmVyZW5jZShwb2x5Z29uMSwgcG9seWdvbjIpO1xyXG4gICAgY29uc29sZS5sb2coZGlmZik7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRUdXJmUG9seWdvbihkaWZmKTtcclxuICB9XHJcbiAgZ2V0Qm91bmRpbmdCb3hDb21wYXNzUG9zaXRpb24ocG9seWdvbiwgTWFya2VyUG9zaXRpb246IElDb21wYXNzLCB1c2VPZmZzZXQsIG9mZnNldERpcmVjdGlvbikge1xyXG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0TXVsdGlQb2x5Z29uKHBvbHlnb24pO1xyXG4gICAgY29uc3QgY29tcGFzcyA9IHRoaXMuZ2V0Qm91bmRpbmdCb3hDb21wYXNzKHBvbHlnb24pO1xyXG4gICAgY29uc3QgcG9seWdvblBvaW50cyA9IHR1cmYuZXhwbG9kZShwb2x5Z29uKTtcclxuICAgIGNvbnN0IGNvb3JkID0gdGhpcy5nZXRDb29yZChjb21wYXNzLmRpcmVjdGlvbi5Ob3J0aCk7XHJcbiAgICBjb25zdCBuZWFyZXN0UG9pbnQgPSB0dXJmLm5lYXJlc3RQb2ludChjb29yZCwgcG9seWdvblBvaW50cyk7XHJcblxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0Qm91bmRpbmdCb3hDb21wYXNzKHBvbHlnb24pOiBDb21wYXNzIHtcclxuICAgIGNvbnN0IHAgPSB0aGlzLmdldE11bHRpUG9seWdvbihwb2x5Z29uKTtcclxuICAgIGNvbnN0IGNlbnRlck9mTWFzcyA9IHR1cmYuY2VudGVyT2ZNYXNzKHApO1xyXG4gICAgY29uc3QgYiA9IHR1cmYuYmJveChwKTtcclxuICAgIGNvbnN0IG1pblggPSBiWzBdO1xyXG4gICAgY29uc3QgbWluWSA9IGJbMV07XHJcbiAgICBjb25zdCBtYXhYID0gYlsyXTtcclxuICAgIGNvbnN0IG1heFkgPSBiWzNdO1xyXG4gICAgY29uc3QgY29tcGFzcyA9IG5ldyBDb21wYXNzKG1pblgsIG1pblksIG1heFgsIG1heFkpO1xyXG4gICAgLy8gY29tcGFzcy5kaXJlY3Rpb24uQ2VudGVyT2ZNYXNzID0gY2VudGVyT2ZNYXNzLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdWzBdO1xyXG5cclxuICAgIHJldHVybiBjb21wYXNzO1xyXG4gIH1cclxuXHJcbiAgZ2V0TmVhcmVzdFBvaW50SW5kZXgodGFyZ2V0UG9pbnQ6IHR1cmYuQ29vcmQsIHBvaW50czogdHVyZi5GZWF0dXJlQ29sbGVjdGlvbjx0dXJmLlBvaW50Pik6IG51bWJlciB7XHJcbiAgICBsZXQgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludCh0YXJnZXRQb2ludCwgcG9pbnRzKS5wcm9wZXJ0aWVzLmZlYXR1cmVJbmRleDtcclxuICAgIHJldHVybiBpbmRleDtcclxuICB9XHJcbiAgZ2V0Q29vcmQocG9pbnQ6IElMYXRMbmcpOiB0dXJmLkNvb3JkIHtcclxuICAgIGNvbnN0IGNvb3JkID0gdHVyZi5nZXRDb29yZChbcG9pbnQubG5nLCBwb2ludC5sYXRdKTtcclxuICAgIHJldHVybiBjb29yZDtcclxuICB9XHJcbiAgZ2V0RmVhdHVyZVBvaW50Q29sbGVjdGlvbihwb2ludHM6IElMYXRMbmdbXSk6IHR1cmYuRmVhdHVyZUNvbGxlY3Rpb24ge1xyXG4gICAgY29uc3QgcHRzID0gW107XHJcbiAgICBwb2ludHMuZm9yRWFjaCh2ID0+IHtcclxuICAgICAgY29uc3QgcCA9IHR1cmYucG9pbnQoW3YubG5nLCB2LmxhdF0sIHt9KTtcclxuICAgICAgcHRzLnB1c2gocCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBmYyA9IHR1cmYuZmVhdHVyZUNvbGxlY3Rpb24ocHRzKTtcclxuXHJcbiAgICByZXR1cm4gZmM7XHJcbiAgfVxyXG59Il19