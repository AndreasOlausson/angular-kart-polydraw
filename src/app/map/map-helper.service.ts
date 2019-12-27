import { Injectable } from "@angular/core";
import * as L from "leaflet";
import * as turf from "@turf/turf";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { takeUntil, filter, debounceTime } from "rxjs/operators";
import { Feature, Polygon, MultiPolygon } from "@turf/turf";
import { MapStateService } from "./map-state.service";
import { TurfHelperService } from "./turf-helper.service";

@Injectable({
  providedIn: "root"
})
export class MapHelperService {
  drawModeSubject: BehaviorSubject<DrawMode> = new BehaviorSubject<DrawMode>(DrawMode.Off);
  drawMode$: Observable<DrawMode> = this.drawModeSubject.asObservable();

  private map: L.Map;

  //TODO Typings
  private polyLineOptions = {
    color: "#50622b",
    opacity: 1,
    smoothFactor: 0,
    noClip: true,
    clickable: false,
    weight: 2
  };
  //TODO Typings
  private polygonOptions = {
    smoothFactor: 0.3,
    color: "#50622b",
    fillColor: "#b4cd8a",
    // fillOpacity: 0.3,
    noClip: true
  };

  private mergePolygons: boolean = true;
  private kinks: boolean = false;
  private arrayOfFeatureGroups = [];
  private test = []
  private polygonInformationStorage = [];
  private tracer: L.Polyline = L.polyline([[0, 0]], this.polyLineOptions);
  private divIcon = L.divIcon({ className: "polygon-marker" });

  private readonly minimumFreeDrawZoomLevel: number = 12;
  private readonly polygonDrawStates = null;
  private ngUnsubscribe = new Subject();

  constructor(private mapState: MapStateService, private turfHelper: TurfHelperService) {
    this.mapState.map$.pipe(filter(m => m !== null)).subscribe((map: L.Map) => {
      this.map = map;
      this.initPolyDraw();
    });
  }

  deletePolygonInformationStorage() {
    this.polygonInformationStorage = [];
  }
  createPolygonInformationStorage() {
    if (this.arrayOfFeatureGroups.length > 0) {
      this.arrayOfFeatureGroups.forEach(featureGroup => {});
      this.updatePolygons();
    }
  }
  closeAndReset(): void {
    //console.log("closeAndReset");
    this.setDrawMode(DrawMode.Off);
    this.removeAllFeatureGroups();
  }
  deletePolygon(polygon) {
    if (this.arrayOfFeatureGroups.length > 0) {
      this.arrayOfFeatureGroups.forEach(featureGroup => {
        let layer = featureGroup.getLayers()[0];
        let latlngs = layer._latlngs[0];
        if (latlngs[0] !== latlngs[latlngs.length - 1]) {
          latlngs.push(latlngs[0]);
        }
        const equals = this.polygonArrayEquals(latlngs, polygon);

        if (equals) {
          this.removeFeatureGroup(featureGroup);
          this.deleteTrashcan(polygon);
          this.updatePolygons();
        }
      });
    }
  }

  removeAllFeatureGroups() {
    //console.log("removeAllFeatureGroups", null);
    this.arrayOfFeatureGroups.forEach(featureGroups => {
      this.map.removeLayer(featureGroups);
    });

    this.arrayOfFeatureGroups = [];
    this.polygonInformationStorage = [];
    // this.polygonDrawStates.reset();
    this.updatePolygons();
  }

  getDrawMode(): DrawMode {
    //console.log("getDrawMode", null);
    return this.drawModeSubject.value;
  }

