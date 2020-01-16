import { Injectable } from "@angular/core";

import * as turf from "@turf/turf";
import * as concaveman from "concaveman";
import { Feature, Polygon, MultiPolygon, Position } from "@turf/turf";
import { MarkerPlacement } from "./enums";
import { ICompass } from "./interface";

@Injectable({ providedIn: "root" })
export class TurfHelperService {
  private simplifyTolerance = { tolerance: 0.000001, highQuality: false };
  constructor() { }

  union(poly1, poly2): Feature<Polygon | MultiPolygon> {
    console.log("poly1: ", poly1);
    console.log("poly2: ", poly2);

    let union = turf.union(poly1, poly2);

    return this.getTurfPolygon(union);
  }

  turfConcaveman(feature: Feature<Polygon | MultiPolygon>): Feature<Polygon | MultiPolygon> {
    //console.log("turfConcaveman", points);
    let points = turf.explode(feature);

    const coordinates = points.features.map(f => f.geometry.coordinates);
    return turf.multiPolygon([[concaveman(coordinates)]]);
  }

  getSimplified(polygon: Feature<Polygon | MultiPolygon>): Feature<Polygon | MultiPolygon> {
    const tolerance = this.simplifyTolerance;
    const simplified = turf.simplify(polygon, tolerance);
    return simplified;
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
    return turf.getCoords(feature)
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
      let feat = { type: "Polygon", coordinates: element };

      poly.push(feat);
    });
    let polygonCoords = turf.getCoords(polygon);
    polygonCoords.forEach(element => {
      let feat = { type: "Polygon", coordinates: element };

      poly2.push(feat);
    });
    let intersect = false;
    loop1: for (let i = 0; i < poly.length; i++) {
      for (let j = 0; j < poly2.length; j++) {
        intersect = !!turf.intersect(poly[i], poly2[j]);
        if (intersect) {
          break loop1;
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
    return turf.booleanWithin(turf.polygon([polygon2]), turf.polygon([polygon1]));
  }

  equalPolygons(polygon1: Feature<Polygon | MultiPolygon>, polygon2: Feature<Polygon | MultiPolygon>) {
    console.log(polygon1);
    console.log(polygon2);
    console.log(turf.booleanEqual(polygon1, polygon2));
  }

  convertToBoundingBoxPolygon(polygon: Feature<Polygon | MultiPolygon>): Feature<Polygon> {
    const bbox = turf.bbox(polygon);
    const bboxPolygon = turf.bboxPolygon(bbox);
    return bboxPolygon;
  }
  polygonToMultiPolygon(poly: Feature<Polygon>): Feature<MultiPolygon> {
    const multi = turf.multiPolygon([poly.geometry.coordinates])
    return multi;
  }
  //TODO -cleanup
  injectPointToPolygon(polygon, point) {
    let coords = turf.getCoords(polygon)
    let newPolygon
    console.log("polygon: ", polygon);
    if (coords.length < 2) {
      const polygonPoints = turf.explode(polygon);
      console.log(turf.nearestPoint(point, polygonPoints));
      let index = turf.nearestPoint(point, polygonPoints).properties.featureIndex
      const test = turf.coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
        if (index === i) {
          return [
            ...accumulator,
            oldPoint,
            point
          ]
        }
        return [...accumulator, oldPoint]
      }, [])
      console.log("test", test);
      newPolygon = turf.multiPolygon([[test]])
    }
    else {
      let pos = []
      let coordinates = []
      coords.forEach((element) => {
        let polygon = turf.polygon(element)
        // turf.booleanPointInPolygon(point, polygon)
        if (turf.booleanPointInPolygon(point, polygon)) {
          const polygonPoints = turf.explode(polygon);
          let index = turf.nearestPoint(point, polygonPoints).properties.featureIndex
          coordinates = turf.coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
            if (index === i) {
              return [
                ...accumulator,
                oldPoint,
                point
              ]
            }
            return [...accumulator, oldPoint]
          }, [])
          console.log("coordinates", coordinates);


        }
        else {
          pos.push(element)
        }
      });
      pos.push([coordinates])
      newPolygon = turf.multiPolygon(pos)
    }
    return newPolygon
  }

  polygonDifference(polygon1: Feature<Polygon | MultiPolygon>, polygon2: Feature<Polygon | MultiPolygon>): Feature<Polygon | MultiPolygon> {
    let diff = turf.difference(polygon1, polygon2);
    console.log(diff);
    return this.getTurfPolygon(diff);
  }
  getBoundingBoxCompassPosition(polygon, markerplacement: ICompass, useOffset, offsetDirection) {
    const p = this.getMultiPolygon(polygon);
    const compass = this.getBoundingBoxCompass(polygon);
    const polygonPoints = turf.explode(polygon);
    const nearestPoint = turf.nearestPoint(compass.direction.North, polygonPoints)

    return null;
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
    compass.direction.Center = centerOfMass.geometry.coordinates[0][0];

    return compass;
  }
}

export class Compass {

  direction: ICompass;

  constructor(minX: number = 0, minY: number = 0, maxX: number = 0, maxY: number = 0) {

    this.direction.North = [(minX + maxX) / 2, maxY];
    this.direction.NorthEast = [maxX, maxY];
    this.direction.East = [maxX, (minY + maxY) / 2];
    this.direction.SouthEast = [maxX, minY];
    this.direction.South = [(minX + maxX) / 2, minY];
    this.direction.SouthWest = [minX, minY];
    this.direction.West = [minX, (minY + maxY) / 2];
    this.direction.NorthWest = [minX, maxY];
    this.direction.Center = [0, 0];
  }
}
