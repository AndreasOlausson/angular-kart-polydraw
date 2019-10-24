//import 'core-js';
import "regenerator-runtime/runtime";

import { FeatureGroup, Point } from "leaflet";
import * as L from "leaflet";
import { select } from "d3-selection";
import { line, curveMonotoneY, curveMonotoneX } from "d3-shape";
import WeakMap from "es6-weak-map";
import Symbol from "es6-symbol";
import { updateFor } from "./helpers/layer";
import { createFor, removeFor, clearFor } from "./helpers/polygon";
import { CREATE, EDIT, DELETE, APPEND, EDIT_APPEND, NONE, ALL, modeFor } from "./helpers/flags";
import simplifyPolygon from "./helpers/simplify";

export interface IPolyDrawOptions {
  mode?: number;
  smoothFactor?: number;
  elbowDistance?: number;
  simplifyFactor?: number;
  mergePolygons?: boolean;
  concavePolygon?: boolean;
  maximumPolygons?: number;
  notifyAfterEditExit?: boolean;
  leaveModeAfterCreate?: boolean;
  strokeWidth?: number;
}

export const polygons = new WeakMap();
export const defaultOptions: IPolyDrawOptions = {
  mode: ALL,
  smoothFactor: 0.3,
  elbowDistance: 10,
  simplifyFactor: 1.1,
  mergePolygons: true,
  concavePolygon: true,
  maximumPolygons: Infinity,
  notifyAfterEditExit: false,
  leaveModeAfterCreate: false,
  strokeWidth: 2
};
export const instanceKey = Symbol("freedraw/instance");
export const modesKey = Symbol("freedraw/modes");
export const notifyDeferredKey = Symbol("freedraw/notify-deferred");
export const edgesKey = Symbol("freedraw/edges");
const cancelKey = Symbol("freedraw/cancel");

export default class PolyDraw extends FeatureGroup {
  map: L.Map;
  options: IPolyDrawOptions;
  coordinates = [];
  polylyne: L.polyline;

  constructor(options: IPolyDrawOptions = defaultOptions) {
    super();
    this.options = { ...defaultOptions, ...options };
  }

  onAdd(map: L.Map): this {
    this.map = map;

    map[cancelKey] = () => {};
    map[instanceKey] = this;
    map[notifyDeferredKey] = () => {};

    // Setup the dependency injection for simplifying the polygon.
    map.simplifyPolygon = simplifyPolygon;

    //    // Add the item to the map.
    polygons.set(map, []);

    //    // Set the initial mode.
    modeFor(map, this.options.mode, this.options);

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    // Instantiate the SVG layer that sits on top of the map.
    const svg =  select(map._container)
      .append("svg")
      .classed("free-draw", true)
      .attr("width", "100%")
      .attr("height", "100%")
      .style("pointer-events", "none")
      .style("z-index", "1001")
      .style("position", "relative")
      ;

    //    // Set the mouse events.
    this.listenForEvents(map, svg, this.options);

    // return featuregroup-this
    return this;
  }

  /**
   * @method onRemove
   * @param {Object} map
   * @return {void}
   */
  onRemove(map: L.Map): this {
    // Remove the item from the map.
    polygons.delete(map);

    // Remove the SVG layer.
    L.svg.remove();

    // Remove the appendages from the map container.
    delete map[cancelKey];
    delete map[instanceKey];
    delete map.simplifyPolygon;

    return this;
  }

  /**
   * @method create
   * @param {LatLng[]} latLngs
   * @param {Object} [options = { concavePolygon: false }]
   * @return {Object}
   */
  create(latLngs, options = { concavePolygon: false }) {
    const created = createFor(this.map, latLngs, { ...this.options, ...options });
    console.log("create", created);
    updateFor(this.map, "create");
    return created;
  }

  /**
   * @method remove
   * @param {Object} polygon
   * @return {void}
   */
  remove(polygon: object): this {
    polygon ? removeFor(this.map, polygon) : super.remove();
    updateFor(this.map, "remove");

    return this;
  }

  /**
   * @method clear
   * @return {void}
   */
  clear(): void {
    clearFor(this.map);
    updateFor(this.map, "clear");
  }

  /**
   * @method setMode
   * @param {Number} [mode = null]
   * @return {Number}
   */
  mode(mode = null) {
    // Set mode when passed `mode` is numeric, and then yield the current mode.
    typeof mode === "number" && modeFor(this.map, mode, this.options);
    return this.map[modesKey];
  }

  getPolygons(){
      return this.coordinates;
  }

  /**
   * @method size
   * @return {Number}
   */
  size() {
    return polygons.get(this.map).size;
  }

  /**
   * @method all
   * @return {Array}
   */
  all() {
    return Array.from(polygons.get(this.map));
  }

  /**
   * @method cancel
   * @return {void}
   */
  cancel() {
    this.map[cancelKey]();
  }

