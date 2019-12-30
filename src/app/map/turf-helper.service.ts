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
    console.log(union);
    return union;
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
    let poly;
    console.log("polygonIntersect", polygon, latlngs);
    // console.log(oldPolygon.geometry);
   /*  if(oldPolygon.geometry.coordinates.length > 1 && latlngs.geometry.coordinates.length > 1  ){
      console.log("old: ",oldPolygon);
      
    } */

   /*  if(turf.booleanEqual(oldPolygon, latlngs)){
      console.log("Helt like");
      return false
    } */

    /* else if(oldPolygon.geometry.coordinates.length > 1 && latlngs.geometry.coordinates.length === 1  ){
      console.log("new: ", latlngs);
   
    } */

    if (latlngs.geometry.type === "Polygon") {
      poly = latlngs;
    }

    
    let diff = turf.booleanOverlap(polygon,latlngs)
    console.log("Diff: ",diff);
    // const intersect = turf.intersect(latlngs, oldPolygon);
    // return !!intersect;
    return false
    
  }

  
}
