import { Injectable } from "@angular/core";
import * as L from "leaflet";
import * as turf from "@turf/turf";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { takeUntil, filter, debounceTime } from "rxjs/operators";
import { Feature, Polygon, MultiPolygon } from "@turf/turf";
import { MapStateService } from "./map-state.service";
import { TurfHelperService } from "./turf-helper.service";
import { PolygonInformationService } from "./polygon-information.service";
import config from './config.json'
import { ILatLng } from "./polygon-helpers";

@Injectable({
  providedIn: "root"
})
export class MapHelperService {
  drawModeSubject: BehaviorSubject<DrawMode> = new BehaviorSubject<DrawMode>(DrawMode.Off);
  drawMode$: Observable<DrawMode> = this.drawModeSubject.asObservable();

  private map: L.Map;

  private mergePolygons: boolean = true;
  private kinks: boolean = false;
  private arrayOfFeatureGroups = [];
  private tracer: L.Polyline = L.polyline([[0, 0]], config.polyLineOptions);
  private divIcon = L.divIcon({ className: "polygon-marker" });

  private readonly polygonDrawStates = null;
  private ngUnsubscribe = new Subject();

  constructor(private mapState: MapStateService, private turfHelper: TurfHelperService, private polygonInformation: PolygonInformationService) {
    this.mapState.map$.pipe(filter(m => m !== null)).subscribe((map: L.Map) => {
      this.map = map;
      this.initPolyDraw();
    });
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
          this.polygonInformation.deleteTrashcan(polygon);
          this.polygonInformation.updatePolygons();
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
    this.polygonInformation.deletePolygonInformationStorage();
    // this.polygonDrawStates.reset();
    this.polygonInformation.updatePolygons();
  }

  getDrawMode(): DrawMode {
    //console.log("getDrawMode", null);
    return this.drawModeSubject.value;
  }

  addAutoPolygon(geographicBorders: L.LatLng[][]): void {


    let featureGroup: L.FeatureGroup = new L.FeatureGroup();
    
    let polygon2 = turf.polygon(this.convertToCoords(geographicBorders))
    console.log(polygon2);
    let markers2 =this.getMarkers(this.convertToCoords(geographicBorders))
    console.log(this.convertToCoords(geographicBorders));
    let polygon = this.getPolygon(polygon2);

    featureGroup.addLayer(polygon);
    let markerLatlngs = polygon.getLatLngs()[1];
    console.log(polygon.getLatLngs()[1]);
    this.addMarker(markerLatlngs, featureGroup);
    this.arrayOfFeatureGroups.push(featureGroup);
    
  }

  
  convertToCoords(latlngs: ILatLng[][]){
    let coords = []      
    if(latlngs.length > 1){
      latlngs.forEach(polygon => {
        coords.push(L.GeoJSON.latLngsToCoords(polygon))
      })
    }
    else {
      coords.push(L.GeoJSON.latLngsToCoords(latlngs[0]))
    }
    return coords
  }

  getMarkers(coords){
    let pos = []    
    console.log(coords);
    if(coords.length > 1){
      for(let i = 0; i < coords.length-1; i++){
      
        //Hvis polygon[i+1] ligger inni polygon[i]
        if(turf.booleanContains(turf.polygon([coords[i]]), turf.polygon([coords[i+1]]))){
          pos.push(L.GeoJSON.coordsToLatLngs(coords[i]))
        }
        //Hvis polygon[i] ligger inni polygon[i+1]
        else if(turf.booleanContains(turf.polygon([coords[i+1]]), turf.polygon([coords[i]]))){
          pos.push(L.GeoJSON.coordsToLatLngs(coords[i+1]))
        }
        //Hvis ingen av dem ligger inni hverandre
        else{
          pos.push(L.GeoJSON.coordsToLatLngs(coords[i]))
        }
      }
      //Kun for multipolygoner som ikke ligger inni hverandre, f.eks 0253. Så man får med markerne til det siste, 
      if(!turf.booleanContains(turf.polygon([coords[coords.length-1]]), turf.polygon([coords[coords.length-2]]))){        
          pos.push(L.GeoJSON.coordsToLatLngs(coords[coords.length-1]))
      }
    }
    else{      
      pos.push(L.GeoJSON.coordsToLatLngs(coords[0]))
    }
    console.log("pos",pos)
    return pos
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
    this.polygonInformation.deletePolygonInformationStorage();
    //console.log("------------------------------Delete trashcans", null);
    let geoPos: Feature<Polygon | MultiPolygon> = this.turfHelper.turfConcaveman(this.tracer.toGeoJSON() as any);
    this.stopDraw();
    switch (this.getDrawMode()) {
      case DrawMode.AddPolygon:
        this.addPolygon(geoPos, false, true);
        break;

      default:
        break;
    }
    // this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
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

    const latLngs = simplify ? this.turfHelper.getSimplified(latlngs) : latlngs;
    let polygon = this.getPolygon(latlngs);
    console.log(polygon);
    featureGroup.addLayer(polygon);
    
    let markerLatlngs = polygon.getLatLngs();
    console.log(markerLatlngs);
    if(markerLatlngs.length > 1){
    this.addMarker(markerLatlngs, featureGroup);
  }
  else {
    console.log(markerLatlngs[0].length);
    if(markerLatlngs[0].length > 1){
    this.addMarker(markerLatlngs[0], featureGroup);
  }
  else{
    this.addMarker(markerLatlngs[0][0], featureGroup);
  }
  }
    this.arrayOfFeatureGroups.push(featureGroup);
    this.setDrawMode(DrawMode.Off);

    featureGroup.on('click', e => {
      this.polygonClicked(e, latLngs);
    });
  }

