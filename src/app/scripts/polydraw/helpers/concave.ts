import ConcaveHull from 'concavehull';
import * as L from 'leaflet';


//Denna burde fungere

/**
 * @param {Object} map
 * @param {LatLng[]} latLngs
 * @return {LatLng[]}
 */
export default (map: L.Map, latLngs: L.LatLngExpression[]) => {
    return new ConcaveHull([ ...latLngs, latLngs[0] ]).getLatLngs();
};