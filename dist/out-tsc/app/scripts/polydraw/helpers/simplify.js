/* import { Point } from "leaflet";
import * as L from "leaflet";
import { Clipper, PolyFillType } from "clipper-lib";
import { IPolyDrawOptions } from "../polydraw";


export const latLngsToClipperPoints = (map: L.Map, latLngs: L.LatLngExpression[]) => {
    console.log(latLngs);
  return latLngs.map((latLng: L.LatLngExpression) => {
    const point = map.latLngToLayerPoint(latLng);
    return { X: point.x, Y: point.y };
  });
};


const clipperPolygonsToLatLngs = (map: L.Map, polygons: L.Polygon[]) => {
  return polygons.map(polygon => {
    return polygon.map(point => {
      const updatedPoint = new Point(point.X, point.Y);
      return map.layerPointToLatLng(updatedPoint);
    });
  });
};

export default (map: L.Map, latLngs: L.LatLng[], options: IPolyDrawOptions) => {
    console.log(latLngs);
  const points = Clipper.CleanPolygon(latLngsToClipperPoints(map, latLngs), options.simplifyFactor);
  const polygons = Clipper.SimplifyPolygon(points, PolyFillType.pftNonZero);
  return clipperPolygonsToLatLngs(map, polygons);
};
 */ 
//# sourceMappingURL=simplify.js.map