  private polygonClicked(e: L.MouseEvent, poly: Feature<Polygon | MultiPolygon>) {
    
    const newPoint = e.latlng;
    let idx = -1;
    let idx2 = -1;
    let tmpDistance = Number.MAX_SAFE_INTEGER;
    if (poly.geometry.type === "Polygon") {
      poly.geometry.coordinates[0].forEach((v, i) => {
        const distance = turf.distance([newPoint.lng, newPoint.lat], v);
        if (tmpDistance >= distance) {
          idx = i;
          tmpDistance = distance;
        }
      })
      const l = turf.distance([newPoint.lng, newPoint.lat], poly.geometry.coordinates[0][idx === 0 ? poly.geometry.coordinates[0].length : idx - 1]);
      const r = turf.distance([newPoint.lng, newPoint.lat], poly.geometry.coordinates[0][idx === poly.geometry.coordinates[0].length ? 0 : idx + 1]);

      idx2 = l > r ? (idx === 0 ? poly.geometry.coordinates[0].length : idx - 1) : (idx === poly.geometry.coordinates[0].length ? 0 : idx + 1);

      const injectIdx = idx < idx2 ? idx : idx2;

      poly.geometry.coordinates[0].splice((injectIdx), 0, [newPoint.lng, newPoint.lat]);

    }

    console.log("idx", idx, idx2);
    console.log("User clicked a polygon");
    console.log("check append-flag")
    console.log("if yes")
    console.log("find nearest edge marker")
    console.log("compare the markers next to the nearest which are the closest")
    console.log("append the new point from e")
    console.log("update / delete recreate the polygon with the new point.")
    console.log("event", e);
    console.log("polygon", poly);
  }

  private getPolygon(latlngs) {   
    console.log(latlngs);
    let polygon = L.GeoJSON.geometryToLayer(latlngs);
    
    polygon.setStyle(config.polygonOptions);
    return polygon;
  }

  private merge(latlngs: Feature<Polygon | MultiPolygon>) {
    console.log(latlngs);
    let polygonLength = [];
    const newArray: L.FeatureGroup[] = [];
    let polyIntersection: boolean = false;
    this.arrayOfFeatureGroups.forEach(featureGroup => {
      let featureCollection = featureGroup.toGeoJSON();
      
      let feature = this.turfHelper.getTurfPolygon(featureCollection.features[0].geometry.coordinates);
      console.log("Feature: ", feature);
      if(!turf.booleanEqual(feature,latlngs)){
      polyIntersection = this.turfHelper.polygonIntersect(feature, latlngs);
      if (polyIntersection) {
        console.log("New: ",featureGroup.toGeoJSON());
        newArray.push(featureGroup);
      }}
    });
    console.log(newArray);
    if(newArray.length > 0){
    this.unionPolygons(newArray, latlngs);}
  }

  private events(onoff: boolean) {

    const onoroff = onoff ? "on" : "off";

    this.map[onoroff]("mousedown", this.mouseDown, this);

  }

  private addMarker(latlngs, FeatureGroup: L.FeatureGroup) {
    console.log("AddMarker: ", latlngs);
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
    let arrays =layerLength[0].getLatLngs() 
    console.log(FeatureGroup.toGeoJSON().features[0]);
    for (let index = 1; index < layerLength.length; index++) {
      newPos.push(layerLength[index].getLatLng());
    }
    arrays[arrays.length-1] = newPos;
    layerLength[0].setLatLngs(arrays);
  }

