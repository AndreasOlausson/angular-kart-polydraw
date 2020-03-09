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
// Rename - PolyDrawService
export class PolyDrawService {
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
        if (polygon.length > 1) {
            polygon.length = 1;
        }
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(featureGroup => {
                const layer = featureGroup.getLayers()[0];
                const latlngs = layer.getLatLngs();
                const length = latlngs.length;
                //  = []
                console.log(latlngs);
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
        geographicBorders.forEach(group => {
            const featureGroup = new L.FeatureGroup();
            const polygon2 = this.turfHelper.getMultiPolygon(this.convertToCoords(group));
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
        });
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
        this.polygonInformation.activate();
        this.polygonInformation.setMoveMode();
        console.log(this.polygonInformation.polygonInformationStorage);
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
        console.log("Map init: ", this.map);
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
                let testCoord = [];
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
}
PolyDrawService.ɵfac = function PolyDrawService_Factory(t) { return new (t || PolyDrawService)(i0.ɵɵinject(i1.PolyStateService), i0.ɵɵinject(i2.ComponentGeneraterService), i0.ɵɵinject(i3.TurfHelperService), i0.ɵɵinject(i4.PolygonInformationService), i0.ɵɵinject(i5.LeafletHelperService)); };
PolyDrawService.ɵprov = i0.ɵɵdefineInjectable({ token: PolyDrawService, factory: PolyDrawService.ɵfac, providedIn: "root" });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(PolyDrawService, [{
        type: Injectable,
        args: [{
                providedIn: "root"
            }]
    }], function () { return [{ type: i1.PolyStateService }, { type: i2.ComponentGeneraterService }, { type: i3.TurfHelperService }, { type: i4.PolygonInformationService }, { type: i5.LeafletHelperService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9wb2x5ZHJhdy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQVksTUFBTSxlQUFlLENBQUM7QUFDckQsT0FBTyxLQUFLLENBQUMsTUFBTSxTQUFTLENBQUM7QUFDN0Isc0NBQXNDO0FBQ3RDLE9BQU8sRUFBYyxlQUFlLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzVELE9BQU8sRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWpFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBRTVDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2hELE9BQU8sRUFBa0IsUUFBUSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ25ELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDOzs7Ozs7O0FBS2hFLDJCQUEyQjtBQUMzQixNQUFNLE9BQU8sZUFBZTtJQW9CMUIsWUFDVSxRQUEwQixFQUMxQixjQUF5QyxFQUN6QyxVQUE2QixFQUM3QixrQkFBNkMsRUFDN0MsYUFBbUM7UUFKbkMsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7UUFDMUIsbUJBQWMsR0FBZCxjQUFjLENBQTJCO1FBQ3pDLGVBQVUsR0FBVixVQUFVLENBQW1CO1FBQzdCLHVCQUFrQixHQUFsQixrQkFBa0Is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QzlELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQzFELFdBQVcsRUFDWCxFQUFTLENBQ1YsQ0FBQztRQUVGLE9BQU8sZUFBZSxDQUFDO0lBQ3pCLENBQUM7OzhFQXpnQ1UsZUFBZTt1REFBZixlQUFlLFdBQWYsZUFBZSxtQkFIZCxNQUFNO2tEQUdQLGVBQWU7Y0FKM0IsVUFBVTtlQUFDO2dCQUNWLFVBQVUsRUFBRSxNQUFNO2FBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgT3B0aW9uYWwgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCI7XHJcbi8vIGltcG9ydCAqIGFzIHR1cmYgZnJvbSBcIkB0dXJmL3R1cmZcIjtcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgQmVoYXZpb3JTdWJqZWN0LCBTdWJqZWN0IH0gZnJvbSBcInJ4anNcIjtcclxuaW1wb3J0IHsgZmlsdGVyLCBkZWJvdW5jZVRpbWUsIHRha2VVbnRpbCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xyXG5pbXBvcnQgeyBGZWF0dXJlLCBQb2x5Z29uLCBNdWx0aVBvbHlnb24gfSBmcm9tIFwiQHR1cmYvdHVyZlwiO1xyXG5pbXBvcnQgeyBQb2x5U3RhdGVTZXJ2aWNlIH0gZnJvbSBcIi4vbWFwLXN0YXRlLnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgVHVyZkhlbHBlclNlcnZpY2UgfSBmcm9tIFwiLi90dXJmLWhlbHBlci5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IFBvbHlnb25JbmZvcm1hdGlvblNlcnZpY2UgfSBmcm9tIFwiLi9wb2x5Z29uLWluZm9ybWF0aW9uLnNlcnZpY2VcIjtcclxuaW1wb3J0IGRlZmF1bHRDb25maWcgZnJvbSBcIi4vcG9seWluZm8uanNvblwiO1xyXG5pbXBvcnQgeyBJTGF0TG5nLCBQb2x5Z29uRHJhd1N0YXRlcyB9IGZyb20gXCIuL3BvbHlnb24taGVscGVyc1wiO1xyXG5pbXBvcnQgeyBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlIH0gZnJvbSBcIi4vY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IENvbXBhc3MsIFBvbHlEcmF3VXRpbCB9IGZyb20gXCIuL3V0aWxzXCI7XHJcbmltcG9ydCB7IE1hcmtlclBvc2l0aW9uLCBEcmF3TW9kZSB9IGZyb20gXCIuL2VudW1zXCI7XHJcbmltcG9ydCB7IExlYWZsZXRIZWxwZXJTZXJ2aWNlIH0gZnJvbSBcIi4vbGVhZmxldC1oZWxwZXIuc2VydmljZVwiO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46IFwicm9vdFwiXHJcbn0pXHJcbi8vIFJlbmFtZSAtIFBvbHlEcmF3U2VydmljZVxyXG5leHBvcnQgY2xhc3MgUG9seURyYXdTZXJ2aWNlIHtcclxuICAvLyBEcmF3TW9kZXMsIGRldGVybWluZSBVSSBidXR0b25zIGV0Yy4uLlxyXG4gIGRyYXdNb2RlU3ViamVjdDogQmVoYXZpb3JTdWJqZWN0PERyYXdNb2RlPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8RHJhd01vZGU+KFxyXG4gICAgRHJhd01vZGUuT2ZmXHJcbiAgKTtcclxuICBkcmF3TW9kZSQ6IE9ic2VydmFibGU8RHJhd01vZGU+ID0gdGhpcy5kcmF3TW9kZVN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWluaW11bUZyZWVEcmF3Wm9vbUxldmVsOiBudW1iZXIgPSAxMjtcclxuICBwcml2YXRlIG1hcDogTC5NYXA7XHJcblxyXG4gIHByaXZhdGUgbWVyZ2VQb2x5Z29uczogYm9vbGVhbjtcclxuICBwcml2YXRlIGtpbmtzOiBib29sZWFuO1xyXG4gIC8vIGFkZCB0byBjb25maWdcclxuICBwcml2YXRlIGFycmF5T2ZGZWF0dXJlR3JvdXBzOiBMLkZlYXR1cmVHcm91cDxMLkxheWVyPltdID0gW107XHJcbiAgcHJpdmF0ZSB0cmFjZXI6IEwuUG9seWxpbmUgPSB7fSBhcyBhbnk7XHJcbiAgLy8gZW5kIGFkZCB0byBjb25maWdcclxuXHJcbiAgcHJpdmF0ZSBuZ1Vuc3Vic2NyaWJlID0gbmV3IFN1YmplY3QoKTtcclxuICBwcml2YXRlIGNvbmZpZzogdHlwZW9mIGRlZmF1bHRDb25maWcgPSBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgbWFwU3RhdGU6IFBvbHlTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBvcHVwR2VuZXJhdG9yOiBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0dXJmSGVscGVyOiBUdXJmSGVscGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgcG9seWdvbkluZm9ybWF0aW9uOiBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsZWFmbGV0SGVscGVyOiBMZWFmbGV0SGVscGVyU2VydmljZVxyXG4gICkge1xyXG4gICAgdGhpcy5tYXBTdGF0ZS5tYXAkLnBpcGUoZmlsdGVyKG0gPT4gbSAhPT0gbnVsbCkpLnN1YnNjcmliZSgobWFwOiBMLk1hcCkgPT4ge1xyXG4gICAgICB0aGlzLm1hcCA9IG1hcDtcclxuICAgICAgY29uc29sZS5sb2coXCJLYXJ0ZXQgaSBwb2x5ZHJhdzogXCIsIHRoaXMubWFwKTtcclxuICAgICAgY29uc29sZS5sb2coXCJwcmUgdGhpcy5jb25maWdcIiwgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLmNvbmZpZyA9IGRlZmF1bHRDb25maWc7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwidGhpcy5jb25maWdcIiwgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLmNvbmZpZ3VyYXRlKHt9KTtcclxuICAgICAgY29uc29sZS5sb2coXCJhZnRlciB0aGlzLmNvbmZpZ1wiLCB0aGlzLmNvbmZpZyk7XHJcbiAgICAgIHRoaXMudHJhY2VyID0gTC5wb2x5bGluZShbWzAsIDBdXSwgdGhpcy5jb25maWcucG9seUxpbmVPcHRpb25zKTtcclxuICAgICAgY29uc29sZS5sb2coXCJUcmFjZXIgcGlwZTogXCIsIHRoaXMudHJhY2VyKTtcclxuICAgICAgdGhpcy5pbml0UG9seURyYXcoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMubWFwU3RhdGUubWFwWm9vbUxldmVsJFxyXG4gICAgICAucGlwZShkZWJvdW5jZVRpbWUoMTAwKSwgdGFrZVVudGlsKHRoaXMubmdVbnN1YnNjcmliZSkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKHpvb206IG51bWJlcikgPT4ge1xyXG4gICAgICAgIHRoaXMub25ab29tQ2hhbmdlKHpvb20pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb24kLnN1YnNjcmliZShrID0+IHtcclxuICAgICAgY29uc29sZS5sb2coXCJQb2x5SW5mbyBzdGFydDogXCIsIGspO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVE9ETyAtIGxhZ2UgZW4gY29uZmlnIG9ic2VydmFibGUgaSBtYXBTdGF0ZSBvZyBvcHBkYXRlciB0aGlzLmNvbmZpZyBtZWQgZGVuXHJcbiAgfVxyXG4gIC8vIG5ld1xyXG4gIGNvbmZpZ3VyYXRlKGNvbmZpZzogT2JqZWN0KTogdm9pZCB7XHJcbiAgICAvLyBUT0RPIGlmIGNvbmZpZyBpcyBwYXRoLi4uXHJcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4uZGVmYXVsdENvbmZpZywgLi4uY29uZmlnIH07XHJcblxyXG4gICAgdGhpcy5tZXJnZVBvbHlnb25zID0gdGhpcy5jb25maWcubWVyZ2VQb2x5Z29ucztcclxuICAgIHRoaXMua2lua3MgPSB0aGlzLmNvbmZpZy5raW5rcztcclxuICB9XHJcblxyXG4gIC8vIGZpbmVcclxuICBjbG9zZUFuZFJlc2V0KCk6IHZvaWQge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJjbG9zZUFuZFJlc2V0XCIpO1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xyXG4gICAgdGhpcy5yZW1vdmVBbGxGZWF0dXJlR3JvdXBzKCk7XHJcbiAgfVxyXG5cclxuICAvLyBtYWtlIHJlYWRhYmxlXHJcbiAgZGVsZXRlUG9seWdvbihwb2x5Z29uOiBJTGF0TG5nW11bXSkge1xyXG4gICAgY29uc29sZS5sb2coXCJkZWxldGVQb2x5Z29uOiBcIiwgcG9seWdvbik7XHJcbiAgICBpZihwb2x5Z29uLmxlbmd0aCA+IDEpIHtcclxuICAgICAgcG9seWdvbi5sZW5ndGggPSAxO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSBhcyBhbnk7XHJcbiAgICAgICAgY29uc3QgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKTtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBsYXRsbmdzLmxlbmd0aDtcclxuICAgICAgICAvLyAgPSBbXVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGxhdGxuZ3MpO1xyXG4gICAgICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgbGV0IHBvbHlnb24zO1xyXG4gICAgICAgICAgY29uc3QgdGVzdCA9IFsuLi5sYXRsbmddO1xyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKGxhdGxuZyk7XHJcbiAgICAgICAgICBpZiAobGF0bG5nLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXVswXSAhPT0gbGF0bG5nWzBdW2xhdGxuZ1swXS5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICAgIHRlc3RbMF0ucHVzaChsYXRsbmdbMF1bMF0pO1xyXG4gICAgICAgICAgICAgIH0gXHJcblxyXG4gICAgICAgICAgICBwb2x5Z29uMyA9IFt0ZXN0WzBdXTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChsYXRsbmdbMF0gIT09IGxhdGxuZ1tsYXRsbmcubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgICAgICB0ZXN0LnB1c2gobGF0bG5nWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwb2x5Z29uMyA9IHRlc3Q7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJUZXN0OiBcIiwgcG9seWdvbjMpO1xyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKHBvbHlnb24pO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGVxdWFscyA9IHRoaXMucG9seWdvbkFycmF5RXF1YWxzKHBvbHlnb24zLCBwb2x5Z29uKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXF1YWxzOiBcIiwgZXF1YWxzLCBcIiBsZW5ndGg6IFwiLCBsZW5ndGgpO1xyXG4gICAgICAgICAgaWYgKGVxdWFscyAmJiBsZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlVHJhc2hjYW4ocG9seWdvbik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKCkpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChlcXVhbHMgJiYgbGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaENhbk9uTXVsdGkoW3BvbHlnb25dKTtcclxuICAgICAgICAgICAgbGF0bG5ncy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICBsYXllci5zZXRMYXRMbmdzKGxhdGxuZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXllci50b0dlb0pTT04oKSwgZmFsc2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHJlbW92ZUFsbEZlYXR1cmVHcm91cHMoKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInJlbW92ZUFsbEZlYXR1cmVHcm91cHNcIiwgbnVsbCk7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwcyA9PiB7XHJcbiAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKGZlYXR1cmVHcm91cHMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3VwcyA9IFtdO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucmVzZXQoKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBnZXREcmF3TW9kZSgpOiBEcmF3TW9kZSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImdldERyYXdNb2RlXCIsIG51bGwpO1xyXG4gICAgcmV0dXJuIHRoaXMuZHJhd01vZGVTdWJqZWN0LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgYWRkVmlrZW4ocG9seWdvbikge1xyXG4gICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIocG9seWdvbiwgdHJ1ZSk7XHJcbiAgfVxyXG5cclxuICAvLyBjaGVjayB0aGlzXHJcbiAgYWRkQXV0b1BvbHlnb24oZ2VvZ3JhcGhpY0JvcmRlcnM6IEwuTGF0TG5nW11bXVtdKTogdm9pZCB7XHJcbiAgICBnZW9ncmFwaGljQm9yZGVycy5mb3JFYWNoKGdyb3VwID0+IHtcclxuICAgIGNvbnN0IGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXAgPSBuZXcgTC5GZWF0dXJlR3JvdXAoKTtcclxuXHJcbiAgICBjb25zdCBwb2x5Z29uMiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXHJcbiAgICAgIHRoaXMuY29udmVydFRvQ29vcmRzKGdyb3VwKVxyXG4gICAgKTtcclxuICAgIGNvbnNvbGUubG9nKHBvbHlnb24yKTtcclxuICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLmdldFBvbHlnb24ocG9seWdvbjIpO1xyXG5cclxuICAgIGZlYXR1cmVHcm91cC5hZGRMYXllcihwb2x5Z29uKTtcclxuICAgIGNvbnN0IG1hcmtlckxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcclxuICAgIGNvbnNvbGUubG9nKFwibWFya2VyczogXCIsIG1hcmtlckxhdGxuZ3MpO1xyXG4gICAgbWFya2VyTGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICBwb2x5Z29uLmZvckVhY2goKHBvbHlFbGVtZW50LCBpKSA9PiB7XHJcbiAgICAgICAgaWYgKGkgPT09IDApIHtcclxuICAgICAgICAgIHRoaXMuYWRkTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmFkZEhvbGVNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkh1bGw6IFwiLCBwb2x5RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgLy8gdGhpcy5hZGRNYXJrZXIocG9seWdvblswXSwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgLy8gVE9ETyAtIEh2aXMgcG9seWdvbi5sZW5ndGggPjEsIHPDpSBoYXIgZGVuIGh1bGw6IGVnZW4gYWRkTWFya2VyIGZ1bmtzam9uXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgIFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKFxyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzXHJcbiAgICApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uYWN0aXZhdGUoKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcclxuICB9XHJcblxyXG4gIC8vIGlubmVow6VsbCBpIGlmJ2FyIGZseXR0YSB0aWxsIGVnbmEgbWV0b2RlclxyXG4gIHByaXZhdGUgY29udmVydFRvQ29vcmRzKGxhdGxuZ3M6IElMYXRMbmdbXVtdKSB7XHJcbiAgICBjb25zdCBjb29yZHMgPSBbXTtcclxuICAgIGNvbnNvbGUubG9nKGxhdGxuZ3MubGVuZ3RoLCBsYXRsbmdzKTtcclxuICAgIGlmIChsYXRsbmdzLmxlbmd0aCA+IDEgJiYgbGF0bG5ncy5sZW5ndGggPCAzKSB7XHJcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdKSxcclxuICAgICAgICBsYXRsbmdzW2xhdGxuZ3MubGVuZ3RoIC0gMV0ubGVuZ3RoXHJcbiAgICAgICk7XHJcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbWF4LWxpbmUtbGVuZ3RoXHJcbiAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihcclxuICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSksXHJcbiAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKVxyXG4gICAgICApO1xyXG4gICAgICBpZiAod2l0aGluKSB7XHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgY29vcmRpbmF0ZXMucHVzaChMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHBvbHlnb24pKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPj0gMSkge1xyXG4gICAgICAgIGNvb3Jkcy5wdXNoKGNvb3JkaW5hdGVzKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZyhcIldpdGhpbjEgXCIsIHdpdGhpbik7XHJcbiAgICB9IGVsc2UgaWYgKGxhdGxuZ3MubGVuZ3RoID4gMikge1xyXG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IFtdO1xyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDE7IGluZGV4IDwgbGF0bG5ncy5sZW5ndGggLSAxOyBpbmRleCsrKSB7XHJcbiAgICAgICAgY29uc3Qgd2l0aGluID0gdGhpcy50dXJmSGVscGVyLmlzV2l0aGluKFxyXG4gICAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzW2luZGV4XSksXHJcbiAgICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbMF0pXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAod2l0aGluKSB7XHJcbiAgICAgICAgICBsYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzLnB1c2goTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGNvb3Jkcy5wdXNoKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKV0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKV0pO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coY29vcmRzKTtcclxuICAgIHJldHVybiBjb29yZHM7XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBpbml0UG9seURyYXcoKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImluaXRQb2x5RHJhd1wiLCBudWxsKTtcclxuXHJcbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCk7XHJcbiAgICBjb25zdCBkcmF3TW9kZSA9IHRoaXMuZ2V0RHJhd01vZGUoKTtcclxuICAgIGlmICh0aGlzLmNvbmZpZy50b3VjaFN1cHBvcnQpIHtcclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIGUgPT4ge1xyXG4gICAgICAgIGlmIChkcmF3TW9kZSAhPT0gRHJhd01vZGUuT2ZmKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdXNlRG93bihlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCBlID0+IHtcclxuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xyXG4gICAgICAgICAgdGhpcy5tb3VzZVVwTGVhdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgZSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcclxuICAgICAgICAgIHRoaXMubW91c2VNb3ZlKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhcIk1hcCBpbml0OiBcIiwgdGhpcy5tYXApO1xyXG4gICAgY29uc29sZS5sb2coXCJUcmFjZXIgaW5pdDogXCIsIHRoaXMudHJhY2VyKTtcclxuICAgIHRoaXMubWFwLmFkZExheWVyKHRoaXMudHJhY2VyKTtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuICB9XHJcbiAgLy8gVGVzdCBMLk1vdXNlRXZlbnRcclxuICBwcml2YXRlIG1vdXNlRG93bihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coXCJtb3VzZURvd25cIiwgZXZlbnQpO1xyXG5cclxuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9IG51bGwpIHtcclxuICAgICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbZXZlbnQubGF0bG5nXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBsYXRsbmcgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKFtcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgIF0pO1xyXG4gICAgICB0aGlzLnRyYWNlci5zZXRMYXRMbmdzKFtsYXRsbmddKTtcclxuICAgIH1cclxuICAgIHRoaXMuc3RhcnREcmF3KCk7XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPIGV2ZW50IHR5cGUsIGNyZWF0ZSBjb250YWluZXJQb2ludFRvTGF0TG5nLW1ldGhvZFxyXG4gIHByaXZhdGUgbW91c2VNb3ZlKGV2ZW50KSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm1vdXNlTW92ZVwiLCBldmVudCk7XHJcblxyXG4gICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT0gbnVsbCkge1xyXG4gICAgICB0aGlzLnRyYWNlci5hZGRMYXRMbmcoZXZlbnQubGF0bG5nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGxhdGxuZyA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcoW1xyXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCxcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFlcclxuICAgICAgXSk7XHJcbiAgICAgIHRoaXMudHJhY2VyLmFkZExhdExuZyhsYXRsbmcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgbW91c2VVcExlYXZlKCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJtb3VzZVVwTGVhdmVcIiwgbnVsbCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLURlbGV0ZSB0cmFzaGNhbnNcIiwgbnVsbCk7XHJcbiAgICBjb25zdCBnZW9Qb3M6IEZlYXR1cmU8XHJcbiAgICAgIFBvbHlnb24gfCBNdWx0aVBvbHlnb25cclxuICAgID4gPSB0aGlzLnR1cmZIZWxwZXIudHVyZkNvbmNhdmVtYW4odGhpcy50cmFjZXIudG9HZW9KU09OKCkgYXMgYW55KTtcclxuICAgIHRoaXMuc3RvcERyYXcoKTtcclxuICAgIHN3aXRjaCAodGhpcy5nZXREcmF3TW9kZSgpKSB7XHJcbiAgICAgIGNhc2UgRHJhd01vZGUuQWRkOlxyXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbihnZW9Qb3MsIHRydWUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIERyYXdNb2RlLlN1YnRyYWN0OlxyXG4gICAgICAgIHRoaXMuc3VidHJhY3RQb2x5Z29uKGdlb1Bvcyk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwc1xyXG4gICAgKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tY3JlYXRlIHRyYXNoY2Fuc1wiLCBudWxsKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc3RhcnREcmF3KCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJzdGFydERyYXdcIiwgbnVsbCk7XHJcblxyXG4gICAgdGhpcy5kcmF3U3RhcnRlZEV2ZW50cyh0cnVlKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc3RvcERyYXcoKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInN0b3BEcmF3XCIsIG51bGwpO1xyXG5cclxuICAgIHRoaXMucmVzZXRUcmFja2VyKCk7XHJcbiAgICB0aGlzLmRyYXdTdGFydGVkRXZlbnRzKGZhbHNlKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25ab29tQ2hhbmdlKHpvb21MZXZlbDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm9uWm9vbUNoYW5nZVwiLCB6b29tTGV2ZWwpO1xyXG5cclxuICAgIGlmICh6b29tTGV2ZWwgPj0gdGhpcy5taW5pbXVtRnJlZURyYXdab29tTGV2ZWwpIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkRyYXdTdGF0ZXMuY2FuVXNlUG9seURyYXcgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkRyYXdTdGF0ZXMuY2FuVXNlUG9seURyYXcgPSBmYWxzZTtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0TW92ZU1vZGUoKTtcclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZHJhd1N0YXJ0ZWRFdmVudHMob25vZmY6IGJvb2xlYW4pIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZHJhd1N0YXJ0ZWRFdmVudHNcIiwgb25vZmYpO1xyXG5cclxuICAgIGNvbnN0IG9ub3JvZmYgPSBvbm9mZiA/IFwib25cIiA6IFwib2ZmXCI7XHJcblxyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmUsIHRoaXMpO1xyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcExlYXZlLCB0aGlzKTtcclxuICB9XHJcbiAgLy8gT24gaG9sZFxyXG4gIHByaXZhdGUgc3VidHJhY3RQb2x5Z29uKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIHRoaXMuc3VidHJhY3QobGF0bG5ncyk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGFkZFBvbHlnb24oXHJcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgc2ltcGxpZnk6IGJvb2xlYW4sXHJcbiAgICBub01lcmdlOiBib29sZWFuID0gZmFsc2VcclxuICApIHtcclxuICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICBcImFkZFBvbHlnb25cIixcclxuICAgICAgbGF0bG5ncyxcclxuICAgICAgc2ltcGxpZnksXHJcbiAgICAgIG5vTWVyZ2UsXHJcbiAgICAgIHRoaXMua2lua3MsXHJcbiAgICAgIHRoaXMuY29uZmlnXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgdGhpcy5tZXJnZVBvbHlnb25zICYmXHJcbiAgICAgICFub01lcmdlICYmXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCAmJlxyXG4gICAgICAhdGhpcy5raW5rc1xyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMubWVyZ2UobGF0bG5ncyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXRsbmdzLCBzaW1wbGlmeSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGFkZFBvbHlnb25MYXllcihcclxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBzaW1wbGlmeTogYm9vbGVhblxyXG4gICkge1xyXG4gICAgY29uc3QgZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCA9IG5ldyBMLkZlYXR1cmVHcm91cCgpO1xyXG5cclxuICAgIGNvbnN0IGxhdExuZ3MgPSBzaW1wbGlmeSA/IHRoaXMudHVyZkhlbHBlci5nZXRTaW1wbGlmaWVkKGxhdGxuZ3MpIDogbGF0bG5ncztcclxuICAgIGNvbnNvbGUubG9nKFwiQWRkUG9seWdvbkxheWVyOiBcIiwgbGF0TG5ncyk7XHJcbiAgICBjb25zdCBwb2x5Z29uID0gdGhpcy5nZXRQb2x5Z29uKGxhdExuZ3MpO1xyXG4gICAgZmVhdHVyZUdyb3VwLmFkZExheWVyKHBvbHlnb24pO1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbik7XHJcbiAgICBjb25zdCBtYXJrZXJMYXRsbmdzID0gcG9seWdvbi5nZXRMYXRMbmdzKCk7XHJcbiAgICBtYXJrZXJMYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgIHBvbHlnb24uZm9yRWFjaCgocG9seUVsZW1lbnQ6IElMYXRMbmdbXSwgaTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGkgPT09IDApIHtcclxuICAgICAgICAgIHRoaXMuYWRkTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmFkZEhvbGVNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkh1bGw6IFwiLCBwb2x5RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgLy8gdGhpcy5hZGRNYXJrZXIocG9seWdvblswXSwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgLy8gVE9ETyAtIEh2aXMgcG9seWdvbi5sZW5ndGggPjEsIHPDpSBoYXIgZGVuIGh1bGw6IGVnZW4gYWRkTWFya2VyIGZ1bmtzam9uXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgIGNvbnNvbGUubG9nKFwiQXJyYXk6IFwiLCB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XHJcblxyXG4gICAgZmVhdHVyZUdyb3VwLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgIHRoaXMucG9seWdvbkNsaWNrZWQoZSwgbGF0TG5ncyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgcG9seWdvbkNsaWNrZWQoZTogYW55LCBwb2x5OiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zdCBuZXdQb2ludCA9IGUubGF0bG5nO1xyXG4gICAgaWYgKHBvbHkuZ2VvbWV0cnkudHlwZSA9PT0gXCJNdWx0aVBvbHlnb25cIikge1xyXG4gICAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmluamVjdFBvaW50VG9Qb2x5Z29uKHBvbHksIFtcclxuICAgICAgICBuZXdQb2ludC5sbmcsXHJcbiAgICAgICAgbmV3UG9pbnQubGF0XHJcbiAgICAgIF0pO1xyXG4gICAgICB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24ocG9seSkpO1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihuZXdQb2x5Z29uLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGdldFBvbHlnb24obGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc29sZS5sb2coXCJnZXRQb2x5Z29uczogXCIsIGxhdGxuZ3MpO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IEwuR2VvSlNPTi5nZW9tZXRyeVRvTGF5ZXIobGF0bG5ncykgYXMgYW55O1xyXG5cclxuICAgIHBvbHlnb24uc2V0U3R5bGUodGhpcy5jb25maWcucG9seWdvbk9wdGlvbnMpO1xyXG4gICAgcmV0dXJuIHBvbHlnb247XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIG1lcmdlKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnNvbGUubG9nKFwibWVyZ2VcIiwgbGF0bG5ncyk7XHJcbiAgICBjb25zdCBwb2x5Z29uRmVhdHVyZSA9IFtdO1xyXG4gICAgY29uc3QgbmV3QXJyYXk6IEwuRmVhdHVyZUdyb3VwW10gPSBbXTtcclxuICAgIGxldCBwb2x5SW50ZXJzZWN0aW9uID0gZmFsc2U7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBmZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xyXG4gICAgICBjb25zb2xlLmxvZyhcIk1lcmdlcjogXCIsIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdKTtcclxuICAgICAgaWYgKGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcclxuICAgICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcclxuICAgICAgICAgIGlmIChwb2x5SW50ZXJzZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIG5ld0FycmF5LnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKFxyXG4gICAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF1cclxuICAgICAgICApO1xyXG4gICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcclxuICAgICAgICBpZiAocG9seUludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY29uc29sZS5sb2cobmV3QXJyYXkpO1xyXG4gICAgaWYgKG5ld0FycmF5Lmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy51bmlvblBvbHlnb25zKG5ld0FycmF5LCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXRsbmdzLCB0cnVlKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gbmV4dFxyXG4gIHByaXZhdGUgc3VidHJhY3QobGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgbGV0IGFkZEhvbGUgPSBsYXRsbmdzO1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXTtcclxuICAgICAgY29uc3QgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcclxuICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25EaWZmZXJlbmNlKGZlYXR1cmUsIGFkZEhvbGUpO1xyXG4gICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seSk7XHJcbiAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXApO1xyXG4gICAgICBhZGRIb2xlID0gbmV3UG9seWdvbjtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG5ld0xhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4gPSBhZGRIb2xlO1xyXG4gICAgY29uc3QgY29vcmRzID0gdGhpcy50dXJmSGVscGVyLmdldENvb3JkcyhuZXdMYXRsbmdzKTtcclxuICAgIGNvb3Jkcy5mb3JFYWNoKHZhbHVlID0+IHtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIodGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihbdmFsdWVdKSwgdHJ1ZSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZXZlbnRzKG9ub2ZmOiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBvbm9yb2ZmID0gb25vZmYgPyBcIm9uXCIgOiBcIm9mZlwiO1xyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZURvd24sIHRoaXMpO1xyXG4gIH1cclxuICAvLyBmaW5lLCBUT0RPOiBpZiBzcGVjaWFsIG1hcmtlcnNcclxuICBwcml2YXRlIGFkZE1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnN0IG1lbnVNYXJrZXJJZHggPSB0aGlzLmdldE1hcmtlckluZGV4KFxyXG4gICAgICBsYXRsbmdzLFxyXG4gICAgICB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnBvc2l0aW9uXHJcbiAgICApO1xyXG4gICAgY29uc3QgZGVsZXRlTWFya2VySWR4ID0gdGhpcy5nZXRNYXJrZXJJbmRleChcclxuICAgICAgbGF0bG5ncyxcclxuICAgICAgdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnBvc2l0aW9uXHJcbiAgICApO1xyXG5cclxuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XHJcbiAgICAgIGxldCBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VySWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIC8qICAgaWYgKGkgPT09IG1lbnVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XHJcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfVxyXG4gICAgICBpZiAoaSA9PT0gZGVsZXRlTWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XHJcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckRlbGV0ZUljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICB9ICovXHJcbiAgICAgIGNvbnN0IG1hcmtlciA9IG5ldyBMLk1hcmtlcihsYXRsbmcsIHtcclxuICAgICAgICBpY29uOiB0aGlzLmNyZWF0ZURpdkljb24oaWNvbkNsYXNzZXMpLFxyXG4gICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcclxuICAgICAgICB0aXRsZTogaS50b1N0cmluZygpXHJcbiAgICAgIH0pO1xyXG4gICAgICBGZWF0dXJlR3JvdXAuYWRkTGF5ZXIobWFya2VyKS5hZGRUbyh0aGlzLm1hcCk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiRmVhdHVyZUdyb3VwOiBcIiwgRmVhdHVyZUdyb3VwKTtcclxuICAgICAgbWFya2VyLm9uKFwiZHJhZ1wiLCBlID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlckRyYWcoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIG1hcmtlci5vbihcImRyYWdlbmRcIiwgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoaSA9PT0gbWVudU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuICAgICAgICAvLyBtYXJrZXIuYmluZFBvcHVwKFxyXG4gICAgICAgIC8vICAgdGhpcy5nZXRIdG1sQ29udGVudChlID0+IHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJjbGlja2VkIG9uXCIsIGUudGFyZ2V0KTtcclxuICAgICAgICAvLyAgIH0pXHJcbiAgICAgICAgLy8gKTtcclxuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuY29udmVydFRvQm91bmRzUG9seWdvbihsYXRsbmdzLCB0cnVlKTtcclxuICAgICAgICAgIC8vIHRoaXMuY29udmVydFRvU2ltcGxpZmllZFBvbHlnb24obGF0bG5ncyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGkgPT09IGRlbGV0ZU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRIb2xlTWFya2VyKGxhdGxuZ3M6IElMYXRMbmdbXSwgRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIGkpID0+IHtcclxuICAgICAgY29uc3QgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICAvKiAgaWYgKGkgPT09IDAgJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XHJcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy9UT0RPLSBsZWdnIHRpbCBmaWxsIGljb25cclxuICAgICAgaWYgKGkgPT09IGxhdGxuZ3MubGVuZ3RoIC0gMSAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfSAqL1xyXG4gICAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5NYXJrZXIobGF0bG5nLCB7XHJcbiAgICAgICAgaWNvbjogdGhpcy5jcmVhdGVEaXZJY29uKGljb25DbGFzc2VzKSxcclxuICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgdGl0bGU6IGkudG9TdHJpbmcoKVxyXG4gICAgICB9KTtcclxuICAgICAgRmVhdHVyZUdyb3VwLmFkZExheWVyKG1hcmtlcikuYWRkVG8odGhpcy5tYXApO1xyXG5cclxuICAgICAgbWFya2VyLm9uKFwiZHJhZ1wiLCBlID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlckRyYWcoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIG1hcmtlci5vbihcImRyYWdlbmRcIiwgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvKiAgIGlmIChpID09PSAwICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIG1hcmtlci5iaW5kUG9wdXAodGhpcy5nZXRIdG1sQ29udGVudCgoZSkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJjbGlja2VkIG9uXCIsIGUudGFyZ2V0KTtcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgLy8gbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgLy8gICB0aGlzLnRvZ2dsZU1hcmtlck1lbnUoKTtcclxuICAgICAgICAvLyB9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09PSBsYXRsbmdzLmxlbmd0aCAtIDEgJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9ICovXHJcbiAgICB9KTtcclxuICB9XHJcbiAgcHJpdmF0ZSBjcmVhdGVEaXZJY29uKGNsYXNzTmFtZXM6IHN0cmluZ1tdKTogTC5EaXZJY29uIHtcclxuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzLmpvaW4oXCIgXCIpO1xyXG4gICAgY29uc3QgaWNvbiA9IEwuZGl2SWNvbih7IGNsYXNzTmFtZTogY2xhc3NlcyB9KTtcclxuICAgIHJldHVybiBpY29uO1xyXG4gIH1cclxuICAvLyBUT0RPOiBDbGVhbnVwXHJcbiAgcHJpdmF0ZSBtYXJrZXJEcmFnKEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnN0IG5ld1BvcyA9IFtdO1xyXG4gICAgbGV0IHRlc3RhcnJheSA9IFtdO1xyXG4gICAgbGV0IGhvbGUgPSBbXTtcclxuICAgIGNvbnN0IGxheWVyTGVuZ3RoID0gRmVhdHVyZUdyb3VwLmdldExheWVycygpIGFzIGFueTtcclxuICAgIGNvbnN0IHBvc2FycmF5cyA9IGxheWVyTGVuZ3RoWzBdLmdldExhdExuZ3MoKTtcclxuICAgIGNvbnNvbGUubG9nKHBvc2FycmF5cyk7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1hcmtlcmRyYWc6IFwiLCBsYXllckxlbmd0aCk7XHJcbiAgICBsZXQgbGVuZ3RoID0gMDtcclxuICAgIGlmIChwb3NhcnJheXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcG9zYXJyYXlzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHRlc3RhcnJheSA9IFtdO1xyXG4gICAgICAgIGhvbGUgPSBbXTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlBvc2lzam9uZXI6IFwiLCBwb3NhcnJheXNbaW5kZXhdKTtcclxuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF0ubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaW5kZXggPCBwb3NhcnJheXNbMF0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlBvc2lzam9uZXIgMjogXCIsIHBvc2FycmF5c1tpbmRleF1baV0pO1xyXG5cclxuICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVtpXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdWzBdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBob2xlLnB1c2godGVzdGFycmF5KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiSG9sZTogXCIsIGhvbGUpO1xyXG4gICAgICAgICAgbmV3UG9zLnB1c2goaG9sZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlbmd0aCArPSBwb3NhcnJheXNbaW5kZXggLSAxXVswXS5sZW5ndGg7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNUYXJ0IGluZGV4OiBcIiwgbGVuZ3RoKTtcclxuICAgICAgICAgIGZvciAobGV0IGogPSBsZW5ndGg7IGogPCBwb3NhcnJheXNbaW5kZXhdWzBdLmxlbmd0aCArIGxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKChsYXllckxlbmd0aFtqICsgMV0gYXMgYW55KS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBob2xlLnB1c2godGVzdGFycmF5KTtcclxuICAgICAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gdGVzdGFycmF5ID0gW11cclxuICAgICAgaG9sZSA9IFtdO1xyXG4gICAgICBsZXQgbGVuZ3RoMiA9IDA7XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NhcnJheXNbMF0ubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgdGVzdGFycmF5ID0gW107XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJQb2x5Z29uIGRyYWc6IFwiLCBwb3NhcnJheXNbMF1baW5kZXhdKTtcclxuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1bMF0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlbmd0aDIgKz0gcG9zYXJyYXlzWzBdW2luZGV4IC0gMV0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgIGZvciAobGV0IGogPSBsZW5ndGgyOyBqIDwgcG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGggKyBsZW5ndGgyOyBqKyspIHtcclxuICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgIH1cclxuICAgICAgbmV3UG9zLnB1c2goaG9sZSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiSG9sZSAyOiBcIiwgaG9sZSk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhcIk55ZSBwb3Npc2pvbmVyOiBcIiwgbmV3UG9zKTtcclxuICAgIGxheWVyTGVuZ3RoWzBdLnNldExhdExuZ3MobmV3UG9zKTtcclxuICB9XHJcbiAgLy8gY2hlY2sgdGhpc1xyXG4gIHByaXZhdGUgbWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICBjb25zdCBmZWF0dXJlQ29sbGVjdGlvbiA9IEZlYXR1cmVHcm91cC50b0dlb0pTT04oKSBhcyBhbnk7XHJcbiAgICBjb25zb2xlLmxvZyhcclxuICAgICAgXCJNYXJrZXJkcmFnZW5kIHBvbHlnb246IFwiLFxyXG4gICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlc1xyXG4gICAgKTtcclxuICAgIGlmIChmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJNYXJrZXJkcmFnZW5kOiBcIiwgZmVhdHVyZSk7XHJcbiAgICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xyXG4gICAgICAgICAgdGhpcy5raW5rcyA9IHRydWU7XHJcbiAgICAgICAgICBjb25zdCB1bmtpbmsgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0S2lua3MoZmVhdHVyZSk7XHJcbiAgICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5raW5rOiBcIiwgdW5raW5rKTtcclxuICAgICAgICAgIHVua2luay5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFkZFBvbHlnb24oXHJcbiAgICAgICAgICAgICAgdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKHBvbHlnb24pLFxyXG4gICAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAgIHRydWVcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmtpbmtzID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLmFkZFBvbHlnb24oZmVhdHVyZSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlc1xyXG4gICAgICApO1xyXG4gICAgICBjb25zb2xlLmxvZyhcIk1hcmtlcmRyYWdlbmQ6IFwiLCBmZWF0dXJlKTtcclxuICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xyXG4gICAgICAgIHRoaXMua2lua3MgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IHVua2luayA9IHRoaXMudHVyZkhlbHBlci5nZXRLaW5rcyhmZWF0dXJlKTtcclxuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJVbmtpbms6IFwiLCB1bmtpbmspO1xyXG4gICAgICAgIGxldCB0ZXN0Q29vcmQgPSBbXVxyXG4gICAgICAgIHVua2luay5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKFxyXG4gICAgICAgICAgICB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24ocG9seWdvbiksXHJcbiAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIHRoaXMuYWRkUG9seWdvbih0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKHRlc3RDb29yZCksIGZhbHNlLCB0cnVlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgIHRoaXMua2lua3MgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmFkZFBvbHlnb24oZmVhdHVyZSwgZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKFxyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzXHJcbiAgICApO1xyXG4gIH1cclxuICAvLyBmaW5lLCBjaGVjayB0aGUgcmV0dXJuZWQgdHlwZVxyXG4gIHByaXZhdGUgZ2V0TGF0TG5nc0Zyb21Kc29uKFxyXG4gICAgZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICk6IElMYXRMbmdbXVtdIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZ2V0TGF0TG5nc0Zyb21Kc29uOiBcIiwgZmVhdHVyZSk7XHJcbiAgICBsZXQgY29vcmQ7XHJcbiAgICBpZiAoZmVhdHVyZSkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggPiAxICYmXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS50eXBlID09PSBcIk11bHRpUG9seWdvblwiXHJcbiAgICAgICkge1xyXG4gICAgICAgIGNvb3JkID0gTC5HZW9KU09OLmNvb3Jkc1RvTGF0TG5ncyhmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdWzBdKTtcclxuICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdLmxlbmd0aCA+IDEgJiZcclxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT09IFwiUG9seWdvblwiXHJcbiAgICAgICkge1xyXG4gICAgICAgIGNvb3JkID0gTC5HZW9KU09OLmNvb3Jkc1RvTGF0TG5ncyhmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29vcmQ7XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSB1bmlvblBvbHlnb25zKFxyXG4gICAgbGF5ZXJzLFxyXG4gICAgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIHBvbHlnb25GZWF0dXJlXHJcbiAgKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInVuaW9uUG9seWdvbnNcIiwgbGF5ZXJzLCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XHJcblxyXG4gICAgbGV0IGFkZE5ldyA9IGxhdGxuZ3M7XHJcbiAgICBsYXllcnMuZm9yRWFjaCgoZmVhdHVyZUdyb3VwLCBpKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpO1xyXG4gICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdO1xyXG4gICAgICBjb25zdCBwb2x5ID0gdGhpcy5nZXRMYXRMbmdzRnJvbUpzb24obGF5ZXIpO1xyXG4gICAgICBjb25zdCB1bmlvbiA9IHRoaXMudHVyZkhlbHBlci51bmlvbihhZGROZXcsIHBvbHlnb25GZWF0dXJlW2ldKTsgLy8gQ2hlY2sgZm9yIG11bHRpcG9seWdvbnNcclxuICAgICAgLy8gTmVlZHMgYSBjbGVhbnVwIGZvciB0aGUgbmV3IHZlcnNpb25cclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uT25NZXJnZShwb2x5KTtcclxuICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICAgIGFkZE5ldyA9IHVuaW9uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbmV3TGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiA9IGFkZE5ldzsgLy8gVHJlbmdlciBrYW5za2plIHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbiggYWRkTmV3KTtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld0xhdGxuZ3MsIHRydWUpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgY29uc29sZS5sb2coXCJyZW1vdmVGZWF0dXJlR3JvdXBcIiwgZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICBmZWF0dXJlR3JvdXAuY2xlYXJMYXllcnMoKTtcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMgPSB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZpbHRlcihcclxuICAgICAgZmVhdHVyZUdyb3VwcyA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXBcclxuICAgICk7XHJcbiAgICAvLyB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xyXG4gIH1cclxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZVwiLCBmZWF0dXJlR3JvdXApO1xyXG5cclxuICAgIGNvbnN0IG5ld0FycmF5ID0gW107XHJcbiAgICBpZiAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdKSB7XHJcbiAgICAgIGNvbnN0IHBvbHlnb24gPSAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueSkuZ2V0TGF0TG5ncygpWzBdO1xyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2godiA9PiB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgdi5wb2x5Z29uLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF0udG9TdHJpbmcoKSAmJlxyXG4gICAgICAgICAgdi5wb2x5Z29uWzBdLnRvU3RyaW5nKCkgPT09IHBvbHlnb25bMF1bMF0udG9TdHJpbmcoKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgdi5wb2x5Z29uID0gcG9seWdvbjtcclxuICAgICAgICAgIG5ld0FycmF5LnB1c2godik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICB2LnBvbHlnb24udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXS50b1N0cmluZygpICYmXHJcbiAgICAgICAgICB2LnBvbHlnb25bMF0udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXVswXS50b1N0cmluZygpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBuZXdBcnJheS5wdXNoKHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIGZlYXR1cmVHcm91cC5jbGVhckxheWVycygpO1xyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5maWx0ZXIoXHJcbiAgICAgICAgZmVhdHVyZUdyb3VwcyA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXBcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKGZlYXR1cmVHcm91cCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmUgdW50aWwgcmVmYWN0b3JpbmdcclxuICBwcml2YXRlIGRlbGV0ZVBvbHlnb25Pbk1lcmdlKHBvbHlnb24pIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZGVsZXRlUG9seWdvbk9uTWVyZ2VcIiwgcG9seWdvbik7XHJcbiAgICBsZXQgcG9seWdvbjIgPSBbXTtcclxuICAgIGlmICh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55O1xyXG4gICAgICAgIGNvbnN0IGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKClbMF07XHJcbiAgICAgICAgcG9seWdvbjIgPSBbLi4ubGF0bG5nc1swXV07XHJcbiAgICAgICAgaWYgKGxhdGxuZ3NbMF1bMF0gIT09IGxhdGxuZ3NbMF1bbGF0bG5nc1swXS5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgcG9seWdvbjIucHVzaChsYXRsbmdzWzBdWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZXF1YWxzID0gdGhpcy5wb2x5Z29uQXJyYXlFcXVhbHNNZXJnZShwb2x5Z29uMiwgcG9seWdvbik7XHJcblxyXG4gICAgICAgIGlmIChlcXVhbHMpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVFVQUxTXCIsIHBvbHlnb24pO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seWdvbik7XHJcbiAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuICAgICAgICAgIC8vIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFsc01lcmdlKHBvbHkxOiBhbnlbXSwgcG9seTI6IGFueVtdKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gcG9seTEudG9TdHJpbmcoKSA9PT0gcG9seTIudG9TdHJpbmcoKTtcclxuICB9XHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFscyhwb2x5MTogYW55W10sIHBvbHkyOiBhbnlbXSk6IGJvb2xlYW4ge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJwb2x5Z29uQXJyYXlFcXVhbHNcIiwgcG9seTEsIHBvbHkyKTtcclxuXHJcbiAgICBpZiAocG9seTFbMF1bMF0pIHtcclxuICAgICAgaWYgKCFwb2x5MVswXVswXS5lcXVhbHMocG9seTJbMF1bMF0pKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoIXBvbHkxWzBdLmVxdWFscyhwb2x5MlswXSkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChwb2x5MS5sZW5ndGggIT09IHBvbHkyLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc2V0TGVhZmxldE1hcEV2ZW50cyhcclxuICAgIGVuYWJsZURyYWdnaW5nOiBib29sZWFuLFxyXG4gICAgZW5hYmxlRG91YmxlQ2xpY2tab29tOiBib29sZWFuLFxyXG4gICAgZW5hYmxlU2Nyb2xsV2hlZWxab29tOiBib29sZWFuXHJcbiAgKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInNldExlYWZsZXRNYXBFdmVudHNcIiwgZW5hYmxlRHJhZ2dpbmcsIGVuYWJsZURvdWJsZUNsaWNrWm9vbSwgZW5hYmxlU2Nyb2xsV2hlZWxab29tKTtcclxuXHJcbiAgICBlbmFibGVEcmFnZ2luZyA/IHRoaXMubWFwLmRyYWdnaW5nLmVuYWJsZSgpIDogdGhpcy5tYXAuZHJhZ2dpbmcuZGlzYWJsZSgpO1xyXG4gICAgZW5hYmxlRG91YmxlQ2xpY2tab29tXHJcbiAgICAgID8gdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmVuYWJsZSgpXHJcbiAgICAgIDogdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmRpc2FibGUoKTtcclxuICAgIGVuYWJsZVNjcm9sbFdoZWVsWm9vbVxyXG4gICAgICA/IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5lbmFibGUoKVxyXG4gICAgICA6IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBzZXREcmF3TW9kZShtb2RlOiBEcmF3TW9kZSkge1xyXG4gICAgY29uc29sZS5sb2coXCJzZXREcmF3TW9kZVwiLCB0aGlzLm1hcCk7XHJcbiAgICB0aGlzLmRyYXdNb2RlU3ViamVjdC5uZXh0KG1vZGUpO1xyXG4gICAgaWYgKCEhdGhpcy5tYXApIHtcclxuICAgICAgbGV0IGlzQWN0aXZlRHJhd01vZGUgPSB0cnVlO1xyXG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICBjYXNlIERyYXdNb2RlLk9mZjpcclxuICAgICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhcclxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXHJcbiAgICAgICAgICAgIFwiY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkXCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50cyhmYWxzZSk7XHJcbiAgICAgICAgICB0aGlzLnN0b3BEcmF3KCk7XHJcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XHJcbiAgICAgICAgICAgIGNvbG9yOiBcIlwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyh0cnVlLCB0cnVlLCB0cnVlKTtcclxuICAgICAgICAgIGlzQWN0aXZlRHJhd01vZGUgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuQWRkOlxyXG4gICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKFxyXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcclxuICAgICAgICAgICAgXCJjcm9zc2hhaXItY3Vyc29yLWVuYWJsZWRcIlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKHRydWUpO1xyXG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xyXG4gICAgICAgICAgICBjb2xvcjogZGVmYXVsdENvbmZpZy5wb2x5TGluZU9wdGlvbnMuY29sb3JcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5zZXRMZWFmbGV0TWFwRXZlbnRzKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdDpcclxuICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhcclxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXHJcbiAgICAgICAgICAgIFwiY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkXCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50cyh0cnVlKTtcclxuICAgICAgICAgIHRoaXMudHJhY2VyLnNldFN0eWxlKHtcclxuICAgICAgICAgICAgY29sb3I6IFwiI0Q5NDYwRlwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyhmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaXNBY3RpdmVEcmF3TW9kZSkge1xyXG4gICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldEZyZWVEcmF3TW9kZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIG1vZGVDaGFuZ2UobW9kZTogRHJhd01vZGUpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUobW9kZSk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcclxuICBkcmF3TW9kZUNsaWNrKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25EcmF3U3RhdGVzLmlzRnJlZURyYXdNb2RlKSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XHJcbiAgICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldEZyZWVEcmF3TW9kZSgpO1xyXG4gICAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLkFkZCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcclxuICBmcmVlZHJhd01lbnVDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuQWRkKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXHJcbiAgc3VidHJhY3RDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuU3VidHJhY3QpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSByZXNldFRyYWNrZXIoKSB7XHJcbiAgICB0aGlzLnRyYWNlci5zZXRMYXRMbmdzKFtbMCwgMF1dKTtcclxuICB9XHJcblxyXG4gIHRvZ2dsZU1hcmtlck1lbnUoKTogdm9pZCB7XHJcbiAgICBhbGVydChcIm9wZW4gbWVudVwiKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBnZXRIdG1sQ29udGVudChjYWxsQmFjazogRnVuY3Rpb24pOiBIVE1MRWxlbWVudCB7XHJcbiAgICBjb25zdCBjb21wID0gdGhpcy5wb3B1cEdlbmVyYXRvci5nZW5lcmF0ZUFsdGVyUG9wdXAoKTtcclxuICAgIGNvbXAuaW5zdGFuY2UuYmJveENsaWNrZWQuc3Vic2NyaWJlKGUgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZyhcImJib3ggY2xpY2tlZFwiLCBlKTtcclxuICAgICAgY2FsbEJhY2soZSk7XHJcbiAgICB9KTtcclxuICAgIGNvbXAuaW5zdGFuY2Uuc2ltcGx5ZmlDbGlja2VkLnN1YnNjcmliZShlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coXCJzaW1wbHlmaSBjbGlja2VkXCIsIGUpO1xyXG4gICAgICBjYWxsQmFjayhlKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvbXAubG9jYXRpb24ubmF0aXZlRWxlbWVudDtcclxuICB9XHJcbiAgcHJpdmF0ZSBjb252ZXJ0VG9Cb3VuZHNQb2x5Z29uKFxyXG4gICAgbGF0bG5nczogSUxhdExuZ1tdLFxyXG4gICAgYWRkTWlkcG9pbnRNYXJrZXJzOiBib29sZWFuID0gZmFsc2VcclxuICApIHtcclxuICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXHJcbiAgICAgIHRoaXMuY29udmVydFRvQ29vcmRzKFtsYXRsbmdzXSlcclxuICAgICk7XHJcbiAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihcclxuICAgICAgcG9seWdvbixcclxuICAgICAgYWRkTWlkcG9pbnRNYXJrZXJzXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihuZXdQb2x5Z29uKSwgZmFsc2UpO1xyXG4gIH1cclxuICBwcml2YXRlIGNvbnZlcnRUb1NpbXBsaWZpZWRQb2x5Z29uKGxhdGxuZ3M6IElMYXRMbmdbXSkge1xyXG4gICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XHJcbiAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihcclxuICAgICAgdGhpcy5jb252ZXJ0VG9Db29yZHMoW2xhdGxuZ3NdKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihuZXdQb2x5Z29uKSwgdHJ1ZSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0TWFya2VySW5kZXgobGF0bG5nczogSUxhdExuZ1tdLCBwb3NpdGlvbjogTWFya2VyUG9zaXRpb24pOiBudW1iZXIge1xyXG4gICAgY29uc3QgYm91bmRzOiBMLkxhdExuZ0JvdW5kcyA9IFBvbHlEcmF3VXRpbC5nZXRCb3VuZHMoXHJcbiAgICAgIGxhdGxuZ3MsXHJcbiAgICAgIE1hdGguc3FydCgyKSAvIDJcclxuICAgICk7XHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MoXHJcbiAgICAgIGJvdW5kcy5nZXRTb3V0aCgpLFxyXG4gICAgICBib3VuZHMuZ2V0V2VzdCgpLFxyXG4gICAgICBib3VuZHMuZ2V0Tm9ydGgoKSxcclxuICAgICAgYm91bmRzLmdldEVhc3QoKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGNvbXBhc3NEaXJlY3Rpb24gPSBjb21wYXNzLmdldERpcmVjdGlvbihwb3NpdGlvbik7XHJcbiAgICBjb25zdCBsYXRMbmdQb2ludDogSUxhdExuZyA9IHtcclxuICAgICAgbGF0OiBjb21wYXNzRGlyZWN0aW9uLmxhdCxcclxuICAgICAgbG5nOiBjb21wYXNzRGlyZWN0aW9uLmxuZ1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHRhcmdldFBvaW50ID0gdGhpcy50dXJmSGVscGVyLmdldENvb3JkKGxhdExuZ1BvaW50KTtcclxuICAgIGNvbnN0IGZjID0gdGhpcy50dXJmSGVscGVyLmdldEZlYXR1cmVQb2ludENvbGxlY3Rpb24obGF0bG5ncyk7XHJcbiAgICBjb25zdCBuZWFyZXN0UG9pbnRJZHggPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TmVhcmVzdFBvaW50SW5kZXgoXHJcbiAgICAgIHRhcmdldFBvaW50LFxyXG4gICAgICBmYyBhcyBhbnlcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIG5lYXJlc3RQb2ludElkeDtcclxuICB9XHJcbn1cclxuIl19