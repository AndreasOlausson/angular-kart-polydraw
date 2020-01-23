import { Injectable, Optional } from "@angular/core";
import * as L from "leaflet";
//import * as turf from "@turf/turf";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { Feature, Polygon, MultiPolygon } from "@turf/turf";
import { MapStateService } from "./map-state.service";
import { TurfHelperService } from "./turf-helper.service";
import { PolygonInformationService } from "./polygon-information.service";
import defaultConfig from "./config.json";
import { ILatLng } from "./polygon-helpers";
import { ComponentGeneraterService } from "./component-generater.service";
import { Compass, PolyDrawUtil } from "./utils";
import { MarkerPosition } from "./enums";
import { LeafletHelperService } from "./leaflet-helper.service";

@Injectable({
  providedIn: "root"
})
//Rename - PolyDrawService
export class PolyDrawService {
  //DrawModes, determine UI buttons etc...
  drawModeSubject: BehaviorSubject<DrawMode> = new BehaviorSubject<DrawMode>(DrawMode.Off);
  drawMode$: Observable<DrawMode> = this.drawModeSubject.asObservable();

  private map: L.Map;

  private mergePolygons: boolean;
  private kinks: boolean;
  //add to config
  private arrayOfFeatureGroups: L.FeatureGroup<L.Layer>[] = [];
  private tracer: L.Polyline = {} as any;
  private readonly polygonDrawStates = null;
  //end add to config

  private ngUnsubscribe = new Subject();
  private config: typeof defaultConfig = null;

