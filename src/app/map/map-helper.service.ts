import { Injectable } from "@angular/core";
import * as L from "leaflet";
import * as turf from "@turf/turf";
import * as ConcaveHull from "concavehull";

import PolyDraw from "../scripts/polydraw/polydraw";
import { Observable, BehaviorSubject } from "rxjs";

export interface IPolyDrawOptions {
  mode?: number;
  smoothFactor?: number;
  polyline?: Object;
  elbowDistance?: number;
  simplifyFactor?: number;
  mergePolygons?: boolean;
  concavePolygon?: boolean;
  maximumPolygons?: number;
  notifyAfterEditExit?: boolean;
  leaveModeAfterCreate?: boolean;
  strokeWidth?: number;
}

@Injectable()
export class MapHelperService {
  public map;

  options: IPolyDrawOptions;
  polyLineOptions = {
    color: "#5cb85c",
    opacity: 1,
    smoothFactor: 0,
    noClip: true,
    clickable: false,
    weight: 2
  };
  polygonOptions = {
    className: "leaflet-free-hand-shapes",
    smoothFactor: 1,
    // fill:false,
    fillOpacity: 0.5,
    noClip: true
  };

  icon = {
    icon: L.icon({
      iconSize: [15, 15],
      iconAnchor: [5, 5],
      // specify the path here
      iconUrl: "http://www.clker.com/cliparts/3/I/d/S/s/W/green-circle-md.png"
    }),
    draggable: true
  };

  simplify_tolerance: number = 0.00005;
  merge_polygons: boolean = true;
  concave_polygons: boolean = true;
  creating: boolean = false;
  ArrayOfLayerGroups: L.LayerGroup[] = [];
  tracer = L.polyline([[0, 0]], L.extend({}, this.polyLineOptions));

  drawModeSubject: BehaviorSubject<DrawMode> = new BehaviorSubject<DrawMode>(DrawMode.OFF);
  drawMode$: Observable<DrawMode> = this.drawModeSubject.asObservable();

  initMap() {
    this.map = new L.Map("map");
    this.map.setView(new L.LatLng(59.911491, 10.757933), 14);
    L.tileLayer(`https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`, {
      maxZoom: 20,
      maxBounds: [[90, -180], [-90, 180]],
      noWrap: true,
      attribution: "HOT"
    }).addTo(this.map);
    this.initPolyDraw();
  }

  initPolyDraw() {
    this.map.addLayer(this.tracer);
  }

  __events(onoff: boolean) {
    let onoroff = onoff ? "on" : "off";

    if (onoff) {
      this.map._container.addEventListener("touchstart", e => {
        this.mouseDown(e);
      });
    } else {
      this.map._container.removeEventListener(
        "touchstart",
        e => {
          this.mouseDown(e);
        },
        true
      );
    }

    this.map[onoroff]("mousedown", this.mouseDown, this);
    this.map[onoroff]("zoomstart", this.zoomMoveStart, this);
  }

  zoomMoveStart() {
    if (!this.creating) return;
    this.stopDraw();
  }

  mouseDown(event) {
    if (event.originalEvent != null) {
      this.tracer.setLatLngs([event.latlng]);
    } else {
      let latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
      this.tracer.setLatLngs([latlng]);
    }
    this.startDraw();
  }

  startDraw() {
    this.creating = true;
    this.drawStartedEvents(true);
  }

  stopDraw() {
    this.creating = false;
    this.resetTracker();
    this.drawStartedEvents(false);
  }

  drawStartedEvents(onoff: boolean) {
    let onoroff = onoff ? "on" : "off";
    if (onoff) {
      this.map._container.addEventListener("touchmove", e => {
        this.mouseMove(e);
      });
      this.map._container.addEventListener("touchend", e => {
        this.mouseUpLeave(e);
      });
    } else {
      this.map._container.removeEventListener("touchmove", this.mouseMove, true);
      this.map._container.removeEventListener(
        "touchend",
        e => {
          this.mouseUpLeave(e);
        },
        true
      );
    }

    this.map[onoroff]("mousemove", this.mouseMove, this);
    this.map[onoroff]("mouseup", this.mouseUpLeave, this);
  }

  mouseMove(event) {
    if (event.originalEvent != null) {
      this.tracer.addLatLng(event.latlng);
    } else {
      let latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
      this.tracer.addLatLng(latlng);
    }
  }