  addAutoPolygon(geographicBorders: L.LatLng[][]): void {
    //console.log("addAutoPolygon", geographicBorders);
    this.removeAllFeatureGroups();
    const polygons = [];
    const hulls = [];
    let intersection;
    geographicBorders.forEach(p => {
      const pl = L.polyline(p);
      const geo = pl.toGeoJSON() as any;
      polygons.push(geo.geometry.coordinates);
    });

    if (polygons.length > 1) {
      for (let i = 0; i < polygons.length - 1; i++) {
        intersection = turf.intersect(this.turfHelper.getTurfPolygon([polygons[i]]), this.turfHelper.getTurfPolygon([polygons[i + 1]]));
        var difference = turf.difference(this.turfHelper.getTurfPolygon([polygons[i]]), this.turfHelper.getTurfPolygon([polygons[i + 1]]));
        hulls.push(intersection);
      }
    }

    if (intersection !== null) {
      let featuresJoined = polygons[0];
      if (polygons.length > 1) {
        if (featuresJoined.geometry.type === "MultiPolygon") {
          featuresJoined.geometry.coordinates.forEach(element => {
            const poly = this.turfHelper.getTurfPolygon(element);
            this.addPolygon(poly, false, true);
          });
        } else {
          this.addPolygon(featuresJoined, false, false);
        }
      } else {
        const poly = this.turfHelper.getTurfPolygon([polygons[0]]);
        this.addPolygon(poly, false, true);
      }
    } else {
      geographicBorders.forEach(p => {
        const pl = L.polyline(p);
        const geo = pl.toGeoJSON() as any;
        const poly = this.turfHelper.getTurfPolygon([geo.geometry.coordinates]);
        this.addPolygon(poly, false, true);
      });
    }
    this.createPolygonInformationStorage();
    // this.polygonDrawStates.activate();
    // this.polygonDrawStates.setMoveMode();
  }

  initPolyDraw() {
    //console.log("initPolyDraw", null);

    const container: HTMLElement = this.map.getContainer();

    container.addEventListener("touchstart", e => {
      if (this.getDrawMode() !== DrawMode.Off) {
        this.mouseDown(e);
      }
    });

    container.addEventListener("touchend", e => {
      if (this.getDrawMode() !== DrawMode.Off) {
        this.mouseUpLeave();
      }
    });

    container.addEventListener("touchmove", e => {
      if (this.getDrawMode() !== DrawMode.Off) {
        this.mouseMove(e);
      }
    });
    this.map.addLayer(this.tracer);
    this.setDrawMode(DrawMode.Off);
  }

  private mouseDown(event) {
    console.log("mouseDown", event);

    if (event.originalEvent != null) {
      this.tracer.setLatLngs([event.latlng]);
    } else {
      const latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
      this.tracer.setLatLngs([latlng]);
    }
    this.startDraw();
  }

  //TODO event type, create containerPointToLatLng-method
  private mouseMove(event) {
    //console.log("mouseMove", event);

    if (event.originalEvent != null) {
      this.tracer.addLatLng(event.latlng);
    } else {
      const latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
      this.tracer.addLatLng(latlng);
    }
  }

  private mouseUpLeave() {
    //console.log("mouseUpLeave", null);
    this.deletePolygonInformationStorage();
    //console.log("------------------------------Delete trashcans", null);
    let geoPos: Feature<Polygon | MultiPolygon> = this.turfHelper.turfConcaveman(turf.explode(this.tracer.toGeoJSON() as any));
    // let geoPos: Feature<Polygon | MultiPolygon> = turf.lineStringToPolygon(this.tracer.toGeoJSON())
    this.stopDraw();
    switch (this.getDrawMode()) {
      case DrawMode.AddPolygon:
        this.addPolygon(geoPos, true);
        break;

      default:
        break;
    }
    // this.createPolygonInformationStorage();
    //console.log("------------------------------create trashcans", null);
  }

  private startDraw() {
    //console.log("startDraw", null);

    this.drawStartedEvents(true);
  }

  private stopDraw() {
    //console.log("stopDraw", null);

    this.resetTracker();
    this.drawStartedEvents(false);
  }

  private drawStartedEvents(onoff: boolean) {
    //console.log("drawStartedEvents", onoff);

    const onoroff = onoff ? "on" : "off";

    this.map[onoroff]("mousemove", this.mouseMove, this);
    this.map[onoroff]("mouseup", this.mouseUpLeave, this);
  }

