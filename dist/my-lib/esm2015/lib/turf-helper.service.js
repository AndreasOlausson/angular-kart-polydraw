import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';
import concaveman from 'concaveman';
import { Compass } from './utils';
import * as i0 from "@angular/core";
export class TurfHelperService {
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
}
TurfHelperService.ɵfac = function TurfHelperService_Factory(t) { return new (t || TurfHelperService)(); };
TurfHelperService.ɵprov = i0.ɵɵdefineInjectable({ token: TurfHelperService, factory: TurfHelperService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(TurfHelperService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return []; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi90dXJmLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxLQUFLLElBQUksTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFDO0FBSXBDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7O0FBSWxDLE1BQU0sT0FBTyxpQkFBaUI7SUFFNUI7UUFEUSxzQkFBaUIsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO0lBQ3ZELENBQUM7SUFFaEIsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLO1FBSWhCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXZDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsY0FBYyxDQUNaLE9BQXdDO1FBR3hDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFckMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCx5Q0FBeUM7SUFDekMsYUFBYSxDQUNYLE9BQXdDO1FBRXhDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztR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LEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QseUJBQXlCLENBQUMsTUFBaUI7UUFDekMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNqQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQzs7a0ZBblJVLGlCQUFpQjt5REFBakIsaUJBQWlCLFdBQWpCLGlCQUFpQixtQkFESixNQUFNO2tEQUNuQixpQkFBaUI7Y0FEN0IsVUFBVTtlQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCAqIGFzIHR1cmYgZnJvbSAnQHR1cmYvdHVyZic7XHJcbmltcG9ydCBjb25jYXZlbWFuIGZyb20gJ2NvbmNhdmVtYW4nO1xyXG5pbXBvcnQgeyBGZWF0dXJlLCBQb2x5Z29uLCBNdWx0aVBvbHlnb24sIFBvc2l0aW9uIH0gZnJvbSAnQHR1cmYvdHVyZic7XHJcbmltcG9ydCB7IE1hcmtlclBvc2l0aW9uIH0gZnJvbSAnLi9lbnVtcyc7XHJcbmltcG9ydCB7IElDb21wYXNzIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBDb21wYXNzIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tICcuL3BvbHlnb24taGVscGVycyc7XHJcblxyXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxyXG5leHBvcnQgY2xhc3MgVHVyZkhlbHBlclNlcnZpY2Uge1xyXG4gIHByaXZhdGUgc2ltcGxpZnlUb2xlcmFuY2UgPSB7IHRvbGVyYW5jZTogMC4wMDAxLCBoaWdoUXVhbGl0eTogZmFsc2UgfTtcclxuICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gIHVuaW9uKHBvbHkxLCBwb2x5Mik6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xyXG4gICAgXHJcbiAgICBcclxuXHJcbiAgICBjb25zdCB1bmlvbiA9IHR1cmYudW5pb24ocG9seTEsIHBvbHkyKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5nZXRUdXJmUG9seWdvbih1bmlvbik7XHJcbiAgfVxyXG5cclxuICB0dXJmQ29uY2F2ZW1hbihcclxuICAgIGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cclxuICApOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIFxyXG4gICAgY29uc3QgcG9pbnRzID0gdHVyZi5leHBsb2RlKGZlYXR1cmUpO1xyXG5cclxuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gcG9pbnRzLmZlYXR1cmVzLm1hcChmID0+IGYuZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xyXG4gICAgcmV0dXJuIHR1cmYubXVsdGlQb2x5Z29uKFtbY29uY2F2ZW1hbihjb29yZGluYXRlcyldXSk7XHJcbiAgfVxyXG5cclxuICAvL1RPRE8gYWRkIHNvbWUgc29ydCBvZiBkeW5hbWljIHRvbGVyYW5jZVxyXG4gIGdldFNpbXBsaWZpZWQoXHJcbiAgICBwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBjb25zdCB0b2xlcmFuY2UgPSB0aGlzLnNpbXBsaWZ5VG9sZXJhbmNlO1xyXG4gICAgY29uc3Qgc2ltcGxpZmllZCA9IHR1cmYuc2ltcGxpZnkocG9seWdvbiwgdG9sZXJhbmNlKTtcclxuICAgIHJldHVybiBzaW1wbGlmaWVkO1xyXG4gIH1cclxuXHJcbiAgZ2V0VHVyZlBvbHlnb24oXHJcbiAgICBwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICBsZXQgdHVyZlBvbHlnb247XHJcbiAgICBcclxuICAgIC8vIGlmIChwb2x5Z29uLmdlb21ldHJ5KVxyXG4gICAgaWYgKHBvbHlnb24uZ2VvbWV0cnkudHlwZSA9PT0gJ1BvbHlnb24nKSB7XHJcbiAgICAgIHR1cmZQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24oW3BvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNdKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHR1cmZQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24ocG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHVyZlBvbHlnb247XHJcbiAgfVxyXG5cclxuICBnZXRNdWx0aVBvbHlnb24oXHJcbiAgICBwb2x5Z29uQXJyYXk6IFBvc2l0aW9uW11bXVtdXHJcbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XHJcbiAgICByZXR1cm4gdHVyZi5tdWx0aVBvbHlnb24ocG9seWdvbkFycmF5KTtcclxuICB9XHJcblxyXG4gIGdldEtpbmtzKGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnN0IHVua2luayA9IHR1cmYudW5raW5rUG9seWdvbihmZWF0dXJlKTtcclxuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICB0dXJmLmZlYXR1cmVFYWNoKHVua2luaywgY3VycmVudCA9PiB7XHJcbiAgICAgIGNvb3JkaW5hdGVzLnB1c2goY3VycmVudCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gY29vcmRpbmF0ZXM7XHJcbiAgfVxyXG5cclxuICBnZXRDb29yZHMoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgcmV0dXJuIHR1cmYuZ2V0Q29vcmRzKGZlYXR1cmUpO1xyXG4gIH1cclxuXHJcbiAgaGFzS2lua3MoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3Qga2lua3MgPSB0dXJmLmtpbmtzKGZlYXR1cmUpO1xyXG4gICAgcmV0dXJuIGtpbmtzLmZlYXR1cmVzLmxlbmd0aCA+IDA7XHJcbiAgfVxyXG5cclxuICBwb2x5Z29uSW50ZXJzZWN0KFxyXG4gICAgcG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cclxuICApOiBib29sZWFuIHtcclxuICAgIC8vIGNvbnN0IG9sZFBvbHlnb24gPSBwb2x5Z29uLnRvR2VvSlNPTigpO1xyXG4gICAgY29uc3QgcG9seSA9IFtdO1xyXG4gICAgY29uc3QgcG9seTIgPSBbXTtcclxuXHJcbiAgICBcclxuXHJcbiAgICBjb25zdCBsYXRsbmdzQ29vcmRzID0gdHVyZi5nZXRDb29yZHMobGF0bG5ncyk7XHJcbiAgICBsYXRsbmdzQ29vcmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXQgPSB7IHR5cGU6ICdQb2x5Z29uJywgY29vcmRpbmF0ZXM6IFtlbGVtZW50WzBdXSB9O1xyXG5cclxuICAgICAgcG9seS5wdXNoKGZlYXQpO1xyXG4gICAgfSk7XHJcbiAgICBjb25zdCBwb2x5Z29uQ29vcmRzID0gdHVyZi5nZXRDb29yZHMocG9seWdvbik7XHJcbiAgICBwb2x5Z29uQ29vcmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXQgPSB7IHR5cGU6ICdQb2x5Z29uJywgY29vcmRpbmF0ZXM6IFtlbGVtZW50WzBdXSB9O1xyXG5cclxuICAgICAgcG9seTIucHVzaChmZWF0KTtcclxuICAgIH0pO1xyXG4gICAgbGV0IGludGVyc2VjdCA9IGZhbHNlO1xyXG4gICAgbG9vcDE6IGZvciAobGV0IGkgPSAwOyBpIDwgcG9seS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAodGhpcy5nZXRLaW5rcyhwb2x5W2ldKS5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb2x5Mi5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgaWYgKHRoaXMuZ2V0S2lua3MocG9seTJbal0pLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgY29uc3QgdGVzdCA9IHR1cmYuaW50ZXJzZWN0KHBvbHlbaV0sIHBvbHkyW2pdKTtcclxuICAgICAgICAgICAgaWYgKHRlc3Q/Lmdlb21ldHJ5LnR5cGUgPT09ICdQb2ludCcpIHtcclxuICAgICAgICAgICAgICBpbnRlcnNlY3QgPSAhKFxyXG4gICAgICAgICAgICAgICAgdHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24odGVzdCwgcG9seVtpXSkgJiZcclxuICAgICAgICAgICAgICAgIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHRlc3QsIHBvbHkyW2pdKVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGVzdD8uZ2VvbWV0cnkudHlwZSA9PT0gJ1BvbHlnb24nKSB7XHJcbiAgICAgICAgICAgICAgaW50ZXJzZWN0ID0gISF0dXJmLmludGVyc2VjdChwb2x5W2ldLCBwb2x5MltqXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpbnRlcnNlY3QpIHtcclxuICAgICAgICAgICAgICBicmVhayBsb29wMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpbnRlcnNlY3Q7XHJcbiAgfVxyXG5cclxuICBnZXRJbnRlcnNlY3Rpb24ocG9seTEsIHBvbHkyKTogRmVhdHVyZSB7XHJcbiAgICByZXR1cm4gdHVyZi5pbnRlcnNlY3QocG9seTEsIHBvbHkyKTtcclxuICB9XHJcbiAgZ2V0RGlzdGFuY2UocG9pbnQxLCBwb2ludDIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHR1cmYuZGlzdGFuY2UocG9pbnQxLCBwb2ludDIpO1xyXG4gIH1cclxuXHJcbiAgaXNXaXRoaW4ocG9seWdvbjE6IFBvc2l0aW9uW10sIHBvbHlnb24yOiBQb3NpdGlvbltdKTogYm9vbGVhbiB7XHJcbiAgICBcclxuICAgIFxyXG4gICAgcmV0dXJuIHR1cmYuYm9vbGVhbldpdGhpbihcclxuICAgICAgdHVyZi5wb2x5Z29uKFtwb2x5Z29uMV0pLFxyXG4gICAgICB0dXJmLnBvbHlnb24oW3BvbHlnb24yXSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBlcXVhbFBvbHlnb25zKFxyXG4gICAgcG9seWdvbjE6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBwb2x5Z29uMjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICkge1xyXG4gICAgXHJcbiAgICBcclxuICAgIFxyXG4gIH1cclxuICAvL1RPRE8gb3B0aW9uYWwgYWRkIGV4dHJhIG1hcmtlcnMgZm9yIE4gRSBTIFcgKFdlIGhhdmUgdGhlIGNvcm5lcnMgTlcsIE5FLCBTRSwgU1cpXHJcbiAgY29udmVydFRvQm91bmRpbmdCb3hQb2x5Z29uKFxyXG4gICAgcG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIGFkZE1pZHBvaW50TWFya2VyczogYm9vbGVhbiA9IGZhbHNlXHJcbiAgKTogRmVhdHVyZTxQb2x5Z29uPiB7XHJcbiAgICBjb25zdCBiYm94ID0gdHVyZi5iYm94KHBvbHlnb24uZ2VvbWV0cnkpO1xyXG4gICAgY29uc3QgYmJveFBvbHlnb24gPSB0dXJmLmJib3hQb2x5Z29uKGJib3gpO1xyXG5cclxuICAgIGNvbnN0IGNvbXBhc3MgPSBuZXcgQ29tcGFzcyhiYm94WzFdLCBiYm94WzBdLCBiYm94WzNdLCBiYm94WzJdKTtcclxuXHJcbiAgICBjb25zdCBjb21wYXNzUG9zaXRpb25zID0gY29tcGFzcy5nZXRQb3NpdGlvbnMoKTtcclxuXHJcbiAgICBiYm94UG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyA9IFtdO1xyXG4gICAgYmJveFBvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMgPSBbY29tcGFzc1Bvc2l0aW9uc107XHJcblxyXG4gICAgcmV0dXJuIGJib3hQb2x5Z29uO1xyXG4gIH1cclxuICBwb2x5Z29uVG9NdWx0aVBvbHlnb24ocG9seTogRmVhdHVyZTxQb2x5Z29uPik6IEZlYXR1cmU8TXVsdGlQb2x5Z29uPiB7XHJcbiAgICBjb25zdCBtdWx0aSA9IHR1cmYubXVsdGlQb2x5Z29uKFtwb2x5Lmdlb21ldHJ5LmNvb3JkaW5hdGVzXSk7XHJcbiAgICByZXR1cm4gbXVsdGk7XHJcbiAgfVxyXG4gIC8vVE9ETyAtY2xlYW51cFxyXG4gIGluamVjdFBvaW50VG9Qb2x5Z29uKHBvbHlnb24sIHBvaW50KSB7XHJcbiAgICBjb25zdCBjb29yZHMgPSB0dXJmLmdldENvb3Jkcyhwb2x5Z29uKTtcclxuICAgIGxldCBuZXdQb2x5Z29uO1xyXG4gICAgXHJcbiAgICBpZiAoY29vcmRzLmxlbmd0aCA8IDIpIHtcclxuICAgICAgY29uc3QgcG9seWdvblBvaW50cyA9IHR1cmYuZXhwbG9kZShwb2x5Z29uKTtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGluZGV4ID0gdHVyZi5uZWFyZXN0UG9pbnQocG9pbnQsIHBvbHlnb25Qb2ludHMpLnByb3BlcnRpZXNcclxuICAgICAgICAuZmVhdHVyZUluZGV4O1xyXG4gICAgICBjb25zdCB0ZXN0ID0gdHVyZi5jb29yZFJlZHVjZShcclxuICAgICAgICBwb2x5Z29uUG9pbnRzLFxyXG4gICAgICAgIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCBvbGRQb2ludCwgaSkge1xyXG4gICAgICAgICAgaWYgKGluZGV4ID09PSBpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50LCBwb2ludF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBbXVxyXG4gICAgICApO1xyXG4gICAgICBcclxuICAgICAgbmV3UG9seWdvbiA9IHR1cmYubXVsdGlQb2x5Z29uKFtbdGVzdF1dKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHBvcyA9IFtdO1xyXG4gICAgICBsZXQgY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgICAgY29vcmRzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgY29uc3QgcG9seWdvbiA9IHR1cmYucG9seWdvbihlbGVtZW50KTtcclxuICAgICAgICAvLyB0dXJmLmJvb2xlYW5Qb2ludEluUG9seWdvbihwb2ludCwgcG9seWdvbilcclxuICAgICAgICBpZiAodHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pKSB7XHJcbiAgICAgICAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gdHVyZi5leHBsb2RlKHBvbHlnb24pO1xyXG4gICAgICAgICAgY29uc3QgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykucHJvcGVydGllc1xyXG4gICAgICAgICAgICAuZmVhdHVyZUluZGV4O1xyXG4gICAgICAgICAgY29vcmRpbmF0ZXMgPSB0dXJmLmNvb3JkUmVkdWNlKFxyXG4gICAgICAgICAgICBwb2x5Z29uUG9pbnRzLFxyXG4gICAgICAgICAgICBmdW5jdGlvbihhY2N1bXVsYXRvciwgb2xkUG9pbnQsIGkpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IGkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50LCBwb2ludF07XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiBbLi4uYWNjdW11bGF0b3IsIG9sZFBvaW50XTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgW11cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcG9zLnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcG9zLnB1c2goW2Nvb3JkaW5hdGVzXSk7XHJcbiAgICAgIG5ld1BvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihwb3MpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ld1BvbHlnb247XHJcbiAgfVxyXG5cclxuICBwb2x5Z29uRGlmZmVyZW5jZShcclxuICAgIHBvbHlnb24xOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgcG9seWdvbjI6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cclxuICApOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcclxuICAgIGNvbnN0IGRpZmYgPSB0dXJmLmRpZmZlcmVuY2UocG9seWdvbjEsIHBvbHlnb24yKTtcclxuICAgIFxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VHVyZlBvbHlnb24oZGlmZik7XHJcbiAgfVxyXG4gIGdldEJvdW5kaW5nQm94Q29tcGFzc1Bvc2l0aW9uKFxyXG4gICAgcG9seWdvbixcclxuICAgIE1hcmtlclBvc2l0aW9uOiBJQ29tcGFzcyxcclxuICAgIHVzZU9mZnNldCxcclxuICAgIG9mZnNldERpcmVjdGlvblxyXG4gICkge1xyXG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0TXVsdGlQb2x5Z29uKHBvbHlnb24pO1xyXG4gICAgY29uc3QgY29tcGFzcyA9IHRoaXMuZ2V0Qm91bmRpbmdCb3hDb21wYXNzKHBvbHlnb24pO1xyXG4gICAgY29uc3QgcG9seWdvblBvaW50cyA9IHR1cmYuZXhwbG9kZShwb2x5Z29uKTtcclxuICAgIGNvbnN0IGNvb3JkID0gdGhpcy5nZXRDb29yZChjb21wYXNzLmRpcmVjdGlvbi5Ob3J0aCk7XHJcbiAgICBjb25zdCBuZWFyZXN0UG9pbnQgPSB0dXJmLm5lYXJlc3RQb2ludChjb29yZCwgcG9seWdvblBvaW50cyk7XHJcblxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0Qm91bmRpbmdCb3hDb21wYXNzKHBvbHlnb24pOiBDb21wYXNzIHtcclxuICAgIGNvbnN0IHAgPSB0aGlzLmdldE11bHRpUG9seWdvbihwb2x5Z29uKTtcclxuICAgIGNvbnN0IGNlbnRlck9mTWFzcyA9IHR1cmYuY2VudGVyT2ZNYXNzKHApO1xyXG4gICAgY29uc3QgYiA9IHR1cmYuYmJveChwKTtcclxuICAgIGNvbnN0IG1pblggPSBiWzBdO1xyXG4gICAgY29uc3QgbWluWSA9IGJbMV07XHJcbiAgICBjb25zdCBtYXhYID0gYlsyXTtcclxuICAgIGNvbnN0IG1heFkgPSBiWzNdO1xyXG4gICAgY29uc3QgY29tcGFzcyA9IG5ldyBDb21wYXNzKG1pblgsIG1pblksIG1heFgsIG1heFkpO1xyXG4gICAgLy8gY29tcGFzcy5kaXJlY3Rpb24uQ2VudGVyT2ZNYXNzID0gY2VudGVyT2ZNYXNzLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdWzBdO1xyXG5cclxuICAgIHJldHVybiBjb21wYXNzO1xyXG4gIH1cclxuXHJcbiAgZ2V0TmVhcmVzdFBvaW50SW5kZXgoXHJcbiAgICB0YXJnZXRQb2ludDogdHVyZi5Db29yZCxcclxuICAgIHBvaW50czogdHVyZi5GZWF0dXJlQ29sbGVjdGlvbjx0dXJmLlBvaW50PlxyXG4gICk6IG51bWJlciB7XHJcbiAgICBjb25zdCBpbmRleCA9IHR1cmYubmVhcmVzdFBvaW50KHRhcmdldFBvaW50LCBwb2ludHMpLnByb3BlcnRpZXMuZmVhdHVyZUluZGV4O1xyXG4gICAgcmV0dXJuIGluZGV4O1xyXG4gIH1cclxuICBnZXRDb29yZChwb2ludDogSUxhdExuZyk6IHR1cmYuQ29vcmQge1xyXG4gICAgY29uc3QgY29vcmQgPSB0dXJmLmdldENvb3JkKFtwb2ludC5sbmcsIHBvaW50LmxhdF0pO1xyXG4gICAgcmV0dXJuIGNvb3JkO1xyXG4gIH1cclxuICBnZXRGZWF0dXJlUG9pbnRDb2xsZWN0aW9uKHBvaW50czogSUxhdExuZ1tdKTogdHVyZi5GZWF0dXJlQ29sbGVjdGlvbiB7XHJcbiAgICBjb25zdCBwdHMgPSBbXTtcclxuICAgIHBvaW50cy5mb3JFYWNoKHYgPT4ge1xyXG4gICAgICBjb25zdCBwID0gdHVyZi5wb2ludChbdi5sbmcsIHYubGF0XSwge30pO1xyXG4gICAgICBwdHMucHVzaChwKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGZjID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihwdHMpO1xyXG5cclxuICAgIHJldHVybiBmYztcclxuICB9XHJcbn1cclxuIl19