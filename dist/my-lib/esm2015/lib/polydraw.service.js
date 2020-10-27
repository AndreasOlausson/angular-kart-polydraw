import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import * as L from 'leaflet';
// import * as turf from "@turf/turf";
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, debounceTime, takeUntil } from 'rxjs/operators';
import { PolyStateService } from './map-state.service';
import { TurfHelperService } from './turf-helper.service';
import { PolygonInformationService } from './polygon-information.service';
import defaultConfig from './polyinfo.json';
import { ComponentGeneraterService } from './component-generater.service';
import { Compass, PolyDrawUtil } from './utils';
import { DrawMode } from './enums';
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
        this.minimumFreeDrawZoomLevel = 12;
        // add to config
        this.arrayOfFeatureGroups = [];
        this.tracer = {};
        // end add to config
        this.ngUnsubscribe = new Subject();
        this.config = null;
        this.mapState.map$.pipe(filter(m => m !== null)).subscribe((map) => {
            this.map = map;
            this.config = defaultConfig;
            this.configurate({});
            this.tracer = L.polyline([[0, 0]], this.config.polyLineOptions);
            this.initPolyDraw();
        });
        this.mapState.mapZoomLevel$
            .pipe(debounceTime(100), takeUntil(this.ngUnsubscribe))
            .subscribe((zoom) => {
            this.onZoomChange(zoom);
        });
    }
    // new
    configurate(config) {
        // TODO if config is path...
        this.config = Object.assign(Object.assign({}, defaultConfig), config);
        this.mergePolygons = this.config.mergePolygons;
        this.kinks = this.config.kinks;
    }
    // fine
    closeAndReset() {
        this.setDrawMode(DrawMode.Off);
        this.removeAllFeatureGroups();
    }
    // make readable
    deletePolygon(polygon) {
        if (polygon.length > 1) {
            polygon.length = 1;
        }
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(featureGroup => {
                const layer = featureGroup.getLayers()[0];
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
                    }
                    else {
                        if (latlng[0] !== latlng[latlng.length - 1]) {
                            test.push(latlng[0]);
                        }
                        polygon3 = test;
                    }
                    const equals = this.polygonArrayEquals(polygon3, polygon);
                    if (equals && length === 1) {
                        this.polygonInformation.deleteTrashcan(polygon);
                        this.removeFeatureGroup(featureGroup);
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
        this.arrayOfFeatureGroups.forEach(featureGroups => {
            this.map.removeLayer(featureGroups);
        });
        this.arrayOfFeatureGroups = [];
        this.polygonInformation.deletePolygonInformationStorage();
        this.polygonInformation.reset();
        this.polygonInformation.updatePolygons();
    }
    // fine
    getDrawMode() {
        return this.drawModeSubject.value;
    }
    addViken(polygon) {
        this.addPolygonLayer(polygon, true);
    }
    // check this
    addAutoPolygon(geographicBorders) {
        geographicBorders.forEach(group => {
            const featureGroup = new L.FeatureGroup();
            const polygon2 = this.turfHelper.getMultiPolygon(this.convertToCoords(group));
            const polygon = this.getPolygon(polygon2);
            featureGroup.addLayer(polygon);
            const markerLatlngs = polygon.getLatLngs();
            markerLatlngs.forEach(polygon => {
                polygon.forEach((polyElement, i) => {
                    if (i === 0) {
                        this.addMarker(polyElement, featureGroup);
                    }
                    else {
                        this.addHoleMarker(polyElement, featureGroup);
                    }
                });
                // this.addMarker(polygon[0], featureGroup);
                // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
            });
            this.arrayOfFeatureGroups.push(featureGroup);
        });
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
        this.polygonInformation.activate();
        this.polygonInformation.setMoveMode();
    }
    // innehåll i if'ar flytta till egna metoder
    convertToCoords(latlngs) {
        const coords = [];
        if (latlngs.length > 1 && latlngs.length < 3) {
            const coordinates = [];
            // tslint:disable-next-line: max-line-length
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
        return coords;
    }
    // fine
    initPolyDraw() {
        const container = this.map.getContainer();
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
    mouseDown(event) {
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
        this.polygonInformation.deletePolygonInformationStorage();
        const geoPos = this.turfHelper.turfConcaveman(this.tracer.toGeoJSON());
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
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
    }
    // fine
    startDraw() {
        this.drawStartedEvents(true);
    }
    // fine
    stopDraw() {
        this.resetTracker();
        this.drawStartedEvents(false);
    }
    onZoomChange(zoomLevel) {
        if (zoomLevel >= this.minimumFreeDrawZoomLevel) {
            this.polygonInformation.polygonDrawStates.canUsePolyDraw = true;
        }
        else {
            this.polygonInformation.polygonDrawStates.canUsePolyDraw = false;
            this.polygonInformation.setMoveMode();
        }
        this.polygonInformation.saveCurrentState();
    }
    // fine
    drawStartedEvents(onoff) {
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
        const polygon = this.getPolygon(latLngs);
        featureGroup.addLayer(polygon);
        const markerLatlngs = polygon.getLatLngs();
        markerLatlngs.forEach(polygon => {
            polygon.forEach((polyElement, i) => {
                if (i === 0) {
                    this.addMarker(polyElement, featureGroup);
                }
                else {
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
        const polygon = L.GeoJSON.geometryToLayer(latlngs);
        polygon.setStyle(this.config.polygonOptions);
        return polygon;
    }
    // fine
    merge(latlngs) {
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
                    }
                    else {
                        for (let j = 0; j < posarrays[0][0].length; j++) {
                            testarray.push(layerLength[j + 1].getLatLng());
                        }
                        hole.push(testarray);
                    }
                    newPos.push(hole);
                }
                else {
                    length += posarrays[index - 1][0].length;
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
        }
        layerLength[0].setLatLngs(newPos);
    }
    // check this
    markerDragEnd(FeatureGroup) {
        this.polygonInformation.deletePolygonInformationStorage();
        const featureCollection = FeatureGroup.toGeoJSON();
        if (featureCollection.features[0].geometry.coordinates.length > 1) {
            featureCollection.features[0].geometry.coordinates.forEach(element => {
                const feature = this.turfHelper.getMultiPolygon([element]);
                if (this.turfHelper.hasKinks(feature)) {
                    this.kinks = true;
                    const unkink = this.turfHelper.getKinks(feature);
                    // this.deletePolygon(this.getLatLngsFromJson(feature));
                    this.removeFeatureGroup(FeatureGroup);
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
        featureGroup.clearLayers();
        this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(featureGroups => featureGroups !== featureGroup);
        // this.updatePolygons();
        this.map.removeLayer(featureGroup);
    }
    // fine until refactoring
    removeFeatureGroupOnMerge(featureGroup) {
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
                case DrawMode.Add:
                    L.DomUtil.addClass(this.map.getContainer(), 'crosshair-cursor-enabled');
                    this.events(true);
                    this.tracer.setStyle({
                        color: defaultConfig.polyLineOptions.color
                    });
                    this.setLeafletMapEvents(false, false, false);
                    break;
                case DrawMode.Subtract:
                    L.DomUtil.addClass(this.map.getContainer(), 'crosshair-cursor-enabled');
                    this.events(true);
                    this.tracer.setStyle({
                        color: '#D9460F'
                    });
                    this.setLeafletMapEvents(false, false, false);
                    break;
            }
            if (isActiveDrawMode) {
                this.polygonInformation.setFreeDrawMode();
            }
            else {
                this.polygonInformation.setMoveMode();
            }
        }
    }
    modeChange(mode) {
        this.setDrawMode(mode);
        this.polygonInformation.saveCurrentState();
    }
    // remove, use modeChange
    drawModeClick() {
        if (this.polygonInformation.polygonDrawStates.isFreeDrawMode) {
            this.polygonInformation.setMoveMode();
            this.setDrawMode(DrawMode.Off);
        }
        else {
            this.polygonInformation.setFreeDrawMode();
            this.setDrawMode(DrawMode.Add);
        }
        this.polygonInformation.saveCurrentState();
    }
    // remove, use modeChange
    freedrawMenuClick() {
        this.setDrawMode(DrawMode.Add);
        this.polygonInformation.activate();
        this.polygonInformation.saveCurrentState();
    }
    // remove, use modeChange
    subtractClick() {
        this.setDrawMode(DrawMode.Subtract);
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
            callBack(e);
        });
        comp.instance.simplyfiClicked.subscribe(e => {
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
        const bounds = PolyDrawUtil.getBounds(latlngs, Math.sqrt(2) / 2);
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
PolyDrawService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PolyDrawService_Factory() { return new PolyDrawService(i0.ɵɵinject(i1.PolyStateService), i0.ɵɵinject(i2.ComponentGeneraterService), i0.ɵɵinject(i3.TurfHelperService), i0.ɵɵinject(i4.PolygonInformationService), i0.ɵɵinject(i5.LeafletHelperService)); }, token: PolyDrawService, providedIn: "root" });
PolyDrawService = __decorate([
    Injectable({
        providedIn: 'root'
    })
    // Rename - PolyDrawService
    ,
    __metadata("design:paramtypes", [PolyStateService,
        ComponentGeneraterService,
        TurfHelperService,
        PolygonInformationService,
        LeafletHelperService])
], PolyDrawService);
export { PolyDrawService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9wb2x5ZHJhdy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdCLHNDQUFzQztBQUN0QyxPQUFPLEVBQWMsZUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNoRCxPQUFPLEVBQWtCLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNuRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQzs7Ozs7OztBQU1oRSxJQUFhLGVBQWU7QUFENUIsMkJBQTJCO0FBQzNCLE1BQWEsZUFBZTtJQW9CMUIsWUFDVSxRQUEwQixFQUMxQixjQUF5QyxFQUN6QyxVQUE2QixFQUM3QixrQkFBNkMsRUFDN0MsYUFBbUM7UUFKbkMsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7UUFDMUIsbUJBQWMsR0FBZCxjQUFjLENBQTJCO1FBQ3pDLGVBQVUsR0FBVixVQUFVLENBQW1CO1FBQzdCLHVCQUFrQixH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LE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQzFELFdBQVcsRUFDWCxFQUFTLENBQ1YsQ0FBQztRQUVGLE9BQU8sZUFBZSxDQUFDO0lBQ3pCLENBQUM7Q0FDRixDQUFBOztZQS81QnFCLGdCQUFnQjtZQUNWLHlCQUF5QjtZQUM3QixpQkFBaUI7WUFDVCx5QkFBeUI7WUFDOUIsb0JBQW9COzs7QUF6QmxDLGVBQWU7SUFKM0IsVUFBVSxDQUFDO1FBQ1YsVUFBVSxFQUFFLE1BQU07S0FDbkIsQ0FBQztJQUNGLDJCQUEyQjs7cUNBc0JMLGdCQUFnQjtRQUNWLHlCQUF5QjtRQUM3QixpQkFBaUI7UUFDVCx5QkFBeUI7UUFDOUIsb0JBQW9CO0dBekJsQyxlQUFlLENBbzdCM0I7U0FwN0JZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0ICogYXMgTCBmcm9tICdsZWFmbGV0Jztcbi8vIGltcG9ydCAqIGFzIHR1cmYgZnJvbSBcIkB0dXJmL3R1cmZcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIEJlaGF2aW9yU3ViamVjdCwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZmlsdGVyLCBkZWJvdW5jZVRpbWUsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IEZlYXR1cmUsIFBvbHlnb24sIE11bHRpUG9seWdvbiB9IGZyb20gJ0B0dXJmL3R1cmYnO1xuaW1wb3J0IHsgUG9seVN0YXRlU2VydmljZSB9IGZyb20gJy4vbWFwLXN0YXRlLnNlcnZpY2UnO1xuaW1wb3J0IHsgVHVyZkhlbHBlclNlcnZpY2UgfSBmcm9tICcuL3R1cmYtaGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSB9IGZyb20gJy4vcG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlJztcbmltcG9ydCBkZWZhdWx0Q29uZmlnIGZyb20gJy4vcG9seWluZm8uanNvbic7XG5pbXBvcnQgeyBJTGF0TG5nLCBQb2x5Z29uRHJhd1N0YXRlcyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcbmltcG9ydCB7IENvbXBvbmVudEdlbmVyYXRlclNlcnZpY2UgfSBmcm9tICcuL2NvbXBvbmVudC1nZW5lcmF0ZXIuc2VydmljZSc7XG5pbXBvcnQgeyBDb21wYXNzLCBQb2x5RHJhd1V0aWwgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IE1hcmtlclBvc2l0aW9uLCBEcmF3TW9kZSB9IGZyb20gJy4vZW51bXMnO1xuaW1wb3J0IHsgTGVhZmxldEhlbHBlclNlcnZpY2UgfSBmcm9tICcuL2xlYWZsZXQtaGVscGVyLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSlcbi8vIFJlbmFtZSAtIFBvbHlEcmF3U2VydmljZVxuZXhwb3J0IGNsYXNzIFBvbHlEcmF3U2VydmljZSB7XG4gIC8vIERyYXdNb2RlcywgZGV0ZXJtaW5lIFVJIGJ1dHRvbnMgZXRjLi4uXG4gIGRyYXdNb2RlU3ViamVjdDogQmVoYXZpb3JTdWJqZWN0PERyYXdNb2RlPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8RHJhd01vZGU+KFxuICAgIERyYXdNb2RlLk9mZlxuICApO1xuICBkcmF3TW9kZSQ6IE9ic2VydmFibGU8RHJhd01vZGU+ID0gdGhpcy5kcmF3TW9kZVN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBtaW5pbXVtRnJlZURyYXdab29tTGV2ZWw6IG51bWJlciA9IDEyO1xuICBwcml2YXRlIG1hcDogTC5NYXA7XG5cbiAgcHJpdmF0ZSBtZXJnZVBvbHlnb25zOiBib29sZWFuO1xuICBwcml2YXRlIGtpbmtzOiBib29sZWFuO1xuICAvLyBhZGQgdG8gY29uZmlnXG4gIHByaXZhdGUgYXJyYXlPZkZlYXR1cmVHcm91cHM6IEwuRmVhdHVyZUdyb3VwPEwuTGF5ZXI+W10gPSBbXTtcbiAgcHJpdmF0ZSB0cmFjZXI6IEwuUG9seWxpbmUgPSB7fSBhcyBhbnk7XG4gIC8vIGVuZCBhZGQgdG8gY29uZmlnXG5cbiAgcHJpdmF0ZSBuZ1Vuc3Vic2NyaWJlID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBjb25maWc6IHR5cGVvZiBkZWZhdWx0Q29uZmlnID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIG1hcFN0YXRlOiBQb2x5U3RhdGVTZXJ2aWNlLFxuICAgIHByaXZhdGUgcG9wdXBHZW5lcmF0b3I6IENvbXBvbmVudEdlbmVyYXRlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSB0dXJmSGVscGVyOiBUdXJmSGVscGVyU2VydmljZSxcbiAgICBwcml2YXRlIHBvbHlnb25JbmZvcm1hdGlvbjogUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSxcbiAgICBwcml2YXRlIGxlYWZsZXRIZWxwZXI6IExlYWZsZXRIZWxwZXJTZXJ2aWNlXG4gICkge1xuICAgIHRoaXMubWFwU3RhdGUubWFwJC5waXBlKGZpbHRlcihtID0+IG0gIT09IG51bGwpKS5zdWJzY3JpYmUoKG1hcDogTC5NYXApID0+IHtcbiAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgICAgdGhpcy5jb25maWcgPSBkZWZhdWx0Q29uZmlnO1xuICAgICAgdGhpcy5jb25maWd1cmF0ZSh7fSk7XG4gICAgICB0aGlzLnRyYWNlciA9IEwucG9seWxpbmUoW1swLCAwXV0sIHRoaXMuY29uZmlnLnBvbHlMaW5lT3B0aW9ucyk7XG4gICAgICB0aGlzLmluaXRQb2x5RHJhdygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5tYXBTdGF0ZS5tYXBab29tTGV2ZWwkXG4gICAgICAucGlwZShkZWJvdW5jZVRpbWUoMTAwKSwgdGFrZVVudGlsKHRoaXMubmdVbnN1YnNjcmliZSkpXG4gICAgICAuc3Vic2NyaWJlKCh6b29tOiBudW1iZXIpID0+IHtcbiAgICAgICAgdGhpcy5vblpvb21DaGFuZ2Uoem9vbSk7XG4gICAgICB9KTtcbiAgfVxuICAvLyBuZXdcbiAgY29uZmlndXJhdGUoY29uZmlnOiBPYmplY3QpOiB2b2lkIHtcbiAgICAvLyBUT0RPIGlmIGNvbmZpZyBpcyBwYXRoLi4uXG4gICAgdGhpcy5jb25maWcgPSB7IC4uLmRlZmF1bHRDb25maWcsIC4uLmNvbmZpZyB9O1xuXG4gICAgdGhpcy5tZXJnZVBvbHlnb25zID0gdGhpcy5jb25maWcubWVyZ2VQb2x5Z29ucztcbiAgICB0aGlzLmtpbmtzID0gdGhpcy5jb25maWcua2lua3M7XG4gIH1cblxuICAvLyBmaW5lXG4gIGNsb3NlQW5kUmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xuICAgIHRoaXMucmVtb3ZlQWxsRmVhdHVyZUdyb3VwcygpO1xuICB9XG5cbiAgLy8gbWFrZSByZWFkYWJsZVxuICBkZWxldGVQb2x5Z29uKHBvbHlnb246IElMYXRMbmdbXVtdKSB7XG4gICAgaWYgKHBvbHlnb24ubGVuZ3RoID4gMSkge1xuICAgICAgcG9seWdvbi5sZW5ndGggPSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55O1xuICAgICAgICBjb25zdCBsYXRsbmdzID0gbGF5ZXIuZ2V0TGF0TG5ncygpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBsYXRsbmdzLmxlbmd0aDtcbiAgICAgICAgLy8gID0gW11cblxuICAgICAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgaW5kZXgpID0+IHtcbiAgICAgICAgICBsZXQgcG9seWdvbjM7XG4gICAgICAgICAgY29uc3QgdGVzdCA9IFsuLi5sYXRsbmddO1xuXG4gICAgICAgICAgaWYgKGxhdGxuZy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBpZiAobGF0bG5nWzBdWzBdICE9PSBsYXRsbmdbMF1bbGF0bG5nWzBdLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgICAgIHRlc3RbMF0ucHVzaChsYXRsbmdbMF1bMF0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwb2x5Z29uMyA9IFt0ZXN0WzBdXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXSAhPT0gbGF0bG5nW2xhdGxuZy5sZW5ndGggLSAxXSkge1xuICAgICAgICAgICAgICB0ZXN0LnB1c2gobGF0bG5nWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvbHlnb24zID0gdGVzdDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBlcXVhbHMgPSB0aGlzLnBvbHlnb25BcnJheUVxdWFscyhwb2x5Z29uMywgcG9seWdvbik7XG5cbiAgICAgICAgICBpZiAoZXF1YWxzICYmIGxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlVHJhc2hjYW4ocG9seWdvbik7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChlcXVhbHMgJiYgbGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlVHJhc2hDYW5Pbk11bHRpKFtwb2x5Z29uXSk7XG4gICAgICAgICAgICBsYXRsbmdzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICBsYXllci5zZXRMYXRMbmdzKGxhdGxuZ3MpO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxheWVyLnRvR2VvSlNPTigpLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAvLyBmaW5lXG4gIHJlbW92ZUFsbEZlYXR1cmVHcm91cHMoKSB7XG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cHMgPT4ge1xuICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3Vwcyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gW107XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnJlc2V0KCk7XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24udXBkYXRlUG9seWdvbnMoKTtcbiAgfVxuICAvLyBmaW5lXG4gIGdldERyYXdNb2RlKCk6IERyYXdNb2RlIHtcbiAgICByZXR1cm4gdGhpcy5kcmF3TW9kZVN1YmplY3QudmFsdWU7XG4gIH1cblxuICBhZGRWaWtlbihwb2x5Z29uKSB7XG4gICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIocG9seWdvbiwgdHJ1ZSk7XG4gIH1cblxuICAvLyBjaGVjayB0aGlzXG4gIGFkZEF1dG9Qb2x5Z29uKGdlb2dyYXBoaWNCb3JkZXJzOiBMLkxhdExuZ1tdW11bXSk6IHZvaWQge1xuICAgIGdlb2dyYXBoaWNCb3JkZXJzLmZvckVhY2goZ3JvdXAgPT4ge1xuICAgICAgY29uc3QgZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCA9IG5ldyBMLkZlYXR1cmVHcm91cCgpO1xuXG4gICAgICBjb25zdCBwb2x5Z29uMiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXG4gICAgICAgIHRoaXMuY29udmVydFRvQ29vcmRzKGdyb3VwKVxuICAgICAgKTtcblxuICAgICAgY29uc3QgcG9seWdvbiA9IHRoaXMuZ2V0UG9seWdvbihwb2x5Z29uMik7XG5cbiAgICAgIGZlYXR1cmVHcm91cC5hZGRMYXllcihwb2x5Z29uKTtcbiAgICAgIGNvbnN0IG1hcmtlckxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcblxuICAgICAgbWFya2VyTGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xuICAgICAgICBwb2x5Z29uLmZvckVhY2goKHBvbHlFbGVtZW50LCBpKSA9PiB7XG4gICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuYWRkTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFkZEhvbGVNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gdGhpcy5hZGRNYXJrZXIocG9seWdvblswXSwgZmVhdHVyZUdyb3VwKTtcbiAgICAgICAgLy8gVE9ETyAtIEh2aXMgcG9seWdvbi5sZW5ndGggPjEsIHPDpSBoYXIgZGVuIGh1bGw6IGVnZW4gYWRkTWFya2VyIGZ1bmtzam9uXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5wdXNoKGZlYXR1cmVHcm91cCk7XG4gICAgfSk7XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHNcbiAgICApO1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0TW92ZU1vZGUoKTtcbiAgfVxuXG4gIC8vIGlubmVow6VsbCBpIGlmJ2FyIGZseXR0YSB0aWxsIGVnbmEgbWV0b2RlclxuICBwcml2YXRlIGNvbnZlcnRUb0Nvb3JkcyhsYXRsbmdzOiBJTGF0TG5nW11bXSkge1xuICAgIGNvbnN0IGNvb3JkcyA9IFtdO1xuXG4gICAgaWYgKGxhdGxuZ3MubGVuZ3RoID4gMSAmJiBsYXRsbmdzLmxlbmd0aCA8IDMpIHtcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gW107XG5cbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbWF4LWxpbmUtbGVuZ3RoXG4gICAgICBjb25zdCB3aXRoaW4gPSB0aGlzLnR1cmZIZWxwZXIuaXNXaXRoaW4oXG4gICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdKSxcbiAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKVxuICAgICAgKTtcbiAgICAgIGlmICh3aXRoaW4pIHtcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xuICAgICAgICAgIGNvb3JkaW5hdGVzLnB1c2goTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xuICAgICAgICAgIGNvb3Jkcy5wdXNoKFtMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHBvbHlnb24pXSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgIGNvb3Jkcy5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGxhdGxuZ3MubGVuZ3RoID4gMikge1xuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBbXTtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMTsgaW5kZXggPCBsYXRsbmdzLmxlbmd0aCAtIDE7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3Qgd2l0aGluID0gdGhpcy50dXJmSGVscGVyLmlzV2l0aGluKFxuICAgICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tpbmRleF0pLFxuICAgICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSlcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHdpdGhpbikge1xuICAgICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzLnB1c2goTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29vcmRzLnB1c2goY29vcmRpbmF0ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgICAgICAgIGNvb3Jkcy5wdXNoKFtMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHBvbHlnb24pXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29vcmRzO1xuICB9XG5cbiAgLy8gZmluZVxuICBwcml2YXRlIGluaXRQb2x5RHJhdygpIHtcbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCk7XG4gICAgY29uc3QgZHJhd01vZGUgPSB0aGlzLmdldERyYXdNb2RlKCk7XG4gICAgaWYgKHRoaXMuY29uZmlnLnRvdWNoU3VwcG9ydCkge1xuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQgbW91c2Vkb3duJywgZSA9PiB7XG4gICAgICAgIGlmIChkcmF3TW9kZSAhPT0gRHJhd01vZGUuT2ZmKSB7XG4gICAgICAgICAgdGhpcy5tb3VzZURvd24oZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQgbW91c2V1cCcsIGUgPT4ge1xuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xuICAgICAgICAgIHRoaXMubW91c2VVcExlYXZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlIG1vdXNlbW92ZScsIGUgPT4ge1xuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xuICAgICAgICAgIHRoaXMubW91c2VNb3ZlKGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLm1hcC5hZGRMYXllcih0aGlzLnRyYWNlcik7XG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xuICB9XG4gIC8vIFRlc3QgTC5Nb3VzZUV2ZW50XG4gIHByaXZhdGUgbW91c2VEb3duKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT0gbnVsbCkge1xuICAgICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbZXZlbnQubGF0bG5nXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxhdGxuZyA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcoW1xuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFgsXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WVxuICAgICAgXSk7XG4gICAgICB0aGlzLnRyYWNlci5zZXRMYXRMbmdzKFtsYXRsbmddKTtcbiAgICB9XG4gICAgdGhpcy5zdGFydERyYXcoKTtcbiAgfVxuXG4gIC8vIFRPRE8gZXZlbnQgdHlwZSwgY3JlYXRlIGNvbnRhaW5lclBvaW50VG9MYXRMbmctbWV0aG9kXG4gIHByaXZhdGUgbW91c2VNb3ZlKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT0gbnVsbCkge1xuICAgICAgdGhpcy50cmFjZXIuYWRkTGF0TG5nKGV2ZW50LmxhdGxuZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxhdGxuZyA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcoW1xuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFgsXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WVxuICAgICAgXSk7XG4gICAgICB0aGlzLnRyYWNlci5hZGRMYXRMbmcobGF0bG5nKTtcbiAgICB9XG4gIH1cblxuICAvLyBmaW5lXG4gIHByaXZhdGUgbW91c2VVcExlYXZlKCkge1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoKTtcblxuICAgIGNvbnN0IGdlb1BvczogRmVhdHVyZTxcbiAgICAgIFBvbHlnb24gfCBNdWx0aVBvbHlnb25cbiAgICA+ID0gdGhpcy50dXJmSGVscGVyLnR1cmZDb25jYXZlbWFuKHRoaXMudHJhY2VyLnRvR2VvSlNPTigpIGFzIGFueSk7XG4gICAgdGhpcy5zdG9wRHJhdygpO1xuICAgIHN3aXRjaCAodGhpcy5nZXREcmF3TW9kZSgpKSB7XG4gICAgICBjYXNlIERyYXdNb2RlLkFkZDpcbiAgICAgICAgdGhpcy5hZGRQb2x5Z29uKGdlb1BvcywgdHJ1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdDpcbiAgICAgICAgdGhpcy5zdWJ0cmFjdFBvbHlnb24oZ2VvUG9zKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKFxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwc1xuICAgICk7XG4gIH1cbiAgLy8gZmluZVxuICBwcml2YXRlIHN0YXJ0RHJhdygpIHtcbiAgICB0aGlzLmRyYXdTdGFydGVkRXZlbnRzKHRydWUpO1xuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBzdG9wRHJhdygpIHtcbiAgICB0aGlzLnJlc2V0VHJhY2tlcigpO1xuICAgIHRoaXMuZHJhd1N0YXJ0ZWRFdmVudHMoZmFsc2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblpvb21DaGFuZ2Uoem9vbUxldmVsOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoem9vbUxldmVsID49IHRoaXMubWluaW11bUZyZWVEcmF3Wm9vbUxldmVsKSB7XG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uRHJhd1N0YXRlcy5jYW5Vc2VQb2x5RHJhdyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25EcmF3U3RhdGVzLmNhblVzZVBvbHlEcmF3ID0gZmFsc2U7XG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRNb3ZlTW9kZSgpO1xuICAgIH1cbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XG4gIH1cbiAgLy8gZmluZVxuICBwcml2YXRlIGRyYXdTdGFydGVkRXZlbnRzKG9ub2ZmOiBib29sZWFuKSB7XG4gICAgY29uc3Qgb25vcm9mZiA9IG9ub2ZmID8gJ29uJyA6ICdvZmYnO1xuXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlLCB0aGlzKTtcbiAgICB0aGlzLm1hcFtvbm9yb2ZmXSgnbW91c2V1cCcsIHRoaXMubW91c2VVcExlYXZlLCB0aGlzKTtcbiAgfVxuICAvLyBPbiBob2xkXG4gIHByaXZhdGUgc3VidHJhY3RQb2x5Z29uKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcbiAgICB0aGlzLnN1YnRyYWN0KGxhdGxuZ3MpO1xuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBhZGRQb2x5Z29uKFxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXG4gICAgc2ltcGxpZnk6IGJvb2xlYW4sXG4gICAgbm9NZXJnZTogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIGlmIChcbiAgICAgIHRoaXMubWVyZ2VQb2x5Z29ucyAmJlxuICAgICAgIW5vTWVyZ2UgJiZcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCAmJlxuICAgICAgIXRoaXMua2lua3NcbiAgICApIHtcbiAgICAgIHRoaXMubWVyZ2UobGF0bG5ncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxhdGxuZ3MsIHNpbXBsaWZ5KTtcbiAgICB9XG4gIH1cbiAgLy8gZmluZVxuICBwcml2YXRlIGFkZFBvbHlnb25MYXllcihcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxuICAgIHNpbXBsaWZ5OiBib29sZWFuXG4gICkge1xuICAgIGNvbnN0IGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXAgPSBuZXcgTC5GZWF0dXJlR3JvdXAoKTtcblxuICAgIGNvbnN0IGxhdExuZ3MgPSBzaW1wbGlmeSA/IHRoaXMudHVyZkhlbHBlci5nZXRTaW1wbGlmaWVkKGxhdGxuZ3MpIDogbGF0bG5ncztcblxuICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLmdldFBvbHlnb24obGF0TG5ncyk7XG4gICAgZmVhdHVyZUdyb3VwLmFkZExheWVyKHBvbHlnb24pO1xuXG4gICAgY29uc3QgbWFya2VyTGF0bG5ncyA9IHBvbHlnb24uZ2V0TGF0TG5ncygpO1xuICAgIG1hcmtlckxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgIHBvbHlnb24uZm9yRWFjaCgocG9seUVsZW1lbnQ6IElMYXRMbmdbXSwgaTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5hZGRNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5hZGRIb2xlTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIHRoaXMuYWRkTWFya2VyKHBvbHlnb25bMF0sIGZlYXR1cmVHcm91cCk7XG4gICAgICAvLyBUT0RPIC0gSHZpcyBwb2x5Z29uLmxlbmd0aCA+MSwgc8OlIGhhciBkZW4gaHVsbDogZWdlbiBhZGRNYXJrZXIgZnVua3Nqb25cbiAgICB9KTtcblxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMucHVzaChmZWF0dXJlR3JvdXApO1xuXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uYWN0aXZhdGUoKTtcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XG5cbiAgICBmZWF0dXJlR3JvdXAub24oJ2NsaWNrJywgZSA9PiB7XG4gICAgICB0aGlzLnBvbHlnb25DbGlja2VkKGUsIGxhdExuZ3MpO1xuICAgIH0pO1xuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBwb2x5Z29uQ2xpY2tlZChlOiBhbnksIHBvbHk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcbiAgICBjb25zdCBuZXdQb2ludCA9IGUubGF0bG5nO1xuICAgIGlmIChwb2x5Lmdlb21ldHJ5LnR5cGUgPT09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmluamVjdFBvaW50VG9Qb2x5Z29uKHBvbHksIFtcbiAgICAgICAgbmV3UG9pbnQubG5nLFxuICAgICAgICBuZXdQb2ludC5sYXRcbiAgICAgIF0pO1xuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKHBvbHkpKTtcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld1BvbHlnb24sIGZhbHNlKTtcbiAgICB9XG4gIH1cbiAgLy8gZmluZVxuICBwcml2YXRlIGdldFBvbHlnb24obGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xuICAgIGNvbnN0IHBvbHlnb24gPSBMLkdlb0pTT04uZ2VvbWV0cnlUb0xheWVyKGxhdGxuZ3MpIGFzIGFueTtcblxuICAgIHBvbHlnb24uc2V0U3R5bGUodGhpcy5jb25maWcucG9seWdvbk9wdGlvbnMpO1xuICAgIHJldHVybiBwb2x5Z29uO1xuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBtZXJnZShsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XG4gICAgY29uc3QgcG9seWdvbkZlYXR1cmUgPSBbXTtcbiAgICBjb25zdCBuZXdBcnJheTogTC5GZWF0dXJlR3JvdXBbXSA9IFtdO1xuICAgIGxldCBwb2x5SW50ZXJzZWN0aW9uID0gZmFsc2U7XG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XG4gICAgICBjb25zdCBmZWF0dXJlQ29sbGVjdGlvbiA9IGZlYXR1cmVHcm91cC50b0dlb0pTT04oKSBhcyBhbnk7XG5cbiAgICAgIGlmIChmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcbiAgICAgICAgICBwb2x5SW50ZXJzZWN0aW9uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25JbnRlcnNlY3QoZmVhdHVyZSwgbGF0bG5ncyk7XG4gICAgICAgICAgaWYgKHBvbHlJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAgIG5ld0FycmF5LnB1c2goZmVhdHVyZUdyb3VwKTtcbiAgICAgICAgICAgIHBvbHlnb25GZWF0dXJlLnB1c2goZmVhdHVyZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24oXG4gICAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF1cbiAgICAgICAgKTtcbiAgICAgICAgcG9seUludGVyc2VjdGlvbiA9IHRoaXMudHVyZkhlbHBlci5wb2x5Z29uSW50ZXJzZWN0KGZlYXR1cmUsIGxhdGxuZ3MpO1xuICAgICAgICBpZiAocG9seUludGVyc2VjdGlvbikge1xuICAgICAgICAgIG5ld0FycmF5LnB1c2goZmVhdHVyZUdyb3VwKTtcbiAgICAgICAgICBwb2x5Z29uRmVhdHVyZS5wdXNoKGZlYXR1cmUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAobmV3QXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy51bmlvblBvbHlnb25zKG5ld0FycmF5LCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxhdGxuZ3MsIHRydWUpO1xuICAgIH1cbiAgfVxuICAvLyBuZXh0XG4gIHByaXZhdGUgc3VidHJhY3QobGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xuICAgIGxldCBhZGRIb2xlID0gbGF0bG5ncztcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcbiAgICAgIGNvbnN0IGxheWVyID0gZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF07XG4gICAgICBjb25zdCBwb2x5ID0gdGhpcy5nZXRMYXRMbmdzRnJvbUpzb24obGF5ZXIpO1xuICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihcbiAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF1cbiAgICAgICk7XG4gICAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25EaWZmZXJlbmNlKGZlYXR1cmUsIGFkZEhvbGUpO1xuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKHBvbHkpO1xuICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cCk7XG4gICAgICBhZGRIb2xlID0gbmV3UG9seWdvbjtcbiAgICB9KTtcblxuICAgIGNvbnN0IG5ld0xhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4gPSBhZGRIb2xlO1xuICAgIGNvbnN0IGNvb3JkcyA9IHRoaXMudHVyZkhlbHBlci5nZXRDb29yZHMobmV3TGF0bG5ncyk7XG4gICAgY29vcmRzLmZvckVhY2godmFsdWUgPT4ge1xuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIodGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihbdmFsdWVdKSwgdHJ1ZSk7XG4gICAgfSk7XG4gIH1cbiAgLy8gZmluZVxuICBwcml2YXRlIGV2ZW50cyhvbm9mZjogYm9vbGVhbikge1xuICAgIGNvbnN0IG9ub3JvZmYgPSBvbm9mZiA/ICdvbicgOiAnb2ZmJztcbiAgICB0aGlzLm1hcFtvbm9yb2ZmXSgnbW91c2Vkb3duJywgdGhpcy5tb3VzZURvd24sIHRoaXMpO1xuICB9XG4gIC8vIGZpbmUsIFRPRE86IGlmIHNwZWNpYWwgbWFya2Vyc1xuICBwcml2YXRlIGFkZE1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcbiAgICBjb25zdCBtZW51TWFya2VySWR4ID0gdGhpcy5nZXRNYXJrZXJJbmRleChcbiAgICAgIGxhdGxuZ3MsXG4gICAgICB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnBvc2l0aW9uXG4gICAgKTtcbiAgICBjb25zdCBkZWxldGVNYXJrZXJJZHggPSB0aGlzLmdldE1hcmtlckluZGV4KFxuICAgICAgbGF0bG5ncyxcbiAgICAgIHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5wb3NpdGlvblxuICAgICk7XG5cbiAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgaSkgPT4ge1xuICAgICAgY29uc3QgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckljb24uc3R5bGVDbGFzc2VzO1xuICAgICAgLyogICBpZiAoaSA9PT0gbWVudU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnN0eWxlQ2xhc3NlcztcbiAgICAgIH1cbiAgICAgIGlmIChpID09PSBkZWxldGVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckRlbGV0ZUljb24uc3R5bGVDbGFzc2VzO1xuICAgICAgfSAqL1xuICAgICAgY29uc3QgbWFya2VyID0gbmV3IEwuTWFya2VyKGxhdGxuZywge1xuICAgICAgICBpY29uOiB0aGlzLmNyZWF0ZURpdkljb24oaWNvbkNsYXNzZXMpLFxuICAgICAgICBkcmFnZ2FibGU6IHRydWUsXG4gICAgICAgIHRpdGxlOiBpLnRvU3RyaW5nKClcbiAgICAgIH0pO1xuICAgICAgRmVhdHVyZUdyb3VwLmFkZExheWVyKG1hcmtlcikuYWRkVG8odGhpcy5tYXApO1xuXG4gICAgICBtYXJrZXIub24oJ2RyYWcnLCBlID0+IHtcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnKEZlYXR1cmVHcm91cCk7XG4gICAgICB9KTtcbiAgICAgIG1hcmtlci5vbignZHJhZ2VuZCcsIGUgPT4ge1xuICAgICAgICB0aGlzLm1hcmtlckRyYWdFbmQoRmVhdHVyZUdyb3VwKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKGkgPT09IG1lbnVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XG4gICAgICAgIC8vIG1hcmtlci5iaW5kUG9wdXAoXG4gICAgICAgIC8vICAgdGhpcy5nZXRIdG1sQ29udGVudChlID0+IHtcblxuICAgICAgICAvLyAgIH0pXG4gICAgICAgIC8vICk7XG4gICAgICAgIG1hcmtlci5vbignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICB0aGlzLmNvbnZlcnRUb0JvdW5kc1BvbHlnb24obGF0bG5ncywgdHJ1ZSk7XG4gICAgICAgICAgLy8gdGhpcy5jb252ZXJ0VG9TaW1wbGlmaWVkUG9seWdvbihsYXRsbmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoaSA9PT0gZGVsZXRlTWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XG4gICAgICAgIG1hcmtlci5vbignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFkZEhvbGVNYXJrZXIobGF0bG5nczogSUxhdExuZ1tdLCBGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XG4gICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIGkpID0+IHtcbiAgICAgIGNvbnN0IGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJJY29uLnN0eWxlQ2xhc3NlcztcbiAgICAgIC8qICBpZiAoaSA9PT0gMCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnN0eWxlQ2xhc3NlcztcbiAgICAgIH1cblxuICAgICAgLy9UT0RPLSBsZWdnIHRpbCBmaWxsIGljb25cbiAgICAgIGlmIChpID09PSBsYXRsbmdzLmxlbmd0aCAtIDEgJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckRlbGV0ZUljb24uc3R5bGVDbGFzc2VzO1xuICAgICAgfSAqL1xuICAgICAgY29uc3QgbWFya2VyID0gbmV3IEwuTWFya2VyKGxhdGxuZywge1xuICAgICAgICBpY29uOiB0aGlzLmNyZWF0ZURpdkljb24oaWNvbkNsYXNzZXMpLFxuICAgICAgICBkcmFnZ2FibGU6IHRydWUsXG4gICAgICAgIHRpdGxlOiBpLnRvU3RyaW5nKClcbiAgICAgIH0pO1xuICAgICAgRmVhdHVyZUdyb3VwLmFkZExheWVyKG1hcmtlcikuYWRkVG8odGhpcy5tYXApO1xuXG4gICAgICBtYXJrZXIub24oJ2RyYWcnLCBlID0+IHtcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnKEZlYXR1cmVHcm91cCk7XG4gICAgICB9KTtcbiAgICAgIG1hcmtlci5vbignZHJhZ2VuZCcsIGUgPT4ge1xuICAgICAgICB0aGlzLm1hcmtlckRyYWdFbmQoRmVhdHVyZUdyb3VwKTtcbiAgICAgIH0pO1xuICAgICAgLyogICBpZiAoaSA9PT0gMCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcbiAgICAgICAgbWFya2VyLmJpbmRQb3B1cCh0aGlzLmdldEh0bWxDb250ZW50KChlKSA9PiB7XG4gICAgICAgIH0pKTtcbiAgICAgICAgLy8gbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XG4gICAgICAgIC8vICAgdGhpcy50b2dnbGVNYXJrZXJNZW51KCk7XG4gICAgICAgIC8vIH0pXG4gICAgICB9XG4gICAgICBpZiAoaSA9PT0gbGF0bG5ncy5sZW5ndGggLSAxICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XG4gICAgICAgIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xuICAgICAgICB9KTtcbiAgICAgIH0gKi9cbiAgICB9KTtcbiAgfVxuICBwcml2YXRlIGNyZWF0ZURpdkljb24oY2xhc3NOYW1lczogc3RyaW5nW10pOiBMLkRpdkljb24ge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcbiAgICBjb25zdCBpY29uID0gTC5kaXZJY29uKHsgY2xhc3NOYW1lOiBjbGFzc2VzIH0pO1xuICAgIHJldHVybiBpY29uO1xuICB9XG4gIC8vIFRPRE86IENsZWFudXBcbiAgcHJpdmF0ZSBtYXJrZXJEcmFnKEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcbiAgICBjb25zdCBuZXdQb3MgPSBbXTtcbiAgICBsZXQgdGVzdGFycmF5ID0gW107XG4gICAgbGV0IGhvbGUgPSBbXTtcbiAgICBjb25zdCBsYXllckxlbmd0aCA9IEZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSBhcyBhbnk7XG4gICAgY29uc3QgcG9zYXJyYXlzID0gbGF5ZXJMZW5ndGhbMF0uZ2V0TGF0TG5ncygpO1xuXG4gICAgbGV0IGxlbmd0aCA9IDA7XG4gICAgaWYgKHBvc2FycmF5cy5sZW5ndGggPiAxKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcG9zYXJyYXlzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB0ZXN0YXJyYXkgPSBbXTtcbiAgICAgICAgaG9sZSA9IFtdO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF0ubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBob2xlLnB1c2godGVzdGFycmF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1bMF0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxlbmd0aCArPSBwb3NhcnJheXNbaW5kZXggLSAxXVswXS5sZW5ndGg7XG5cbiAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoOyBqIDwgcG9zYXJyYXlzW2luZGV4XVswXS5sZW5ndGggKyBsZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdGVzdGFycmF5LnB1c2goKGxheWVyTGVuZ3RoW2ogKyAxXSBhcyBhbnkpLmdldExhdExuZygpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XG4gICAgICAgICAgbmV3UG9zLnB1c2goaG9sZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdGVzdGFycmF5ID0gW11cbiAgICAgIGhvbGUgPSBbXTtcbiAgICAgIGxldCBsZW5ndGgyID0gMDtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NhcnJheXNbMF0ubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHRlc3RhcnJheSA9IFtdO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVswXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZW5ndGgyICs9IHBvc2FycmF5c1swXVtpbmRleCAtIDFdLmxlbmd0aDtcblxuICAgICAgICAgIGZvciAobGV0IGogPSBsZW5ndGgyOyBqIDwgcG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGggKyBsZW5ndGgyOyBqKyspIHtcbiAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xuICAgICAgfVxuICAgICAgbmV3UG9zLnB1c2goaG9sZSk7XG4gICAgfVxuXG4gICAgbGF5ZXJMZW5ndGhbMF0uc2V0TGF0TG5ncyhuZXdQb3MpO1xuICB9XG4gIC8vIGNoZWNrIHRoaXNcbiAgcHJpdmF0ZSBtYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XG4gICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBGZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xuXG4gICAgaWYgKGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFtlbGVtZW50XSk7XG5cbiAgICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xuICAgICAgICAgIHRoaXMua2lua3MgPSB0cnVlO1xuICAgICAgICAgIGNvbnN0IHVua2luayA9IHRoaXMudHVyZkhlbHBlci5nZXRLaW5rcyhmZWF0dXJlKTtcbiAgICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xuICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XG5cbiAgICAgICAgICB1bmtpbmsuZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbihcbiAgICAgICAgICAgICAgdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKHBvbHlnb24pLFxuICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmtpbmtzID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKGZlYXR1cmUsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlc1xuICAgICAgKTtcblxuICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xuICAgICAgICB0aGlzLmtpbmtzID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgdW5raW5rID0gdGhpcy50dXJmSGVscGVyLmdldEtpbmtzKGZlYXR1cmUpO1xuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xuICAgICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChGZWF0dXJlR3JvdXApO1xuXG4gICAgICAgIGNvbnN0IHRlc3RDb29yZCA9IFtdO1xuICAgICAgICB1bmtpbmsuZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgICAgICB0aGlzLmFkZFBvbHlnb24odGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKHBvbHlnb24pLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyB0aGlzLmFkZFBvbHlnb24odGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbih0ZXN0Q29vcmQpLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xuICAgICAgICB0aGlzLmtpbmtzID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYWRkUG9seWdvbihmZWF0dXJlLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzXG4gICAgKTtcbiAgfVxuICAvLyBmaW5lLCBjaGVjayB0aGUgcmV0dXJuZWQgdHlwZVxuICBwcml2YXRlIGdldExhdExuZ3NGcm9tSnNvbihcbiAgICBmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XG4gICk6IElMYXRMbmdbXVtdIHtcbiAgICBsZXQgY29vcmQ7XG4gICAgaWYgKGZlYXR1cmUpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggPiAxICYmXG4gICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PT0gJ011bHRpUG9seWdvbidcbiAgICAgICkge1xuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXSk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS50eXBlID09PSAnUG9seWdvbidcbiAgICAgICkge1xuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvb3JkO1xuICB9XG5cbiAgLy8gZmluZVxuICBwcml2YXRlIHVuaW9uUG9seWdvbnMoXG4gICAgbGF5ZXJzLFxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXG4gICAgcG9seWdvbkZlYXR1cmVcbiAgKSB7XG4gICAgbGV0IGFkZE5ldyA9IGxhdGxuZ3M7XG4gICAgbGF5ZXJzLmZvckVhY2goKGZlYXR1cmVHcm91cCwgaSkgPT4ge1xuICAgICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBmZWF0dXJlR3JvdXAudG9HZW9KU09OKCk7XG4gICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdO1xuICAgICAgY29uc3QgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcbiAgICAgIGNvbnN0IHVuaW9uID0gdGhpcy50dXJmSGVscGVyLnVuaW9uKGFkZE5ldywgcG9seWdvbkZlYXR1cmVbaV0pOyAvLyBDaGVjayBmb3IgbXVsdGlwb2x5Z29uc1xuICAgICAgLy8gTmVlZHMgYSBjbGVhbnVwIGZvciB0aGUgbmV3IHZlcnNpb25cbiAgICAgIHRoaXMuZGVsZXRlUG9seWdvbk9uTWVyZ2UocG9seSk7XG4gICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChmZWF0dXJlR3JvdXApO1xuXG4gICAgICBhZGROZXcgPSB1bmlvbjtcbiAgICB9KTtcblxuICAgIGNvbnN0IG5ld0xhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4gPSBhZGROZXc7IC8vIFRyZW5nZXIga2Fuc2tqZSB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24oIGFkZE5ldyk7XG4gICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobmV3TGF0bG5ncywgdHJ1ZSk7XG4gIH1cbiAgLy8gZmluZVxuICBwcml2YXRlIHJlbW92ZUZlYXR1cmVHcm91cChmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XG4gICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3VwcyA9IHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZmlsdGVyKFxuICAgICAgZmVhdHVyZUdyb3VwcyA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXBcbiAgICApO1xuICAgIC8vIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcbiAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xuICB9XG4gIC8vIGZpbmUgdW50aWwgcmVmYWN0b3JpbmdcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcbiAgICBjb25zdCBuZXdBcnJheSA9IFtdO1xuICAgIGlmIChmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0pIHtcbiAgICAgIGNvbnN0IHBvbHlnb24gPSAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueSkuZ2V0TGF0TG5ncygpWzBdO1xuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5mb3JFYWNoKHYgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdi5wb2x5Z29uLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF0udG9TdHJpbmcoKSAmJlxuICAgICAgICAgIHYucG9seWdvblswXS50b1N0cmluZygpID09PSBwb2x5Z29uWzBdWzBdLnRvU3RyaW5nKClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdi5wb2x5Z29uID0gcG9seWdvbjtcbiAgICAgICAgICBuZXdBcnJheS5wdXNoKHYpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHYucG9seWdvbi50b1N0cmluZygpICE9PSBwb2x5Z29uWzBdLnRvU3RyaW5nKCkgJiZcbiAgICAgICAgICB2LnBvbHlnb25bMF0udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXVswXS50b1N0cmluZygpXG4gICAgICAgICkge1xuICAgICAgICAgIG5ld0FycmF5LnB1c2godik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5maWx0ZXIoXG4gICAgICAgIGZlYXR1cmVHcm91cHMgPT4gZmVhdHVyZUdyb3VwcyAhPT0gZmVhdHVyZUdyb3VwXG4gICAgICApO1xuXG4gICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xuICAgIH1cbiAgfVxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXG4gIHByaXZhdGUgZGVsZXRlUG9seWdvbk9uTWVyZ2UocG9seWdvbikge1xuICAgIGxldCBwb2x5Z29uMiA9IFtdO1xuICAgIGlmICh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xuICAgICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSBhcyBhbnk7XG4gICAgICAgIGNvbnN0IGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKClbMF07XG4gICAgICAgIHBvbHlnb24yID0gWy4uLmxhdGxuZ3NbMF1dO1xuICAgICAgICBpZiAobGF0bG5nc1swXVswXSAhPT0gbGF0bG5nc1swXVtsYXRsbmdzWzBdLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgcG9seWdvbjIucHVzaChsYXRsbmdzWzBdWzBdKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlcXVhbHMgPSB0aGlzLnBvbHlnb25BcnJheUVxdWFsc01lcmdlKHBvbHlnb24yLCBwb2x5Z29uKTtcblxuICAgICAgICBpZiAoZXF1YWxzKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cCk7XG4gICAgICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKHBvbHlnb24pO1xuICAgICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVRyYXNoY2FuKHBvbHlnb24pO1xuICAgICAgICAgIC8vIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcbiAgcHJpdmF0ZSBwb2x5Z29uQXJyYXlFcXVhbHNNZXJnZShwb2x5MTogYW55W10sIHBvbHkyOiBhbnlbXSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBwb2x5MS50b1N0cmluZygpID09PSBwb2x5Mi50b1N0cmluZygpO1xuICB9XG4gIC8vIFRPRE8gLSBsZWdnZSBldCBhbm5ldCBzdGVkXG4gIHByaXZhdGUgcG9seWdvbkFycmF5RXF1YWxzKHBvbHkxOiBhbnlbXSwgcG9seTI6IGFueVtdKTogYm9vbGVhbiB7XG4gICAgaWYgKHBvbHkxWzBdWzBdKSB7XG4gICAgICBpZiAoIXBvbHkxWzBdWzBdLmVxdWFscyhwb2x5MlswXVswXSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXBvbHkxWzBdLmVxdWFscyhwb2x5MlswXSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocG9seTEubGVuZ3RoICE9PSBwb2x5Mi5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBzZXRMZWFmbGV0TWFwRXZlbnRzKFxuICAgIGVuYWJsZURyYWdnaW5nOiBib29sZWFuLFxuICAgIGVuYWJsZURvdWJsZUNsaWNrWm9vbTogYm9vbGVhbixcbiAgICBlbmFibGVTY3JvbGxXaGVlbFpvb206IGJvb2xlYW5cbiAgKSB7XG4gICAgZW5hYmxlRHJhZ2dpbmcgPyB0aGlzLm1hcC5kcmFnZ2luZy5lbmFibGUoKSA6IHRoaXMubWFwLmRyYWdnaW5nLmRpc2FibGUoKTtcbiAgICBlbmFibGVEb3VibGVDbGlja1pvb21cbiAgICAgID8gdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmVuYWJsZSgpXG4gICAgICA6IHRoaXMubWFwLmRvdWJsZUNsaWNrWm9vbS5kaXNhYmxlKCk7XG4gICAgZW5hYmxlU2Nyb2xsV2hlZWxab29tXG4gICAgICA/IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5lbmFibGUoKVxuICAgICAgOiB0aGlzLm1hcC5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xuICB9XG4gIC8vIGZpbmVcbiAgc2V0RHJhd01vZGUobW9kZTogRHJhd01vZGUpIHtcbiAgICB0aGlzLmRyYXdNb2RlU3ViamVjdC5uZXh0KG1vZGUpO1xuICAgIGlmICghIXRoaXMubWFwKSB7XG4gICAgICBsZXQgaXNBY3RpdmVEcmF3TW9kZSA9IHRydWU7XG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5PZmY6XG4gICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKFxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXG4gICAgICAgICAgICAnY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgdGhpcy5ldmVudHMoZmFsc2UpO1xuICAgICAgICAgIHRoaXMuc3RvcERyYXcoKTtcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XG4gICAgICAgICAgICBjb2xvcjogJydcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLnNldExlYWZsZXRNYXBFdmVudHModHJ1ZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgaXNBY3RpdmVEcmF3TW9kZSA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIERyYXdNb2RlLkFkZDpcbiAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcbiAgICAgICAgICAgICdjcm9zc2hhaXItY3Vyc29yLWVuYWJsZWQnXG4gICAgICAgICAgKTtcbiAgICAgICAgICB0aGlzLmV2ZW50cyh0cnVlKTtcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XG4gICAgICAgICAgICBjb2xvcjogZGVmYXVsdENvbmZpZy5wb2x5TGluZU9wdGlvbnMuY29sb3JcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLnNldExlYWZsZXRNYXBFdmVudHMoZmFsc2UsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRHJhd01vZGUuU3VidHJhY3Q6XG4gICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKFxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXG4gICAgICAgICAgICAnY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgdGhpcy5ldmVudHModHJ1ZSk7XG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xuICAgICAgICAgICAgY29sb3I6ICcjRDk0NjBGJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyhmYWxzZSwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQWN0aXZlRHJhd01vZGUpIHtcbiAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0RnJlZURyYXdNb2RlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRNb3ZlTW9kZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG1vZGVDaGFuZ2UobW9kZTogRHJhd01vZGUpOiB2b2lkIHtcbiAgICB0aGlzLnNldERyYXdNb2RlKG1vZGUpO1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcbiAgfVxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXG4gIGRyYXdNb2RlQ2xpY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25EcmF3U3RhdGVzLmlzRnJlZURyYXdNb2RlKSB7XG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRNb3ZlTW9kZSgpO1xuICAgICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRGcmVlRHJhd01vZGUoKTtcbiAgICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuQWRkKTtcbiAgICB9XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xuICB9XG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcbiAgZnJlZWRyYXdNZW51Q2xpY2soKTogdm9pZCB7XG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5BZGQpO1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xuICB9XG5cbiAgLy8gcmVtb3ZlLCB1c2UgbW9kZUNoYW5nZVxuICBzdWJ0cmFjdENsaWNrKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuU3VidHJhY3QpO1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcbiAgfVxuICAvLyBmaW5lXG4gIHByaXZhdGUgcmVzZXRUcmFja2VyKCkge1xuICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW1swLCAwXV0pO1xuICB9XG5cbiAgdG9nZ2xlTWFya2VyTWVudSgpOiB2b2lkIHtcbiAgICBhbGVydCgnb3BlbiBtZW51Jyk7XG4gIH1cbiAgcHJpdmF0ZSBnZXRIdG1sQ29udGVudChjYWxsQmFjazogRnVuY3Rpb24pOiBIVE1MRWxlbWVudCB7XG4gICAgY29uc3QgY29tcCA9IHRoaXMucG9wdXBHZW5lcmF0b3IuZ2VuZXJhdGVBbHRlclBvcHVwKCk7XG4gICAgY29tcC5pbnN0YW5jZS5iYm94Q2xpY2tlZC5zdWJzY3JpYmUoZSA9PiB7XG4gICAgICBjYWxsQmFjayhlKTtcbiAgICB9KTtcbiAgICBjb21wLmluc3RhbmNlLnNpbXBseWZpQ2xpY2tlZC5zdWJzY3JpYmUoZSA9PiB7XG4gICAgICBjYWxsQmFjayhlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29tcC5sb2NhdGlvbi5uYXRpdmVFbGVtZW50O1xuICB9XG4gIHByaXZhdGUgY29udmVydFRvQm91bmRzUG9seWdvbihcbiAgICBsYXRsbmdzOiBJTGF0TG5nW10sXG4gICAgYWRkTWlkcG9pbnRNYXJrZXJzOiBib29sZWFuID0gZmFsc2VcbiAgKSB7XG4gICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XG4gICAgY29uc3QgcG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXG4gICAgICB0aGlzLmNvbnZlcnRUb0Nvb3JkcyhbbGF0bG5nc10pXG4gICAgKTtcbiAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihcbiAgICAgIHBvbHlnb24sXG4gICAgICBhZGRNaWRwb2ludE1hcmtlcnNcbiAgICApO1xuXG4gICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIodGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKG5ld1BvbHlnb24pLCBmYWxzZSk7XG4gIH1cbiAgcHJpdmF0ZSBjb252ZXJ0VG9TaW1wbGlmaWVkUG9seWdvbihsYXRsbmdzOiBJTGF0TG5nW10pIHtcbiAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcbiAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihcbiAgICAgIHRoaXMuY29udmVydFRvQ29vcmRzKFtsYXRsbmdzXSlcbiAgICApO1xuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihuZXdQb2x5Z29uKSwgdHJ1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBnZXRNYXJrZXJJbmRleChsYXRsbmdzOiBJTGF0TG5nW10sIHBvc2l0aW9uOiBNYXJrZXJQb3NpdGlvbik6IG51bWJlciB7XG4gICAgY29uc3QgYm91bmRzOiBMLkxhdExuZ0JvdW5kcyA9IFBvbHlEcmF3VXRpbC5nZXRCb3VuZHMoXG4gICAgICBsYXRsbmdzLFxuICAgICAgTWF0aC5zcXJ0KDIpIC8gMlxuICAgICk7XG4gICAgY29uc3QgY29tcGFzcyA9IG5ldyBDb21wYXNzKFxuICAgICAgYm91bmRzLmdldFNvdXRoKCksXG4gICAgICBib3VuZHMuZ2V0V2VzdCgpLFxuICAgICAgYm91bmRzLmdldE5vcnRoKCksXG4gICAgICBib3VuZHMuZ2V0RWFzdCgpXG4gICAgKTtcbiAgICBjb25zdCBjb21wYXNzRGlyZWN0aW9uID0gY29tcGFzcy5nZXREaXJlY3Rpb24ocG9zaXRpb24pO1xuICAgIGNvbnN0IGxhdExuZ1BvaW50OiBJTGF0TG5nID0ge1xuICAgICAgbGF0OiBjb21wYXNzRGlyZWN0aW9uLmxhdCxcbiAgICAgIGxuZzogY29tcGFzc0RpcmVjdGlvbi5sbmdcbiAgICB9O1xuICAgIGNvbnN0IHRhcmdldFBvaW50ID0gdGhpcy50dXJmSGVscGVyLmdldENvb3JkKGxhdExuZ1BvaW50KTtcbiAgICBjb25zdCBmYyA9IHRoaXMudHVyZkhlbHBlci5nZXRGZWF0dXJlUG9pbnRDb2xsZWN0aW9uKGxhdGxuZ3MpO1xuICAgIGNvbnN0IG5lYXJlc3RQb2ludElkeCA9IHRoaXMudHVyZkhlbHBlci5nZXROZWFyZXN0UG9pbnRJbmRleChcbiAgICAgIHRhcmdldFBvaW50LFxuICAgICAgZmMgYXMgYW55XG4gICAgKTtcblxuICAgIHJldHVybiBuZWFyZXN0UG9pbnRJZHg7XG4gIH1cbn1cbiJdfQ==