  private addPolygon(latlngs: Feature<Polygon | MultiPolygon>, simplify: boolean, noMerge: boolean = false) {
    console.log("addPolygon", latlngs, simplify, noMerge, this.kinks);
    
    if (this.mergePolygons && !noMerge && this.arrayOfFeatureGroups.length > 0 && !this.kinks) {
      this.merge(latlngs);
    } else {
      this.addPolygonLayer(latlngs, simplify);
    }
  }

  private addPolygonLayer(latlngs: Feature<Polygon | MultiPolygon>, simplify: boolean) {
    console.log("addPolygonLayer", latlngs, simplify);
    let featureGroup: L.FeatureGroup = new L.FeatureGroup();
    let polygon;
    const latLngs = simplify ? this.turfHelper.getSimplified(latlngs) : latlngs;
    polygon = this.getPolygon(latLngs);
    
    
    featureGroup.addLayer(polygon);
    let markerLatlngs = polygon.getLatLngs()[0];        
        
      this.addMarker(markerLatlngs, featureGroup);
      this.arrayOfFeatureGroups.push(featureGroup);
    this.test.push(featureGroup);
    console.log(this.arrayOfFeatureGroups);
    this.setDrawMode(DrawMode.Off);
  }

  private getPolygon(latlngs) {
    console.log("getPolygon", latlngs);

    let polygon;
    polygon = L.GeoJSON.geometryToLayer(latlngs);
    polygon.setStyle(this.polygonOptions).addTo(this.map);
    return polygon;
  }

  private merge(latlngs: Feature<Polygon | MultiPolygon>) {

    let polygonLength = [];
    const newArray: L.FeatureGroup[] = [];
    let polyIntersection: boolean = false;
    this.arrayOfFeatureGroups.forEach(featureGroup => {
      polygonLength = featureGroup.getLayers();
      console.log(polygonLength[0]);
      polyIntersection = this.polygonIntersect(polygonLength[0], latlngs);
      if (polyIntersection) {
        newArray.push(featureGroup);
      }
    });
    this.unionPolygons(newArray, latlngs);
  }

  private updatePolygons() {
    console.log("updatePolygons");

    let polygons = null;

    if (this.polygonInformationStorage.length > 0) {
      polygons = [];
      this.polygonInformationStorage.forEach(v => {
        if (v.polygon[0].toString() !== v.polygon[v.polygon.length - 1].toString()) {
          v.polygon.push(v.polygon[0]);
        }
        polygons.push(v.polygon);
      });

    } 

    this.saveCurrentState();
  }

  private onZoomChange(zoomLevel: number): void {
    //console.log("onZoomChange", zoomLevel);

    if (zoomLevel >= this.minimumFreeDrawZoomLevel) {
      this.polygonDrawStates.canUsePolyDraw = true;
    } else {
      this.polygonDrawStates.canUsePolyDraw = false;
      this.polygonDrawStates.setMoveMode();
    }
    this.saveCurrentState();
  }
  private events(onoff: boolean) {
    //console.log("events", onoff);

    const onoroff = onoff ? "on" : "off";

    this.map[onoroff]("mousedown", this.mouseDown, this);
  }

  private addMarker(latlngs, FeatureGroup: L.FeatureGroup) {

    latlngs.forEach(latlng => {
      
      const marker = new L.Marker(latlng, { icon: this.divIcon, draggable: true });
      
      FeatureGroup.addLayer(marker).addTo(this.map);
      marker.on("drag", e => {
        this.markerDrag(FeatureGroup);
      });
      marker.on("dragend", e => {
        this.markerDragEnd(FeatureGroup);
      });
    });
  }

  private markerDrag(FeatureGroup) {
    const newPos = [];
    const layerLength = FeatureGroup.getLayers();
    for (let index = 1; index < layerLength.length; index++) {
      newPos.push(layerLength[index].getLatLng());
    }
    layerLength[0].setLatLngs(newPos);
  }

