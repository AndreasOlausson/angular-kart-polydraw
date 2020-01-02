import { Injectable } from "@angular/core";

import * as turf from "@turf/turf";
import * as concaveman from "concaveman";
import { FeatureCollection, Point, Feature, Polygon, MultiPolygon } from "@turf/turf";

@Injectable({ providedIn: "root" })
export class TurfHelperService {
  private simplifyTolerance = { tolerance: 0.0001, highQuality: false };
  constructor() {}

  union(poly1, poly2) {
    console.log("poly1: ", poly1);
    console.log("poly2: ", poly2);
  
    let union = turf.union(poly1, poly2);
    
    return this.getTurfPolygon(union);
  }

  turfConcaveman(feature) {
    //console.log("turfConcaveman", points);
    let points = turf.explode(feature);

    const coordinates = points.features.map(f => f.geometry.coordinates);
    console.log(coordinates);
    return turf.multiPolygon([[concaveman(coordinates)]]);
  }

  getSimplified(latLngs) {
    //console.log("getSimplified", latLngs);

    const tolerance = this.simplifyTolerance;
    const simplified = turf.simplify(latLngs, tolerance);
    return simplified;
  }

  getTurfPolygon(polygon) {
    let turfPolygon; 
    console.log("Get TurfPolygon:",polygon);
    if(polygon.geometry)
    if(polygon.geometry.type === "Polygon"){
      turfPolygon = turf.multiPolygon([polygon.geometry.coordinates]);
    }
    else {
      turfPolygon = turf.multiPolygon(polygon.geometry.coordinates);
    }
    return turfPolygon;
  }

  getMultiPolygon(polygonArray){
    return turf.multiPolygon(polygonArray)
  }

  getKinks(feature) {
    const unkink = turf.unkinkPolygon(feature);
    let coordinates = [];
    turf.featureEach(unkink, (current, i) => {
      coordinates.push(current);
    });

    return coordinates;
  }

  hasKinks(feature) {
    const kinks = turf.kinks(feature);
    return kinks.features.length > 0;
  }

  polygonIntersect(polygon, latlngs: Feature<Polygon | MultiPolygon>): boolean {
    // const oldPolygon = polygon.toGeoJSON();
    let poly = [];
    let poly2 = [];

    console.log("polygonIntersect", polygon, latlngs);

    turf.featureEach(polygon, function(current, index) {
      console.log("Current:" ,current);
    })

    let latlngsCoords = turf.getCoords(latlngs);
    latlngsCoords.forEach(element => {
      console.log(element);
      let feat = { type: "Polygon", coordinates: element };

      poly.push(feat);
    });
    let polygonCoords = turf.getCoords(polygon);
   console.log(polygonCoords);
   console.log(latlngsCoords);
   polygonCoords.forEach(element => {
    console.log(element);
    let feat = { type: "Polygon", coordinates: element };

    poly2.push(feat);
  });
    let intersect = false;
    console.log(poly);
    console.log(poly2);
    loop1: for (let i = 0; i < poly.length; i++) {
      console.log(poly[i]);
      for (let j = 0; j < poly2.length; j++) {
        console.log(turf.area(poly2[j]));
        intersect = !!turf.intersect(poly[i], poly2[j]);

        if (intersect) {
          console.log("Intersection", intersect);
          break loop1;
        }
      }
    }

    // let diff = turf.booleanOverlap(polygon,latlngs)
    // console.log("Diff: ",diff);
    // const intersect = turf.intersect(latlngs, oldPolygon);
    // return !!intersect;
    return intersect;
  }

  getIntersection(poly1, poly2): Feature {
    return turf.intersect(poly1, poly2);
  }
  getDistance(point1, point2): number {
    return turf.distance(point1, point2);
  }
  findBiggest(element){
    let test = turf.polygon([element[0]]);
    let biggest = turf.polygon([element[0]]);
    let largest = turf.area(test);
    for (let index = 1; index < element.length; index++) {
      test = turf.polygon([element[index]]);
      let large = turf.area(test);
      if(large > largest){
        largest = large
        biggest = turf.polygon([element[index]]);
      }

      
    }
    return biggest
  }

  isWithin(polygon1, polygon2){
    console.log(polygon1);
    console.log("Ytre: ",polygon2);
    return turf.booleanWithin(turf.polygon([polygon1]), turf.polygon([polygon2]))
  }
}
