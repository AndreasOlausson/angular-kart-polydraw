import { Point } from 'leaflet';
import * as L from 'leaflet';
import { flatten, identical, complement, compose, head } from 'ramda';
import { Clipper, PolyFillType } from 'clipper-lib';
import createPolygon from 'turf-polygon';
import isIntersecting from 'turf-intersect';
import { createFor, removeFor } from './polygon';
import { latLngsToClipperPoints } from './simplify';
import { IPolyDrawOptions } from '../polydraw';

/**
 * @method fillPolygon
 * @param {Object} map
 * @param {Array} polygons
 * @param {Object} options
 * @return {Array}
 */
export function fillPolygon(map: L.Map, polygon, options: IPolyDrawOptions) {

    // Simplify the polygon which prevents voids in its shape.
    const points = latLngsToClipperPoints(map, polygon.getLatLngs()[0]);
    Clipper.SimplifyPolygon(points, PolyFillType.pftNonZero);
    removeFor(map, polygon);

    // Convert the Clipper points back into lat/lng pairs.
    const latLngs = points.map(model => map.layerPointToLatLng(new Point(model.X, model.Y)));

    createFor(map, latLngs, options, true);

}

/**
 * @method latLngsToTuple
 * @param {Array} latLngs
 * @return {Array}
 */
function latLngsToTuple(latLngs) {
    return latLngs.map(model => [model.lat, model.lng]);
}

/**
 * @param {Object} map
 * @param {Array} polygons
 * @param {Object} options
 * @return {Array}
 */
export default (map: L.Map, polygons: L.Polygon[], options: IPolyDrawOptions) => {

    // Transform a L.LatLng object into a GeoJSON polygon that TurfJS expects to receive.
    const toTurfPolygon = compose(createPolygon, x => [x], x => [...x, head(x)], latLngsToTuple);

    const analysis = polygons.reduce((accum, polygon: L.Polygon) => {

        const latLngs = polygon.getLatLngs()[0];
        const points = latLngsToClipperPoints(map, polygon.getLatLngs()[0]);
        const turfPolygon = toTurfPolygon(latLngs);

        // Determine if the current polygon intersects any of the other polygons currently on the map.
        const intersects = polygons.filter(complement(identical(polygon))).some((polygon: L.Polygon) => {
            return Boolean(isIntersecting(turfPolygon, toTurfPolygon(polygon.getLatLngs()[0])));
        });

        const key = intersects ? 'intersecting' : 'rest';

        return {
            ...accum,
            [key]: [...accum[key], intersects ? points : latLngs],
            intersectingPolygons: intersects ? [...accum.intersectingPolygons, polygon] : accum.intersectingPolygons
        };

    }, { intersecting: [], rest: [], intersectingPolygons: [] });

    // Merge all of the polygons.
    const mergePolygons = Clipper.SimplifyPolygons(analysis.intersecting, PolyFillType.pftNonZero);

    // Remove all of the existing polygons that are intersecting another polygon.
    analysis.intersectingPolygons.forEach(polygon => removeFor(map, polygon));

    return flatten(mergePolygons.map(polygon => {

        // Determine if it's an intersecting polygon or not.
        const latLngs = polygon.map(model => {
            return map.layerPointToLatLng(new Point(model.X, model.Y));
        });

        // Create the polygon, but this time prevent any merging, otherwise we'll find ourselves
        // in an infinite loop.
        return createFor(map, latLngs, options, true);

    }));

};