  private markerDragEnd(FeatureGroup) {
    // this.deletePolygonInformationStorage();
    //console.log("------------------------------------delete trashcans", null);
    let featureCollection = FeatureGroup.toGeoJSON();
    let feature = featureCollection.features[0];
    let kinks = turf.kinks(feature);
    
    if (kinks.features.length > 0) {
        this.kinks = true;
        let unkink= this.turfHelper.getKinks(feature);
        console.log("unkink: ",unkink);
      this.deletePolygon(this.getLatLngsFromJson(feature));
    //   this.removeFeatureGroup(FeatureGroup)
      unkink.forEach(polygon => {
        this.addPolygon(polygon, false); 
      })
    //   this.addPolygon(unkink, false);
    } else {
        this.kinks = false;
        // this.removeFeatureGroup(FeatureGroup)
      this.addPolygon(feature, false);
    }
    // this.createPolygonInformationStorage();
    //console.log("------------------------------------create trashcans", null);
  }

  private getLatLngsFromJson(feature) {
    //console.log("getLatLngsFromJson", feature);

    let coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0]);

    return coord;
  }

  private polygonIntersect(polygon, latlngs: Feature<Polygon | MultiPolygon>): boolean {
    //console.log("polygonIntersect", polygon, latlngs);

    const oldPolygon = polygon.toGeoJSON();
    let poly;

    if (latlngs.geometry.type === "Polygon") {
      poly = latlngs;
    }
    const intersect = turf.intersect(poly, oldPolygon);
    return !!intersect;
  }

  private unionPolygons(layers, latlngs: Feature<Polygon | MultiPolygon>) {
    //console.log("unionPolygons", layers, latlngs);

    let addNew = latlngs;

    layers.forEach(featureGroup => {
      const layer = featureGroup.getLayers()[0];
      const geoLayer = layer.toGeoJSON();
      let poly = layer.getLatLngs()[0];
      poly.push(layer.getLatLngs()[0][0]);
      const union = this.turfHelper.union(addNew, geoLayer);

      this.deletePolygonOnMerge(poly);

      addNew = union;
    });

    const newLatlngs: Feature<Polygon | MultiPolygon> = addNew;
    this.addPolygonLayer(newLatlngs, true);
  }

  private removeFeatureGroup(featureGroup) {
    console.log("removeFeatureGroup", featureGroup);

    featureGroup.clearLayers();
    this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(featureGroups => featureGroups !== featureGroup);
    // this.updatePolygons();
    this.map.removeLayer(featureGroup);
  }

  private removeFeatureGroupOnMerge(featureGroup) {
    //console.log("removeFeatureGroupOnMerge", featureGroup);

    let newArray = [];
    if (featureGroup.getLayers()[0]) {
      let polygon = featureGroup.getLayers()[0].getLatLngs()[0];
      if (!polygon[0].equals(polygon[polygon.length - 1])) {
        polygon.push(polygon[0]);
      }

      this.polygonInformationStorage.forEach(v => {
        //console.log("v", v);
        //console.log("p", polygon);

        if (v.polygon.toString() !== polygon.toString() && v.polygon[0].toString() === polygon[0].toString()) {
          v.polygon = polygon;
          //console.log("ULIKE, men første er lik: ", v);
          newArray.push(v);
        }

        if (v.polygon.toString() !== polygon.toString() && v.polygon[0].toString() !== polygon[0].toString()) {
          newArray.push(v);
        }
      });
      //console.log("New PolygonInfo Array: ", newArray);
      /////this.polygonInformationStorage = newArray;
    }
    featureGroup.clearLayers();
    this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(featureGroups => featureGroups !== featureGroup);
    // this.updatePolygons();
    this.map.removeLayer(featureGroup);
  }

  private deleteTrashcan(polygon) {
    //console.log("deleteTrashcan", polygon);

    const idx = this.polygonInformationStorage.findIndex(v => v.polygon === polygon);
    this.polygonInformationStorage.splice(idx, 1);
  }

  private deletePolygonOnMerge(polygon) {
    //console.log("deletePolygonOnMerge", polygon);

    if (this.arrayOfFeatureGroups.length > 0) {
      this.arrayOfFeatureGroups.forEach(featureGroup => {
        let layer = featureGroup.getLayers()[0];
        let latlngs = layer._latlngs[0];

        if (latlngs[0] !== latlngs[latlngs.length - 1]) {
          latlngs.push(latlngs[0]);
        }

        const equals = this.polygonArrayEqualsMerge(latlngs, polygon);

        if (equals) {
          //console.log("EQUALS");
          this.removeFeatureGroupOnMerge(featureGroup);
          this.deleteTrashcan(polygon);
          // this.updatePolygons();
        }
      });
    }
  }

  private polygonArrayEqualsMerge(poly1: any[], poly2: any[]) {
    //console.log("polygonArrayEqualsMerge", poly1, poly2);

    return poly1.toString() === poly2.toString();
  }

  private polygonArrayEquals(poly1: any[], poly2: any[]) {
    //console.log("polygonArrayEquals", poly1, poly2);

    if (poly1.length !== poly2.length) return false;
    if (!poly1[0].equals(poly2[0])) return false;
    else {
      return true;
    }
  }

  private saveCurrentState(): void {
    console.log("saveCurrentState");
  }

  private setLeafletMapEvents(enableDragging: boolean, enableDoubleClickZoom: boolean, enableScrollWheelZoom: boolean) {
    //console.log("setLeafletMapEvents", enableDragging, enableDoubleClickZoom, enableScrollWheelZoom);

    enableDragging ? this.map.dragging.enable() : this.map.dragging.disable();
    enableDoubleClickZoom ? this.map.doubleClickZoom.enable() : this.map.doubleClickZoom.disable();
    enableScrollWheelZoom ? this.map.scrollWheelZoom.enable() : this.map.scrollWheelZoom.disable();
  }

  setDrawMode(mode: DrawMode) {
    console.log("setDrawMode", this.map);

    this.drawModeSubject.next(mode);
    if (!!this.map) {
      let isActiveDrawMode = true;
      switch (mode) {
        case DrawMode.Off:
          L.DomUtil.removeClass(this.map.getContainer(), "crosshair-cursor-enabled");
          this.events(false);
          this.stopDraw();
          this.tracer.setStyle({
            color: ""
          });
          this.setLeafletMapEvents(true, true, true);
          isActiveDrawMode = false;
          break;
        case DrawMode.AddPolygon:
          L.DomUtil.addClass(this.map.getContainer(), "crosshair-cursor-enabled");
          this.events(true);
          this.tracer.setStyle({
            color: this.polyLineOptions.color
          });
          this.setLeafletMapEvents(false, false, false);
          break;
        case DrawMode.SubtractPolygon:
          L.DomUtil.addClass(this.map.getContainer(), "crosshair-cursor-enabled");
          this.events(true);
          this.tracer.setStyle({
            color: "#9534f"
          });
          this.setLeafletMapEvents(false, false, false);
          break;
      }

      /*     if (isActiveDrawMode) {
                this.polygonDrawStates.setFreeDrawMode();
            } else {
                this.polygonDrawStates.setMoveMode();
            } */
    }
  }

  drawModeClick(): void {
    //console.log("drawModeClick");

    this.setDrawMode(DrawMode.AddPolygon);

    this.saveCurrentState();
  }

  freedrawMenuClick(): void {
    //console.log("freedrawMenuClick");

    this.setDrawMode(DrawMode.AddPolygon);
    this.saveCurrentState();
  }

  resetTracker() {
    //console.log("resetTracker");

    this.tracer.setLatLngs([[0, 0]]);
  }
}

export enum DrawMode {
  Off = 0,
  AddPolygon = 1,
  EditPolygon = 2,
  SubtractPolygon = 3,
  LoadPolygon = 4
}
