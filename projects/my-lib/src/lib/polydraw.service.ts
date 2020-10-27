import { Injectable, Optional } from '@angular/core';
import * as L from 'leaflet';
// import * as turf from "@turf/turf";
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { filter, debounceTime, takeUntil } from 'rxjs/operators';
import { Feature, Polygon, MultiPolygon } from '@turf/turf';
import { PolyStateService } from './map-state.service';
import { TurfHelperService } from './turf-helper.service';
import { PolygonInformationService } from './polygon-information.service';
import defaultConfig from './polyinfo.json';
import { ILatLng, PolygonDrawStates } from './polygon-helpers';
import { ComponentGeneraterService } from './component-generater.service';
import { Compass, PolyDrawUtil } from './utils';
import { MarkerPosition, DrawMode } from './enums';
import { LeafletHelperService } from './leaflet-helper.service';

@Injectable({
  providedIn: 'root'
})
// Rename - PolyDrawService
export class PolyDrawService {
  // DrawModes, determine UI buttons etc...
  drawModeSubject: BehaviorSubject<DrawMode> = new BehaviorSubject<DrawMode>(
    DrawMode.Off
  );
  drawMode$: Observable<DrawMode> = this.drawModeSubject.asObservable();

  private readonly minimumFreeDrawZoomLevel: number = 12;
  private map: L.Map;

  private mergePolygons: boolean;
  private kinks: boolean;
  // add to config
  private arrayOfFeatureGroups: L.FeatureGroup<L.Layer>[] = [];
  private tracer: L.Polyline = {} as any;
  // end add to config

  private ngUnsubscribe = new Subject();
  private config: typeof defaultConfig = null;

  constructor(
    private mapState: PolyStateService,
    private popupGenerator: ComponentGeneraterService,
    private turfHelper: TurfHelperService,
    private polygonInformation: PolygonInformationService,
    private leafletHelper: LeafletHelperService
  ) {
    this.mapState.map$.pipe(filter(m => m !== null)).subscribe((map: L.Map) => {
      this.map = map;
      this.config = defaultConfig;
      this.configurate({});
      this.tracer = L.polyline([[0, 0]], this.config.polyLineOptions);
      this.initPolyDraw();
    });

    this.mapState.mapZoomLevel$
      .pipe(debounceTime(100), takeUntil(this.ngUnsubscribe))
      .subscribe((zoom: number) => {
        this.onZoomChange(zoom);
      });
  }
  // new
  configurate(config: Object): void {
    // TODO if config is path...
    this.config = { ...defaultConfig, ...config };

    this.mergePolygons = this.config.mergePolygons;
    this.kinks = this.config.kinks;
  }

  // fine
  closeAndReset(): void {
    this.setDrawMode(DrawMode.Off);
    this.removeAllFeatureGroups();
  }

