import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';
import concaveman from 'concaveman';
import { Compass } from './utils';
import * as i0 from "@angular/core";
let TurfHelperService = class TurfHelperService {
    constructor() {
        this.simplifyTolerance = { tolerance: 0.0001, highQuality: false };
    }
    union(poly1, poly2) {
        const union = turf.union(poly1, poly2);
        return this.getTurfPolygon(union);
    }
    turfConcaveman(feature) {
        const points = turf.explode(feature);
        const coordinates = points.features.map(f => f.geometry.coordinates);
        return turf.multiPolygon([[concaveman(coordinates)]]);
    }
    //TODO add some sort of dynamic tolerance
    getSimplified(polygon) {
        const tolerance = this.simplifyTolerance;
        const simplified = turf.simplify(polygon, tolerance);
        return simplified;
    }
    getTurfPolygon(polygon) {
        let turfPolygon;
        // if (polygon.geometry)
        if (polygon.geometry.type === 'Polygon') {
            turfPolygon = turf.multiPolygon([polygon.geometry.coordinates]);
        }
        else {
            turfPolygon = turf.multiPolygon(polygon.geometry.coordinates);
        }
        return turfPolygon;
    }
    getMultiPolygon(polygonArray) {
        return turf.multiPolygon(polygonArray);
    }
    getKinks(feature) {
        const unkink = turf.unkinkPolygon(feature);
        const coordinates = [];
        turf.featureEach(unkink, current => {
            coordinates.push(current);
        });
        return coordinates;
    }
    getCoords(feature) {
        return turf.getCoords(feature);
    }
    hasKinks(feature) {
        const kinks = turf.kinks(feature);
        return kinks.features.length > 0;
    }
    polygonIntersect(polygon, latlngs) {
        var _a, _b;
        // const oldPolygon = polygon.toGeoJSON();
        const poly = [];
        const poly2 = [];
        const latlngsCoords = turf.getCoords(latlngs);
        latlngsCoords.forEach(element => {
            const feat = { type: 'Polygon', coordinates: [element[0]] };
            poly.push(feat);
        });
        const polygonCoords = turf.getCoords(polygon);
        polygonCoords.forEach(element => {
            const feat = { type: 'Polygon', coordinates: [element[0]] };
            poly2.push(feat);
        });
        let intersect = false;
        loop1: for (let i = 0; i < poly.length; i++) {
            if (this.getKinks(poly[i]).length < 2) {
                for (let j = 0; j < poly2.length; j++) {
                    if (this.getKinks(poly2[j]).length < 2) {
                        const test = turf.intersect(poly[i], poly2[j]);
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
    }
    getIntersection(poly1, poly2) {
        return turf.intersect(poly1, poly2);
    }
    getDistance(point1, point2) {
        return turf.distance(point1, point2);
    }
    isWithin(polygon1, polygon2) {
        return turf.booleanWithin(turf.polygon([polygon1]), turf.polygon([polygon2]));
    }
    equalPolygons(polygon1, polygon2) {
    }
    //TODO optional add extra markers for N E S W (We have the corners NW, NE, SE, SW)
    convertToBoundingBoxPolygon(polygon, addMidpointMarkers = false) {
        const bbox = turf.bbox(polygon.geometry);
        const bboxPolygon = turf.bboxPolygon(bbox);
        const compass = new Compass(bbox[1], bbox[0], bbox[3], bbox[2]);
        const compassPositions = compass.getPositions();
        bboxPolygon.geometry.coordinates = [];
        bboxPolygon.geometry.coordinates = [compassPositions];
        return bboxPolygon;
    }
    polygonToMultiPolygon(poly) {
        const multi = turf.multiPolygon([poly.geometry.coordinates]);
        return multi;
    }
    //TODO -cleanup
    injectPointToPolygon(polygon, point) {
        const coords = turf.getCoords(polygon);
        let newPolygon;
        if (coords.length < 2) {
            const polygonPoints = turf.explode(polygon);
            const index = turf.nearestPoint(point, polygonPoints).properties
                .featureIndex;
            const test = turf.coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
                if (index === i) {
                    return [...accumulator, oldPoint, point];
                }
                return [...accumulator, oldPoint];
            }, []);
            newPolygon = turf.multiPolygon([[test]]);
        }
        else {
            const pos = [];
            let coordinates = [];
            coords.forEach(element => {
                const polygon = turf.polygon(element);
                // turf.booleanPointInPolygon(point, polygon)
                if (turf.booleanPointInPolygon(point, polygon)) {
                    const polygonPoints = turf.explode(polygon);
                    const index = turf.nearestPoint(point, polygonPoints).properties
                        .featureIndex;
                    coordinates = turf.coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
                        if (index === i) {
                            return [...accumulator, oldPoint, point];
                        }
                        return [...accumulator, oldPoint];
                    }, []);
                }
                else {
                    pos.push(element);
                }
            });
            pos.push([coordinates]);
            newPolygon = turf.multiPolygon(pos);
        }
        return newPolygon;
    }
    polygonDifference(polygon1, polygon2) {
        const diff = turf.difference(polygon1, polygon2);
        return this.getTurfPolygon(diff);
    }
    getBoundingBoxCompassPosition(polygon, MarkerPosition, useOffset, offsetDirection) {
        const p = this.getMultiPolygon(polygon);
        const compass = this.getBoundingBoxCompass(polygon);
        const polygonPoints = turf.explode(polygon);
        const coord = this.getCoord(compass.direction.North);
        const nearestPoint = turf.nearestPoint(coord, polygonPoints);
        return null;
    }
    getBoundingBoxCompass(polygon) {
        const p = this.getMultiPolygon(polygon);
        const centerOfMass = turf.centerOfMass(p);
        const b = turf.bbox(p);
        const minX = b[0];
        const minY = b[1];
        const maxX = b[2];
        const maxY = b[3];
        const compass = new Compass(minX, minY, maxX, maxY);
        // compass.direction.CenterOfMass = centerOfMass.geometry.coordinates[0][0];
        return compass;
    }
    getNearestPointIndex(targetPoint, points) {
        const index = turf.nearestPoint(targetPoint, points).properties.featureIndex;
        return index;
    }
    getCoord(point) {
        const coord = turf.getCoord([point.lng, point.lat]);
        return coord;
    }
    getFeaturePointCollection(points) {
        const pts = [];
        points.forEach(v => {
            const p = turf.point([v.lng, v.lat], {});
            pts.push(p);
        });
        const fc = turf.featureCollection(pts);
        return fc;
    }
};
TurfHelperService.ɵprov = i0.ɵɵdefineInjectable({ factory: function TurfHelperService_Factory() { return new TurfHelperService(); }, token: TurfHelperService, providedIn: "root" });
TurfHelperService = __decorate([
    Injectable({ providedIn: 'root' }),
    __metadata("design:paramtypes", [])
], TurfHelperService);
export { TurfHelperService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi90dXJmLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUlwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDOztBQUlsQyxJQUFhLGlCQUFpQixHQUE5QixNQUFhLGlCQUFpQjtJQUU1QjtRQURRLHNCQUFpQixHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDdkQsQ0FBQztJQUVoQixLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUs7UUFJaEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFdkMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxjQUFjLENBQ1osT0FBd0M7UUFHeEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVyQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELHlDQUF5QztJQUN6QyxhQUFhLENBQ1gsT0FBd0M7UUFFeEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFD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QUNyQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNwRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCx5QkFBeUIsQ0FBQyxNQUFpQjtRQUN6QyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDZixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2pCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6QyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdkMsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0NBQ0YsQ0FBQTs7QUFwUlksaUJBQWlCO0lBRDdCLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQzs7R0FDdEIsaUJBQWlCLENBb1I3QjtTQXBSWSxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgKiBhcyB0dXJmIGZyb20gJ0B0dXJmL3R1cmYnO1xyXG5pbXBvcnQgY29uY2F2ZW1hbiBmcm9tICdjb25jYXZlbWFuJztcclxuaW1wb3J0IHsgRmVhdHVyZSwgUG9seWdvbiwgTXVsdGlQb2x5Z29uLCBQb3NpdGlvbiB9IGZyb20gJ0B0dXJmL3R1cmYnO1xyXG5pbXBvcnQgeyBNYXJrZXJQb3NpdGlvbiB9IGZyb20gJy4vZW51bXMnO1xyXG5pbXBvcnQgeyBJQ29tcGFzcyB9IGZyb20gJy4vaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgQ29tcGFzcyB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSAnLi9wb2x5Z29uLWhlbHBlcnMnO1xyXG5cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcclxuZXhwb3J0IGNsYXNzIFR1cmZIZWxwZXJTZXJ2aWNlIHtcclxuICBwcml2YXRlIHNpbXBsaWZ5VG9sZXJhbmNlID0geyB0b2xlcmFuY2U6IDAuMDAwMSwgaGlnaFF1YWxpdHk6IGZhbHNlIH07XHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICB1bmlvbihwb2x5MSwgcG9seTIpOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIFxyXG4gICAgXHJcblxyXG4gICAgY29uc3QgdW5pb24gPSB0dXJmLnVuaW9uKHBvbHkxLCBwb2x5Mik7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VHVyZlBvbHlnb24odW5pb24pO1xyXG4gIH1cclxuXHJcbiAgdHVyZkNvbmNhdmVtYW4oXHJcbiAgICBmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBcclxuICAgIGNvbnN0IHBvaW50cyA9IHR1cmYuZXhwbG9kZShmZWF0dXJlKTtcclxuXHJcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IHBvaW50cy5mZWF0dXJlcy5tYXAoZiA9PiBmLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcclxuICAgIHJldHVybiB0dXJmLm11bHRpUG9seWdvbihbW2NvbmNhdmVtYW4oY29vcmRpbmF0ZXMpXV0pO1xyXG4gIH1cclxuXHJcbiAgLy9UT0RPIGFkZCBzb21lIHNvcnQgb2YgZHluYW1pYyB0b2xlcmFuY2VcclxuICBnZXRTaW1wbGlmaWVkKFxyXG4gICAgcG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgY29uc3QgdG9sZXJhbmNlID0gdGhpcy5zaW1wbGlmeVRvbGVyYW5jZTtcclxuICAgIGNvbnN0IHNpbXBsaWZpZWQgPSB0dXJmLnNpbXBsaWZ5KHBvbHlnb24sIHRvbGVyYW5jZSk7XHJcbiAgICByZXR1cm4gc2ltcGxpZmllZDtcclxuICB9XHJcblxyXG4gIGdldFR1cmZQb2x5Z29uKFxyXG4gICAgcG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgbGV0IHR1cmZQb2x5Z29uO1xyXG4gICAgXHJcbiAgICAvLyBpZiAocG9seWdvbi5nZW9tZXRyeSlcclxuICAgIGlmIChwb2x5Z29uLmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJykge1xyXG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtwb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0dXJmUG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKHBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHR1cmZQb2x5Z29uO1xyXG4gIH1cclxuXHJcbiAgZ2V0TXVsdGlQb2x5Z29uKFxyXG4gICAgcG9seWdvbkFycmF5OiBQb3NpdGlvbltdW11bXVxyXG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgcmV0dXJuIHR1cmYubXVsdGlQb2x5Z29uKHBvbHlnb25BcnJheSk7XHJcbiAgfVxyXG5cclxuICBnZXRLaW5rcyhmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zdCB1bmtpbmsgPSB0dXJmLnVua2lua1BvbHlnb24oZmVhdHVyZSk7XHJcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IFtdO1xyXG4gICAgdHVyZi5mZWF0dXJlRWFjaCh1bmtpbmssIGN1cnJlbnQgPT4ge1xyXG4gICAgICBjb29yZGluYXRlcy5wdXNoKGN1cnJlbnQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGNvb3JkaW5hdGVzO1xyXG4gIH1cclxuXHJcbiAgZ2V0Q29vcmRzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIHJldHVybiB0dXJmLmdldENvb3JkcyhmZWF0dXJlKTtcclxuICB9XHJcblxyXG4gIGhhc0tpbmtzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnN0IGtpbmtzID0gdHVyZi5raW5rcyhmZWF0dXJlKTtcclxuICAgIHJldHVybiBraW5rcy5mZWF0dXJlcy5sZW5ndGggPiAwO1xyXG4gIH1cclxuXHJcbiAgcG9seWdvbkludGVyc2VjdChcclxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogYm9vbGVhbiB7XHJcbiAgICAvLyBjb25zdCBvbGRQb2x5Z29uID0gcG9seWdvbi50b0dlb0pTT04oKTtcclxuICAgIGNvbnN0IHBvbHkgPSBbXTtcclxuICAgIGNvbnN0IHBvbHkyID0gW107XHJcblxyXG4gICAgXHJcblxyXG4gICAgY29uc3QgbGF0bG5nc0Nvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKGxhdGxuZ3MpO1xyXG4gICAgbGF0bG5nc0Nvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICBjb25zdCBmZWF0ID0geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbZWxlbWVudFswXV0gfTtcclxuXHJcbiAgICAgIHBvbHkucHVzaChmZWF0KTtcclxuICAgIH0pO1xyXG4gICAgY29uc3QgcG9seWdvbkNvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKHBvbHlnb24pO1xyXG4gICAgcG9seWdvbkNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICBjb25zdCBmZWF0ID0geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbZWxlbWVudFswXV0gfTtcclxuXHJcbiAgICAgIHBvbHkyLnB1c2goZmVhdCk7XHJcbiAgICB9KTtcclxuICAgIGxldCBpbnRlcnNlY3QgPSBmYWxzZTtcclxuICAgIGxvb3AxOiBmb3IgKGxldCBpID0gMDsgaSA8IHBvbHkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMuZ2V0S2lua3MocG9seVtpXSkubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9seTIubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgIGlmICh0aGlzLmdldEtpbmtzKHBvbHkyW2pdKS5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlc3QgPSB0dXJmLmludGVyc2VjdChwb2x5W2ldLCBwb2x5MltqXSk7XHJcbiAgICAgICAgICAgIGlmICh0ZXN0Py5nZW9tZXRyeS50eXBlID09PSAnUG9pbnQnKSB7XHJcbiAgICAgICAgICAgICAgaW50ZXJzZWN0ID0gIShcclxuICAgICAgICAgICAgICAgIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHRlc3QsIHBvbHlbaV0pICYmXHJcbiAgICAgICAgICAgICAgICB0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbih0ZXN0LCBwb2x5MltqXSlcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRlc3Q/Lmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJykge1xyXG4gICAgICAgICAgICAgIGludGVyc2VjdCA9ICEhdHVyZi5pbnRlcnNlY3QocG9seVtpXSwgcG9seTJbal0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSB7XHJcbiAgICAgICAgICAgICAgYnJlYWsgbG9vcDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaW50ZXJzZWN0O1xyXG4gIH1cclxuXHJcbiAgZ2V0SW50ZXJzZWN0aW9uKHBvbHkxLCBwb2x5Mik6IEZlYXR1cmUge1xyXG4gICAgcmV0dXJuIHR1cmYuaW50ZXJzZWN0KHBvbHkxLCBwb2x5Mik7XHJcbiAgfVxyXG4gIGdldERpc3RhbmNlKHBvaW50MSwgcG9pbnQyKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0dXJmLmRpc3RhbmNlKHBvaW50MSwgcG9pbnQyKTtcclxuICB9XHJcblxyXG4gIGlzV2l0aGluKHBvbHlnb24xOiBQb3NpdGlvbltdLCBwb2x5Z29uMjogUG9zaXRpb25bXSk6IGJvb2xlYW4ge1xyXG4gICAgXHJcbiAgICBcclxuICAgIHJldHVybiB0dXJmLmJvb2xlYW5XaXRoaW4oXHJcbiAgICAgIHR1cmYucG9seWdvbihbcG9seWdvbjFdKSxcclxuICAgICAgdHVyZi5wb2x5Z29uKFtwb2x5Z29uMl0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZXF1YWxQb2x5Z29ucyhcclxuICAgIHBvbHlnb24xOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgcG9seWdvbjI6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cclxuICApIHtcclxuICAgIFxyXG4gICAgXHJcbiAgICBcclxuICB9XHJcbiAgLy9UT0RPIG9wdGlvbmFsIGFkZCBleHRyYSBtYXJrZXJzIGZvciBOIEUgUyBXIChXZSBoYXZlIHRoZSBjb3JuZXJzIE5XLCBORSwgU0UsIFNXKVxyXG4gIGNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihcclxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBhZGRNaWRwb2ludE1hcmtlcnM6IGJvb2xlYW4gPSBmYWxzZVxyXG4gICk6IEZlYXR1cmU8UG9seWdvbj4ge1xyXG4gICAgY29uc3QgYmJveCA9IHR1cmYuYmJveChwb2x5Z29uLmdlb21ldHJ5KTtcclxuICAgIGNvbnN0IGJib3hQb2x5Z29uID0gdHVyZi5iYm94UG9seWdvbihiYm94KTtcclxuXHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MoYmJveFsxXSwgYmJveFswXSwgYmJveFszXSwgYmJveFsyXSk7XHJcblxyXG4gICAgY29uc3QgY29tcGFzc1Bvc2l0aW9ucyA9IGNvbXBhc3MuZ2V0UG9zaXRpb25zKCk7XHJcblxyXG4gICAgYmJveFBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgIGJib3hQb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzID0gW2NvbXBhc3NQb3NpdGlvbnNdO1xyXG5cclxuICAgIHJldHVybiBiYm94UG9seWdvbjtcclxuICB9XHJcbiAgcG9seWdvblRvTXVsdGlQb2x5Z29uKHBvbHk6IEZlYXR1cmU8UG9seWdvbj4pOiBGZWF0dXJlPE11bHRpUG9seWdvbj4ge1xyXG4gICAgY29uc3QgbXVsdGkgPSB0dXJmLm11bHRpUG9seWdvbihbcG9seS5nZW9tZXRyeS5jb29yZGluYXRlc10pO1xyXG4gICAgcmV0dXJuIG11bHRpO1xyXG4gIH1cclxuICAvL1RPRE8gLWNsZWFudXBcclxuICBpbmplY3RQb2ludFRvUG9seWdvbihwb2x5Z29uLCBwb2ludCkge1xyXG4gICAgY29uc3QgY29vcmRzID0gdHVyZi5nZXRDb29yZHMocG9seWdvbik7XHJcbiAgICBsZXQgbmV3UG9seWdvbjtcclxuICAgIFxyXG4gICAgaWYgKGNvb3Jkcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XHJcbiAgICAgIFxyXG4gICAgICBjb25zdCBpbmRleCA9IHR1cmYubmVhcmVzdFBvaW50KHBvaW50LCBwb2x5Z29uUG9pbnRzKS5wcm9wZXJ0aWVzXHJcbiAgICAgICAgLmZlYXR1cmVJbmRleDtcclxuICAgICAgY29uc3QgdGVzdCA9IHR1cmYuY29vcmRSZWR1Y2UoXHJcbiAgICAgICAgcG9seWdvblBvaW50cyxcclxuICAgICAgICBmdW5jdGlvbihhY2N1bXVsYXRvciwgb2xkUG9pbnQsIGkpIHtcclxuICAgICAgICAgIGlmIChpbmRleCA9PT0gaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludCwgcG9pbnRdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnRdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW11cclxuICAgICAgKTtcclxuICAgICAgXHJcbiAgICAgIG5ld1BvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihbW3Rlc3RdXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBwb3MgPSBbXTtcclxuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvb3Jkcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBvbHlnb24gPSB0dXJmLnBvbHlnb24oZWxlbWVudCk7XHJcbiAgICAgICAgLy8gdHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pXHJcbiAgICAgICAgaWYgKHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHBvaW50LCBwb2x5Z29uKSkge1xyXG4gICAgICAgICAgY29uc3QgcG9seWdvblBvaW50cyA9IHR1cmYuZXhwbG9kZShwb2x5Z29uKTtcclxuICAgICAgICAgIGNvbnN0IGluZGV4ID0gdHVyZi5uZWFyZXN0UG9pbnQocG9pbnQsIHBvbHlnb25Qb2ludHMpLnByb3BlcnRpZXNcclxuICAgICAgICAgICAgLmZlYXR1cmVJbmRleDtcclxuICAgICAgICAgIGNvb3JkaW5hdGVzID0gdHVyZi5jb29yZFJlZHVjZShcclxuICAgICAgICAgICAgcG9seWdvblBvaW50cyxcclxuICAgICAgICAgICAgZnVuY3Rpb24oYWNjdW11bGF0b3IsIG9sZFBvaW50LCBpKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSBpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludCwgcG9pbnRdO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludF07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtdXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBvcy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHBvcy5wdXNoKFtjb29yZGluYXRlc10pO1xyXG4gICAgICBuZXdQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24ocG9zKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXdQb2x5Z29uO1xyXG4gIH1cclxuXHJcbiAgcG9seWdvbkRpZmZlcmVuY2UoXHJcbiAgICBwb2x5Z29uMTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIHBvbHlnb24yOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBjb25zdCBkaWZmID0gdHVyZi5kaWZmZXJlbmNlKHBvbHlnb24xLCBwb2x5Z29uMik7XHJcbiAgICBcclxuICAgIHJldHVybiB0aGlzLmdldFR1cmZQb2x5Z29uKGRpZmYpO1xyXG4gIH1cclxuICBnZXRCb3VuZGluZ0JveENvbXBhc3NQb3NpdGlvbihcclxuICAgIHBvbHlnb24sXHJcbiAgICBNYXJrZXJQb3NpdGlvbjogSUNvbXBhc3MsXHJcbiAgICB1c2VPZmZzZXQsXHJcbiAgICBvZmZzZXREaXJlY3Rpb25cclxuICApIHtcclxuICAgIGNvbnN0IHAgPSB0aGlzLmdldE11bHRpUG9seWdvbihwb2x5Z29uKTtcclxuICAgIGNvbnN0IGNvbXBhc3MgPSB0aGlzLmdldEJvdW5kaW5nQm94Q29tcGFzcyhwb2x5Z29uKTtcclxuICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XHJcbiAgICBjb25zdCBjb29yZCA9IHRoaXMuZ2V0Q29vcmQoY29tcGFzcy5kaXJlY3Rpb24uTm9ydGgpO1xyXG4gICAgY29uc3QgbmVhcmVzdFBvaW50ID0gdHVyZi5uZWFyZXN0UG9pbnQoY29vcmQsIHBvbHlnb25Qb2ludHMpO1xyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBwcml2YXRlIGdldEJvdW5kaW5nQm94Q29tcGFzcyhwb2x5Z29uKTogQ29tcGFzcyB7XHJcbiAgICBjb25zdCBwID0gdGhpcy5nZXRNdWx0aVBvbHlnb24ocG9seWdvbik7XHJcbiAgICBjb25zdCBjZW50ZXJPZk1hc3MgPSB0dXJmLmNlbnRlck9mTWFzcyhwKTtcclxuICAgIGNvbnN0IGIgPSB0dXJmLmJib3gocCk7XHJcbiAgICBjb25zdCBtaW5YID0gYlswXTtcclxuICAgIGNvbnN0IG1pblkgPSBiWzFdO1xyXG4gICAgY29uc3QgbWF4WCA9IGJbMl07XHJcbiAgICBjb25zdCBtYXhZID0gYlszXTtcclxuICAgIGNvbnN0IGNvbXBhc3MgPSBuZXcgQ29tcGFzcyhtaW5YLCBtaW5ZLCBtYXhYLCBtYXhZKTtcclxuICAgIC8vIGNvbXBhc3MuZGlyZWN0aW9uLkNlbnRlck9mTWFzcyA9IGNlbnRlck9mTWFzcy5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXTtcclxuXHJcbiAgICByZXR1cm4gY29tcGFzcztcclxuICB9XHJcblxyXG4gIGdldE5lYXJlc3RQb2ludEluZGV4KFxyXG4gICAgdGFyZ2V0UG9pbnQ6IHR1cmYuQ29vcmQsXHJcbiAgICBwb2ludHM6IHR1cmYuRmVhdHVyZUNvbGxlY3Rpb248dHVyZi5Qb2ludD5cclxuICApOiBudW1iZXIge1xyXG4gICAgY29uc3QgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludCh0YXJnZXRQb2ludCwgcG9pbnRzKS5wcm9wZXJ0aWVzLmZlYXR1cmVJbmRleDtcclxuICAgIHJldHVybiBpbmRleDtcclxuICB9XHJcbiAgZ2V0Q29vcmQocG9pbnQ6IElMYXRMbmcpOiB0dXJmLkNvb3JkIHtcclxuICAgIGNvbnN0IGNvb3JkID0gdHVyZi5nZXRDb29yZChbcG9pbnQubG5nLCBwb2ludC5sYXRdKTtcclxuICAgIHJldHVybiBjb29yZDtcclxuICB9XHJcbiAgZ2V0RmVhdHVyZVBvaW50Q29sbGVjdGlvbihwb2ludHM6IElMYXRMbmdbXSk6IHR1cmYuRmVhdHVyZUNvbGxlY3Rpb24ge1xyXG4gICAgY29uc3QgcHRzID0gW107XHJcbiAgICBwb2ludHMuZm9yRWFjaCh2ID0+IHtcclxuICAgICAgY29uc3QgcCA9IHR1cmYucG9pbnQoW3YubG5nLCB2LmxhdF0sIHt9KTtcclxuICAgICAgcHRzLnB1c2gocCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBmYyA9IHR1cmYuZmVhdHVyZUNvbGxlY3Rpb24ocHRzKTtcclxuXHJcbiAgICByZXR1cm4gZmM7XHJcbiAgfVxyXG59XHJcbiJdfQ==