  private markerDragEnd(FeatureGroup) {
    let featureCollection = FeatureGroup.toGeoJSON();
    
    let feature = this.turfHelper.getTurfPolygon([featureCollection.features[0].geometry.coordinates]);
    console.log("DragEnd ",FeatureGroup);
    if (this.turfHelper.hasKinks(feature)) {
      this.kinks = true;
      let unkink = this.turfHelper.getKinks(feature);
      console.log("unkink: ", unkink);
      this.deletePolygon(this.getLatLngsFromJson(feature));

      unkink.forEach(polygon => {
        this.addPolygon(polygon, true);
      });
    } else {
      this.kinks = false;
      this.addPolygon(feature, false);
    }

    // this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
  }

  private getLatLngsFromJson(feature) {
    console.log(feature.geometry.coordinates[0].length);
    let coord
    if(feature.geometry.coordinates[0].length>1){
     coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);}
    else {
     coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
    }

    return coord;
  }


  private unionPolygons(layers, latlngs: Feature<Polygon | MultiPolygon>) {
    console.log("unionPolygons", layers, latlngs);

    let addNew = latlngs;

    layers.forEach(featureGroup => {
      let featureCollection = featureGroup.toGeoJSON()
      console.log(featureGroup.toGeoJSON());
      const layer = featureCollection.features[0];
      const geoLayer = featureCollection.features[0];
      let poly = this.getLatLngsFromJson(layer);
      console.log(geoLayer);
      let arrayOfPolys = []
      // poly.push(layer.getLatLngs()[0][0]);
      console.log(poly);
      console.log(layer);
      geoLayer.geometry.coordinates.forEach(element => {
        arrayOfPolys.push([element])
      });
      console.log(arrayOfPolys);
      const union = this.turfHelper.union(addNew, geoLayer);
      console.log(union);
      this.deletePolygonOnMerge(poly);
      this.deletePolygon(this.getLatLngsFromJson(latlngs));

      addNew = union;
    });

    const newLatlngs: Feature<Polygon | MultiPolygon> = addNew;
    console.log(newLatlngs);
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
    console.log("removeFeatureGroupOnMerge", featureGroup);

    let newArray = [];
    if (featureGroup.getLayers()[0]) {
      let polygon = featureGroup.getLayers()[0].getLatLngs()[0];
      
      /* if (!polygon[0][0].equals(polygon[0][polygon.length - 1])) {
        polygon[0].push(polygon[0][0]);
      } */
      console.log(this.polygonInformation.polygonInformationStorage);
      this.polygonInformation.polygonInformationStorage.forEach(v => {
        console.log(v.polygon);
        console.log(polygon[0]);
        if (v.polygon.toString() !== polygon[0].toString() && v.polygon[0].toString() === polygon[0][0].toString()) {
          v.polygon = polygon;
          newArray.push(v);
        }

        if (v.polygon.toString() !== polygon[0].toString() && v.polygon[0].toString() !== polygon[0][0].toString()) {
          newArray.push(v);
        }
      });
      console.log(this.polygonInformation.polygonInformationStorage);
      console.log(newArray);
    featureGroup.clearLayers();
    console.log(this.arrayOfFeatureGroups);
    this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(featureGroups => featureGroups !== featureGroup);
    console.log(this.arrayOfFeatureGroups);
    this.arrayOfFeatureGroups.forEach(featureGroups => {
      if(featureGroups === featureGroup){
        console.log(featureGroup);
      this.map.removeLayer(featureGroups);
    }
    });
    // this.map.removeLayer(featureGroup);
    }
    
  }

  private deletePolygonOnMerge(polygon) {
    console.log("deletePolygonOnMerge", polygon);

    if (this.arrayOfFeatureGroups.length > 0) {
      this.arrayOfFeatureGroups.forEach(featureGroup => {
        let layer = featureGroup.getLayers()[0];
        let latlngs = layer._latlngs[0];
        console.log(latlngs);
        if (latlngs[0][0] !== latlngs[0][latlngs[0].length - 1]) {
          latlngs[0].push(latlngs[0][0]);
        }
        console.log(latlngs);
        const equals = this.polygonArrayEqualsMerge(latlngs, polygon);

        if (equals) {
          console.log("EQUALS", polygon);
          this.removeFeatureGroupOnMerge(featureGroup);
          
          this.polygonInformation.deleteTrashcan(polygon);
          // this.updatePolygons();
        }
      });
    }
  }

  //TODO - legge et annet sted
  private polygonArrayEqualsMerge(poly1: any[], poly2: any[]) {
    console.log("polygonArrayEqualsMerge", poly1, poly2);

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
            color: config.polyLineOptions.color
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

    this.polygonInformation.saveCurrentState();
  }

  freedrawMenuClick(): void {
    //console.log("freedrawMenuClick");

    this.setDrawMode(DrawMode.AddPolygon);
    this.polygonInformation.saveCurrentState();
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
