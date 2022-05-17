import * as turf from "@turf/turf";
import * as concaveman from "concaveman";
import { Feature, Polygon, MultiPolygon, Position, Point } from "@turf/turf";
import { MarkerPosition } from "./enums";
import { ICompass } from "./interface";
import { Compass } from "./utils";
import { ILatLng } from "./polygon-helpers";
import defaultConfig from "./config.json";
import { LatLng } from 'leaflet';

export class TurfHelper {
    private config: typeof defaultConfig = null;

    constructor(config: Object) {
        console.log("TEST");
        this.config = { ...defaultConfig, ...config }
    }

    union(poly1, poly2): Feature<Polygon | MultiPolygon> {
        console.log("poly1: ", poly1);
        console.log("poly2: ", poly2);

        let union = turf.union(poly1, poly2);

        return this.getTurfPolygon(union);
    }

    turfConcaveman(feature: Feature<Polygon | MultiPolygon>): Feature<Polygon | MultiPolygon> {
        
        let points = turf.explode(feature);
        console.log("turfConcaveman", points);
        const coordinates = points.features.map(f => f.geometry.coordinates);
        console.log("coords ", coordinates);
        return turf.multiPolygon([[concaveman(coordinates)]]);
        
    }

    getSimplified(polygon: Feature<Polygon | MultiPolygon>, dynamicTolerance: boolean = false): Feature<Polygon | MultiPolygon> {

        const numOfEdges = polygon.geometry.coordinates[0][0].length;
        let tolerance = this.config.simplification.simplifyTolerance;
        if (!dynamicTolerance) {
            const simplified = turf.simplify(polygon, tolerance);
            return simplified;
        } else {
            // default simplification
            let simplified = turf.simplify(polygon, tolerance);
            const fractionGuard = this.config.simplification.dynamicMode.fractionGuard;
            const multipiler = this.config.simplification.dynamicMode.multipiler;
            while (simplified.geometry.coordinates[0][0].length > 4 && (simplified.geometry.coordinates[0][0].length / (numOfEdges + 2) > fractionGuard)) {
                tolerance.tolerance = tolerance.tolerance * multipiler;
                simplified = turf.simplify(polygon, tolerance);
            }
            return simplified;
        }

    }

    getTurfPolygon(polygon: Feature<Polygon | MultiPolygon>): Feature<Polygon | MultiPolygon> {
        let turfPolygon;
        console.log("Get TurfPolygon:", polygon);
        // if (polygon.geometry)
        if (polygon.geometry.type === "Polygon") {
            turfPolygon = turf.multiPolygon([polygon.geometry.coordinates]);
        } else {
            turfPolygon = turf.multiPolygon(polygon.geometry.coordinates);
        }
        return turfPolygon;
    }

    getMultiPolygon(polygonArray: Position[][][]): Feature<Polygon | MultiPolygon> {
        return turf.multiPolygon(polygonArray);
    }

    getKinks(feature: Feature<Polygon | MultiPolygon>) {
        const unkink = turf.unkinkPolygon(feature);
        let coordinates = [];
        turf.featureEach(unkink, current => {
            coordinates.push(current);
        });

        return coordinates;
    }

    getCoords(feature: Feature<Polygon | MultiPolygon>) {
        return turf.getCoords(feature);
    }

    hasKinks(feature: Feature<Polygon | MultiPolygon>) {
        const kinks = turf.kinks(feature);
        return kinks.features.length > 0;
    }

