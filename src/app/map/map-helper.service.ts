import { Injectable, Optional } from "@angular/core";
import * as L from "leaflet";
//import * as turf from "@turf/turf";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { Feature, Polygon, MultiPolygon } from "@turf/turf";
import { MapStateService } from "./map-state.service";
import { TurfHelperService } from "./turf-helper.service";
import { PolygonInformationService } from "./polygon-information.service";
import defaultConfig from './config.json'
import { ILatLng } from "./polygon-helpers";

@Injectable({
  providedIn: "root"
})
//Rename - PolyDrawService
export class MapHelperService {
  //DrawModes, determine UI buttons etc...
  drawModeSubject: BehaviorSubject<DrawMode> = new BehaviorSubject<DrawMode>(DrawMode.Off);
  drawMode$: Observable<DrawMode> = this.drawModeSubject.asObservable();


  private map: L.Map;

  private mergePolygons: boolean;
  private kinks: boolean;
  //add to config
  private arrayOfFeatureGroups: L.FeatureGroup<L.Layer>[] = [];
  private tracer: L.Polyline = {};
  private readonly polygonDrawStates = null;
  //end add to config

  private ngUnsubscribe = new Subject();
  private config: typeof defaultConfig = null;

  constructor(private mapState: MapStateService,
    private turfHelper: TurfHelperService,
    private polygonInformation: PolygonInformationService) {
    this.mapState.map$.pipe(filter(m => m !== null)).subscribe((map: L.Map) => {
      this.map = map;
      console.log("pre this.config", this.config);
      this.config = defaultConfig;
      console.log("this.config", this.config);
      this.configurate({});
      console.log("after this.config", this.config);
      this.tracer = L.polyline([[0, 0]], this.config.polyLineOptions);

      this.initPolyDraw();
    });

    //TODO - lage en config observable i mapState og oppdater this.config med den
  }
  //new
  configurate(config: Object): void {
    //TODO if config is path...
    this.config = { ...defaultConfig, ...config };

    this.mergePolygons = this.config.mergePolygons;
    this.kinks = this.config.kinks;
  }

  //fine
  closeAndReset(): void {
    //console.log("closeAndReset");
    this.setDrawMode(DrawMode.Off);
    this.removeAllFeatureGroups();
  }

  //make readable
  deletePolygon(polygon) {
    console.log("deletePolygon: ", polygon);
    if (this.arrayOfFeatureGroups.length > 0) {
      this.arrayOfFeatureGroups.forEach(featureGroup => {
        let layer = featureGroup.getLayers()[0];
        let latlngs = layer._latlngs[0]; //TODO - create private getLeafletPolygon(featureGroup): ILatLng[][][]
        let polygon2;
        if (latlngs[0][0]) {
          if (latlngs[0][0] !== latlngs[0][latlngs[0].length - 1]) {
            latlngs[0].push(latlngs[0][0]);
          }
          polygon2 = latlngs[0]
        } else {
          if (latlngs[0] !== latlngs[latlngs[0].length - 1]) {
            latlngs.push(latlngs[0]);
          }
          polygon2 = latlngs
        }
        //New function stops

        console.log(latlngs);

        const equals = this.polygonArrayEquals(polygon2, polygon); //Se om man kan bruke turf sine innebygde funksjoner

        if (equals) {
          console.log("Remove from map:", featureGroup, latlngs);
          this.removeFeatureGroup(featureGroup);
          this.polygonInformation.deleteTrashcan(polygon);
          this.polygonInformation.updatePolygons();
        }
      });
    }
  }
  //fine
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
  //fine
  getDrawMode(): DrawMode {
    //console.log("getDrawMode", null);
    return this.drawModeSubject.value;
  }
  //check this
  addAutoPolygon(geographicBorders: L.LatLng[][]): void {
    let featureGroup: L.FeatureGroup = new L.FeatureGroup();

    let polygon2 = this.turfHelper.getMultiPolygon(this.convertToCoords(geographicBorders));
    console.log(polygon2);
    let polygon = this.getPolygon(polygon2);

    featureGroup.addLayer(polygon);
    let markerLatlngs = polygon.getLatLngs();
    console.log("markers: ", markerLatlngs);
    markerLatlngs.forEach(polygon => {
      this.addMarker(polygon[0], featureGroup);
    });

    this.arrayOfFeatureGroups.push(featureGroup);
  }