  constructor(
    private mapState: MapStateService,
    private popupGenerator: ComponentGeneraterService,
    private turfHelper: TurfHelperService,
    private polygonInformation: PolygonInformationService,
    private leafletHelper: LeafletHelperService
  ) {
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

    this.polygonInformation.polygonInformation$.subscribe(k => {
      console.log("PolyInfo start: ", k);
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
  deletePolygon(polygon: ILatLng[][]) {
    console.log("deletePolygon: ", polygon);
    if (this.arrayOfFeatureGroups.length > 0) {
      this.arrayOfFeatureGroups.forEach(featureGroup => {
        let layer = featureGroup.getLayers()[0] as any;
        let latlngs = layer.getLatLngs();
        let length = latlngs.length;
        //  = []
        latlngs.forEach((latlng, index) => {
          let polygon3;
          let test = [...latlng]

          console.log(latlng);
          if (latlng.length > 1) {
            if (latlng[0][0] !== latlng[0][latlng[0].length - 1]) {
              test[0].push(latlng[0][0]);
            }
            polygon3 = [test[0]];
          } else {
            if (latlng[0] !== latlng[latlng.length - 1]) {
              test.push(latlng[0]);
            }
            polygon3 = test;
          }

          console.log("Test: ", polygon3);

          console.log(polygon);

          const equals = this.polygonArrayEquals(polygon3, polygon);
          console.log("equals: ", equals, " length: ", length);
          if (equals && length === 1) {
            this.polygonInformation.deleteTrashcan(polygon);

            this.removeFeatureGroup(featureGroup);
            console.log(featureGroup.getLayers());
          } else if (equals && length > 1) {
            this.polygonInformation.deleteTrashCanOnMulti([polygon]);
            latlngs.splice(index, 1);
            layer.setLatLngs(latlngs);
            this.removeFeatureGroup(featureGroup);
            this.addPolygonLayer(layer.toGeoJSON(), false);
          }
        });
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

  addViken(polygon) {
    this.addPolygonLayer(polygon, true);
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
      polygon.forEach((polyElement, i) => {
        if (i === 0) {
          this.addMarker(polyElement, featureGroup);
        } else {
          this.addHoleMarker(polyElement, featureGroup);
          console.log("Hull: ", polyElement);
        }
      });
      // this.addMarker(polygon[0], featureGroup);
      //TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
    });

    this.arrayOfFeatureGroups.push(featureGroup);
    this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
  }

  //innehåll i if'ar flytta till egna metoder
  private convertToCoords(latlngs: ILatLng[][]) {
    let coords = [];
    console.log(latlngs.length, latlngs);
    if (latlngs.length > 1 && latlngs.length < 3) {
      let coordinates = [];
      console.log(L.GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), latlngs[latlngs.length - 1].length);
      let within = this.turfHelper.isWithin(L.GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), L.GeoJSON.latLngsToCoords(latlngs[0]));
      if (within) {
        latlngs.forEach(polygon => {
          coordinates.push(L.GeoJSON.latLngsToCoords(polygon));
        });
      } else {
        latlngs.forEach(polygon => {
          coords.push([L.GeoJSON.latLngsToCoords(polygon)]);
        });
      }
      if (coordinates.length >= 1) {
        coords.push(coordinates);
      }
      console.log("Within1 ", within);
    } else if (latlngs.length > 2) {
      let coordinates = [];
      for (let index = 1; index < latlngs.length - 1; index++) {
        let within = this.turfHelper.isWithin(L.GeoJSON.latLngsToCoords(latlngs[index]), L.GeoJSON.latLngsToCoords(latlngs[0]));
        if (within) {
          latlngs.forEach(polygon => {
            coordinates.push(L.GeoJSON.latLngsToCoords(polygon));
          });
          coords.push(coordinates);
        } else {
          latlngs.forEach(polygon => {
            coords.push([L.GeoJSON.latLngsToCoords(polygon)]);
          });
        }
      }
    } else {
      coords.push([L.GeoJSON.latLngsToCoords(latlngs[0])]);
    }
    console.log(coords);
    return coords;
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
        this.addPolygon(geoPos, true);
        break;
      case DrawMode.SubtractPolygon:
        this.subtractPolygon(geoPos);
        break;

      default:
        break;
    }
    this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
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
    this.subtract(latlngs);
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
  private addPolygonLayer(latlngs: Feature<Polygon | MultiPolygon>, simplify: boolean, dynamicTolerance: boolean = false) {
    let featureGroup: L.FeatureGroup = new L.FeatureGroup();

    const latLngs = simplify ? this.turfHelper.getSimplified(latlngs, dynamicTolerance) : latlngs;
    console.log("AddPolygonLayer: ", latLngs);
    let polygon = this.getPolygon(latLngs);
    featureGroup.addLayer(polygon);
    console.log(polygon);
    let markerLatlngs = polygon.getLatLngs();
    markerLatlngs.forEach(polygon => {
      polygon.forEach((polyElement: ILatLng[], i: number) => {
        if (i === 0) {
          this.addMarker(polyElement, featureGroup);
        } else {
          this.addHoleMarker(polyElement, featureGroup);
          console.log("Hull: ", polyElement);
        }
      });
      // this.addMarker(polygon[0], featureGroup);
      //TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
    });

    this.arrayOfFeatureGroups.push(featureGroup);
    console.log("Array: ", this.arrayOfFeatureGroups);
    this.setDrawMode(DrawMode.Off);

    featureGroup.on("click", e => {
      this.polygonClicked(e, latLngs);
    });
  }
  //fine
  private polygonClicked(e: any, poly: Feature<Polygon | MultiPolygon>) {
    const newPoint = e.latlng;
    if (poly.geometry.type === "MultiPolygon") {
      let newPolygon = this.turfHelper.injectPointToPolygon(poly, [newPoint.lng, newPoint.lat]);
      this.deletePolygon(this.getLatLngsFromJson(poly));
      this.addPolygonLayer(newPolygon, false);
    }
  }
  //fine
  private getPolygon(latlngs: Feature<Polygon | MultiPolygon>) {
    console.log("getPolygons: ", latlngs);
    let polygon = L.GeoJSON.geometryToLayer(latlngs) as any;

    polygon.setStyle(this.config.polygonOptions);
    return polygon;
  }
  //fine
  private merge(latlngs: Feature<Polygon | MultiPolygon>) {
    console.log("merge", latlngs);
    let polygonFeature = [];
    const newArray: L.FeatureGroup[] = [];
    let polyIntersection: boolean = false;
    this.arrayOfFeatureGroups.forEach(featureGroup => {
      let featureCollection = featureGroup.toGeoJSON() as any;
      if (featureCollection.features[0].geometry.coordinates.length > 1) {
        featureCollection.features[0].geometry.coordinates.forEach(element => {
          let feature = this.turfHelper.getMultiPolygon([element]);
          polyIntersection = this.turfHelper.polygonIntersect(feature, latlngs);
          if (polyIntersection) {
            newArray.push(featureGroup);
            polygonFeature.push(feature);
          }
        });
      } else {
        let feature = this.turfHelper.getTurfPolygon(featureCollection.features[0]);
        polyIntersection = this.turfHelper.polygonIntersect(feature, latlngs);
        if (polyIntersection) {
          newArray.push(featureGroup);
          polygonFeature.push(feature);
        }
      }
    });
    console.log(newArray);
    if (newArray.length > 0) {
      this.unionPolygons(newArray, latlngs, polygonFeature);
    } else {
      this.addPolygonLayer(latlngs, true);
    }
  }
  //next
  private subtract(latlngs: Feature<Polygon | MultiPolygon>) {
    let addHole = latlngs;
    this.arrayOfFeatureGroups.forEach(featureGroup => {
      let featureCollection = featureGroup.toGeoJSON() as any;
      const layer = featureCollection.features[0];
      let poly = this.getLatLngsFromJson(layer);
      let feature = this.turfHelper.getTurfPolygon(featureCollection.features[0]);
      let newPolygon = this.turfHelper.polygonDifference(feature, addHole);
      this.deletePolygon(poly);
      this.removeFeatureGroupOnMerge(featureGroup);
      addHole = newPolygon;
    });

    const newLatlngs: Feature<Polygon | MultiPolygon> = addHole;
    let coords = this.turfHelper.getCoords(newLatlngs);
    coords.forEach(value => {
      this.addPolygonLayer(this.turfHelper.getMultiPolygon([value]), true);
    });
  }
  //fine
  private events(onoff: boolean) {
    const onoroff = onoff ? "on" : "off";
    this.map[onoroff]("mousedown", this.mouseDown, this);
  }
  //fine, TODO: if special markers
  private addMarker(latlngs: ILatLng[], FeatureGroup: L.FeatureGroup) {

    const menuMarkerIdx = this.getMarkerIndex(latlngs, this.config.markers.markerMenuIcon.position);
    const deleteMarkerIdx = this.getMarkerIndex(latlngs, this.config.markers.markerDeleteIcon.position);

    latlngs.forEach((latlng, i) => {
      let iconClasses = this.config.markers.markerIcon.styleClasses;
      if (i === menuMarkerIdx && this.config.markers.menu) {
        iconClasses = this.config.markers.markerMenuIcon.styleClasses;
      }
      if (i === deleteMarkerIdx && this.config.markers.delete) {
        iconClasses = this.config.markers.markerDeleteIcon.styleClasses;
      }
      const marker = new L.Marker(latlng, { icon: this.createDivIcon(iconClasses), draggable: true, title: i.toString() });
      FeatureGroup.addLayer(marker).addTo(this.map);
      // console.log("FeatureGroup: ", FeatureGroup);
      marker.on("drag", e => {
        this.markerDrag(FeatureGroup);
      });
      marker.on("dragend", e => {
        this.markerDragEnd(FeatureGroup);
      });
      if (i === menuMarkerIdx && this.config.markers.menu) {
        

        // marker.bindPopup(
        //   this.getHtmlContent(e => {
        //     console.log("clicked on", e.target);
        //   })
        // );
        marker.on("click", e => {
          //this.convertToBoundsPolygon(latlngs, true);
          this.convertToSimplifiedPolygon(latlngs);
        })
      }
      if (i === deleteMarkerIdx && this.config.markers.delete) {
        marker.on("click", e => {
          this.deletePolygon([latlngs]);
        });
      }
    });
  }

  private addHoleMarker(latlngs: ILatLng[], FeatureGroup: L.FeatureGroup) {
    latlngs.forEach((latlng, i) => {
      let iconClasses = this.config.markers.markerIcon.styleClasses;
      /*  if (i === 0 && this.config.markers.menu) {
        iconClasses = this.config.markers.markerMenuIcon.styleClasses;
      }

      //TODO- legg til fill icon
      if (i === latlngs.length - 1 && this.config.markers.delete) {
        iconClasses = this.config.markers.markerDeleteIcon.styleClasses;
      } */
      const marker = new L.Marker(latlng, { icon: this.createDivIcon(iconClasses), draggable: true, title: i.toString() });
      FeatureGroup.addLayer(marker).addTo(this.map);

      marker.on("drag", e => {
        this.markerDrag(FeatureGroup);
      });
      marker.on("dragend", e => {
        this.markerDragEnd(FeatureGroup);
      });
      /*   if (i === 0 && this.config.markers.menu) {
        marker.bindPopup(this.getHtmlContent((e) => {
          console.log("clicked on", e.target);
        }));
        // marker.on("click", e => {
        //   this.toggleMarkerMenu();
        // })
      }
      if (i === latlngs.length - 1 && this.config.markers.delete) {
        marker.on("click", e => {
          this.deletePolygon([latlngs]);
        });
      } */
    });
  }
  private createDivIcon(classNames: string[]): L.DivIcon {
    const classes = classNames.join(" ");
    const icon = L.divIcon({ className: classes });
    return icon;
  }
  //TODO: Cleanup
  private markerDrag(FeatureGroup: L.FeatureGroup) {
    const newPos = [];
    let testarray = [];
    let hole = [];
    const layerLength = FeatureGroup.getLayers() as any;
    let posarrays = layerLength[0].getLatLngs();
    console.log(posarrays);
    let length = 0;
    if (posarrays.length > 1) {
      for (let index = 0; index < posarrays.length; index++) {
        testarray = [];
        hole = [];
        console.log("Posisjoner: ", posarrays[index]);
        if (index === 0) {
          if (posarrays[0].length > 1) {
            for (let i = 0; index < posarrays[0].length; i++) {
              console.log("Posisjoner 2: ", posarrays[index][i]);

              for (let j = 0; j < posarrays[0][i].length; j++) {
                testarray.push(layerLength[j + 1].getLatLng());
              }
              hole.push(testarray);
            }
          } else {
            for (let j = 0; j < posarrays[0][0].length; j++) {
              testarray.push(layerLength[j + 1].getLatLng());
            }
            hole.push(testarray);
          }
          console.log("Hole: ", hole);
          newPos.push(hole);
        } else {
          length += posarrays[index - 1][0].length;
          console.log("STart index: ", length);
          for (let j = length; j < posarrays[index][0].length + length; j++) {
            testarray.push((layerLength[j + 1] as any).getLatLng());
          }
          hole.push(testarray);
          newPos.push(hole);
        }
      }
    } else {
      // testarray = []
      hole = [];
      let length2 = 0;
      for (let index = 0; index < posarrays[0].length; index++) {
        testarray = [];
        console.log("Polygon drag: ", posarrays[0][index]);
        if (index === 0) {
          if (posarrays[0][index].length > 1) {
            for (let j = 0; j < posarrays[0][index].length; j++) {
              testarray.push(layerLength[j + 1].getLatLng());
            }
          } else {
            for (let j = 0; j < posarrays[0][0].length; j++) {
              testarray.push(layerLength[j + 1].getLatLng());
            }
          }
        } else {
          length2 += posarrays[0][index - 1].length;

          for (let j = length2; j < posarrays[0][index].length + length2; j++) {
            testarray.push(layerLength[j + 1].getLatLng());
          }
        }
        hole.push(testarray);
      }
      newPos.push(hole);
      console.log("Hole 2: ", hole);
    }
    console.log("Nye posisjoner: ", newPos);
    layerLength[0].setLatLngs(newPos);
  }
  // check this
  private markerDragEnd(FeatureGroup: L.FeatureGroup) {
    this.polygonInformation.deletePolygonInformationStorage();
    let featureCollection = FeatureGroup.toGeoJSON() as any;
    console.log("Markerdragend polygon: ", featureCollection.features[0].geometry.coordinates);
    if (featureCollection.features[0].geometry.coordinates.length > 1) {
      featureCollection.features[0].geometry.coordinates.forEach(element => {
        let feature = this.turfHelper.getMultiPolygon([element]);
        

        console.log("Markerdragend: ", feature);
        if (this.turfHelper.hasKinks(feature)) {
          this.kinks = true;
          let unkink = this.turfHelper.getKinks(feature);
          // this.deletePolygon(this.getLatLngsFromJson(feature));
          this.removeFeatureGroup(FeatureGroup);
          console.log("Unkink: ", unkink);
          unkink.forEach(polygon => {
            this.addPolygon(this.turfHelper.getTurfPolygon(polygon), false, true);
          });
        } else {
          this.kinks = false;
          this.addPolygon(feature, false);
        }
      });
    } else {
      let feature = this.turfHelper.getMultiPolygon(featureCollection.features[0].geometry.coordinates);
      console.log("Markerdragend: ", feature);
      if (this.turfHelper.hasKinks(feature)) {
        this.kinks = true;
        let unkink = this.turfHelper.getKinks(feature);
        // this.deletePolygon(this.getLatLngsFromJson(feature));
        this.removeFeatureGroup(FeatureGroup);
        console.log("Unkink: ", unkink);
        unkink.forEach(polygon => {
          this.addPolygon(this.turfHelper.getTurfPolygon(polygon), false, true);
        });
      } else {
        // this.deletePolygon(this.getLatLngsFromJson(feature));
        this.kinks = false;
        this.addPolygon(feature, false);
      }
    }
    this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
  }
  //fine, check the returned type
  private getLatLngsFromJson(feature: Feature<Polygon | MultiPolygon>): ILatLng[][] {
    console.log("getLatLngsFromJson: ", feature);
    let coord;
    if (feature) {
      if (feature.geometry.coordinates.length > 1 && feature.geometry.type === "MultiPolygon") {
        coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
      } else if (feature.geometry.coordinates[0].length > 1 && feature.geometry.type === "Polygon") {
        coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0]);
      } else {
        coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
      }
    }

    return coord;
  }

  //fine
  private unionPolygons(layers, latlngs: Feature<Polygon | MultiPolygon>, polygonFeature) {
    console.log("unionPolygons", layers, latlngs, polygonFeature);

    let addNew = latlngs;
    layers.forEach((featureGroup, i) => {
      let featureCollection = featureGroup.toGeoJSON();
      const layer = featureCollection.features[0];
      let poly = this.getLatLngsFromJson(layer);
      const union = this.turfHelper.union(addNew, polygonFeature[i]); //Check for multipolygons
      //Needs a cleanup for the new version
      this.deletePolygonOnMerge(poly);
      this.removeFeatureGroup(featureGroup);

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
      let polygon = (featureGroup.getLayers()[0] as any).getLatLngs()[0];
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
    let polygon2 = []
    if (this.arrayOfFeatureGroups.length > 0) {
      this.arrayOfFeatureGroups.forEach(featureGroup => {
        let layer = featureGroup.getLayers()[0] as any;
        let latlngs = layer.getLatLngs()[0];
        polygon2 = [...latlngs[0]]
        if (latlngs[0][0] !== latlngs[0][latlngs[0].length - 1]) {
          polygon2.push(latlngs[0][0]);
        }
        const equals = this.polygonArrayEqualsMerge(polygon2, polygon);

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

    if (poly1[0][0]) {
      if (!poly1[0][0].equals(poly2[0][0])) return false;
    } else {
      if (!poly1[0].equals(poly2[0])) return false;
    }
    if (poly1.length !== poly2.length) return false;
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
  private getHtmlContent(callBack: Function): HTMLElement {
    const comp = this.popupGenerator.generateAlterPopup();
    comp.instance.bboxClicked.subscribe(e => {
      console.log("bbox clicked", e);
      callBack(e);
    });
    comp.instance.simplyfiClicked.subscribe(e => {
      console.log("simplyfi clicked", e);
      callBack(e);
    });
    return comp.location.nativeElement;
  }
  private convertToBoundsPolygon(latlngs: ILatLng[], addMidpointMarkers: boolean = false) {
    this.deletePolygon([latlngs]);
    let polygon = this.turfHelper.getMultiPolygon(this.convertToCoords([latlngs]));
    let newPolygon = this.turfHelper.convertToBoundingBoxPolygon(polygon, addMidpointMarkers);


    this.addPolygonLayer(this.turfHelper.getTurfPolygon(newPolygon), false);
  }
  private convertToSimplifiedPolygon(latlngs: ILatLng[]) {
    this.deletePolygon([latlngs]);
    let newPolygon = this.turfHelper.getMultiPolygon(this.convertToCoords([latlngs]));
    this.addPolygonLayer(this.turfHelper.getTurfPolygon(newPolygon), true, true);

  }
  private getMarkerIndex(latlngs: ILatLng[], position: MarkerPosition): number {
    const bounds: L.LatLngBounds = PolyDrawUtil.getBounds(latlngs, (Math.sqrt(2) / 2));
    const compass = new Compass(bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast());
    const compassDirection = compass.getDirection(position);
    const latLngPoint: ILatLng = {
        lat: compassDirection.lat,
        lng: compassDirection.lng
    }
    const targetPoint = this.turfHelper.getCoord(latLngPoint);
    const fc = this.turfHelper.getFeaturePointCollection(latlngs);
    const nearestPointIdx = this.turfHelper.getNearestPointIndex(targetPoint, fc as any)

    return nearestPointIdx;
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
