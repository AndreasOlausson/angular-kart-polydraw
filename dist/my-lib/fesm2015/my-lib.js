import { __decorate, __metadata } from 'tslib';
import { ɵɵdefineInjectable, Injectable, ɵɵinject, EventEmitter, Output, Component, ComponentFactoryResolver, Injector, INJECTOR, NgModule } from '@angular/core';
import { Polyline, Polygon, polygon as polygon$1, polyline, FeatureGroup, GeoJSON, Marker, divIcon, DomUtil } from 'leaflet';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, filter, debounceTime, takeUntil } from 'rxjs/operators';
import { union, explode, multiPolygon, simplify, unkinkPolygon, featureEach, getCoords, kinks as kinks$1, intersect, distance, booleanWithin, polygon, booleanEqual, bbox, bboxPolygon, nearestPoint, coordReduce, booleanPointInPolygon, difference, centerOfMass, getCoord, point, featureCollection, area, length, midpoint } from '@turf/turf';
import concaveman from 'concaveman';

let PolyStateService = class PolyStateService {
    constructor() {
        this.mapSubject = new BehaviorSubject(null);
        this.map$ = this.mapSubject.asObservable();
        this.polygonSubject = new BehaviorSubject(null);
        this.polygons$ = this.polygonSubject.asObservable();
        this.mapStateSubject = new BehaviorSubject(new MapStateModel());
        this.mapState$ = this.mapStateSubject.asObservable();
        this.mapZoomLevel$ = this.mapState$.pipe(map((state) => state.mapBoundState.zoom));
    }
    updateMapStates(newState) {
        let state = this.mapStateSubject.value;
        state = Object.assign(Object.assign({}, state), newState);
        this.mapStateSubject.next(state);
    }
    updateMapState(map) {
        this.mapSubject.next(map);
    }
    updatePolygons(polygons) {
        console.log("map-state", polygons);
        this.polygonSubject.next(polygons);
    }
    updateMapBounds(mapBounds) {
        this.updateMapStates({ mapBoundState: mapBounds });
    }
};
PolyStateService.ɵprov = ɵɵdefineInjectable({ factory: function PolyStateService_Factory() { return new PolyStateService(); }, token: PolyStateService, providedIn: "root" });
PolyStateService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [])
], PolyStateService);
class MapStateModel {
    constructor(mapBoundState = new MapBoundsState(null, 11)) {
        this.mapBoundState = mapBoundState;
    }
}
class MapBoundsState {
    constructor(bounds, zoom) {
        this.bounds = bounds;
        this.zoom = zoom;
    }
}

var DrawMode;
(function (DrawMode) {
    DrawMode[DrawMode["Off"] = 0] = "Off";
    DrawMode[DrawMode["Add"] = 1] = "Add";
    DrawMode[DrawMode["Edit"] = 2] = "Edit";
    DrawMode[DrawMode["Subtract"] = 4] = "Subtract";
    DrawMode[DrawMode["AppendMarker"] = 8] = "AppendMarker";
    DrawMode[DrawMode["LoadPredefined"] = 16] = "LoadPredefined";
})(DrawMode || (DrawMode = {}));
var MarkerPosition;
(function (MarkerPosition) {
    // CenterOfMass = 0,
    MarkerPosition[MarkerPosition["North"] = 1] = "North";
    MarkerPosition[MarkerPosition["East"] = 2] = "East";
    MarkerPosition[MarkerPosition["South"] = 3] = "South";
    MarkerPosition[MarkerPosition["West"] = 4] = "West";
    MarkerPosition[MarkerPosition["NorthEast"] = 5] = "NorthEast";
    MarkerPosition[MarkerPosition["NorthWest"] = 6] = "NorthWest";
    MarkerPosition[MarkerPosition["SouthEast"] = 7] = "SouthEast";
    MarkerPosition[MarkerPosition["SouthWest"] = 8] = "SouthWest";
    // BoundingBoxCenter = 9
})(MarkerPosition || (MarkerPosition = {}));

class PolyDrawUtil {
    static getBounds(polygon, padding = 0) {
        const tmpLatLng = [];
        polygon.forEach(ll => {
            if (isNaN(ll.lat) || isNaN(ll.lng)) {
            }
            tmpLatLng.push(ll);
        });
        const polyLine = new Polyline(tmpLatLng);
        const bounds = polyLine.getBounds();
        if (padding !== 0) {
            return bounds.pad(padding);
        }
        return bounds;
    }
}
//TODO make compass ILatLng
class Compass {
    constructor(minLat = 0, minLng = 0, maxLat = 0, maxLng = 0) {
        this.direction = {
            // BoundingBoxCenter: { lat: 0, lng: 0 },
            // CenterOfMass: { lat: 0, lng: 0 },
            East: { lat: 0, lng: 0 },
            North: { lat: 0, lng: 0 },
            NorthEast: { lat: 0, lng: 0 },
            NorthWest: { lat: 0, lng: 0 },
            South: { lat: 0, lng: 0 },
            SouthEast: { lat: 0, lng: 0 },
            SouthWest: { lat: 0, lng: 0 },
            West: { lat: 0, lng: 0 }
        };
        this.direction.North = { lat: maxLat, lng: (minLng + maxLng) / 2 };
        this.direction.NorthEast = { lat: maxLat, lng: maxLng };
        this.direction.East = { lat: (minLat + maxLat) / 2, lng: maxLng };
        this.direction.SouthEast = { lat: minLat, lng: maxLng };
        this.direction.South = { lat: minLat, lng: (minLng + maxLng) / 2 };
        this.direction.SouthWest = { lat: minLat, lng: minLng };
        this.direction.West = { lat: (minLat + maxLat) / 2, lng: minLng };
        this.direction.NorthWest = { lat: maxLat, lng: minLng };
        // this.direction.CenterOfMass = { lat: 0, lng: 0 };
        // this.direction.BoundingBoxCenter = {lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2};
    }
    //TODO default return.
    getDirection(direction) {
        switch (direction) {
            // case MarkerPosition.CenterOfMass:
            //     return this.direction.CenterOfMass;
            case MarkerPosition.North:
                return this.direction.North;
            case MarkerPosition.NorthEast:
                return this.direction.NorthEast;
            case MarkerPosition.East:
                return this.direction.East;
            case MarkerPosition.SouthEast:
                return this.direction.SouthEast;
            case MarkerPosition.South:
                return this.direction.South;
            case MarkerPosition.SouthWest:
                return this.direction.SouthWest;
            case MarkerPosition.West:
                return this.direction.West;
            case MarkerPosition.NorthWest:
                return this.direction.NorthWest;
            // case MarkerPosition.BoundingBoxCenter:
            //     return this.direction.BoundingBoxCenter;
            default:
                return this.direction.North;
        }
    }
    //TODO startNode, go clockwise or not
    getPositions(startNode = MarkerPosition.SouthWest, clockwise = false, addClosingNode = true) {
        let positions = [];
        positions.push([this.direction.SouthWest.lng, this.direction.SouthWest.lat]);
        positions.push([this.direction.SouthWest.lng, this.direction.SouthWest.lat]);
        positions.push([this.direction.South.lng, this.direction.South.lat]);
        positions.push([this.direction.SouthEast.lng, this.direction.SouthEast.lat]);
        positions.push([this.direction.East.lng, this.direction.East.lat]);
        positions.push([this.direction.NorthEast.lng, this.direction.NorthEast.lat]);
        positions.push([this.direction.North.lng, this.direction.North.lat]);
        positions.push([this.direction.NorthWest.lng, this.direction.NorthWest.lat]);
        positions.push([this.direction.West.lng, this.direction.West.lat]);
        if (addClosingNode) {
            positions.push([this.direction.SouthWest.lng, this.direction.SouthWest.lat]);
        }
        return positions;
    }
}