  mouseUpLeave(events) {
    var latlngs = this.tracer.getLatLngs();
    this.stopDraw();

    if (latlngs.length < 3) return;

    if (this.concave_polygons) {
      latlngs.push(latlngs[0]);
      latlngs = new ConcaveHull(latlngs).getLatLngs();
    }
    switch (this.getDrawMode()) {
      case DrawMode.ADDPOLYGON:
        this.addPolygon(latlngs, true);
        break;

      case DrawMode.SUBTRACTPOLYGON:
        this.subtractPolygon(latlngs, true);
        break;

      default:
        break;
    }
  }

  getCoordsFromLatLngs(latlngs: L.Latlng[]): L.GeoJSON {
    var coords = [L.GeoJSON.latLngsToCoords(latlngs)];
    coords[0].push(coords[0][0]);
    return coords;
  }

  getLatLngsFromJSON(json: L.GeoJSON): L.Latlng[] {
    var coords = json.geometry ? json.geometry.coordinates : json;
    return L.GeoJSON.coordsToLatLngs(coords, 1, L.GeoJSON.coordsToLatLng);
  }

  mergePolygons2020Style(layers: L.LayerGroup[], latlngs: L.latlng[]) {
    let addNew = turf.polygon(this.getCoordsFromLatLngs(latlngs));
    let union;
    layers.forEach(layerGroup => {
      let layer = layerGroup.getLayers()[0];
      let geoLayer = layer.toGeoJSON();
      union = turf.union(addNew, geoLayer);
      this.removeLayerGroup(layerGroup);
      addNew = union;
    });

    let newLatlngs = this.getLatLngsFromJSON(addNew)[0];
    this.addPolygonLayer(newLatlngs, true);
  }

  removeLayerGroup(layerGroup: L.LayerGroup) {
    layerGroup.clearLayers();
    this.ArrayOfLayerGroups = this.ArrayOfLayerGroups.filter(layerGroups => layerGroups != layerGroup);
    this.map.removeLayer(layerGroup);
  }

  merge(latlngs: L.Latlng[]) {
    let polygonLength = [];
    let newArray: L.LayerGroup[] = [];
    let polyIntersection: boolean = false;
    this.ArrayOfLayerGroups.forEach((layerGroup, index) => {
      polygonLength = layerGroup.getLayers();
      polyIntersection = this.polygonIntersect(polygonLength[0], latlngs);
      if (polyIntersection) {
        newArray.push(layerGroup);
      }
    });
    this.mergePolygons2020Style(newArray, latlngs);
  }

  polygonIntersect(polygon: L.Polygon, latlngs: L.latlng[]): boolean {
    let oldPolygon = polygon.toGeoJSON();
    let drawnPolygon = turf.buffer(turf.polygon(this.getCoordsFromLatLngs(latlngs)), 0);
    let intersect = turf.intersect(drawnPolygon, oldPolygon);

    return !!intersect;
  }

  addPolygonLayer(latlngs: L.Latlng[], simplify: boolean) {
    var latLngs = simplify ? this.getSimplified(latlngs) : latlngs;
    const layerGroup: L.LayerGroup = new L.LayerGroup();
    const polygon = this.getPolygon(latLngs);
    layerGroup.addLayer(polygon);
    this.addMarker(latLngs, layerGroup);

    this.ArrayOfLayerGroups.push(layerGroup);
    this.setDrawMode(DrawMode.OFF);
  }

  getDrawMode(): DrawMode {
    return this.drawModeSubject.value;
  }

  polygonClick(layer, event) {
    /*   if (this._drawMode === "delete") {
      this.map.removeLayer(layer);
    } */
  }

  addPolygon(latlngs: L.Latlng[], simplify: boolean, nomerge: boolean = false) {
    if (this.merge_polygons && !nomerge && this.ArrayOfLayerGroups.length > 0) {
      this.merge(latlngs);
    } else {
      this.addPolygonLayer(latlngs, simplify);
    }
  }

  getPolygon(latlngs: L.Latlng[]):L.Polygon {
    var polyoptions = L.extend({}, this.polygonOptions);
    const polygon = new L.Polygon(latlngs, polyoptions).addTo(this.map);
    return polygon;
  }

  addMarker(latlngs: L.latlng[], layerGroup: L.LayerGroup) {
    latlngs.forEach((latlng, i) => {
      let marker;

      marker = new L.Marker(latlng, this.icon);
      layerGroup.addLayer(marker).addTo(this.map);

      marker.on("drag", e => {
        this.markerDrag(e, layerGroup);
      });
      marker.on("dragend", e => {
        this.markerDragEnd(e, layerGroup);
      });
    });
  }
  markerDrag(e, layerGroup: L.LayerGroup) {
    let newPos = [];
    const layerLength = layerGroup.getLayers();
    for (let index = 1; index < layerLength.length; index++) {
      newPos.push(layerLength[index].getLatLng());
    }
    layerLength[0].setLatLngs(newPos)
  }