  // make readable
  deletePolygon(polygon: ILatLng[][]) {
    if (polygon.length > 1) {
      polygon.length = 1;
    }
    if (this.arrayOfFeatureGroups.length > 0) {
      this.arrayOfFeatureGroups.forEach(featureGroup => {
        const layer = featureGroup.getLayers()[0] as any;
        const latlngs = layer.getLatLngs();
        const length = latlngs.length;
        //  = []

        latlngs.forEach((latlng, index) => {
          let polygon3;
          const test = [...latlng];

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

          const equals = this.polygonArrayEquals(polygon3, polygon);

          if (equals && length === 1) {
            this.polygonInformation.deleteTrashcan(polygon);

            this.removeFeatureGroup(featureGroup);
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
  // fine
  removeAllFeatureGroups() {
    this.arrayOfFeatureGroups.forEach(featureGroups => {
      this.map.removeLayer(featureGroups);
    });

    this.arrayOfFeatureGroups = [];
    this.polygonInformation.deletePolygonInformationStorage();
    this.polygonInformation.reset();
    this.polygonInformation.updatePolygons();
  }
  // fine
  getDrawMode(): DrawMode {
    return this.drawModeSubject.value;
  }

  addViken(polygon) {
    this.addPolygonLayer(polygon, true);
  }

  // check this
  addAutoPolygon(geographicBorders: L.LatLng[][][]): void {
    geographicBorders.forEach(group => {
      const featureGroup: L.FeatureGroup = new L.FeatureGroup();

      const polygon2 = this.turfHelper.getMultiPolygon(
        this.convertToCoords(group)
      );

      const polygon = this.getPolygon(polygon2);

      featureGroup.addLayer(polygon);
      const markerLatlngs = polygon.getLatLngs();

      markerLatlngs.forEach(polygon => {
        polygon.forEach((polyElement, i) => {
          if (i === 0) {
            this.addMarker(polyElement, featureGroup);
          } else {
            this.addHoleMarker(polyElement, featureGroup);
          }
        });
        // this.addMarker(polygon[0], featureGroup);
        // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
      });

      this.arrayOfFeatureGroups.push(featureGroup);
    });
    this.polygonInformation.createPolygonInformationStorage(
      this.arrayOfFeatureGroups
    );
    this.polygonInformation.activate();
    this.polygonInformation.setMoveMode();
  }

  // innehåll i if'ar flytta till egna metoder
  private convertToCoords(latlngs: ILatLng[][]) {
    const coords = [];

    if (latlngs.length > 1 && latlngs.length < 3) {
      const coordinates = [];

      // tslint:disable-next-line: max-line-length
      const within = this.turfHelper.isWithin(
        L.GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]),
        L.GeoJSON.latLngsToCoords(latlngs[0])
      );
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
    } else if (latlngs.length > 2) {
      const coordinates = [];
      for (let index = 1; index < latlngs.length - 1; index++) {
        const within = this.turfHelper.isWithin(
          L.GeoJSON.latLngsToCoords(latlngs[index]),
          L.GeoJSON.latLngsToCoords(latlngs[0])
        );
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

    return coords;
  }

  // fine
  private initPolyDraw() {
    const container: HTMLElement = this.map.getContainer();
    const drawMode = this.getDrawMode();
    if (this.config.touchSupport) {
      container.addEventListener('touchstart mousedown', e => {
        if (drawMode !== DrawMode.Off) {
          this.mouseDown(e);
        }
      });

      container.addEventListener('touchend mouseup', e => {
        if (drawMode !== DrawMode.Off) {
          this.mouseUpLeave();
        }
      });

      container.addEventListener('touchmove mousemove', e => {
        if (drawMode !== DrawMode.Off) {
          this.mouseMove(e);
        }
      });
    }

    this.map.addLayer(this.tracer);
    this.setDrawMode(DrawMode.Off);
  }
  // Test L.MouseEvent
  private mouseDown(event) {
    if (event.originalEvent != null) {
      this.tracer.setLatLngs([event.latlng]);
    } else {
      const latlng = this.map.containerPointToLatLng([
        event.touches[0].clientX,
        event.touches[0].clientY
      ]);
      this.tracer.setLatLngs([latlng]);
    }
    this.startDraw();
  }

  // TODO event type, create containerPointToLatLng-method
  private mouseMove(event) {
    if (event.originalEvent != null) {
      this.tracer.addLatLng(event.latlng);
    } else {
      const latlng = this.map.containerPointToLatLng([
        event.touches[0].clientX,
        event.touches[0].clientY
      ]);
      this.tracer.addLatLng(latlng);
    }
  }

  // fine
  private mouseUpLeave() {
    this.polygonInformation.deletePolygonInformationStorage();

    const geoPos: Feature<
      Polygon | MultiPolygon
    > = this.turfHelper.turfConcaveman(this.tracer.toGeoJSON() as any);
    this.stopDraw();
    switch (this.getDrawMode()) {
      case DrawMode.Add:
        this.addPolygon(geoPos, true);
        break;
      case DrawMode.Subtract:
        this.subtractPolygon(geoPos);
        break;

      default:
        break;
    }
    this.polygonInformation.createPolygonInformationStorage(
      this.arrayOfFeatureGroups
    );
  }
  // fine
  private startDraw() {
    this.drawStartedEvents(true);
  }
  // fine
  private stopDraw() {
    this.resetTracker();
    this.drawStartedEvents(false);
  }

  private onZoomChange(zoomLevel: number): void {
    if (zoomLevel >= this.minimumFreeDrawZoomLevel) {
      this.polygonInformation.polygonDrawStates.canUsePolyDraw = true;
    } else {
      this.polygonInformation.polygonDrawStates.canUsePolyDraw = false;
      this.polygonInformation.setMoveMode();
    }
    this.polygonInformation.saveCurrentState();
  }
  // fine
  private drawStartedEvents(onoff: boolean) {
    const onoroff = onoff ? 'on' : 'off';

    this.map[onoroff]('mousemove', this.mouseMove, this);
    this.map[onoroff]('mouseup', this.mouseUpLeave, this);
  }
  // On hold
  private subtractPolygon(latlngs: Feature<Polygon | MultiPolygon>) {
    this.subtract(latlngs);
  }
  // fine
  private addPolygon(
    latlngs: Feature<Polygon | MultiPolygon>,
    simplify: boolean,
    noMerge: boolean = false
  ) {
    if (
      this.mergePolygons &&
      !noMerge &&
      this.arrayOfFeatureGroups.length > 0 &&
      !this.kinks
    ) {
      this.merge(latlngs);
    } else {
      this.addPolygonLayer(latlngs, simplify);
    }
  }
  // fine
  private addPolygonLayer(
    latlngs: Feature<Polygon | MultiPolygon>,
    simplify: boolean
  ) {
    const featureGroup: L.FeatureGroup = new L.FeatureGroup();

    const latLngs = simplify ? this.turfHelper.getSimplified(latlngs) : latlngs;

    const polygon = this.getPolygon(latLngs);
    featureGroup.addLayer(polygon);

    const markerLatlngs = polygon.getLatLngs();
    markerLatlngs.forEach(polygon => {
      polygon.forEach((polyElement: ILatLng[], i: number) => {
        if (i === 0) {
          this.addMarker(polyElement, featureGroup);
        } else {
          this.addHoleMarker(polyElement, featureGroup);
        }
      });
      // this.addMarker(polygon[0], featureGroup);
      // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
    });

    this.arrayOfFeatureGroups.push(featureGroup);

    this.polygonInformation.activate();
    this.setDrawMode(DrawMode.Off);

    featureGroup.on('click', e => {
      this.polygonClicked(e, latLngs);
    });
  }
  // fine
  private polygonClicked(e: any, poly: Feature<Polygon | MultiPolygon>) {
    const newPoint = e.latlng;
    if (poly.geometry.type === 'MultiPolygon') {
      const newPolygon = this.turfHelper.injectPointToPolygon(poly, [
        newPoint.lng,
        newPoint.lat
      ]);
      this.deletePolygon(this.getLatLngsFromJson(poly));
      this.addPolygonLayer(newPolygon, false);
    }
  }
  // fine
  private getPolygon(latlngs: Feature<Polygon | MultiPolygon>) {
    const polygon = L.GeoJSON.geometryToLayer(latlngs) as any;

    polygon.setStyle(this.config.polygonOptions);
    return polygon;
  }
  // fine
  private merge(latlngs: Feature<Polygon | MultiPolygon>) {
    const polygonFeature = [];
    const newArray: L.FeatureGroup[] = [];
    let polyIntersection = false;
    this.arrayOfFeatureGroups.forEach(featureGroup => {
      const featureCollection = featureGroup.toGeoJSON() as any;

      if (featureCollection.features[0].geometry.coordinates.length > 1) {
        featureCollection.features[0].geometry.coordinates.forEach(element => {
          const feature = this.turfHelper.getMultiPolygon([element]);
          polyIntersection = this.turfHelper.polygonIntersect(feature, latlngs);
          if (polyIntersection) {
            newArray.push(featureGroup);
            polygonFeature.push(feature);
          }
        });
      } else {
        const feature = this.turfHelper.getTurfPolygon(
          featureCollection.features[0]
        );
        polyIntersection = this.turfHelper.polygonIntersect(feature, latlngs);
        if (polyIntersection) {
          newArray.push(featureGroup);
          polygonFeature.push(feature);
        }
      }
    });

    if (newArray.length > 0) {
      this.unionPolygons(newArray, latlngs, polygonFeature);
    } else {
      this.addPolygonLayer(latlngs, true);
    }
  }
  // next
  private subtract(latlngs: Feature<Polygon | MultiPolygon>) {
    let addHole = latlngs;
    this.arrayOfFeatureGroups.forEach(featureGroup => {
      const featureCollection = featureGroup.toGeoJSON() as any;
      const layer = featureCollection.features[0];
      const poly = this.getLatLngsFromJson(layer);
      const feature = this.turfHelper.getTurfPolygon(
        featureCollection.features[0]
      );
      const newPolygon = this.turfHelper.polygonDifference(feature, addHole);
      this.deletePolygon(poly);
      this.removeFeatureGroupOnMerge(featureGroup);
      addHole = newPolygon;
    });

    const newLatlngs: Feature<Polygon | MultiPolygon> = addHole;
    const coords = this.turfHelper.getCoords(newLatlngs);
    coords.forEach(value => {
      this.addPolygonLayer(this.turfHelper.getMultiPolygon([value]), true);
    });
  }
  // fine
  private events(onoff: boolean) {
    const onoroff = onoff ? 'on' : 'off';
    this.map[onoroff]('mousedown', this.mouseDown, this);
  }
  // fine, TODO: if special markers
  private addMarker(latlngs: ILatLng[], FeatureGroup: L.FeatureGroup) {
    const menuMarkerIdx = this.getMarkerIndex(
      latlngs,
      this.config.markers.markerMenuIcon.position
    );
    const deleteMarkerIdx = this.getMarkerIndex(
      latlngs,
      this.config.markers.markerDeleteIcon.position
    );

    latlngs.forEach((latlng, i) => {
      const iconClasses = this.config.markers.markerIcon.styleClasses;
      /*   if (i === menuMarkerIdx && this.config.markers.menu) {
        iconClasses = this.config.markers.markerMenuIcon.styleClasses;
      }
      if (i === deleteMarkerIdx && this.config.markers.delete) {
        iconClasses = this.config.markers.markerDeleteIcon.styleClasses;
      } */
      const marker = new L.Marker(latlng, {
        icon: this.createDivIcon(iconClasses),
        draggable: true,
        title: i.toString()
      });
      FeatureGroup.addLayer(marker).addTo(this.map);

      marker.on('drag', e => {
        this.markerDrag(FeatureGroup);
      });
      marker.on('dragend', e => {
        this.markerDragEnd(FeatureGroup);
      });
      if (i === menuMarkerIdx && this.config.markers.menu) {
        // marker.bindPopup(
        //   this.getHtmlContent(e => {

        //   })
        // );
        marker.on('click', e => {
          this.convertToBoundsPolygon(latlngs, true);
          // this.convertToSimplifiedPolygon(latlngs);
        });
      }
      if (i === deleteMarkerIdx && this.config.markers.delete) {
        marker.on('click', e => {
          this.deletePolygon([latlngs]);
        });
      }
    });
  }

  private addHoleMarker(latlngs: ILatLng[], FeatureGroup: L.FeatureGroup) {
    latlngs.forEach((latlng, i) => {
      const iconClasses = this.config.markers.markerIcon.styleClasses;
      /*  if (i === 0 && this.config.markers.menu) {
        iconClasses = this.config.markers.markerMenuIcon.styleClasses;
      }

      //TODO- legg til fill icon
      if (i === latlngs.length - 1 && this.config.markers.delete) {
        iconClasses = this.config.markers.markerDeleteIcon.styleClasses;
      } */
      const marker = new L.Marker(latlng, {
        icon: this.createDivIcon(iconClasses),
        draggable: true,
        title: i.toString()
      });
      FeatureGroup.addLayer(marker).addTo(this.map);

      marker.on('drag', e => {
        this.markerDrag(FeatureGroup);
      });
      marker.on('dragend', e => {
        this.markerDragEnd(FeatureGroup);
      });
      /*   if (i === 0 && this.config.markers.menu) {
        marker.bindPopup(this.getHtmlContent((e) => {
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
    const classes = classNames.join(' ');
    const icon = L.divIcon({ className: classes });
    return icon;
  }
  // TODO: Cleanup
  private markerDrag(FeatureGroup: L.FeatureGroup) {
    const newPos = [];
    let testarray = [];
    let hole = [];
    const layerLength = FeatureGroup.getLayers() as any;
    const posarrays = layerLength[0].getLatLngs();

    let length = 0;
    if (posarrays.length > 1) {
      for (let index = 0; index < posarrays.length; index++) {
        testarray = [];
        hole = [];

        if (index === 0) {
          if (posarrays[0].length > 1) {
            for (let i = 0; index < posarrays[0].length; i++) {
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

          newPos.push(hole);
        } else {
          length += posarrays[index - 1][0].length;

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
    }

    layerLength[0].setLatLngs(newPos);
  }
  // check this
  private markerDragEnd(FeatureGroup: L.FeatureGroup) {
    this.polygonInformation.deletePolygonInformationStorage();
    const featureCollection = FeatureGroup.toGeoJSON() as any;

    if (featureCollection.features[0].geometry.coordinates.length > 1) {
      featureCollection.features[0].geometry.coordinates.forEach(element => {
        const feature = this.turfHelper.getMultiPolygon([element]);

        if (this.turfHelper.hasKinks(feature)) {
          this.kinks = true;
          const unkink = this.turfHelper.getKinks(feature);
          // this.deletePolygon(this.getLatLngsFromJson(feature));
          this.removeFeatureGroup(FeatureGroup);

          unkink.forEach(polygon => {
            this.addPolygon(
              this.turfHelper.getTurfPolygon(polygon),
              false,
              true
            );
          });
        } else {
          this.kinks = false;
          this.addPolygon(feature, false);
        }
      });
    } else {
      const feature = this.turfHelper.getMultiPolygon(
        featureCollection.features[0].geometry.coordinates
      );

      if (this.turfHelper.hasKinks(feature)) {
        this.kinks = true;
        const unkink = this.turfHelper.getKinks(feature);
        // this.deletePolygon(this.getLatLngsFromJson(feature));
        this.removeFeatureGroup(FeatureGroup);

        const testCoord = [];
        unkink.forEach(polygon => {
          this.addPolygon(this.turfHelper.getTurfPolygon(polygon), false, true);
        });
        // this.addPolygon(this.turfHelper.getMultiPolygon(testCoord), false, true);
      } else {
        // this.deletePolygon(this.getLatLngsFromJson(feature));
        this.kinks = false;
        this.addPolygon(feature, false);
      }
    }
    this.polygonInformation.createPolygonInformationStorage(
      this.arrayOfFeatureGroups
    );
  }
  // fine, check the returned type
  private getLatLngsFromJson(
    feature: Feature<Polygon | MultiPolygon>
  ): ILatLng[][] {
    let coord;
    if (feature) {
      if (
        feature.geometry.coordinates.length > 1 &&
        feature.geometry.type === 'MultiPolygon'
      ) {
        coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
      } else if (
        feature.geometry.coordinates[0].length > 1 &&
        feature.geometry.type === 'Polygon'
      ) {
        coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0]);
      } else {
        coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
      }
    }

    return coord;
  }

  // fine
  private unionPolygons(
    layers,
    latlngs: Feature<Polygon | MultiPolygon>,
    polygonFeature
  ) {
    let addNew = latlngs;
    layers.forEach((featureGroup, i) => {
      const featureCollection = featureGroup.toGeoJSON();
      const layer = featureCollection.features[0];
      const poly = this.getLatLngsFromJson(layer);
      const union = this.turfHelper.union(addNew, polygonFeature[i]); // Check for multipolygons
      // Needs a cleanup for the new version
      this.deletePolygonOnMerge(poly);
      this.removeFeatureGroup(featureGroup);

      addNew = union;
    });

    const newLatlngs: Feature<Polygon | MultiPolygon> = addNew; // Trenger kanskje this.turfHelper.getTurfPolygon( addNew);
    this.addPolygonLayer(newLatlngs, true);
  }
  // fine
  private removeFeatureGroup(featureGroup: L.FeatureGroup) {
    featureGroup.clearLayers();
    this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(
      featureGroups => featureGroups !== featureGroup
    );
    // this.updatePolygons();
    this.map.removeLayer(featureGroup);
  }
  // fine until refactoring
  private removeFeatureGroupOnMerge(featureGroup: L.FeatureGroup) {
    const newArray = [];
    if (featureGroup.getLayers()[0]) {
      const polygon = (featureGroup.getLayers()[0] as any).getLatLngs()[0];
      this.polygonInformation.polygonInformationStorage.forEach(v => {
        if (
          v.polygon.toString() !== polygon[0].toString() &&
          v.polygon[0].toString() === polygon[0][0].toString()
        ) {
          v.polygon = polygon;
          newArray.push(v);
        }

        if (
          v.polygon.toString() !== polygon[0].toString() &&
          v.polygon[0].toString() !== polygon[0][0].toString()
        ) {
          newArray.push(v);
        }
      });
      featureGroup.clearLayers();
      this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(
        featureGroups => featureGroups !== featureGroup
      );

      this.map.removeLayer(featureGroup);
    }
  }
  // fine until refactoring
  private deletePolygonOnMerge(polygon) {
    let polygon2 = [];
    if (this.arrayOfFeatureGroups.length > 0) {
      this.arrayOfFeatureGroups.forEach(featureGroup => {
        const layer = featureGroup.getLayers()[0] as any;
        const latlngs = layer.getLatLngs()[0];
        polygon2 = [...latlngs[0]];
        if (latlngs[0][0] !== latlngs[0][latlngs[0].length - 1]) {
          polygon2.push(latlngs[0][0]);
        }
        const equals = this.polygonArrayEqualsMerge(polygon2, polygon);

        if (equals) {
          this.removeFeatureGroupOnMerge(featureGroup);
          this.deletePolygon(polygon);
          this.polygonInformation.deleteTrashcan(polygon);
          // this.updatePolygons();
        }
      });
    }
  }

  // TODO - legge et annet sted
  private polygonArrayEqualsMerge(poly1: any[], poly2: any[]): boolean {
    return poly1.toString() === poly2.toString();
  }
  // TODO - legge et annet sted
  private polygonArrayEquals(poly1: any[], poly2: any[]): boolean {
    if (poly1[0][0]) {
      if (!poly1[0][0].equals(poly2[0][0])) {
        return false;
      }
    } else {
      if (!poly1[0].equals(poly2[0])) {
        return false;
      }
    }
    if (poly1.length !== poly2.length) {
      return false;
    } else {
      return true;
    }
  }
  // fine
  private setLeafletMapEvents(
    enableDragging: boolean,
    enableDoubleClickZoom: boolean,
    enableScrollWheelZoom: boolean
  ) {
    enableDragging ? this.map.dragging.enable() : this.map.dragging.disable();
    enableDoubleClickZoom
      ? this.map.doubleClickZoom.enable()
      : this.map.doubleClickZoom.disable();
    enableScrollWheelZoom
      ? this.map.scrollWheelZoom.enable()
      : this.map.scrollWheelZoom.disable();
  }
  // fine
  setDrawMode(mode: DrawMode) {
    this.drawModeSubject.next(mode);
    if (!!this.map) {
      let isActiveDrawMode = true;
      switch (mode) {
        case DrawMode.Off:
          L.DomUtil.removeClass(
            this.map.getContainer(),
            'crosshair-cursor-enabled'
          );
          this.events(false);
          this.stopDraw();
          this.tracer.setStyle({
            color: ''
          });
          this.setLeafletMapEvents(true, true, true);
          isActiveDrawMode = false;
          break;
        case DrawMode.Add:
          L.DomUtil.addClass(
            this.map.getContainer(),
            'crosshair-cursor-enabled'
          );
          this.events(true);
          this.tracer.setStyle({
            color: defaultConfig.polyLineOptions.color
          });
          this.setLeafletMapEvents(false, false, false);
          break;
        case DrawMode.Subtract:
          L.DomUtil.addClass(
            this.map.getContainer(),
            'crosshair-cursor-enabled'
          );
          this.events(true);
          this.tracer.setStyle({
            color: '#D9460F'
          });
          this.setLeafletMapEvents(false, false, false);
          break;
      }

      if (isActiveDrawMode) {
        this.polygonInformation.setFreeDrawMode();
      } else {
        this.polygonInformation.setMoveMode();
      }
    }
  }

  modeChange(mode: DrawMode): void {
    this.setDrawMode(mode);
    this.polygonInformation.saveCurrentState();
  }
  // remove, use modeChange
  drawModeClick(): void {
    if (this.polygonInformation.polygonDrawStates.isFreeDrawMode) {
      this.polygonInformation.setMoveMode();
      this.setDrawMode(DrawMode.Off);
    } else {
      this.polygonInformation.setFreeDrawMode();
      this.setDrawMode(DrawMode.Add);
    }
    this.polygonInformation.saveCurrentState();
  }
  // remove, use modeChange
  freedrawMenuClick(): void {
    this.setDrawMode(DrawMode.Add);
    this.polygonInformation.activate();
    this.polygonInformation.saveCurrentState();
  }

  // remove, use modeChange
  subtractClick(): void {
    this.setDrawMode(DrawMode.Subtract);
    this.polygonInformation.saveCurrentState();
  }
  // fine
  private resetTracker() {
    this.tracer.setLatLngs([[0, 0]]);
  }

  toggleMarkerMenu(): void {
    alert('open menu');
  }
  private getHtmlContent(callBack: Function): HTMLElement {
    const comp = this.popupGenerator.generateAlterPopup();
    comp.instance.bboxClicked.subscribe(e => {
      callBack(e);
    });
    comp.instance.simplyfiClicked.subscribe(e => {
      callBack(e);
    });
    return comp.location.nativeElement;
  }
  private convertToBoundsPolygon(
    latlngs: ILatLng[],
    addMidpointMarkers: boolean = false
  ) {
    this.deletePolygon([latlngs]);
    const polygon = this.turfHelper.getMultiPolygon(
      this.convertToCoords([latlngs])
    );
    const newPolygon = this.turfHelper.convertToBoundingBoxPolygon(
      polygon,
      addMidpointMarkers
    );

    this.addPolygonLayer(this.turfHelper.getTurfPolygon(newPolygon), false);
  }
  private convertToSimplifiedPolygon(latlngs: ILatLng[]) {
    this.deletePolygon([latlngs]);
    const newPolygon = this.turfHelper.getMultiPolygon(
      this.convertToCoords([latlngs])
    );
    this.addPolygonLayer(this.turfHelper.getTurfPolygon(newPolygon), true);
  }
  private getMarkerIndex(latlngs: ILatLng[], position: MarkerPosition): number {
    const bounds: L.LatLngBounds = PolyDrawUtil.getBounds(
      latlngs,
      Math.sqrt(2) / 2
    );
    const compass = new Compass(
      bounds.getSouth(),
      bounds.getWest(),
      bounds.getNorth(),
      bounds.getEast()
    );
    const compassDirection = compass.getDirection(position);
    const latLngPoint: ILatLng = {
      lat: compassDirection.lat,
      lng: compassDirection.lng
    };
    const targetPoint = this.turfHelper.getCoord(latLngPoint);
    const fc = this.turfHelper.getFeaturePointCollection(latlngs);
    const nearestPointIdx = this.turfHelper.getNearestPointIndex(
      targetPoint,
      fc as any
    );

    return nearestPointIdx;
  }
}
