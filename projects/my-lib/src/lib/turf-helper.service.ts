import { Injectable } from '@angular/core';

import * as turf from '@turf/turf';
import concaveman from 'concaveman';
import {Feature, Polygon, MultiPolygon, Position, Point} from '@turf/turf';
import { MarkerPosition } from './enums';
import { ICompass } from './interface';
import { Compass } from './utils';
import { ILatLng } from './polygon-helpers';

@Injectable({ providedIn: 'root' })
export class TurfHelperService {
  private simplifyTolerance = { tolerance: 0.0001, highQuality: false };
  constructor() {}

  union(poly1, poly2): Feature<Polygon | MultiPolygon> {



    const union = turf.union(poly1, poly2);

    return this.getTurfPolygon(union);
  }

  turfConcaveman(
    feature: Feature<Polygon | MultiPolygon>
  ): Feature<Polygon | MultiPolygon> {

    const points = turf.explode(feature);

    const coordinates = points.features.map(f => f.geometry.coordinates);
    return turf.multiPolygon([[concaveman(coordinates)]]);
  }

  //TODO add some sort of dynamic tolerance
  getSimplified(
    polygon: Feature<Polygon | MultiPolygon>
  ): Feature<Polygon | MultiPolygon> {
    const tolerance = this.simplifyTolerance;
    const simplified = turf.simplify(polygon, tolerance);
    return simplified;
  }

  getTurfPolygon(
    polygon: Feature<Polygon | MultiPolygon>
  ): Feature<Polygon | MultiPolygon> {
    let turfPolygon;

    // if (polygon.geometry)
    if (polygon.geometry.type === 'Polygon') {
      turfPolygon = turf.multiPolygon([polygon.geometry.coordinates]);
    } else {
      turfPolygon = turf.multiPolygon(polygon.geometry.coordinates);
    }
    return turfPolygon;
  }

  getMultiPolygon(
    polygonArray: Position[][][]
  ): Feature<Polygon | MultiPolygon> {
    return turf.multiPolygon(polygonArray);
  }

  getKinks(feature: Feature<Polygon | MultiPolygon>) {
    const unkink = turf.unkinkPolygon(feature);
    const coordinates = [];
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

  polygonIntersect(
    polygon: Feature<Polygon | MultiPolygon>,
    latlngs: Feature<Polygon | MultiPolygon>
  ): boolean {
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
            // @ts-ignore
            if (test?.geometry.type === 'Point') {
              // @ts-ignore
              // @ts-ignore
              intersect = !(
                turf.booleanPointInPolygon(test as unknown as Point, poly[i]) &&
                turf.booleanPointInPolygon(test as unknown as Point, poly2[j])
              );

            } else if (test?.geometry.type === 'Polygon') {
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


    return turf.booleanWithin(
      turf.polygon([polygon1]),
      turf.polygon([polygon2])
    );
  }

  equalPolygons(
    polygon1: Feature<Polygon | MultiPolygon>,
    polygon2: Feature<Polygon | MultiPolygon>
  ) {



  }
  //TODO optional add extra markers for N E S W (We have the corners NW, NE, SE, SW)
  convertToBoundingBoxPolygon(
    polygon: Feature<Polygon | MultiPolygon>,
    addMidpointMarkers: boolean = false
  ): Feature<Polygon> {
    const bbox = turf.bbox(polygon.geometry);
    const bboxPolygon = turf.bboxPolygon(bbox);

    const compass = new Compass(bbox[1], bbox[0], bbox[3], bbox[2]);

    const compassPositions = compass.getPositions();

    bboxPolygon.geometry.coordinates = [];
    bboxPolygon.geometry.coordinates = [compassPositions];

    return bboxPolygon;
  }
  polygonToMultiPolygon(poly: Feature<Polygon>): Feature<MultiPolygon> {
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
      const test = turf.coordReduce(
        polygonPoints,
        function(accumulator, oldPoint, i) {
          if (index === i) {
            return [...accumulator, oldPoint, point];
          }
          return [...accumulator, oldPoint];
        },
        []
      );

      newPolygon = turf.multiPolygon([[test]]);
    } else {
      const pos = [];
      let coordinates = [];
      coords.forEach(element => {
        const polygon = turf.polygon(element);
        // turf.booleanPointInPolygon(point, polygon)
        if (turf.booleanPointInPolygon(point, polygon)) {
          const polygonPoints = turf.explode(polygon);
          const index = turf.nearestPoint(point, polygonPoints).properties
            .featureIndex;
          coordinates = turf.coordReduce(
            polygonPoints,
            function(accumulator, oldPoint, i) {
              if (index === i) {
                return [...accumulator, oldPoint, point];
              }
              return [...accumulator, oldPoint];
            },
            []
          );

        } else {
          pos.push(element);
        }
      });
      pos.push([coordinates]);
      newPolygon = turf.multiPolygon(pos);
    }
    return newPolygon;
  }

  polygonDifference(
    polygon1: Feature<Polygon | MultiPolygon>,
    polygon2: Feature<Polygon | MultiPolygon>
  ): Feature<Polygon | MultiPolygon> {
    const diff = turf.difference(polygon1, polygon2);

    return this.getTurfPolygon(diff);
  }
  getBoundingBoxCompassPosition(
    polygon,
    MarkerPosition: ICompass,
    useOffset,
    offsetDirection
  ) {
    const p = this.getMultiPolygon(polygon);
    const compass = this.getBoundingBoxCompass(polygon);
    const polygonPoints = turf.explode(polygon);
    const coord = this.getCoord(compass.direction.North);
    const nearestPoint = turf.nearestPoint(coord, polygonPoints);

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
    // compass.direction.CenterOfMass = centerOfMass.geometry.coordinates[0][0];

    return compass;
  }

  getNearestPointIndex(
    targetPoint: turf.Coord,
    points: turf.FeatureCollection<turf.Point>
  ): number {
    const index = turf.nearestPoint(targetPoint, points).properties.featureIndex;
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
}
