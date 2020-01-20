/* import { DomUtil } from "leaflet";
import * as L from "leaflet";
import { edgesKey, modesKey, instanceKey, notifyDeferredKey, polygons, IPolyDrawOptions } from "./../polydraw";
import { classesFor } from "./layer";

export const NONE: number = 0;
export const CREATE: number = 1;
export const EDIT: number = 2;
export const DELETE: number = 4;
export const APPEND: number = 8;
export const EDIT_APPEND: number = EDIT | APPEND;
export const ALL: number = CREATE | EDIT | DELETE | APPEND;

export const modeFor = (map: L.Map, mode: number, options: IPolyDrawOptions): number => {
  // Update the mode.
  map[modesKey] = mode;
  // Fire the updated mode.
  map[instanceKey].fire("mode", { mode });

  // Disable the map if the `CREATE` mode is a default flag.
  mode & CREATE ? map.dragging.disable() : map.dragging.enable();

  Array.from(polygons.get(map)).forEach(polygon => {
    polygon[edgesKey].forEach(edge => {
      // Modify the edge class names based on whether edit mode is enabled.
      mode & EDIT ? DomUtil.removeClass(edge._icon, "disabled") : DomUtil.addClass(edge._icon, "disabled");
    });
  });

  // Apply the conditional class names to the map container.
  classesFor(map, mode);

  // Fire the event for having manipulated the polygons if the `hasManipulated` is `true` and the
  // `notifyAfterEditExit` option is equal to `true`, and then reset the `notifyDeferredKey`.
  options.notifyAfterEditExit && map[notifyDeferredKey]();
  map[notifyDeferredKey] = () => {};
  return mode;
};
 */ 
//# sourceMappingURL=flags.js.map