    polygonIntersect(polygon: Feature<Polygon | MultiPolygon>, latlngs: Feature<Polygon | MultiPolygon>): boolean {
        // const oldPolygon = polygon.toGeoJSON();
        let poly = [];
        let poly2 = [];

        console.log("polygonIntersect", polygon, latlngs);

        let latlngsCoords = turf.getCoords(latlngs);
        latlngsCoords.forEach(element => {
            let feat = { type: "Polygon", coordinates: [element[0]] };

            poly.push(feat);
        });
        let polygonCoords = turf.getCoords(polygon);
        polygonCoords.forEach(element => {
            let feat = { type: "Polygon", coordinates: [element[0]] };

            poly2.push(feat);
        });
        let intersect = false;
        loop1: for (let i = 0; i < poly.length; i++) {
            if (this.getKinks(poly[i]).length < 2) {
                for (let j = 0; j < poly2.length; j++) {
                    if (this.getKinks(poly2[j]).length < 2) {
                        let test = turf.intersect(poly[i], poly2[j]);
                    //     if(test?.geometry.type === "Point"){
                    //        intersect = !(turf.booleanPointInPolygon(test, poly[i]) && turf.booleanPointInPolygon(test, poly2[j]));
                    //     console.log("Intersect test: ",   );
                    //
                    // } else 
                        if (test?.geometry.type === "Polygon"){
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

    getIntersection(poly1, poly2): Feature {
        return turf.intersect(poly1, poly2);
    }

    getDistance(point1, point2): number {
        return turf.distance(point1, point2);
    }

    isWithin(polygon1: Position[], polygon2: Position[]): boolean {
        console.log(polygon1);
        console.log("Ytre: ", polygon2);
        return turf.booleanWithin(turf.polygon([polygon1]), turf.polygon([polygon2]));
    }

    equalPolygons(polygon1: Feature<Polygon | MultiPolygon>, polygon2: Feature<Polygon | MultiPolygon>) {
        console.log(polygon1);
        console.log(polygon2);
        console.log(turf.booleanEqual(polygon1, polygon2));
    }

    convertToBoundingBoxPolygon(polygon: Feature<Polygon | MultiPolygon>): Feature<Polygon> {
        const bbox = turf.bbox(polygon.geometry);
        const bboxPolygon = turf.bboxPolygon(bbox);

        if (this.config.boundingBox.addMidPointMarkers) {
            const compass = new Compass(bbox[1], bbox[0], bbox[3], bbox[2]);
            const compassPositions = compass.getPositions();
            bboxPolygon.geometry.coordinates = [];
            bboxPolygon.geometry.coordinates = [compassPositions];
        }

        return bboxPolygon;
    }

    polygonToMultiPolygon(poly: Feature<Polygon>): Feature<MultiPolygon> {
        const multi = turf.multiPolygon([poly.geometry.coordinates]);
        return multi;
    }
    //TODO -cleanup
    injectPointToPolygon(polygon, point) {
        let coords = turf.getCoords(polygon);
        let newPolygon;
        console.log("polygon: ", polygon);
        if (coords.length < 2) {
            const polygonPoints = turf.explode(polygon);
            console.log(turf.nearestPoint(point, polygonPoints));
            let index = turf.nearestPoint(point, polygonPoints).properties.featureIndex;
            const test = turf.coordReduce(
                polygonPoints,
                function (accumulator, oldPoint, i) {
                    if (index === i) {
                        return [...accumulator, oldPoint, point];
                    }
                    return [...accumulator, oldPoint];
                },
                []
            );
            console.log("test", test);
            newPolygon = turf.multiPolygon([[test]]);
        } else {
            let pos = [];
            let coordinates = [];
            coords.forEach(element => {
                let polygon = turf.polygon(element);
                // turf.booleanPointInPolygon(point, polygon)
                if (turf.booleanPointInPolygon(point, polygon)) {
                    const polygonPoints = turf.explode(polygon);
                    let index = turf.nearestPoint(point, polygonPoints).properties.featureIndex;
                    coordinates = turf.coordReduce(
                        polygonPoints,
                        function (accumulator, oldPoint, i) {
                            if (index === i) {
                                return [...accumulator, oldPoint, point];
                            }
                            return [...accumulator, oldPoint];
                        },
                        []
                    );
                    console.log("coordinates", coordinates);
                } else {
                    pos.push(element);
                }
            });
            pos.push([coordinates]);
            newPolygon = turf.multiPolygon(pos);
        }
        return newPolygon;
    }

    polygonDifference(polygon1: Feature<Polygon | MultiPolygon>, polygon2: Feature<Polygon | MultiPolygon>): Feature<Polygon | MultiPolygon> {
        let diff = turf.difference(polygon1, polygon2);
        console.log(diff);
        return this.getTurfPolygon(diff);
    }

    getBoundingBoxCompassPosition(polygon, MarkerPosition: ICompass, useOffset, offsetDirection) {
        const p = this.getMultiPolygon(polygon);
        const compass = this.getBoundingBoxCompass(polygon);
        const polygonPoints = turf.explode(polygon);
        const coord = this.getCoord(compass.direction.North);
        const nearestPoint = turf.nearestPoint(coord, polygonPoints);

        return null;
    }

    getNearestPointIndex(targetPoint: turf.Coord, points: turf.FeatureCollection<turf.Point>): number {
        let index = turf.nearestPoint(targetPoint, points).properties.featureIndex;
        return index;
    }

    getCoord(point: ILatLng): turf.Coord {
        const coord = turf.getCoord([point.lng, point.lat]);
        return coord;
    }

    getFeaturePointCollection(points: ILatLng[]): turf.FeatureCollection {
        const pts = [];
        points.forEach(v => {
            const p = turf.point([v.lng, v.lat], {});
            pts.push(p);
        });

        const fc = turf.featureCollection(pts);

        return fc;
    }

    private getBoundingBoxCompass(polygon): Compass {
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

    getPolygonArea(poly: Feature<Polygon | MultiPolygon>): number {
        const area = turf.area(poly);
        return area;
    }
    getPolygonPerimeter(poly: Feature<Polygon | MultiPolygon>): number {
        const length = turf.length(poly, {units: 'kilometers'});
        return length;
    }

    getDoubleElbowLatLngs(points: ILatLng[]): ILatLng[] {

        const doubleized: ILatLng[] = [];
        doubleized.push(points[0]);

        for (let i = 1; i < points.length; i++) {
            const p1 = turf.point([points[i-1].lng, points[i-1].lat]);
            const p2 = turf.point([points[i].lng, points[i].lat]);
            const midPoint = turf.midpoint(p1, p2);

            doubleized.push(new LatLng(midPoint.geometry.coordinates[1], midPoint.geometry.coordinates[0]));
            doubleized.push(points[i]);
        }

        return doubleized;

    }
    getBezierMultiPolygon(polygonArray: Position[][][]): Feature<Polygon | MultiPolygon> {

        const t = turf;

        const poly = this.getMultiPolygon(polygonArray);

        const line = turf.polygonToLineString(poly);

        //Add first point to "close" the line
        (line as any).features[0].geometry.coordinates.push((line as any).features[0].geometry.coordinates[0])

        const bezierLine = turf.bezierSpline((line as any).features[0].geometry, {resolution: this.config.bezier.resolution, sharpness: this.config.bezier.sharpness});

        const bezierPoly = turf.lineStringToPolygon(bezierLine);

        return bezierPoly;

    }
}