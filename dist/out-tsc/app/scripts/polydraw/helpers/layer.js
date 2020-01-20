/* import { DomUtil } from 'leaflet';
import * as L from 'leaflet';
import { polygons, instanceKey } from '../polydraw';
import { NONE, CREATE, EDIT, DELETE, APPEND } from './flags';

 //Usikker på om denne trengs:
export const updateFor = (map: L.Map, eventType: string): void => {
    // console.log("updateFor polygons: ",polygons.get(map));
    const latLngs = polygons.get(map).map((polygon: L.Polygon) => {
        // Ensure the polygon has been closed.
        
  
    });
    
    // Fire the current set of lat lngs.
    map[instanceKey].fire('markers', { latLngs, eventType });
};

export const classesFor = (map: L.Map, mode: number):void => {

    console.log("TODO: type -> modeMap");
    const modeMap = {
        [NONE]: 'mode-none',
        [CREATE]: 'mode-create',
        [EDIT]: 'mode-edit',
        [DELETE]: 'mode-delete',
        [APPEND]: 'mode-append'
    };
console.log("modeMap", modeMap);
    Object.keys(modeMap).forEach((key: string) => {

        const className = modeMap[key];
        const isModeActive = mode && key;

        // Remove the class name if it's set already on the map container.
        DomUtil.removeClass(map._container, className);

        // Apply the class names to the node container depending on whether the mode is active.
        isModeActive && DomUtil.addClass(map._container, className);
        mode === 0 && DomUtil.addClass(map._container, modeMap[NONE]);

    });

};
 */ 
//# sourceMappingURL=layer.js.map