let TurfHelperService = class TurfHelperService {
    constructor() {
        this.simplifyTolerance = { tolerance: 0.0001, highQuality: false };
    }
    union(poly1, poly2) {
        console.log('poly1: ', poly1);
        console.log('poly2: ', poly2);
        let union$1 = union(poly1, poly2);
        return this.getTurfPolygon(union$1);
    }
    turfConcaveman(feature) {
        //console.log("turfConcaveman", points);
        let points = explode(feature);
        const coordinates = points.features.map(f => f.geometry.coordinates);
        return multiPolygon([[concaveman(coordinates)]]);
    }
    //TODO add some sort of dynamic tolerance
    getSimplified(polygon) {
        const tolerance = this.simplifyTolerance;
        const simplified = simplify(polygon, tolerance);
        return simplified;
    }
    getTurfPolygon(polygon) {
        let turfPolygon;
        console.log('Get TurfPolygon:', polygon);
        // if (polygon.geometry)
        if (polygon.geometry.type === 'Polygon') {
            turfPolygon = multiPolygon([polygon.geometry.coordinates]);
        }
        else {
            turfPolygon = multiPolygon(polygon.geometry.coordinates);
        }
        return turfPolygon;
    }
    getMultiPolygon(polygonArray) {
        return multiPolygon(polygonArray);
    }
    getKinks(feature) {
        const unkink = unkinkPolygon(feature);
        let coordinates = [];
        featureEach(unkink, current => {
            coordinates.push(current);
        });
        return coordinates;
    }
    getCoords(feature) {
        return getCoords(feature);
    }
    hasKinks(feature) {
        const kinks = kinks$1(feature);
        return kinks.features.length > 0;
    }
    polygonIntersect(polygon, latlngs) {
        // const oldPolygon = polygon.toGeoJSON();
        let poly = [];
        let poly2 = [];
        console.log('polygonIntersect', polygon, latlngs);
        let latlngsCoords = getCoords(latlngs);
        latlngsCoords.forEach(element => {
            let feat = { type: 'Polygon', coordinates: [element[0]] };
            poly.push(feat);
        });
        let polygonCoords = getCoords(polygon);
        polygonCoords.forEach(element => {
            let feat = { type: 'Polygon', coordinates: [element[0]] };
            poly2.push(feat);
        });
        let intersect$1 = false;
        loop1: for (let i = 0; i < poly.length; i++) {
            if (this.getKinks(poly[i]).length < 2) {
                for (let j = 0; j < poly2.length; j++) {
                    if (this.getKinks(poly2[j]).length < 2) {
                        intersect$1 = !!intersect(poly[i], poly2[j]);
                        if (intersect$1) {
                            break loop1;
                        }
                    }
                }
            }
        }
        return intersect$1;
    }
    getIntersection(poly1, poly2) {
        return intersect(poly1, poly2);
    }
    getDistance(point1, point2) {
        return distance(point1, point2);
    }
    isWithin(polygon1, polygon2) {
        console.log(polygon1);
        console.log('Ytre: ', polygon2);
        return booleanWithin(polygon([polygon1]), polygon([polygon2]));
    }
    equalPolygons(polygon1, polygon2) {
        console.log(polygon1);
        console.log(polygon2);
        console.log(booleanEqual(polygon1, polygon2));
    }
    //TODO optional add extra markers for N E S W (We have the corners NW, NE, SE, SW)
    convertToBoundingBoxPolygon(polygon, addMidpointMarkers = false) {
        const bbox$1 = bbox(polygon.geometry);
        const bboxPolygon$1 = bboxPolygon(bbox$1);
        const compass = new Compass(bbox$1[1], bbox$1[0], bbox$1[3], bbox$1[2]);
        const compassPositions = compass.getPositions();
        bboxPolygon$1.geometry.coordinates = [];
        bboxPolygon$1.geometry.coordinates = [compassPositions];
        return bboxPolygon$1;
    }
    polygonToMultiPolygon(poly) {
        const multi = multiPolygon([poly.geometry.coordinates]);
        return multi;
    }
    //TODO -cleanup
    injectPointToPolygon(polygon$1, point) {
        let coords = getCoords(polygon$1);
        let newPolygon;
        console.log('polygon: ', polygon$1);
        if (coords.length < 2) {
            const polygonPoints = explode(polygon$1);
            console.log(nearestPoint(point, polygonPoints));
            let index = nearestPoint(point, polygonPoints).properties.featureIndex;
            const test = coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
                if (index === i) {
                    return [...accumulator, oldPoint, point];
                }
                return [...accumulator, oldPoint];
            }, []);
            console.log('test', test);
            newPolygon = multiPolygon([[test]]);
        }
        else {
            let pos = [];
            let coordinates = [];
            coords.forEach(element => {
                let polygon$1 = polygon(element);
                // turf.booleanPointInPolygon(point, polygon)
                if (booleanPointInPolygon(point, polygon$1)) {
                    const polygonPoints = explode(polygon$1);
                    let index = nearestPoint(point, polygonPoints).properties.featureIndex;
                    coordinates = coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
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
            newPolygon = multiPolygon(pos);
        }
        return newPolygon;
    }
    polygonDifference(polygon1, polygon2) {
        let diff = difference(polygon1, polygon2);
        console.log(diff);
        return this.getTurfPolygon(diff);
    }
    getBoundingBoxCompassPosition(polygon, MarkerPosition, useOffset, offsetDirection) {
        const p = this.getMultiPolygon(polygon);
        const compass = this.getBoundingBoxCompass(polygon);
        const polygonPoints = explode(polygon);
        const coord = this.getCoord(compass.direction.North);
        const nearestPoint$1 = nearestPoint(coord, polygonPoints);
        return null;
    }
    getBoundingBoxCompass(polygon) {
        const p = this.getMultiPolygon(polygon);
        const centerOfMass$1 = centerOfMass(p);
        const b = bbox(p);
        const minX = b[0];
        const minY = b[1];
        const maxX = b[2];
        const maxY = b[3];
        const compass = new Compass(minX, minY, maxX, maxY);
        // compass.direction.CenterOfMass = centerOfMass.geometry.coordinates[0][0];
        return compass;
    }
    getNearestPointIndex(targetPoint, points) {
        let index = nearestPoint(targetPoint, points).properties.featureIndex;
        return index;
    }
    getCoord(point) {
        const coord = getCoord([point.lng, point.lat]);
        return coord;
    }
    getFeaturePointCollection(points) {
        const pts = [];
        points.forEach(v => {
            const p = point([v.lng, v.lat], {});
            pts.push(p);
        });
        const fc = featureCollection(pts);
        return fc;
    }
};
TurfHelperService.ɵprov = ɵɵdefineInjectable({ factory: function TurfHelperService_Factory() { return new TurfHelperService(); }, token: TurfHelperService, providedIn: "root" });
TurfHelperService = __decorate([
    Injectable({ providedIn: 'root' }),
    __metadata("design:paramtypes", [])
], TurfHelperService);

class PolygonUtil {
    static getCenter(polygon) {
        const pi = Math.PI;
        let x = 0;
        let y = 0;
        let z = 0;
        polygon.forEach(v => {
            let lat1 = v.lat;
            let lon1 = v.lng;
            lat1 = lat1 * pi / 180;
            lon1 = lon1 * pi / 180;
            x += Math.cos(lat1) * Math.cos(lon1);
            y += Math.cos(lat1) * Math.sin(lon1);
            z += Math.sin(lat1);
        });
        let lng = Math.atan2(y, x);
        const hyp = Math.sqrt(x * x + y * y);
        let lat = Math.atan2(z, hyp);
        lat = lat * 180 / pi;
        lng = lng * 180 / pi;
        const center = { lat: lat, lng: lng };
        return center;
    }
    static getSouthWest(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getNorthWest();
    }
    static getNorthEast(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getNorthEast();
    }
    static getNorthWest(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getNorthWest();
    }
    static getSouthEast(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getSouthEast();
    }
    static getNorth(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getNorth();
    }
    static getSouth(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getSouth();
    }
    static getWest(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getWest();
    }
    static getEast(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getEast();
    }
    static getSqmArea(polygon) {
        const poly = new Polygon(polygon);
        const geoJsonPoly = poly.toGeoJSON();
        const area$1 = area((geoJsonPoly));
        return area$1;
    }
    static getPerimeter(polygon) {
        const poly = new Polygon(polygon);
        const geoJsonPoly = poly.toGeoJSON();
        const perimeter = length((geoJsonPoly), { units: "meters" });
        return perimeter;
    }
    static getPolygonChecksum(polygon) {
        const uniqueLatLngs = polygon.filter((v, i, a) => {
            return a.indexOf(a.find(x => x.lat === v.lat && x.lng === v.lng)) === i;
        });
        return uniqueLatLngs.reduce((a, b) => +a + +b.lat, 0) * uniqueLatLngs.reduce((a, b) => +a + +b.lng, 0);
    }
    static getMidPoint(point1, point2) {
        const p1 = point([point1.lng, point1.lat]);
        const p2 = point([point2.lng, point2.lat]);
        const midpoint$1 = midpoint(p1, p2);
        const returnPoint = {
            lat: midpoint$1.geometry.coordinates[1],
            lng: midpoint$1.geometry.coordinates[0]
        };
        return returnPoint;
    }
    static getBounds(polygon) {
        const tmpLatLng = [];
        polygon.forEach(ll => {
            if (isNaN(ll.lat) || isNaN(ll.lng)) {
            }
            tmpLatLng.push(ll);
        });
        const polyLine = new Polyline(tmpLatLng);
        const bounds = polyLine.getBounds();
        return bounds;
    }
}
//export class FreedrawSubtract extends L.FreeDraw {
//    constructor() {
//        //this will become L.FreeDraw
//        super(null);
//        //call methods in freedraw by this
//        const foo = this.size();
//        this.consoleLogNumberOfPolygons(foo);
//    }
//    consoleLogNumberOfPolygons(size: number): void {
//        console.log("Number of polygons: ", size);
//    }
//}

class PolygonInfo {
    constructor(polygon) {
        this.polygon = [];
        this.trashcanPoint = [];
        this.sqmArea = [];
        this.perimeter = [];
        console.log('PolygonInfo: ', polygon);
        polygon.forEach((polygons, i) => {
            this.trashcanPoint[i] = this.getTrashcanPoint(polygons[0]);
            this.sqmArea[i] = this.calculatePolygonArea(polygons[0]);
            this.perimeter[i] = this.calculatePolygonPerimeter(polygons[0]);
            console.log(polygons[0]);
            this.polygon[i] = polygons;
        });
    }
    setSqmArea(area) {
        this.sqmArea[0] = area;
    }
    getTrashcanPoint(polygon) {
        const res = Math.max.apply(Math, polygon.map(o => o.lat));
        const idx = polygon.findIndex(o => o.lat === res);
        let previousPoint;
        let nextPoint;
        if (idx > 0) {
            previousPoint = polygon[idx - 1];
            if (idx < polygon.length - 1) {
                nextPoint = polygon[idx + 1];
            }
            else {
                nextPoint = polygon[0];
            }
        }
        else {
            previousPoint = polygon[polygon.length - 1];
            nextPoint = polygon[idx + 1];
        }
        const secondPoint = previousPoint.lng < nextPoint.lng ? previousPoint : nextPoint;
        const midpoint = PolygonUtil.getMidPoint(polygon[idx], secondPoint);
        return midpoint;
    }
    calculatePolygonArea(polygon) {
        const area = PolygonUtil.getSqmArea(polygon);
        return area;
    }
    calculatePolygonPerimeter(polygon) {
        const perimeter = PolygonUtil.getPerimeter(polygon);
        return perimeter;
    }
}
const addClass = (selector, className) => {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
        elements.item(i).classList.add(className);
    }
};
const ɵ0 = addClass;
const removeClass = (selector, className) => {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
        elements.item(i).classList.remove(className);
    }
};
const ɵ1 = removeClass;
class PolygonDrawStates {
    constructor() {
        this.canUsePolyDraw = false;
        this.reset();
    }
    activate() {
        this.reset();
        this.isActivated = true;
    }
    reset() {
        this.isActivated = false;
        this.hasPolygons = false;
        this.canRevert = false;
        this.isAuto = false;
        this.resetDrawModes();
    }
    resetDrawModes() {
        this.isFreeDrawMode = false;
        removeClass('img.leaflet-tile', 'disable-events');
        this.isMoveMode = false;
    }
    setFreeDrawMode(isAuto = false) {
        if (isAuto) {
            this.isActivated = true;
        }
        if (this.isActivated) {
            this.resetDrawModes();
            this.isFreeDrawMode = true;
            addClass('img.leaflet-tile', 'disable-events');
            if (isAuto) {
                this.isAuto = true;
            }
        }
    }
    setMoveMode() {
        if (this.isActivated) {
            this.resetDrawModes();
            this.isMoveMode = true;
        }
    }
    forceCanUseFreeDraw() {
        this.canUsePolyDraw = true;
    }
}

