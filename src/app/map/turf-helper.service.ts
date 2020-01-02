import { Injectable } from "@angular/core";

import * as turf from "@turf/turf";
import * as concaveman from "concaveman";
import { FeatureCollection, Point, Feature, Polygon, MultiPolygon } from "@turf/turf";

@Injectable({ providedIn: "root" })
export class TurfHelperService {
  private simplifyTolerance = { tolerance: 0.0001, highQuality: false };
  constructor() {}

  union(poly1, poly2) {
    console.log("poly1: ",poly1);
    console.log("poly2: ",poly2);
    let union = turf.union(poly1, poly2);
    console.log(this.getTurfPolygon(union.geometry.coordinates));
    return this.getTurfPolygon([union.geometry.coordinates]);
  }

  turfConcaveman(feature) {
    //console.log("turfConcaveman", points);
    let points = turf.explode(feature)

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

  getTurfPolygon(geometry) {
    return turf.multiPolygon(geometry);
  }

  getKinks(feature) {
    
    const unkink = turf.unkinkPolygon(feature);
    let coordinates = []
    turf.featureEach(unkink, (current, i) => {
        coordinates.push(current)
    });

    return coordinates
  }

  hasKinks(feature){
    const kinks = turf.kinks(feature);
    return kinks.features.length > 0

  }

  polygonIntersect(polygon, latlngs: Feature<Polygon | MultiPolygon>): boolean {
    

    // const oldPolygon = polygon.toGeoJSON();
    let poly = [];
    let poly2 = [];
    console.log();
    
    console.log("polygonIntersect", polygon, latlngs);
    

    let latlngsCoords = turf.getCoords(latlngs);
    latlngsCoords.forEach(element => {
      console.log(element);
      let 
         feat={'type':'Polygon','coordinates':element};
      
      poly.push(feat)
    });
    let polygonCoords = turf.getCoords(polygon);
    polygonCoords.forEach(element => {
      console.log(element);
      let 
         feat={'type':'Polygon','coordinates':element};
      
      
      poly2.push(feat)
   
    });

    let intersect = false
console.log(poly);
console.log(poly2);
loop1:
for(let i = 0; i< poly.length; i++){
  console.log(poly[i]);
  for(let j = 0; j<poly2.length; j++){
    console.log(poly2[j].coordinates.length);
     intersect = !!turf.intersect(poly[i], poly2[j]);
    
    if(intersect){
      console.log("Intersection",intersect);
      break loop1; 
    }
    
  }
}

    
    // let diff = turf.booleanOverlap(polygon,latlngs)
    // console.log("Diff: ",diff);
    // const intersect = turf.intersect(latlngs, oldPolygon);
    // return !!intersect;
    return intersect
    
  }

  
}
