import ConcaveHull from 'concavehull';
//Denna burde fungere
/**
 * @param {Object} map
 * @param {LatLng[]} latLngs
 * @return {LatLng[]}
 */
export default (function (map, latLngs) {
    return new ConcaveHull(latLngs.concat([latLngs[0]])).getLatLngs();
});
//# sourceMappingURL=concave.js.map