let PolygonInformationService = class PolygonInformationService {
    constructor(mapStateService) {
        this.mapStateService = mapStateService;
        this.polygonInformationSubject = new Subject();
        this.polygonInformation$ = this.polygonInformationSubject.asObservable();
        this.polygonDrawStatesSubject = new Subject();
        this.polygonDrawStates$ = this.polygonDrawStatesSubject.asObservable();
        this.polygonDrawStates = null;
        this.polygonInformationStorage = [];
        this.polygonDrawStates = new PolygonDrawStates();
    }
    updatePolygons() {
        console.log("updatePolygons: ", this.polygonInformationStorage);
        let newPolygons = null;
        if (this.polygonInformationStorage.length > 0) {
            newPolygons = [];
            this.polygonInformationStorage.forEach(v => {
                let test = [];
                v.polygon.forEach(poly => {
                    let test2 = [];
                    poly.forEach(polygon => {
                        test2 = [...polygon];
                        if (polygon[0].toString() !== polygon[polygon.length - 1].toString()) {
                            test2.push(polygon[0]);
                        }
                        test.push(test2);
                    });
                });
                newPolygons.push(test);
            });
            this.polygonDrawStates.hasPolygons = true;
        }
        else {
            this.polygonDrawStates.reset();
            this.polygonDrawStates.hasPolygons = false;
        }
        this.mapStateService.updatePolygons(newPolygons);
        this.saveCurrentState();
    }
    saveCurrentState() {
        this.polygonInformationSubject.next(this.polygonInformationStorage);
        this.polygonDrawStatesSubject.next(this.polygonDrawStates);
        console.log("saveCurrentState: ", this.polygonInformationStorage);
    }
    deleteTrashcan(polygon) {
        const idx = this.polygonInformationStorage.findIndex(v => v.polygon[0] === polygon);
        this.polygonInformationStorage.splice(idx, 1);
        this.updatePolygons();
    }
    deleteTrashCanOnMulti(polygon) {
        let index = 0;
        console.log("DeleteTrashCan: ", polygon);
        console.log("deleteTrashCanOnMulti: ", this.polygonInformationStorage);
        // const idx = this.polygonInformationStorage.findIndex(v => v.polygon.forEach(poly =>{ poly === polygon}) );
        this.polygonInformationStorage.forEach((v, i) => {
            console.log(v.polygon);
            const id = v.polygon.findIndex(poly => poly.toString() === polygon.toString());
            if (id >= 0) {
                index = i;
                v.trashcanPoint.splice(id, 1);
                v.sqmArea.splice(id, 1);
                v.perimeter.splice(id, 1);
                v.polygon.splice(id, 1);
                console.log(v.polygon);
            }
            console.log("ID: ", id);
        });
        this.updatePolygons();
        console.log("Index: ", index);
        if (this.polygonInformationStorage.length > 1) {
            this.polygonInformationStorage.splice(index, 1);
        }
        console.log("deleteTrashCanOnMulti: ", this.polygonInformationStorage);
    }
    deletePolygonInformationStorage() {
        this.polygonInformationStorage = [];
    }
    createPolygonInformationStorage(arrayOfFeatureGroups) {
        console.log("Create Info: ", arrayOfFeatureGroups);
        if (arrayOfFeatureGroups.length > 0) {
            arrayOfFeatureGroups.forEach(featureGroup => {
                console.log(featureGroup.getLayers()[0].getLatLngs());
                let polyInfo = new PolygonInfo(featureGroup.getLayers()[0].getLatLngs());
                this.polygonInformationStorage.push(polyInfo);
            });
            this.updatePolygons();
        }
    }
    activate() {
        this.polygonDrawStates.activate();
    }
    reset() {
        this.polygonDrawStates.reset();
    }
    setMoveMode() {
        this.polygonDrawStates.setMoveMode();
    }
    setFreeDrawMode() {
        this.polygonDrawStates.setFreeDrawMode();
    }
};
PolygonInformationService.ctorParameters = () => [
    { type: PolyStateService }
];
PolygonInformationService.ɵprov = ɵɵdefineInjectable({ factory: function PolygonInformationService_Factory() { return new PolygonInformationService(ɵɵinject(PolyStateService)); }, token: PolygonInformationService, providedIn: "root" });
PolygonInformationService = __decorate([
    Injectable({ providedIn: "root" }),
    __metadata("design:paramtypes", [PolyStateService])
], PolygonInformationService);