  markerDragEnd(e, layerGroup: L.LayerGroup) {
    let newPos = [];
    const layerLength = layerGroup.getLayers();
    for (let index = 1; index < layerLength.length; index++) {
      newPos.push(layerLength[index].getLatLng());
    }
    this.addPolygon(layerLength[0].getLatLngs()[0],false)
  }

  subtractPolygon(latlngs: L.Latlng[], simplify: boolean) {
    var latLngs = simplify ? latlngs : this.getSimplified(latlngs);

    var polygon = new L.Polygon(latLngs);

    this.subtract(polygon);
  }

  //Ikke startet på:
  subtract(polygon: L.Polygon) {
    var polys = new L.layerGroup();

    var newJson = polygon.toGeoJSON();
    // var fnc = this._tryturf.bind(this, "difference");

    polys.eachLayer(poly => {
      var siblingjson = poly.toGeoJSON();

      var diff;
      // console.log(siblingjson.geometry.coordinates);
      //Hvis det er polygon og ikke et punkt
      if (siblingjson.geometry.coordinates.length < 2) {
        // diff = fnc(siblingjson, newJson);

        if (diff === false) {
          // turf failed
          return;
        }
        if (diff.geometry.type === "MultiPolygon") {
          // poly was split into multi
          // destroy and rebuild
          polys.removeLayer(poly);
          this.map.removeLayer(poly);

          var coords = diff.geometry.coordinates;
          for (var j = 0, lenj = coords.length; j < lenj; j++) {
            var polyjson = turf.polygon(coords[j]),
              latlngs = this.getLatLngsFromJSON(polyjson);

            this.addPolygon(latlngs, true, true);
          }
        } else {
          // poly wasn't split: reset latlngs
          poly.setLatLngs(this.getLatLngsFromJSON(diff));
        }
      }
      //Hvis det er et punkt, slett det hvis den ligger innenfor der man tegnet for å slette
      else {
        // console.log(siblingjson.geometry.coordinates[0].length);
        if (siblingjson.geometry.coordinates[0].length == null) {
          if (turf.intersect(newJson, siblingjson)) {
            polys.removeLayer(poly);
          }
        } else {
          poly.setLatLngs(this.getLatLngsFromJSON(diff));
        }
        return;
      }
    });
  }

  getSimplified(latLngs: L.Latlng[]): L.Latlng[] {
    var latlngs = latLngs || [],
      points,
      simplified,
      tolerance = this.simplify_tolerance;

    if (latlngs.length && tolerance) {
      points = latlngs.map(function(a) {
        return { x: a.lat, y: a.lng };
      });

      simplified = L.LineUtil.simplify(points, tolerance);

      latlngs = simplified.map(function(a) {
        return { lat: a.x, lng: a.y };
      });
    }
    return latlngs;
  }

  setDrawMode(mode: DrawMode) {
    this.drawModeSubject.next(mode);
    if (!!this.map) {
      switch (mode) {
        case DrawMode.OFF:
          this.__events(false);
          this.stopDraw();
          this.tracer.setStyle({
            color: ""
          });
          this.map.dragging.enable();
          this.map.doubleClickZoom.enable();
          this.map.scrollWheelZoom.enable();
          break;
        case DrawMode.ADDPOLYGON:
          this.__events(true);
          this.tracer.setStyle({
            color: this.polyLineOptions.color
          });
          this.map.dragging.disable();
          this.map.doubleClickZoom.disable();
          this.map.scrollWheelZoom.disable();
          break;
        case DrawMode.SUBTRACTPOLYGON:
          this.__events(true);
          this.tracer.setStyle({
            color: "#9534f"
          });
          this.map.dragging.disable();
          this.map.doubleClickZoom.disable();
          this.map.scrollWheelZoom.disable();
          break;
        case DrawMode.LOADPOLYGON:
          this.__events(false);
          this.map.dragging.disable();
          this.map.doubleClickZoom.disable();
          this.map.scrollWheelZoom.disable();
          break;
        default:
          this.__events(false);
          this.map.dragging.enable();
          this.map.doubleClickZoom.enable();
          this.map.scrollWheelZoom.enable();
          break;
      }
    }
  }

  resetTracker() {
    this.tracer.setLatLngs([[0, 0]]);
  }
}

enum DrawMode {
  OFF = 0,
  ADDPOLYGON = 1,
  EDITPOLYGON = 2,
  SUBTRACTPOLYGON = 3,
  LOADPOLYGON = 4
}
