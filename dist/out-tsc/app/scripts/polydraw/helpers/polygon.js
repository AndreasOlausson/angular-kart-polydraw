/* import { LineUtil, Point, Polygon, DomEvent } from "leaflet";
import * as L from "leaflet";
import { defaultOptions, edgesKey, modesKey, polygons, IPolyDrawOptions } from "../polydraw";
import { updateFor } from "./layer";
import createEdges from "./edges";
import { DELETE, APPEND } from "./flags";
import handlePolygonClick from "./polygon";
import concavePolygon from "./concave";
import mergePolygons from "./merge";


const appendEdgeFor = (map: L.Map, polygon, options: IPolyDrawOptions, { parts, newPoint, startPoint, endPoint }) => {
  console.log(parts);
  const latLngs = parts.reduce((accumulator, point, index) => {
    const nextPoint = parts[index + 1] || parts[0];

    if (point === startPoint && nextPoint === endPoint) {
      return [
        // We've found the location to add the new polygon.
        ...accumulator,
        map.containerPointToLatLng(point),
        map.containerPointToLatLng(newPoint)
      ];
    }

    return [...accumulator, map.containerPointToLatLng(point)];
  }, []);

  // Update the lat/lngs with the newly inserted edge.
  polygon.setLatLngs(latLngs);

  // Remove the current set of edges for the polygon, and then recreate them, assigning the
  // new set of edges back into the polygon.
  polygon[edgesKey].map(edge => map.removeLayer(edge));
  // polygon[edgesKey] = createEdges(map, polygon, options);
};

export const createFor = (
  map: L.Map,
  latLngs: L.LatLng[],
  options: IPolyDrawOptions = defaultOptions,
  preventMutations: boolean = false
) => {
  // Determine whether we've reached the maximum polygons.
  const limitReached = polygons.get(map).size === options.maximumPolygons;
  let poly = []

  // Apply the concave hull algorithm to the created polygon if the options allow.
  const concavedLatLngs = !preventMutations && options.concavePolygon ? concavePolygon(map, latLngs) : latLngs;

  // Simplify the polygon before adding it to the map.
  const addedPolygons = limitReached
    ? []
    : map.simplifyPolygon(map, concavedLatLngs, options).map((latLngs: L.LatLng) => {
     
        return latLngs;
      });
  console.log(addedPolygons);
  // Append the current polygon to the master set.
  addedPolygons[0].forEach(polygon => {
    polygons.get(map).push(polygon);
    poly.push(polygon)
  });

console.log(poly);
  return poly;
};


 //har ikke testet denne, men burde være mulig å få fikset dette til å følge søppelkassene:
export const removeFor = (map: L.Map, polygon) => {
  // Remove polygon and all of its associated edges.
  map.removeLayer(polygon);
  edgesKey in polygon && polygon[edgesKey].map(edge => map.removeLayer(edge));

  // Remove polygon from the master set.
  polygons.get(map).delete(polygon);
};

//Ikke testet, men brude ikke være noe stress:
export const clearFor = (map: L.Map) => {
  Array.from(polygons.get(map).values()).forEach(polygon => removeFor(map, polygon));
};

export default (map: L.Map, polygon, options: IPolyDrawOptions) => {
  return event => {
    console.log(event);
    // Gather all of the points from the lat/lngs of the current polygon.
    const newPoint = map.mouseEventToContainerPoint("originalEvent" in event ? event.originalEvent : event);
    const parts = polygon.getLatLngs()[0].map(latLng => map.latLngToContainerPoint(latLng));

    const { startPoint, endPoint, lowestDistance } = parts.reduce(
      (accumulator, point, index) => {
        const startPoint = point;
        const endPoint = parts[index + 1] || parts[0];
        const distance = LineUtil.pointToSegmentDistance(newPoint, startPoint, endPoint);

        if (distance < accumulator.lowestDistance) {
          // If the distance is less than the previous then we'll update the accumulator.
          return { lowestDistance: distance, startPoint, endPoint };
        }

        // Otherwise we'll simply yield the previous accumulator.
        return accumulator;
      },
      { lowestDistance: Infinity, startPoint: new Point(), endPoint: new Point() }
    );

    // Setup the conditions for the switch statement to make the cases clearer.
    const mode = map[modesKey];
    const isDelete = Boolean(mode & DELETE);
    const isAppend = Boolean(mode & APPEND);
    const isDeleteAndAppend = Boolean(mode & DELETE && mode & APPEND);

    // Partially apply the remove and append functions.
    const removePolygon = () => removeFor(map, polygon);
    const appendEdge = () => appendEdgeFor(map, polygon, options, { parts, newPoint, startPoint, endPoint });

    switch (true) {
      // If both modes DELETE and APPEND are active then we need to do a little work to determine
      // which action to take based on where the user clicked on the polygon.
      case isDeleteAndAppend:
        lowestDistance > options.elbowDistance ? removePolygon() : appendEdge();
        break;

      case isDelete:
        removePolygon();
        break;

      case isAppend:
        appendEdge();
        break;
    }

    // Trigger the event for having deleted a polygon or appended an edge.
    (isDelete || isAppend) && updateFor(map, isDelete ? "remove" : "append");
  };
};
 */ 
//# sourceMappingURL=polygon.js.map