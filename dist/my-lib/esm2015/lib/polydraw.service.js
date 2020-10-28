import { __decorate, __metadata } from "tslib";
import { Injectable } from "@angular/core";
import * as L from "leaflet";
// import * as turf from "@turf/turf";
import { BehaviorSubject, Subject } from "rxjs";
import { filter, debounceTime, takeUntil } from "rxjs/operators";
import { PolyStateService } from "./map-state.service";
import { TurfHelperService } from "./turf-helper.service";
import { PolygonInformationService } from "./polygon-information.service";
import defaultConfig from "./polyinfo.json";
import { ComponentGeneraterService } from "./component-generater.service";
import { Compass, PolyDrawUtil } from "./utils";
import { DrawMode } from "./enums";
import { LeafletHelperService } from "./leaflet-helper.service";
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
        this.mapState.map$
            .pipe(filter((m) => m !== null))
            .subscribe((map) => {
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
            this.arrayOfFeatureGroups.forEach((featureGroup) => {
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
        this.arrayOfFeatureGroups.forEach((featureGroups) => {
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
        geographicBorders.forEach((group) => {
            const featureGroup = new L.FeatureGroup();
            const polygon2 = this.turfHelper.getMultiPolygon(this.convertToCoords(group));
            const polygon = this.getPolygon(polygon2);
            featureGroup.addLayer(polygon);
            const markerLatlngs = polygon.getLatLngs();
            markerLatlngs.forEach((polygon) => {
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
                latlngs.forEach((polygon) => {
                    coordinates.push(L.GeoJSON.latLngsToCoords(polygon));
                });
            }
            else {
                latlngs.forEach((polygon) => {
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
                    latlngs.forEach((polygon) => {
                        coordinates.push(L.GeoJSON.latLngsToCoords(polygon));
                    });
                    coords.push(coordinates);
                }
                else {
                    latlngs.forEach((polygon) => {
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
            container.addEventListener("mousedown", (e) => {
                console.log("mouse", e);
                this.mouseDown(e);
            });
            container.addEventListener("touchstart", (e) => {
                console.log("touch", e);
                this.mouseDown(e);
            });
            container.addEventListener("touchend", (e) => {
                if (drawMode !== DrawMode.Off) {
                    this.mouseUpLeave();
                }
            });
            container.addEventListener("touchmove", (e) => {
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
                event.touches[0].clientY,
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
                event.touches[0].clientY,
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
        const onoroff = onoff ? "on" : "off";
        this.map[onoroff]("mousemove", this.mouseMove, this);
        this.map[onoroff]("mouseup", this.mouseUpLeave, this);
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
        markerLatlngs.forEach((polygon) => {
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
        featureGroup.on("click", (e) => {
            this.polygonClicked(e, latLngs);
        });
    }
    // fine
    polygonClicked(e, poly) {
        const newPoint = e.latlng;
        if (poly.geometry.type === "MultiPolygon") {
            const newPolygon = this.turfHelper.injectPointToPolygon(poly, [
                newPoint.lng,
                newPoint.lat,
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
        this.arrayOfFeatureGroups.forEach((featureGroup) => {
            const featureCollection = featureGroup.toGeoJSON();
            if (featureCollection.features[0].geometry.coordinates.length > 1) {
                featureCollection.features[0].geometry.coordinates.forEach((element) => {
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
        this.arrayOfFeatureGroups.forEach((featureGroup) => {
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
        coords.forEach((value) => {
            this.addPolygonLayer(this.turfHelper.getMultiPolygon([value]), true);
        });
    }
    // fine
    events(onoff) {
        const onoroff = onoff ? "on" : "off";
        this.map[onoroff]("mousedown", this.mouseDown, this);
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
                title: i.toString(),
            });
            FeatureGroup.addLayer(marker).addTo(this.map);
            marker.on("drag", (e) => {
                this.markerDrag(FeatureGroup);
            });
            marker.on("dragend", (e) => {
                this.markerDragEnd(FeatureGroup);
            });
            if (i === menuMarkerIdx && this.config.markers.menu) {
                // marker.bindPopup(
                //   this.getHtmlContent(e => {
                //   })
                // );
                marker.on("click", (e) => {
                    this.convertToBoundsPolygon(latlngs, true);
                    // this.convertToSimplifiedPolygon(latlngs);
                });
            }
            if (i === deleteMarkerIdx && this.config.markers.delete) {
                marker.on("click", (e) => {
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
                title: i.toString(),
            });
            FeatureGroup.addLayer(marker).addTo(this.map);
            marker.on("drag", (e) => {
                this.markerDrag(FeatureGroup);
            });
            marker.on("dragend", (e) => {
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
        const classes = classNames.join(" ");
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
            featureCollection.features[0].geometry.coordinates.forEach((element) => {
                const feature = this.turfHelper.getMultiPolygon([element]);
                if (this.turfHelper.hasKinks(feature)) {
                    this.kinks = true;
                    const unkink = this.turfHelper.getKinks(feature);
                    // this.deletePolygon(this.getLatLngsFromJson(feature));
                    this.removeFeatureGroup(FeatureGroup);
                    unkink.forEach((polygon) => {
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
                unkink.forEach((polygon) => {
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
                feature.geometry.type === "MultiPolygon") {
                coord = L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
            }
            else if (feature.geometry.coordinates[0].length > 1 &&
                feature.geometry.type === "Polygon") {
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
        this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter((featureGroups) => featureGroups !== featureGroup);
        // this.updatePolygons();
        this.map.removeLayer(featureGroup);
    }
    // fine until refactoring
    removeFeatureGroupOnMerge(featureGroup) {
        const newArray = [];
        if (featureGroup.getLayers()[0]) {
            const polygon = featureGroup.getLayers()[0].getLatLngs()[0];
            this.polygonInformation.polygonInformationStorage.forEach((v) => {
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
            this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter((featureGroups) => featureGroups !== featureGroup);
            this.map.removeLayer(featureGroup);
        }
    }
    // fine until refactoring
    deletePolygonOnMerge(polygon) {
        let polygon2 = [];
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach((featureGroup) => {
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
                    L.DomUtil.removeClass(this.map.getContainer(), "crosshair-cursor-enabled");
                    this.events(false);
                    this.stopDraw();
                    this.tracer.setStyle({
                        color: "",
                    });
                    this.setLeafletMapEvents(true, true, true);
                    isActiveDrawMode = false;
                    break;
                case DrawMode.Add:
                    L.DomUtil.addClass(this.map.getContainer(), "crosshair-cursor-enabled");
                    this.events(true);
                    this.tracer.setStyle({
                        color: defaultConfig.polyLineOptions.color,
                    });
                    this.setLeafletMapEvents(false, false, false);
                    break;
                case DrawMode.Subtract:
                    L.DomUtil.addClass(this.map.getContainer(), "crosshair-cursor-enabled");
                    this.events(true);
                    this.tracer.setStyle({
                        color: "#D9460F",
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
        alert("open menu");
    }
    getHtmlContent(callBack) {
        const comp = this.popupGenerator.generateAlterPopup();
        comp.instance.bboxClicked.subscribe((e) => {
            callBack(e);
        });
        comp.instance.simplyfiClicked.subscribe((e) => {
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
            lng: compassDirection.lng,
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
        providedIn: "root",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9wb2x5ZHJhdy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdCLHNDQUFzQztBQUN0QyxPQUFPLEVBQWMsZUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNoRCxPQUFPLEVBQWtCLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNuRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQzs7Ozs7OztBQU1oRSxJQUFhLGVBQWU7QUFENUIsMkJBQTJCO0FBQzNCLE1BQWEsZUFBZTtJQW9CMUIsWUFDVSxRQUEwQixFQUMxQixjQUF5QyxFQUN6QyxVQUE2QixFQUM3QixrQkFBNkMsRUFDN0MsYUFBbUM7UUFKbkMsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7UUFDMUIsbUJBQWMsR0FBZCxjQUFjLENBQTJCO1FBQ3pDLGVBQVUsR0FBVixVQUFVLENBQW1CO1FBQzdCLHVCQUFrQixH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LEVBQUUsRUFDakIsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUNqQixDQUFDO1FBQ0YsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sV0FBVyxHQUFZO1lBQzNCLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHO1lBQ3pCLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHO1NBQzFCLENBQUM7UUFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxRCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQzFELFdBQVcsRUFDWCxFQUFTLENBQ1YsQ0FBQztRQUVGLE9BQU8sZUFBZSxDQUFDO0lBQ3pCLENBQUM7Q0FDRixDQUFBOztZQXo2QnFCLGdCQUFnQjtZQUNWLHlCQUF5QjtZQUM3QixpQkFBaUI7WUFDVCx5QkFBeUI7WUFDOUIsb0JBQW9COzs7QUF6QmxDLGVBQWU7SUFKM0IsVUFBVSxDQUFDO1FBQ1YsVUFBVSxFQUFFLE1BQU07S0FDbkIsQ0FBQztJQUNGLDJCQUEyQjs7cUNBc0JMLGdCQUFnQjtRQUNWLHlCQUF5QjtRQUM3QixpQkFBaUI7UUFDVCx5QkFBeUI7UUFDOUIsb0JBQW9CO0dBekJsQyxlQUFlLENBODdCM0I7U0E5N0JZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBPcHRpb25hbCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCAqIGFzIEwgZnJvbSBcImxlYWZsZXRcIjtcclxuLy8gaW1wb3J0ICogYXMgdHVyZiBmcm9tIFwiQHR1cmYvdHVyZlwiO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBCZWhhdmlvclN1YmplY3QsIFN1YmplY3QgfSBmcm9tIFwicnhqc1wiO1xyXG5pbXBvcnQgeyBmaWx0ZXIsIGRlYm91bmNlVGltZSwgdGFrZVVudGlsIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XHJcbmltcG9ydCB7IEZlYXR1cmUsIFBvbHlnb24sIE11bHRpUG9seWdvbiB9IGZyb20gXCJAdHVyZi90dXJmXCI7XHJcbmltcG9ydCB7IFBvbHlTdGF0ZVNlcnZpY2UgfSBmcm9tIFwiLi9tYXAtc3RhdGUuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBUdXJmSGVscGVyU2VydmljZSB9IGZyb20gXCIuL3R1cmYtaGVscGVyLnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSB9IGZyb20gXCIuL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZVwiO1xyXG5pbXBvcnQgZGVmYXVsdENvbmZpZyBmcm9tIFwiLi9wb2x5aW5mby5qc29uXCI7XHJcbmltcG9ydCB7IElMYXRMbmcsIFBvbHlnb25EcmF3U3RhdGVzIH0gZnJvbSBcIi4vcG9seWdvbi1oZWxwZXJzXCI7XHJcbmltcG9ydCB7IENvbXBvbmVudEdlbmVyYXRlclNlcnZpY2UgfSBmcm9tIFwiLi9jb21wb25lbnQtZ2VuZXJhdGVyLnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgQ29tcGFzcywgUG9seURyYXdVdGlsIH0gZnJvbSBcIi4vdXRpbHNcIjtcclxuaW1wb3J0IHsgTWFya2VyUG9zaXRpb24sIERyYXdNb2RlIH0gZnJvbSBcIi4vZW51bXNcIjtcclxuaW1wb3J0IHsgTGVhZmxldEhlbHBlclNlcnZpY2UgfSBmcm9tIFwiLi9sZWFmbGV0LWhlbHBlci5zZXJ2aWNlXCI7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgcHJvdmlkZWRJbjogXCJyb290XCIsXHJcbn0pXHJcbi8vIFJlbmFtZSAtIFBvbHlEcmF3U2VydmljZVxyXG5leHBvcnQgY2xhc3MgUG9seURyYXdTZXJ2aWNlIHtcclxuICAvLyBEcmF3TW9kZXMsIGRldGVybWluZSBVSSBidXR0b25zIGV0Yy4uLlxyXG4gIGRyYXdNb2RlU3ViamVjdDogQmVoYXZpb3JTdWJqZWN0PERyYXdNb2RlPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8RHJhd01vZGU+KFxyXG4gICAgRHJhd01vZGUuT2ZmXHJcbiAgKTtcclxuICBkcmF3TW9kZSQ6IE9ic2VydmFibGU8RHJhd01vZGU+ID0gdGhpcy5kcmF3TW9kZVN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWluaW11bUZyZWVEcmF3Wm9vbUxldmVsOiBudW1iZXIgPSAxMjtcclxuICBwcml2YXRlIG1hcDogTC5NYXA7XHJcblxyXG4gIHByaXZhdGUgbWVyZ2VQb2x5Z29uczogYm9vbGVhbjtcclxuICBwcml2YXRlIGtpbmtzOiBib29sZWFuO1xyXG4gIC8vIGFkZCB0byBjb25maWdcclxuICBwcml2YXRlIGFycmF5T2ZGZWF0dXJlR3JvdXBzOiBMLkZlYXR1cmVHcm91cDxMLkxheWVyPltdID0gW107XHJcbiAgcHJpdmF0ZSB0cmFjZXI6IEwuUG9seWxpbmUgPSB7fSBhcyBhbnk7XHJcbiAgLy8gZW5kIGFkZCB0byBjb25maWdcclxuXHJcbiAgcHJpdmF0ZSBuZ1Vuc3Vic2NyaWJlID0gbmV3IFN1YmplY3QoKTtcclxuICBwcml2YXRlIGNvbmZpZzogdHlwZW9mIGRlZmF1bHRDb25maWcgPSBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgbWFwU3RhdGU6IFBvbHlTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBvcHVwR2VuZXJhdG9yOiBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0dXJmSGVscGVyOiBUdXJmSGVscGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgcG9seWdvbkluZm9ybWF0aW9uOiBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsZWFmbGV0SGVscGVyOiBMZWFmbGV0SGVscGVyU2VydmljZVxyXG4gICkge1xyXG4gICAgdGhpcy5tYXBTdGF0ZS5tYXAkXHJcbiAgICAgIC5waXBlKGZpbHRlcigobSkgPT4gbSAhPT0gbnVsbCkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKG1hcDogTC5NYXApID0+IHtcclxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IGRlZmF1bHRDb25maWc7XHJcbiAgICAgICAgdGhpcy5jb25maWd1cmF0ZSh7fSk7XHJcbiAgICAgICAgdGhpcy50cmFjZXIgPSBMLnBvbHlsaW5lKFtbMCwgMF1dLCB0aGlzLmNvbmZpZy5wb2x5TGluZU9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuaW5pdFBvbHlEcmF3KCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIHRoaXMubWFwU3RhdGUubWFwWm9vbUxldmVsJFxyXG4gICAgICAucGlwZShkZWJvdW5jZVRpbWUoMTAwKSwgdGFrZVVudGlsKHRoaXMubmdVbnN1YnNjcmliZSkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKHpvb206IG51bWJlcikgPT4ge1xyXG4gICAgICAgIHRoaXMub25ab29tQ2hhbmdlKHpvb20pO1xyXG4gICAgICB9KTtcclxuICB9XHJcbiAgLy8gbmV3XHJcbiAgY29uZmlndXJhdGUoY29uZmlnOiBPYmplY3QpOiB2b2lkIHtcclxuICAgIC8vIFRPRE8gaWYgY29uZmlnIGlzIHBhdGguLi5cclxuICAgIHRoaXMuY29uZmlnID0geyAuLi5kZWZhdWx0Q29uZmlnLCAuLi5jb25maWcgfTtcclxuXHJcbiAgICB0aGlzLm1lcmdlUG9seWdvbnMgPSB0aGlzLmNvbmZpZy5tZXJnZVBvbHlnb25zO1xyXG4gICAgdGhpcy5raW5rcyA9IHRoaXMuY29uZmlnLmtpbmtzO1xyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIGNsb3NlQW5kUmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XHJcbiAgICB0aGlzLnJlbW92ZUFsbEZlYXR1cmVHcm91cHMoKTtcclxuICB9XHJcblxyXG4gIC8vIG1ha2UgcmVhZGFibGVcclxuICBkZWxldGVQb2x5Z29uKHBvbHlnb246IElMYXRMbmdbXVtdKSB7XHJcbiAgICBpZiAocG9seWdvbi5sZW5ndGggPiAxKSB7XHJcbiAgICAgIHBvbHlnb24ubGVuZ3RoID0gMTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKChmZWF0dXJlR3JvdXApID0+IHtcclxuICAgICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSBhcyBhbnk7XHJcbiAgICAgICAgY29uc3QgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKTtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBsYXRsbmdzLmxlbmd0aDtcclxuICAgICAgICAvLyAgPSBbXVxyXG5cclxuICAgICAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgaW5kZXgpID0+IHtcclxuICAgICAgICAgIGxldCBwb2x5Z29uMztcclxuICAgICAgICAgIGNvbnN0IHRlc3QgPSBbLi4ubGF0bG5nXTtcclxuXHJcbiAgICAgICAgICBpZiAobGF0bG5nLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXVswXSAhPT0gbGF0bG5nWzBdW2xhdGxuZ1swXS5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICAgIHRlc3RbMF0ucHVzaChsYXRsbmdbMF1bMF0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwb2x5Z29uMyA9IFt0ZXN0WzBdXTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChsYXRsbmdbMF0gIT09IGxhdGxuZ1tsYXRsbmcubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgICAgICB0ZXN0LnB1c2gobGF0bG5nWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwb2x5Z29uMyA9IHRlc3Q7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3QgZXF1YWxzID0gdGhpcy5wb2x5Z29uQXJyYXlFcXVhbHMocG9seWdvbjMsIHBvbHlnb24pO1xyXG5cclxuICAgICAgICAgIGlmIChlcXVhbHMgJiYgbGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVRyYXNoY2FuKHBvbHlnb24pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXF1YWxzICYmIGxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlVHJhc2hDYW5Pbk11bHRpKFtwb2x5Z29uXSk7XHJcbiAgICAgICAgICAgIGxhdGxuZ3Muc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgbGF5ZXIuc2V0TGF0TG5ncyhsYXRsbmdzKTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobGF5ZXIudG9HZW9KU09OKCksIGZhbHNlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICByZW1vdmVBbGxGZWF0dXJlR3JvdXBzKCkge1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKChmZWF0dXJlR3JvdXBzKSA9PiB7XHJcbiAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKGZlYXR1cmVHcm91cHMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3VwcyA9IFtdO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucmVzZXQoKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBnZXREcmF3TW9kZSgpOiBEcmF3TW9kZSB7XHJcbiAgICByZXR1cm4gdGhpcy5kcmF3TW9kZVN1YmplY3QudmFsdWU7XHJcbiAgfVxyXG5cclxuICBhZGRWaWtlbihwb2x5Z29uKSB7XHJcbiAgICB0aGlzLmFkZFBvbHlnb25MYXllcihwb2x5Z29uLCB0cnVlKTtcclxuICB9XHJcblxyXG4gIC8vIGNoZWNrIHRoaXNcclxuICBhZGRBdXRvUG9seWdvbihnZW9ncmFwaGljQm9yZGVyczogTC5MYXRMbmdbXVtdW10pOiB2b2lkIHtcclxuICAgIGdlb2dyYXBoaWNCb3JkZXJzLmZvckVhY2goKGdyb3VwKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXAgPSBuZXcgTC5GZWF0dXJlR3JvdXAoKTtcclxuXHJcbiAgICAgIGNvbnN0IHBvbHlnb24yID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihcclxuICAgICAgICB0aGlzLmNvbnZlcnRUb0Nvb3Jkcyhncm91cClcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLmdldFBvbHlnb24ocG9seWdvbjIpO1xyXG5cclxuICAgICAgZmVhdHVyZUdyb3VwLmFkZExheWVyKHBvbHlnb24pO1xyXG4gICAgICBjb25zdCBtYXJrZXJMYXRsbmdzID0gcG9seWdvbi5nZXRMYXRMbmdzKCk7XHJcblxyXG4gICAgICBtYXJrZXJMYXRsbmdzLmZvckVhY2goKHBvbHlnb24pID0+IHtcclxuICAgICAgICBwb2x5Z29uLmZvckVhY2goKHBvbHlFbGVtZW50LCBpKSA9PiB7XHJcbiAgICAgICAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZE1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkSG9sZU1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyB0aGlzLmFkZE1hcmtlcihwb2x5Z29uWzBdLCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgIC8vIFRPRE8gLSBIdmlzIHBvbHlnb24ubGVuZ3RoID4xLCBzw6UgaGFyIGRlbiBodWxsOiBlZ2VuIGFkZE1hcmtlciBmdW5rc2pvblxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKFxyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzXHJcbiAgICApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uYWN0aXZhdGUoKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XHJcbiAgfVxyXG5cclxuICAvLyBpbm5laMOlbGwgaSBpZidhciBmbHl0dGEgdGlsbCBlZ25hIG1ldG9kZXJcclxuICBwcml2YXRlIGNvbnZlcnRUb0Nvb3JkcyhsYXRsbmdzOiBJTGF0TG5nW11bXSkge1xyXG4gICAgY29uc3QgY29vcmRzID0gW107XHJcblxyXG4gICAgaWYgKGxhdGxuZ3MubGVuZ3RoID4gMSAmJiBsYXRsbmdzLmxlbmd0aCA8IDMpIHtcclxuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBbXTtcclxuXHJcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbWF4LWxpbmUtbGVuZ3RoXHJcbiAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihcclxuICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSksXHJcbiAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKVxyXG4gICAgICApO1xyXG4gICAgICBpZiAod2l0aGluKSB7XHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKChwb2x5Z29uKSA9PiB7XHJcbiAgICAgICAgICBjb29yZGluYXRlcy5wdXNoKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbikpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxhdGxuZ3MuZm9yRWFjaCgocG9seWdvbikgPT4ge1xyXG4gICAgICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbildKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID49IDEpIHtcclxuICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAobGF0bG5ncy5sZW5ndGggPiAyKSB7XHJcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMTsgaW5kZXggPCBsYXRsbmdzLmxlbmd0aCAtIDE7IGluZGV4KyspIHtcclxuICAgICAgICBjb25zdCB3aXRoaW4gPSB0aGlzLnR1cmZIZWxwZXIuaXNXaXRoaW4oXHJcbiAgICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbaW5kZXhdKSxcclxuICAgICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSlcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmICh3aXRoaW4pIHtcclxuICAgICAgICAgIGxhdGxuZ3MuZm9yRWFjaCgocG9seWdvbikgPT4ge1xyXG4gICAgICAgICAgICBjb29yZGluYXRlcy5wdXNoKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbikpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxhdGxuZ3MuZm9yRWFjaCgocG9seWdvbikgPT4ge1xyXG4gICAgICAgICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKV0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb29yZHM7XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBpbml0UG9seURyYXcoKSB7XHJcbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCk7XHJcbiAgICBjb25zdCBkcmF3TW9kZSA9IHRoaXMuZ2V0RHJhd01vZGUoKTtcclxuICAgIGlmICh0aGlzLmNvbmZpZy50b3VjaFN1cHBvcnQpIHtcclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm1vdXNlXCIsIGUpO1xyXG4gICAgICAgIHRoaXMubW91c2VEb3duKGUpO1xyXG4gICAgICB9KTtcclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIChlKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ0b3VjaFwiLCBlKTtcclxuICAgICAgICB0aGlzLm1vdXNlRG93bihlKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsIChlKSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcclxuICAgICAgICAgIHRoaXMubW91c2VVcExlYXZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIChlKSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcclxuICAgICAgICAgIHRoaXMubW91c2VNb3ZlKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5tYXAuYWRkTGF5ZXIodGhpcy50cmFjZXIpO1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xyXG4gIH1cclxuICAvLyBUZXN0IEwuTW91c2VFdmVudFxyXG4gIHByaXZhdGUgbW91c2VEb3duKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW2V2ZW50LmxhdGxuZ10pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgbGF0bG5nID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhbXHJcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLFxyXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSxcclxuICAgICAgXSk7XHJcbiAgICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW2xhdGxuZ10pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zdGFydERyYXcoKTtcclxuICB9XHJcblxyXG4gIC8vIFRPRE8gZXZlbnQgdHlwZSwgY3JlYXRlIGNvbnRhaW5lclBvaW50VG9MYXRMbmctbWV0aG9kXHJcbiAgcHJpdmF0ZSBtb3VzZU1vdmUoZXZlbnQpIHtcclxuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9IG51bGwpIHtcclxuICAgICAgdGhpcy50cmFjZXIuYWRkTGF0TG5nKGV2ZW50LmxhdGxuZyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBsYXRsbmcgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKFtcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLFxyXG4gICAgICBdKTtcclxuICAgICAgdGhpcy50cmFjZXIuYWRkTGF0TG5nKGxhdGxuZyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBtb3VzZVVwTGVhdmUoKSB7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcblxyXG4gICAgY29uc3QgZ2VvUG9zOiBGZWF0dXJlPFxyXG4gICAgICBQb2x5Z29uIHwgTXVsdGlQb2x5Z29uXHJcbiAgICA+ID0gdGhpcy50dXJmSGVscGVyLnR1cmZDb25jYXZlbWFuKHRoaXMudHJhY2VyLnRvR2VvSlNPTigpIGFzIGFueSk7XHJcbiAgICB0aGlzLnN0b3BEcmF3KCk7XHJcbiAgICBzd2l0Y2ggKHRoaXMuZ2V0RHJhd01vZGUoKSkge1xyXG4gICAgICBjYXNlIERyYXdNb2RlLkFkZDpcclxuICAgICAgICB0aGlzLmFkZFBvbHlnb24oZ2VvUG9zLCB0cnVlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdDpcclxuICAgICAgICB0aGlzLnN1YnRyYWN0UG9seWdvbihnZW9Qb3MpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHNcclxuICAgICk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHN0YXJ0RHJhdygpIHtcclxuICAgIHRoaXMuZHJhd1N0YXJ0ZWRFdmVudHModHJ1ZSk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHN0b3BEcmF3KCkge1xyXG4gICAgdGhpcy5yZXNldFRyYWNrZXIoKTtcclxuICAgIHRoaXMuZHJhd1N0YXJ0ZWRFdmVudHMoZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvblpvb21DaGFuZ2Uoem9vbUxldmVsOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmICh6b29tTGV2ZWwgPj0gdGhpcy5taW5pbXVtRnJlZURyYXdab29tTGV2ZWwpIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkRyYXdTdGF0ZXMuY2FuVXNlUG9seURyYXcgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkRyYXdTdGF0ZXMuY2FuVXNlUG9seURyYXcgPSBmYWxzZTtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0TW92ZU1vZGUoKTtcclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZHJhd1N0YXJ0ZWRFdmVudHMob25vZmY6IGJvb2xlYW4pIHtcclxuICAgIGNvbnN0IG9ub3JvZmYgPSBvbm9mZiA/IFwib25cIiA6IFwib2ZmXCI7XHJcblxyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmUsIHRoaXMpO1xyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcExlYXZlLCB0aGlzKTtcclxuICB9XHJcbiAgLy8gT24gaG9sZFxyXG4gIHByaXZhdGUgc3VidHJhY3RQb2x5Z29uKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIHRoaXMuc3VidHJhY3QobGF0bG5ncyk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGFkZFBvbHlnb24oXHJcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgc2ltcGxpZnk6IGJvb2xlYW4sXHJcbiAgICBub01lcmdlOiBib29sZWFuID0gZmFsc2VcclxuICApIHtcclxuICAgIGlmIChcclxuICAgICAgdGhpcy5tZXJnZVBvbHlnb25zICYmXHJcbiAgICAgICFub01lcmdlICYmXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCAmJlxyXG4gICAgICAhdGhpcy5raW5rc1xyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMubWVyZ2UobGF0bG5ncyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXRsbmdzLCBzaW1wbGlmeSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGFkZFBvbHlnb25MYXllcihcclxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBzaW1wbGlmeTogYm9vbGVhblxyXG4gICkge1xyXG4gICAgY29uc3QgZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCA9IG5ldyBMLkZlYXR1cmVHcm91cCgpO1xyXG5cclxuICAgIGNvbnN0IGxhdExuZ3MgPSBzaW1wbGlmeSA/IHRoaXMudHVyZkhlbHBlci5nZXRTaW1wbGlmaWVkKGxhdGxuZ3MpIDogbGF0bG5ncztcclxuXHJcbiAgICBjb25zdCBwb2x5Z29uID0gdGhpcy5nZXRQb2x5Z29uKGxhdExuZ3MpO1xyXG4gICAgZmVhdHVyZUdyb3VwLmFkZExheWVyKHBvbHlnb24pO1xyXG5cclxuICAgIGNvbnN0IG1hcmtlckxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcclxuICAgIG1hcmtlckxhdGxuZ3MuZm9yRWFjaCgocG9seWdvbikgPT4ge1xyXG4gICAgICBwb2x5Z29uLmZvckVhY2goKHBvbHlFbGVtZW50OiBJTGF0TG5nW10sIGk6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLmFkZE1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hZGRIb2xlTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIC8vIHRoaXMuYWRkTWFya2VyKHBvbHlnb25bMF0sIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgIC8vIFRPRE8gLSBIdmlzIHBvbHlnb24ubGVuZ3RoID4xLCBzw6UgaGFyIGRlbiBodWxsOiBlZ2VuIGFkZE1hcmtlciBmdW5rc2pvblxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5wdXNoKGZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uYWN0aXZhdGUoKTtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuXHJcbiAgICBmZWF0dXJlR3JvdXAub24oXCJjbGlja1wiLCAoZSkgPT4ge1xyXG4gICAgICB0aGlzLnBvbHlnb25DbGlja2VkKGUsIGxhdExuZ3MpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHBvbHlnb25DbGlja2VkKGU6IGFueSwgcG9seTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3QgbmV3UG9pbnQgPSBlLmxhdGxuZztcclxuICAgIGlmIChwb2x5Lmdlb21ldHJ5LnR5cGUgPT09IFwiTXVsdGlQb2x5Z29uXCIpIHtcclxuICAgICAgY29uc3QgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5pbmplY3RQb2ludFRvUG9seWdvbihwb2x5LCBbXHJcbiAgICAgICAgbmV3UG9pbnQubG5nLFxyXG4gICAgICAgIG5ld1BvaW50LmxhdCxcclxuICAgICAgXSk7XHJcbiAgICAgIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihwb2x5KSk7XHJcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld1BvbHlnb24sIGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZ2V0UG9seWdvbihsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zdCBwb2x5Z29uID0gTC5HZW9KU09OLmdlb21ldHJ5VG9MYXllcihsYXRsbmdzKSBhcyBhbnk7XHJcblxyXG4gICAgcG9seWdvbi5zZXRTdHlsZSh0aGlzLmNvbmZpZy5wb2x5Z29uT3B0aW9ucyk7XHJcbiAgICByZXR1cm4gcG9seWdvbjtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgbWVyZ2UobGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3QgcG9seWdvbkZlYXR1cmUgPSBbXTtcclxuICAgIGNvbnN0IG5ld0FycmF5OiBMLkZlYXR1cmVHcm91cFtdID0gW107XHJcbiAgICBsZXQgcG9seUludGVyc2VjdGlvbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKChmZWF0dXJlR3JvdXApID0+IHtcclxuICAgICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBmZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xyXG5cclxuICAgICAgaWYgKGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKFxyXG4gICAgICAgICAgKGVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcclxuICAgICAgICAgICAgcG9seUludGVyc2VjdGlvbiA9IHRoaXMudHVyZkhlbHBlci5wb2x5Z29uSW50ZXJzZWN0KFxyXG4gICAgICAgICAgICAgIGZlYXR1cmUsXHJcbiAgICAgICAgICAgICAgbGF0bG5nc1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAocG9seUludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgICAgIG5ld0FycmF5LnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgICAgICBwb2x5Z29uRmVhdHVyZS5wdXNoKGZlYXR1cmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKFxyXG4gICAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF1cclxuICAgICAgICApO1xyXG4gICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcclxuICAgICAgICBpZiAocG9seUludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChuZXdBcnJheS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMudW5pb25Qb2x5Z29ucyhuZXdBcnJheSwgbGF0bG5ncywgcG9seWdvbkZlYXR1cmUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobGF0bG5ncywgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIG5leHRcclxuICBwcml2YXRlIHN1YnRyYWN0KGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGxldCBhZGRIb2xlID0gbGF0bG5ncztcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaCgoZmVhdHVyZUdyb3VwKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXTtcclxuICAgICAgY29uc3QgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcclxuICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25EaWZmZXJlbmNlKGZlYXR1cmUsIGFkZEhvbGUpO1xyXG4gICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seSk7XHJcbiAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXApO1xyXG4gICAgICBhZGRIb2xlID0gbmV3UG9seWdvbjtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG5ld0xhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4gPSBhZGRIb2xlO1xyXG4gICAgY29uc3QgY29vcmRzID0gdGhpcy50dXJmSGVscGVyLmdldENvb3JkcyhuZXdMYXRsbmdzKTtcclxuICAgIGNvb3Jkcy5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcih0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFt2YWx1ZV0pLCB0cnVlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBldmVudHMob25vZmY6IGJvb2xlYW4pIHtcclxuICAgIGNvbnN0IG9ub3JvZmYgPSBvbm9mZiA/IFwib25cIiA6IFwib2ZmXCI7XHJcbiAgICB0aGlzLm1hcFtvbm9yb2ZmXShcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlRG93biwgdGhpcyk7XHJcbiAgfVxyXG4gIC8vIGZpbmUsIFRPRE86IGlmIHNwZWNpYWwgbWFya2Vyc1xyXG4gIHByaXZhdGUgYWRkTWFya2VyKGxhdGxuZ3M6IElMYXRMbmdbXSwgRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgY29uc3QgbWVudU1hcmtlcklkeCA9IHRoaXMuZ2V0TWFya2VySW5kZXgoXHJcbiAgICAgIGxhdGxuZ3MsXHJcbiAgICAgIHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyTWVudUljb24ucG9zaXRpb25cclxuICAgICk7XHJcbiAgICBjb25zdCBkZWxldGVNYXJrZXJJZHggPSB0aGlzLmdldE1hcmtlckluZGV4KFxyXG4gICAgICBsYXRsbmdzLFxyXG4gICAgICB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckRlbGV0ZUljb24ucG9zaXRpb25cclxuICAgICk7XHJcblxyXG4gICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIGkpID0+IHtcclxuICAgICAgY29uc3QgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICAvKiAgIGlmIChpID09PSBtZW51TWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGkgPT09IGRlbGV0ZU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfSAqL1xyXG4gICAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5NYXJrZXIobGF0bG5nLCB7XHJcbiAgICAgICAgaWNvbjogdGhpcy5jcmVhdGVEaXZJY29uKGljb25DbGFzc2VzKSxcclxuICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgdGl0bGU6IGkudG9TdHJpbmcoKSxcclxuICAgICAgfSk7XHJcbiAgICAgIEZlYXR1cmVHcm91cC5hZGRMYXllcihtYXJrZXIpLmFkZFRvKHRoaXMubWFwKTtcclxuXHJcbiAgICAgIG1hcmtlci5vbihcImRyYWdcIiwgKGUpID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlckRyYWcoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIG1hcmtlci5vbihcImRyYWdlbmRcIiwgKGUpID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlckRyYWdFbmQoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChpID09PSBtZW51TWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIC8vIG1hcmtlci5iaW5kUG9wdXAoXHJcbiAgICAgICAgLy8gICB0aGlzLmdldEh0bWxDb250ZW50KGUgPT4ge1xyXG5cclxuICAgICAgICAvLyAgIH0pXHJcbiAgICAgICAgLy8gKTtcclxuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCAoZSkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5jb252ZXJ0VG9Cb3VuZHNQb2x5Z29uKGxhdGxuZ3MsIHRydWUpO1xyXG4gICAgICAgICAgLy8gdGhpcy5jb252ZXJ0VG9TaW1wbGlmaWVkUG9seWdvbihsYXRsbmdzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaSA9PT0gZGVsZXRlTWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XHJcbiAgICAgICAgbWFya2VyLm9uKFwiY2xpY2tcIiwgKGUpID0+IHtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkSG9sZU1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XHJcbiAgICAgIGNvbnN0IGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgLyogIGlmIChpID09PSAwICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vVE9ETy0gbGVnZyB0aWwgZmlsbCBpY29uXHJcbiAgICAgIGlmIChpID09PSBsYXRsbmdzLmxlbmd0aCAtIDEgJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH0gKi9cclxuICAgICAgY29uc3QgbWFya2VyID0gbmV3IEwuTWFya2VyKGxhdGxuZywge1xyXG4gICAgICAgIGljb246IHRoaXMuY3JlYXRlRGl2SWNvbihpY29uQ2xhc3NlcyksXHJcbiAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgIHRpdGxlOiBpLnRvU3RyaW5nKCksXHJcbiAgICAgIH0pO1xyXG4gICAgICBGZWF0dXJlR3JvdXAuYWRkTGF5ZXIobWFya2VyKS5hZGRUbyh0aGlzLm1hcCk7XHJcblxyXG4gICAgICBtYXJrZXIub24oXCJkcmFnXCIsIChlKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBtYXJrZXIub24oXCJkcmFnZW5kXCIsIChlKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvKiAgIGlmIChpID09PSAwICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIG1hcmtlci5iaW5kUG9wdXAodGhpcy5nZXRIdG1sQ29udGVudCgoZSkgPT4ge1xyXG4gICAgICAgIH0pKTtcclxuICAgICAgICAvLyBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAvLyAgIHRoaXMudG9nZ2xlTWFya2VyTWVudSgpO1xyXG4gICAgICAgIC8vIH0pXHJcbiAgICAgIH1cclxuICAgICAgaWYgKGkgPT09IGxhdGxuZ3MubGVuZ3RoIC0gMSAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gKi9cclxuICAgIH0pO1xyXG4gIH1cclxuICBwcml2YXRlIGNyZWF0ZURpdkljb24oY2xhc3NOYW1lczogc3RyaW5nW10pOiBMLkRpdkljb24ge1xyXG4gICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMuam9pbihcIiBcIik7XHJcbiAgICBjb25zdCBpY29uID0gTC5kaXZJY29uKHsgY2xhc3NOYW1lOiBjbGFzc2VzIH0pO1xyXG4gICAgcmV0dXJuIGljb247XHJcbiAgfVxyXG4gIC8vIFRPRE86IENsZWFudXBcclxuICBwcml2YXRlIG1hcmtlckRyYWcoRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgY29uc3QgbmV3UG9zID0gW107XHJcbiAgICBsZXQgdGVzdGFycmF5ID0gW107XHJcbiAgICBsZXQgaG9sZSA9IFtdO1xyXG4gICAgY29uc3QgbGF5ZXJMZW5ndGggPSBGZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKCkgYXMgYW55O1xyXG4gICAgY29uc3QgcG9zYXJyYXlzID0gbGF5ZXJMZW5ndGhbMF0uZ2V0TGF0TG5ncygpO1xyXG5cclxuICAgIGxldCBsZW5ndGggPSAwO1xyXG4gICAgaWYgKHBvc2FycmF5cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NhcnJheXMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgdGVzdGFycmF5ID0gW107XHJcbiAgICAgICAgaG9sZSA9IFtdO1xyXG5cclxuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF0ubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaW5kZXggPCBwb3NhcnJheXNbMF0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVtpXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdWzBdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBob2xlLnB1c2godGVzdGFycmF5KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBuZXdQb3MucHVzaChob2xlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGVuZ3RoICs9IHBvc2FycmF5c1tpbmRleCAtIDFdWzBdLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoOyBqIDwgcG9zYXJyYXlzW2luZGV4XVswXS5sZW5ndGggKyBsZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICB0ZXN0YXJyYXkucHVzaCgobGF5ZXJMZW5ndGhbaiArIDFdIGFzIGFueSkuZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICBuZXdQb3MucHVzaChob2xlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHRlc3RhcnJheSA9IFtdXHJcbiAgICAgIGhvbGUgPSBbXTtcclxuICAgICAgbGV0IGxlbmd0aDIgPSAwO1xyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHRlc3RhcnJheSA9IFtdO1xyXG5cclxuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1bMF0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlbmd0aDIgKz0gcG9zYXJyYXlzWzBdW2luZGV4IC0gMV0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgIGZvciAobGV0IGogPSBsZW5ndGgyOyBqIDwgcG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGggKyBsZW5ndGgyOyBqKyspIHtcclxuICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgIH1cclxuICAgICAgbmV3UG9zLnB1c2goaG9sZSk7XHJcbiAgICB9XHJcblxyXG4gICAgbGF5ZXJMZW5ndGhbMF0uc2V0TGF0TG5ncyhuZXdQb3MpO1xyXG4gIH1cclxuICAvLyBjaGVjayB0aGlzXHJcbiAgcHJpdmF0ZSBtYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoKTtcclxuICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gRmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuXHJcbiAgICBpZiAoZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XHJcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xyXG4gICAgICAgICAgdGhpcy5raW5rcyA9IHRydWU7XHJcbiAgICAgICAgICBjb25zdCB1bmtpbmsgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0S2lua3MoZmVhdHVyZSk7XHJcbiAgICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoRmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICAgICAgICB1bmtpbmsuZm9yRWFjaCgocG9seWdvbikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFkZFBvbHlnb24oXHJcbiAgICAgICAgICAgICAgdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKHBvbHlnb24pLFxyXG4gICAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAgIHRydWVcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmtpbmtzID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLmFkZFBvbHlnb24oZmVhdHVyZSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlc1xyXG4gICAgICApO1xyXG5cclxuICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xyXG4gICAgICAgIHRoaXMua2lua3MgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IHVua2luayA9IHRoaXMudHVyZkhlbHBlci5nZXRLaW5rcyhmZWF0dXJlKTtcclxuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRlc3RDb29yZCA9IFtdO1xyXG4gICAgICAgIHVua2luay5mb3JFYWNoKChwb2x5Z29uKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmFkZFBvbHlnb24odGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKHBvbHlnb24pLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gdGhpcy5hZGRQb2x5Z29uKHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24odGVzdENvb3JkKSwgZmFsc2UsIHRydWUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihmZWF0dXJlKSk7XHJcbiAgICAgICAgdGhpcy5raW5rcyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbihmZWF0dXJlLCBmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHNcclxuICAgICk7XHJcbiAgfVxyXG4gIC8vIGZpbmUsIGNoZWNrIHRoZSByZXR1cm5lZCB0eXBlXHJcbiAgcHJpdmF0ZSBnZXRMYXRMbmdzRnJvbUpzb24oXHJcbiAgICBmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogSUxhdExuZ1tdW10ge1xyXG4gICAgbGV0IGNvb3JkO1xyXG4gICAgaWYgKGZlYXR1cmUpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSAmJlxyXG4gICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PT0gXCJNdWx0aVBvbHlnb25cIlxyXG4gICAgICApIHtcclxuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXS5sZW5ndGggPiAxICYmXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS50eXBlID09PSBcIlBvbHlnb25cIlxyXG4gICAgICApIHtcclxuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29vcmQgPSBMLkdlb0pTT04uY29vcmRzVG9MYXRMbmdzKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1bMF0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvb3JkO1xyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgdW5pb25Qb2x5Z29ucyhcclxuICAgIGxheWVycyxcclxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBwb2x5Z29uRmVhdHVyZVxyXG4gICkge1xyXG4gICAgbGV0IGFkZE5ldyA9IGxhdGxuZ3M7XHJcbiAgICBsYXllcnMuZm9yRWFjaCgoZmVhdHVyZUdyb3VwLCBpKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpO1xyXG4gICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdO1xyXG4gICAgICBjb25zdCBwb2x5ID0gdGhpcy5nZXRMYXRMbmdzRnJvbUpzb24obGF5ZXIpO1xyXG4gICAgICBjb25zdCB1bmlvbiA9IHRoaXMudHVyZkhlbHBlci51bmlvbihhZGROZXcsIHBvbHlnb25GZWF0dXJlW2ldKTsgLy8gQ2hlY2sgZm9yIG11bHRpcG9seWdvbnNcclxuICAgICAgLy8gTmVlZHMgYSBjbGVhbnVwIGZvciB0aGUgbmV3IHZlcnNpb25cclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uT25NZXJnZShwb2x5KTtcclxuICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICAgIGFkZE5ldyA9IHVuaW9uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbmV3TGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiA9IGFkZE5ldzsgLy8gVHJlbmdlciBrYW5za2plIHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbiggYWRkTmV3KTtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld0xhdGxuZ3MsIHRydWUpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5maWx0ZXIoXHJcbiAgICAgIChmZWF0dXJlR3JvdXBzKSA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXBcclxuICAgICk7XHJcbiAgICAvLyB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xyXG4gIH1cclxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnN0IG5ld0FycmF5ID0gW107XHJcbiAgICBpZiAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdKSB7XHJcbiAgICAgIGNvbnN0IHBvbHlnb24gPSAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueSkuZ2V0TGF0TG5ncygpWzBdO1xyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2goKHYpID0+IHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICB2LnBvbHlnb24udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXS50b1N0cmluZygpICYmXHJcbiAgICAgICAgICB2LnBvbHlnb25bMF0udG9TdHJpbmcoKSA9PT0gcG9seWdvblswXVswXS50b1N0cmluZygpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICB2LnBvbHlnb24gPSBwb2x5Z29uO1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaCh2KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIHYucG9seWdvbi50b1N0cmluZygpICE9PSBwb2x5Z29uWzBdLnRvU3RyaW5nKCkgJiZcclxuICAgICAgICAgIHYucG9seWdvblswXS50b1N0cmluZygpICE9PSBwb2x5Z29uWzBdWzBdLnRvU3RyaW5nKClcclxuICAgICAgICApIHtcclxuICAgICAgICAgIG5ld0FycmF5LnB1c2godik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMgPSB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZpbHRlcihcclxuICAgICAgICAoZmVhdHVyZUdyb3VwcykgPT4gZmVhdHVyZUdyb3VwcyAhPT0gZmVhdHVyZUdyb3VwXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXHJcbiAgcHJpdmF0ZSBkZWxldGVQb2x5Z29uT25NZXJnZShwb2x5Z29uKSB7XHJcbiAgICBsZXQgcG9seWdvbjIgPSBbXTtcclxuICAgIGlmICh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKChmZWF0dXJlR3JvdXApID0+IHtcclxuICAgICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSBhcyBhbnk7XHJcbiAgICAgICAgY29uc3QgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKVswXTtcclxuICAgICAgICBwb2x5Z29uMiA9IFsuLi5sYXRsbmdzWzBdXTtcclxuICAgICAgICBpZiAobGF0bG5nc1swXVswXSAhPT0gbGF0bG5nc1swXVtsYXRsbmdzWzBdLmxlbmd0aCAtIDFdKSB7XHJcbiAgICAgICAgICBwb2x5Z29uMi5wdXNoKGxhdGxuZ3NbMF1bMF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBlcXVhbHMgPSB0aGlzLnBvbHlnb25BcnJheUVxdWFsc01lcmdlKHBvbHlnb24yLCBwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgaWYgKGVxdWFscykge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seWdvbik7XHJcbiAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuICAgICAgICAgIC8vIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFsc01lcmdlKHBvbHkxOiBhbnlbXSwgcG9seTI6IGFueVtdKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gcG9seTEudG9TdHJpbmcoKSA9PT0gcG9seTIudG9TdHJpbmcoKTtcclxuICB9XHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFscyhwb2x5MTogYW55W10sIHBvbHkyOiBhbnlbXSk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKHBvbHkxWzBdWzBdKSB7XHJcbiAgICAgIGlmICghcG9seTFbMF1bMF0uZXF1YWxzKHBvbHkyWzBdWzBdKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKCFwb2x5MVswXS5lcXVhbHMocG9seTJbMF0pKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocG9seTEubGVuZ3RoICE9PSBwb2x5Mi5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHNldExlYWZsZXRNYXBFdmVudHMoXHJcbiAgICBlbmFibGVEcmFnZ2luZzogYm9vbGVhbixcclxuICAgIGVuYWJsZURvdWJsZUNsaWNrWm9vbTogYm9vbGVhbixcclxuICAgIGVuYWJsZVNjcm9sbFdoZWVsWm9vbTogYm9vbGVhblxyXG4gICkge1xyXG4gICAgZW5hYmxlRHJhZ2dpbmcgPyB0aGlzLm1hcC5kcmFnZ2luZy5lbmFibGUoKSA6IHRoaXMubWFwLmRyYWdnaW5nLmRpc2FibGUoKTtcclxuICAgIGVuYWJsZURvdWJsZUNsaWNrWm9vbVxyXG4gICAgICA/IHRoaXMubWFwLmRvdWJsZUNsaWNrWm9vbS5lbmFibGUoKVxyXG4gICAgICA6IHRoaXMubWFwLmRvdWJsZUNsaWNrWm9vbS5kaXNhYmxlKCk7XHJcbiAgICBlbmFibGVTY3JvbGxXaGVlbFpvb21cclxuICAgICAgPyB0aGlzLm1hcC5zY3JvbGxXaGVlbFpvb20uZW5hYmxlKClcclxuICAgICAgOiB0aGlzLm1hcC5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgc2V0RHJhd01vZGUobW9kZTogRHJhd01vZGUpIHtcclxuICAgIHRoaXMuZHJhd01vZGVTdWJqZWN0Lm5leHQobW9kZSk7XHJcbiAgICBpZiAoISF0aGlzLm1hcCkge1xyXG4gICAgICBsZXQgaXNBY3RpdmVEcmF3TW9kZSA9IHRydWU7XHJcbiAgICAgIHN3aXRjaCAobW9kZSkge1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuT2ZmOlxyXG4gICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKFxyXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcclxuICAgICAgICAgICAgXCJjcm9zc2hhaXItY3Vyc29yLWVuYWJsZWRcIlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKGZhbHNlKTtcclxuICAgICAgICAgIHRoaXMuc3RvcERyYXcoKTtcclxuICAgICAgICAgIHRoaXMudHJhY2VyLnNldFN0eWxlKHtcclxuICAgICAgICAgICAgY29sb3I6IFwiXCIsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyh0cnVlLCB0cnVlLCB0cnVlKTtcclxuICAgICAgICAgIGlzQWN0aXZlRHJhd01vZGUgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuQWRkOlxyXG4gICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKFxyXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcclxuICAgICAgICAgICAgXCJjcm9zc2hhaXItY3Vyc29yLWVuYWJsZWRcIlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKHRydWUpO1xyXG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xyXG4gICAgICAgICAgICBjb2xvcjogZGVmYXVsdENvbmZpZy5wb2x5TGluZU9wdGlvbnMuY29sb3IsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyhmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuU3VidHJhY3Q6XHJcbiAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoXHJcbiAgICAgICAgICAgIHRoaXMubWFwLmdldENvbnRhaW5lcigpLFxyXG4gICAgICAgICAgICBcImNyb3NzaGFpci1jdXJzb3ItZW5hYmxlZFwiXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgdGhpcy5ldmVudHModHJ1ZSk7XHJcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XHJcbiAgICAgICAgICAgIGNvbG9yOiBcIiNEOTQ2MEZcIixcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5zZXRMZWFmbGV0TWFwRXZlbnRzKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpc0FjdGl2ZURyYXdNb2RlKSB7XHJcbiAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0RnJlZURyYXdNb2RlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0TW92ZU1vZGUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbW9kZUNoYW5nZShtb2RlOiBEcmF3TW9kZSk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShtb2RlKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy8gcmVtb3ZlLCB1c2UgbW9kZUNoYW5nZVxyXG4gIGRyYXdNb2RlQ2xpY2soKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkRyYXdTdGF0ZXMuaXNGcmVlRHJhd01vZGUpIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0TW92ZU1vZGUoKTtcclxuICAgICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0RnJlZURyYXdNb2RlKCk7XHJcbiAgICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuQWRkKTtcclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy8gcmVtb3ZlLCB1c2UgbW9kZUNoYW5nZVxyXG4gIGZyZWVkcmF3TWVudUNsaWNrKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5BZGQpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uYWN0aXZhdGUoKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcblxyXG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcclxuICBzdWJ0cmFjdENsaWNrKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5TdWJ0cmFjdCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHJlc2V0VHJhY2tlcigpIHtcclxuICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW1swLCAwXV0pO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlTWFya2VyTWVudSgpOiB2b2lkIHtcclxuICAgIGFsZXJ0KFwib3BlbiBtZW51XCIpO1xyXG4gIH1cclxuICBwcml2YXRlIGdldEh0bWxDb250ZW50KGNhbGxCYWNrOiBGdW5jdGlvbik6IEhUTUxFbGVtZW50IHtcclxuICAgIGNvbnN0IGNvbXAgPSB0aGlzLnBvcHVwR2VuZXJhdG9yLmdlbmVyYXRlQWx0ZXJQb3B1cCgpO1xyXG4gICAgY29tcC5pbnN0YW5jZS5iYm94Q2xpY2tlZC5zdWJzY3JpYmUoKGUpID0+IHtcclxuICAgICAgY2FsbEJhY2soZSk7XHJcbiAgICB9KTtcclxuICAgIGNvbXAuaW5zdGFuY2Uuc2ltcGx5ZmlDbGlja2VkLnN1YnNjcmliZSgoZSkgPT4ge1xyXG4gICAgICBjYWxsQmFjayhlKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvbXAubG9jYXRpb24ubmF0aXZlRWxlbWVudDtcclxuICB9XHJcbiAgcHJpdmF0ZSBjb252ZXJ0VG9Cb3VuZHNQb2x5Z29uKFxyXG4gICAgbGF0bG5nczogSUxhdExuZ1tdLFxyXG4gICAgYWRkTWlkcG9pbnRNYXJrZXJzOiBib29sZWFuID0gZmFsc2VcclxuICApIHtcclxuICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXHJcbiAgICAgIHRoaXMuY29udmVydFRvQ29vcmRzKFtsYXRsbmdzXSlcclxuICAgICk7XHJcbiAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihcclxuICAgICAgcG9seWdvbixcclxuICAgICAgYWRkTWlkcG9pbnRNYXJrZXJzXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihuZXdQb2x5Z29uKSwgZmFsc2UpO1xyXG4gIH1cclxuICBwcml2YXRlIGNvbnZlcnRUb1NpbXBsaWZpZWRQb2x5Z29uKGxhdGxuZ3M6IElMYXRMbmdbXSkge1xyXG4gICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XHJcbiAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihcclxuICAgICAgdGhpcy5jb252ZXJ0VG9Db29yZHMoW2xhdGxuZ3NdKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihuZXdQb2x5Z29uKSwgdHJ1ZSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0TWFya2VySW5kZXgobGF0bG5nczogSUxhdExuZ1tdLCBwb3NpdGlvbjogTWFya2VyUG9zaXRpb24pOiBudW1iZXIge1xyXG4gICAgY29uc3QgYm91bmRzOiBMLkxhdExuZ0JvdW5kcyA9IFBvbHlEcmF3VXRpbC5nZXRCb3VuZHMoXHJcbiAgICAgIGxhdGxuZ3MsXHJcbiAgICAgIE1hdGguc3FydCgyKSAvIDJcclxuICAgICk7XHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MoXHJcbiAgICAgIGJvdW5kcy5nZXRTb3V0aCgpLFxyXG4gICAgICBib3VuZHMuZ2V0V2VzdCgpLFxyXG4gICAgICBib3VuZHMuZ2V0Tm9ydGgoKSxcclxuICAgICAgYm91bmRzLmdldEVhc3QoKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGNvbXBhc3NEaXJlY3Rpb24gPSBjb21wYXNzLmdldERpcmVjdGlvbihwb3NpdGlvbik7XHJcbiAgICBjb25zdCBsYXRMbmdQb2ludDogSUxhdExuZyA9IHtcclxuICAgICAgbGF0OiBjb21wYXNzRGlyZWN0aW9uLmxhdCxcclxuICAgICAgbG5nOiBjb21wYXNzRGlyZWN0aW9uLmxuZyxcclxuICAgIH07XHJcbiAgICBjb25zdCB0YXJnZXRQb2ludCA9IHRoaXMudHVyZkhlbHBlci5nZXRDb29yZChsYXRMbmdQb2ludCk7XHJcbiAgICBjb25zdCBmYyA9IHRoaXMudHVyZkhlbHBlci5nZXRGZWF0dXJlUG9pbnRDb2xsZWN0aW9uKGxhdGxuZ3MpO1xyXG4gICAgY29uc3QgbmVhcmVzdFBvaW50SWR4ID0gdGhpcy50dXJmSGVscGVyLmdldE5lYXJlc3RQb2ludEluZGV4KFxyXG4gICAgICB0YXJnZXRQb2ludCxcclxuICAgICAgZmMgYXMgYW55XHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBuZWFyZXN0UG9pbnRJZHg7XHJcbiAgfVxyXG59XHJcbiJdfQ==