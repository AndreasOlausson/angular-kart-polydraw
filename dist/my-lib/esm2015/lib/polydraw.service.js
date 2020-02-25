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
        this.mapState.map$.pipe(filter(m => m !== null)).subscribe((map) => {
            this.map = map;
            console.log("Kartet i polydraw: ", this.map);
            console.log("pre this.config", this.config);
            this.config = defaultConfig;
            console.log("this.config", this.config);
            this.configurate({});
            console.log("after this.config", this.config);
            this.tracer = L.polyline([[0, 0]], this.config.polyLineOptions);
            console.log("Tracer pipe: ", this.tracer);
            this.initPolyDraw();
        });
        this.mapState.mapZoomLevel$
            .pipe(debounceTime(100), takeUntil(this.ngUnsubscribe))
            .subscribe((zoom) => {
            this.onZoomChange(zoom);
        });
        this.polygonInformation.polygonInformation$.subscribe(k => {
            console.log("PolyInfo start: ", k);
        });
        // TODO - lage en config observable i mapState og oppdater this.config med den
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
        // console.log("closeAndReset");
        this.setDrawMode(DrawMode.Off);
        this.removeAllFeatureGroups();
    }
    // make readable
    deletePolygon(polygon) {
        console.log("deletePolygon: ", polygon);
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
                    console.log("Test: ", polygon3);
                    console.log(polygon);
                    const equals = this.polygonArrayEquals(polygon3, polygon);
                    console.log("equals: ", equals, " length: ", length);
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
        this.polygonInformation.reset();
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
        console.log("markers: ", markerLatlngs);
        markerLatlngs.forEach(polygon => {
            polygon.forEach((polyElement, i) => {
                if (i === 0) {
                    this.addMarker(polyElement, featureGroup);
                }
                else {
                    this.addHoleMarker(polyElement, featureGroup);
                    console.log("Hull: ", polyElement);
                }
            });
            // this.addMarker(polygon[0], featureGroup);
            // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
        });
        this.arrayOfFeatureGroups.push(featureGroup);
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
        this.polygonInformation.activate();
        this.polygonInformation.setMoveMode();
    }
    // innehåll i if'ar flytta till egna metoder
    convertToCoords(latlngs) {
        const coords = [];
        console.log(latlngs.length, latlngs);
        if (latlngs.length > 1 && latlngs.length < 3) {
            const coordinates = [];
            console.log(L.GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), latlngs[latlngs.length - 1].length);
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
            console.log("Within1 ", within);
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
        console.log("Tracer init: ", this.tracer);
        this.map.addLayer(this.tracer);
        this.setDrawMode(DrawMode.Off);
    }
    // Test L.MouseEvent
    mouseDown(event) {
        console.log("mouseDown", event);
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
    onZoomChange(zoomLevel) {
        // console.log("onZoomChange", zoomLevel);
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
        // console.log("drawStartedEvents", onoff);
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
        console.log("addPolygon", latlngs, simplify, noMerge, this.kinks, this.config);
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
        console.log("AddPolygonLayer: ", latLngs);
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
                    console.log("Hull: ", polyElement);
                }
            });
            // this.addMarker(polygon[0], featureGroup);
            // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
        });
        this.arrayOfFeatureGroups.push(featureGroup);
        console.log("Array: ", this.arrayOfFeatureGroups);
        this.polygonInformation.activate();
        this.setDrawMode(DrawMode.Off);
        featureGroup.on("click", e => {
            this.polygonClicked(e, latLngs);
        });
    }
    // fine
    polygonClicked(e, poly) {
        const newPoint = e.latlng;
        if (poly.geometry.type === "MultiPolygon") {
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
        console.log("getPolygons: ", latlngs);
        const polygon = L.GeoJSON.geometryToLayer(latlngs);
        polygon.setStyle(this.config.polygonOptions);
        return polygon;
    }
    // fine
    merge(latlngs) {
        console.log("merge", latlngs);
        const polygonFeature = [];
        const newArray = [];
        let polyIntersection = false;
        this.arrayOfFeatureGroups.forEach(featureGroup => {
            const featureCollection = featureGroup.toGeoJSON();
            console.log("Merger: ", featureCollection.features[0]);
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
        const onoroff = onoff ? "on" : "off";
        this.map[onoroff]("mousedown", this.mouseDown, this);
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
                    this.convertToBoundsPolygon(latlngs, true);
                    // this.convertToSimplifiedPolygon(latlngs);
                });
            }
            if (i === deleteMarkerIdx && this.config.markers.delete) {
                marker.on("click", e => {
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
        console.log(posarrays);
        console.log("markerdrag: ", layerLength);
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
                    }
                    else {
                        for (let j = 0; j < posarrays[0][0].length; j++) {
                            testarray.push(layerLength[j + 1].getLatLng());
                        }
                        hole.push(testarray);
                    }
                    console.log("Hole: ", hole);
                    newPos.push(hole);
                }
                else {
                    length += posarrays[index - 1][0].length;
                    console.log("STart index: ", length);
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
                console.log("Polygon drag: ", posarrays[0][index]);
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
            console.log("Hole 2: ", hole);
        }
        console.log("Nye posisjoner: ", newPos);
        layerLength[0].setLatLngs(newPos);
    }
    // check this
    markerDragEnd(FeatureGroup) {
        this.polygonInformation.deletePolygonInformationStorage();
        const featureCollection = FeatureGroup.toGeoJSON();
        console.log("Markerdragend polygon: ", featureCollection.features[0].geometry.coordinates);
        if (featureCollection.features[0].geometry.coordinates.length > 1) {
            featureCollection.features[0].geometry.coordinates.forEach(element => {
                const feature = this.turfHelper.getMultiPolygon([element]);
                console.log("Markerdragend: ", feature);
                if (this.turfHelper.hasKinks(feature)) {
                    this.kinks = true;
                    const unkink = this.turfHelper.getKinks(feature);
                    // this.deletePolygon(this.getLatLngsFromJson(feature));
                    this.removeFeatureGroup(FeatureGroup);
                    console.log("Unkink: ", unkink);
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
            console.log("Markerdragend: ", feature);
            if (this.turfHelper.hasKinks(feature)) {
                this.kinks = true;
                const unkink = this.turfHelper.getKinks(feature);
                // this.deletePolygon(this.getLatLngsFromJson(feature));
                this.removeFeatureGroup(FeatureGroup);
                console.log("Unkink: ", unkink);
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
        console.log("getLatLngsFromJson: ", feature);
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
        console.log("unionPolygons", layers, latlngs, polygonFeature);
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
        console.log("removeFeatureGroup", featureGroup);
        featureGroup.clearLayers();
        this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(featureGroups => featureGroups !== featureGroup);
        // this.updatePolygons();
        this.map.removeLayer(featureGroup);
    }
    // fine until refactoring
    removeFeatureGroupOnMerge(featureGroup) {
        console.log("removeFeatureGroupOnMerge", featureGroup);
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
        console.log("deletePolygonOnMerge", polygon);
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
                    console.log("EQUALS", polygon);
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
                case DrawMode.Add:
                    L.DomUtil.addClass(this.map.getContainer(), "crosshair-cursor-enabled");
                    this.events(true);
                    this.tracer.setStyle({
                        color: defaultConfig.polyLineOptions.color
                    });
                    this.setLeafletMapEvents(false, false, false);
                    break;
                case DrawMode.Subtract:
                    L.DomUtil.addClass(this.map.getContainer(), "crosshair-cursor-enabled");
                    this.events(true);
                    this.tracer.setStyle({
                        color: "#D9460F"
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
        providedIn: "root"
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3BvbHlkcmF3LyIsInNvdXJjZXMiOlsibGliL3BvbHlkcmF3LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQVksTUFBTSxlQUFlLENBQUM7QUFDckQsT0FBTyxLQUFLLENBQUMsTUFBTSxTQUFTLENBQUM7QUFDN0Isc0NBQXNDO0FBQ3RDLE9BQU8sRUFBYyxlQUFlLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzVELE9BQU8sRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWpFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBRTVDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2hELE9BQU8sRUFBa0IsUUFBUSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ25ELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDOzs7Ozs7O0FBTWhFLElBQWEsZUFBZTtBQUQ1QiwyQkFBMkI7QUFDM0IsTUFBYSxlQUFlO0lBb0IxQixZQUNVLFFBQTBCLEVBQzFCLGNBQXlDLEVBQ3pDLFVBQTZCLEVBQzdCLGtCQUE2QyxFQUM3QyxhQUFtQztRQUpuQyxhQUFRLEdBQVIsUUFBUSxDQUFrQjtRQUMxQixtQkFBYyxHQUFkLGNBQWMsQ0FBMkI7UUFDekMsZUFBVSxHQUFWLFVBQVUsQ0FBbUI7UUFDN0IsdUJBQWtC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eUI7UUFDN0IsaUJBQWlCO1FBQ1QseUJBQXlCO1FBQzlCLG9CQUFvQjtHQXpCbEMsZUFBZSxDQTIvQjNCO1NBMy9CWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgT3B0aW9uYWwgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCI7XHJcbi8vIGltcG9ydCAqIGFzIHR1cmYgZnJvbSBcIkB0dXJmL3R1cmZcIjtcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgQmVoYXZpb3JTdWJqZWN0LCBTdWJqZWN0IH0gZnJvbSBcInJ4anNcIjtcclxuaW1wb3J0IHsgZmlsdGVyLCBkZWJvdW5jZVRpbWUsIHRha2VVbnRpbCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xyXG5pbXBvcnQgeyBGZWF0dXJlLCBQb2x5Z29uLCBNdWx0aVBvbHlnb24gfSBmcm9tIFwiQHR1cmYvdHVyZlwiO1xyXG5pbXBvcnQgeyBQb2x5U3RhdGVTZXJ2aWNlIH0gZnJvbSBcIi4vbWFwLXN0YXRlLnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgVHVyZkhlbHBlclNlcnZpY2UgfSBmcm9tIFwiLi90dXJmLWhlbHBlci5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IFBvbHlnb25JbmZvcm1hdGlvblNlcnZpY2UgfSBmcm9tIFwiLi9wb2x5Z29uLWluZm9ybWF0aW9uLnNlcnZpY2VcIjtcclxuaW1wb3J0IGRlZmF1bHRDb25maWcgZnJvbSBcIi4vcG9seWluZm8uanNvblwiO1xyXG5pbXBvcnQgeyBJTGF0TG5nLCBQb2x5Z29uRHJhd1N0YXRlcyB9IGZyb20gXCIuL3BvbHlnb24taGVscGVyc1wiO1xyXG5pbXBvcnQgeyBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlIH0gZnJvbSBcIi4vY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IENvbXBhc3MsIFBvbHlEcmF3VXRpbCB9IGZyb20gXCIuL3V0aWxzXCI7XHJcbmltcG9ydCB7IE1hcmtlclBvc2l0aW9uLCBEcmF3TW9kZSB9IGZyb20gXCIuL2VudW1zXCI7XHJcbmltcG9ydCB7IExlYWZsZXRIZWxwZXJTZXJ2aWNlIH0gZnJvbSBcIi4vbGVhZmxldC1oZWxwZXIuc2VydmljZVwiO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46IFwicm9vdFwiXHJcbn0pXHJcbi8vIFJlbmFtZSAtIFBvbHlEcmF3U2VydmljZVxyXG5leHBvcnQgY2xhc3MgUG9seURyYXdTZXJ2aWNlIHtcclxuICAvLyBEcmF3TW9kZXMsIGRldGVybWluZSBVSSBidXR0b25zIGV0Yy4uLlxyXG4gIGRyYXdNb2RlU3ViamVjdDogQmVoYXZpb3JTdWJqZWN0PERyYXdNb2RlPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8RHJhd01vZGU+KFxyXG4gICAgRHJhd01vZGUuT2ZmXHJcbiAgKTtcclxuICBkcmF3TW9kZSQ6IE9ic2VydmFibGU8RHJhd01vZGU+ID0gdGhpcy5kcmF3TW9kZVN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWluaW11bUZyZWVEcmF3Wm9vbUxldmVsOiBudW1iZXIgPSAxMjtcclxuICBwcml2YXRlIG1hcDogTC5NYXA7XHJcblxyXG4gIHByaXZhdGUgbWVyZ2VQb2x5Z29uczogYm9vbGVhbjtcclxuICBwcml2YXRlIGtpbmtzOiBib29sZWFuO1xyXG4gIC8vIGFkZCB0byBjb25maWdcclxuICBwcml2YXRlIGFycmF5T2ZGZWF0dXJlR3JvdXBzOiBMLkZlYXR1cmVHcm91cDxMLkxheWVyPltdID0gW107XHJcbiAgcHJpdmF0ZSB0cmFjZXI6IEwuUG9seWxpbmUgPSB7fSBhcyBhbnk7XHJcbiAgLy8gZW5kIGFkZCB0byBjb25maWdcclxuXHJcbiAgcHJpdmF0ZSBuZ1Vuc3Vic2NyaWJlID0gbmV3IFN1YmplY3QoKTtcclxuICBwcml2YXRlIGNvbmZpZzogdHlwZW9mIGRlZmF1bHRDb25maWcgPSBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgbWFwU3RhdGU6IFBvbHlTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBvcHVwR2VuZXJhdG9yOiBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0dXJmSGVscGVyOiBUdXJmSGVscGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgcG9seWdvbkluZm9ybWF0aW9uOiBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsZWFmbGV0SGVscGVyOiBMZWFmbGV0SGVscGVyU2VydmljZVxyXG4gICkge1xyXG4gICAgdGhpcy5tYXBTdGF0ZS5tYXAkLnBpcGUoZmlsdGVyKG0gPT4gbSAhPT0gbnVsbCkpLnN1YnNjcmliZSgobWFwOiBMLk1hcCkgPT4ge1xyXG4gICAgICB0aGlzLm1hcCA9IG1hcDtcclxuICAgICAgY29uc29sZS5sb2coXCJLYXJ0ZXQgaSBwb2x5ZHJhdzogXCIsIHRoaXMubWFwKTtcclxuICAgICAgY29uc29sZS5sb2coXCJwcmUgdGhpcy5jb25maWdcIiwgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLmNvbmZpZyA9IGRlZmF1bHRDb25maWc7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwidGhpcy5jb25maWdcIiwgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLmNvbmZpZ3VyYXRlKHt9KTtcclxuICAgICAgY29uc29sZS5sb2coXCJhZnRlciB0aGlzLmNvbmZpZ1wiLCB0aGlzLmNvbmZpZyk7XHJcbiAgICAgIHRoaXMudHJhY2VyID0gTC5wb2x5bGluZShbWzAsIDBdXSwgdGhpcy5jb25maWcucG9seUxpbmVPcHRpb25zKTtcclxuICAgICAgY29uc29sZS5sb2coXCJUcmFjZXIgcGlwZTogXCIsIHRoaXMudHJhY2VyKTtcclxuICAgICAgdGhpcy5pbml0UG9seURyYXcoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMubWFwU3RhdGUubWFwWm9vbUxldmVsJFxyXG4gICAgICAucGlwZShkZWJvdW5jZVRpbWUoMTAwKSwgdGFrZVVudGlsKHRoaXMubmdVbnN1YnNjcmliZSkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKHpvb206IG51bWJlcikgPT4ge1xyXG4gICAgICAgIHRoaXMub25ab29tQ2hhbmdlKHpvb20pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb24kLnN1YnNjcmliZShrID0+IHtcclxuICAgICAgY29uc29sZS5sb2coXCJQb2x5SW5mbyBzdGFydDogXCIsIGspO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVE9ETyAtIGxhZ2UgZW4gY29uZmlnIG9ic2VydmFibGUgaSBtYXBTdGF0ZSBvZyBvcHBkYXRlciB0aGlzLmNvbmZpZyBtZWQgZGVuXHJcbiAgfVxyXG4gIC8vIG5ld1xyXG4gIGNvbmZpZ3VyYXRlKGNvbmZpZzogT2JqZWN0KTogdm9pZCB7XHJcbiAgICAvLyBUT0RPIGlmIGNvbmZpZyBpcyBwYXRoLi4uXHJcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4uZGVmYXVsdENvbmZpZywgLi4uY29uZmlnIH07XHJcblxyXG4gICAgdGhpcy5tZXJnZVBvbHlnb25zID0gdGhpcy5jb25maWcubWVyZ2VQb2x5Z29ucztcclxuICAgIHRoaXMua2lua3MgPSB0aGlzLmNvbmZpZy5raW5rcztcclxuICB9XHJcblxyXG4gIC8vIGZpbmVcclxuICBjbG9zZUFuZFJlc2V0KCk6IHZvaWQge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJjbG9zZUFuZFJlc2V0XCIpO1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xyXG4gICAgdGhpcy5yZW1vdmVBbGxGZWF0dXJlR3JvdXBzKCk7XHJcbiAgfVxyXG5cclxuICAvLyBtYWtlIHJlYWRhYmxlXHJcbiAgZGVsZXRlUG9seWdvbihwb2x5Z29uOiBJTGF0TG5nW11bXSkge1xyXG4gICAgY29uc29sZS5sb2coXCJkZWxldGVQb2x5Z29uOiBcIiwgcG9seWdvbik7XHJcbiAgICBpZiAodGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueTtcclxuICAgICAgICBjb25zdCBsYXRsbmdzID0gbGF5ZXIuZ2V0TGF0TG5ncygpO1xyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGxhdGxuZ3MubGVuZ3RoO1xyXG4gICAgICAgIC8vICA9IFtdXHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICBsZXQgcG9seWdvbjM7XHJcbiAgICAgICAgICBjb25zdCB0ZXN0ID0gWy4uLmxhdGxuZ107XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2cobGF0bG5nKTtcclxuICAgICAgICAgIGlmIChsYXRsbmcubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAvKiBpZiAobGF0bG5nWzBdWzBdICE9PSBsYXRsbmdbMF1bbGF0bG5nWzBdLmxlbmd0aCAtIDFdKSB7XHJcbiAgICAgICAgICAgICAgdGVzdFswXS5wdXNoKGxhdGxuZ1swXVswXSk7XHJcbiAgICAgICAgICAgICAgfSAgKi9cclxuXHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gW3Rlc3RbMF1dO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXSAhPT0gbGF0bG5nW2xhdGxuZy5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICAgIHRlc3QucHVzaChsYXRsbmdbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gdGVzdDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlRlc3Q6IFwiLCBwb2x5Z29uMyk7XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2cocG9seWdvbik7XHJcblxyXG4gICAgICAgICAgY29uc3QgZXF1YWxzID0gdGhpcy5wb2x5Z29uQXJyYXlFcXVhbHMocG9seWdvbjMsIHBvbHlnb24pO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJlcXVhbHM6IFwiLCBlcXVhbHMsIFwiIGxlbmd0aDogXCIsIGxlbmd0aCk7XHJcbiAgICAgICAgICBpZiAoZXF1YWxzICYmIGxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVxdWFscyAmJiBsZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVRyYXNoQ2FuT25NdWx0aShbcG9seWdvbl0pO1xyXG4gICAgICAgICAgICBsYXRsbmdzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIGxheWVyLnNldExhdExuZ3MobGF0bG5ncyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxheWVyLnRvR2VvSlNPTigpLCBmYWxzZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcmVtb3ZlQWxsRmVhdHVyZUdyb3VwcygpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwicmVtb3ZlQWxsRmVhdHVyZUdyb3Vwc1wiLCBudWxsKTtcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXBzID0+IHtcclxuICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3Vwcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gW107XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5yZXNldCgpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24udXBkYXRlUG9seWdvbnMoKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIGdldERyYXdNb2RlKCk6IERyYXdNb2RlIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZ2V0RHJhd01vZGVcIiwgbnVsbCk7XHJcbiAgICByZXR1cm4gdGhpcy5kcmF3TW9kZVN1YmplY3QudmFsdWU7XHJcbiAgfVxyXG5cclxuICBhZGRWaWtlbihwb2x5Z29uKSB7XHJcbiAgICB0aGlzLmFkZFBvbHlnb25MYXllcihwb2x5Z29uLCB0cnVlKTtcclxuICB9XHJcblxyXG4gIC8vIGNoZWNrIHRoaXNcclxuICBhZGRBdXRvUG9seWdvbihnZW9ncmFwaGljQm9yZGVyczogTC5MYXRMbmdbXVtdKTogdm9pZCB7XHJcbiAgICBjb25zdCBmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwID0gbmV3IEwuRmVhdHVyZUdyb3VwKCk7XHJcblxyXG4gICAgY29uc3QgcG9seWdvbjIgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFxyXG4gICAgICB0aGlzLmNvbnZlcnRUb0Nvb3JkcyhnZW9ncmFwaGljQm9yZGVycylcclxuICAgICk7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMik7XHJcbiAgICBjb25zdCBwb2x5Z29uID0gdGhpcy5nZXRQb2x5Z29uKHBvbHlnb24yKTtcclxuXHJcbiAgICBmZWF0dXJlR3JvdXAuYWRkTGF5ZXIocG9seWdvbik7XHJcbiAgICBjb25zdCBtYXJrZXJMYXRsbmdzID0gcG9seWdvbi5nZXRMYXRMbmdzKCk7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1hcmtlcnM6IFwiLCBtYXJrZXJMYXRsbmdzKTtcclxuICAgIG1hcmtlckxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgcG9seWdvbi5mb3JFYWNoKChwb2x5RWxlbWVudCwgaSkgPT4ge1xyXG4gICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLmFkZE1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hZGRIb2xlTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJIdWxsOiBcIiwgcG9seUVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIC8vIHRoaXMuYWRkTWFya2VyKHBvbHlnb25bMF0sIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgIC8vIFRPRE8gLSBIdmlzIHBvbHlnb24ubGVuZ3RoID4xLCBzw6UgaGFyIGRlbiBodWxsOiBlZ2VuIGFkZE1hcmtlciBmdW5rc2pvblxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5wdXNoKGZlYXR1cmVHcm91cCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKFxyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzXHJcbiAgICApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uYWN0aXZhdGUoKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XHJcbiAgfVxyXG5cclxuICAvLyBpbm5laMOlbGwgaSBpZidhciBmbHl0dGEgdGlsbCBlZ25hIG1ldG9kZXJcclxuICBwcml2YXRlIGNvbnZlcnRUb0Nvb3JkcyhsYXRsbmdzOiBJTGF0TG5nW11bXSkge1xyXG4gICAgY29uc3QgY29vcmRzID0gW107XHJcbiAgICBjb25zb2xlLmxvZyhsYXRsbmdzLmxlbmd0aCwgbGF0bG5ncyk7XHJcbiAgICBpZiAobGF0bG5ncy5sZW5ndGggPiAxICYmIGxhdGxuZ3MubGVuZ3RoIDwgMykge1xyXG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IFtdO1xyXG4gICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSksXHJcbiAgICAgICAgbGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdLmxlbmd0aFxyXG4gICAgICApO1xyXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG1heC1saW5lLWxlbmd0aFxyXG4gICAgICBjb25zdCB3aXRoaW4gPSB0aGlzLnR1cmZIZWxwZXIuaXNXaXRoaW4oXHJcbiAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzW2xhdGxuZ3MubGVuZ3RoIC0gMV0pLFxyXG4gICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSlcclxuICAgICAgKTtcclxuICAgICAgaWYgKHdpdGhpbikge1xyXG4gICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgIGNvb3JkaW5hdGVzLnB1c2goTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbildKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID49IDEpIHtcclxuICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc29sZS5sb2coXCJXaXRoaW4xIFwiLCB3aXRoaW4pO1xyXG4gICAgfSBlbHNlIGlmIChsYXRsbmdzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAxOyBpbmRleCA8IGxhdGxuZ3MubGVuZ3RoIC0gMTsgaW5kZXgrKykge1xyXG4gICAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihcclxuICAgICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tpbmRleF0pLFxyXG4gICAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKHdpdGhpbikge1xyXG4gICAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICBjb29yZGluYXRlcy5wdXNoKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbikpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbildKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSldKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKGNvb3Jkcyk7XHJcbiAgICByZXR1cm4gY29vcmRzO1xyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgaW5pdFBvbHlEcmF3KCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJpbml0UG9seURyYXdcIiwgbnVsbCk7XHJcblxyXG4gICAgY29uc3QgY29udGFpbmVyOiBIVE1MRWxlbWVudCA9IHRoaXMubWFwLmdldENvbnRhaW5lcigpO1xyXG4gICAgY29uc3QgZHJhd01vZGUgPSB0aGlzLmdldERyYXdNb2RlKCk7XHJcbiAgICBpZiAodGhpcy5jb25maWcudG91Y2hTdXBwb3J0KSB7XHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCBlID0+IHtcclxuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xyXG4gICAgICAgICAgdGhpcy5tb3VzZURvd24oZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgZSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcclxuICAgICAgICAgIHRoaXMubW91c2VVcExlYXZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIGUgPT4ge1xyXG4gICAgICAgIGlmIChkcmF3TW9kZSAhPT0gRHJhd01vZGUuT2ZmKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdXNlTW92ZShlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJUcmFjZXIgaW5pdDogXCIsIHRoaXMudHJhY2VyKTtcclxuICAgIHRoaXMubWFwLmFkZExheWVyKHRoaXMudHJhY2VyKTtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuICB9XHJcbiAgLy8gVGVzdCBMLk1vdXNlRXZlbnRcclxuICBwcml2YXRlIG1vdXNlRG93bihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coXCJtb3VzZURvd25cIiwgZXZlbnQpO1xyXG5cclxuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9IG51bGwpIHtcclxuICAgICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbZXZlbnQubGF0bG5nXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBsYXRsbmcgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKFtcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgIF0pO1xyXG4gICAgICB0aGlzLnRyYWNlci5zZXRMYXRMbmdzKFtsYXRsbmddKTtcclxuICAgIH1cclxuICAgIHRoaXMuc3RhcnREcmF3KCk7XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPIGV2ZW50IHR5cGUsIGNyZWF0ZSBjb250YWluZXJQb2ludFRvTGF0TG5nLW1ldGhvZFxyXG4gIHByaXZhdGUgbW91c2VNb3ZlKGV2ZW50KSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm1vdXNlTW92ZVwiLCBldmVudCk7XHJcblxyXG4gICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT0gbnVsbCkge1xyXG4gICAgICB0aGlzLnRyYWNlci5hZGRMYXRMbmcoZXZlbnQubGF0bG5nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGxhdGxuZyA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcoW1xyXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCxcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFlcclxuICAgICAgXSk7XHJcbiAgICAgIHRoaXMudHJhY2VyLmFkZExhdExuZyhsYXRsbmcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgbW91c2VVcExlYXZlKCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJtb3VzZVVwTGVhdmVcIiwgbnVsbCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLURlbGV0ZSB0cmFzaGNhbnNcIiwgbnVsbCk7XHJcbiAgICBjb25zdCBnZW9Qb3M6IEZlYXR1cmU8XHJcbiAgICAgIFBvbHlnb24gfCBNdWx0aVBvbHlnb25cclxuICAgID4gPSB0aGlzLnR1cmZIZWxwZXIudHVyZkNvbmNhdmVtYW4odGhpcy50cmFjZXIudG9HZW9KU09OKCkgYXMgYW55KTtcclxuICAgIHRoaXMuc3RvcERyYXcoKTtcclxuICAgIHN3aXRjaCAodGhpcy5nZXREcmF3TW9kZSgpKSB7XHJcbiAgICAgIGNhc2UgRHJhd01vZGUuQWRkOlxyXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbihnZW9Qb3MsIHRydWUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIERyYXdNb2RlLlN1YnRyYWN0OlxyXG4gICAgICAgIHRoaXMuc3VidHJhY3RQb2x5Z29uKGdlb1Bvcyk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwc1xyXG4gICAgKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tY3JlYXRlIHRyYXNoY2Fuc1wiLCBudWxsKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc3RhcnREcmF3KCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJzdGFydERyYXdcIiwgbnVsbCk7XHJcblxyXG4gICAgdGhpcy5kcmF3U3RhcnRlZEV2ZW50cyh0cnVlKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc3RvcERyYXcoKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInN0b3BEcmF3XCIsIG51bGwpO1xyXG5cclxuICAgIHRoaXMucmVzZXRUcmFja2VyKCk7XHJcbiAgICB0aGlzLmRyYXdTdGFydGVkRXZlbnRzKGZhbHNlKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25ab29tQ2hhbmdlKHpvb21MZXZlbDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm9uWm9vbUNoYW5nZVwiLCB6b29tTGV2ZWwpO1xyXG5cclxuICAgIGlmICh6b29tTGV2ZWwgPj0gdGhpcy5taW5pbXVtRnJlZURyYXdab29tTGV2ZWwpIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkRyYXdTdGF0ZXMuY2FuVXNlUG9seURyYXcgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkRyYXdTdGF0ZXMuY2FuVXNlUG9seURyYXcgPSBmYWxzZTtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0TW92ZU1vZGUoKTtcclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZHJhd1N0YXJ0ZWRFdmVudHMob25vZmY6IGJvb2xlYW4pIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZHJhd1N0YXJ0ZWRFdmVudHNcIiwgb25vZmYpO1xyXG5cclxuICAgIGNvbnN0IG9ub3JvZmYgPSBvbm9mZiA/IFwib25cIiA6IFwib2ZmXCI7XHJcblxyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmUsIHRoaXMpO1xyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcExlYXZlLCB0aGlzKTtcclxuICB9XHJcbiAgLy8gT24gaG9sZFxyXG4gIHByaXZhdGUgc3VidHJhY3RQb2x5Z29uKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIHRoaXMuc3VidHJhY3QobGF0bG5ncyk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGFkZFBvbHlnb24oXHJcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgc2ltcGxpZnk6IGJvb2xlYW4sXHJcbiAgICBub01lcmdlOiBib29sZWFuID0gZmFsc2VcclxuICApIHtcclxuICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICBcImFkZFBvbHlnb25cIixcclxuICAgICAgbGF0bG5ncyxcclxuICAgICAgc2ltcGxpZnksXHJcbiAgICAgIG5vTWVyZ2UsXHJcbiAgICAgIHRoaXMua2lua3MsXHJcbiAgICAgIHRoaXMuY29uZmlnXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgdGhpcy5tZXJnZVBvbHlnb25zICYmXHJcbiAgICAgICFub01lcmdlICYmXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCAmJlxyXG4gICAgICAhdGhpcy5raW5rc1xyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMubWVyZ2UobGF0bG5ncyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXRsbmdzLCBzaW1wbGlmeSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGFkZFBvbHlnb25MYXllcihcclxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBzaW1wbGlmeTogYm9vbGVhblxyXG4gICkge1xyXG4gICAgY29uc3QgZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCA9IG5ldyBMLkZlYXR1cmVHcm91cCgpO1xyXG5cclxuICAgIGNvbnN0IGxhdExuZ3MgPSBzaW1wbGlmeSA/IHRoaXMudHVyZkhlbHBlci5nZXRTaW1wbGlmaWVkKGxhdGxuZ3MpIDogbGF0bG5ncztcclxuICAgIGNvbnNvbGUubG9nKFwiQWRkUG9seWdvbkxheWVyOiBcIiwgbGF0TG5ncyk7XHJcbiAgICBjb25zdCBwb2x5Z29uID0gdGhpcy5nZXRQb2x5Z29uKGxhdExuZ3MpO1xyXG4gICAgZmVhdHVyZUdyb3VwLmFkZExheWVyKHBvbHlnb24pO1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbik7XHJcbiAgICBjb25zdCBtYXJrZXJMYXRsbmdzID0gcG9seWdvbi5nZXRMYXRMbmdzKCk7XHJcbiAgICBtYXJrZXJMYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgIHBvbHlnb24uZm9yRWFjaCgocG9seUVsZW1lbnQ6IElMYXRMbmdbXSwgaTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGkgPT09IDApIHtcclxuICAgICAgICAgIHRoaXMuYWRkTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmFkZEhvbGVNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkh1bGw6IFwiLCBwb2x5RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgLy8gdGhpcy5hZGRNYXJrZXIocG9seWdvblswXSwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgLy8gVE9ETyAtIEh2aXMgcG9seWdvbi5sZW5ndGggPjEsIHPDpSBoYXIgZGVuIGh1bGw6IGVnZW4gYWRkTWFya2VyIGZ1bmtzam9uXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgIGNvbnNvbGUubG9nKFwiQXJyYXk6IFwiLCB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XHJcblxyXG4gICAgZmVhdHVyZUdyb3VwLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgIHRoaXMucG9seWdvbkNsaWNrZWQoZSwgbGF0TG5ncyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgcG9seWdvbkNsaWNrZWQoZTogYW55LCBwb2x5OiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zdCBuZXdQb2ludCA9IGUubGF0bG5nO1xyXG4gICAgaWYgKHBvbHkuZ2VvbWV0cnkudHlwZSA9PT0gXCJNdWx0aVBvbHlnb25cIikge1xyXG4gICAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmluamVjdFBvaW50VG9Qb2x5Z29uKHBvbHksIFtcclxuICAgICAgICBuZXdQb2ludC5sbmcsXHJcbiAgICAgICAgbmV3UG9pbnQubGF0XHJcbiAgICAgIF0pO1xyXG4gICAgICB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24ocG9seSkpO1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihuZXdQb2x5Z29uLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGdldFBvbHlnb24obGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc29sZS5sb2coXCJnZXRQb2x5Z29uczogXCIsIGxhdGxuZ3MpO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IEwuR2VvSlNPTi5nZW9tZXRyeVRvTGF5ZXIobGF0bG5ncykgYXMgYW55O1xyXG5cclxuICAgIHBvbHlnb24uc2V0U3R5bGUodGhpcy5jb25maWcucG9seWdvbk9wdGlvbnMpO1xyXG4gICAgcmV0dXJuIHBvbHlnb247XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIG1lcmdlKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnNvbGUubG9nKFwibWVyZ2VcIiwgbGF0bG5ncyk7XHJcbiAgICBjb25zdCBwb2x5Z29uRmVhdHVyZSA9IFtdO1xyXG4gICAgY29uc3QgbmV3QXJyYXk6IEwuRmVhdHVyZUdyb3VwW10gPSBbXTtcclxuICAgIGxldCBwb2x5SW50ZXJzZWN0aW9uID0gZmFsc2U7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBmZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xyXG4gICAgICBjb25zb2xlLmxvZyhcIk1lcmdlcjogXCIsIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdKTtcclxuICAgICAgaWYgKGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcclxuICAgICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcclxuICAgICAgICAgIGlmIChwb2x5SW50ZXJzZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIG5ld0FycmF5LnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKFxyXG4gICAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF1cclxuICAgICAgICApO1xyXG4gICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcclxuICAgICAgICBpZiAocG9seUludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY29uc29sZS5sb2cobmV3QXJyYXkpO1xyXG4gICAgaWYgKG5ld0FycmF5Lmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy51bmlvblBvbHlnb25zKG5ld0FycmF5LCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXRsbmdzLCB0cnVlKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gbmV4dFxyXG4gIHByaXZhdGUgc3VidHJhY3QobGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgbGV0IGFkZEhvbGUgPSBsYXRsbmdzO1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXTtcclxuICAgICAgY29uc3QgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcclxuICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25EaWZmZXJlbmNlKGZlYXR1cmUsIGFkZEhvbGUpO1xyXG4gICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seSk7XHJcbiAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXApO1xyXG4gICAgICBhZGRIb2xlID0gbmV3UG9seWdvbjtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG5ld0xhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4gPSBhZGRIb2xlO1xyXG4gICAgY29uc3QgY29vcmRzID0gdGhpcy50dXJmSGVscGVyLmdldENvb3JkcyhuZXdMYXRsbmdzKTtcclxuICAgIGNvb3Jkcy5mb3JFYWNoKHZhbHVlID0+IHtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIodGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihbdmFsdWVdKSwgdHJ1ZSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZXZlbnRzKG9ub2ZmOiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBvbm9yb2ZmID0gb25vZmYgPyBcIm9uXCIgOiBcIm9mZlwiO1xyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZURvd24sIHRoaXMpO1xyXG4gIH1cclxuICAvLyBmaW5lLCBUT0RPOiBpZiBzcGVjaWFsIG1hcmtlcnNcclxuICBwcml2YXRlIGFkZE1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnN0IG1lbnVNYXJrZXJJZHggPSB0aGlzLmdldE1hcmtlckluZGV4KFxyXG4gICAgICBsYXRsbmdzLFxyXG4gICAgICB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnBvc2l0aW9uXHJcbiAgICApO1xyXG4gICAgY29uc3QgZGVsZXRlTWFya2VySWR4ID0gdGhpcy5nZXRNYXJrZXJJbmRleChcclxuICAgICAgbGF0bG5ncyxcclxuICAgICAgdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnBvc2l0aW9uXHJcbiAgICApO1xyXG5cclxuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XHJcbiAgICAgIGxldCBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VySWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIGlmIChpID09PSBtZW51TWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGkgPT09IGRlbGV0ZU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5NYXJrZXIobGF0bG5nLCB7XHJcbiAgICAgICAgaWNvbjogdGhpcy5jcmVhdGVEaXZJY29uKGljb25DbGFzc2VzKSxcclxuICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgdGl0bGU6IGkudG9TdHJpbmcoKVxyXG4gICAgICB9KTtcclxuICAgICAgRmVhdHVyZUdyb3VwLmFkZExheWVyKG1hcmtlcikuYWRkVG8odGhpcy5tYXApO1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkZlYXR1cmVHcm91cDogXCIsIEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIG1hcmtlci5vbihcImRyYWdcIiwgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBtYXJrZXIub24oXCJkcmFnZW5kXCIsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgaWYgKGkgPT09IG1lbnVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XHJcbiAgICAgICAgLy8gbWFya2VyLmJpbmRQb3B1cChcclxuICAgICAgICAvLyAgIHRoaXMuZ2V0SHRtbENvbnRlbnQoZSA9PiB7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBvblwiLCBlLnRhcmdldCk7XHJcbiAgICAgICAgLy8gICB9KVxyXG4gICAgICAgIC8vICk7XHJcbiAgICAgICAgbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNvbnZlcnRUb0JvdW5kc1BvbHlnb24obGF0bG5ncywgdHJ1ZSk7XHJcbiAgICAgICAgICAvLyB0aGlzLmNvbnZlcnRUb1NpbXBsaWZpZWRQb2x5Z29uKGxhdGxuZ3MpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09PSBkZWxldGVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkSG9sZU1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XHJcbiAgICAgIGNvbnN0IGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgLyogIGlmIChpID09PSAwICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vVE9ETy0gbGVnZyB0aWwgZmlsbCBpY29uXHJcbiAgICAgIGlmIChpID09PSBsYXRsbmdzLmxlbmd0aCAtIDEgJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH0gKi9cclxuICAgICAgY29uc3QgbWFya2VyID0gbmV3IEwuTWFya2VyKGxhdGxuZywge1xyXG4gICAgICAgIGljb246IHRoaXMuY3JlYXRlRGl2SWNvbihpY29uQ2xhc3NlcyksXHJcbiAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgIHRpdGxlOiBpLnRvU3RyaW5nKClcclxuICAgICAgfSk7XHJcbiAgICAgIEZlYXR1cmVHcm91cC5hZGRMYXllcihtYXJrZXIpLmFkZFRvKHRoaXMubWFwKTtcclxuXHJcbiAgICAgIG1hcmtlci5vbihcImRyYWdcIiwgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBtYXJrZXIub24oXCJkcmFnZW5kXCIsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgLyogICBpZiAoaSA9PT0gMCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuICAgICAgICBtYXJrZXIuYmluZFBvcHVwKHRoaXMuZ2V0SHRtbENvbnRlbnQoKGUpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBvblwiLCBlLnRhcmdldCk7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIC8vIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgIC8vICAgdGhpcy50b2dnbGVNYXJrZXJNZW51KCk7XHJcbiAgICAgICAgLy8gfSlcclxuICAgICAgfVxyXG4gICAgICBpZiAoaSA9PT0gbGF0bG5ncy5sZW5ndGggLSAxICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XHJcbiAgICAgICAgbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSAqL1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgY3JlYXRlRGl2SWNvbihjbGFzc05hbWVzOiBzdHJpbmdbXSk6IEwuRGl2SWNvbiB7XHJcbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcy5qb2luKFwiIFwiKTtcclxuICAgIGNvbnN0IGljb24gPSBMLmRpdkljb24oeyBjbGFzc05hbWU6IGNsYXNzZXMgfSk7XHJcbiAgICByZXR1cm4gaWNvbjtcclxuICB9XHJcbiAgLy8gVE9ETzogQ2xlYW51cFxyXG4gIHByaXZhdGUgbWFya2VyRHJhZyhGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICBjb25zdCBuZXdQb3MgPSBbXTtcclxuICAgIGxldCB0ZXN0YXJyYXkgPSBbXTtcclxuICAgIGxldCBob2xlID0gW107XHJcbiAgICBjb25zdCBsYXllckxlbmd0aCA9IEZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSBhcyBhbnk7XHJcbiAgICBjb25zdCBwb3NhcnJheXMgPSBsYXllckxlbmd0aFswXS5nZXRMYXRMbmdzKCk7XHJcbiAgICBjb25zb2xlLmxvZyhwb3NhcnJheXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJtYXJrZXJkcmFnOiBcIiwgbGF5ZXJMZW5ndGgpO1xyXG4gICAgbGV0IGxlbmd0aCA9IDA7XHJcbiAgICBpZiAocG9zYXJyYXlzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBvc2FycmF5cy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICB0ZXN0YXJyYXkgPSBbXTtcclxuICAgICAgICBob2xlID0gW107XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJQb3Npc2pvbmVyOiBcIiwgcG9zYXJyYXlzW2luZGV4XSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICBpZiAocG9zYXJyYXlzWzBdLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQb3Npc2pvbmVyIDI6IFwiLCBwb3NhcnJheXNbaW5kZXhdW2ldKTtcclxuXHJcbiAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1baV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVswXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkhvbGU6IFwiLCBob2xlKTtcclxuICAgICAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZW5ndGggKz0gcG9zYXJyYXlzW2luZGV4IC0gMV1bMF0ubGVuZ3RoO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJTVGFydCBpbmRleDogXCIsIGxlbmd0aCk7XHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoOyBqIDwgcG9zYXJyYXlzW2luZGV4XVswXS5sZW5ndGggKyBsZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICB0ZXN0YXJyYXkucHVzaCgobGF5ZXJMZW5ndGhbaiArIDFdIGFzIGFueSkuZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICBuZXdQb3MucHVzaChob2xlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHRlc3RhcnJheSA9IFtdXHJcbiAgICAgIGhvbGUgPSBbXTtcclxuICAgICAgbGV0IGxlbmd0aDIgPSAwO1xyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHRlc3RhcnJheSA9IFtdO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiUG9seWdvbiBkcmFnOiBcIiwgcG9zYXJyYXlzWzBdW2luZGV4XSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICBpZiAocG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdWzBdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZW5ndGgyICs9IHBvc2FycmF5c1swXVtpbmRleCAtIDFdLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoMjsgaiA8IHBvc2FycmF5c1swXVtpbmRleF0ubGVuZ3RoICsgbGVuZ3RoMjsgaisrKSB7XHJcbiAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICB9XHJcbiAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkhvbGUgMjogXCIsIGhvbGUpO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJOeWUgcG9zaXNqb25lcjogXCIsIG5ld1Bvcyk7XHJcbiAgICBsYXllckxlbmd0aFswXS5zZXRMYXRMbmdzKG5ld1Bvcyk7XHJcbiAgfVxyXG4gIC8vIGNoZWNrIHRoaXNcclxuICBwcml2YXRlIG1hcmtlckRyYWdFbmQoRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBGZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xyXG4gICAgY29uc29sZS5sb2coXHJcbiAgICAgIFwiTWFya2VyZHJhZ2VuZCBwb2x5Z29uOiBcIixcclxuICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXNcclxuICAgICk7XHJcbiAgICBpZiAoZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFtlbGVtZW50XSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiTWFya2VyZHJhZ2VuZDogXCIsIGZlYXR1cmUpO1xyXG4gICAgICAgIGlmICh0aGlzLnR1cmZIZWxwZXIuaGFzS2lua3MoZmVhdHVyZSkpIHtcclxuICAgICAgICAgIHRoaXMua2lua3MgPSB0cnVlO1xyXG4gICAgICAgICAgY29uc3QgdW5raW5rID0gdGhpcy50dXJmSGVscGVyLmdldEtpbmtzKGZlYXR1cmUpO1xyXG4gICAgICAgICAgLy8gdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGZlYXR1cmUpKTtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlVua2luazogXCIsIHVua2luayk7XHJcbiAgICAgICAgICB1bmtpbmsuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKFxyXG4gICAgICAgICAgICAgIHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihwb2x5Z29uKSxcclxuICAgICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5raW5rcyA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKGZlYXR1cmUsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXHJcbiAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXNcclxuICAgICAgKTtcclxuICAgICAgY29uc29sZS5sb2coXCJNYXJrZXJkcmFnZW5kOiBcIiwgZmVhdHVyZSk7XHJcbiAgICAgIGlmICh0aGlzLnR1cmZIZWxwZXIuaGFzS2lua3MoZmVhdHVyZSkpIHtcclxuICAgICAgICB0aGlzLmtpbmtzID0gdHJ1ZTtcclxuICAgICAgICBjb25zdCB1bmtpbmsgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0S2lua3MoZmVhdHVyZSk7XHJcbiAgICAgICAgLy8gdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGZlYXR1cmUpKTtcclxuICAgICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChGZWF0dXJlR3JvdXApO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiVW5raW5rOiBcIiwgdW5raW5rKTtcclxuICAgICAgICB1bmtpbmsuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgIHRoaXMuYWRkUG9seWdvbih0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24ocG9seWdvbiksIGZhbHNlLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgIHRoaXMua2lua3MgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmFkZFBvbHlnb24oZmVhdHVyZSwgZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKFxyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzXHJcbiAgICApO1xyXG4gIH1cclxuICAvLyBmaW5lLCBjaGVjayB0aGUgcmV0dXJuZWQgdHlwZVxyXG4gIHByaXZhdGUgZ2V0TGF0TG5nc0Zyb21Kc29uKFxyXG4gICAgZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICk6IElMYXRMbmdbXVtdIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZ2V0TGF0TG5nc0Zyb21Kc29uOiBcIiwgZmVhdHVyZSk7XHJcbiAgICBsZXQgY29vcmQ7XHJcbiAgICBpZiAoZmVhdHVyZSkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggPiAxICYmXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS50eXBlID09PSBcIk11bHRpUG9seWdvblwiXHJcbiAgICAgICkge1xyXG4gICAgICAgIGNvb3JkID0gTC5HZW9KU09OLmNvb3Jkc1RvTGF0TG5ncyhmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdWzBdKTtcclxuICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdLmxlbmd0aCA+IDEgJiZcclxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT09IFwiUG9seWdvblwiXHJcbiAgICAgICkge1xyXG4gICAgICAgIGNvb3JkID0gTC5HZW9KU09OLmNvb3Jkc1RvTGF0TG5ncyhmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29vcmQ7XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSB1bmlvblBvbHlnb25zKFxyXG4gICAgbGF5ZXJzLFxyXG4gICAgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIHBvbHlnb25GZWF0dXJlXHJcbiAgKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInVuaW9uUG9seWdvbnNcIiwgbGF5ZXJzLCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XHJcblxyXG4gICAgbGV0IGFkZE5ldyA9IGxhdGxuZ3M7XHJcbiAgICBsYXllcnMuZm9yRWFjaCgoZmVhdHVyZUdyb3VwLCBpKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpO1xyXG4gICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdO1xyXG4gICAgICBjb25zdCBwb2x5ID0gdGhpcy5nZXRMYXRMbmdzRnJvbUpzb24obGF5ZXIpO1xyXG4gICAgICBjb25zdCB1bmlvbiA9IHRoaXMudHVyZkhlbHBlci51bmlvbihhZGROZXcsIHBvbHlnb25GZWF0dXJlW2ldKTsgLy8gQ2hlY2sgZm9yIG11bHRpcG9seWdvbnNcclxuICAgICAgLy8gTmVlZHMgYSBjbGVhbnVwIGZvciB0aGUgbmV3IHZlcnNpb25cclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uT25NZXJnZShwb2x5KTtcclxuICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICAgIGFkZE5ldyA9IHVuaW9uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbmV3TGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiA9IGFkZE5ldzsgLy8gVHJlbmdlciBrYW5za2plIHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbiggYWRkTmV3KTtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld0xhdGxuZ3MsIHRydWUpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgY29uc29sZS5sb2coXCJyZW1vdmVGZWF0dXJlR3JvdXBcIiwgZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICBmZWF0dXJlR3JvdXAuY2xlYXJMYXllcnMoKTtcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMgPSB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZpbHRlcihcclxuICAgICAgZmVhdHVyZUdyb3VwcyA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXBcclxuICAgICk7XHJcbiAgICAvLyB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xyXG4gIH1cclxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZVwiLCBmZWF0dXJlR3JvdXApO1xyXG5cclxuICAgIGNvbnN0IG5ld0FycmF5ID0gW107XHJcbiAgICBpZiAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdKSB7XHJcbiAgICAgIGNvbnN0IHBvbHlnb24gPSAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueSkuZ2V0TGF0TG5ncygpWzBdO1xyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2godiA9PiB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgdi5wb2x5Z29uLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF0udG9TdHJpbmcoKSAmJlxyXG4gICAgICAgICAgdi5wb2x5Z29uWzBdLnRvU3RyaW5nKCkgPT09IHBvbHlnb25bMF1bMF0udG9TdHJpbmcoKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgdi5wb2x5Z29uID0gcG9seWdvbjtcclxuICAgICAgICAgIG5ld0FycmF5LnB1c2godik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICB2LnBvbHlnb24udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXS50b1N0cmluZygpICYmXHJcbiAgICAgICAgICB2LnBvbHlnb25bMF0udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXVswXS50b1N0cmluZygpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBuZXdBcnJheS5wdXNoKHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIGZlYXR1cmVHcm91cC5jbGVhckxheWVycygpO1xyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5maWx0ZXIoXHJcbiAgICAgICAgZmVhdHVyZUdyb3VwcyA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXBcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKGZlYXR1cmVHcm91cCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmUgdW50aWwgcmVmYWN0b3JpbmdcclxuICBwcml2YXRlIGRlbGV0ZVBvbHlnb25Pbk1lcmdlKHBvbHlnb24pIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZGVsZXRlUG9seWdvbk9uTWVyZ2VcIiwgcG9seWdvbik7XHJcbiAgICBsZXQgcG9seWdvbjIgPSBbXTtcclxuICAgIGlmICh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55O1xyXG4gICAgICAgIGNvbnN0IGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKClbMF07XHJcbiAgICAgICAgcG9seWdvbjIgPSBbLi4ubGF0bG5nc1swXV07XHJcbiAgICAgICAgaWYgKGxhdGxuZ3NbMF1bMF0gIT09IGxhdGxuZ3NbMF1bbGF0bG5nc1swXS5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgcG9seWdvbjIucHVzaChsYXRsbmdzWzBdWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZXF1YWxzID0gdGhpcy5wb2x5Z29uQXJyYXlFcXVhbHNNZXJnZShwb2x5Z29uMiwgcG9seWdvbik7XHJcblxyXG4gICAgICAgIGlmIChlcXVhbHMpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVFVQUxTXCIsIHBvbHlnb24pO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seWdvbik7XHJcbiAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuICAgICAgICAgIC8vIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFsc01lcmdlKHBvbHkxOiBhbnlbXSwgcG9seTI6IGFueVtdKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gcG9seTEudG9TdHJpbmcoKSA9PT0gcG9seTIudG9TdHJpbmcoKTtcclxuICB9XHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFscyhwb2x5MTogYW55W10sIHBvbHkyOiBhbnlbXSk6IGJvb2xlYW4ge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJwb2x5Z29uQXJyYXlFcXVhbHNcIiwgcG9seTEsIHBvbHkyKTtcclxuXHJcbiAgICBpZiAocG9seTFbMF1bMF0pIHtcclxuICAgICAgaWYgKCFwb2x5MVswXVswXS5lcXVhbHMocG9seTJbMF1bMF0pKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoIXBvbHkxWzBdLmVxdWFscyhwb2x5MlswXSkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChwb2x5MS5sZW5ndGggIT09IHBvbHkyLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc2V0TGVhZmxldE1hcEV2ZW50cyhcclxuICAgIGVuYWJsZURyYWdnaW5nOiBib29sZWFuLFxyXG4gICAgZW5hYmxlRG91YmxlQ2xpY2tab29tOiBib29sZWFuLFxyXG4gICAgZW5hYmxlU2Nyb2xsV2hlZWxab29tOiBib29sZWFuXHJcbiAgKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInNldExlYWZsZXRNYXBFdmVudHNcIiwgZW5hYmxlRHJhZ2dpbmcsIGVuYWJsZURvdWJsZUNsaWNrWm9vbSwgZW5hYmxlU2Nyb2xsV2hlZWxab29tKTtcclxuXHJcbiAgICBlbmFibGVEcmFnZ2luZyA/IHRoaXMubWFwLmRyYWdnaW5nLmVuYWJsZSgpIDogdGhpcy5tYXAuZHJhZ2dpbmcuZGlzYWJsZSgpO1xyXG4gICAgZW5hYmxlRG91YmxlQ2xpY2tab29tXHJcbiAgICAgID8gdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmVuYWJsZSgpXHJcbiAgICAgIDogdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmRpc2FibGUoKTtcclxuICAgIGVuYWJsZVNjcm9sbFdoZWVsWm9vbVxyXG4gICAgICA/IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5lbmFibGUoKVxyXG4gICAgICA6IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBzZXREcmF3TW9kZShtb2RlOiBEcmF3TW9kZSkge1xyXG4gICAgY29uc29sZS5sb2coXCJzZXREcmF3TW9kZVwiLCB0aGlzLm1hcCk7XHJcbiAgICB0aGlzLmRyYXdNb2RlU3ViamVjdC5uZXh0KG1vZGUpO1xyXG4gICAgaWYgKCEhdGhpcy5tYXApIHtcclxuICAgICAgbGV0IGlzQWN0aXZlRHJhd01vZGUgPSB0cnVlO1xyXG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICBjYXNlIERyYXdNb2RlLk9mZjpcclxuICAgICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhcclxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXHJcbiAgICAgICAgICAgIFwiY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkXCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50cyhmYWxzZSk7XHJcbiAgICAgICAgICB0aGlzLnN0b3BEcmF3KCk7XHJcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XHJcbiAgICAgICAgICAgIGNvbG9yOiBcIlwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyh0cnVlLCB0cnVlLCB0cnVlKTtcclxuICAgICAgICAgIGlzQWN0aXZlRHJhd01vZGUgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuQWRkOlxyXG4gICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKFxyXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcclxuICAgICAgICAgICAgXCJjcm9zc2hhaXItY3Vyc29yLWVuYWJsZWRcIlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKHRydWUpO1xyXG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xyXG4gICAgICAgICAgICBjb2xvcjogZGVmYXVsdENvbmZpZy5wb2x5TGluZU9wdGlvbnMuY29sb3JcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5zZXRMZWFmbGV0TWFwRXZlbnRzKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdDpcclxuICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhcclxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXHJcbiAgICAgICAgICAgIFwiY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkXCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50cyh0cnVlKTtcclxuICAgICAgICAgIHRoaXMudHJhY2VyLnNldFN0eWxlKHtcclxuICAgICAgICAgICAgY29sb3I6IFwiI0Q5NDYwRlwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyhmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaXNBY3RpdmVEcmF3TW9kZSkge1xyXG4gICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldEZyZWVEcmF3TW9kZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIG1vZGVDaGFuZ2UobW9kZTogRHJhd01vZGUpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUobW9kZSk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcclxuICBkcmF3TW9kZUNsaWNrKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25EcmF3U3RhdGVzLmlzRnJlZURyYXdNb2RlKSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XHJcbiAgICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldEZyZWVEcmF3TW9kZSgpO1xyXG4gICAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLkFkZCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcclxuICBmcmVlZHJhd01lbnVDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuQWRkKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXHJcbiAgc3VidHJhY3RDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuU3VidHJhY3QpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSByZXNldFRyYWNrZXIoKSB7XHJcbiAgICB0aGlzLnRyYWNlci5zZXRMYXRMbmdzKFtbMCwgMF1dKTtcclxuICB9XHJcblxyXG4gIHRvZ2dsZU1hcmtlck1lbnUoKTogdm9pZCB7XHJcbiAgICBhbGVydChcIm9wZW4gbWVudVwiKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBnZXRIdG1sQ29udGVudChjYWxsQmFjazogRnVuY3Rpb24pOiBIVE1MRWxlbWVudCB7XHJcbiAgICBjb25zdCBjb21wID0gdGhpcy5wb3B1cEdlbmVyYXRvci5nZW5lcmF0ZUFsdGVyUG9wdXAoKTtcclxuICAgIGNvbXAuaW5zdGFuY2UuYmJveENsaWNrZWQuc3Vic2NyaWJlKGUgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZyhcImJib3ggY2xpY2tlZFwiLCBlKTtcclxuICAgICAgY2FsbEJhY2soZSk7XHJcbiAgICB9KTtcclxuICAgIGNvbXAuaW5zdGFuY2Uuc2ltcGx5ZmlDbGlja2VkLnN1YnNjcmliZShlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coXCJzaW1wbHlmaSBjbGlja2VkXCIsIGUpO1xyXG4gICAgICBjYWxsQmFjayhlKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvbXAubG9jYXRpb24ubmF0aXZlRWxlbWVudDtcclxuICB9XHJcbiAgcHJpdmF0ZSBjb252ZXJ0VG9Cb3VuZHNQb2x5Z29uKFxyXG4gICAgbGF0bG5nczogSUxhdExuZ1tdLFxyXG4gICAgYWRkTWlkcG9pbnRNYXJrZXJzOiBib29sZWFuID0gZmFsc2VcclxuICApIHtcclxuICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXHJcbiAgICAgIHRoaXMuY29udmVydFRvQ29vcmRzKFtsYXRsbmdzXSlcclxuICAgICk7XHJcbiAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihcclxuICAgICAgcG9seWdvbixcclxuICAgICAgYWRkTWlkcG9pbnRNYXJrZXJzXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihuZXdQb2x5Z29uKSwgZmFsc2UpO1xyXG4gIH1cclxuICBwcml2YXRlIGNvbnZlcnRUb1NpbXBsaWZpZWRQb2x5Z29uKGxhdGxuZ3M6IElMYXRMbmdbXSkge1xyXG4gICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XHJcbiAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihcclxuICAgICAgdGhpcy5jb252ZXJ0VG9Db29yZHMoW2xhdGxuZ3NdKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihuZXdQb2x5Z29uKSwgdHJ1ZSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0TWFya2VySW5kZXgobGF0bG5nczogSUxhdExuZ1tdLCBwb3NpdGlvbjogTWFya2VyUG9zaXRpb24pOiBudW1iZXIge1xyXG4gICAgY29uc3QgYm91bmRzOiBMLkxhdExuZ0JvdW5kcyA9IFBvbHlEcmF3VXRpbC5nZXRCb3VuZHMoXHJcbiAgICAgIGxhdGxuZ3MsXHJcbiAgICAgIE1hdGguc3FydCgyKSAvIDJcclxuICAgICk7XHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MoXHJcbiAgICAgIGJvdW5kcy5nZXRTb3V0aCgpLFxyXG4gICAgICBib3VuZHMuZ2V0V2VzdCgpLFxyXG4gICAgICBib3VuZHMuZ2V0Tm9ydGgoKSxcclxuICAgICAgYm91bmRzLmdldEVhc3QoKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGNvbXBhc3NEaXJlY3Rpb24gPSBjb21wYXNzLmdldERpcmVjdGlvbihwb3NpdGlvbik7XHJcbiAgICBjb25zdCBsYXRMbmdQb2ludDogSUxhdExuZyA9IHtcclxuICAgICAgbGF0OiBjb21wYXNzRGlyZWN0aW9uLmxhdCxcclxuICAgICAgbG5nOiBjb21wYXNzRGlyZWN0aW9uLmxuZ1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHRhcmdldFBvaW50ID0gdGhpcy50dXJmSGVscGVyLmdldENvb3JkKGxhdExuZ1BvaW50KTtcclxuICAgIGNvbnN0IGZjID0gdGhpcy50dXJmSGVscGVyLmdldEZlYXR1cmVQb2ludENvbGxlY3Rpb24obGF0bG5ncyk7XHJcbiAgICBjb25zdCBuZWFyZXN0UG9pbnRJZHggPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TmVhcmVzdFBvaW50SW5kZXgoXHJcbiAgICAgIHRhcmdldFBvaW50LFxyXG4gICAgICBmYyBhcyBhbnlcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIG5lYXJlc3RQb2ludElkeDtcclxuICB9XHJcbn1cclxuIl19