/* import { Point } from "leaflet";
import * as L from "leaflet";
import * as turf from "@turf/turf";
import { flatten, identical, complement, compose, head } from "ramda";
import { Clipper, PolyFillType } from "clipper-lib";
import createPolygon from "turf-polygon";
import isIntersecting from "turf-intersect";
import { createFor, removeFor } from "./polygon";
import { latLngsToClipperPoints } from "./simplify";
import { IPolyDrawOptions, polygons } from "../polydraw";

export function fillPolygon(map: L.Map, polygon, options: IPolyDrawOptions) {
  // Simplify the polygon which prevents voids in its shape.
  console.log(polygon);
  const points = latLngsToClipperPoints(map, polygon);
  Clipper.SimplifyPolygon(points, PolyFillType.pftNonZero);
  removeFor(map, polygon);

  // Convert the Clipper points back into lat/lng pairs.
  const latLngs = points.map(model => map.layerPointToLatLng(new Point(model.X, model.Y)));

  createFor(map, latLngs, options, true);
}

function getCoordsFromLatLngs(latlngs) {
  var coords = [L.GeoJSON.latLngsToCoords(latlngs)];

  coords[0].push(coords[0][0]);

  return coords;
}

function getLatLngsFromJSON(json) {
  console.log(json);
  var coords = json.geometry ? json.geometry.coordinates : json;
  return L.GeoJSON.coordsToLatLngs(coords, 1, L.GeoJSON.coordsToLatLng);
}

function _tryturf(method, a, b) {
  var fnc = turf[method];
  try {
    return fnc(a, b);
  } catch (_) {
    // buffer non-noded intersections
    try {
      return fnc(turf.buffer(a, 0.000001), turf.buffer(b, 0.000001));
    } catch (_) {
      // try buffering again
      try {
        return fnc(turf.buffer(a, 0.1), turf.buffer(b, 0.1));
      } catch (_) {
        // try buffering one more time
        try {
          return fnc(turf.buffer(a, 1), turf.buffer(b, 1));
        } catch (e) {
          // give up
          console.error("turf failed", a, b, e);
          return false;
        }
      }
    }
  }
}

export default (map: L.Map, polygon: L.Polygon, newPolygon: L.Polygon[], polylayer: L.Polygon) => {
  console.log("mergePolygons polygon: ", polygon);
  console.log("mergePolygons newPolygon: ", newPolygon);
  let layer = {};
  let latlng;
  let newPolylayer;
  let siblingJson = turf.buffer(turf.polygon(getCoordsFromLatLngs(polygon)), 0);
  let newJson = turf.buffer(turf.polygon(getCoordsFromLatLngs(newPolygon)), 0);

  if (!turf.intersect(newJson, siblingJson)) {
    console.log("Overlapper ikke");
  }
  if (turf.intersect(newJson, siblingJson)) {
    let union = _tryturf("union", newJson, siblingJson);

    if (union.geometry.type != "MultiPolygon" && union != false) {
      latlng = getLatLngsFromJSON(union);
      console.log(polylayer);
      if (layer !== polylayer) {
        map.removeLayer(polylayer);
      }
      newPolylayer = new L.Polygon(latlng).addTo(map);
      //Oppdaterer det globale polygonet
      layer = polylayer;
      console.log(newPolylayer);
      polygons.set(map, newPolygon);
    }
  }

  return newPolylayer;
};
 */ 
//# sourceMappingURL=merge.js.map