  /**
   * @method listenForEvents
   * @param {Object} map
   * @param {Object} svg
   * @param {Object} options
   * @return {void}
   */
  listenForEvents(map: L.Map, svg: L.SVG, options: IPolyDrawOptions) {
    let polylyne; 
    let polygroup; 
    /**
     * @method mouseDown
     * @param {Object} event
     * @return {void}
     */
    const mouseDown = event => {
      if (!(map[modesKey] & CREATE)) {
        // Polygons can only be created when the mode includes create.
        return;
      }
      /**
       * @constant latLngs
       */
      let polygon = [];

      // Create the line iterator and move it to its first `yield` point, passing in the start point
      // from the mouse down event.

      let lineIterator;
      if (event.originalEvent != null) {
        console.log(event.originalEvent);
        // lineIterator = this.createPath(svg, map.latLngToLayerPoint(event.latlng), options.strokeWidth);
      } else {
        const points = map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
        // lineIterator = this.createPath(svg, map.latLngToContainerPoint(points), options.strokeWidth);
      }

      /**
       * @method mouseMove
       * @param {Object} event
       * @return {void}
       */
      const mouseMove = (event: L.MouseEvent) => {
        if (event.originalEvent != null) {
            // console.log(event.originalEvent);
          let latLng = map.mouseEventToLatLng(event.originalEvent);
          let point;
          polygon.push(latLng);
         polylyne= L.polyline(polygon, {fill:false, className:"polyline"})

         polygroup = L.layerGroup().addLayer(polylyne).addTo(map)
         
          /* if (polygon.indexOf(latLng) !== 0) {
            point = map.latLngToContainerPoint(polygon[polygon.indexOf(latLng) - 1]);
          } else {
            point = map.latLngToContainerPoint(polygon[0]);
          }
          let fromPoint =  map.mouseEventToContainerPoint(event.originalEvent)
          console.log(map.mouseEventToContainerPoint(event.originalEvent));
          console.log(new Point(fromPoint.x, fromPoint.y));
          console.log(map.containerPointToLatLng(fromPoint));
          this.createPath(svg, new Point(fromPoint.x, fromPoint.y), point, options.strokeWidth); */
          //   lineIterator(latLng);
        } else {
          /* const points = map.layerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
            
                latLngs.push(points);
                
                lineIterator(points); */
          document.removeEventListener(
            "touchmove",
            e => {
              mouseMove(e);
            },
            true
          );
        }
        
      };

      // Create the path when the user moves their cursor.
      map.on("mousemove touchmove", mouseMove);

      document.addEventListener("touchmove", e => {
        e.stopPropagation();
        mouseMove(e);
      });

      /**
       * @method mouseUp
       * @param {Boolean} [create = true]
       * @return {Function}
       */
      const mouseUp = (_, create = true) => {
        // Remove the ability to invoke `cancel`.
        map[cancelKey] = () => {};

        // Stop listening to the events.
        map.off("mouseup", mouseUp);
        map.off("mousemove", mouseMove);
        "body" in document && document.body.removeEventListener("mouseleave", mouseUp);

        // Clear the SVG canvas.
        console.log(polygroup.getLayerId(polylyne));
        console.log("map: ", map);
        svg.selectAll("*").remove();
        
        polygroup.removeLayer(polygroup.getLayerId(polylyne))
        
        // map.remove(polygroup)
        console.log("map after: ", map);

        if (create) {
          
          //   polygons.set(map, polygon);
          // ...And finally if we have any lat/lngs in our set then we can attempt to
          // create the polygon.
          if (polygon.length > 0) {
            polygon = createFor(map, polygon, options);
        }


          // Finally invoke the callback for the polygon regions.
          updateFor(map, "create");

          document.removeEventListener(
            "touchstart",
            e => {
              mouseDown(e);
            },
            true
          );
          document.removeEventListener("touchend", mouseUp);

          // Exit the `CREATE` mode if the options permit it.
          options.leaveModeAfterCreate && this.mode(this.mode() ^ CREATE);
          polygon = [];
        }
      };

      // Clear up the events when the user releases the mouse.
      map.on("mouseup touchend", mouseUp);
      document.addEventListener("touchend", mouseUp);
      "body" in document && document.body.addEventListener("mouseleave", mouseUp);

      // Setup the function to invoke when `cancel` has been invoked.
      map[cancelKey] = () => mouseUp({}, false);
    };

    map.on("mousedown touchstart", mouseDown);
    document.addEventListener("touchstart", e => {
      // e.stopPropagation();
      mouseDown(e);
    });
  }

  /**
   * @method createPath
   * @param {Object} svg
   * @param {Point} fromPoint
   * @param {Number} strokeWidth
   * @return {void}
   */
  createPath(svg, fromPoint, startPoint, strokeWidth) {
    const lineFunction = line()
      .curve(curveMonotoneX)
      
      .x(d => d.x)
      .y(d => d.y);

    const lineData = [fromPoint,startPoint ];

    // Draw SVG line based on the last movement of the mouse's position.
    svg
      .append("path")
      .classed("leaflet-line", true)
      .data([lineData])
      // .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", strokeWidth)
      // .style("position", "absolute")
      .attr("d", lineFunction);

      return toPoint => {
        console.log(toPoint);
      }

  }
}

// /**
//  * @method freeDraw
//  * @return {Object}
//  */
export const freeDraw = options => {
  return new PolyDraw(options);
};

export { CREATE, EDIT, DELETE, APPEND, EDIT_APPEND, NONE, ALL } from "./helpers/flags";

// if (typeof window !== 'undefined') {

//     // Attach to the `window` as `FreeDraw` if it exists, as this would prevent `new FreeDraw.default` when
//     // using the web version.
//     window.FreeDraw = FreeDraw;
//     FreeDraw.CREATE = CREATE;
//     FreeDraw.EDIT = EDIT;
//     FreeDraw.DELETE = DELETE;
//     FreeDraw.APPEND = APPEND;
//     FreeDraw.EDIT_APPEND = EDIT_APPEND;
//     FreeDraw.NONE = NONE;
//     FreeDraw.ALL = ALL;

// }