var touchSupport = true;
var mergePolygons = true;
var kinks = false;
var markers = {
	menu: true,
	"delete": true,
	markerIcon: {
		styleClasses: [
			"polygon-marker"
		]
	},
	holeIcon: {
		styleClasses: [
			"polygon-marker",
			"hole"
		]
	},
	markerMenuIcon: {
		position: 4,
		styleClasses: [
			"polygon-marker",
			"menu"
		]
	},
	markerDeleteIcon: {
		position: 1,
		styleClasses: [
			"polygon-marker",
			"delete"
		]
	}
};
var polyLineOptions = {
	color: "#50622b",
	opacity: 1,
	smoothFactor: 0,
	noClip: true,
	clickable: false,
	weight: 2
};
var subtractLineOptions = {
	color: "#50622b",
	opacity: 1,
	smoothFactor: 0,
	noClip: true,
	clickable: false,
	weight: 2
};
var polygonOptions = {
	smoothFactor: 0.3,
	color: "#50622b",
	fillColor: "#b4cd8a",
	noClip: true
};
var defaultConfig = {
	touchSupport: touchSupport,
	mergePolygons: mergePolygons,
	kinks: kinks,
	markers: markers,
	polyLineOptions: polyLineOptions,
	subtractLineOptions: subtractLineOptions,
	polygonOptions: polygonOptions
};

let AlterPolygonComponent = class AlterPolygonComponent {
    constructor() {
        this.simplyfiClicked = new EventEmitter();
        this.bboxClicked = new EventEmitter();
    }
    onSimplify($event) {
        this.simplyfiClicked.emit($event);
    }
    onBbox($event) {
        this.bboxClicked.emit($event);
    }
};
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AlterPolygonComponent.prototype, "simplyfiClicked", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AlterPolygonComponent.prototype, "bboxClicked", void 0);
AlterPolygonComponent = __decorate([
    Component({
        selector: 'app-alter-polygon',
        template: "<div class=\"marker-menu-inner-wrapper\">\r\n  <div class=\"marker-menu-header\">Alter polygon</div>\r\n  <div class=\"marker-menu-content\">\r\n    <div class=\"marker-menu-button simplify\" (click)=\"onSimplify($event)\">Simplify</div>\r\n    <div class=\"marker-menu-separator\"></div>\r\n    <div class=\"marker-menu-button bbox\" (click)=\"onBbox($event)\" >bbox</div>\r\n  </div>\r\n</div>",
        styles: [""]
    })
], AlterPolygonComponent);

let ComponentGeneraterService = class ComponentGeneraterService {
    constructor(cfr, injector) {
        this.cfr = cfr;
        this.injector = injector;
        this.clusterPopuprefs = [];
    }
    ngOnDestroy() {
        this.destroyAngularPopupComponents();
    }
    generateAlterPopup() {
        const cmpFactory = this.cfr.resolveComponentFactory(AlterPolygonComponent);
        const popupComponentRef = cmpFactory.create(this.injector);
        this.clusterPopuprefs.push(popupComponentRef);
        return popupComponentRef;
    }
    destroyAngularPopupComponents() {
        this.clusterPopuprefs.forEach(cref => {
            if (cref) {
                cref.destroy();
            }
        });
        this.clusterPopuprefs = [];
    }
};
ComponentGeneraterService.ctorParameters = () => [
    { type: ComponentFactoryResolver },
    { type: Injector }
];
ComponentGeneraterService.ɵprov = ɵɵdefineInjectable({ factory: function ComponentGeneraterService_Factory() { return new ComponentGeneraterService(ɵɵinject(ComponentFactoryResolver), ɵɵinject(INJECTOR)); }, token: ComponentGeneraterService, providedIn: "root" });
ComponentGeneraterService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [ComponentFactoryResolver,
        Injector])
], ComponentGeneraterService);

let LeafletHelperService = class LeafletHelperService {
    constructor() {
    }
    createPolygon(latLngs) {
        const p = polygon$1(latLngs);
        return p;
    }
};
LeafletHelperService.ɵprov = ɵɵdefineInjectable({ factory: function LeafletHelperService_Factory() { return new LeafletHelperService(); }, token: LeafletHelperService, providedIn: "root" });
LeafletHelperService = __decorate([
    Injectable({ providedIn: "root" }),
    __metadata("design:paramtypes", [])
], LeafletHelperService);