  //innehåll i if'ar flytta till egna metoder
  private convertToCoords(latlngs: ILatLng[][]) {
    let coords = []
    console.log(latlngs.length);
    if (latlngs.length > 1 && latlngs.length < 3) {
      let coordinates = []
      let within = this.turfHelper.isWithin(L.GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), L.GeoJSON.latLngsToCoords(latlngs[0]))
      if (within) {
        latlngs.forEach(polygon => {
          coordinates.push(L.GeoJSON.latLngsToCoords(polygon))
        })
      } else {
        latlngs.forEach(polygon => {
          coordinates.push([L.GeoJSON.latLngsToCoords(polygon)])
        })
      }
      coords.push(coordinates)
      console.log("Within1 ", within);

    }
    else if (latlngs.length > 2) {
      let coordinates = []
      for (let index = 1; index < latlngs.length - 1; index++) {
        let within = this.turfHelper.isWithin(L.GeoJSON.latLngsToCoords(latlngs[index]), L.GeoJSON.latLngsToCoords(latlngs[0]))
        if (within) {
          latlngs.forEach(polygon => {
            coordinates.push(L.GeoJSON.latLngsToCoords(polygon))
          })
          coords.push(coordinates)
        } else {
          latlngs.forEach(polygon => {
            coords.push([L.GeoJSON.latLngsToCoords(polygon)])
          })
        }
      }
    }
    else {
      coords.push(L.GeoJSON.latLngsToCoords(latlngs[0]))
    }
    console.log(coords);
    return coords
  }

  //fine
  private initPolyDraw() {
    //console.log("initPolyDraw", null);

    const container: HTMLElement = this.map.getContainer();
    const drawMode = this.getDrawMode();
    if (this.config.touchSupport) {
      container.addEventListener("touchstart", e => {
        if (drawMode !== DrawMode.Off) {
          this.mouseDown(e);
        }
      });

      container.addEventListener("touchend", e => {
        if (drawMode !== DrawMode.Off) {
          this.mouseUpLeave();
        }
      });

      container.addEventListener("touchmove", e => {
        if (drawMode !== DrawMode.Off) {
          this.mouseMove(e);
        }
      });
    }

    this.map.addLayer(this.tracer);
    this.setDrawMode(DrawMode.Off);
  }
  //Test L.MouseEvent
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

  //fine
  private mouseUpLeave() {
    //console.log("mouseUpLeave", null);
    this.polygonInformation.deletePolygonInformationStorage();
    //console.log("------------------------------Delete trashcans", null);
    let geoPos: Feature<Polygon | MultiPolygon> = this.turfHelper.turfConcaveman(this.tracer.toGeoJSON() as any);
    this.stopDraw();
    switch (this.getDrawMode()) {
      case DrawMode.AddPolygon:
        this.addPolygon(geoPos, true, true);
        break;
      case DrawMode.SubtractPolygon:
        this.subtractPolygon(geoPos);
        break;

      default:
        break;
    }
    // this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
    //console.log("------------------------------create trashcans", null);
  }
  //fine
  private startDraw() {
    //console.log("startDraw", null);

    this.drawStartedEvents(true);
  }
  //fine
  private stopDraw() {
    //console.log("stopDraw", null);

    this.resetTracker();
    this.drawStartedEvents(false);
  }
  //fine
  private drawStartedEvents(onoff: boolean) {
    //console.log("drawStartedEvents", onoff);

    const onoroff = onoff ? "on" : "off";

    this.map[onoroff]("mousemove", this.mouseMove, this);
    this.map[onoroff]("mouseup", this.mouseUpLeave, this);

  }
  //On hold
  private subtractPolygon(latlngs: Feature<Polygon | MultiPolygon>) {
    this.subtract(latlngs)
  }
  //fine
  private addPolygon(latlngs: Feature<Polygon | MultiPolygon>, simplify: boolean, noMerge: boolean = false) {
    console.log("addPolygon", latlngs, simplify, noMerge, this.kinks, this.config);

    if (this.mergePolygons && !noMerge && this.arrayOfFeatureGroups.length > 0 && !this.kinks) {
      this.merge(latlngs);
    } else {
      this.addPolygonLayer(latlngs, simplify);
    }
  }
  //fine
  private addPolygonLayer(latlngs: Feature<Polygon | MultiPolygon>, simplify: boolean) {

    let featureGroup: L.FeatureGroup = new L.FeatureGroup();

    const latLngs = simplify ? this.turfHelper.getSimplified(latlngs) : latlngs;
    let polygon = this.getPolygon(latLngs);
    featureGroup.addLayer(polygon);
    console.log(polygon.getLatLngs());
    let markerLatlngs = polygon.getLatLngs();
    markerLatlngs.forEach(polygon => {
      this.addMarker(polygon[0], featureGroup);
    });

    this.arrayOfFeatureGroups.push(featureGroup);
    this.setDrawMode(DrawMode.Off);

    featureGroup.on('click', e => {
      this.polygonClicked(e, latLngs);
    });
  }
  //clean up the mess
  private polygonClicked(e: L.MouseEvent, poly: Feature<Polygon | MultiPolygon>) {
    const imutableClone = (JSON.parse(JSON.stringify(poly)));

    //this.getLatLngsFromJson(feature)
    const newPoint = e.latlng;
    let idx = -1;
    let idx2 = -1;
    let tmpDistance = Number.MAX_SAFE_INTEGER;
    if (poly.geometry.type === "MultiPolygon") {
      let newPolygon = this.turfHelper.injectPointToPolygon(poly, [newPoint.lng, newPoint.lat])
      /*     poly.geometry.coordinates[0][0].forEach((v, i) => {
            const distance = this.turfHelper.getDistance([newPoint.lng, newPoint.lat], v);
            if (tmpDistance >= distance) {
              idx = i;
              tmpDistance = distance;
            }
          })
          const l = this.turfHelper.getDistance([newPoint.lng, newPoint.lat], poly.geometry.coordinates[0][0][idx === 0 ? poly.geometry.coordinates[0][0].length : idx - 1]);
          const r = this.turfHelper.getDistance([newPoint.lng, newPoint.lat], poly.geometry.coordinates[0][0][idx === poly.geometry.coordinates[0][0].length ? 0 : idx + 1]);
    
          idx2 = l > r ? (idx === 0 ? poly.geometry.coordinates[0][0].length : idx - 1) : (idx === poly.geometry.coordinates[0][0].length ? 0 : idx + 1);
    
          const injectIdx = idx < idx2 ? idx : idx2;
    
          poly.geometry.coordinates[0][0].splice((injectIdx), 0, [newPoint.lng, newPoint.lat]);
          console.log("before delete orig, new length: ", imutableClone, poly);
          this.deletePolygon(this.getLatLngsFromJson(imutableClone));
           */
      this.deletePolygon(this.getLatLngsFromJson(poly));
      this.addPolygonLayer(newPolygon, false)
    }
    console.log("TODO:");
    console.log("Delete existing polygon");
    console.log("Add new polygon");
    console.log("Update states")
    //this.deletePolygon(originalPolygon._latlngs);

  }
  //fine
  private getPolygon(latlngs: Feature<Polygon | MultiPolygon>): L.Layer {
    console.log(latlngs);
    let polygon = L.GeoJSON.geometryToLayer(latlngs);

    polygon.setStyle(this.config.polygonOptions);
    return polygon;
  }
  //fine
  private merge(latlngs: Feature<Polygon | MultiPolygon>) {
    console.log("merge", latlngs);
    const newArray: L.FeatureGroup[] = [];
    let polyIntersection: boolean = false;
    this.arrayOfFeatureGroups.forEach(featureGroup => {
      let featureCollection = featureGroup.toGeoJSON();
      let feature = this.turfHelper.getTurfPolygon(featureCollection.features[0]);

      //check this...
      polyIntersection = this.turfHelper.polygonIntersect(feature, latlngs);
      if (polyIntersection) {
        newArray.push(featureGroup);
      }
    });
    if (newArray.length > 0) {
      this.unionPolygons(newArray, latlngs);
    }
  }
  //next
  private subtract(latlngs: Feature<Polygon | MultiPolygon>) {
    let addHole = latlngs
    this.arrayOfFeatureGroups.forEach(featureGroup => {
      let featureCollection = featureGroup.toGeoJSON();
      const layer = featureCollection.features[0];
      let poly = this.getLatLngsFromJson(layer);
      let feature = this.turfHelper.getTurfPolygon(featureCollection.features[0]);
      let newPolygon = this.turfHelper.polygonDifference(feature, addHole);
      this.deletePolygon(poly);
      this.removeFeatureGroupOnMerge(featureGroup);
      addHole = newPolygon
    });

    const newLatlngs: Feature<Polygon | MultiPolygon> = addHole;
    let coords = this.turfHelper.getCoords(newLatlngs)
    coords.forEach((value) => {
      this.addPolygonLayer(this.turfHelper.getMultiPolygon([value]), true);
    })

  }
  //fine
  private events(onoff: boolean) {
    const onoroff = onoff ? "on" : "off";
    this.map[onoroff]("mousedown", this.mouseDown, this);
  }
  //fine
  private addMarker(latlngs: ILatLng[], FeatureGroup: L.FeatureGroup) {
    latlngs.forEach((latlng, i) => {

      let iconClasses = this.config.markers.markerIcon.styleClasses;
      if (i === 0 && this.config.markers.menu) {
        iconClasses = this.config.markers.markerMenuIcon.styleClasses;
      }

      const marker = new L.Marker(latlng, { icon: this.createDivIcon(iconClasses), draggable: true, title: i });
      FeatureGroup.addLayer(marker).addTo(this.map);
      console.log(FeatureGroup.getLayers()[0]);
      marker.on("drag", e => {
        this.markerDrag(FeatureGroup);
      });
      marker.on("dragend", e => {
        this.markerDragEnd(FeatureGroup);
      });
      if (i === 0 && this.config.markers.menu) {
        marker.bindPopup(this.getHtmlContent((e) => {
          console.log("clicked on", e.target);
        }));
        // marker.on("click", e => {
        //   this.toggleMarkerMenu();
        // })
      }
    });
  }
  private createDivIcon(classNames: string[]): L.divIcon {
    const classes = classNames.join(" ");
    const icon = L.divIcon({ className: classes });
    return icon;
  }
  //TODO: Cleanup
  private markerDrag(FeatureGroup: L.FeatureGroup) {
    const newPos = [];
    let testarray = []
    const layerLength = FeatureGroup.getLayers();
    let posarrays = FeatureGroup.getLayers()[0].getLatLngs()
    let length = 0;
    if (posarrays.length > 1) {
      for (let index = 0; index < posarrays.length; index++) {
        testarray = []
        if (index === 0) {
          for (let j = 0; j < posarrays[index][0].length; j++) {
            testarray.push(layerLength[j + 1].getLatLng());
          }
          newPos.push([testarray])
        } else {
          length += posarrays[index - 1][0].length
          for (let j = length; j < posarrays[index][0].length + length; j++) {
            testarray.push(layerLength[j + 1].getLatLng());
          }
          newPos.push([testarray])
        }
      }
    }
    else {
      for (let index = 1; index < layerLength.length; index++) {
        newPos.push(layerLength[index].getLatLng());
      }
    }
    console.log("Nye posisjoner i arrayet:", newPos);
    layerLength[0].setLatLngs(newPos);
    console.log("Nye polygoner:", layerLength[0]);
  }
  // check this
  private markerDragEnd(FeatureGroup: L.FeatureGroup) {
    console.log("Markerdragend");
    let featureCollection = FeatureGroup.toGeoJSON();
    let feature = this.turfHelper.getTurfPolygon(featureCollection.features[0]);
    if (this.turfHelper.hasKinks(feature)) {
      this.kinks = true;
      let unkink = this.turfHelper.getKinks(feature);
      this.deletePolygon(this.getLatLngsFromJson(feature));

      unkink.forEach(polygon => {
        this.addPolygon(this.turfHelper.getTurfPolygon(polygon), false);
      });
    } else {
      this.kinks = false;
      this.addPolygon(feature, false);
    }
    // this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
  }
  //fine, check the returned type
  private getLatLngsFromJson(feature: Feature<Polygon | MultiPolygon>): number[] {
    console.log("getLatLngsFromJson: ", feature);
    let coord
    if (feature) {
      if (feature.geometry.coordinates[0].length > 1 && feature.geometry.type === "MultiPolygon") {
        coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
      }
      else if (feature.geometry.coordinates[0].length > 1 && feature.geometry.type === "Polygon") {
        coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0]);
      }
      else {
        coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
      }
    }

    return coord;
  }

  //fine
  private unionPolygons(layers, latlngs: Feature<Polygon | MultiPolygon>) {
    console.log("unionPolygons", layers, latlngs);

    let addNew = latlngs;
    layers.forEach(featureGroup => {
      let featureCollection = featureGroup.toGeoJSON()
      const layer = featureCollection.features[0];
      const geoLayer = featureCollection.features[0];
      let poly = this.getLatLngsFromJson(layer);
      const union = this.turfHelper.union(addNew, geoLayer); //Check for multipolygons
      //Needs a cleanup for the new version
      this.deletePolygonOnMerge(poly);
      this.removeFeatureGroup(featureGroup)

      addNew = union;
    });

    const newLatlngs: Feature<Polygon | MultiPolygon> = addNew; //Trenger kanskje this.turfHelper.getTurfPolygon( addNew);
    this.addPolygonLayer(newLatlngs, true);
  }
  //fine
  private removeFeatureGroup(featureGroup: L.FeatureGroup) {
    console.log("removeFeatureGroup", featureGroup);

    featureGroup.clearLayers();
    this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(featureGroups => featureGroups !== featureGroup);
    // this.updatePolygons();
    this.map.removeLayer(featureGroup);
  }
  //fine until refactoring
  private removeFeatureGroupOnMerge(featureGroup: L.FeatureGroup) {
    console.log("removeFeatureGroupOnMerge", featureGroup);

    let newArray = [];
    if (featureGroup.getLayers()[0]) {
      let polygon = featureGroup.getLayers()[0].getLatLngs()[0];
      this.polygonInformation.polygonInformationStorage.forEach(v => {
        if (v.polygon.toString() !== polygon[0].toString() && v.polygon[0].toString() === polygon[0][0].toString()) {
          v.polygon = polygon;
          newArray.push(v);
        }

        if (v.polygon.toString() !== polygon[0].toString() && v.polygon[0].toString() !== polygon[0][0].toString()) {
          newArray.push(v);
        }
      });
      featureGroup.clearLayers();
      this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(featureGroups => featureGroups !== featureGroup);

      this.map.removeLayer(featureGroup);
    }

  }
  //fine until refactoring
  private deletePolygonOnMerge(polygon) {
    console.log("deletePolygonOnMerge", polygon);

    if (this.arrayOfFeatureGroups.length > 0) {
      this.arrayOfFeatureGroups.forEach(featureGroup => {
        let layer = featureGroup.getLayers()[0];
        let latlngs = layer._latlngs[0];
        if (latlngs[0][0] !== latlngs[0][latlngs[0].length - 1]) {
          latlngs[0].push(latlngs[0][0]);
        }
        const equals = this.polygonArrayEqualsMerge(latlngs, polygon);

        if (equals) {
          console.log("EQUALS", polygon);
          this.removeFeatureGroupOnMerge(featureGroup);
          this.deletePolygon(polygon);
          this.polygonInformation.deleteTrashcan(polygon);
          // this.updatePolygons();
        }
      });
    }
  }

  //TODO - legge et annet sted
  private polygonArrayEqualsMerge(poly1: any[], poly2: any[]): boolean {
    return poly1.toString() === poly2.toString();
  }
  //TODO - legge et annet sted
  private polygonArrayEquals(poly1: any[], poly2: any[]): boolean {
    // console.log("polygonArrayEquals", poly1, poly2);

    if (poly1.length !== poly2.length) return false;
    if (!poly1[0].equals(poly2[0])) return false;
    else {
      return true;
    }
  }
  //fine
  private setLeafletMapEvents(enableDragging: boolean, enableDoubleClickZoom: boolean, enableScrollWheelZoom: boolean) {
    //console.log("setLeafletMapEvents", enableDragging, enableDoubleClickZoom, enableScrollWheelZoom);

    enableDragging ? this.map.dragging.enable() : this.map.dragging.disable();
    enableDoubleClickZoom ? this.map.doubleClickZoom.enable() : this.map.doubleClickZoom.disable();
    enableScrollWheelZoom ? this.map.scrollWheelZoom.enable() : this.map.scrollWheelZoom.disable();
  }
  //fine
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
            color: defaultConfig.polyLineOptions.color
          });
          this.setLeafletMapEvents(false, false, false);
          break;
        case DrawMode.SubtractPolygon:
          L.DomUtil.addClass(this.map.getContainer(), "crosshair-cursor-enabled");
          this.events(true);
          this.tracer.setStyle({
            color: "#D9460F"
          });
          this.setLeafletMapEvents(false, false, false);
          break;
      }
    }
  }

  modeChange(mode: DrawMode): void {
    this.setDrawMode(mode);
    this.polygonInformation.saveCurrentState();
  }
  //remove, use modeChange
  drawModeClick(): void {
    this.setDrawMode(DrawMode.AddPolygon);
    this.polygonInformation.saveCurrentState();
  }
  //remove, use modeChange
  freedrawMenuClick(): void {
    this.setDrawMode(DrawMode.AddPolygon);
    this.polygonInformation.saveCurrentState();
  }

  //remove, use modeChange
  subtractClick(): void {
    this.setDrawMode(DrawMode.SubtractPolygon);
    this.polygonInformation.saveCurrentState();
  }
  //fine
  private resetTracker() {
    this.tracer.setLatLngs([[0, 0]]);
  }



  toggleMarkerMenu(): void {
    alert("open menu");
  }
  private getHtmlContent(callBack:Function):HTMLElement {

    const wrapper: HTMLDivElement = document.createElement("div");
    const header: HTMLDivElement = document.createElement("div");
    const content: HTMLDivElement = document.createElement("div");
    const simplify: HTMLDivElement = document.createElement("div");
    const bbox: HTMLDivElement = document.createElement("div");
    const buttonSeparator: HTMLDivElement = document.createElement("div");

    wrapper.classList.add("marker-menu-inner-wrapper");
    header.classList.add("marker-menu-header");
    content.classList.add("marker-menu-content");
    simplify.classList.add("marker-menu-button");
    simplify.classList.add("simplyfy");
    bbox.classList.add("marker-menu-button");
    bbox.classList.add("bbox");
    buttonSeparator.classList.add("marker-menu-separator");
    header.innerText = "Alter polygon";
    simplify.innerHTML = "Simplify";
    bbox.innerHTML = "bbox";

    wrapper.appendChild(header);
    wrapper.appendChild(content);
    content.appendChild(simplify);
    content.appendChild(buttonSeparator);
    content.appendChild(bbox);

    bbox.onclick = (e) => callBack(e); 
    simplify.onclick = (e) => callBack(e);

    return wrapper;

  }

}
//flytt til enum.ts
export enum DrawMode {
  Off = 0,
  AddPolygon = 1,
  EditPolygon = 2,
  SubtractPolygon = 3,
  LoadPolygon = 4
}
