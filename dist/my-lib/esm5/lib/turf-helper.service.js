import * as tslib_1 from "tslib";
import { Injectable } from "@angular/core";
import * as turf from "@turf/turf";
import concaveman from "concaveman";
import { Compass } from "./utils";
import * as i0 from "@angular/core";
var TurfHelperService = /** @class */ (function () {
    function TurfHelperService() {
        this.simplifyTolerance = { tolerance: 0.0001, highQuality: false };
    }
    TurfHelperService.prototype.union = function (poly1, poly2) {
        console.log("poly1: ", poly1);
        console.log("poly2: ", poly2);
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
        console.log("Get TurfPolygon:", polygon);
        // if (polygon.geometry)
        if (polygon.geometry.type === "Polygon") {
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
        console.log("polygonIntersect", polygon, latlngs);
        var latlngsCoords = turf.getCoords(latlngs);
        latlngsCoords.forEach(function (element) {
            var feat = { type: "Polygon", coordinates: [element[0]] };
            poly.push(feat);
        });
        var polygonCoords = turf.getCoords(polygon);
        polygonCoords.forEach(function (element) {
            var feat = { type: "Polygon", coordinates: [element[0]] };
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
        console.log("Ytre: ", polygon2);
        return turf.booleanWithin(turf.polygon([polygon1]), turf.polygon([polygon2]));
    };
    TurfHelperService.prototype.equalPolygons = function (polygon1, polygon2) {
        console.log(polygon1);
        console.log(polygon2);
        console.log(turf.booleanEqual(polygon1, polygon2));
    };
    //TODO optional add extra markers for N E S W (We have the corners NW, NE, SE, SW)
    TurfHelperService.prototype.convertToBoundingBoxPolygon = function (polygon) {
        var bbox = turf.bbox(polygon.geometry);
        var bboxPolygon = turf.bboxPolygon(bbox);
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
        console.log("polygon: ", polygon);
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
            console.log("test", test);
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
                    console.log("coordinates", coordinates_1);
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
    TurfHelperService.prototype.getBoundingBoxCompassPosition = function (polygon, markerplacement, useOffset, offsetDirection) {
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
        Injectable({ providedIn: "root" }),
        tslib_1.__metadata("design:paramtypes", [])
    ], TurfHelperService);
    return TurfHelperService;
}());
export { TurfHelperService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi90dXJmLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUlwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDOztBQUlsQztJQUVFO1FBRFEsc0JBQWlCLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRWhCLGlDQUFLLEdBQUwsVUFBTSxLQUFLLEVBQUUsS0FBSztRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU5QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVyQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDBDQUFjLEdBQWQsVUFBZSxPQUF3QztRQUNyRCx3Q0FBd0M7UUFDeEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVuQyxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDckUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLENB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Q0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO1FBQzNFLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELG9DQUFRLEdBQVIsVUFBUyxLQUFjO1FBQ3JCLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELHFEQUF5QixHQUF6QixVQUEwQixNQUFpQjtRQUN6QyxJQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDZixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztZQUNkLElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdkMsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDOztJQWpPVSxpQkFBaUI7UUFEN0IsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDOztPQUN0QixpQkFBaUIsQ0FrTzdCOzRCQTdPRDtDQTZPQyxBQWxPRCxJQWtPQztTQWxPWSxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuXHJcbmltcG9ydCAqIGFzIHR1cmYgZnJvbSBcIkB0dXJmL3R1cmZcIjtcclxuaW1wb3J0IGNvbmNhdmVtYW4gZnJvbSBcImNvbmNhdmVtYW5cIjtcclxuaW1wb3J0IHsgRmVhdHVyZSwgUG9seWdvbiwgTXVsdGlQb2x5Z29uLCBQb3NpdGlvbiB9IGZyb20gXCJAdHVyZi90dXJmXCI7XHJcbmltcG9ydCB7IE1hcmtlclBsYWNlbWVudCB9IGZyb20gXCIuL2VudW1zXCI7XHJcbmltcG9ydCB7IElDb21wYXNzIH0gZnJvbSBcIi4vaW50ZXJmYWNlXCI7XHJcbmltcG9ydCB7IENvbXBhc3MgfSBmcm9tIFwiLi91dGlsc1wiO1xyXG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSBcIi4vcG9seWdvbi1oZWxwZXJzXCI7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46IFwicm9vdFwiIH0pXHJcbmV4cG9ydCBjbGFzcyBUdXJmSGVscGVyU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBzaW1wbGlmeVRvbGVyYW5jZSA9IHsgdG9sZXJhbmNlOiAwLjAwMDEsIGhpZ2hRdWFsaXR5OiBmYWxzZSB9O1xyXG4gIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgdW5pb24ocG9seTEsIHBvbHkyKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBjb25zb2xlLmxvZyhcInBvbHkxOiBcIiwgcG9seTEpO1xyXG4gICAgY29uc29sZS5sb2coXCJwb2x5MjogXCIsIHBvbHkyKTtcclxuXHJcbiAgICBsZXQgdW5pb24gPSB0dXJmLnVuaW9uKHBvbHkxLCBwb2x5Mik7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VHVyZlBvbHlnb24odW5pb24pO1xyXG4gIH1cclxuXHJcbiAgdHVyZkNvbmNhdmVtYW4oZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPik6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcInR1cmZDb25jYXZlbWFuXCIsIHBvaW50cyk7XHJcbiAgICBsZXQgcG9pbnRzID0gdHVyZi5leHBsb2RlKGZlYXR1cmUpO1xyXG5cclxuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gcG9pbnRzLmZlYXR1cmVzLm1hcChmID0+IGYuZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xyXG4gICAgcmV0dXJuIHR1cmYubXVsdGlQb2x5Z29uKFtbY29uY2F2ZW1hbihjb29yZGluYXRlcyldXSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy9UT0RPIGFkZCBzb21lIHNvcnQgb2YgZHluYW1pYyB0b2xlcmFuY2VcclxuICBnZXRTaW1wbGlmaWVkKHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIGNvbnN0IHRvbGVyYW5jZSA9IHRoaXMuc2ltcGxpZnlUb2xlcmFuY2U7XHJcbiAgICBjb25zdCBzaW1wbGlmaWVkID0gdHVyZi5zaW1wbGlmeShwb2x5Z29uLCB0b2xlcmFuY2UpO1xyXG4gICAgcmV0dXJuIHNpbXBsaWZpZWQ7XHJcbiAgfVxyXG5cclxuICBnZXRUdXJmUG9seWdvbihwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBsZXQgdHVyZlBvbHlnb247XHJcbiAgICBjb25zb2xlLmxvZyhcIkdldCBUdXJmUG9seWdvbjpcIiwgcG9seWdvbik7XHJcbiAgICAvLyBpZiAocG9seWdvbi5nZW9tZXRyeSlcclxuICAgIGlmIChwb2x5Z29uLmdlb21ldHJ5LnR5cGUgPT09IFwiUG9seWdvblwiKSB7XHJcbiAgICAgIHR1cmZQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24oW3BvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNdKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHR1cmZQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24ocG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHVyZlBvbHlnb247XHJcbiAgfVxyXG5cclxuICBnZXRNdWx0aVBvbHlnb24ocG9seWdvbkFycmF5OiBQb3NpdGlvbltdW11bXSk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgcmV0dXJuIHR1cmYubXVsdGlQb2x5Z29uKHBvbHlnb25BcnJheSk7XHJcbiAgfVxyXG5cclxuICBnZXRLaW5rcyhmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zdCB1bmtpbmsgPSB0dXJmLnVua2lua1BvbHlnb24oZmVhdHVyZSk7XHJcbiAgICBsZXQgY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgIHR1cmYuZmVhdHVyZUVhY2godW5raW5rLCBjdXJyZW50ID0+IHtcclxuICAgICAgY29vcmRpbmF0ZXMucHVzaChjdXJyZW50KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBjb29yZGluYXRlcztcclxuICB9XHJcblxyXG4gIGdldENvb3JkcyhmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICByZXR1cm4gdHVyZi5nZXRDb29yZHMoZmVhdHVyZSk7XHJcbiAgfVxyXG5cclxuICBoYXNLaW5rcyhmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zdCBraW5rcyA9IHR1cmYua2lua3MoZmVhdHVyZSk7XHJcbiAgICByZXR1cm4ga2lua3MuZmVhdHVyZXMubGVuZ3RoID4gMDtcclxuICB9XHJcblxyXG4gIHBvbHlnb25JbnRlcnNlY3QocG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiwgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPik6IGJvb2xlYW4ge1xyXG4gICAgLy8gY29uc3Qgb2xkUG9seWdvbiA9IHBvbHlnb24udG9HZW9KU09OKCk7XHJcbiAgICBsZXQgcG9seSA9IFtdO1xyXG4gICAgbGV0IHBvbHkyID0gW107XHJcblxyXG4gICAgY29uc29sZS5sb2coXCJwb2x5Z29uSW50ZXJzZWN0XCIsIHBvbHlnb24sIGxhdGxuZ3MpO1xyXG5cclxuICAgIGxldCBsYXRsbmdzQ29vcmRzID0gdHVyZi5nZXRDb29yZHMobGF0bG5ncyk7XHJcbiAgICBsYXRsbmdzQ29vcmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgIGxldCBmZWF0ID0geyB0eXBlOiBcIlBvbHlnb25cIiwgY29vcmRpbmF0ZXM6IFtlbGVtZW50WzBdXSB9O1xyXG5cclxuICAgICAgcG9seS5wdXNoKGZlYXQpO1xyXG4gICAgfSk7XHJcbiAgICBsZXQgcG9seWdvbkNvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKHBvbHlnb24pO1xyXG4gICAgcG9seWdvbkNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICBsZXQgZmVhdCA9IHsgdHlwZTogXCJQb2x5Z29uXCIsIGNvb3JkaW5hdGVzOiBbZWxlbWVudFswXV0gfTtcclxuXHJcbiAgICAgIHBvbHkyLnB1c2goZmVhdCk7XHJcbiAgICB9KTtcclxuICAgIGxldCBpbnRlcnNlY3QgPSBmYWxzZTtcclxuICAgIGxvb3AxOiBmb3IgKGxldCBpID0gMDsgaSA8IHBvbHkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMuZ2V0S2lua3MocG9seVtpXSkubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9seTIubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgIGlmICh0aGlzLmdldEtpbmtzKHBvbHkyW2pdKS5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgIGludGVyc2VjdCA9ICEhdHVyZi5pbnRlcnNlY3QocG9seVtpXSwgcG9seTJbal0pO1xyXG4gICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSB7XHJcbiAgICAgICAgICAgICAgYnJlYWsgbG9vcDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaW50ZXJzZWN0O1xyXG4gIH1cclxuXHJcbiAgZ2V0SW50ZXJzZWN0aW9uKHBvbHkxLCBwb2x5Mik6IEZlYXR1cmUge1xyXG4gICAgcmV0dXJuIHR1cmYuaW50ZXJzZWN0KHBvbHkxLCBwb2x5Mik7XHJcbiAgfVxyXG4gIGdldERpc3RhbmNlKHBvaW50MSwgcG9pbnQyKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0dXJmLmRpc3RhbmNlKHBvaW50MSwgcG9pbnQyKTtcclxuICB9XHJcblxyXG4gIGlzV2l0aGluKHBvbHlnb24xOiBQb3NpdGlvbltdLCBwb2x5Z29uMjogUG9zaXRpb25bXSk6IGJvb2xlYW4ge1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbjEpO1xyXG4gICAgY29uc29sZS5sb2coXCJZdHJlOiBcIiwgcG9seWdvbjIpO1xyXG4gICAgcmV0dXJuIHR1cmYuYm9vbGVhbldpdGhpbih0dXJmLnBvbHlnb24oW3BvbHlnb24xXSksIHR1cmYucG9seWdvbihbcG9seWdvbjJdKSk7XHJcbiAgfVxyXG5cclxuICBlcXVhbFBvbHlnb25zKHBvbHlnb24xOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LCBwb2x5Z29uMjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbjEpO1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbjIpO1xyXG4gICAgY29uc29sZS5sb2codHVyZi5ib29sZWFuRXF1YWwocG9seWdvbjEsIHBvbHlnb24yKSk7XHJcbiAgfVxyXG4gIC8vVE9ETyBvcHRpb25hbCBhZGQgZXh0cmEgbWFya2VycyBmb3IgTiBFIFMgVyAoV2UgaGF2ZSB0aGUgY29ybmVycyBOVywgTkUsIFNFLCBTVylcclxuICBjb252ZXJ0VG9Cb3VuZGluZ0JveFBvbHlnb24ocG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPik6IEZlYXR1cmU8UG9seWdvbj4ge1xyXG4gICAgY29uc3QgYmJveCA9IHR1cmYuYmJveChwb2x5Z29uLmdlb21ldHJ5KTtcclxuICAgIGNvbnN0IGJib3hQb2x5Z29uID0gdHVyZi5iYm94UG9seWdvbihiYm94KTtcclxuICAgIHJldHVybiBiYm94UG9seWdvbjtcclxuICB9XHJcbiAgcG9seWdvblRvTXVsdGlQb2x5Z29uKHBvbHk6IEZlYXR1cmU8UG9seWdvbj4pOiBGZWF0dXJlPE11bHRpUG9seWdvbj4ge1xyXG4gICAgY29uc3QgbXVsdGkgPSB0dXJmLm11bHRpUG9seWdvbihbcG9seS5nZW9tZXRyeS5jb29yZGluYXRlc10pO1xyXG4gICAgcmV0dXJuIG11bHRpO1xyXG4gIH1cclxuICAvL1RPRE8gLWNsZWFudXBcclxuICBpbmplY3RQb2ludFRvUG9seWdvbihwb2x5Z29uLCBwb2ludCkge1xyXG4gICAgbGV0IGNvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKHBvbHlnb24pO1xyXG4gICAgbGV0IG5ld1BvbHlnb247XHJcbiAgICBjb25zb2xlLmxvZyhcInBvbHlnb246IFwiLCBwb2x5Z29uKTtcclxuICAgIGlmIChjb29yZHMubGVuZ3RoIDwgMikge1xyXG4gICAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xyXG4gICAgICBjb25zb2xlLmxvZyh0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykpO1xyXG4gICAgICBsZXQgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykucHJvcGVydGllcy5mZWF0dXJlSW5kZXg7XHJcbiAgICAgIGNvbnN0IHRlc3QgPSB0dXJmLmNvb3JkUmVkdWNlKFxyXG4gICAgICAgIHBvbHlnb25Qb2ludHMsXHJcbiAgICAgICAgZnVuY3Rpb24oYWNjdW11bGF0b3IsIG9sZFBvaW50LCBpKSB7XHJcbiAgICAgICAgICBpZiAoaW5kZXggPT09IGkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnQsIHBvaW50XTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50XTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFtdXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwidGVzdFwiLCB0ZXN0KTtcclxuICAgICAgbmV3UG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtbdGVzdF1dKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBwb3MgPSBbXTtcclxuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGxldCBwb2x5Z29uID0gdHVyZi5wb2x5Z29uKGVsZW1lbnQpO1xyXG4gICAgICAgIC8vIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHBvaW50LCBwb2x5Z29uKVxyXG4gICAgICAgIGlmICh0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbihwb2ludCwgcG9seWdvbikpIHtcclxuICAgICAgICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XHJcbiAgICAgICAgICBsZXQgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykucHJvcGVydGllcy5mZWF0dXJlSW5kZXg7XHJcbiAgICAgICAgICBjb29yZGluYXRlcyA9IHR1cmYuY29vcmRSZWR1Y2UoXHJcbiAgICAgICAgICAgIHBvbHlnb25Qb2ludHMsXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCBvbGRQb2ludCwgaSkge1xyXG4gICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gaSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnQsIHBvaW50XTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnRdO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiY29vcmRpbmF0ZXNcIiwgY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwb3MucHVzaChlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBwb3MucHVzaChbY29vcmRpbmF0ZXNdKTtcclxuICAgICAgbmV3UG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKHBvcyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3UG9seWdvbjtcclxuICB9XHJcblxyXG4gIHBvbHlnb25EaWZmZXJlbmNlKHBvbHlnb24xOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LCBwb2x5Z29uMjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPik6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgbGV0IGRpZmYgPSB0dXJmLmRpZmZlcmVuY2UocG9seWdvbjEsIHBvbHlnb24yKTtcclxuICAgIGNvbnNvbGUubG9nKGRpZmYpO1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VHVyZlBvbHlnb24oZGlmZik7XHJcbiAgfVxyXG4gIGdldEJvdW5kaW5nQm94Q29tcGFzc1Bvc2l0aW9uKHBvbHlnb24sIG1hcmtlcnBsYWNlbWVudDogSUNvbXBhc3MsIHVzZU9mZnNldCwgb2Zmc2V0RGlyZWN0aW9uKSB7XHJcbiAgICBjb25zdCBwID0gdGhpcy5nZXRNdWx0aVBvbHlnb24ocG9seWdvbik7XHJcbiAgICBjb25zdCBjb21wYXNzID0gdGhpcy5nZXRCb3VuZGluZ0JveENvbXBhc3MocG9seWdvbik7XHJcbiAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xyXG4gICAgY29uc3QgY29vcmQgPSB0aGlzLmdldENvb3JkKGNvbXBhc3MuZGlyZWN0aW9uLk5vcnRoKTtcclxuICAgIGNvbnN0IG5lYXJlc3RQb2ludCA9IHR1cmYubmVhcmVzdFBvaW50KGNvb3JkLCBwb2x5Z29uUG9pbnRzKTtcclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgcHJpdmF0ZSBnZXRCb3VuZGluZ0JveENvbXBhc3MocG9seWdvbik6IENvbXBhc3Mge1xyXG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0TXVsdGlQb2x5Z29uKHBvbHlnb24pO1xyXG4gICAgY29uc3QgY2VudGVyT2ZNYXNzID0gdHVyZi5jZW50ZXJPZk1hc3MocCk7XHJcbiAgICBjb25zdCBiID0gdHVyZi5iYm94KHApO1xyXG4gICAgY29uc3QgbWluWCA9IGJbMF07XHJcbiAgICBjb25zdCBtaW5ZID0gYlsxXTtcclxuICAgIGNvbnN0IG1heFggPSBiWzJdO1xyXG4gICAgY29uc3QgbWF4WSA9IGJbM107XHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MobWluWCwgbWluWSwgbWF4WCwgbWF4WSk7XHJcbiAgICAvLyBjb21wYXNzLmRpcmVjdGlvbi5DZW50ZXJPZk1hc3MgPSBjZW50ZXJPZk1hc3MuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1bMF07XHJcblxyXG4gICAgcmV0dXJuIGNvbXBhc3M7XHJcbiAgfVxyXG5cclxuICBnZXROZWFyZXN0UG9pbnRJbmRleCh0YXJnZXRQb2ludDogdHVyZi5Db29yZCwgcG9pbnRzOiB0dXJmLkZlYXR1cmVDb2xsZWN0aW9uPHR1cmYuUG9pbnQ+KTogbnVtYmVyIHtcclxuICAgIGxldCBpbmRleCA9IHR1cmYubmVhcmVzdFBvaW50KHRhcmdldFBvaW50LCBwb2ludHMpLnByb3BlcnRpZXMuZmVhdHVyZUluZGV4O1xyXG4gICAgcmV0dXJuIGluZGV4O1xyXG4gIH1cclxuICBnZXRDb29yZChwb2ludDogSUxhdExuZyk6IHR1cmYuQ29vcmQge1xyXG4gICAgY29uc3QgY29vcmQgPSB0dXJmLmdldENvb3JkKFtwb2ludC5sbmcsIHBvaW50LmxhdF0pO1xyXG4gICAgcmV0dXJuIGNvb3JkO1xyXG4gIH1cclxuICBnZXRGZWF0dXJlUG9pbnRDb2xsZWN0aW9uKHBvaW50czogSUxhdExuZ1tdKTogdHVyZi5GZWF0dXJlQ29sbGVjdGlvbiB7XHJcbiAgICBjb25zdCBwdHMgPSBbXTtcclxuICAgIHBvaW50cy5mb3JFYWNoKHYgPT4ge1xyXG4gICAgICBjb25zdCBwID0gdHVyZi5wb2ludChbdi5sbmcsIHYubGF0XSwge30pO1xyXG4gICAgICBwdHMucHVzaChwKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGZjID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihwdHMpO1xyXG5cclxuICAgIHJldHVybiBmYztcclxuICB9XHJcbn1cclxuIl19