let PolyDrawService = 
// Rename - PolyDrawService
class PolyDrawService {
    constructor(mapState, popupGenerator, turfHelper, polygonInformation, leafletHelper) {
        this.mapState = mapState;
        this.popupGenerator = popupGenerator;
        this.turfHelper = turfHelper;
        this.polygonInformation = polygonInformation;
        this.leafletHelper = leafletHelper;
        // DrawModes, determine UI buttons etc...
        this.drawModeSubject = new BehaviorSubject(DrawMode.Off);
        this.drawMode$ = this.drawModeSubject.asObservable();
        this.minimumFreeDrawZoomLevel = 12;
        // add to config
        this.arrayOfFeatureGroups = [];
        this.tracer = {};
        // end add to config
        this.ngUnsubscribe = new Subject();
        this.config = null;
        this.mapState.map$.pipe(filter(m => m !== null)).subscribe((map) => {
            this.map = map;
            console.log("Kartet i polydraw: ", this.map);
            console.log("pre this.config", this.config);
            this.config = defaultConfig;
            console.log("this.config", this.config);
            this.configurate({});
            console.log("after this.config", this.config);
            this.tracer = polyline([[0, 0]], this.config.polyLineOptions);
            console.log("Tracer pipe: ", this.tracer);
            this.initPolyDraw();
        });
        this.mapState.mapZoomLevel$
            .pipe(debounceTime(100), takeUntil(this.ngUnsubscribe))
            .subscribe((zoom) => {
            this.onZoomChange(zoom);
        });
        this.polygonInformation.polygonInformation$.subscribe(k => {
            console.log("PolyInfo start: ", k);
        });
        // TODO - lage en config observable i mapState og oppdater this.config med den
    }
    // new
    configurate(config) {
        // TODO if config is path...
        this.config = Object.assign(Object.assign({}, defaultConfig), config);
        this.mergePolygons = this.config.mergePolygons;
        this.kinks = this.config.kinks;
    }
    // fine
    closeAndReset() {
        // console.log("closeAndReset");
        this.setDrawMode(DrawMode.Off);
        this.removeAllFeatureGroups();
    }
    // make readable
    deletePolygon(polygon) {
        console.log("deletePolygon: ", polygon);
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(featureGroup => {
                const layer = featureGroup.getLayers()[0];
                const latlngs = layer.getLatLngs();
                const length = latlngs.length;
                //  = []
                latlngs.forEach((latlng, index) => {
                    let polygon3;
                    const test = [...latlng];
                    console.log(latlng);
                    if (latlng.length > 1) {
                        /* if (latlng[0][0] !== latlng[0][latlng[0].length - 1]) {
                          test[0].push(latlng[0][0]);
                          }  */
                        polygon3 = [test[0]];
                    }
                    else {
                        if (latlng[0] !== latlng[latlng.length - 1]) {
                            test.push(latlng[0]);
                        }
                        polygon3 = test;
                    }
                    console.log("Test: ", polygon3);
                    console.log(polygon);
                    const equals = this.polygonArrayEquals(polygon3, polygon);
                    console.log("equals: ", equals, " length: ", length);
                    if (equals && length === 1) {
                        this.polygonInformation.deleteTrashcan(polygon);
                        this.removeFeatureGroup(featureGroup);
                        console.log(featureGroup.getLayers());
                    }
                    else if (equals && length > 1) {
                        this.polygonInformation.deleteTrashCanOnMulti([polygon]);
                        latlngs.splice(index, 1);
                        layer.setLatLngs(latlngs);
                        this.removeFeatureGroup(featureGroup);
                        this.addPolygonLayer(layer.toGeoJSON(), false);
                    }
                });
            });
        }
    }
    // fine
    removeAllFeatureGroups() {
        // console.log("removeAllFeatureGroups", null);
        this.arrayOfFeatureGroups.forEach(featureGroups => {
            this.map.removeLayer(featureGroups);
        });
        this.arrayOfFeatureGroups = [];
        this.polygonInformation.deletePolygonInformationStorage();
        this.polygonInformation.reset();
        this.polygonInformation.updatePolygons();
    }
    // fine
    getDrawMode() {
        // console.log("getDrawMode", null);
        return this.drawModeSubject.value;
    }
    addViken(polygon) {
        this.addPolygonLayer(polygon, true);
    }
    // check this
    addAutoPolygon(geographicBorders) {
        const featureGroup = new FeatureGroup();
        const polygon2 = this.turfHelper.getMultiPolygon(this.convertToCoords(geographicBorders));
        console.log(polygon2);
        const polygon = this.getPolygon(polygon2);
        featureGroup.addLayer(polygon);
        const markerLatlngs = polygon.getLatLngs();
        console.log("markers: ", markerLatlngs);
        markerLatlngs.forEach(polygon => {
            polygon.forEach((polyElement, i) => {
                if (i === 0) {
                    this.addMarker(polyElement, featureGroup);
                }
                else {
                    this.addHoleMarker(polyElement, featureGroup);
                    console.log("Hull: ", polyElement);
                }
            });
            // this.addMarker(polygon[0], featureGroup);
            // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
        });
        this.arrayOfFeatureGroups.push(featureGroup);
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
        this.polygonInformation.activate();
        this.polygonInformation.setMoveMode();
    }
    // innehåll i if'ar flytta till egna metoder
    convertToCoords(latlngs) {
        const coords = [];
        console.log(latlngs.length, latlngs);
        if (latlngs.length > 1 && latlngs.length < 3) {
            const coordinates = [];
            console.log(GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), latlngs[latlngs.length - 1].length);
            // tslint:disable-next-line: max-line-length
            const within = this.turfHelper.isWithin(GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), GeoJSON.latLngsToCoords(latlngs[0]));
            if (within) {
                latlngs.forEach(polygon => {
                    coordinates.push(GeoJSON.latLngsToCoords(polygon));
                });
            }
            else {
                latlngs.forEach(polygon => {
                    coords.push([GeoJSON.latLngsToCoords(polygon)]);
                });
            }
            if (coordinates.length >= 1) {
                coords.push(coordinates);
            }
            console.log("Within1 ", within);
        }
        else if (latlngs.length > 2) {
            const coordinates = [];
            for (let index = 1; index < latlngs.length - 1; index++) {
                const within = this.turfHelper.isWithin(GeoJSON.latLngsToCoords(latlngs[index]), GeoJSON.latLngsToCoords(latlngs[0]));
                if (within) {
                    latlngs.forEach(polygon => {
                        coordinates.push(GeoJSON.latLngsToCoords(polygon));
                    });
                    coords.push(coordinates);
                }
                else {
                    latlngs.forEach(polygon => {
                        coords.push([GeoJSON.latLngsToCoords(polygon)]);
                    });
                }
            }
        }
        else {
            coords.push([GeoJSON.latLngsToCoords(latlngs[0])]);
        }
        console.log(coords);
        return coords;
    }
    // fine
    initPolyDraw() {
        // console.log("initPolyDraw", null);
        const container = this.map.getContainer();
        const drawMode = this.getDrawMode();
        if (this.config.touchSupport) {
            container.addEventListener("touchstart", e => {
                if (drawMode !== DrawMode.Off) {
                    this.mouseDown(e);
                }
            });
            container.addEventListener("touchend", e => {
                if (drawMode !== DrawMode.Off) {
                    this.mouseUpLeave();
                }
            });
            container.addEventListener("touchmove", e => {
                if (drawMode !== DrawMode.Off) {
                    this.mouseMove(e);
                }
            });
        }
        console.log("Map init: ", this.map);
        console.log("Tracer init: ", this.tracer);
        this.map.addLayer(this.tracer);
        this.setDrawMode(DrawMode.Off);
    }
    // Test L.MouseEvent
    mouseDown(event) {
        console.log("mouseDown", event);
        if (event.originalEvent != null) {
            this.tracer.setLatLngs([event.latlng]);
        }
        else {
            const latlng = this.map.containerPointToLatLng([
                event.touches[0].clientX,
                event.touches[0].clientY
            ]);
            this.tracer.setLatLngs([latlng]);
        }
        this.startDraw();
    }
    // TODO event type, create containerPointToLatLng-method
    mouseMove(event) {
        // console.log("mouseMove", event);
        if (event.originalEvent != null) {
            this.tracer.addLatLng(event.latlng);
        }
        else {
            const latlng = this.map.containerPointToLatLng([
                event.touches[0].clientX,
                event.touches[0].clientY
            ]);
            this.tracer.addLatLng(latlng);
        }
    }
    // fine
    mouseUpLeave() {
        // console.log("mouseUpLeave", null);
        this.polygonInformation.deletePolygonInformationStorage();
        // console.log("------------------------------Delete trashcans", null);
        const geoPos = this.turfHelper.turfConcaveman(this.tracer.toGeoJSON());
        this.stopDraw();
        switch (this.getDrawMode()) {
            case DrawMode.Add:
                this.addPolygon(geoPos, true);
                break;
            case DrawMode.Subtract:
                this.subtractPolygon(geoPos);
                break;
            default:
                break;
        }
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
        // console.log("------------------------------create trashcans", null);
    }
    // fine
    startDraw() {
        // console.log("startDraw", null);
        this.drawStartedEvents(true);
    }
    // fine
    stopDraw() {
        // console.log("stopDraw", null);
        this.resetTracker();
        this.drawStartedEvents(false);
    }
    onZoomChange(zoomLevel) {
        // console.log("onZoomChange", zoomLevel);
        if (zoomLevel >= this.minimumFreeDrawZoomLevel) {
            this.polygonInformation.polygonDrawStates.canUsePolyDraw = true;
        }
        else {
            this.polygonInformation.polygonDrawStates.canUsePolyDraw = false;
            this.polygonInformation.setMoveMode();
        }
        this.polygonInformation.saveCurrentState();
    }
    // fine
    drawStartedEvents(onoff) {
        // console.log("drawStartedEvents", onoff);
        const onoroff = onoff ? "on" : "off";
        this.map[onoroff]("mousemove", this.mouseMove, this);
        this.map[onoroff]("mouseup", this.mouseUpLeave, this);
    }
    // On hold
    subtractPolygon(latlngs) {
        this.subtract(latlngs);
    }
    // fine
    addPolygon(latlngs, simplify, noMerge = false) {
        console.log("addPolygon", latlngs, simplify, noMerge, this.kinks, this.config);
        if (this.mergePolygons &&
            !noMerge &&
            this.arrayOfFeatureGroups.length > 0 &&
            !this.kinks) {
            this.merge(latlngs);
        }
        else {
            this.addPolygonLayer(latlngs, simplify);
        }
    }
    // fine
    addPolygonLayer(latlngs, simplify) {
        const featureGroup = new FeatureGroup();
        const latLngs = simplify ? this.turfHelper.getSimplified(latlngs) : latlngs;
        console.log("AddPolygonLayer: ", latLngs);
        const polygon = this.getPolygon(latLngs);
        featureGroup.addLayer(polygon);
        console.log(polygon);
        const markerLatlngs = polygon.getLatLngs();
        markerLatlngs.forEach(polygon => {
            polygon.forEach((polyElement, i) => {
                if (i === 0) {
                    this.addMarker(polyElement, featureGroup);
                }
                else {
                    this.addHoleMarker(polyElement, featureGroup);
                    console.log("Hull: ", polyElement);
                }
            });
            // this.addMarker(polygon[0], featureGroup);
            // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
        });
        this.arrayOfFeatureGroups.push(featureGroup);
        console.log("Array: ", this.arrayOfFeatureGroups);
        this.polygonInformation.activate();
        this.setDrawMode(DrawMode.Off);
        featureGroup.on("click", e => {
            this.polygonClicked(e, latLngs);
        });
    }
    // fine
    polygonClicked(e, poly) {
        const newPoint = e.latlng;
        if (poly.geometry.type === "MultiPolygon") {
            const newPolygon = this.turfHelper.injectPointToPolygon(poly, [
                newPoint.lng,
                newPoint.lat
            ]);
            this.deletePolygon(this.getLatLngsFromJson(poly));
            this.addPolygonLayer(newPolygon, false);
        }
    }
    // fine
    getPolygon(latlngs) {
        console.log("getPolygons: ", latlngs);
        const polygon = GeoJSON.geometryToLayer(latlngs);
        polygon.setStyle(this.config.polygonOptions);
        return polygon;
    }
    // fine
    merge(latlngs) {
        console.log("merge", latlngs);
        const polygonFeature = [];
        const newArray = [];
        let polyIntersection = false;
        this.arrayOfFeatureGroups.forEach(featureGroup => {
            const featureCollection = featureGroup.toGeoJSON();
            console.log("Merger: ", featureCollection.features[0]);
            if (featureCollection.features[0].geometry.coordinates.length > 1) {
                featureCollection.features[0].geometry.coordinates.forEach(element => {
                    const feature = this.turfHelper.getMultiPolygon([element]);
                    polyIntersection = this.turfHelper.polygonIntersect(feature, latlngs);
                    if (polyIntersection) {
                        newArray.push(featureGroup);
                        polygonFeature.push(feature);
                    }
                });
            }
            else {
                const feature = this.turfHelper.getTurfPolygon(featureCollection.features[0]);
                polyIntersection = this.turfHelper.polygonIntersect(feature, latlngs);
                if (polyIntersection) {
                    newArray.push(featureGroup);
                    polygonFeature.push(feature);
                }
            }
        });
        console.log(newArray);
        if (newArray.length > 0) {
            this.unionPolygons(newArray, latlngs, polygonFeature);
        }
        else {
            this.addPolygonLayer(latlngs, true);
        }
    }
    // next
    subtract(latlngs) {
        let addHole = latlngs;
        this.arrayOfFeatureGroups.forEach(featureGroup => {
            const featureCollection = featureGroup.toGeoJSON();
            const layer = featureCollection.features[0];
            const poly = this.getLatLngsFromJson(layer);
            const feature = this.turfHelper.getTurfPolygon(featureCollection.features[0]);
            const newPolygon = this.turfHelper.polygonDifference(feature, addHole);
            this.deletePolygon(poly);
            this.removeFeatureGroupOnMerge(featureGroup);
            addHole = newPolygon;
        });
        const newLatlngs = addHole;
        const coords = this.turfHelper.getCoords(newLatlngs);
        coords.forEach(value => {
            this.addPolygonLayer(this.turfHelper.getMultiPolygon([value]), true);
        });
    }
    // fine
    events(onoff) {
        const onoroff = onoff ? "on" : "off";
        this.map[onoroff]("mousedown", this.mouseDown, this);
    }
    // fine, TODO: if special markers
    addMarker(latlngs, FeatureGroup) {
        const menuMarkerIdx = this.getMarkerIndex(latlngs, this.config.markers.markerMenuIcon.position);
        const deleteMarkerIdx = this.getMarkerIndex(latlngs, this.config.markers.markerDeleteIcon.position);
        latlngs.forEach((latlng, i) => {
            let iconClasses = this.config.markers.markerIcon.styleClasses;
            if (i === menuMarkerIdx && this.config.markers.menu) {
                iconClasses = this.config.markers.markerMenuIcon.styleClasses;
            }
            if (i === deleteMarkerIdx && this.config.markers.delete) {
                iconClasses = this.config.markers.markerDeleteIcon.styleClasses;
            }
            const marker = new Marker(latlng, {
                icon: this.createDivIcon(iconClasses),
                draggable: true,
                title: i.toString()
            });
            FeatureGroup.addLayer(marker).addTo(this.map);
            // console.log("FeatureGroup: ", FeatureGroup);
            marker.on("drag", e => {
                this.markerDrag(FeatureGroup);
            });
            marker.on("dragend", e => {
                this.markerDragEnd(FeatureGroup);
            });
            if (i === menuMarkerIdx && this.config.markers.menu) {
                marker.bindPopup(this.getHtmlContent(e => {
                    console.log("clicked on", e.target);
                }));
                marker.on("click", e => {
                    this.convertToBoundsPolygon(latlngs, true);
                    this.convertToSimplifiedPolygon(latlngs);
                });
            }
            if (i === deleteMarkerIdx && this.config.markers.delete) {
                marker.on("click", e => {
                    this.deletePolygon([latlngs]);
                });
            }
        });
    }
    addHoleMarker(latlngs, FeatureGroup) {
        latlngs.forEach((latlng, i) => {
            const iconClasses = this.config.markers.markerIcon.styleClasses;
            /*  if (i === 0 && this.config.markers.menu) {
              iconClasses = this.config.markers.markerMenuIcon.styleClasses;
            }
      
            //TODO- legg til fill icon
            if (i === latlngs.length - 1 && this.config.markers.delete) {
              iconClasses = this.config.markers.markerDeleteIcon.styleClasses;
            } */
            const marker = new Marker(latlng, {
                icon: this.createDivIcon(iconClasses),
                draggable: true,
                title: i.toString()
            });
            FeatureGroup.addLayer(marker).addTo(this.map);
            marker.on("drag", e => {
                this.markerDrag(FeatureGroup);
            });
            marker.on("dragend", e => {
                this.markerDragEnd(FeatureGroup);
            });
            /*   if (i === 0 && this.config.markers.menu) {
              marker.bindPopup(this.getHtmlContent((e) => {
                console.log("clicked on", e.target);
              }));
              // marker.on("click", e => {
              //   this.toggleMarkerMenu();
              // })
            }
            if (i === latlngs.length - 1 && this.config.markers.delete) {
              marker.on("click", e => {
                this.deletePolygon([latlngs]);
              });
            } */
        });
    }
    createDivIcon(classNames) {
        const classes = classNames.join(" ");
        const icon = divIcon({ className: classes });
        return icon;
    }
    // TODO: Cleanup
    markerDrag(FeatureGroup) {
        const newPos = [];
        let testarray = [];
        let hole = [];
        const layerLength = FeatureGroup.getLayers();
        const posarrays = layerLength[0].getLatLngs();
        console.log(posarrays);
        console.log("markerdrag: ", layerLength);
        let length = 0;
        if (posarrays.length > 1) {
            for (let index = 0; index < posarrays.length; index++) {
                testarray = [];
                hole = [];
                console.log("Posisjoner: ", posarrays[index]);
                if (index === 0) {
                    if (posarrays[0].length > 1) {
                        for (let i = 0; index < posarrays[0].length; i++) {
                            console.log("Posisjoner 2: ", posarrays[index][i]);
                            for (let j = 0; j < posarrays[0][i].length; j++) {
                                testarray.push(layerLength[j + 1].getLatLng());
                            }
                            hole.push(testarray);
                        }
                    }
                    else {
                        for (let j = 0; j < posarrays[0][0].length; j++) {
                            testarray.push(layerLength[j + 1].getLatLng());
                        }
                        hole.push(testarray);
                    }
                    console.log("Hole: ", hole);
                    newPos.push(hole);
                }
                else {
                    length += posarrays[index - 1][0].length;
                    console.log("STart index: ", length);
                    for (let j = length; j < posarrays[index][0].length + length; j++) {
                        testarray.push(layerLength[j + 1].getLatLng());
                    }
                    hole.push(testarray);
                    newPos.push(hole);
                }
            }
        }
        else {
            // testarray = []
            hole = [];
            let length2 = 0;
            for (let index = 0; index < posarrays[0].length; index++) {
                testarray = [];
                console.log("Polygon drag: ", posarrays[0][index]);
                if (index === 0) {
                    if (posarrays[0][index].length > 1) {
                        for (let j = 0; j < posarrays[0][index].length; j++) {
                            testarray.push(layerLength[j + 1].getLatLng());
                        }
                    }
                    else {
                        for (let j = 0; j < posarrays[0][0].length; j++) {
                            testarray.push(layerLength[j + 1].getLatLng());
                        }
                    }
                }
                else {
                    length2 += posarrays[0][index - 1].length;
                    for (let j = length2; j < posarrays[0][index].length + length2; j++) {
                        testarray.push(layerLength[j + 1].getLatLng());
                    }
                }
                hole.push(testarray);
            }
            newPos.push(hole);
            console.log("Hole 2: ", hole);
        }
        console.log("Nye posisjoner: ", newPos);
        layerLength[0].setLatLngs(newPos);
    }
    // check this
    markerDragEnd(FeatureGroup) {
        this.polygonInformation.deletePolygonInformationStorage();
        const featureCollection = FeatureGroup.toGeoJSON();
        console.log("Markerdragend polygon: ", featureCollection.features[0].geometry.coordinates);
        if (featureCollection.features[0].geometry.coordinates.length > 1) {
            featureCollection.features[0].geometry.coordinates.forEach(element => {
                const feature = this.turfHelper.getMultiPolygon([element]);
                console.log("Markerdragend: ", feature);
                if (this.turfHelper.hasKinks(feature)) {
                    this.kinks = true;
                    const unkink = this.turfHelper.getKinks(feature);
                    // this.deletePolygon(this.getLatLngsFromJson(feature));
                    this.removeFeatureGroup(FeatureGroup);
                    console.log("Unkink: ", unkink);
                    unkink.forEach(polygon => {
                        this.addPolygon(this.turfHelper.getTurfPolygon(polygon), false, true);
                    });
                }
                else {
                    this.kinks = false;
                    this.addPolygon(feature, false);
                }
            });
        }
        else {
            const feature = this.turfHelper.getMultiPolygon(featureCollection.features[0].geometry.coordinates);
            console.log("Markerdragend: ", feature);
            if (this.turfHelper.hasKinks(feature)) {
                this.kinks = true;
                const unkink = this.turfHelper.getKinks(feature);
                // this.deletePolygon(this.getLatLngsFromJson(feature));
                this.removeFeatureGroup(FeatureGroup);
                console.log("Unkink: ", unkink);
                unkink.forEach(polygon => {
                    this.addPolygon(this.turfHelper.getTurfPolygon(polygon), false, true);
                });
            }
            else {
                // this.deletePolygon(this.getLatLngsFromJson(feature));
                this.kinks = false;
                this.addPolygon(feature, false);
            }
        }
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
    }
    // fine, check the returned type
    getLatLngsFromJson(feature) {
        console.log("getLatLngsFromJson: ", feature);
        let coord;
        if (feature) {
            if (feature.geometry.coordinates.length > 1 &&
                feature.geometry.type === "MultiPolygon") {
                coord = GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
            }
            else if (feature.geometry.coordinates[0].length > 1 &&
                feature.geometry.type === "Polygon") {
                coord = GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0]);
            }
            else {
                coord = GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
            }
        }
        return coord;
    }
    // fine
    unionPolygons(layers, latlngs, polygonFeature) {
        console.log("unionPolygons", layers, latlngs, polygonFeature);
        let addNew = latlngs;
        layers.forEach((featureGroup, i) => {
            const featureCollection = featureGroup.toGeoJSON();
            const layer = featureCollection.features[0];
            const poly = this.getLatLngsFromJson(layer);
            const union = this.turfHelper.union(addNew, polygonFeature[i]); // Check for multipolygons
            // Needs a cleanup for the new version
            this.deletePolygonOnMerge(poly);
            this.removeFeatureGroup(featureGroup);
            addNew = union;
        });
        const newLatlngs = addNew; // Trenger kanskje this.turfHelper.getTurfPolygon( addNew);
        this.addPolygonLayer(newLatlngs, true);
    }
    // fine
    removeFeatureGroup(featureGroup) {
        console.log("removeFeatureGroup", featureGroup);
        featureGroup.clearLayers();
        this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(featureGroups => featureGroups !== featureGroup);
        // this.updatePolygons();
        this.map.removeLayer(featureGroup);
    }
    // fine until refactoring
    removeFeatureGroupOnMerge(featureGroup) {
        console.log("removeFeatureGroupOnMerge", featureGroup);
        const newArray = [];
        if (featureGroup.getLayers()[0]) {
            const polygon = featureGroup.getLayers()[0].getLatLngs()[0];
            this.polygonInformation.polygonInformationStorage.forEach(v => {
                if (v.polygon.toString() !== polygon[0].toString() &&
                    v.polygon[0].toString() === polygon[0][0].toString()) {
                    v.polygon = polygon;
                    newArray.push(v);
                }
                if (v.polygon.toString() !== polygon[0].toString() &&
                    v.polygon[0].toString() !== polygon[0][0].toString()) {
                    newArray.push(v);
                }
            });
            featureGroup.clearLayers();
            this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(featureGroups => featureGroups !== featureGroup);
            this.map.removeLayer(featureGroup);
        }
    }
    // fine until refactoring
    deletePolygonOnMerge(polygon) {
        console.log("deletePolygonOnMerge", polygon);
        let polygon2 = [];
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(featureGroup => {
                const layer = featureGroup.getLayers()[0];
                const latlngs = layer.getLatLngs()[0];
                polygon2 = [...latlngs[0]];
                if (latlngs[0][0] !== latlngs[0][latlngs[0].length - 1]) {
                    polygon2.push(latlngs[0][0]);
                }
                const equals = this.polygonArrayEqualsMerge(polygon2, polygon);
                if (equals) {
                    console.log("EQUALS", polygon);
                    this.removeFeatureGroupOnMerge(featureGroup);
                    this.deletePolygon(polygon);
                    this.polygonInformation.deleteTrashcan(polygon);
                    // this.updatePolygons();
                }
            });
        }
    }
    // TODO - legge et annet sted
    polygonArrayEqualsMerge(poly1, poly2) {
        return poly1.toString() === poly2.toString();
    }
    // TODO - legge et annet sted
    polygonArrayEquals(poly1, poly2) {
        // console.log("polygonArrayEquals", poly1, poly2);
        if (poly1[0][0]) {
            if (!poly1[0][0].equals(poly2[0][0])) {
                return false;
            }
        }
        else {
            if (!poly1[0].equals(poly2[0])) {
                return false;
            }
        }
        if (poly1.length !== poly2.length) {
            return false;
        }
        else {
            return true;
        }
    }
    // fine
    setLeafletMapEvents(enableDragging, enableDoubleClickZoom, enableScrollWheelZoom) {
        // console.log("setLeafletMapEvents", enableDragging, enableDoubleClickZoom, enableScrollWheelZoom);
        enableDragging ? this.map.dragging.enable() : this.map.dragging.disable();
        enableDoubleClickZoom
            ? this.map.doubleClickZoom.enable()
            : this.map.doubleClickZoom.disable();
        enableScrollWheelZoom
            ? this.map.scrollWheelZoom.enable()
            : this.map.scrollWheelZoom.disable();
    }
    // fine
    setDrawMode(mode) {
        console.log("setDrawMode", this.map);
        this.drawModeSubject.next(mode);
        if (!!this.map) {
            let isActiveDrawMode = true;
            switch (mode) {
                case DrawMode.Off:
                    DomUtil.removeClass(this.map.getContainer(), "crosshair-cursor-enabled");
                    this.events(false);
                    this.stopDraw();
                    this.tracer.setStyle({
                        color: ""
                    });
                    this.setLeafletMapEvents(true, true, true);
                    isActiveDrawMode = false;
                    break;
                case DrawMode.Add:
                    DomUtil.addClass(this.map.getContainer(), "crosshair-cursor-enabled");
                    this.events(true);
                    this.tracer.setStyle({
                        color: defaultConfig.polyLineOptions.color
                    });
                    this.setLeafletMapEvents(false, false, false);
                    break;
                case DrawMode.Subtract:
                    DomUtil.addClass(this.map.getContainer(), "crosshair-cursor-enabled");
                    this.events(true);
                    this.tracer.setStyle({
                        color: "#D9460F"
                    });
                    this.setLeafletMapEvents(false, false, false);
                    break;
            }
            if (isActiveDrawMode) {
                this.polygonInformation.setFreeDrawMode();
            }
            else {
                this.polygonInformation.setMoveMode();
            }
        }
    }
    modeChange(mode) {
        this.setDrawMode(mode);
        this.polygonInformation.saveCurrentState();
    }
    // remove, use modeChange
    drawModeClick() {
        if (this.polygonInformation.polygonDrawStates.isFreeDrawMode) {
            this.polygonInformation.setMoveMode();
            this.setDrawMode(DrawMode.Off);
        }
        else {
            this.polygonInformation.setFreeDrawMode();
            this.setDrawMode(DrawMode.Add);
        }
        this.polygonInformation.saveCurrentState();
    }
    // remove, use modeChange
    freedrawMenuClick() {
        this.setDrawMode(DrawMode.Add);
        this.polygonInformation.activate();
        this.polygonInformation.saveCurrentState();
    }
    // remove, use modeChange
    subtractClick() {
        this.setDrawMode(DrawMode.Subtract);
        this.polygonInformation.saveCurrentState();
    }
    // fine
    resetTracker() {
        this.tracer.setLatLngs([[0, 0]]);
    }
    toggleMarkerMenu() {
        alert("open menu");
    }
    getHtmlContent(callBack) {
        const comp = this.popupGenerator.generateAlterPopup();
        comp.instance.bboxClicked.subscribe(e => {
            console.log("bbox clicked", e);
            callBack(e);
        });
        comp.instance.simplyfiClicked.subscribe(e => {
            console.log("simplyfi clicked", e);
            callBack(e);
        });
        return comp.location.nativeElement;
    }
    convertToBoundsPolygon(latlngs, addMidpointMarkers = false) {
        this.deletePolygon([latlngs]);
        const polygon = this.turfHelper.getMultiPolygon(this.convertToCoords([latlngs]));
        const newPolygon = this.turfHelper.convertToBoundingBoxPolygon(polygon, addMidpointMarkers);
        this.addPolygonLayer(this.turfHelper.getTurfPolygon(newPolygon), false);
    }
    convertToSimplifiedPolygon(latlngs) {
        this.deletePolygon([latlngs]);
        const newPolygon = this.turfHelper.getMultiPolygon(this.convertToCoords([latlngs]));
        this.addPolygonLayer(this.turfHelper.getTurfPolygon(newPolygon), true);
    }
    getMarkerIndex(latlngs, position) {
        const bounds = PolyDrawUtil.getBounds(latlngs, Math.sqrt(2) / 2);
        const compass = new Compass(bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast());
        const compassDirection = compass.getDirection(position);
        const latLngPoint = {
            lat: compassDirection.lat,
            lng: compassDirection.lng
        };
        const targetPoint = this.turfHelper.getCoord(latLngPoint);
        const fc = this.turfHelper.getFeaturePointCollection(latlngs);
        const nearestPointIdx = this.turfHelper.getNearestPointIndex(targetPoint, fc);
        return nearestPointIdx;
    }
};
PolyDrawService.ctorParameters = () => [
    { type: PolyStateService },
    { type: ComponentGeneraterService },
    { type: TurfHelperService },
    { type: PolygonInformationService },
    { type: LeafletHelperService }
];
PolyDrawService.ɵprov = ɵɵdefineInjectable({ factory: function PolyDrawService_Factory() { return new PolyDrawService(ɵɵinject(PolyStateService), ɵɵinject(ComponentGeneraterService), ɵɵinject(TurfHelperService), ɵɵinject(PolygonInformationService), ɵɵinject(LeafletHelperService)); }, token: PolyDrawService, providedIn: "root" });
PolyDrawService = __decorate([
    Injectable({
        providedIn: "root"
    })
    // Rename - PolyDrawService
    ,
    __metadata("design:paramtypes", [PolyStateService,
        ComponentGeneraterService,
        TurfHelperService,
        PolygonInformationService,
        LeafletHelperService])
], PolyDrawService);

let MyLibModule = class MyLibModule {
};
MyLibModule = __decorate([
    NgModule({
        declarations: [AlterPolygonComponent],
        imports: [],
        exports: [AlterPolygonComponent],
        entryComponents: [AlterPolygonComponent]
    })
], MyLibModule);

/*
 * Public API Surface of my-lib
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ComponentGeneraterService, DrawMode, MarkerPosition, MyLibModule, PolyDrawService, PolyStateService, PolygonDrawStates, PolygonInfo, PolygonInformationService, ɵ0, ɵ1, TurfHelperService as ɵa, LeafletHelperService as ɵb, AlterPolygonComponent as ɵc };
//# sourceMappingURL=my-lib.js.map
