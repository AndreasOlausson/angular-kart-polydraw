import { Point } from 'leaflet';
import * as L from 'leaflet';
import { Clipper, PolyFillType } from 'clipper-lib';
import { IPolyDrawOptions } from '../polydraw';

/**
 * @method latLngsToClipperPoints
 * @param {Object} map
 * @param {LatLng[]} latLngs
 * @return {Array}
 */
export const latLngsToClipperPoints = (map: L.Map, latLngs: L.LatLngExpression[]) => {
    
    
    return latLngs.map((latLng: L.LatLngExpression) => {
      
        const point = map.latLngToLayerPoint(latLng);
        
        return { X: point.x, Y: point.y };
    });

};

/**
 * @method clipperPolygonsToLatLngs
 * @param {Object} map
 * @param {Array} polygons
 * @return {Array}
 */
const clipperPolygonsToLatLngs = (map: L.Map, polygons: L.Polygon[]) => {
    
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
export default (map: L.Map, latLngs: L.LatLng[], options: IPolyDrawOptions) => {
  
    const points = Clipper.CleanPolygon(latLngsToClipperPoints(map, latLngs), options.simplifyFactor);
    
    const polygons = Clipper.SimplifyPolygon(points, PolyFillType.pftNonZero);
    
  
    return clipperPolygonsToLatLngs(map, polygons);

};
