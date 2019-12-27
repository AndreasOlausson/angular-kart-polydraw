import { Injectable } from "@angular/core";

import * as turf from "@turf/turf";
import * as concaveman from "concaveman";
import { FeatureCollection, Point } from "@turf/turf";

@Injectable({ providedIn: "root" })
export class TurfHelperService {
  private simplifyTolerance = { tolerance: 0.0001, highQuality: false };
  constructor() {}

  union(poly1, poly2) {
    //console.log("union", poly1, poly2);

    let union = turf.union(poly1, poly2);
    return union;
  }

  turfConcaveman(points: FeatureCollection<Point>) {
    //console.log("turfConcaveman", points);

    const coordinates = points.features.map(f => f.geometry.coordinates);
    return turf.polygon([concaveman(coordinates)]);
  }

  getSimplified(latLngs) {
    //console.log("getSimplified", latLngs);

    const tolerance = this.simplifyTolerance;
    const simplified = turf.simplify(latLngs, tolerance);
    return simplified;
  }

  getTurfPolygon(geometry) {
    return turf.polygon(geometry);
  }

  getKinks(feature) {
    const kinks = turf.kinks(feature);
    const unkink = turf.unkinkPolygon(feature);
    let coordinates = []
    turf.featureEach(unkink, (current, i) => {
        coordinates.push(current)
    });

    return coordinates
  }
}
