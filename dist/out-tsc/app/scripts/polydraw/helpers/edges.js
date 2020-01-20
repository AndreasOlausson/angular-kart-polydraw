/* import { DivIcon, Marker, DomEvent } from 'leaflet';
import * as L from 'leaflet';
import { polygons, modesKey, notifyDeferredKey, IPolyDrawOptions } from '../polydraw';
import { updateFor } from './layer';
import { CREATE, EDIT } from './flags';
import mergePolygons, { fillPolygon } from './merge';
import { createFor } from './polygon';


 //Dette skal være de grønne sirklene på polygonet
export default function createEdges(map: L.Map, polygon: L.Polygon, options: IPolyDrawOptions,polylayer: L.Polygon) {
let id;
let merge;
    const fetchLayerPoints = polygon => {
        console.log("fetchLayerPoints: ",polygon);
        return polygon.map(latLng => {
            return map.latLngToLayerPoint(latLng);
        });

    };

    const markers = fetchLayerPoints(polygon).map(point => {

        const mode = map[modesKey];
        const icon = new DivIcon({ className:'my-div-icon' });
        const latLng = map.layerPointToLatLng(point);
        const marker = new Marker(latLng).addTo(map);
        var merged = []

        // Disable the propagation when you click on the marker.
        DomEvent.disableClickPropagation(marker);

        marker.on('mousedown', function mouseDown() {

            if (!(map[modesKey] & EDIT)) {

                // Polygons can only be created when the mode includes edit.
                map.off('mousedown', mouseDown);
                return;

            }

            // Disable the map dragging as otherwise it's difficult to reposition the edge.
            map.dragging.disable();

            const mouseMove = (event: L.MouseEvent) => {

                // Determine where to move the marker to from the mouse move event.
                const containerPoint: L.Point = map.latLngToContainerPoint(event.latlng);
                const latLng: L.LatLng = map.containerPointToLatLng(containerPoint);

                // Update the marker with the new lat/lng.
                marker.setLatLng(latLng);

                // ...And finally update the polygon to match the current markers.
                const latLngs: L.LatLng[] = markers.map(marker => marker.getLatLng());
       
                merged = latLngs;
                
                

            };

            // Listen for the mouse move events to determine where to move the marker to.
            map.on('mousemove', mouseMove);

            function mouseUp() {
                
                if (!(map[modesKey] & CREATE)) {

                    // Re-enable the dragging of the map only if created mode is not enabled.
                    map.dragging.enable();

                }

                // Stop listening to the events.
                map.off('mouseup', mouseUp);
                map.off('mousedown', mouseDown);
                map.off('mousemove', mouseMove);

                // Attempt to simplify the polygon to prevent voids in the polygon.
                console.log("edges: ",polygon);
                console.log("merged: ",merged);
                // Merge the polygons if the options allow using a two-pass approach as this yields the better results.
                if(id != null){
                     merge =  mergePolygons(map, polygon, merged, id);
                }
                else{
                    console.log("HER");
                   merge =  mergePolygons(map, polygon, merged,  polylayer);
                }
                // options.mergePolygons && merge() && merge();
                
                id = merge;

                // Trigger the event for having modified the edges of a polygon, unless the `notifyAfterEditExit`
                // option is equal to `true`, in which case we'll defer the notification.
                options.notifyAfterEditExit ? (() => {

                    // Deferred function that will be invoked by `modeFor` when the `EDIT` mode is exited.
                    map[notifyDeferredKey] = () => updateFor(map, 'edit');

                })() : updateFor(map, 'edit');
                
            }

            // Cleanup the mouse events when the user releases the mouse button.
            // We need to listen on both map and marker, because if the user moves the edge too quickly then
            // the mouse up will occur on the map layer.
            map.on('mouseup', mouseUp);
            marker.on('mouseup', mouseUp);

        });

        return marker;

    });

    return markers;

} */ 
//# sourceMappingURL=edges.js.map