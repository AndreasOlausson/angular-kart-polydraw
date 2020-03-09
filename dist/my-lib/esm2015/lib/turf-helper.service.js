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
        console.log('poly1: ', poly1);
        console.log('poly2: ', poly2);
        const union = turf.union(poly1, poly2);
        return this.getTurfPolygon(union);
    }
    turfConcaveman(feature) {
        //console.log("turfConcaveman", points);
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
        console.log('Get TurfPolygon:', polygon);
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
        console.log('polygonIntersect', polygon, latlngs);
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
    }
    getIntersection(poly1, poly2) {
        return turf.intersect(poly1, poly2);
    }
    getDistance(point1, point2) {
        return turf.distance(point1, point2);
    }
    isWithin(polygon1, polygon2) {
        console.log(polygon1);
        console.log('Ytre: ', polygon2);
        return turf.booleanWithin(turf.polygon([polygon1]), turf.polygon([polygon2]));
    }
    equalPolygons(polygon1, polygon2) {
        console.log(polygon1);
        console.log(polygon2);
        console.log(turf.booleanEqual(polygon1, polygon2));
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
        console.log('polygon: ', polygon);
        if (coords.length < 2) {
            const polygonPoints = turf.explode(polygon);
            console.log(turf.nearestPoint(point, polygonPoints));
            const index = turf.nearestPoint(point, polygonPoints).properties
                .featureIndex;
            const test = turf.coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
                if (index === i) {
                    return [...accumulator, oldPoint, point];
                }
                return [...accumulator, oldPoint];
            }, []);
            console.log('test', test);
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
                    console.log('coordinates', coordinates);
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
        console.log(diff);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyZi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi90dXJmLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUlwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDOztBQUlsQyxJQUFhLGlCQUFpQixHQUE5QixNQUFhLGlCQUFpQjtJQUU1QjtRQURRLHNCQUFpQixHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDdkQsQ0FBQztJQUVoQixLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUs7UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFdkMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxjQUFjLENBQ1osT0FBd0M7UUFFeEMsd0NBQXdDO1FBQ3hDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFckMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMs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TyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QseUJBQXlCLENBQUMsTUFBaUI7UUFDekMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNqQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztDQUNGLENBQUE7O0FBcFJZLGlCQUFpQjtJQUQ3QixVQUFVLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7O0dBQ3RCLGlCQUFpQixDQW9SN0I7U0FwUlksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyB0dXJmIGZyb20gJ0B0dXJmL3R1cmYnO1xuaW1wb3J0IGNvbmNhdmVtYW4gZnJvbSAnY29uY2F2ZW1hbic7XG5pbXBvcnQgeyBGZWF0dXJlLCBQb2x5Z29uLCBNdWx0aVBvbHlnb24sIFBvc2l0aW9uIH0gZnJvbSAnQHR1cmYvdHVyZic7XG5pbXBvcnQgeyBNYXJrZXJQb3NpdGlvbiB9IGZyb20gJy4vZW51bXMnO1xuaW1wb3J0IHsgSUNvbXBhc3MgfSBmcm9tICcuL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBDb21wYXNzIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSAnLi9wb2x5Z29uLWhlbHBlcnMnO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIFR1cmZIZWxwZXJTZXJ2aWNlIHtcbiAgcHJpdmF0ZSBzaW1wbGlmeVRvbGVyYW5jZSA9IHsgdG9sZXJhbmNlOiAwLjAwMDEsIGhpZ2hRdWFsaXR5OiBmYWxzZSB9O1xuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgdW5pb24ocG9seTEsIHBvbHkyKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XG4gICAgY29uc29sZS5sb2coJ3BvbHkxOiAnLCBwb2x5MSk7XG4gICAgY29uc29sZS5sb2coJ3BvbHkyOiAnLCBwb2x5Mik7XG5cbiAgICBjb25zdCB1bmlvbiA9IHR1cmYudW5pb24ocG9seTEsIHBvbHkyKTtcblxuICAgIHJldHVybiB0aGlzLmdldFR1cmZQb2x5Z29uKHVuaW9uKTtcbiAgfVxuXG4gIHR1cmZDb25jYXZlbWFuKFxuICAgIGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XG4gICAgLy9jb25zb2xlLmxvZyhcInR1cmZDb25jYXZlbWFuXCIsIHBvaW50cyk7XG4gICAgY29uc3QgcG9pbnRzID0gdHVyZi5leHBsb2RlKGZlYXR1cmUpO1xuXG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBwb2ludHMuZmVhdHVyZXMubWFwKGYgPT4gZi5nZW9tZXRyeS5jb29yZGluYXRlcyk7XG4gICAgcmV0dXJuIHR1cmYubXVsdGlQb2x5Z29uKFtbY29uY2F2ZW1hbihjb29yZGluYXRlcyldXSk7XG4gIH1cblxuICAvL1RPRE8gYWRkIHNvbWUgc29ydCBvZiBkeW5hbWljIHRvbGVyYW5jZVxuICBnZXRTaW1wbGlmaWVkKFxuICAgIHBvbHlnb246IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XG4gICAgY29uc3QgdG9sZXJhbmNlID0gdGhpcy5zaW1wbGlmeVRvbGVyYW5jZTtcbiAgICBjb25zdCBzaW1wbGlmaWVkID0gdHVyZi5zaW1wbGlmeShwb2x5Z29uLCB0b2xlcmFuY2UpO1xuICAgIHJldHVybiBzaW1wbGlmaWVkO1xuICB9XG5cbiAgZ2V0VHVyZlBvbHlnb24oXG4gICAgcG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxuICApOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+IHtcbiAgICBsZXQgdHVyZlBvbHlnb247XG4gICAgY29uc29sZS5sb2coJ0dldCBUdXJmUG9seWdvbjonLCBwb2x5Z29uKTtcbiAgICAvLyBpZiAocG9seWdvbi5nZW9tZXRyeSlcbiAgICBpZiAocG9seWdvbi5nZW9tZXRyeS50eXBlID09PSAnUG9seWdvbicpIHtcbiAgICAgIHR1cmZQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24oW3BvbHlnb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHVyZlBvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihwb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHR1cmZQb2x5Z29uO1xuICB9XG5cbiAgZ2V0TXVsdGlQb2x5Z29uKFxuICAgIHBvbHlnb25BcnJheTogUG9zaXRpb25bXVtdW11cbiAgKTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiB7XG4gICAgcmV0dXJuIHR1cmYubXVsdGlQb2x5Z29uKHBvbHlnb25BcnJheSk7XG4gIH1cblxuICBnZXRLaW5rcyhmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XG4gICAgY29uc3QgdW5raW5rID0gdHVyZi51bmtpbmtQb2x5Z29uKGZlYXR1cmUpO1xuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gW107XG4gICAgdHVyZi5mZWF0dXJlRWFjaCh1bmtpbmssIGN1cnJlbnQgPT4ge1xuICAgICAgY29vcmRpbmF0ZXMucHVzaChjdXJyZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb29yZGluYXRlcztcbiAgfVxuXG4gIGdldENvb3JkcyhmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XG4gICAgcmV0dXJuIHR1cmYuZ2V0Q29vcmRzKGZlYXR1cmUpO1xuICB9XG5cbiAgaGFzS2lua3MoZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xuICAgIGNvbnN0IGtpbmtzID0gdHVyZi5raW5rcyhmZWF0dXJlKTtcbiAgICByZXR1cm4ga2lua3MuZmVhdHVyZXMubGVuZ3RoID4gMDtcbiAgfVxuXG4gIHBvbHlnb25JbnRlcnNlY3QoXG4gICAgcG9seWdvbjogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XG4gICk6IGJvb2xlYW4ge1xuICAgIC8vIGNvbnN0IG9sZFBvbHlnb24gPSBwb2x5Z29uLnRvR2VvSlNPTigpO1xuICAgIGNvbnN0IHBvbHkgPSBbXTtcbiAgICBjb25zdCBwb2x5MiA9IFtdO1xuXG4gICAgY29uc29sZS5sb2coJ3BvbHlnb25JbnRlcnNlY3QnLCBwb2x5Z29uLCBsYXRsbmdzKTtcblxuICAgIGNvbnN0IGxhdGxuZ3NDb29yZHMgPSB0dXJmLmdldENvb3JkcyhsYXRsbmdzKTtcbiAgICBsYXRsbmdzQ29vcmRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBjb25zdCBmZWF0ID0geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbZWxlbWVudFswXV0gfTtcblxuICAgICAgcG9seS5wdXNoKGZlYXQpO1xuICAgIH0pO1xuICAgIGNvbnN0IHBvbHlnb25Db29yZHMgPSB0dXJmLmdldENvb3Jkcyhwb2x5Z29uKTtcbiAgICBwb2x5Z29uQ29vcmRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBjb25zdCBmZWF0ID0geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbZWxlbWVudFswXV0gfTtcblxuICAgICAgcG9seTIucHVzaChmZWF0KTtcbiAgICB9KTtcbiAgICBsZXQgaW50ZXJzZWN0ID0gZmFsc2U7XG4gICAgbG9vcDE6IGZvciAobGV0IGkgPSAwOyBpIDwgcG9seS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMuZ2V0S2lua3MocG9seVtpXSkubGVuZ3RoIDwgMikge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvbHkyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKHRoaXMuZ2V0S2lua3MocG9seTJbal0pLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlc3QgPSB0dXJmLmludGVyc2VjdChwb2x5W2ldLCBwb2x5MltqXSk7XG4gICAgICAgICAgICBpZiAodGVzdD8uZ2VvbWV0cnkudHlwZSA9PT0gJ1BvaW50Jykge1xuICAgICAgICAgICAgICBpbnRlcnNlY3QgPSAhKFxuICAgICAgICAgICAgICAgIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHRlc3QsIHBvbHlbaV0pICYmXG4gICAgICAgICAgICAgICAgdHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24odGVzdCwgcG9seTJbal0pXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbnRlcnNlY3QgdGVzdDogJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRlc3Q/Lmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJykge1xuICAgICAgICAgICAgICBpbnRlcnNlY3QgPSAhIXR1cmYuaW50ZXJzZWN0KHBvbHlbaV0sIHBvbHkyW2pdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGludGVyc2VjdCkge1xuICAgICAgICAgICAgICBicmVhayBsb29wMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW50ZXJzZWN0O1xuICB9XG5cbiAgZ2V0SW50ZXJzZWN0aW9uKHBvbHkxLCBwb2x5Mik6IEZlYXR1cmUge1xuICAgIHJldHVybiB0dXJmLmludGVyc2VjdChwb2x5MSwgcG9seTIpO1xuICB9XG4gIGdldERpc3RhbmNlKHBvaW50MSwgcG9pbnQyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdHVyZi5kaXN0YW5jZShwb2ludDEsIHBvaW50Mik7XG4gIH1cblxuICBpc1dpdGhpbihwb2x5Z29uMTogUG9zaXRpb25bXSwgcG9seWdvbjI6IFBvc2l0aW9uW10pOiBib29sZWFuIHtcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMSk7XG4gICAgY29uc29sZS5sb2coJ1l0cmU6ICcsIHBvbHlnb24yKTtcbiAgICByZXR1cm4gdHVyZi5ib29sZWFuV2l0aGluKFxuICAgICAgdHVyZi5wb2x5Z29uKFtwb2x5Z29uMV0pLFxuICAgICAgdHVyZi5wb2x5Z29uKFtwb2x5Z29uMl0pXG4gICAgKTtcbiAgfVxuXG4gIGVxdWFsUG9seWdvbnMoXG4gICAgcG9seWdvbjE6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXG4gICAgcG9seWdvbjI6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cbiAgKSB7XG4gICAgY29uc29sZS5sb2cocG9seWdvbjEpO1xuICAgIGNvbnNvbGUubG9nKHBvbHlnb24yKTtcbiAgICBjb25zb2xlLmxvZyh0dXJmLmJvb2xlYW5FcXVhbChwb2x5Z29uMSwgcG9seWdvbjIpKTtcbiAgfVxuICAvL1RPRE8gb3B0aW9uYWwgYWRkIGV4dHJhIG1hcmtlcnMgZm9yIE4gRSBTIFcgKFdlIGhhdmUgdGhlIGNvcm5lcnMgTlcsIE5FLCBTRSwgU1cpXG4gIGNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihcbiAgICBwb2x5Z29uOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxuICAgIGFkZE1pZHBvaW50TWFya2VyczogYm9vbGVhbiA9IGZhbHNlXG4gICk6IEZlYXR1cmU8UG9seWdvbj4ge1xuICAgIGNvbnN0IGJib3ggPSB0dXJmLmJib3gocG9seWdvbi5nZW9tZXRyeSk7XG4gICAgY29uc3QgYmJveFBvbHlnb24gPSB0dXJmLmJib3hQb2x5Z29uKGJib3gpO1xuXG4gICAgY29uc3QgY29tcGFzcyA9IG5ldyBDb21wYXNzKGJib3hbMV0sIGJib3hbMF0sIGJib3hbM10sIGJib3hbMl0pO1xuXG4gICAgY29uc3QgY29tcGFzc1Bvc2l0aW9ucyA9IGNvbXBhc3MuZ2V0UG9zaXRpb25zKCk7XG5cbiAgICBiYm94UG9seWdvbi5nZW9tZXRyeS5jb29yZGluYXRlcyA9IFtdO1xuICAgIGJib3hQb2x5Z29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzID0gW2NvbXBhc3NQb3NpdGlvbnNdO1xuXG4gICAgcmV0dXJuIGJib3hQb2x5Z29uO1xuICB9XG4gIHBvbHlnb25Ub011bHRpUG9seWdvbihwb2x5OiBGZWF0dXJlPFBvbHlnb24+KTogRmVhdHVyZTxNdWx0aVBvbHlnb24+IHtcbiAgICBjb25zdCBtdWx0aSA9IHR1cmYubXVsdGlQb2x5Z29uKFtwb2x5Lmdlb21ldHJ5LmNvb3JkaW5hdGVzXSk7XG4gICAgcmV0dXJuIG11bHRpO1xuICB9XG4gIC8vVE9ETyAtY2xlYW51cFxuICBpbmplY3RQb2ludFRvUG9seWdvbihwb2x5Z29uLCBwb2ludCkge1xuICAgIGNvbnN0IGNvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKHBvbHlnb24pO1xuICAgIGxldCBuZXdQb2x5Z29uO1xuICAgIGNvbnNvbGUubG9nKCdwb2x5Z29uOiAnLCBwb2x5Z29uKTtcbiAgICBpZiAoY29vcmRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIGNvbnN0IHBvbHlnb25Qb2ludHMgPSB0dXJmLmV4cGxvZGUocG9seWdvbik7XG4gICAgICBjb25zb2xlLmxvZyh0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykpO1xuICAgICAgY29uc3QgaW5kZXggPSB0dXJmLm5lYXJlc3RQb2ludChwb2ludCwgcG9seWdvblBvaW50cykucHJvcGVydGllc1xuICAgICAgICAuZmVhdHVyZUluZGV4O1xuICAgICAgY29uc3QgdGVzdCA9IHR1cmYuY29vcmRSZWR1Y2UoXG4gICAgICAgIHBvbHlnb25Qb2ludHMsXG4gICAgICAgIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCBvbGRQb2ludCwgaSkge1xuICAgICAgICAgIGlmIChpbmRleCA9PT0gaSkge1xuICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnQsIHBvaW50XTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnRdO1xuICAgICAgICB9LFxuICAgICAgICBbXVxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKCd0ZXN0JywgdGVzdCk7XG4gICAgICBuZXdQb2x5Z29uID0gdHVyZi5tdWx0aVBvbHlnb24oW1t0ZXN0XV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwb3MgPSBbXTtcbiAgICAgIGxldCBjb29yZGluYXRlcyA9IFtdO1xuICAgICAgY29vcmRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGNvbnN0IHBvbHlnb24gPSB0dXJmLnBvbHlnb24oZWxlbWVudCk7XG4gICAgICAgIC8vIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHBvaW50LCBwb2x5Z29uKVxuICAgICAgICBpZiAodHVyZi5ib29sZWFuUG9pbnRJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pKSB7XG4gICAgICAgICAgY29uc3QgcG9seWdvblBvaW50cyA9IHR1cmYuZXhwbG9kZShwb2x5Z29uKTtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHR1cmYubmVhcmVzdFBvaW50KHBvaW50LCBwb2x5Z29uUG9pbnRzKS5wcm9wZXJ0aWVzXG4gICAgICAgICAgICAuZmVhdHVyZUluZGV4O1xuICAgICAgICAgIGNvb3JkaW5hdGVzID0gdHVyZi5jb29yZFJlZHVjZShcbiAgICAgICAgICAgIHBvbHlnb25Qb2ludHMsXG4gICAgICAgICAgICBmdW5jdGlvbihhY2N1bXVsYXRvciwgb2xkUG9pbnQsIGkpIHtcbiAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSBpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFsuLi5hY2N1bXVsYXRvciwgb2xkUG9pbnQsIHBvaW50XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gWy4uLmFjY3VtdWxhdG9yLCBvbGRQb2ludF07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgW11cbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdjb29yZGluYXRlcycsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwb3MucHVzaChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBwb3MucHVzaChbY29vcmRpbmF0ZXNdKTtcbiAgICAgIG5ld1BvbHlnb24gPSB0dXJmLm11bHRpUG9seWdvbihwb3MpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3UG9seWdvbjtcbiAgfVxuXG4gIHBvbHlnb25EaWZmZXJlbmNlKFxuICAgIHBvbHlnb24xOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxuICAgIHBvbHlnb24yOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XG4gICk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4ge1xuICAgIGNvbnN0IGRpZmYgPSB0dXJmLmRpZmZlcmVuY2UocG9seWdvbjEsIHBvbHlnb24yKTtcbiAgICBjb25zb2xlLmxvZyhkaWZmKTtcbiAgICByZXR1cm4gdGhpcy5nZXRUdXJmUG9seWdvbihkaWZmKTtcbiAgfVxuICBnZXRCb3VuZGluZ0JveENvbXBhc3NQb3NpdGlvbihcbiAgICBwb2x5Z29uLFxuICAgIE1hcmtlclBvc2l0aW9uOiBJQ29tcGFzcyxcbiAgICB1c2VPZmZzZXQsXG4gICAgb2Zmc2V0RGlyZWN0aW9uXG4gICkge1xuICAgIGNvbnN0IHAgPSB0aGlzLmdldE11bHRpUG9seWdvbihwb2x5Z29uKTtcbiAgICBjb25zdCBjb21wYXNzID0gdGhpcy5nZXRCb3VuZGluZ0JveENvbXBhc3MocG9seWdvbik7XG4gICAgY29uc3QgcG9seWdvblBvaW50cyA9IHR1cmYuZXhwbG9kZShwb2x5Z29uKTtcbiAgICBjb25zdCBjb29yZCA9IHRoaXMuZ2V0Q29vcmQoY29tcGFzcy5kaXJlY3Rpb24uTm9ydGgpO1xuICAgIGNvbnN0IG5lYXJlc3RQb2ludCA9IHR1cmYubmVhcmVzdFBvaW50KGNvb3JkLCBwb2x5Z29uUG9pbnRzKTtcblxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHByaXZhdGUgZ2V0Qm91bmRpbmdCb3hDb21wYXNzKHBvbHlnb24pOiBDb21wYXNzIHtcbiAgICBjb25zdCBwID0gdGhpcy5nZXRNdWx0aVBvbHlnb24ocG9seWdvbik7XG4gICAgY29uc3QgY2VudGVyT2ZNYXNzID0gdHVyZi5jZW50ZXJPZk1hc3MocCk7XG4gICAgY29uc3QgYiA9IHR1cmYuYmJveChwKTtcbiAgICBjb25zdCBtaW5YID0gYlswXTtcbiAgICBjb25zdCBtaW5ZID0gYlsxXTtcbiAgICBjb25zdCBtYXhYID0gYlsyXTtcbiAgICBjb25zdCBtYXhZID0gYlszXTtcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MobWluWCwgbWluWSwgbWF4WCwgbWF4WSk7XG4gICAgLy8gY29tcGFzcy5kaXJlY3Rpb24uQ2VudGVyT2ZNYXNzID0gY2VudGVyT2ZNYXNzLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdWzBdO1xuXG4gICAgcmV0dXJuIGNvbXBhc3M7XG4gIH1cblxuICBnZXROZWFyZXN0UG9pbnRJbmRleChcbiAgICB0YXJnZXRQb2ludDogdHVyZi5Db29yZCxcbiAgICBwb2ludHM6IHR1cmYuRmVhdHVyZUNvbGxlY3Rpb248dHVyZi5Qb2ludD5cbiAgKTogbnVtYmVyIHtcbiAgICBjb25zdCBpbmRleCA9IHR1cmYubmVhcmVzdFBvaW50KHRhcmdldFBvaW50LCBwb2ludHMpLnByb3BlcnRpZXMuZmVhdHVyZUluZGV4O1xuICAgIHJldHVybiBpbmRleDtcbiAgfVxuICBnZXRDb29yZChwb2ludDogSUxhdExuZyk6IHR1cmYuQ29vcmQge1xuICAgIGNvbnN0IGNvb3JkID0gdHVyZi5nZXRDb29yZChbcG9pbnQubG5nLCBwb2ludC5sYXRdKTtcbiAgICByZXR1cm4gY29vcmQ7XG4gIH1cbiAgZ2V0RmVhdHVyZVBvaW50Q29sbGVjdGlvbihwb2ludHM6IElMYXRMbmdbXSk6IHR1cmYuRmVhdHVyZUNvbGxlY3Rpb24ge1xuICAgIGNvbnN0IHB0cyA9IFtdO1xuICAgIHBvaW50cy5mb3JFYWNoKHYgPT4ge1xuICAgICAgY29uc3QgcCA9IHR1cmYucG9pbnQoW3YubG5nLCB2LmxhdF0sIHt9KTtcbiAgICAgIHB0cy5wdXNoKHApO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZmMgPSB0dXJmLmZlYXR1cmVDb2xsZWN0aW9uKHB0cyk7XG5cbiAgICByZXR1cm4gZmM7XG4gIH1cbn1cbiJdfQ==