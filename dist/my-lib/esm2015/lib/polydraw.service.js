import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import * as L from 'leaflet';
// import * as turf from "@turf/turf";
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MapStateService } from './map-state.service';
import { TurfHelperService } from './turf-helper.service';
import { PolygonInformationService } from './polygon-information.service';
import defaultConfig from "./polyinfo.json";
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
            console.log("Kartet: ", map);
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
                        if (latlng[0][0] !== latlng[0][latlng[0].length - 1]) {
                            test[0].push(latlng[0][0]);
                        }
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
        console.log("initPolyDraw", this.map, this.tracer);
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
            const latlng = this.map.containerPointToLatLng([
                event.touches[0].clientX,
                event.touches[0].clientY
            ]);
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
            const latlng = this.map.containerPointToLatLng([
                event.touches[0].clientX,
                event.touches[0].clientY
            ]);
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
        if (this.mergePolygons &&
            !noMerge &&
            this.arrayOfFeatureGroups.length > 0 &&
            !this.kinks) {
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
            const newPolygon = this.turfHelper.injectPointToPolygon(poly, [
                newPoint.lng,
                newPoint.lat
            ]);
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
            const marker = new L.Marker(latlng, {
                icon: this.createDivIcon(iconClasses),
                draggable: true,
                title: i.toString()
            });
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
                // marker.on("click", e => {
                //   this.convertToBoundsPolygon(e, latlngs)
                // })
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
            if (feature.geometry.coordinates.length > 1 &&
                feature.geometry.type === 'MultiPolygon') {
                coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
            }
            else if (feature.geometry.coordinates[0].length > 1 &&
                feature.geometry.type === 'Polygon') {
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
                if (v.polygon.toString() !== polygon[0].toString() &&
                    v.polygon[0].toString() === polygon[0][0].toString()) {
                    v.polygon = polygon;
                    newArray.push(v);
                }
                if (v.polygon.toString() !== polygon[0].toString() &&
                    v.polygon[0].toString() !== polygon[0][0].toString()) {
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
        enableDoubleClickZoom
            ? this.map.doubleClickZoom.enable()
            : this.map.doubleClickZoom.disable();
        enableScrollWheelZoom
            ? this.map.scrollWheelZoom.enable()
            : this.map.scrollWheelZoom.disable();
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
    convertToBoundsPolygon(latlngs) {
        const lPoly = this.leafletHelper.createPolygon(latlngs);
        // const coords = this.convertToCoords([latlngs]);
        // const p = this.getPolygon()
        // if (poly.geometry.type === "MultiPolygon") {
        //   let newPolygon = this.turfHelper.convertToBoundingBoxPolygon(poly);
        //   this.deletePolygon(this.getLatLngsFromJson(poly));
        //   this.addPolygonLayer(newPolygon, false);
        // }
    }
    getMarkerIndex(latlngs, position) {
        const bounds = PolyDrawUtil.getBounds(latlngs, Math.sqrt(2) / 2);
        const compass = new Compass(bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());
        const compassDirection = compass.getDirection(position);
        const latLngPoint = {
            lat: compassDirection[1],
            lng: compassDirection[0]
        };
        const targetPoint = this.turfHelper.getCoord(latLngPoint);
        const fc = this.turfHelper.getFeaturePointCollection(latlngs);
        const nearestPointIdx = this.turfHelper.getNearestPointIndex(targetPoint, fc);
        return nearestPointIdx;
    }
};
PolyDrawService.ctorParameters = () => [
    { type: MapStateService },
    { type: ComponentGeneraterService },
    { type: TurfHelperService },
    { type: PolygonInformationService },
    { type: LeafletHelperService }
];
PolyDrawService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function PolyDrawService_Factory() { return new PolyDrawService(i0.ɵɵinject(i1.MapStateService), i0.ɵɵinject(i2.ComponentGeneraterService), i0.ɵɵinject(i3.TurfHelperService), i0.ɵɵinject(i4.PolygonInformationService), i0.ɵɵinject(i5.LeafletHelperService)); }, token: PolyDrawService, providedIn: "root" });
PolyDrawService = tslib_1.__decorate([
    Injectable({
        providedIn: 'root'
    })
    // Rename - PolyDrawService
    ,
    tslib_1.__metadata("design:paramtypes", [MapStateService,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9wb2x5ZHJhdy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdCLHNDQUFzQztBQUN0QyxPQUFPLEVBQWMsZUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBRTVDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRWhELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDOzs7Ozs7O0FBT2hFLElBQWEsZUFBZTtBQUQ1QiwyQkFBMkI7QUFDM0IsTUFBYSxlQUFlO0lBb0IxQixZQUNVLFFBQXlCLEVBQ3pCLGNBQXlDLEVBQ3pDLFVBQTZCLEVBQzdCLGtCQUE2QyxFQUM3QyxhQUFtQztRQUpuQyxhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUN6QixtQkFBYyxHQUFkLGNBQWMsQ0FBMkI7UUFDekMsZUFBVSxHQUFWLFVBQVUsQ0FBbUI7UUFDN0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUEyQjtRQUM3QyxrQkFBYSxHQUFiLGFBQWEsQ0FBc0I7UUF4QjdDLHlDQUF5QztRQUN6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QUM3QixpQkFBaUI7WUFDVCx5QkFBeUI7WUFDOUIsb0JBQW9COzs7QUF6QmxDLGVBQWU7SUFKM0IsVUFBVSxDQUFDO1FBQ1YsVUFBVSxFQUFFLE1BQU07S0FDbkIsQ0FBQztJQUNGLDJCQUEyQjs7NkNBc0JMLGVBQWU7UUFDVCx5QkFBeUI7UUFDN0IsaUJBQWlCO1FBQ1QseUJBQXlCO1FBQzlCLG9CQUFvQjtHQXpCbEMsZUFBZSxDQXc4QjNCO1NBeDhCWSxlQUFlO0FBeThCNUIsb0JBQW9CO0FBQ3BCLE1BQU0sQ0FBTixJQUFZLFFBTVg7QUFORCxXQUFZLFFBQVE7SUFDbEIscUNBQU8sQ0FBQTtJQUNQLG1EQUFjLENBQUE7SUFDZCxxREFBZSxDQUFBO0lBQ2YsNkRBQW1CLENBQUE7SUFDbkIscURBQWUsQ0FBQTtBQUNqQixDQUFDLEVBTlcsUUFBUSxLQUFSLFFBQVEsUUFNbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gJ2xlYWZsZXQnO1xyXG4vLyBpbXBvcnQgKiBhcyB0dXJmIGZyb20gXCJAdHVyZi90dXJmXCI7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIEJlaGF2aW9yU3ViamVjdCwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBmaWx0ZXIgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IEZlYXR1cmUsIFBvbHlnb24sIE11bHRpUG9seWdvbiB9IGZyb20gJ0B0dXJmL3R1cmYnO1xyXG5pbXBvcnQgeyBNYXBTdGF0ZVNlcnZpY2UgfSBmcm9tICcuL21hcC1zdGF0ZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVHVyZkhlbHBlclNlcnZpY2UgfSBmcm9tICcuL3R1cmYtaGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi9wb2x5Z29uLWluZm9ybWF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgZGVmYXVsdENvbmZpZyBmcm9tIFwiLi9wb2x5aW5mby5qc29uXCI7XHJcblxyXG5pbXBvcnQgeyBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlIH0gZnJvbSAnLi9jb21wb25lbnQtZ2VuZXJhdGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb21wYXNzLCBQb2x5RHJhd1V0aWwgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgTWFya2VyUGxhY2VtZW50IH0gZnJvbSAnLi9lbnVtcyc7XHJcbmltcG9ydCB7IExlYWZsZXRIZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi9sZWFmbGV0LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICBwcm92aWRlZEluOiAncm9vdCdcclxufSlcclxuLy8gUmVuYW1lIC0gUG9seURyYXdTZXJ2aWNlXHJcbmV4cG9ydCBjbGFzcyBQb2x5RHJhd1NlcnZpY2Uge1xyXG4gIC8vIERyYXdNb2RlcywgZGV0ZXJtaW5lIFVJIGJ1dHRvbnMgZXRjLi4uXHJcbiAgZHJhd01vZGVTdWJqZWN0OiBCZWhhdmlvclN1YmplY3Q8RHJhd01vZGU+ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxEcmF3TW9kZT4oXHJcbiAgICBEcmF3TW9kZS5PZmZcclxuICApO1xyXG4gIGRyYXdNb2RlJDogT2JzZXJ2YWJsZTxEcmF3TW9kZT4gPSB0aGlzLmRyYXdNb2RlU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuXHJcbiAgcHJpdmF0ZSBtYXA6IEwuTWFwO1xyXG5cclxuICBwcml2YXRlIG1lcmdlUG9seWdvbnM6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBraW5rczogYm9vbGVhbjtcclxuICAvLyBhZGQgdG8gY29uZmlnXHJcbiAgcHJpdmF0ZSBhcnJheU9mRmVhdHVyZUdyb3VwczogTC5GZWF0dXJlR3JvdXA8TC5MYXllcj5bXSA9IFtdO1xyXG4gIHByaXZhdGUgdHJhY2VyOiBMLlBvbHlsaW5lID0ge30gYXMgYW55O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcG9seWdvbkRyYXdTdGF0ZXMgPSBudWxsO1xyXG4gIC8vIGVuZCBhZGQgdG8gY29uZmlnXHJcblxyXG4gIHByaXZhdGUgbmdVbnN1YnNjcmliZSA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHJpdmF0ZSBjb25maWc6IHR5cGVvZiBkZWZhdWx0Q29uZmlnID0gbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIG1hcFN0YXRlOiBNYXBTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBvcHVwR2VuZXJhdG9yOiBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0dXJmSGVscGVyOiBUdXJmSGVscGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgcG9seWdvbkluZm9ybWF0aW9uOiBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsZWFmbGV0SGVscGVyOiBMZWFmbGV0SGVscGVyU2VydmljZVxyXG4gICkge1xyXG4gICAgdGhpcy5tYXBTdGF0ZS5tYXAkLnBpcGUoZmlsdGVyKG0gPT4gbSAhPT0gbnVsbCkpLnN1YnNjcmliZSgobWFwOiBMLk1hcCkgPT4ge1xyXG4gICAgICB0aGlzLm1hcCA9IG1hcDtcclxuICAgICAgY29uc29sZS5sb2coXCJLYXJ0ZXQ6IFwiLCBtYXApO1xyXG4gICAgICBjb25zb2xlLmxvZygncHJlIHRoaXMuY29uZmlnJywgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLmNvbmZpZyA9IGRlZmF1bHRDb25maWc7XHJcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzLmNvbmZpZycsIHRoaXMuY29uZmlnKTtcclxuICAgICAgdGhpcy5jb25maWd1cmF0ZSh7fSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdhZnRlciB0aGlzLmNvbmZpZycsIHRoaXMuY29uZmlnKTtcclxuICAgICAgdGhpcy50cmFjZXIgPSBMLnBvbHlsaW5lKFtbMCwgMF1dLCB0aGlzLmNvbmZpZy5wb2x5TGluZU9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5pbml0UG9seURyYXcoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25JbmZvcm1hdGlvbiQuc3Vic2NyaWJlKGsgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnUG9seUluZm8gc3RhcnQ6ICcsIGspO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVE9ETyAtIGxhZ2UgZW4gY29uZmlnIG9ic2VydmFibGUgaSBtYXBTdGF0ZSBvZyBvcHBkYXRlciB0aGlzLmNvbmZpZyBtZWQgZGVuXHJcbiAgfVxyXG4gIC8vIG5ld1xyXG4gIGNvbmZpZ3VyYXRlKGNvbmZpZzogT2JqZWN0KTogdm9pZCB7XHJcbiAgICAvLyBUT0RPIGlmIGNvbmZpZyBpcyBwYXRoLi4uXHJcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4uZGVmYXVsdENvbmZpZywgLi4uY29uZmlnIH07XHJcblxyXG4gICAgdGhpcy5tZXJnZVBvbHlnb25zID0gdGhpcy5jb25maWcubWVyZ2VQb2x5Z29ucztcclxuICAgIHRoaXMua2lua3MgPSB0aGlzLmNvbmZpZy5raW5rcztcclxuICB9XHJcblxyXG4gIC8vIGZpbmVcclxuICBjbG9zZUFuZFJlc2V0KCk6IHZvaWQge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJjbG9zZUFuZFJlc2V0XCIpO1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xyXG4gICAgdGhpcy5yZW1vdmVBbGxGZWF0dXJlR3JvdXBzKCk7XHJcbiAgfVxyXG5cclxuICAvLyBtYWtlIHJlYWRhYmxlXHJcbiAgZGVsZXRlUG9seWdvbihwb2x5Z29uOiBJTGF0TG5nW11bXSkge1xyXG4gICAgY29uc29sZS5sb2coJ2RlbGV0ZVBvbHlnb246ICcsIHBvbHlnb24pO1xyXG4gICAgaWYgKHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSBhcyBhbnk7XHJcbiAgICAgICAgY29uc3QgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKTtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBsYXRsbmdzLmxlbmd0aDtcclxuICAgICAgICAvLyAgPSBbXVxyXG4gICAgICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgbGV0IHBvbHlnb24zO1xyXG4gICAgICAgICAgY29uc3QgdGVzdCA9IFsuLi5sYXRsbmddO1xyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKGxhdGxuZyk7XHJcbiAgICAgICAgICBpZiAobGF0bG5nLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXVswXSAhPT0gbGF0bG5nWzBdW2xhdGxuZ1swXS5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICAgIHRlc3RbMF0ucHVzaChsYXRsbmdbMF1bMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gW3Rlc3RbMF1dO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXSAhPT0gbGF0bG5nW2xhdGxuZy5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICAgIHRlc3QucHVzaChsYXRsbmdbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gdGVzdDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnVGVzdDogJywgcG9seWdvbjMpO1xyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKHBvbHlnb24pO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGVxdWFscyA9IHRoaXMucG9seWdvbkFycmF5RXF1YWxzKHBvbHlnb24zLCBwb2x5Z29uKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdlcXVhbHM6ICcsIGVxdWFscywgJyBsZW5ndGg6ICcsIGxlbmd0aCk7XHJcbiAgICAgICAgICBpZiAoZXF1YWxzICYmIGxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVxdWFscyAmJiBsZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVRyYXNoQ2FuT25NdWx0aShbcG9seWdvbl0pO1xyXG4gICAgICAgICAgICBsYXRsbmdzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIGxheWVyLnNldExhdExuZ3MobGF0bG5ncyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxheWVyLnRvR2VvSlNPTigpLCBmYWxzZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcmVtb3ZlQWxsRmVhdHVyZUdyb3VwcygpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwicmVtb3ZlQWxsRmVhdHVyZUdyb3Vwc1wiLCBudWxsKTtcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXBzID0+IHtcclxuICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3Vwcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gW107XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICAvLyB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnJlc2V0KCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi51cGRhdGVQb2x5Z29ucygpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgZ2V0RHJhd01vZGUoKTogRHJhd01vZGUge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJnZXREcmF3TW9kZVwiLCBudWxsKTtcclxuICAgIHJldHVybiB0aGlzLmRyYXdNb2RlU3ViamVjdC52YWx1ZTtcclxuICB9XHJcblxyXG4gIGFkZFZpa2VuKHBvbHlnb24pIHtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHBvbHlnb24sIHRydWUpO1xyXG4gIH1cclxuXHJcbiAgLy8gY2hlY2sgdGhpc1xyXG4gIGFkZEF1dG9Qb2x5Z29uKGdlb2dyYXBoaWNCb3JkZXJzOiBMLkxhdExuZ1tdW10pOiB2b2lkIHtcclxuICAgIGNvbnN0IGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXAgPSBuZXcgTC5GZWF0dXJlR3JvdXAoKTtcclxuXHJcbiAgICBjb25zdCBwb2x5Z29uMiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXHJcbiAgICAgIHRoaXMuY29udmVydFRvQ29vcmRzKGdlb2dyYXBoaWNCb3JkZXJzKVxyXG4gICAgKTtcclxuICAgIGNvbnNvbGUubG9nKHBvbHlnb24yKTtcclxuICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLmdldFBvbHlnb24ocG9seWdvbjIpO1xyXG5cclxuICAgIGZlYXR1cmVHcm91cC5hZGRMYXllcihwb2x5Z29uKTtcclxuICAgIGNvbnN0IG1hcmtlckxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcclxuICAgIGNvbnNvbGUubG9nKCdtYXJrZXJzOiAnLCBtYXJrZXJMYXRsbmdzKTtcclxuICAgIG1hcmtlckxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgcG9seWdvbi5mb3JFYWNoKChwb2x5RWxlbWVudCwgaSkgPT4ge1xyXG4gICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLmFkZE1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hZGRIb2xlTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ0h1bGw6ICcsIHBvbHlFbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyB0aGlzLmFkZE1hcmtlcihwb2x5Z29uWzBdLCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAvLyBUT0RPIC0gSHZpcyBwb2x5Z29uLmxlbmd0aCA+MSwgc8OlIGhhciBkZW4gaHVsbDogZWdlbiBhZGRNYXJrZXIgZnVua3Nqb25cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwc1xyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIGlubmVow6VsbCBpIGlmJ2FyIGZseXR0YSB0aWxsIGVnbmEgbWV0b2RlclxyXG4gIHByaXZhdGUgY29udmVydFRvQ29vcmRzKGxhdGxuZ3M6IElMYXRMbmdbXVtdKSB7XHJcbiAgICBjb25zdCBjb29yZHMgPSBbXTtcclxuICAgIGNvbnNvbGUubG9nKGxhdGxuZ3MubGVuZ3RoLCBsYXRsbmdzKTtcclxuICAgIGlmIChsYXRsbmdzLmxlbmd0aCA+IDEgJiYgbGF0bG5ncy5sZW5ndGggPCAzKSB7XHJcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdKSxcclxuICAgICAgICBsYXRsbmdzW2xhdGxuZ3MubGVuZ3RoIC0gMV0ubGVuZ3RoXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihcclxuICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSksXHJcbiAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKVxyXG4gICAgICApO1xyXG4gICAgICBpZiAod2l0aGluKSB7XHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgY29vcmRpbmF0ZXMucHVzaChMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHBvbHlnb24pKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPj0gMSkge1xyXG4gICAgICAgIGNvb3Jkcy5wdXNoKGNvb3JkaW5hdGVzKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZygnV2l0aGluMSAnLCB3aXRoaW4pO1xyXG4gICAgfSBlbHNlIGlmIChsYXRsbmdzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAxOyBpbmRleCA8IGxhdGxuZ3MubGVuZ3RoIC0gMTsgaW5kZXgrKykge1xyXG4gICAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihcclxuICAgICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tpbmRleF0pLFxyXG4gICAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKHdpdGhpbikge1xyXG4gICAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICBjb29yZGluYXRlcy5wdXNoKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbikpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbildKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSldKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKGNvb3Jkcyk7XHJcbiAgICByZXR1cm4gY29vcmRzO1xyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgaW5pdFBvbHlEcmF3KCkge1xyXG4gICAgY29uc29sZS5sb2coXCJpbml0UG9seURyYXdcIiwgdGhpcy5tYXAsIHRoaXMudHJhY2VyKTtcclxuXHJcbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCk7XHJcbiAgICBjb25zdCBkcmF3TW9kZSA9IHRoaXMuZ2V0RHJhd01vZGUoKTtcclxuICAgIGlmICh0aGlzLmNvbmZpZy50b3VjaFN1cHBvcnQpIHtcclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBlID0+IHtcclxuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xyXG4gICAgICAgICAgdGhpcy5tb3VzZURvd24oZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGUgPT4ge1xyXG4gICAgICAgIGlmIChkcmF3TW9kZSAhPT0gRHJhd01vZGUuT2ZmKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdXNlVXBMZWF2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcclxuICAgICAgICAgIHRoaXMubW91c2VNb3ZlKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5tYXAuYWRkTGF5ZXIodGhpcy50cmFjZXIpO1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xyXG4gIH1cclxuICAvLyBUZXN0IEwuTW91c2VFdmVudFxyXG4gIHByaXZhdGUgbW91c2VEb3duKGV2ZW50KSB7XHJcbiAgICBjb25zb2xlLmxvZygnbW91c2VEb3duJywgZXZlbnQpO1xyXG5cclxuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9IG51bGwpIHtcclxuICAgICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbZXZlbnQubGF0bG5nXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBsYXRsbmcgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKFtcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgIF0pO1xyXG4gICAgICB0aGlzLnRyYWNlci5zZXRMYXRMbmdzKFtsYXRsbmddKTtcclxuICAgIH1cclxuICAgIHRoaXMuc3RhcnREcmF3KCk7XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPIGV2ZW50IHR5cGUsIGNyZWF0ZSBjb250YWluZXJQb2ludFRvTGF0TG5nLW1ldGhvZFxyXG4gIHByaXZhdGUgbW91c2VNb3ZlKGV2ZW50KSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm1vdXNlTW92ZVwiLCBldmVudCk7XHJcblxyXG4gICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT0gbnVsbCkge1xyXG4gICAgICB0aGlzLnRyYWNlci5hZGRMYXRMbmcoZXZlbnQubGF0bG5nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGxhdGxuZyA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcoW1xyXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCxcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFlcclxuICAgICAgXSk7XHJcbiAgICAgIHRoaXMudHJhY2VyLmFkZExhdExuZyhsYXRsbmcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgbW91c2VVcExlYXZlKCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJtb3VzZVVwTGVhdmVcIiwgbnVsbCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLURlbGV0ZSB0cmFzaGNhbnNcIiwgbnVsbCk7XHJcbiAgICBjb25zdCBnZW9Qb3M6IEZlYXR1cmU8XHJcbiAgICAgIFBvbHlnb24gfCBNdWx0aVBvbHlnb25cclxuICAgID4gPSB0aGlzLnR1cmZIZWxwZXIudHVyZkNvbmNhdmVtYW4odGhpcy50cmFjZXIudG9HZW9KU09OKCkgYXMgYW55KTtcclxuICAgIHRoaXMuc3RvcERyYXcoKTtcclxuICAgIHN3aXRjaCAodGhpcy5nZXREcmF3TW9kZSgpKSB7XHJcbiAgICAgIGNhc2UgRHJhd01vZGUuQWRkUG9seWdvbjpcclxuICAgICAgICB0aGlzLmFkZFBvbHlnb24oZ2VvUG9zLCB0cnVlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdFBvbHlnb246XHJcbiAgICAgICAgdGhpcy5zdWJ0cmFjdFBvbHlnb24oZ2VvUG9zKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKFxyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzXHJcbiAgICApO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1jcmVhdGUgdHJhc2hjYW5zXCIsIG51bGwpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBzdGFydERyYXcoKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInN0YXJ0RHJhd1wiLCBudWxsKTtcclxuXHJcbiAgICB0aGlzLmRyYXdTdGFydGVkRXZlbnRzKHRydWUpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBzdG9wRHJhdygpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwic3RvcERyYXdcIiwgbnVsbCk7XHJcblxyXG4gICAgdGhpcy5yZXNldFRyYWNrZXIoKTtcclxuICAgIHRoaXMuZHJhd1N0YXJ0ZWRFdmVudHMoZmFsc2UpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBkcmF3U3RhcnRlZEV2ZW50cyhvbm9mZjogYm9vbGVhbikge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJkcmF3U3RhcnRlZEV2ZW50c1wiLCBvbm9mZik7XHJcblxyXG4gICAgY29uc3Qgb25vcm9mZiA9IG9ub2ZmID8gJ29uJyA6ICdvZmYnO1xyXG5cclxuICAgIHRoaXMubWFwW29ub3JvZmZdKCdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlTW92ZSwgdGhpcyk7XHJcbiAgICB0aGlzLm1hcFtvbm9yb2ZmXSgnbW91c2V1cCcsIHRoaXMubW91c2VVcExlYXZlLCB0aGlzKTtcclxuICB9XHJcbiAgLy8gT24gaG9sZFxyXG4gIHByaXZhdGUgc3VidHJhY3RQb2x5Z29uKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIHRoaXMuc3VidHJhY3QobGF0bG5ncyk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGFkZFBvbHlnb24oXHJcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgc2ltcGxpZnk6IGJvb2xlYW4sXHJcbiAgICBub01lcmdlOiBib29sZWFuID0gZmFsc2VcclxuICApIHtcclxuICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAnYWRkUG9seWdvbicsXHJcbiAgICAgIGxhdGxuZ3MsXHJcbiAgICAgIHNpbXBsaWZ5LFxyXG4gICAgICBub01lcmdlLFxyXG4gICAgICB0aGlzLmtpbmtzLFxyXG4gICAgICB0aGlzLmNvbmZpZ1xyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoXHJcbiAgICAgIHRoaXMubWVyZ2VQb2x5Z29ucyAmJlxyXG4gICAgICAhbm9NZXJnZSAmJlxyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDAgJiZcclxuICAgICAgIXRoaXMua2lua3NcclxuICAgICkge1xyXG4gICAgICB0aGlzLm1lcmdlKGxhdGxuZ3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobGF0bG5ncywgc2ltcGxpZnkpO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBhZGRQb2x5Z29uTGF5ZXIoXHJcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgc2ltcGxpZnk6IGJvb2xlYW5cclxuICApIHtcclxuICAgIGNvbnN0IGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXAgPSBuZXcgTC5GZWF0dXJlR3JvdXAoKTtcclxuXHJcbiAgICBjb25zdCBsYXRMbmdzID0gc2ltcGxpZnkgPyB0aGlzLnR1cmZIZWxwZXIuZ2V0U2ltcGxpZmllZChsYXRsbmdzKSA6IGxhdGxuZ3M7XHJcbiAgICBjb25zb2xlLmxvZygnQWRkUG9seWdvbkxheWVyOiAnLCBsYXRMbmdzKTtcclxuICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLmdldFBvbHlnb24obGF0TG5ncyk7XHJcbiAgICBmZWF0dXJlR3JvdXAuYWRkTGF5ZXIocG9seWdvbik7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uKTtcclxuICAgIGNvbnN0IG1hcmtlckxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcclxuICAgIG1hcmtlckxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgcG9seWdvbi5mb3JFYWNoKChwb2x5RWxlbWVudDogSUxhdExuZ1tdLCBpOiBudW1iZXIpID0+IHtcclxuICAgICAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgdGhpcy5hZGRNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuYWRkSG9sZU1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdIdWxsOiAnLCBwb2x5RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgLy8gdGhpcy5hZGRNYXJrZXIocG9seWdvblswXSwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgLy8gVE9ETyAtIEh2aXMgcG9seWdvbi5sZW5ndGggPjEsIHPDpSBoYXIgZGVuIGh1bGw6IGVnZW4gYWRkTWFya2VyIGZ1bmtzam9uXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgIGNvbnNvbGUubG9nKCdBcnJheTogJywgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcyk7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XHJcblxyXG4gICAgZmVhdHVyZUdyb3VwLm9uKCdjbGljaycsIGUgPT4ge1xyXG4gICAgICB0aGlzLnBvbHlnb25DbGlja2VkKGUsIGxhdExuZ3MpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHBvbHlnb25DbGlja2VkKGU6IGFueSwgcG9seTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3QgbmV3UG9pbnQgPSBlLmxhdGxuZztcclxuICAgIGlmIChwb2x5Lmdlb21ldHJ5LnR5cGUgPT09ICdNdWx0aVBvbHlnb24nKSB7XHJcbiAgICAgIGNvbnN0IG5ld1BvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIuaW5qZWN0UG9pbnRUb1BvbHlnb24ocG9seSwgW1xyXG4gICAgICAgIG5ld1BvaW50LmxuZyxcclxuICAgICAgICBuZXdQb2ludC5sYXRcclxuICAgICAgXSk7XHJcbiAgICAgIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihwb2x5KSk7XHJcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld1BvbHlnb24sIGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZ2V0UG9seWdvbihsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zb2xlLmxvZygnZ2V0UG9seWdvbnM6ICcsIGxhdGxuZ3MpO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IEwuR2VvSlNPTi5nZW9tZXRyeVRvTGF5ZXIobGF0bG5ncykgYXMgYW55O1xyXG5cclxuICAgIHBvbHlnb24uc2V0U3R5bGUodGhpcy5jb25maWcucG9seWdvbk9wdGlvbnMpO1xyXG4gICAgcmV0dXJuIHBvbHlnb247XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIG1lcmdlKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnNvbGUubG9nKCdtZXJnZScsIGxhdGxuZ3MpO1xyXG4gICAgY29uc3QgcG9seWdvbkZlYXR1cmUgPSBbXTtcclxuICAgIGNvbnN0IG5ld0FycmF5OiBMLkZlYXR1cmVHcm91cFtdID0gW107XHJcbiAgICBsZXQgcG9seUludGVyc2VjdGlvbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuICAgICAgaWYgKGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcclxuICAgICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcclxuICAgICAgICAgIGlmIChwb2x5SW50ZXJzZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIG5ld0FycmF5LnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKFxyXG4gICAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF1cclxuICAgICAgICApO1xyXG4gICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcclxuICAgICAgICBpZiAocG9seUludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY29uc29sZS5sb2cobmV3QXJyYXkpO1xyXG4gICAgaWYgKG5ld0FycmF5Lmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy51bmlvblBvbHlnb25zKG5ld0FycmF5LCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXRsbmdzLCB0cnVlKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gbmV4dFxyXG4gIHByaXZhdGUgc3VidHJhY3QobGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgbGV0IGFkZEhvbGUgPSBsYXRsbmdzO1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXTtcclxuICAgICAgY29uc3QgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcclxuICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25EaWZmZXJlbmNlKGZlYXR1cmUsIGFkZEhvbGUpO1xyXG4gICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seSk7XHJcbiAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXApO1xyXG4gICAgICBhZGRIb2xlID0gbmV3UG9seWdvbjtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG5ld0xhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4gPSBhZGRIb2xlO1xyXG4gICAgY29uc3QgY29vcmRzID0gdGhpcy50dXJmSGVscGVyLmdldENvb3JkcyhuZXdMYXRsbmdzKTtcclxuICAgIGNvb3Jkcy5mb3JFYWNoKHZhbHVlID0+IHtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIodGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihbdmFsdWVdKSwgdHJ1ZSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZXZlbnRzKG9ub2ZmOiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBvbm9yb2ZmID0gb25vZmYgPyAnb24nIDogJ29mZic7XHJcbiAgICB0aGlzLm1hcFtvbm9yb2ZmXSgnbW91c2Vkb3duJywgdGhpcy5tb3VzZURvd24sIHRoaXMpO1xyXG4gIH1cclxuICAvLyBmaW5lLCBUT0RPOiBpZiBzcGVjaWFsIG1hcmtlcnNcclxuICBwcml2YXRlIGFkZE1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnN0IG1lbnVNYXJrZXJJZHggPSB0aGlzLmdldE1hcmtlckluZGV4KFxyXG4gICAgICBsYXRsbmdzLFxyXG4gICAgICB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnBvc2l0aW9uXHJcbiAgICApO1xyXG4gICAgY29uc3QgZGVsZXRlTWFya2VySWR4ID0gdGhpcy5nZXRNYXJrZXJJbmRleChcclxuICAgICAgbGF0bG5ncyxcclxuICAgICAgdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnBvc2l0aW9uXHJcbiAgICApO1xyXG5cclxuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XHJcbiAgICAgIGxldCBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VySWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIGlmIChpID09PSBtZW51TWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGkgPT09IGRlbGV0ZU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5NYXJrZXIobGF0bG5nLCB7XHJcbiAgICAgICAgaWNvbjogdGhpcy5jcmVhdGVEaXZJY29uKGljb25DbGFzc2VzKSxcclxuICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgdGl0bGU6IGkudG9TdHJpbmcoKVxyXG4gICAgICB9KTtcclxuICAgICAgRmVhdHVyZUdyb3VwLmFkZExheWVyKG1hcmtlcikuYWRkVG8odGhpcy5tYXApO1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkZlYXR1cmVHcm91cDogXCIsIEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIG1hcmtlci5vbignZHJhZycsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZyhGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgbWFya2VyLm9uKCdkcmFnZW5kJywgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoaSA9PT0gbWVudU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuICAgICAgICAvLyBtYXJrZXIuYmluZFBvcHVwKFxyXG4gICAgICAgIC8vICAgdGhpcy5nZXRIdG1sQ29udGVudChlID0+IHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJjbGlja2VkIG9uXCIsIGUudGFyZ2V0KTtcclxuICAgICAgICAvLyAgIH0pXHJcbiAgICAgICAgLy8gKTtcclxuICAgICAgICAvLyBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAvLyAgIHRoaXMuY29udmVydFRvQm91bmRzUG9seWdvbihlLCBsYXRsbmdzKVxyXG4gICAgICAgIC8vIH0pXHJcbiAgICAgIH1cclxuICAgICAgaWYgKGkgPT09IGRlbGV0ZU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIG1hcmtlci5vbignY2xpY2snLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkSG9sZU1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XHJcbiAgICAgIGNvbnN0IGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgLyogIGlmIChpID09PSAwICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vVE9ETy0gbGVnZyB0aWwgZmlsbCBpY29uXHJcbiAgICAgIGlmIChpID09PSBsYXRsbmdzLmxlbmd0aCAtIDEgJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH0gKi9cclxuICAgICAgY29uc3QgbWFya2VyID0gbmV3IEwuTWFya2VyKGxhdGxuZywge1xyXG4gICAgICAgIGljb246IHRoaXMuY3JlYXRlRGl2SWNvbihpY29uQ2xhc3NlcyksXHJcbiAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgIHRpdGxlOiBpLnRvU3RyaW5nKClcclxuICAgICAgfSk7XHJcbiAgICAgIEZlYXR1cmVHcm91cC5hZGRMYXllcihtYXJrZXIpLmFkZFRvKHRoaXMubWFwKTtcclxuXHJcbiAgICAgIG1hcmtlci5vbignZHJhZycsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZyhGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgbWFya2VyLm9uKCdkcmFnZW5kJywgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvKiAgIGlmIChpID09PSAwICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIG1hcmtlci5iaW5kUG9wdXAodGhpcy5nZXRIdG1sQ29udGVudCgoZSkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJjbGlja2VkIG9uXCIsIGUudGFyZ2V0KTtcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgLy8gbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgLy8gICB0aGlzLnRvZ2dsZU1hcmtlck1lbnUoKTtcclxuICAgICAgICAvLyB9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09PSBsYXRsbmdzLmxlbmd0aCAtIDEgJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9ICovXHJcbiAgICB9KTtcclxuICB9XHJcbiAgcHJpdmF0ZSBjcmVhdGVEaXZJY29uKGNsYXNzTmFtZXM6IHN0cmluZ1tdKTogTC5EaXZJY29uIHtcclxuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcclxuICAgIGNvbnN0IGljb24gPSBMLmRpdkljb24oeyBjbGFzc05hbWU6IGNsYXNzZXMgfSk7XHJcbiAgICByZXR1cm4gaWNvbjtcclxuICB9XHJcbiAgLy8gVE9ETzogQ2xlYW51cFxyXG4gIHByaXZhdGUgbWFya2VyRHJhZyhGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICBjb25zdCBuZXdQb3MgPSBbXTtcclxuICAgIGxldCB0ZXN0YXJyYXkgPSBbXTtcclxuICAgIGxldCBob2xlID0gW107XHJcbiAgICBjb25zdCBsYXllckxlbmd0aCA9IEZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSBhcyBhbnk7XHJcbiAgICBjb25zdCBwb3NhcnJheXMgPSBsYXllckxlbmd0aFswXS5nZXRMYXRMbmdzKCk7XHJcbiAgICBjb25zb2xlLmxvZyhwb3NhcnJheXMpO1xyXG4gICAgbGV0IGxlbmd0aCA9IDA7XHJcbiAgICBpZiAocG9zYXJyYXlzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBvc2FycmF5cy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICB0ZXN0YXJyYXkgPSBbXTtcclxuICAgICAgICBob2xlID0gW107XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1Bvc2lzam9uZXI6ICcsIHBvc2FycmF5c1tpbmRleF0pO1xyXG4gICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgaWYgKHBvc2FycmF5c1swXS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpbmRleCA8IHBvc2FycmF5c1swXS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3Npc2pvbmVyIDI6ICcsIHBvc2FycmF5c1tpbmRleF1baV0pO1xyXG5cclxuICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVtpXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdWzBdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBob2xlLnB1c2godGVzdGFycmF5KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdIb2xlOiAnLCBob2xlKTtcclxuICAgICAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZW5ndGggKz0gcG9zYXJyYXlzW2luZGV4IC0gMV1bMF0ubGVuZ3RoO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1NUYXJ0IGluZGV4OiAnLCBsZW5ndGgpO1xyXG4gICAgICAgICAgZm9yIChsZXQgaiA9IGxlbmd0aDsgaiA8IHBvc2FycmF5c1tpbmRleF1bMF0ubGVuZ3RoICsgbGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgdGVzdGFycmF5LnB1c2goKGxheWVyTGVuZ3RoW2ogKyAxXSBhcyBhbnkpLmdldExhdExuZygpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICAgICAgbmV3UG9zLnB1c2goaG9sZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyB0ZXN0YXJyYXkgPSBbXVxyXG4gICAgICBob2xlID0gW107XHJcbiAgICAgIGxldCBsZW5ndGgyID0gMDtcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBvc2FycmF5c1swXS5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICB0ZXN0YXJyYXkgPSBbXTtcclxuICAgICAgICBjb25zb2xlLmxvZygnUG9seWdvbiBkcmFnOiAnLCBwb3NhcnJheXNbMF1baW5kZXhdKTtcclxuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1bMF0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlbmd0aDIgKz0gcG9zYXJyYXlzWzBdW2luZGV4IC0gMV0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgIGZvciAobGV0IGogPSBsZW5ndGgyOyBqIDwgcG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGggKyBsZW5ndGgyOyBqKyspIHtcclxuICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgIH1cclxuICAgICAgbmV3UG9zLnB1c2goaG9sZSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdIb2xlIDI6ICcsIGhvbGUpO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coJ055ZSBwb3Npc2pvbmVyOiAnLCBuZXdQb3MpO1xyXG4gICAgbGF5ZXJMZW5ndGhbMF0uc2V0TGF0TG5ncyhuZXdQb3MpO1xyXG4gIH1cclxuICAvLyBjaGVjayB0aGlzXHJcbiAgcHJpdmF0ZSBtYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoKTtcclxuICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gRmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAnTWFya2VyZHJhZ2VuZCBwb2x5Z29uOiAnLFxyXG4gICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlc1xyXG4gICAgKTtcclxuICAgIGlmIChmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ01hcmtlcmRyYWdlbmQ6ICcsIGZlYXR1cmUpO1xyXG4gICAgICAgIGlmICh0aGlzLnR1cmZIZWxwZXIuaGFzS2lua3MoZmVhdHVyZSkpIHtcclxuICAgICAgICAgIHRoaXMua2lua3MgPSB0cnVlO1xyXG4gICAgICAgICAgY29uc3QgdW5raW5rID0gdGhpcy50dXJmSGVscGVyLmdldEtpbmtzKGZlYXR1cmUpO1xyXG4gICAgICAgICAgLy8gdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGZlYXR1cmUpKTtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnVW5raW5rOiAnLCB1bmtpbmspO1xyXG4gICAgICAgICAgdW5raW5rLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbihcclxuICAgICAgICAgICAgICB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24ocG9seWdvbiksXHJcbiAgICAgICAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgICAgICAgdHJ1ZVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMua2lua3MgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMuYWRkUG9seWdvbihmZWF0dXJlLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFxyXG4gICAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdNYXJrZXJkcmFnZW5kOiAnLCBmZWF0dXJlKTtcclxuICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xyXG4gICAgICAgIHRoaXMua2lua3MgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IHVua2luayA9IHRoaXMudHVyZkhlbHBlci5nZXRLaW5rcyhmZWF0dXJlKTtcclxuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1Vua2luazogJywgdW5raW5rKTtcclxuICAgICAgICB1bmtpbmsuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgIHRoaXMuYWRkUG9seWdvbih0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24ocG9seWdvbiksIGZhbHNlLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgIHRoaXMua2lua3MgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmFkZFBvbHlnb24oZmVhdHVyZSwgZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKFxyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzXHJcbiAgICApO1xyXG4gIH1cclxuICAvLyBmaW5lLCBjaGVjayB0aGUgcmV0dXJuZWQgdHlwZVxyXG4gIHByaXZhdGUgZ2V0TGF0TG5nc0Zyb21Kc29uKFxyXG4gICAgZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICk6IElMYXRMbmdbXVtdIHtcclxuICAgIGNvbnNvbGUubG9nKCdnZXRMYXRMbmdzRnJvbUpzb246ICcsIGZlYXR1cmUpO1xyXG4gICAgbGV0IGNvb3JkO1xyXG4gICAgaWYgKGZlYXR1cmUpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSAmJlxyXG4gICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PT0gJ011bHRpUG9seWdvbidcclxuICAgICAgKSB7XHJcbiAgICAgICAgY29vcmQgPSBMLkdlb0pTT04uY29vcmRzVG9MYXRMbmdzKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1bMF0pO1xyXG4gICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0ubGVuZ3RoID4gMSAmJlxyXG4gICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PT0gJ1BvbHlnb24nXHJcbiAgICAgICkge1xyXG4gICAgICAgIGNvb3JkID0gTC5HZW9KU09OLmNvb3Jkc1RvTGF0TG5ncyhmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29vcmQ7XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSB1bmlvblBvbHlnb25zKFxyXG4gICAgbGF5ZXJzLFxyXG4gICAgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIHBvbHlnb25GZWF0dXJlXHJcbiAgKSB7XHJcbiAgICBjb25zb2xlLmxvZygndW5pb25Qb2x5Z29ucycsIGxheWVycywgbGF0bG5ncywgcG9seWdvbkZlYXR1cmUpO1xyXG5cclxuICAgIGxldCBhZGROZXcgPSBsYXRsbmdzO1xyXG4gICAgbGF5ZXJzLmZvckVhY2goKGZlYXR1cmVHcm91cCwgaSkgPT4ge1xyXG4gICAgICBjb25zdCBmZWF0dXJlQ29sbGVjdGlvbiA9IGZlYXR1cmVHcm91cC50b0dlb0pTT04oKTtcclxuICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXTtcclxuICAgICAgY29uc3QgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcclxuICAgICAgY29uc3QgdW5pb24gPSB0aGlzLnR1cmZIZWxwZXIudW5pb24oYWRkTmV3LCBwb2x5Z29uRmVhdHVyZVtpXSk7IC8vIENoZWNrIGZvciBtdWx0aXBvbHlnb25zXHJcbiAgICAgIC8vIE5lZWRzIGEgY2xlYW51cCBmb3IgdGhlIG5ldyB2ZXJzaW9uXHJcbiAgICAgIHRoaXMuZGVsZXRlUG9seWdvbk9uTWVyZ2UocG9seSk7XHJcbiAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgICBhZGROZXcgPSB1bmlvbjtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG5ld0xhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4gPSBhZGROZXc7IC8vIFRyZW5nZXIga2Fuc2tqZSB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24oIGFkZE5ldyk7XHJcbiAgICB0aGlzLmFkZFBvbHlnb25MYXllcihuZXdMYXRsbmdzLCB0cnVlKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgcmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnNvbGUubG9nKCdyZW1vdmVGZWF0dXJlR3JvdXAnLCBmZWF0dXJlR3JvdXApO1xyXG5cclxuICAgIGZlYXR1cmVHcm91cC5jbGVhckxheWVycygpO1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3VwcyA9IHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZmlsdGVyKFxyXG4gICAgICBmZWF0dXJlR3JvdXBzID0+IGZlYXR1cmVHcm91cHMgIT09IGZlYXR1cmVHcm91cFxyXG4gICAgKTtcclxuICAgIC8vIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKGZlYXR1cmVHcm91cCk7XHJcbiAgfVxyXG4gIC8vIGZpbmUgdW50aWwgcmVmYWN0b3JpbmdcclxuICBwcml2YXRlIHJlbW92ZUZlYXR1cmVHcm91cE9uTWVyZ2UoZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgY29uc29sZS5sb2coJ3JlbW92ZUZlYXR1cmVHcm91cE9uTWVyZ2UnLCBmZWF0dXJlR3JvdXApO1xyXG5cclxuICAgIGNvbnN0IG5ld0FycmF5ID0gW107XHJcbiAgICBpZiAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdKSB7XHJcbiAgICAgIGNvbnN0IHBvbHlnb24gPSAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueSkuZ2V0TGF0TG5ncygpWzBdO1xyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2godiA9PiB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgdi5wb2x5Z29uLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF0udG9TdHJpbmcoKSAmJlxyXG4gICAgICAgICAgdi5wb2x5Z29uWzBdLnRvU3RyaW5nKCkgPT09IHBvbHlnb25bMF1bMF0udG9TdHJpbmcoKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgdi5wb2x5Z29uID0gcG9seWdvbjtcclxuICAgICAgICAgIG5ld0FycmF5LnB1c2godik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICB2LnBvbHlnb24udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXS50b1N0cmluZygpICYmXHJcbiAgICAgICAgICB2LnBvbHlnb25bMF0udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXVswXS50b1N0cmluZygpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBuZXdBcnJheS5wdXNoKHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIGZlYXR1cmVHcm91cC5jbGVhckxheWVycygpO1xyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5maWx0ZXIoXHJcbiAgICAgICAgZmVhdHVyZUdyb3VwcyA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXBcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKGZlYXR1cmVHcm91cCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmUgdW50aWwgcmVmYWN0b3JpbmdcclxuICBwcml2YXRlIGRlbGV0ZVBvbHlnb25Pbk1lcmdlKHBvbHlnb24pIHtcclxuICAgIGNvbnNvbGUubG9nKCdkZWxldGVQb2x5Z29uT25NZXJnZScsIHBvbHlnb24pO1xyXG4gICAgbGV0IHBvbHlnb24yID0gW107XHJcbiAgICBpZiAodGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueTtcclxuICAgICAgICBjb25zdCBsYXRsbmdzID0gbGF5ZXIuZ2V0TGF0TG5ncygpWzBdO1xyXG4gICAgICAgIHBvbHlnb24yID0gWy4uLmxhdGxuZ3NbMF1dO1xyXG4gICAgICAgIGlmIChsYXRsbmdzWzBdWzBdICE9PSBsYXRsbmdzWzBdW2xhdGxuZ3NbMF0ubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgIHBvbHlnb24yLnB1c2gobGF0bG5nc1swXVswXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGVxdWFscyA9IHRoaXMucG9seWdvbkFycmF5RXF1YWxzTWVyZ2UocG9seWdvbjIsIHBvbHlnb24pO1xyXG5cclxuICAgICAgICBpZiAoZXF1YWxzKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnRVFVQUxTJywgcG9seWdvbik7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cE9uTWVyZ2UoZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihwb2x5Z29uKTtcclxuICAgICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVRyYXNoY2FuKHBvbHlnb24pO1xyXG4gICAgICAgICAgLy8gdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPIC0gbGVnZ2UgZXQgYW5uZXQgc3RlZFxyXG4gIHByaXZhdGUgcG9seWdvbkFycmF5RXF1YWxzTWVyZ2UocG9seTE6IGFueVtdLCBwb2x5MjogYW55W10pOiBib29sZWFuIHtcclxuICAgIHJldHVybiBwb2x5MS50b1N0cmluZygpID09PSBwb2x5Mi50b1N0cmluZygpO1xyXG4gIH1cclxuICAvLyBUT0RPIC0gbGVnZ2UgZXQgYW5uZXQgc3RlZFxyXG4gIHByaXZhdGUgcG9seWdvbkFycmF5RXF1YWxzKHBvbHkxOiBhbnlbXSwgcG9seTI6IGFueVtdKTogYm9vbGVhbiB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInBvbHlnb25BcnJheUVxdWFsc1wiLCBwb2x5MSwgcG9seTIpO1xyXG5cclxuICAgIGlmIChwb2x5MVswXVswXSkge1xyXG4gICAgICBpZiAoIXBvbHkxWzBdWzBdLmVxdWFscyhwb2x5MlswXVswXSkpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoIXBvbHkxWzBdLmVxdWFscyhwb2x5MlswXSkpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICB9XHJcbiAgICBpZiAocG9seTEubGVuZ3RoICE9PSBwb2x5Mi5sZW5ndGgpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHNldExlYWZsZXRNYXBFdmVudHMoXHJcbiAgICBlbmFibGVEcmFnZ2luZzogYm9vbGVhbixcclxuICAgIGVuYWJsZURvdWJsZUNsaWNrWm9vbTogYm9vbGVhbixcclxuICAgIGVuYWJsZVNjcm9sbFdoZWVsWm9vbTogYm9vbGVhblxyXG4gICkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJzZXRMZWFmbGV0TWFwRXZlbnRzXCIsIGVuYWJsZURyYWdnaW5nLCBlbmFibGVEb3VibGVDbGlja1pvb20sIGVuYWJsZVNjcm9sbFdoZWVsWm9vbSk7XHJcblxyXG4gICAgZW5hYmxlRHJhZ2dpbmcgPyB0aGlzLm1hcC5kcmFnZ2luZy5lbmFibGUoKSA6IHRoaXMubWFwLmRyYWdnaW5nLmRpc2FibGUoKTtcclxuICAgIGVuYWJsZURvdWJsZUNsaWNrWm9vbVxyXG4gICAgICA/IHRoaXMubWFwLmRvdWJsZUNsaWNrWm9vbS5lbmFibGUoKVxyXG4gICAgICA6IHRoaXMubWFwLmRvdWJsZUNsaWNrWm9vbS5kaXNhYmxlKCk7XHJcbiAgICBlbmFibGVTY3JvbGxXaGVlbFpvb21cclxuICAgICAgPyB0aGlzLm1hcC5zY3JvbGxXaGVlbFpvb20uZW5hYmxlKClcclxuICAgICAgOiB0aGlzLm1hcC5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgc2V0RHJhd01vZGUobW9kZTogRHJhd01vZGUpIHtcclxuICAgIGNvbnNvbGUubG9nKCdzZXREcmF3TW9kZScsIHRoaXMubWFwKTtcclxuICAgIHRoaXMuZHJhd01vZGVTdWJqZWN0Lm5leHQobW9kZSk7XHJcbiAgICBpZiAoISF0aGlzLm1hcCkge1xyXG4gICAgICBsZXQgaXNBY3RpdmVEcmF3TW9kZSA9IHRydWU7XHJcbiAgICAgIHN3aXRjaCAobW9kZSkge1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuT2ZmOlxyXG4gICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKFxyXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcclxuICAgICAgICAgICAgJ2Nyb3NzaGFpci1jdXJzb3ItZW5hYmxlZCdcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50cyhmYWxzZSk7XHJcbiAgICAgICAgICB0aGlzLnN0b3BEcmF3KCk7XHJcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XHJcbiAgICAgICAgICAgIGNvbG9yOiAnJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLnNldExlYWZsZXRNYXBFdmVudHModHJ1ZSwgdHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgICBpc0FjdGl2ZURyYXdNb2RlID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIERyYXdNb2RlLkFkZFBvbHlnb246XHJcbiAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoXHJcbiAgICAgICAgICAgIHRoaXMubWFwLmdldENvbnRhaW5lcigpLFxyXG4gICAgICAgICAgICAnY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkJ1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKHRydWUpO1xyXG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xyXG4gICAgICAgICAgICBjb2xvcjogZGVmYXVsdENvbmZpZy5wb2x5TGluZU9wdGlvbnMuY29sb3JcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5zZXRMZWFmbGV0TWFwRXZlbnRzKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdFBvbHlnb246XHJcbiAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoXHJcbiAgICAgICAgICAgIHRoaXMubWFwLmdldENvbnRhaW5lcigpLFxyXG4gICAgICAgICAgICAnY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkJ1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKHRydWUpO1xyXG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xyXG4gICAgICAgICAgICBjb2xvcjogJyNEOTQ2MEYnXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyhmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBtb2RlQ2hhbmdlKG1vZGU6IERyYXdNb2RlKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKG1vZGUpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXHJcbiAgZHJhd01vZGVDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuQWRkUG9seWdvbik7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcclxuICBmcmVlZHJhd01lbnVDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuQWRkUG9seWdvbik7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXHJcbiAgc3VidHJhY3RDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuU3VidHJhY3RQb2x5Z29uKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgcmVzZXRUcmFja2VyKCkge1xyXG4gICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbWzAsIDBdXSk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVNYXJrZXJNZW51KCk6IHZvaWQge1xyXG4gICAgYWxlcnQoJ29wZW4gbWVudScpO1xyXG4gIH1cclxuICBwcml2YXRlIGdldEh0bWxDb250ZW50KGNhbGxCYWNrOiBGdW5jdGlvbik6IEhUTUxFbGVtZW50IHtcclxuICAgIGNvbnN0IGNvbXAgPSB0aGlzLnBvcHVwR2VuZXJhdG9yLmdlbmVyYXRlQWx0ZXJQb3B1cCgpO1xyXG4gICAgY29tcC5pbnN0YW5jZS5iYm94Q2xpY2tlZC5zdWJzY3JpYmUoZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdiYm94IGNsaWNrZWQnLCBlKTtcclxuICAgICAgY2FsbEJhY2soZSk7XHJcbiAgICB9KTtcclxuICAgIGNvbXAuaW5zdGFuY2Uuc2ltcGx5ZmlDbGlja2VkLnN1YnNjcmliZShlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ3NpbXBseWZpIGNsaWNrZWQnLCBlKTtcclxuICAgICAgY2FsbEJhY2soZSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb21wLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgfVxyXG4gIHByaXZhdGUgY29udmVydFRvQm91bmRzUG9seWdvbihsYXRsbmdzOiBJTGF0TG5nW10pIHtcclxuICAgIGNvbnN0IGxQb2x5ID0gdGhpcy5sZWFmbGV0SGVscGVyLmNyZWF0ZVBvbHlnb24obGF0bG5ncyk7XHJcblxyXG4gICAgLy8gY29uc3QgY29vcmRzID0gdGhpcy5jb252ZXJ0VG9Db29yZHMoW2xhdGxuZ3NdKTtcclxuICAgIC8vIGNvbnN0IHAgPSB0aGlzLmdldFBvbHlnb24oKVxyXG5cclxuICAgIC8vIGlmIChwb2x5Lmdlb21ldHJ5LnR5cGUgPT09IFwiTXVsdGlQb2x5Z29uXCIpIHtcclxuICAgIC8vICAgbGV0IG5ld1BvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIuY29udmVydFRvQm91bmRpbmdCb3hQb2x5Z29uKHBvbHkpO1xyXG4gICAgLy8gICB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24ocG9seSkpO1xyXG4gICAgLy8gICB0aGlzLmFkZFBvbHlnb25MYXllcihuZXdQb2x5Z29uLCBmYWxzZSk7XHJcbiAgICAvLyB9XHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0TWFya2VySW5kZXgoXHJcbiAgICBsYXRsbmdzOiBJTGF0TG5nW10sXHJcbiAgICBwb3NpdGlvbjogTWFya2VyUGxhY2VtZW50XHJcbiAgKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGJvdW5kczogTC5MYXRMbmdCb3VuZHMgPSBQb2x5RHJhd1V0aWwuZ2V0Qm91bmRzKFxyXG4gICAgICBsYXRsbmdzLFxyXG4gICAgICBNYXRoLnNxcnQoMikgLyAyXHJcbiAgICApO1xyXG4gICAgY29uc3QgY29tcGFzcyA9IG5ldyBDb21wYXNzKFxyXG4gICAgICBib3VuZHMuZ2V0V2VzdCgpLFxyXG4gICAgICBib3VuZHMuZ2V0U291dGgoKSxcclxuICAgICAgYm91bmRzLmdldEVhc3QoKSxcclxuICAgICAgYm91bmRzLmdldE5vcnRoKClcclxuICAgICk7XHJcbiAgICBjb25zdCBjb21wYXNzRGlyZWN0aW9uID0gY29tcGFzcy5nZXREaXJlY3Rpb24ocG9zaXRpb24pO1xyXG4gICAgY29uc3QgbGF0TG5nUG9pbnQ6IElMYXRMbmcgPSB7XHJcbiAgICAgIGxhdDogY29tcGFzc0RpcmVjdGlvblsxXSxcclxuICAgICAgbG5nOiBjb21wYXNzRGlyZWN0aW9uWzBdXHJcbiAgICB9O1xyXG4gICAgY29uc3QgdGFyZ2V0UG9pbnQgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0Q29vcmQobGF0TG5nUG9pbnQpO1xyXG4gICAgY29uc3QgZmMgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0RmVhdHVyZVBvaW50Q29sbGVjdGlvbihsYXRsbmdzKTtcclxuICAgIGNvbnN0IG5lYXJlc3RQb2ludElkeCA9IHRoaXMudHVyZkhlbHBlci5nZXROZWFyZXN0UG9pbnRJbmRleChcclxuICAgICAgdGFyZ2V0UG9pbnQsXHJcbiAgICAgIGZjIGFzIGFueVxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gbmVhcmVzdFBvaW50SWR4O1xyXG4gIH1cclxufVxyXG4vLyBmbHl0dCB0aWwgZW51bS50c1xyXG5leHBvcnQgZW51bSBEcmF3TW9kZSB7XHJcbiAgT2ZmID0gMCxcclxuICBBZGRQb2x5Z29uID0gMSxcclxuICBFZGl0UG9seWdvbiA9IDIsXHJcbiAgU3VidHJhY3RQb2x5Z29uID0gMyxcclxuICBMb2FkUG9seWdvbiA9IDRcclxufVxyXG4iXX0=