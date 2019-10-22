import { Point } from 'leaflet';
import * as L from 'leaflet';
import { Clipper, PolyFillType } from 'clipper-lib';

/**
 * @method latLngsToClipperPoints
 * @param {Object} map
 * @param {LatLng[]} latLngs
 * @return {Array}
 */
export const latLngsToClipperPoints = (map: L.Map, latLng: L.LatLngExpression) => {
    console.log(latLng)
    let latLngs: any;

    return latLng.map((latLng: L.LatLngExpression) => {
      console.log(latLng)
        const point = map.latLngToLayerPoint(latLng);
        console.log(point.x, point.y)
        return { X: point.x, Y: point.y };
    });

};

/**
 * @method clipperPolygonsToLatLngs
 * @param {Object} map
 * @param {Array} polygons
 * @return {Array}
 */
const clipperPolygonsToLatLngs = (map, polygons) => {
  
    return polygons.map(polygon => {

        return polygon.map(point => {
            const updatedPoint = new Point(point.X, point.Y);
            return map.layerPointToLatLng(updatedPoint);
        });

    });

};

/**
 * @param {Object} map
 * @param {LatLng[]} latLngs
 * @param {Object} options
 * @return {LatLng[]}
 */
export default (map, latLngs, options) => {
  console.log(options)
  
    const points = Clipper.CleanPolygon(latLngsToClipperPoints(map, latLngs), options.simplifyFactor);
    console.log("points: ", points)
    const polygons = Clipper.SimplifyPolygon(points, PolyFillType.pftNonZero);
    
  console.log("SimplifyPolygon: ",clipperPolygonsToLatLngs(map, polygons) )
    return clipperPolygonsToLatLngs(map, polygons);

};