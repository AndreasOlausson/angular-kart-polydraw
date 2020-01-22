import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import * as L from 'leaflet';
// import * as turf from "@turf/turf";
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PolyStateService } from './map-state.service';
import { TurfHelperService } from './turf-helper.service';
import { PolygonInformationService } from './polygon-information.service';
import defaultConfig from './polyinfo.json';
import { ComponentGeneraterService } from './component-generater.service';
import { Compass, PolyDrawUtil } from './utils';
import { LeafletHelperService } from './leaflet-helper.service';
import * as i0 from "@angular/core";
import * as i1 from "./map-state.service";
import * as i2 from "./component-generater.service";
import * as i3 from "./turf-helper.service";
import * as i4 from "./polygon-information.service";
import * as i5 from "./leaflet-helper.service";
let PolyDrawService = 
// Rename - PolyDrawService
class PolyDrawService {
    constructor(mapState, popupGenerator, turfHelper, polygonInformation, leafletHelper) {
        this.mapState = mapState;
        this.popupGenerator = popupGenerator;
        this.turfHelper = turfHelper;
        this.polygonInformation = polygonInformation;
        this.leafletHelper = leafletHelper;
        // DrawModes, determine UI buttons etc...
        this.drawModeSubject = new BehaviorSubject(DrawMode.Off);
        this.drawMode$ = this.drawModeSubject.asObservable();
        // add to config
        this.arrayOfFeatureGroups = [];
        this.tracer = {};
        this.polygonDrawStates = null;
        // end add to config
        this.ngUnsubscribe = new Subject();
        this.config = null;
        this.mapState.map$.pipe(filter(m => m !== null)).subscribe((map) => {
            this.map = map;
            console.log('pre this.config', this.config);
            this.config = defaultConfig;
            console.log('this.config', this.config);
            this.configurate({});
            console.log('after this.config', this.config);
            this.tracer = L.polyline([[0, 0]], this.config.polyLineOptions);
            this.initPolyDraw();
        });
        this.polygonInformation.polygonInformation$.subscribe(k => {
            console.log('PolyInfo start: ', k);
        });
        // TODO - lage en config observable i mapState og oppdater this.config med den
    }
    // new
    configurate(config) {
        // TODO if config is path...
        this.config = Object.assign({}, defaultConfig, config);
        this.mergePolygons = this.config.mergePolygons;
        this.kinks = this.config.kinks;
    }
    // fine
    closeAndReset() {
        // console.log("closeAndReset");
        this.setDrawMode(DrawMode.Off);
        this.removeAllFeatureGroups();
    }
    // make readable
    deletePolygon(polygon) {
        console.log('deletePolygon: ', polygon);
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(featureGroup => {
                const layer = featureGroup.getLayers()[0];
                const latlngs = layer.getLatLngs();
                const length = latlngs.length;
                //  = []
                latlngs.forEach((latlng, index) => {
                    let polygon3;
                    const test = [...latlng];
                    console.log(latlng);
                    if (latlng.length > 1) {
                        /* if (latlng[0][0] !== latlng[0][latlng[0].length - 1]) {
                          test[0].push(latlng[0][0]);
                          }  */
                        polygon3 = [test[0]];
                    }
                    else {
                        if (latlng[0] !== latlng[latlng.length - 1]) {
                            test.push(latlng[0]);
                        }
                        polygon3 = test;
                    }
                    console.log('Test: ', polygon3);
                    console.log(polygon);
                    const equals = this.polygonArrayEquals(polygon3, polygon);
                    console.log('equals: ', equals, ' length: ', length);
                    if (equals && length === 1) {
                        this.polygonInformation.deleteTrashcan(polygon);
                        this.removeFeatureGroup(featureGroup);
                        console.log(featureGroup.getLayers());
                    }
                    else if (equals && length > 1) {
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
        // console.log("removeAllFeatureGroups", null);
        this.arrayOfFeatureGroups.forEach(featureGroups => {
            this.map.removeLayer(featureGroups);
        });
        this.arrayOfFeatureGroups = [];
        this.polygonInformation.deletePolygonInformationStorage();
        // this.polygonDrawStates.reset();
        this.polygonInformation.updatePolygons();
    }
    // fine
    getDrawMode() {
        // console.log("getDrawMode", null);
        return this.drawModeSubject.value;
    }
    addViken(polygon) {
        this.addPolygonLayer(polygon, true);
    }
    // check this
    addAutoPolygon(geographicBorders) {
        const featureGroup = new L.FeatureGroup();
        const polygon2 = this.turfHelper.getMultiPolygon(this.convertToCoords(geographicBorders));
        console.log(polygon2);
        const polygon = this.getPolygon(polygon2);
        featureGroup.addLayer(polygon);
        const markerLatlngs = polygon.getLatLngs();
        console.log('markers: ', markerLatlngs);
        markerLatlngs.forEach(polygon => {
            polygon.forEach((polyElement, i) => {
                if (i === 0) {
                    this.addMarker(polyElement, featureGroup);
                }
                else {
                    this.addHoleMarker(polyElement, featureGroup);
                    console.log('Hull: ', polyElement);
                }
            });
            // this.addMarker(polygon[0], featureGroup);
            // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
        });
        this.arrayOfFeatureGroups.push(featureGroup);
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
    }
    // innehåll i if'ar flytta till egna metoder
    convertToCoords(latlngs) {
        const coords = [];
        console.log(latlngs.length, latlngs);
        if (latlngs.length > 1 && latlngs.length < 3) {
            const coordinates = [];
            console.log(L.GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), latlngs[latlngs.length - 1].length);
            const within = this.turfHelper.isWithin(L.GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), L.GeoJSON.latLngsToCoords(latlngs[0]));
            if (within) {
                latlngs.forEach(polygon => {
                    coordinates.push(L.GeoJSON.latLngsToCoords(polygon));
                });
            }
            else {
                latlngs.forEach(polygon => {
                    coords.push([L.GeoJSON.latLngsToCoords(polygon)]);
                });
            }
            if (coordinates.length >= 1) {
                coords.push(coordinates);
            }
            console.log('Within1 ', within);
        }
        else if (latlngs.length > 2) {
            const coordinates = [];
            for (let index = 1; index < latlngs.length - 1; index++) {
                const within = this.turfHelper.isWithin(L.GeoJSON.latLngsToCoords(latlngs[index]), L.GeoJSON.latLngsToCoords(latlngs[0]));
                if (within) {
                    latlngs.forEach(polygon => {
                        coordinates.push(L.GeoJSON.latLngsToCoords(polygon));
                    });
                    coords.push(coordinates);
                }
                else {
                    latlngs.forEach(polygon => {
                        coords.push([L.GeoJSON.latLngsToCoords(polygon)]);
                    });
                }
            }
        }
        else {
            coords.push([L.GeoJSON.latLngsToCoords(latlngs[0])]);
        }
        console.log(coords);
        return coords;
    }
    // fine
    initPolyDraw() {
        // console.log("initPolyDraw", null);
        const container = this.map.getContainer();
        const drawMode = this.getDrawMode();
        if (this.config.touchSupport) {
            container.addEventListener('touchstart', e => {
                if (drawMode !== DrawMode.Off) {
                    this.mouseDown(e);
                }
            });
            container.addEventListener('touchend', e => {
                if (drawMode !== DrawMode.Off) {
                    this.mouseUpLeave();
                }
            });
            container.addEventListener('touchmove', e => {
                if (drawMode !== DrawMode.Off) {
                    this.mouseMove(e);
                }
            });
        }
        this.map.addLayer(this.tracer);
        this.setDrawMode(DrawMode.Off);
    }
    // Test L.MouseEvent
    mouseDown(event) {
        console.log('mouseDown', event);
        if (event.originalEvent != null) {
            this.tracer.setLatLngs([event.latlng]);
        }
        else {
            const latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
            this.tracer.setLatLngs([latlng]);
        }
        this.startDraw();
    }
    // TODO event type, create containerPointToLatLng-method
    mouseMove(event) {
        // console.log("mouseMove", event);
        if (event.originalEvent != null) {
            this.tracer.addLatLng(event.latlng);
        }
        else {
            const latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
            this.tracer.addLatLng(latlng);
        }
    }
    // fine
    mouseUpLeave() {
        // console.log("mouseUpLeave", null);
        this.polygonInformation.deletePolygonInformationStorage();
        // console.log("------------------------------Delete trashcans", null);
        const geoPos = this.turfHelper.turfConcaveman(this.tracer.toGeoJSON());
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
        // console.log("------------------------------create trashcans", null);
    }
    // fine
    startDraw() {
        // console.log("startDraw", null);
        this.drawStartedEvents(true);
    }
    // fine
    stopDraw() {
        // console.log("stopDraw", null);
        this.resetTracker();
        this.drawStartedEvents(false);
    }
    // fine
    drawStartedEvents(onoff) {
        // console.log("drawStartedEvents", onoff);
        const onoroff = onoff ? 'on' : 'off';
        this.map[onoroff]('mousemove', this.mouseMove, this);
        this.map[onoroff]('mouseup', this.mouseUpLeave, this);
    }
    // On hold
    subtractPolygon(latlngs) {
        this.subtract(latlngs);
    }
    // fine
    addPolygon(latlngs, simplify, noMerge = false) {
        console.log('addPolygon', latlngs, simplify, noMerge, this.kinks, this.config);
        if (this.mergePolygons && !noMerge && this.arrayOfFeatureGroups.length > 0 && !this.kinks) {
            this.merge(latlngs);
        }
        else {
            this.addPolygonLayer(latlngs, simplify);
        }
    }
    // fine
    addPolygonLayer(latlngs, simplify) {
        const featureGroup = new L.FeatureGroup();
        const latLngs = simplify ? this.turfHelper.getSimplified(latlngs) : latlngs;
        console.log('AddPolygonLayer: ', latLngs);
        const polygon = this.getPolygon(latLngs);
        featureGroup.addLayer(polygon);
        console.log(polygon);
        const markerLatlngs = polygon.getLatLngs();
        markerLatlngs.forEach(polygon => {
            polygon.forEach((polyElement, i) => {
                if (i === 0) {
                    this.addMarker(polyElement, featureGroup);
                }
                else {
                    this.addHoleMarker(polyElement, featureGroup);
                    console.log('Hull: ', polyElement);
                }
            });
            // this.addMarker(polygon[0], featureGroup);
            // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
        });
        this.arrayOfFeatureGroups.push(featureGroup);
        console.log('Array: ', this.arrayOfFeatureGroups);
        this.setDrawMode(DrawMode.Off);
        featureGroup.on('click', e => {
            this.polygonClicked(e, latLngs);
        });
    }
    // fine
    polygonClicked(e, poly) {
        const newPoint = e.latlng;
        if (poly.geometry.type === 'MultiPolygon') {
            const newPolygon = this.turfHelper.injectPointToPolygon(poly, [newPoint.lng, newPoint.lat]);
            this.deletePolygon(this.getLatLngsFromJson(poly));
            this.addPolygonLayer(newPolygon, false);
        }
    }
    // fine
    getPolygon(latlngs) {
        console.log('getPolygons: ', latlngs);
        const polygon = L.GeoJSON.geometryToLayer(latlngs);
        polygon.setStyle(this.config.polygonOptions);
        return polygon;
    }
    // fine
    merge(latlngs) {
        console.log('merge', latlngs);
        const polygonFeature = [];
        const newArray = [];
        let polyIntersection = false;
        this.arrayOfFeatureGroups.forEach(featureGroup => {
            const featureCollection = featureGroup.toGeoJSON();
            console.log('Merger: ', featureCollection.features[0]);
            if (featureCollection.features[0].geometry.coordinates.length > 1) {
                featureCollection.features[0].geometry.coordinates.forEach(element => {
                    const feature = this.turfHelper.getMultiPolygon([element]);
                    polyIntersection = this.turfHelper.polygonIntersect(feature, latlngs);
                    if (polyIntersection) {
                        newArray.push(featureGroup);
                        polygonFeature.push(feature);
                    }
                });
            }
            else {
                const feature = this.turfHelper.getTurfPolygon(featureCollection.features[0]);
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
        }
        else {
            this.addPolygonLayer(latlngs, true);
        }
    }
    // next
    subtract(latlngs) {
        let addHole = latlngs;
        this.arrayOfFeatureGroups.forEach(featureGroup => {
            const featureCollection = featureGroup.toGeoJSON();
            const layer = featureCollection.features[0];
            const poly = this.getLatLngsFromJson(layer);
            const feature = this.turfHelper.getTurfPolygon(featureCollection.features[0]);
            const newPolygon = this.turfHelper.polygonDifference(feature, addHole);
            this.deletePolygon(poly);
            this.removeFeatureGroupOnMerge(featureGroup);
            addHole = newPolygon;
        });
        const newLatlngs = addHole;
        const coords = this.turfHelper.getCoords(newLatlngs);
        coords.forEach(value => {
            this.addPolygonLayer(this.turfHelper.getMultiPolygon([value]), true);
        });
    }
    // fine
    events(onoff) {
        const onoroff = onoff ? 'on' : 'off';
        this.map[onoroff]('mousedown', this.mouseDown, this);
    }
    // fine, TODO: if special markers
    addMarker(latlngs, FeatureGroup) {
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
            marker.on('drag', e => {
                this.markerDrag(FeatureGroup);
            });
            marker.on('dragend', e => {
                this.markerDragEnd(FeatureGroup);
            });
            if (i === menuMarkerIdx && this.config.markers.menu) {
                // marker.bindPopup(
                //   this.getHtmlContent(e => {
                //     console.log("clicked on", e.target);
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
    addHoleMarker(latlngs, FeatureGroup) {
        latlngs.forEach((latlng, i) => {
            const iconClasses = this.config.markers.markerIcon.styleClasses;
            /*  if (i === 0 && this.config.markers.menu) {
              iconClasses = this.config.markers.markerMenuIcon.styleClasses;
            }
      
            //TODO- legg til fill icon
            if (i === latlngs.length - 1 && this.config.markers.delete) {
              iconClasses = this.config.markers.markerDeleteIcon.styleClasses;
            } */
            const marker = new L.Marker(latlng, { icon: this.createDivIcon(iconClasses), draggable: true, title: i.toString() });
            FeatureGroup.addLayer(marker).addTo(this.map);
            marker.on('drag', e => {
                this.markerDrag(FeatureGroup);
            });
            marker.on('dragend', e => {
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
    createDivIcon(classNames) {
        const classes = classNames.join(' ');
        const icon = L.divIcon({ className: classes });
        return icon;
    }
    // TODO: Cleanup
    markerDrag(FeatureGroup) {
        const newPos = [];
        let testarray = [];
        let hole = [];
        const layerLength = FeatureGroup.getLayers();
        const posarrays = layerLength[0].getLatLngs();
        console.log(posarrays);
        console.log('markerdrag: ', layerLength);
        let length = 0;
        if (posarrays.length > 1) {
            for (let index = 0; index < posarrays.length; index++) {
                testarray = [];
                hole = [];
                console.log('Posisjoner: ', posarrays[index]);
                if (index === 0) {
                    if (posarrays[0].length > 1) {
                        for (let i = 0; index < posarrays[0].length; i++) {
                            console.log('Posisjoner 2: ', posarrays[index][i]);
                            for (let j = 0; j < posarrays[0][i].length; j++) {
                                testarray.push(layerLength[j + 1].getLatLng());
                            }
                            hole.push(testarray);
                        }
                    }
                    else {
                        for (let j = 0; j < posarrays[0][0].length; j++) {
                            testarray.push(layerLength[j + 1].getLatLng());
                        }
                        hole.push(testarray);
                    }
                    console.log('Hole: ', hole);
                    newPos.push(hole);
                }
                else {
                    length += posarrays[index - 1][0].length;
                    console.log('STart index: ', length);
                    for (let j = length; j < posarrays[index][0].length + length; j++) {
                        testarray.push(layerLength[j + 1].getLatLng());
                    }
                    hole.push(testarray);
                    newPos.push(hole);
                }
            }
        }
        else {
            // testarray = []
            hole = [];
            let length2 = 0;
            for (let index = 0; index < posarrays[0].length; index++) {
                testarray = [];
                console.log('Polygon drag: ', posarrays[0][index]);
                if (index === 0) {
                    if (posarrays[0][index].length > 1) {
                        for (let j = 0; j < posarrays[0][index].length; j++) {
                            testarray.push(layerLength[j + 1].getLatLng());
                        }
                    }
                    else {
                        for (let j = 0; j < posarrays[0][0].length; j++) {
                            testarray.push(layerLength[j + 1].getLatLng());
                        }
                    }
                }
                else {
                    length2 += posarrays[0][index - 1].length;
                    for (let j = length2; j < posarrays[0][index].length + length2; j++) {
                        testarray.push(layerLength[j + 1].getLatLng());
                    }
                }
                hole.push(testarray);
            }
            newPos.push(hole);
            console.log('Hole 2: ', hole);
        }
        console.log('Nye posisjoner: ', newPos);
        layerLength[0].setLatLngs(newPos);
    }
    // check this
    markerDragEnd(FeatureGroup) {
        this.polygonInformation.deletePolygonInformationStorage();
        const featureCollection = FeatureGroup.toGeoJSON();
        console.log('Markerdragend polygon: ', featureCollection.features[0].geometry.coordinates);
        if (featureCollection.features[0].geometry.coordinates.length > 1) {
            featureCollection.features[0].geometry.coordinates.forEach(element => {
                const feature = this.turfHelper.getMultiPolygon([element]);
                console.log('Markerdragend: ', feature);
                if (this.turfHelper.hasKinks(feature)) {
                    this.kinks = true;
                    const unkink = this.turfHelper.getKinks(feature);
                    // this.deletePolygon(this.getLatLngsFromJson(feature));
                    this.removeFeatureGroup(FeatureGroup);
                    console.log('Unkink: ', unkink);
                    unkink.forEach(polygon => {
                        this.addPolygon(this.turfHelper.getTurfPolygon(polygon), false, true);
                    });
                }
                else {
                    this.kinks = false;
                    this.addPolygon(feature, false);
                }
            });
        }
        else {
            const feature = this.turfHelper.getMultiPolygon(featureCollection.features[0].geometry.coordinates);
            console.log('Markerdragend: ', feature);
            if (this.turfHelper.hasKinks(feature)) {
                this.kinks = true;
                const unkink = this.turfHelper.getKinks(feature);
                // this.deletePolygon(this.getLatLngsFromJson(feature));
                this.removeFeatureGroup(FeatureGroup);
                console.log('Unkink: ', unkink);
                unkink.forEach(polygon => {
                    this.addPolygon(this.turfHelper.getTurfPolygon(polygon), false, true);
                });
            }
            else {
                // this.deletePolygon(this.getLatLngsFromJson(feature));
                this.kinks = false;
                this.addPolygon(feature, false);
            }
        }
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
    }
    // fine, check the returned type
    getLatLngsFromJson(feature) {
        console.log('getLatLngsFromJson: ', feature);
        let coord;
        if (feature) {
            if (feature.geometry.coordinates.length > 1 && feature.geometry.type === 'MultiPolygon') {
                coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
            }
            else if (feature.geometry.coordinates[0].length > 1 && feature.geometry.type === 'Polygon') {
                coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0]);
            }
            else {
                coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
            }
        }
        return coord;
    }
    // fine
    unionPolygons(layers, latlngs, polygonFeature) {
        console.log('unionPolygons', layers, latlngs, polygonFeature);
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
        const newLatlngs = addNew; // Trenger kanskje this.turfHelper.getTurfPolygon( addNew);
        this.addPolygonLayer(newLatlngs, true);
    }
    // fine
    removeFeatureGroup(featureGroup) {
        console.log('removeFeatureGroup', featureGroup);
        featureGroup.clearLayers();
        this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(featureGroups => featureGroups !== featureGroup);
        // this.updatePolygons();
        this.map.removeLayer(featureGroup);
    }
    // fine until refactoring
    removeFeatureGroupOnMerge(featureGroup) {
        console.log('removeFeatureGroupOnMerge', featureGroup);
        const newArray = [];
        if (featureGroup.getLayers()[0]) {
            const polygon = featureGroup.getLayers()[0].getLatLngs()[0];
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
    // fine until refactoring
    deletePolygonOnMerge(polygon) {
        console.log('deletePolygonOnMerge', polygon);
        let polygon2 = [];
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(featureGroup => {
                const layer = featureGroup.getLayers()[0];
                const latlngs = layer.getLatLngs()[0];
                polygon2 = [...latlngs[0]];
                if (latlngs[0][0] !== latlngs[0][latlngs[0].length - 1]) {
                    polygon2.push(latlngs[0][0]);
                }
                const equals = this.polygonArrayEqualsMerge(polygon2, polygon);
                if (equals) {
                    console.log('EQUALS', polygon);
                    this.removeFeatureGroupOnMerge(featureGroup);
                    this.deletePolygon(polygon);
                    this.polygonInformation.deleteTrashcan(polygon);
                    // this.updatePolygons();
                }
            });
        }
    }
    // TODO - legge et annet sted
    polygonArrayEqualsMerge(poly1, poly2) {
        return poly1.toString() === poly2.toString();
    }
    // TODO - legge et annet sted
    polygonArrayEquals(poly1, poly2) {
        // console.log("polygonArrayEquals", poly1, poly2);
        if (poly1[0][0]) {
            if (!poly1[0][0].equals(poly2[0][0])) {
                return false;
            }
        }
        else {
            if (!poly1[0].equals(poly2[0])) {
                return false;
            }
        }
        if (poly1.length !== poly2.length) {
            return false;
        }
        else {
            return true;
        }
    }
    // fine
    setLeafletMapEvents(enableDragging, enableDoubleClickZoom, enableScrollWheelZoom) {
        // console.log("setLeafletMapEvents", enableDragging, enableDoubleClickZoom, enableScrollWheelZoom);
        enableDragging ? this.map.dragging.enable() : this.map.dragging.disable();
        enableDoubleClickZoom ? this.map.doubleClickZoom.enable() : this.map.doubleClickZoom.disable();
        enableScrollWheelZoom ? this.map.scrollWheelZoom.enable() : this.map.scrollWheelZoom.disable();
    }
    // fine
    setDrawMode(mode) {
        console.log('setDrawMode', this.map);
        this.drawModeSubject.next(mode);
        if (!!this.map) {
            let isActiveDrawMode = true;
            switch (mode) {
                case DrawMode.Off:
                    L.DomUtil.removeClass(this.map.getContainer(), 'crosshair-cursor-enabled');
                    this.events(false);
                    this.stopDraw();
                    this.tracer.setStyle({
                        color: ''
                    });
                    this.setLeafletMapEvents(true, true, true);
                    isActiveDrawMode = false;
                    break;
                case DrawMode.AddPolygon:
                    L.DomUtil.addClass(this.map.getContainer(), 'crosshair-cursor-enabled');
                    this.events(true);
                    this.tracer.setStyle({
                        color: defaultConfig.polyLineOptions.color
                    });
                    this.setLeafletMapEvents(false, false, false);
                    break;
                case DrawMode.SubtractPolygon:
                    L.DomUtil.addClass(this.map.getContainer(), 'crosshair-cursor-enabled');
                    this.events(true);
                    this.tracer.setStyle({
                        color: '#D9460F'
                    });
                    this.setLeafletMapEvents(false, false, false);
                    break;
            }
        }
    }
    modeChange(mode) {
        this.setDrawMode(mode);
        this.polygonInformation.saveCurrentState();
    }
    // remove, use modeChange
    drawModeClick() {
        this.setDrawMode(DrawMode.AddPolygon);
        this.polygonInformation.saveCurrentState();
    }
    // remove, use modeChange
    freedrawMenuClick() {
        this.setDrawMode(DrawMode.AddPolygon);
        this.polygonInformation.saveCurrentState();
    }
    // remove, use modeChange
    subtractClick() {
        this.setDrawMode(DrawMode.SubtractPolygon);
        this.polygonInformation.saveCurrentState();
    }
    // fine
    resetTracker() {
        this.tracer.setLatLngs([[0, 0]]);
    }
    toggleMarkerMenu() {
        alert('open menu');
    }
    getHtmlContent(callBack) {
        const comp = this.popupGenerator.generateAlterPopup();
        comp.instance.bboxClicked.subscribe(e => {
            console.log('bbox clicked', e);
            callBack(e);
        });
        comp.instance.simplyfiClicked.subscribe(e => {
            console.log('simplyfi clicked', e);
            callBack(e);
        });
        return comp.location.nativeElement;
    }
    convertToBoundsPolygon(latlngs, addMidpointMarkers = false) {
        this.deletePolygon([latlngs]);
        const polygon = this.turfHelper.getMultiPolygon(this.convertToCoords([latlngs]));
        const newPolygon = this.turfHelper.convertToBoundingBoxPolygon(polygon, addMidpointMarkers);
        this.addPolygonLayer(this.turfHelper.getTurfPolygon(newPolygon), false);
    }
    convertToSimplifiedPolygon(latlngs) {
        this.deletePolygon([latlngs]);
        const newPolygon = this.turfHelper.getMultiPolygon(this.convertToCoords([latlngs]));
        this.addPolygonLayer(this.turfHelper.getTurfPolygon(newPolygon), true);
    }
    getMarkerIndex(latlngs, position) {
        const bounds = PolyDrawUtil.getBounds(latlngs, (Math.sqrt(2) / 2));
        const compass = new Compass(bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast());
        const compassDirection = compass.getDirection(position);
        const latLngPoint = {
            lat: compassDirection.lat,
            lng: compassDirection.lng
        };
        const targetPoint = this.turfHelper.getCoord(latLngPoint);
        const fc = this.turfHelper.getFeaturePointCollection(latlngs);
        const nearestPointIdx = this.turfHelper.getNearestPointIndex(targetPoint, fc);
        return nearestPointIdx;
    }
};
PolyDrawService.ctorParameters = () => [
    { type: PolyStateService },
    { type: ComponentGeneraterService },
    { type: TurfHelperService },
    { type: PolygonInformationService },
    { type: LeafletHelperService }
];
PolyDrawService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function PolyDrawService_Factory() { return new PolyDrawService(i0.ɵɵinject(i1.PolyStateService), i0.ɵɵinject(i2.ComponentGeneraterService), i0.ɵɵinject(i3.TurfHelperService), i0.ɵɵinject(i4.PolygonInformationService), i0.ɵɵinject(i5.LeafletHelperService)); }, token: PolyDrawService, providedIn: "root" });
PolyDrawService = tslib_1.__decorate([
    Injectable({
        providedIn: 'root'
    })
    // Rename - PolyDrawService
    ,
    tslib_1.__metadata("design:paramtypes", [PolyStateService,
        ComponentGeneraterService,
        TurfHelperService,
        PolygonInformationService,
        LeafletHelperService])
], PolyDrawService);
export { PolyDrawService };
// flytt til enum.ts
export var DrawMode;
(function (DrawMode) {
    DrawMode[DrawMode["Off"] = 0] = "Off";
    DrawMode[DrawMode["AddPolygon"] = 1] = "AddPolygon";
    DrawMode[DrawMode["EditPolygon"] = 2] = "EditPolygon";
    DrawMode[DrawMode["SubtractPolygon"] = 3] = "SubtractPolygon";
    DrawMode[DrawMode["LoadPolygon"] = 4] = "LoadPolygon";
})(DrawMode || (DrawMode = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9wb2x5ZHJhdy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdCLHNDQUFzQztBQUN0QyxPQUFPLEVBQWMsZUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDMUQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDMUUsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUM7QUFFNUMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDMUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFaEQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7Ozs7Ozs7QUFNaEUsSUFBYSxlQUFlO0FBRDVCLDJCQUEyQjtBQUMzQixNQUFhLGVBQWU7SUFrQjFCLFlBQ1UsUUFBMEIsRUFDMUIsY0FBeUMsRUFDekMsVUFBNkIsRUFDN0Isa0JBQTZDLEVBQzdDLGFBQW1DO1FBSm5DLGFBQVEsR0FBUixRQUFRLENBQWtCO1FBQzFCLG1CQUFjLEdBQWQsY0FBYyxDQUEyQjtRQUN6QyxlQUFVLEdBQVYsVUFBVSxDQUFtQjtRQUM3Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTJCO1FBQzdDLGtCQUFhLEdBQWIsYUFBYSxDQUFzQjtRQXRCN0MseUNBQXlDO1FB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QzVCLENBQUM7UUFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxRCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLEVBQVMsQ0FBQyxDQUFDO1FBRXJGLE9BQU8sZUFBZSxDQUFDO0lBQzNCLENBQUM7Q0FHQSxDQUFBOztZQS96QnFCLGdCQUFnQjtZQUNWLHlCQUF5QjtZQUM3QixpQkFBaUI7WUFDVCx5QkFBeUI7WUFDOUIsb0JBQW9COzs7QUF2QmxDLGVBQWU7SUFKM0IsVUFBVSxDQUFDO1FBQ1YsVUFBVSxFQUFFLE1BQU07S0FDbkIsQ0FBQztJQUNGLDJCQUEyQjs7NkNBb0JMLGdCQUFnQjtRQUNWLHlCQUF5QjtRQUM3QixpQkFBaUI7UUFDVCx5QkFBeUI7UUFDOUIsb0JBQW9CO0dBdkJsQyxlQUFlLENBazFCM0I7U0FsMUJZLGVBQWU7QUFtMUI1QixvQkFBb0I7QUFDcEIsTUFBTSxDQUFOLElBQVksUUFNWDtBQU5ELFdBQVksUUFBUTtJQUNsQixxQ0FBTyxDQUFBO0lBQ1AsbURBQWMsQ0FBQTtJQUNkLHFEQUFlLENBQUE7SUFDZiw2REFBbUIsQ0FBQTtJQUNuQixxREFBZSxDQUFBO0FBQ2pCLENBQUMsRUFOVyxRQUFRLEtBQVIsUUFBUSxRQU1uQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCAqIGFzIEwgZnJvbSAnbGVhZmxldCc7XHJcbi8vIGltcG9ydCAqIGFzIHR1cmYgZnJvbSBcIkB0dXJmL3R1cmZcIjtcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgQmVoYXZpb3JTdWJqZWN0LCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGZpbHRlciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgRmVhdHVyZSwgUG9seWdvbiwgTXVsdGlQb2x5Z29uIH0gZnJvbSAnQHR1cmYvdHVyZic7XHJcbmltcG9ydCB7IFBvbHlTdGF0ZVNlcnZpY2UgfSBmcm9tICcuL21hcC1zdGF0ZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVHVyZkhlbHBlclNlcnZpY2UgfSBmcm9tICcuL3R1cmYtaGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi9wb2x5Z29uLWluZm9ybWF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgZGVmYXVsdENvbmZpZyBmcm9tICcuL3BvbHlpbmZvLmpzb24nO1xyXG5pbXBvcnQgeyBJTGF0TG5nIH0gZnJvbSAnLi9wb2x5Z29uLWhlbHBlcnMnO1xyXG5pbXBvcnQgeyBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlIH0gZnJvbSAnLi9jb21wb25lbnQtZ2VuZXJhdGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb21wYXNzLCBQb2x5RHJhd1V0aWwgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgTWFya2VyUG9zaXRpb24gfSBmcm9tICcuL2VudW1zJztcclxuaW1wb3J0IHsgTGVhZmxldEhlbHBlclNlcnZpY2UgfSBmcm9tICcuL2xlYWZsZXQtaGVscGVyLnNlcnZpY2UnO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG4vLyBSZW5hbWUgLSBQb2x5RHJhd1NlcnZpY2VcclxuZXhwb3J0IGNsYXNzIFBvbHlEcmF3U2VydmljZSB7XHJcbiAgLy8gRHJhd01vZGVzLCBkZXRlcm1pbmUgVUkgYnV0dG9ucyBldGMuLi5cclxuICBkcmF3TW9kZVN1YmplY3Q6IEJlaGF2aW9yU3ViamVjdDxEcmF3TW9kZT4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0PERyYXdNb2RlPihEcmF3TW9kZS5PZmYpO1xyXG4gIGRyYXdNb2RlJDogT2JzZXJ2YWJsZTxEcmF3TW9kZT4gPSB0aGlzLmRyYXdNb2RlU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuXHJcbiAgcHJpdmF0ZSBtYXA6IEwuTWFwO1xyXG5cclxuICBwcml2YXRlIG1lcmdlUG9seWdvbnM6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBraW5rczogYm9vbGVhbjtcclxuICAvLyBhZGQgdG8gY29uZmlnXHJcbiAgcHJpdmF0ZSBhcnJheU9mRmVhdHVyZUdyb3VwczogTC5GZWF0dXJlR3JvdXA8TC5MYXllcj5bXSA9IFtdO1xyXG4gIHByaXZhdGUgdHJhY2VyOiBMLlBvbHlsaW5lID0ge30gYXMgYW55O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcG9seWdvbkRyYXdTdGF0ZXMgPSBudWxsO1xyXG4gIC8vIGVuZCBhZGQgdG8gY29uZmlnXHJcblxyXG4gIHByaXZhdGUgbmdVbnN1YnNjcmliZSA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHJpdmF0ZSBjb25maWc6IHR5cGVvZiBkZWZhdWx0Q29uZmlnID0gbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIG1hcFN0YXRlOiBQb2x5U3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBwb3B1cEdlbmVyYXRvcjogQ29tcG9uZW50R2VuZXJhdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgdHVyZkhlbHBlcjogVHVyZkhlbHBlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBvbHlnb25JbmZvcm1hdGlvbjogUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSxcclxuICAgIHByaXZhdGUgbGVhZmxldEhlbHBlcjogTGVhZmxldEhlbHBlclNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMubWFwU3RhdGUubWFwJC5waXBlKGZpbHRlcihtID0+IG0gIT09IG51bGwpKS5zdWJzY3JpYmUoKG1hcDogTC5NYXApID0+IHtcclxuICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdwcmUgdGhpcy5jb25maWcnLCB0aGlzLmNvbmZpZyk7XHJcbiAgICAgIHRoaXMuY29uZmlnID0gZGVmYXVsdENvbmZpZztcclxuICAgICAgY29uc29sZS5sb2coJ3RoaXMuY29uZmlnJywgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLmNvbmZpZ3VyYXRlKHt9KTtcclxuICAgICAgY29uc29sZS5sb2coJ2FmdGVyIHRoaXMuY29uZmlnJywgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLnRyYWNlciA9IEwucG9seWxpbmUoW1swLCAwXV0sIHRoaXMuY29uZmlnLnBvbHlMaW5lT3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLmluaXRQb2x5RHJhdygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkluZm9ybWF0aW9uJC5zdWJzY3JpYmUoayA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdQb2x5SW5mbyBzdGFydDogJywgayk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUT0RPIC0gbGFnZSBlbiBjb25maWcgb2JzZXJ2YWJsZSBpIG1hcFN0YXRlIG9nIG9wcGRhdGVyIHRoaXMuY29uZmlnIG1lZCBkZW5cclxuICB9XHJcbiAgLy8gbmV3XHJcbiAgY29uZmlndXJhdGUoY29uZmlnOiBPYmplY3QpOiB2b2lkIHtcclxuICAgIC8vIFRPRE8gaWYgY29uZmlnIGlzIHBhdGguLi5cclxuICAgIHRoaXMuY29uZmlnID0geyAuLi5kZWZhdWx0Q29uZmlnLCAuLi5jb25maWcgfTtcclxuXHJcbiAgICB0aGlzLm1lcmdlUG9seWdvbnMgPSB0aGlzLmNvbmZpZy5tZXJnZVBvbHlnb25zO1xyXG4gICAgdGhpcy5raW5rcyA9IHRoaXMuY29uZmlnLmtpbmtzO1xyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIGNsb3NlQW5kUmVzZXQoKTogdm9pZCB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImNsb3NlQW5kUmVzZXRcIik7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XHJcbiAgICB0aGlzLnJlbW92ZUFsbEZlYXR1cmVHcm91cHMoKTtcclxuICB9XHJcblxyXG4gIC8vIG1ha2UgcmVhZGFibGVcclxuICBkZWxldGVQb2x5Z29uKHBvbHlnb246IElMYXRMbmdbXVtdKSB7XHJcbiAgICBjb25zb2xlLmxvZygnZGVsZXRlUG9seWdvbjogJywgcG9seWdvbik7XHJcbiAgICBpZiAodGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueTtcclxuICAgICAgICBjb25zdCBsYXRsbmdzID0gbGF5ZXIuZ2V0TGF0TG5ncygpO1xyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGxhdGxuZ3MubGVuZ3RoO1xyXG4gICAgICAgIC8vICA9IFtdXHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICBsZXQgcG9seWdvbjM7XHJcbiAgICAgICAgICBjb25zdCB0ZXN0ID0gWy4uLmxhdGxuZ107XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2cobGF0bG5nKTtcclxuICAgICAgICAgIGlmIChsYXRsbmcubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAvKiBpZiAobGF0bG5nWzBdWzBdICE9PSBsYXRsbmdbMF1bbGF0bG5nWzBdLmxlbmd0aCAtIDFdKSB7XHJcbiAgICAgICAgICAgICAgdGVzdFswXS5wdXNoKGxhdGxuZ1swXVswXSk7XHJcbiAgICAgICAgICAgICAgfSAgKi9cclxuXHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gW3Rlc3RbMF1dO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXSAhPT0gbGF0bG5nW2xhdGxuZy5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICAgIHRlc3QucHVzaChsYXRsbmdbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gdGVzdDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnVGVzdDogJywgcG9seWdvbjMpO1xyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKHBvbHlnb24pO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGVxdWFscyA9IHRoaXMucG9seWdvbkFycmF5RXF1YWxzKHBvbHlnb24zLCBwb2x5Z29uKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdlcXVhbHM6ICcsIGVxdWFscywgJyBsZW5ndGg6ICcsIGxlbmd0aCk7XHJcbiAgICAgICAgICBpZiAoZXF1YWxzICYmIGxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVxdWFscyAmJiBsZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVRyYXNoQ2FuT25NdWx0aShbcG9seWdvbl0pO1xyXG4gICAgICAgICAgICBsYXRsbmdzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIGxheWVyLnNldExhdExuZ3MobGF0bG5ncyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxheWVyLnRvR2VvSlNPTigpLCBmYWxzZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcmVtb3ZlQWxsRmVhdHVyZUdyb3VwcygpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwicmVtb3ZlQWxsRmVhdHVyZUdyb3Vwc1wiLCBudWxsKTtcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXBzID0+IHtcclxuICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3Vwcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gW107XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICAvLyB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnJlc2V0KCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi51cGRhdGVQb2x5Z29ucygpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgZ2V0RHJhd01vZGUoKTogRHJhd01vZGUge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJnZXREcmF3TW9kZVwiLCBudWxsKTtcclxuICAgIHJldHVybiB0aGlzLmRyYXdNb2RlU3ViamVjdC52YWx1ZTtcclxuICB9XHJcblxyXG4gIGFkZFZpa2VuKHBvbHlnb24pIHtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHBvbHlnb24sIHRydWUpO1xyXG4gIH1cclxuXHJcbiAgLy8gY2hlY2sgdGhpc1xyXG4gIGFkZEF1dG9Qb2x5Z29uKGdlb2dyYXBoaWNCb3JkZXJzOiBMLkxhdExuZ1tdW10pOiB2b2lkIHtcclxuICAgIGNvbnN0IGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXAgPSBuZXcgTC5GZWF0dXJlR3JvdXAoKTtcclxuXHJcbiAgICBjb25zdCBwb2x5Z29uMiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24odGhpcy5jb252ZXJ0VG9Db29yZHMoZ2VvZ3JhcGhpY0JvcmRlcnMpKTtcclxuICAgIGNvbnNvbGUubG9nKHBvbHlnb24yKTtcclxuICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLmdldFBvbHlnb24ocG9seWdvbjIpO1xyXG5cclxuICAgIGZlYXR1cmVHcm91cC5hZGRMYXllcihwb2x5Z29uKTtcclxuICAgIGNvbnN0IG1hcmtlckxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcclxuICAgIGNvbnNvbGUubG9nKCdtYXJrZXJzOiAnLCBtYXJrZXJMYXRsbmdzKTtcclxuICAgIG1hcmtlckxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgcG9seWdvbi5mb3JFYWNoKChwb2x5RWxlbWVudCwgaSkgPT4ge1xyXG4gICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLmFkZE1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hZGRIb2xlTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ0h1bGw6ICcsIHBvbHlFbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyB0aGlzLmFkZE1hcmtlcihwb2x5Z29uWzBdLCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAvLyBUT0RPIC0gSHZpcyBwb2x5Z29uLmxlbmd0aCA+MSwgc8OlIGhhciBkZW4gaHVsbDogZWdlbiBhZGRNYXJrZXIgZnVua3Nqb25cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzKTtcclxuICB9XHJcblxyXG4gIC8vIGlubmVow6VsbCBpIGlmJ2FyIGZseXR0YSB0aWxsIGVnbmEgbWV0b2RlclxyXG4gIHByaXZhdGUgY29udmVydFRvQ29vcmRzKGxhdGxuZ3M6IElMYXRMbmdbXVtdKSB7XHJcbiAgICBjb25zdCBjb29yZHMgPSBbXTtcclxuICAgIGNvbnNvbGUubG9nKGxhdGxuZ3MubGVuZ3RoLCBsYXRsbmdzKTtcclxuICAgIGlmIChsYXRsbmdzLmxlbmd0aCA+IDEgJiYgbGF0bG5ncy5sZW5ndGggPCAzKSB7XHJcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvbnNvbGUubG9nKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdKSwgbGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdLmxlbmd0aCk7XHJcbiAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSksIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSkpO1xyXG4gICAgICBpZiAod2l0aGluKSB7XHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgY29vcmRpbmF0ZXMucHVzaChMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHBvbHlnb24pKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPj0gMSkge1xyXG4gICAgICAgIGNvb3Jkcy5wdXNoKGNvb3JkaW5hdGVzKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZygnV2l0aGluMSAnLCB3aXRoaW4pO1xyXG4gICAgfSBlbHNlIGlmIChsYXRsbmdzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAxOyBpbmRleCA8IGxhdGxuZ3MubGVuZ3RoIC0gMTsgaW5kZXgrKykge1xyXG4gICAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbaW5kZXhdKSwgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKSk7XHJcbiAgICAgICAgaWYgKHdpdGhpbikge1xyXG4gICAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICBjb29yZGluYXRlcy5wdXNoKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbikpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbildKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSldKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKGNvb3Jkcyk7XHJcbiAgICByZXR1cm4gY29vcmRzO1xyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgaW5pdFBvbHlEcmF3KCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJpbml0UG9seURyYXdcIiwgbnVsbCk7XHJcblxyXG4gICAgY29uc3QgY29udGFpbmVyOiBIVE1MRWxlbWVudCA9IHRoaXMubWFwLmdldENvbnRhaW5lcigpO1xyXG4gICAgY29uc3QgZHJhd01vZGUgPSB0aGlzLmdldERyYXdNb2RlKCk7XHJcbiAgICBpZiAodGhpcy5jb25maWcudG91Y2hTdXBwb3J0KSB7XHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcclxuICAgICAgICAgIHRoaXMubW91c2VEb3duKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBlID0+IHtcclxuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xyXG4gICAgICAgICAgdGhpcy5tb3VzZVVwTGVhdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGUgPT4ge1xyXG4gICAgICAgIGlmIChkcmF3TW9kZSAhPT0gRHJhd01vZGUuT2ZmKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdXNlTW92ZShlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWFwLmFkZExheWVyKHRoaXMudHJhY2VyKTtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuICB9XHJcbiAgLy8gVGVzdCBMLk1vdXNlRXZlbnRcclxuICBwcml2YXRlIG1vdXNlRG93bihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coJ21vdXNlRG93bicsIGV2ZW50KTtcclxuXHJcbiAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW2V2ZW50LmxhdGxuZ10pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgbGF0bG5nID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhbZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLCBldmVudC50b3VjaGVzWzBdLmNsaWVudFldKTtcclxuICAgICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbbGF0bG5nXSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXJ0RHJhdygpO1xyXG4gIH1cclxuXHJcbiAgLy8gVE9ETyBldmVudCB0eXBlLCBjcmVhdGUgY29udGFpbmVyUG9pbnRUb0xhdExuZy1tZXRob2RcclxuICBwcml2YXRlIG1vdXNlTW92ZShldmVudCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJtb3VzZU1vdmVcIiwgZXZlbnQpO1xyXG5cclxuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9IG51bGwpIHtcclxuICAgICAgdGhpcy50cmFjZXIuYWRkTGF0TG5nKGV2ZW50LmxhdGxuZyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBsYXRsbmcgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKFtldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WV0pO1xyXG4gICAgICB0aGlzLnRyYWNlci5hZGRMYXRMbmcobGF0bG5nKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIG1vdXNlVXBMZWF2ZSgpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwibW91c2VVcExlYXZlXCIsIG51bGwpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1EZWxldGUgdHJhc2hjYW5zXCIsIG51bGwpO1xyXG4gICAgY29uc3QgZ2VvUG9zOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+ID0gdGhpcy50dXJmSGVscGVyLnR1cmZDb25jYXZlbWFuKHRoaXMudHJhY2VyLnRvR2VvSlNPTigpIGFzIGFueSk7XHJcbiAgICB0aGlzLnN0b3BEcmF3KCk7XHJcbiAgICBzd2l0Y2ggKHRoaXMuZ2V0RHJhd01vZGUoKSkge1xyXG4gICAgICBjYXNlIERyYXdNb2RlLkFkZFBvbHlnb246XHJcbiAgICAgICAgdGhpcy5hZGRQb2x5Z29uKGdlb1BvcywgdHJ1ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgRHJhd01vZGUuU3VidHJhY3RQb2x5Z29uOlxyXG4gICAgICAgIHRoaXMuc3VidHJhY3RQb2x5Z29uKGdlb1Bvcyk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tY3JlYXRlIHRyYXNoY2Fuc1wiLCBudWxsKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc3RhcnREcmF3KCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJzdGFydERyYXdcIiwgbnVsbCk7XHJcblxyXG4gICAgdGhpcy5kcmF3U3RhcnRlZEV2ZW50cyh0cnVlKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc3RvcERyYXcoKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInN0b3BEcmF3XCIsIG51bGwpO1xyXG5cclxuICAgIHRoaXMucmVzZXRUcmFja2VyKCk7XHJcbiAgICB0aGlzLmRyYXdTdGFydGVkRXZlbnRzKGZhbHNlKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZHJhd1N0YXJ0ZWRFdmVudHMob25vZmY6IGJvb2xlYW4pIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZHJhd1N0YXJ0ZWRFdmVudHNcIiwgb25vZmYpO1xyXG5cclxuICAgIGNvbnN0IG9ub3JvZmYgPSBvbm9mZiA/ICdvbicgOiAnb2ZmJztcclxuXHJcbiAgICB0aGlzLm1hcFtvbm9yb2ZmXSgnbW91c2Vtb3ZlJywgdGhpcy5tb3VzZU1vdmUsIHRoaXMpO1xyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oJ21vdXNldXAnLCB0aGlzLm1vdXNlVXBMZWF2ZSwgdGhpcyk7XHJcbiAgfVxyXG4gIC8vIE9uIGhvbGRcclxuICBwcml2YXRlIHN1YnRyYWN0UG9seWdvbihsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICB0aGlzLnN1YnRyYWN0KGxhdGxuZ3MpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBhZGRQb2x5Z29uKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sIHNpbXBsaWZ5OiBib29sZWFuLCBub01lcmdlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGNvbnNvbGUubG9nKCdhZGRQb2x5Z29uJywgbGF0bG5ncywgc2ltcGxpZnksIG5vTWVyZ2UsIHRoaXMua2lua3MsIHRoaXMuY29uZmlnKTtcclxuXHJcbiAgICBpZiAodGhpcy5tZXJnZVBvbHlnb25zICYmICFub01lcmdlICYmIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCAmJiAhdGhpcy5raW5rcykge1xyXG4gICAgICB0aGlzLm1lcmdlKGxhdGxuZ3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobGF0bG5ncywgc2ltcGxpZnkpO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBhZGRQb2x5Z29uTGF5ZXIobGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiwgc2ltcGxpZnk6IGJvb2xlYW4pIHtcclxuICAgIGNvbnN0IGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXAgPSBuZXcgTC5GZWF0dXJlR3JvdXAoKTtcclxuXHJcbiAgICBjb25zdCBsYXRMbmdzID0gc2ltcGxpZnkgPyB0aGlzLnR1cmZIZWxwZXIuZ2V0U2ltcGxpZmllZChsYXRsbmdzKSA6IGxhdGxuZ3M7XHJcbiAgICBjb25zb2xlLmxvZygnQWRkUG9seWdvbkxheWVyOiAnLCBsYXRMbmdzKTtcclxuICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLmdldFBvbHlnb24obGF0TG5ncyk7XHJcbiAgICBmZWF0dXJlR3JvdXAuYWRkTGF5ZXIocG9seWdvbik7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uKTtcclxuICAgIGNvbnN0IG1hcmtlckxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcclxuICAgIG1hcmtlckxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgcG9seWdvbi5mb3JFYWNoKChwb2x5RWxlbWVudDogSUxhdExuZ1tdLCBpOiBudW1iZXIpID0+IHtcclxuICAgICAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgdGhpcy5hZGRNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuYWRkSG9sZU1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdIdWxsOiAnLCBwb2x5RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgLy8gdGhpcy5hZGRNYXJrZXIocG9seWdvblswXSwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgLy8gVE9ETyAtIEh2aXMgcG9seWdvbi5sZW5ndGggPjEsIHPDpSBoYXIgZGVuIGh1bGw6IGVnZW4gYWRkTWFya2VyIGZ1bmtzam9uXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgIGNvbnNvbGUubG9nKCdBcnJheTogJywgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcyk7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XHJcblxyXG4gICAgZmVhdHVyZUdyb3VwLm9uKCdjbGljaycsIGUgPT4ge1xyXG4gICAgICB0aGlzLnBvbHlnb25DbGlja2VkKGUsIGxhdExuZ3MpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHBvbHlnb25DbGlja2VkKGU6IGFueSwgcG9seTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3QgbmV3UG9pbnQgPSBlLmxhdGxuZztcclxuICAgIGlmIChwb2x5Lmdlb21ldHJ5LnR5cGUgPT09ICdNdWx0aVBvbHlnb24nKSB7XHJcbiAgICAgIGNvbnN0IG5ld1BvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIuaW5qZWN0UG9pbnRUb1BvbHlnb24ocG9seSwgW25ld1BvaW50LmxuZywgbmV3UG9pbnQubGF0XSk7XHJcbiAgICAgIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihwb2x5KSk7XHJcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld1BvbHlnb24sIGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZ2V0UG9seWdvbihsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zb2xlLmxvZygnZ2V0UG9seWdvbnM6ICcsIGxhdGxuZ3MpO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IEwuR2VvSlNPTi5nZW9tZXRyeVRvTGF5ZXIobGF0bG5ncykgYXMgYW55O1xyXG5cclxuICAgIHBvbHlnb24uc2V0U3R5bGUodGhpcy5jb25maWcucG9seWdvbk9wdGlvbnMpO1xyXG4gICAgcmV0dXJuIHBvbHlnb247XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIG1lcmdlKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnNvbGUubG9nKCdtZXJnZScsIGxhdGxuZ3MpO1xyXG4gICAgY29uc3QgcG9seWdvbkZlYXR1cmUgPSBbXTtcclxuICAgIGNvbnN0IG5ld0FycmF5OiBMLkZlYXR1cmVHcm91cFtdID0gW107XHJcbiAgICBsZXQgcG9seUludGVyc2VjdGlvbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuICAgICAgY29uc29sZS5sb2coJ01lcmdlcjogJywgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0pO1xyXG4gICAgICBpZiAoZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihbZWxlbWVudF0pO1xyXG4gICAgICAgICAgcG9seUludGVyc2VjdGlvbiA9IHRoaXMudHVyZkhlbHBlci5wb2x5Z29uSW50ZXJzZWN0KGZlYXR1cmUsIGxhdGxuZ3MpO1xyXG4gICAgICAgICAgaWYgKHBvbHlJbnRlcnNlY3Rpb24pIHtcclxuICAgICAgICAgICAgbmV3QXJyYXkucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgICBwb2x5Z29uRmVhdHVyZS5wdXNoKGZlYXR1cmUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24oZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0pO1xyXG4gICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcclxuICAgICAgICBpZiAocG9seUludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY29uc29sZS5sb2cobmV3QXJyYXkpO1xyXG4gICAgaWYgKG5ld0FycmF5Lmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy51bmlvblBvbHlnb25zKG5ld0FycmF5LCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXRsbmdzLCB0cnVlKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gbmV4dFxyXG4gIHByaXZhdGUgc3VidHJhY3QobGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgbGV0IGFkZEhvbGUgPSBsYXRsbmdzO1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXTtcclxuICAgICAgY29uc3QgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcclxuICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXSk7XHJcbiAgICAgIGNvbnN0IG5ld1BvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkRpZmZlcmVuY2UoZmVhdHVyZSwgYWRkSG9sZSk7XHJcbiAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihwb2x5KTtcclxuICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgIGFkZEhvbGUgPSBuZXdQb2x5Z29uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbmV3TGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiA9IGFkZEhvbGU7XHJcbiAgICBjb25zdCBjb29yZHMgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0Q29vcmRzKG5ld0xhdGxuZ3MpO1xyXG4gICAgY29vcmRzLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcih0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFt2YWx1ZV0pLCB0cnVlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBldmVudHMob25vZmY6IGJvb2xlYW4pIHtcclxuICAgIGNvbnN0IG9ub3JvZmYgPSBvbm9mZiA/ICdvbicgOiAnb2ZmJztcclxuICAgIHRoaXMubWFwW29ub3JvZmZdKCdtb3VzZWRvd24nLCB0aGlzLm1vdXNlRG93biwgdGhpcyk7XHJcbiAgfVxyXG4gIC8vIGZpbmUsIFRPRE86IGlmIHNwZWNpYWwgbWFya2Vyc1xyXG4gIHByaXZhdGUgYWRkTWFya2VyKGxhdGxuZ3M6IElMYXRMbmdbXSwgRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG5cclxuICAgIGNvbnN0IG1lbnVNYXJrZXJJZHggPSB0aGlzLmdldE1hcmtlckluZGV4KGxhdGxuZ3MsIHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyTWVudUljb24ucG9zaXRpb24pO1xyXG4gICAgY29uc3QgZGVsZXRlTWFya2VySWR4ID0gdGhpcy5nZXRNYXJrZXJJbmRleChsYXRsbmdzLCB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckRlbGV0ZUljb24ucG9zaXRpb24pO1xyXG5cclxuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XHJcbiAgICAgIGxldCBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VySWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIGlmIChpID09PSBtZW51TWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGkgPT09IGRlbGV0ZU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5NYXJrZXIobGF0bG5nLCB7IGljb246IHRoaXMuY3JlYXRlRGl2SWNvbihpY29uQ2xhc3NlcyksIGRyYWdnYWJsZTogdHJ1ZSwgdGl0bGU6IGkudG9TdHJpbmcoKSB9KTtcclxuICAgICAgRmVhdHVyZUdyb3VwLmFkZExheWVyKG1hcmtlcikuYWRkVG8odGhpcy5tYXApO1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkZlYXR1cmVHcm91cDogXCIsIEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIG1hcmtlci5vbignZHJhZycsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZyhGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgbWFya2VyLm9uKCdkcmFnZW5kJywgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoaSA9PT0gbWVudU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuXHJcblxyXG4gICAgICAgIC8vIG1hcmtlci5iaW5kUG9wdXAoXHJcbiAgICAgICAgLy8gICB0aGlzLmdldEh0bWxDb250ZW50KGUgPT4ge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImNsaWNrZWQgb25cIiwgZS50YXJnZXQpO1xyXG4gICAgICAgIC8vICAgfSlcclxuICAgICAgICAvLyApO1xyXG4gICAgICAgIG1hcmtlci5vbignY2xpY2snLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuY29udmVydFRvQm91bmRzUG9seWdvbihsYXRsbmdzLCB0cnVlKTtcclxuICAgICAgICAgIC8vIHRoaXMuY29udmVydFRvU2ltcGxpZmllZFBvbHlnb24obGF0bG5ncyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGkgPT09IGRlbGV0ZU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIG1hcmtlci5vbignY2xpY2snLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkSG9sZU1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XHJcbiAgICAgIGNvbnN0IGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgLyogIGlmIChpID09PSAwICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vVE9ETy0gbGVnZyB0aWwgZmlsbCBpY29uXHJcbiAgICAgIGlmIChpID09PSBsYXRsbmdzLmxlbmd0aCAtIDEgJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH0gKi9cclxuICAgICAgY29uc3QgbWFya2VyID0gbmV3IEwuTWFya2VyKGxhdGxuZywgeyBpY29uOiB0aGlzLmNyZWF0ZURpdkljb24oaWNvbkNsYXNzZXMpLCBkcmFnZ2FibGU6IHRydWUsIHRpdGxlOiBpLnRvU3RyaW5nKCkgfSk7XHJcbiAgICAgIEZlYXR1cmVHcm91cC5hZGRMYXllcihtYXJrZXIpLmFkZFRvKHRoaXMubWFwKTtcclxuXHJcbiAgICAgIG1hcmtlci5vbignZHJhZycsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZyhGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgbWFya2VyLm9uKCdkcmFnZW5kJywgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvKiAgIGlmIChpID09PSAwICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIG1hcmtlci5iaW5kUG9wdXAodGhpcy5nZXRIdG1sQ29udGVudCgoZSkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJjbGlja2VkIG9uXCIsIGUudGFyZ2V0KTtcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgLy8gbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgLy8gICB0aGlzLnRvZ2dsZU1hcmtlck1lbnUoKTtcclxuICAgICAgICAvLyB9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09PSBsYXRsbmdzLmxlbmd0aCAtIDEgJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9ICovXHJcbiAgICB9KTtcclxuICB9XHJcbiAgcHJpdmF0ZSBjcmVhdGVEaXZJY29uKGNsYXNzTmFtZXM6IHN0cmluZ1tdKTogTC5EaXZJY29uIHtcclxuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcclxuICAgIGNvbnN0IGljb24gPSBMLmRpdkljb24oeyBjbGFzc05hbWU6IGNsYXNzZXMgfSk7XHJcbiAgICByZXR1cm4gaWNvbjtcclxuICB9XHJcbiAgLy8gVE9ETzogQ2xlYW51cFxyXG4gIHByaXZhdGUgbWFya2VyRHJhZyhGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICBjb25zdCBuZXdQb3MgPSBbXTtcclxuICAgIGxldCB0ZXN0YXJyYXkgPSBbXTtcclxuICAgIGxldCBob2xlID0gW107XHJcbiAgICBjb25zdCBsYXllckxlbmd0aCA9IEZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSBhcyBhbnk7XHJcbiAgICBjb25zdCBwb3NhcnJheXMgPSBsYXllckxlbmd0aFswXS5nZXRMYXRMbmdzKCk7XHJcbiAgICBjb25zb2xlLmxvZyhwb3NhcnJheXMpO1xyXG4gICAgY29uc29sZS5sb2coJ21hcmtlcmRyYWc6ICcsIGxheWVyTGVuZ3RoKTtcclxuICAgIGxldCBsZW5ndGggPSAwO1xyXG4gICAgaWYgKHBvc2FycmF5cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NhcnJheXMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgdGVzdGFycmF5ID0gW107XHJcbiAgICAgICAgaG9sZSA9IFtdO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdQb3Npc2pvbmVyOiAnLCBwb3NhcnJheXNbaW5kZXhdKTtcclxuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF0ubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaW5kZXggPCBwb3NhcnJheXNbMF0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUG9zaXNqb25lciAyOiAnLCBwb3NhcnJheXNbaW5kZXhdW2ldKTtcclxuXHJcbiAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1baV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVswXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnSG9sZTogJywgaG9sZSk7XHJcbiAgICAgICAgICBuZXdQb3MucHVzaChob2xlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGVuZ3RoICs9IHBvc2FycmF5c1tpbmRleCAtIDFdWzBdLmxlbmd0aDtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdTVGFydCBpbmRleDogJywgbGVuZ3RoKTtcclxuICAgICAgICAgIGZvciAobGV0IGogPSBsZW5ndGg7IGogPCBwb3NhcnJheXNbaW5kZXhdWzBdLmxlbmd0aCArIGxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKChsYXllckxlbmd0aFtqICsgMV0gYXMgYW55KS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBob2xlLnB1c2godGVzdGFycmF5KTtcclxuICAgICAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gdGVzdGFycmF5ID0gW11cclxuICAgICAgaG9sZSA9IFtdO1xyXG4gICAgICBsZXQgbGVuZ3RoMiA9IDA7XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NhcnJheXNbMF0ubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgdGVzdGFycmF5ID0gW107XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1BvbHlnb24gZHJhZzogJywgcG9zYXJyYXlzWzBdW2luZGV4XSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICBpZiAocG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdWzBdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZW5ndGgyICs9IHBvc2FycmF5c1swXVtpbmRleCAtIDFdLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoMjsgaiA8IHBvc2FycmF5c1swXVtpbmRleF0ubGVuZ3RoICsgbGVuZ3RoMjsgaisrKSB7XHJcbiAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICB9XHJcbiAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICBjb25zb2xlLmxvZygnSG9sZSAyOiAnLCBob2xlKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKCdOeWUgcG9zaXNqb25lcjogJywgbmV3UG9zKTtcclxuICAgIGxheWVyTGVuZ3RoWzBdLnNldExhdExuZ3MobmV3UG9zKTtcclxuICB9XHJcbiAgLy8gY2hlY2sgdGhpc1xyXG4gIHByaXZhdGUgbWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICBjb25zdCBmZWF0dXJlQ29sbGVjdGlvbiA9IEZlYXR1cmVHcm91cC50b0dlb0pTT04oKSBhcyBhbnk7XHJcbiAgICBjb25zb2xlLmxvZygnTWFya2VyZHJhZ2VuZCBwb2x5Z29uOiAnLCBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcyk7XHJcbiAgICBpZiAoZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFtlbGVtZW50XSk7XHJcblxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnTWFya2VyZHJhZ2VuZDogJywgZmVhdHVyZSk7XHJcbiAgICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xyXG4gICAgICAgICAgdGhpcy5raW5rcyA9IHRydWU7XHJcbiAgICAgICAgICBjb25zdCB1bmtpbmsgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0S2lua3MoZmVhdHVyZSk7XHJcbiAgICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdVbmtpbms6ICcsIHVua2luayk7XHJcbiAgICAgICAgICB1bmtpbmsuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihwb2x5Z29uKSwgZmFsc2UsIHRydWUpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMua2lua3MgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMuYWRkUG9seWdvbihmZWF0dXJlLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcclxuICAgICAgY29uc29sZS5sb2coJ01hcmtlcmRyYWdlbmQ6ICcsIGZlYXR1cmUpO1xyXG4gICAgICBpZiAodGhpcy50dXJmSGVscGVyLmhhc0tpbmtzKGZlYXR1cmUpKSB7XHJcbiAgICAgICAgdGhpcy5raW5rcyA9IHRydWU7XHJcbiAgICAgICAgY29uc3QgdW5raW5rID0gdGhpcy50dXJmSGVscGVyLmdldEtpbmtzKGZlYXR1cmUpO1xyXG4gICAgICAgIC8vIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihmZWF0dXJlKSk7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnVW5raW5rOiAnLCB1bmtpbmspO1xyXG4gICAgICAgIHVua2luay5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihwb2x5Z29uKSwgZmFsc2UsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihmZWF0dXJlKSk7XHJcbiAgICAgICAgdGhpcy5raW5rcyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbihmZWF0dXJlLCBmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UodGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcyk7XHJcbiAgfVxyXG4gIC8vIGZpbmUsIGNoZWNrIHRoZSByZXR1cm5lZCB0eXBlXHJcbiAgcHJpdmF0ZSBnZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPik6IElMYXRMbmdbXVtdIHtcclxuICAgIGNvbnNvbGUubG9nKCdnZXRMYXRMbmdzRnJvbUpzb246ICcsIGZlYXR1cmUpO1xyXG4gICAgbGV0IGNvb3JkO1xyXG4gICAgaWYgKGZlYXR1cmUpIHtcclxuICAgICAgaWYgKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSAmJiBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT09ICdNdWx0aVBvbHlnb24nKSB7XHJcbiAgICAgICAgY29vcmQgPSBMLkdlb0pTT04uY29vcmRzVG9MYXRMbmdzKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1bMF0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0ubGVuZ3RoID4gMSAmJiBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJykge1xyXG4gICAgICAgIGNvb3JkID0gTC5HZW9KU09OLmNvb3Jkc1RvTGF0TG5ncyhmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29vcmQ7XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSB1bmlvblBvbHlnb25zKGxheWVycywgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiwgcG9seWdvbkZlYXR1cmUpIHtcclxuICAgIGNvbnNvbGUubG9nKCd1bmlvblBvbHlnb25zJywgbGF5ZXJzLCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XHJcblxyXG4gICAgbGV0IGFkZE5ldyA9IGxhdGxuZ3M7XHJcbiAgICBsYXllcnMuZm9yRWFjaCgoZmVhdHVyZUdyb3VwLCBpKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpO1xyXG4gICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdO1xyXG4gICAgICBjb25zdCBwb2x5ID0gdGhpcy5nZXRMYXRMbmdzRnJvbUpzb24obGF5ZXIpO1xyXG4gICAgICBjb25zdCB1bmlvbiA9IHRoaXMudHVyZkhlbHBlci51bmlvbihhZGROZXcsIHBvbHlnb25GZWF0dXJlW2ldKTsgLy8gQ2hlY2sgZm9yIG11bHRpcG9seWdvbnNcclxuICAgICAgLy8gTmVlZHMgYSBjbGVhbnVwIGZvciB0aGUgbmV3IHZlcnNpb25cclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uT25NZXJnZShwb2x5KTtcclxuICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICAgIGFkZE5ldyA9IHVuaW9uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbmV3TGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiA9IGFkZE5ldzsgLy8gVHJlbmdlciBrYW5za2plIHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbiggYWRkTmV3KTtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld0xhdGxuZ3MsIHRydWUpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgY29uc29sZS5sb2coJ3JlbW92ZUZlYXR1cmVHcm91cCcsIGZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5maWx0ZXIoZmVhdHVyZUdyb3VwcyA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXApO1xyXG4gICAgLy8gdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3VwKTtcclxuICB9XHJcbiAgLy8gZmluZSB1bnRpbCByZWZhY3RvcmluZ1xyXG4gIHByaXZhdGUgcmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICBjb25zb2xlLmxvZygncmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZScsIGZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgY29uc3QgbmV3QXJyYXkgPSBbXTtcclxuICAgIGlmIChmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0pIHtcclxuICAgICAgY29uc3QgcG9seWdvbiA9IChmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55KS5nZXRMYXRMbmdzKClbMF07XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZm9yRWFjaCh2ID0+IHtcclxuICAgICAgICBpZiAodi5wb2x5Z29uLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF0udG9TdHJpbmcoKSAmJiB2LnBvbHlnb25bMF0udG9TdHJpbmcoKSA9PT0gcG9seWdvblswXVswXS50b1N0cmluZygpKSB7XHJcbiAgICAgICAgICB2LnBvbHlnb24gPSBwb2x5Z29uO1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaCh2KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh2LnBvbHlnb24udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXS50b1N0cmluZygpICYmIHYucG9seWdvblswXS50b1N0cmluZygpICE9PSBwb2x5Z29uWzBdWzBdLnRvU3RyaW5nKCkpIHtcclxuICAgICAgICAgIG5ld0FycmF5LnB1c2godik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMgPSB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZpbHRlcihmZWF0dXJlR3JvdXBzID0+IGZlYXR1cmVHcm91cHMgIT09IGZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXHJcbiAgcHJpdmF0ZSBkZWxldGVQb2x5Z29uT25NZXJnZShwb2x5Z29uKSB7XHJcbiAgICBjb25zb2xlLmxvZygnZGVsZXRlUG9seWdvbk9uTWVyZ2UnLCBwb2x5Z29uKTtcclxuICAgIGxldCBwb2x5Z29uMiA9IFtdO1xyXG4gICAgaWYgKHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSBhcyBhbnk7XHJcbiAgICAgICAgY29uc3QgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKVswXTtcclxuICAgICAgICBwb2x5Z29uMiA9IFsuLi5sYXRsbmdzWzBdXTtcclxuICAgICAgICBpZiAobGF0bG5nc1swXVswXSAhPT0gbGF0bG5nc1swXVtsYXRsbmdzWzBdLmxlbmd0aCAtIDFdKSB7XHJcbiAgICAgICAgICBwb2x5Z29uMi5wdXNoKGxhdGxuZ3NbMF1bMF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBlcXVhbHMgPSB0aGlzLnBvbHlnb25BcnJheUVxdWFsc01lcmdlKHBvbHlnb24yLCBwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgaWYgKGVxdWFscykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ0VRVUFMUycsIHBvbHlnb24pO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seWdvbik7XHJcbiAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuICAgICAgICAgIC8vIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFsc01lcmdlKHBvbHkxOiBhbnlbXSwgcG9seTI6IGFueVtdKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gcG9seTEudG9TdHJpbmcoKSA9PT0gcG9seTIudG9TdHJpbmcoKTtcclxuICB9XHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFscyhwb2x5MTogYW55W10sIHBvbHkyOiBhbnlbXSk6IGJvb2xlYW4ge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJwb2x5Z29uQXJyYXlFcXVhbHNcIiwgcG9seTEsIHBvbHkyKTtcclxuXHJcbiAgICBpZiAocG9seTFbMF1bMF0pIHtcclxuICAgICAgaWYgKCFwb2x5MVswXVswXS5lcXVhbHMocG9seTJbMF1bMF0pKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKCFwb2x5MVswXS5lcXVhbHMocG9seTJbMF0pKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgfVxyXG4gICAgaWYgKHBvbHkxLmxlbmd0aCAhPT0gcG9seTIubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBzZXRMZWFmbGV0TWFwRXZlbnRzKGVuYWJsZURyYWdnaW5nOiBib29sZWFuLCBlbmFibGVEb3VibGVDbGlja1pvb206IGJvb2xlYW4sIGVuYWJsZVNjcm9sbFdoZWVsWm9vbTogYm9vbGVhbikge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJzZXRMZWFmbGV0TWFwRXZlbnRzXCIsIGVuYWJsZURyYWdnaW5nLCBlbmFibGVEb3VibGVDbGlja1pvb20sIGVuYWJsZVNjcm9sbFdoZWVsWm9vbSk7XHJcblxyXG4gICAgZW5hYmxlRHJhZ2dpbmcgPyB0aGlzLm1hcC5kcmFnZ2luZy5lbmFibGUoKSA6IHRoaXMubWFwLmRyYWdnaW5nLmRpc2FibGUoKTtcclxuICAgIGVuYWJsZURvdWJsZUNsaWNrWm9vbSA/IHRoaXMubWFwLmRvdWJsZUNsaWNrWm9vbS5lbmFibGUoKSA6IHRoaXMubWFwLmRvdWJsZUNsaWNrWm9vbS5kaXNhYmxlKCk7XHJcbiAgICBlbmFibGVTY3JvbGxXaGVlbFpvb20gPyB0aGlzLm1hcC5zY3JvbGxXaGVlbFpvb20uZW5hYmxlKCkgOiB0aGlzLm1hcC5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgc2V0RHJhd01vZGUobW9kZTogRHJhd01vZGUpIHtcclxuICAgIGNvbnNvbGUubG9nKCdzZXREcmF3TW9kZScsIHRoaXMubWFwKTtcclxuICAgIHRoaXMuZHJhd01vZGVTdWJqZWN0Lm5leHQobW9kZSk7XHJcbiAgICBpZiAoISF0aGlzLm1hcCkge1xyXG4gICAgICBsZXQgaXNBY3RpdmVEcmF3TW9kZSA9IHRydWU7XHJcbiAgICAgIHN3aXRjaCAobW9kZSkge1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuT2ZmOlxyXG4gICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMubWFwLmdldENvbnRhaW5lcigpLCAnY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkJyk7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50cyhmYWxzZSk7XHJcbiAgICAgICAgICB0aGlzLnN0b3BEcmF3KCk7XHJcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XHJcbiAgICAgICAgICAgIGNvbG9yOiAnJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLnNldExlYWZsZXRNYXBFdmVudHModHJ1ZSwgdHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgICBpc0FjdGl2ZURyYXdNb2RlID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIERyYXdNb2RlLkFkZFBvbHlnb246XHJcbiAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksICdjcm9zc2hhaXItY3Vyc29yLWVuYWJsZWQnKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKHRydWUpO1xyXG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xyXG4gICAgICAgICAgICBjb2xvcjogZGVmYXVsdENvbmZpZy5wb2x5TGluZU9wdGlvbnMuY29sb3JcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5zZXRMZWFmbGV0TWFwRXZlbnRzKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdFBvbHlnb246XHJcbiAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksICdjcm9zc2hhaXItY3Vyc29yLWVuYWJsZWQnKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKHRydWUpO1xyXG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xyXG4gICAgICAgICAgICBjb2xvcjogJyNEOTQ2MEYnXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyhmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBtb2RlQ2hhbmdlKG1vZGU6IERyYXdNb2RlKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKG1vZGUpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXHJcbiAgZHJhd01vZGVDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuQWRkUG9seWdvbik7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcclxuICBmcmVlZHJhd01lbnVDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuQWRkUG9seWdvbik7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXHJcbiAgc3VidHJhY3RDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuU3VidHJhY3RQb2x5Z29uKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgcmVzZXRUcmFja2VyKCkge1xyXG4gICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbWzAsIDBdXSk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVNYXJrZXJNZW51KCk6IHZvaWQge1xyXG4gICAgYWxlcnQoJ29wZW4gbWVudScpO1xyXG4gIH1cclxuICBwcml2YXRlIGdldEh0bWxDb250ZW50KGNhbGxCYWNrOiBGdW5jdGlvbik6IEhUTUxFbGVtZW50IHtcclxuICAgIGNvbnN0IGNvbXAgPSB0aGlzLnBvcHVwR2VuZXJhdG9yLmdlbmVyYXRlQWx0ZXJQb3B1cCgpO1xyXG4gICAgY29tcC5pbnN0YW5jZS5iYm94Q2xpY2tlZC5zdWJzY3JpYmUoZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdiYm94IGNsaWNrZWQnLCBlKTtcclxuICAgICAgY2FsbEJhY2soZSk7XHJcbiAgICB9KTtcclxuICAgIGNvbXAuaW5zdGFuY2Uuc2ltcGx5ZmlDbGlja2VkLnN1YnNjcmliZShlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ3NpbXBseWZpIGNsaWNrZWQnLCBlKTtcclxuICAgICAgY2FsbEJhY2soZSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb21wLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgfVxyXG4gIHByaXZhdGUgY29udmVydFRvQm91bmRzUG9seWdvbihsYXRsbmdzOiBJTGF0TG5nW10sIGFkZE1pZHBvaW50TWFya2VyczogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcclxuICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKHRoaXMuY29udmVydFRvQ29vcmRzKFtsYXRsbmdzXSkpO1xyXG4gICAgY29uc3QgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5jb252ZXJ0VG9Cb3VuZGluZ0JveFBvbHlnb24ocG9seWdvbiwgYWRkTWlkcG9pbnRNYXJrZXJzKTtcclxuXHJcblxyXG4gICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIodGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKG5ld1BvbHlnb24pLCBmYWxzZSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgY29udmVydFRvU2ltcGxpZmllZFBvbHlnb24obGF0bG5nczogSUxhdExuZ1tdKSB7XHJcbiAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcclxuICAgIGNvbnN0IG5ld1BvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKHRoaXMuY29udmVydFRvQ29vcmRzKFtsYXRsbmdzXSkpO1xyXG4gICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIodGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKG5ld1BvbHlnb24pLCB0cnVlKTtcclxuXHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0TWFya2VySW5kZXgobGF0bG5nczogSUxhdExuZ1tdLCBwb3NpdGlvbjogTWFya2VyUG9zaXRpb24pOiBudW1iZXIge1xyXG4gICAgY29uc3QgYm91bmRzOiBMLkxhdExuZ0JvdW5kcyA9IFBvbHlEcmF3VXRpbC5nZXRCb3VuZHMobGF0bG5ncywgKE1hdGguc3FydCgyKSAvIDIpKTtcclxuICAgIGNvbnN0IGNvbXBhc3MgPSBuZXcgQ29tcGFzcyhib3VuZHMuZ2V0U291dGgoKSwgYm91bmRzLmdldFdlc3QoKSwgYm91bmRzLmdldE5vcnRoKCksIGJvdW5kcy5nZXRFYXN0KCkpO1xyXG4gICAgY29uc3QgY29tcGFzc0RpcmVjdGlvbiA9IGNvbXBhc3MuZ2V0RGlyZWN0aW9uKHBvc2l0aW9uKTtcclxuICAgIGNvbnN0IGxhdExuZ1BvaW50OiBJTGF0TG5nID0ge1xyXG4gICAgICAgIGxhdDogY29tcGFzc0RpcmVjdGlvbi5sYXQsXHJcbiAgICAgICAgbG5nOiBjb21wYXNzRGlyZWN0aW9uLmxuZ1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHRhcmdldFBvaW50ID0gdGhpcy50dXJmSGVscGVyLmdldENvb3JkKGxhdExuZ1BvaW50KTtcclxuICAgIGNvbnN0IGZjID0gdGhpcy50dXJmSGVscGVyLmdldEZlYXR1cmVQb2ludENvbGxlY3Rpb24obGF0bG5ncyk7XHJcbiAgICBjb25zdCBuZWFyZXN0UG9pbnRJZHggPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TmVhcmVzdFBvaW50SW5kZXgodGFyZ2V0UG9pbnQsIGZjIGFzIGFueSk7XHJcblxyXG4gICAgcmV0dXJuIG5lYXJlc3RQb2ludElkeDtcclxufVxyXG5cclxuXHJcbn1cclxuLy8gZmx5dHQgdGlsIGVudW0udHNcclxuZXhwb3J0IGVudW0gRHJhd01vZGUge1xyXG4gIE9mZiA9IDAsXHJcbiAgQWRkUG9seWdvbiA9IDEsXHJcbiAgRWRpdFBvbHlnb24gPSAyLFxyXG4gIFN1YnRyYWN0UG9seWdvbiA9IDMsXHJcbiAgTG9hZFBvbHlnb24gPSA0XHJcbn1cclxuIl19