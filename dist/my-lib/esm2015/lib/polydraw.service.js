import * as tslib_1 from "tslib";
import { Injectable } from "@angular/core";
import * as L from "leaflet";
//import * as turf from "@turf/turf";
import { BehaviorSubject, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { MapStateService } from "./map-state.service";
import { TurfHelperService } from "./turf-helper.service";
import { PolygonInformationService } from "./polygon-information.service";
import defaultConfig from "./polyinfo.json";
import { ComponentGeneraterService } from "./component-generater.service";
import { Compass, PolyDrawUtil } from "./utils";
import { LeafletHelperService } from "./leaflet-helper.service";
import * as i0 from "@angular/core";
import * as i1 from "./map-state.service";
import * as i2 from "./component-generater.service";
import * as i3 from "./turf-helper.service";
import * as i4 from "./polygon-information.service";
import * as i5 from "./leaflet-helper.service";
let PolyDrawService = 
//Rename - PolyDrawService
class PolyDrawService {
    constructor(mapState, popupGenerator, turfHelper, polygonInformation, leafletHelper) {
        this.mapState = mapState;
        this.popupGenerator = popupGenerator;
        this.turfHelper = turfHelper;
        this.polygonInformation = polygonInformation;
        this.leafletHelper = leafletHelper;
        //DrawModes, determine UI buttons etc...
        this.drawModeSubject = new BehaviorSubject(DrawMode.Off);
        this.drawMode$ = this.drawModeSubject.asObservable();
        //add to config
        this.arrayOfFeatureGroups = [];
        this.tracer = {};
        this.polygonDrawStates = null;
        //end add to config
        this.ngUnsubscribe = new Subject();
        this.config = null;
        this.mapState.map$.pipe(filter(m => m !== null)).subscribe((map) => {
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
    configurate(config) {
        //TODO if config is path...
        this.config = Object.assign({}, defaultConfig, config);
        this.mergePolygons = this.config.mergePolygons;
        this.kinks = this.config.kinks;
    }
    //fine
    closeAndReset() {
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
                let latlngs = layer.getLatLngs();
                let length = latlngs.length;
                //  = []
                latlngs.forEach((latlng, index) => {
                    let polygon3;
                    let test = [...latlng];
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
    getDrawMode() {
        //console.log("getDrawMode", null);
        return this.drawModeSubject.value;
    }
    addViken(polygon) {
        this.addPolygonLayer(polygon, true);
    }
    //check this
    addAutoPolygon(geographicBorders) {
        let featureGroup = new L.FeatureGroup();
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
                }
                else {
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
    convertToCoords(latlngs) {
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
            let coordinates = [];
            for (let index = 1; index < latlngs.length - 1; index++) {
                let within = this.turfHelper.isWithin(L.GeoJSON.latLngsToCoords(latlngs[index]), L.GeoJSON.latLngsToCoords(latlngs[0]));
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
    //fine
    initPolyDraw() {
        //console.log("initPolyDraw", null);
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
        this.map.addLayer(this.tracer);
        this.setDrawMode(DrawMode.Off);
    }
    //Test L.MouseEvent
    mouseDown(event) {
        console.log("mouseDown", event);
        if (event.originalEvent != null) {
            this.tracer.setLatLngs([event.latlng]);
        }
        else {
            const latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
            this.tracer.setLatLngs([latlng]);
        }
        this.startDraw();
    }
    //TODO event type, create containerPointToLatLng-method
    mouseMove(event) {
        //console.log("mouseMove", event);
        if (event.originalEvent != null) {
            this.tracer.addLatLng(event.latlng);
        }
        else {
            const latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
            this.tracer.addLatLng(latlng);
        }
    }
    //fine
    mouseUpLeave() {
        //console.log("mouseUpLeave", null);
        this.polygonInformation.deletePolygonInformationStorage();
        //console.log("------------------------------Delete trashcans", null);
        let geoPos = this.turfHelper.turfConcaveman(this.tracer.toGeoJSON());
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
    startDraw() {
        //console.log("startDraw", null);
        this.drawStartedEvents(true);
    }
    //fine
    stopDraw() {
        //console.log("stopDraw", null);
        this.resetTracker();
        this.drawStartedEvents(false);
    }
    //fine
    drawStartedEvents(onoff) {
        //console.log("drawStartedEvents", onoff);
        const onoroff = onoff ? "on" : "off";
        this.map[onoroff]("mousemove", this.mouseMove, this);
        this.map[onoroff]("mouseup", this.mouseUpLeave, this);
    }
    //On hold
    subtractPolygon(latlngs) {
        this.subtract(latlngs);
    }
    //fine
    addPolygon(latlngs, simplify, noMerge = false) {
        console.log("addPolygon", latlngs, simplify, noMerge, this.kinks, this.config);
        if (this.mergePolygons && !noMerge && this.arrayOfFeatureGroups.length > 0 && !this.kinks) {
            this.merge(latlngs);
        }
        else {
            this.addPolygonLayer(latlngs, simplify);
        }
    }
    //fine
    addPolygonLayer(latlngs, simplify) {
        let featureGroup = new L.FeatureGroup();
        const latLngs = simplify ? this.turfHelper.getSimplified(latlngs) : latlngs;
        console.log("AddPolygonLayer: ", latLngs);
        let polygon = this.getPolygon(latLngs);
        featureGroup.addLayer(polygon);
        console.log(polygon);
        let markerLatlngs = polygon.getLatLngs();
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
    polygonClicked(e, poly) {
        const newPoint = e.latlng;
        if (poly.geometry.type === "MultiPolygon") {
            let newPolygon = this.turfHelper.injectPointToPolygon(poly, [newPoint.lng, newPoint.lat]);
            this.deletePolygon(this.getLatLngsFromJson(poly));
            this.addPolygonLayer(newPolygon, false);
        }
    }
    //fine
    getPolygon(latlngs) {
        console.log("getPolygons: ", latlngs);
        let polygon = L.GeoJSON.geometryToLayer(latlngs);
        polygon.setStyle(this.config.polygonOptions);
        return polygon;
    }
    //fine
    merge(latlngs) {
        console.log("merge", latlngs);
        let polygonFeature = [];
        const newArray = [];
        let polyIntersection = false;
        this.arrayOfFeatureGroups.forEach(featureGroup => {
            let featureCollection = featureGroup.toGeoJSON();
            if (featureCollection.features[0].geometry.coordinates.length > 1) {
                featureCollection.features[0].geometry.coordinates.forEach(element => {
                    let feature = this.turfHelper.getMultiPolygon([element]);
                    polyIntersection = this.turfHelper.polygonIntersect(feature, latlngs);
                    if (polyIntersection) {
                        newArray.push(featureGroup);
                        polygonFeature.push(feature);
                    }
                });
            }
            else {
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
        }
        else {
            this.addPolygonLayer(latlngs, true);
        }
    }
    //next
    subtract(latlngs) {
        let addHole = latlngs;
        this.arrayOfFeatureGroups.forEach(featureGroup => {
            let featureCollection = featureGroup.toGeoJSON();
            const layer = featureCollection.features[0];
            let poly = this.getLatLngsFromJson(layer);
            let feature = this.turfHelper.getTurfPolygon(featureCollection.features[0]);
            let newPolygon = this.turfHelper.polygonDifference(feature, addHole);
            this.deletePolygon(poly);
            this.removeFeatureGroupOnMerge(featureGroup);
            addHole = newPolygon;
        });
        const newLatlngs = addHole;
        let coords = this.turfHelper.getCoords(newLatlngs);
        coords.forEach(value => {
            this.addPolygonLayer(this.turfHelper.getMultiPolygon([value]), true);
        });
    }
    //fine
    events(onoff) {
        const onoroff = onoff ? "on" : "off";
        this.map[onoroff]("mousedown", this.mouseDown, this);
    }
    //fine, TODO: if special markers
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
                    //this.convertToSimplifiedPolygon(latlngs);
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
    createDivIcon(classNames) {
        const classes = classNames.join(" ");
        const icon = L.divIcon({ className: classes });
        return icon;
    }
    //TODO: Cleanup
    markerDrag(FeatureGroup) {
        const newPos = [];
        let testarray = [];
        let hole = [];
        const layerLength = FeatureGroup.getLayers();
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
        let featureCollection = FeatureGroup.toGeoJSON();
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
                }
                else {
                    this.kinks = false;
                    this.addPolygon(feature, false);
                }
            });
        }
        else {
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
            }
            else {
                // this.deletePolygon(this.getLatLngsFromJson(feature));
                this.kinks = false;
                this.addPolygon(feature, false);
            }
        }
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
    }
    //fine, check the returned type
    getLatLngsFromJson(feature) {
        console.log("getLatLngsFromJson: ", feature);
        let coord;
        if (feature) {
            if (feature.geometry.coordinates.length > 1 && feature.geometry.type === "MultiPolygon") {
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
    unionPolygons(layers, latlngs, polygonFeature) {
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
        const newLatlngs = addNew; //Trenger kanskje this.turfHelper.getTurfPolygon( addNew);
        this.addPolygonLayer(newLatlngs, true);
    }
    //fine
    removeFeatureGroup(featureGroup) {
        console.log("removeFeatureGroup", featureGroup);
        featureGroup.clearLayers();
        this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(featureGroups => featureGroups !== featureGroup);
        // this.updatePolygons();
        this.map.removeLayer(featureGroup);
    }
    //fine until refactoring
    removeFeatureGroupOnMerge(featureGroup) {
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
    deletePolygonOnMerge(polygon) {
        console.log("deletePolygonOnMerge", polygon);
        let polygon2 = [];
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(featureGroup => {
                let layer = featureGroup.getLayers()[0];
                let latlngs = layer.getLatLngs()[0];
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
    //TODO - legge et annet sted
    polygonArrayEqualsMerge(poly1, poly2) {
        return poly1.toString() === poly2.toString();
    }
    //TODO - legge et annet sted
    polygonArrayEquals(poly1, poly2) {
        // console.log("polygonArrayEquals", poly1, poly2);
        if (poly1[0][0]) {
            if (!poly1[0][0].equals(poly2[0][0]))
                return false;
        }
        else {
            if (!poly1[0].equals(poly2[0]))
                return false;
        }
        if (poly1.length !== poly2.length)
            return false;
        else {
            return true;
        }
    }
    //fine
    setLeafletMapEvents(enableDragging, enableDoubleClickZoom, enableScrollWheelZoom) {
        //console.log("setLeafletMapEvents", enableDragging, enableDoubleClickZoom, enableScrollWheelZoom);
        enableDragging ? this.map.dragging.enable() : this.map.dragging.disable();
        enableDoubleClickZoom ? this.map.doubleClickZoom.enable() : this.map.doubleClickZoom.disable();
        enableScrollWheelZoom ? this.map.scrollWheelZoom.enable() : this.map.scrollWheelZoom.disable();
    }
    //fine
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
    modeChange(mode) {
        this.setDrawMode(mode);
        this.polygonInformation.saveCurrentState();
    }
    //remove, use modeChange
    drawModeClick() {
        this.setDrawMode(DrawMode.AddPolygon);
        this.polygonInformation.saveCurrentState();
    }
    //remove, use modeChange
    freedrawMenuClick() {
        this.setDrawMode(DrawMode.AddPolygon);
        this.polygonInformation.saveCurrentState();
    }
    //remove, use modeChange
    subtractClick() {
        this.setDrawMode(DrawMode.SubtractPolygon);
        this.polygonInformation.saveCurrentState();
    }
    //fine
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
        let polygon = this.turfHelper.getMultiPolygon(this.convertToCoords([latlngs]));
        let newPolygon = this.turfHelper.convertToBoundingBoxPolygon(polygon, addMidpointMarkers);
        this.addPolygonLayer(this.turfHelper.getTurfPolygon(newPolygon), false);
    }
    convertToSimplifiedPolygon(latlngs) {
        this.deletePolygon([latlngs]);
        let newPolygon = this.turfHelper.getMultiPolygon(this.convertToCoords([latlngs]));
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
    { type: MapStateService },
    { type: ComponentGeneraterService },
    { type: TurfHelperService },
    { type: PolygonInformationService },
    { type: LeafletHelperService }
];
PolyDrawService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function PolyDrawService_Factory() { return new PolyDrawService(i0.ɵɵinject(i1.MapStateService), i0.ɵɵinject(i2.ComponentGeneraterService), i0.ɵɵinject(i3.TurfHelperService), i0.ɵɵinject(i4.PolygonInformationService), i0.ɵɵinject(i5.LeafletHelperService)); }, token: PolyDrawService, providedIn: "root" });
PolyDrawService = tslib_1.__decorate([
    Injectable({
        providedIn: "root"
    })
    //Rename - PolyDrawService
    ,
    tslib_1.__metadata("design:paramtypes", [MapStateService,
        ComponentGeneraterService,
        TurfHelperService,
        PolygonInformationService,
        LeafletHelperService])
], PolyDrawService);
export { PolyDrawService };
//flytt til enum.ts
export var DrawMode;
(function (DrawMode) {
    DrawMode[DrawMode["Off"] = 0] = "Off";
    DrawMode[DrawMode["AddPolygon"] = 1] = "AddPolygon";
    DrawMode[DrawMode["EditPolygon"] = 2] = "EditPolygon";
    DrawMode[DrawMode["SubtractPolygon"] = 3] = "SubtractPolygon";
    DrawMode[DrawMode["LoadPolygon"] = 4] = "LoadPolygon";
})(DrawMode || (DrawMode = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9wb2x5ZHJhdy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdCLHFDQUFxQztBQUNyQyxPQUFPLEVBQWMsZUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBRTVDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRWhELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDOzs7Ozs7O0FBTWhFLElBQWEsZUFBZTtBQUQ1QiwwQkFBMEI7QUFDMUIsTUFBYSxlQUFlO0lBa0IxQixZQUNVLFFBQXlCLEVBQ3pCLGNBQXlDLEVBQ3pDLFVBQTZCLEVBQzdCLGtCQUE2QyxFQUM3QyxhQUFtQztRQUpuQyxhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUN6QixtQkFBYyxHQUFkLGNBQWMsQ0FBMkI7UUFDekMsZUFBVSxHQUFWLFVBQVUsQ0FBbUI7UUFDN0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUEyQjtRQUM3QyxrQkFBYSxHQUFiLGFBQWEsQ0FBc0I7UUF0QjdDLHdDQUF3QztRQUN4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QUc7WUFDekIsR0FBRyxFQUFFLGdCQUFnQixDQUFDLEdBQUc7U0FDNUIsQ0FBQTtRQUNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsRUFBUyxDQUFDLENBQUE7UUFFcEYsT0FBTyxlQUFlLENBQUM7SUFDM0IsQ0FBQztDQUdBLENBQUE7O1lBM3pCcUIsZUFBZTtZQUNULHlCQUF5QjtZQUM3QixpQkFBaUI7WUFDVCx5QkFBeUI7WUFDOUIsb0JBQW9COzs7QUF2QmxDLGVBQWU7SUFKM0IsVUFBVSxDQUFDO1FBQ1YsVUFBVSxFQUFFLE1BQU07S0FDbkIsQ0FBQztJQUNGLDBCQUEwQjs7NkNBb0JKLGVBQWU7UUFDVCx5QkFBeUI7UUFDN0IsaUJBQWlCO1FBQ1QseUJBQXlCO1FBQzlCLG9CQUFvQjtHQXZCbEMsZUFBZSxDQTgwQjNCO1NBOTBCWSxlQUFlO0FBKzBCNUIsbUJBQW1CO0FBQ25CLE1BQU0sQ0FBTixJQUFZLFFBTVg7QUFORCxXQUFZLFFBQVE7SUFDbEIscUNBQU8sQ0FBQTtJQUNQLG1EQUFjLENBQUE7SUFDZCxxREFBZSxDQUFBO0lBQ2YsNkRBQW1CLENBQUE7SUFDbkIscURBQWUsQ0FBQTtBQUNqQixDQUFDLEVBTlcsUUFBUSxLQUFSLFFBQVEsUUFNbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBPcHRpb25hbCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCAqIGFzIEwgZnJvbSBcImxlYWZsZXRcIjtcclxuLy9pbXBvcnQgKiBhcyB0dXJmIGZyb20gXCJAdHVyZi90dXJmXCI7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIEJlaGF2aW9yU3ViamVjdCwgU3ViamVjdCB9IGZyb20gXCJyeGpzXCI7XHJcbmltcG9ydCB7IGZpbHRlciB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xyXG5pbXBvcnQgeyBGZWF0dXJlLCBQb2x5Z29uLCBNdWx0aVBvbHlnb24gfSBmcm9tIFwiQHR1cmYvdHVyZlwiO1xyXG5pbXBvcnQgeyBNYXBTdGF0ZVNlcnZpY2UgfSBmcm9tIFwiLi9tYXAtc3RhdGUuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBUdXJmSGVscGVyU2VydmljZSB9IGZyb20gXCIuL3R1cmYtaGVscGVyLnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSB9IGZyb20gXCIuL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZVwiO1xyXG5pbXBvcnQgZGVmYXVsdENvbmZpZyBmcm9tIFwiLi9wb2x5aW5mby5qc29uXCI7XHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcclxuaW1wb3J0IHsgQ29tcG9uZW50R2VuZXJhdGVyU2VydmljZSB9IGZyb20gXCIuL2NvbXBvbmVudC1nZW5lcmF0ZXIuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBDb21wYXNzLCBQb2x5RHJhd1V0aWwgfSBmcm9tIFwiLi91dGlsc1wiO1xyXG5pbXBvcnQgeyBNYXJrZXJQb3NpdGlvbiB9IGZyb20gXCIuL2VudW1zXCI7XHJcbmltcG9ydCB7IExlYWZsZXRIZWxwZXJTZXJ2aWNlIH0gZnJvbSBcIi4vbGVhZmxldC1oZWxwZXIuc2VydmljZVwiO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46IFwicm9vdFwiXHJcbn0pXHJcbi8vUmVuYW1lIC0gUG9seURyYXdTZXJ2aWNlXHJcbmV4cG9ydCBjbGFzcyBQb2x5RHJhd1NlcnZpY2Uge1xyXG4gIC8vRHJhd01vZGVzLCBkZXRlcm1pbmUgVUkgYnV0dG9ucyBldGMuLi5cclxuICBkcmF3TW9kZVN1YmplY3Q6IEJlaGF2aW9yU3ViamVjdDxEcmF3TW9kZT4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0PERyYXdNb2RlPihEcmF3TW9kZS5PZmYpO1xyXG4gIGRyYXdNb2RlJDogT2JzZXJ2YWJsZTxEcmF3TW9kZT4gPSB0aGlzLmRyYXdNb2RlU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuXHJcbiAgcHJpdmF0ZSBtYXA6IEwuTWFwO1xyXG5cclxuICBwcml2YXRlIG1lcmdlUG9seWdvbnM6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBraW5rczogYm9vbGVhbjtcclxuICAvL2FkZCB0byBjb25maWdcclxuICBwcml2YXRlIGFycmF5T2ZGZWF0dXJlR3JvdXBzOiBMLkZlYXR1cmVHcm91cDxMLkxheWVyPltdID0gW107XHJcbiAgcHJpdmF0ZSB0cmFjZXI6IEwuUG9seWxpbmUgPSB7fSBhcyBhbnk7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBwb2x5Z29uRHJhd1N0YXRlcyA9IG51bGw7XHJcbiAgLy9lbmQgYWRkIHRvIGNvbmZpZ1xyXG5cclxuICBwcml2YXRlIG5nVW5zdWJzY3JpYmUgPSBuZXcgU3ViamVjdCgpO1xyXG4gIHByaXZhdGUgY29uZmlnOiB0eXBlb2YgZGVmYXVsdENvbmZpZyA9IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBtYXBTdGF0ZTogTWFwU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBwb3B1cEdlbmVyYXRvcjogQ29tcG9uZW50R2VuZXJhdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgdHVyZkhlbHBlcjogVHVyZkhlbHBlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBvbHlnb25JbmZvcm1hdGlvbjogUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSxcclxuICAgIHByaXZhdGUgbGVhZmxldEhlbHBlcjogTGVhZmxldEhlbHBlclNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMubWFwU3RhdGUubWFwJC5waXBlKGZpbHRlcihtID0+IG0gIT09IG51bGwpKS5zdWJzY3JpYmUoKG1hcDogTC5NYXApID0+IHtcclxuICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwicHJlIHRoaXMuY29uZmlnXCIsIHRoaXMuY29uZmlnKTtcclxuICAgICAgdGhpcy5jb25maWcgPSBkZWZhdWx0Q29uZmlnO1xyXG4gICAgICBjb25zb2xlLmxvZyhcInRoaXMuY29uZmlnXCIsIHRoaXMuY29uZmlnKTtcclxuICAgICAgdGhpcy5jb25maWd1cmF0ZSh7fSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiYWZ0ZXIgdGhpcy5jb25maWdcIiwgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLnRyYWNlciA9IEwucG9seWxpbmUoW1swLCAwXV0sIHRoaXMuY29uZmlnLnBvbHlMaW5lT3B0aW9ucyk7XHJcblxyXG4gICAgICB0aGlzLmluaXRQb2x5RHJhdygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkluZm9ybWF0aW9uJC5zdWJzY3JpYmUoayA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiUG9seUluZm8gc3RhcnQ6IFwiLCBrKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vVE9ETyAtIGxhZ2UgZW4gY29uZmlnIG9ic2VydmFibGUgaSBtYXBTdGF0ZSBvZyBvcHBkYXRlciB0aGlzLmNvbmZpZyBtZWQgZGVuXHJcbiAgfVxyXG4gIC8vbmV3XHJcbiAgY29uZmlndXJhdGUoY29uZmlnOiBPYmplY3QpOiB2b2lkIHtcclxuICAgIC8vVE9ETyBpZiBjb25maWcgaXMgcGF0aC4uLlxyXG4gICAgdGhpcy5jb25maWcgPSB7IC4uLmRlZmF1bHRDb25maWcsIC4uLmNvbmZpZyB9O1xyXG5cclxuICAgIHRoaXMubWVyZ2VQb2x5Z29ucyA9IHRoaXMuY29uZmlnLm1lcmdlUG9seWdvbnM7XHJcbiAgICB0aGlzLmtpbmtzID0gdGhpcy5jb25maWcua2lua3M7XHJcbiAgfVxyXG5cclxuICAvL2ZpbmVcclxuICBjbG9zZUFuZFJlc2V0KCk6IHZvaWQge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcImNsb3NlQW5kUmVzZXRcIik7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XHJcbiAgICB0aGlzLnJlbW92ZUFsbEZlYXR1cmVHcm91cHMoKTtcclxuICB9XHJcblxyXG4gIC8vbWFrZSByZWFkYWJsZVxyXG4gIGRlbGV0ZVBvbHlnb24ocG9seWdvbjogSUxhdExuZ1tdW10pIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZGVsZXRlUG9seWdvbjogXCIsIHBvbHlnb24pO1xyXG4gICAgaWYgKHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBsZXQgbGF5ZXIgPSBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55O1xyXG4gICAgICAgIGxldCBsYXRsbmdzID0gbGF5ZXIuZ2V0TGF0TG5ncygpO1xyXG4gICAgICAgIGxldCBsZW5ndGggPSBsYXRsbmdzLmxlbmd0aDtcclxuICAgICAgICAvLyAgPSBbXVxyXG4gICAgICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgbGV0IHBvbHlnb24zO1xyXG4gICAgICAgICAgbGV0IHRlc3QgPSBbLi4ubGF0bG5nXVxyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKGxhdGxuZyk7XHJcbiAgICAgICAgICBpZiAobGF0bG5nLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXVswXSAhPT0gbGF0bG5nWzBdW2xhdGxuZ1swXS5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICAgIHRlc3RbMF0ucHVzaChsYXRsbmdbMF1bMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gW3Rlc3RbMF1dO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXSAhPT0gbGF0bG5nW2xhdGxuZy5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICAgIHRlc3QucHVzaChsYXRsbmdbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gdGVzdDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlRlc3Q6IFwiLCBwb2x5Z29uMyk7XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2cocG9seWdvbik7XHJcblxyXG4gICAgICAgICAgY29uc3QgZXF1YWxzID0gdGhpcy5wb2x5Z29uQXJyYXlFcXVhbHMocG9seWdvbjMsIHBvbHlnb24pO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJlcXVhbHM6IFwiLCBlcXVhbHMsIFwiIGxlbmd0aDogXCIsIGxlbmd0aCk7XHJcbiAgICAgICAgICBpZiAoZXF1YWxzICYmIGxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVxdWFscyAmJiBsZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVRyYXNoQ2FuT25NdWx0aShbcG9seWdvbl0pO1xyXG4gICAgICAgICAgICBsYXRsbmdzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIGxheWVyLnNldExhdExuZ3MobGF0bG5ncyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxheWVyLnRvR2VvSlNPTigpLCBmYWxzZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICAvL2ZpbmVcclxuICByZW1vdmVBbGxGZWF0dXJlR3JvdXBzKCkge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcInJlbW92ZUFsbEZlYXR1cmVHcm91cHNcIiwgbnVsbCk7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwcyA9PiB7XHJcbiAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKGZlYXR1cmVHcm91cHMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3VwcyA9IFtdO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgLy8gdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5yZXNldCgpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24udXBkYXRlUG9seWdvbnMoKTtcclxuICB9XHJcbiAgLy9maW5lXHJcbiAgZ2V0RHJhd01vZGUoKTogRHJhd01vZGUge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcImdldERyYXdNb2RlXCIsIG51bGwpO1xyXG4gICAgcmV0dXJuIHRoaXMuZHJhd01vZGVTdWJqZWN0LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgYWRkVmlrZW4ocG9seWdvbikge1xyXG4gICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIocG9seWdvbiwgdHJ1ZSk7XHJcbiAgfVxyXG5cclxuICAvL2NoZWNrIHRoaXNcclxuICBhZGRBdXRvUG9seWdvbihnZW9ncmFwaGljQm9yZGVyczogTC5MYXRMbmdbXVtdKTogdm9pZCB7XHJcbiAgICBsZXQgZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCA9IG5ldyBMLkZlYXR1cmVHcm91cCgpO1xyXG5cclxuICAgIGxldCBwb2x5Z29uMiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24odGhpcy5jb252ZXJ0VG9Db29yZHMoZ2VvZ3JhcGhpY0JvcmRlcnMpKTtcclxuICAgIGNvbnNvbGUubG9nKHBvbHlnb24yKTtcclxuICAgIGxldCBwb2x5Z29uID0gdGhpcy5nZXRQb2x5Z29uKHBvbHlnb24yKTtcclxuXHJcbiAgICBmZWF0dXJlR3JvdXAuYWRkTGF5ZXIocG9seWdvbik7XHJcbiAgICBsZXQgbWFya2VyTGF0bG5ncyA9IHBvbHlnb24uZ2V0TGF0TG5ncygpO1xyXG4gICAgY29uc29sZS5sb2coXCJtYXJrZXJzOiBcIiwgbWFya2VyTGF0bG5ncyk7XHJcbiAgICBtYXJrZXJMYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgIHBvbHlnb24uZm9yRWFjaCgocG9seUVsZW1lbnQsIGkpID0+IHtcclxuICAgICAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgdGhpcy5hZGRNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuYWRkSG9sZU1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiSHVsbDogXCIsIHBvbHlFbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyB0aGlzLmFkZE1hcmtlcihwb2x5Z29uWzBdLCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAvL1RPRE8gLSBIdmlzIHBvbHlnb24ubGVuZ3RoID4xLCBzw6UgaGFyIGRlbiBodWxsOiBlZ2VuIGFkZE1hcmtlciBmdW5rc2pvblxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5wdXNoKGZlYXR1cmVHcm91cCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMpO1xyXG4gIH1cclxuXHJcbiAgLy9pbm5laMOlbGwgaSBpZidhciBmbHl0dGEgdGlsbCBlZ25hIG1ldG9kZXJcclxuICBwcml2YXRlIGNvbnZlcnRUb0Nvb3JkcyhsYXRsbmdzOiBJTGF0TG5nW11bXSkge1xyXG4gICAgbGV0IGNvb3JkcyA9IFtdO1xyXG4gICAgY29uc29sZS5sb2cobGF0bG5ncy5sZW5ndGgsIGxhdGxuZ3MpO1xyXG4gICAgaWYgKGxhdGxuZ3MubGVuZ3RoID4gMSAmJiBsYXRsbmdzLmxlbmd0aCA8IDMpIHtcclxuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvbnNvbGUubG9nKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdKSwgbGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdLmxlbmd0aCk7XHJcbiAgICAgIGxldCB3aXRoaW4gPSB0aGlzLnR1cmZIZWxwZXIuaXNXaXRoaW4oTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzW2xhdGxuZ3MubGVuZ3RoIC0gMV0pLCBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbMF0pKTtcclxuICAgICAgaWYgKHdpdGhpbikge1xyXG4gICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgIGNvb3JkaW5hdGVzLnB1c2goTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbildKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID49IDEpIHtcclxuICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc29sZS5sb2coXCJXaXRoaW4xIFwiLCB3aXRoaW4pO1xyXG4gICAgfSBlbHNlIGlmIChsYXRsbmdzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMTsgaW5kZXggPCBsYXRsbmdzLmxlbmd0aCAtIDE7IGluZGV4KyspIHtcclxuICAgICAgICBsZXQgd2l0aGluID0gdGhpcy50dXJmSGVscGVyLmlzV2l0aGluKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tpbmRleF0pLCBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbMF0pKTtcclxuICAgICAgICBpZiAod2l0aGluKSB7XHJcbiAgICAgICAgICBsYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzLnB1c2goTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGNvb3Jkcy5wdXNoKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKV0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKV0pO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coY29vcmRzKTtcclxuICAgIHJldHVybiBjb29yZHM7XHJcbiAgfVxyXG5cclxuICAvL2ZpbmVcclxuICBwcml2YXRlIGluaXRQb2x5RHJhdygpIHtcclxuICAgIC8vY29uc29sZS5sb2coXCJpbml0UG9seURyYXdcIiwgbnVsbCk7XHJcblxyXG4gICAgY29uc3QgY29udGFpbmVyOiBIVE1MRWxlbWVudCA9IHRoaXMubWFwLmdldENvbnRhaW5lcigpO1xyXG4gICAgY29uc3QgZHJhd01vZGUgPSB0aGlzLmdldERyYXdNb2RlKCk7XHJcbiAgICBpZiAodGhpcy5jb25maWcudG91Y2hTdXBwb3J0KSB7XHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCBlID0+IHtcclxuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xyXG4gICAgICAgICAgdGhpcy5tb3VzZURvd24oZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgZSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcclxuICAgICAgICAgIHRoaXMubW91c2VVcExlYXZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIGUgPT4ge1xyXG4gICAgICAgIGlmIChkcmF3TW9kZSAhPT0gRHJhd01vZGUuT2ZmKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdXNlTW92ZShlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWFwLmFkZExheWVyKHRoaXMudHJhY2VyKTtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuICB9XHJcbiAgLy9UZXN0IEwuTW91c2VFdmVudFxyXG4gIHByaXZhdGUgbW91c2VEb3duKGV2ZW50KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1vdXNlRG93blwiLCBldmVudCk7XHJcblxyXG4gICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT0gbnVsbCkge1xyXG4gICAgICB0aGlzLnRyYWNlci5zZXRMYXRMbmdzKFtldmVudC5sYXRsbmddKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGxhdGxuZyA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcoW2V2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXSk7XHJcbiAgICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW2xhdGxuZ10pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zdGFydERyYXcoKTtcclxuICB9XHJcblxyXG4gIC8vVE9ETyBldmVudCB0eXBlLCBjcmVhdGUgY29udGFpbmVyUG9pbnRUb0xhdExuZy1tZXRob2RcclxuICBwcml2YXRlIG1vdXNlTW92ZShldmVudCkge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcIm1vdXNlTW92ZVwiLCBldmVudCk7XHJcblxyXG4gICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT0gbnVsbCkge1xyXG4gICAgICB0aGlzLnRyYWNlci5hZGRMYXRMbmcoZXZlbnQubGF0bG5nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGxhdGxuZyA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcoW2V2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXSk7XHJcbiAgICAgIHRoaXMudHJhY2VyLmFkZExhdExuZyhsYXRsbmcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy9maW5lXHJcbiAgcHJpdmF0ZSBtb3VzZVVwTGVhdmUoKSB7XHJcbiAgICAvL2NvbnNvbGUubG9nKFwibW91c2VVcExlYXZlXCIsIG51bGwpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgLy9jb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLURlbGV0ZSB0cmFzaGNhbnNcIiwgbnVsbCk7XHJcbiAgICBsZXQgZ2VvUG9zOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+ID0gdGhpcy50dXJmSGVscGVyLnR1cmZDb25jYXZlbWFuKHRoaXMudHJhY2VyLnRvR2VvSlNPTigpIGFzIGFueSk7XHJcbiAgICB0aGlzLnN0b3BEcmF3KCk7XHJcbiAgICBzd2l0Y2ggKHRoaXMuZ2V0RHJhd01vZGUoKSkge1xyXG4gICAgICBjYXNlIERyYXdNb2RlLkFkZFBvbHlnb246XHJcbiAgICAgICAgdGhpcy5hZGRQb2x5Z29uKGdlb1BvcywgdHJ1ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgRHJhd01vZGUuU3VidHJhY3RQb2x5Z29uOlxyXG4gICAgICAgIHRoaXMuc3VidHJhY3RQb2x5Z29uKGdlb1Bvcyk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzKTtcclxuICAgIC8vY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1jcmVhdGUgdHJhc2hjYW5zXCIsIG51bGwpO1xyXG4gIH1cclxuICAvL2ZpbmVcclxuICBwcml2YXRlIHN0YXJ0RHJhdygpIHtcclxuICAgIC8vY29uc29sZS5sb2coXCJzdGFydERyYXdcIiwgbnVsbCk7XHJcblxyXG4gICAgdGhpcy5kcmF3U3RhcnRlZEV2ZW50cyh0cnVlKTtcclxuICB9XHJcbiAgLy9maW5lXHJcbiAgcHJpdmF0ZSBzdG9wRHJhdygpIHtcclxuICAgIC8vY29uc29sZS5sb2coXCJzdG9wRHJhd1wiLCBudWxsKTtcclxuXHJcbiAgICB0aGlzLnJlc2V0VHJhY2tlcigpO1xyXG4gICAgdGhpcy5kcmF3U3RhcnRlZEV2ZW50cyhmYWxzZSk7XHJcbiAgfVxyXG4gIC8vZmluZVxyXG4gIHByaXZhdGUgZHJhd1N0YXJ0ZWRFdmVudHMob25vZmY6IGJvb2xlYW4pIHtcclxuICAgIC8vY29uc29sZS5sb2coXCJkcmF3U3RhcnRlZEV2ZW50c1wiLCBvbm9mZik7XHJcblxyXG4gICAgY29uc3Qgb25vcm9mZiA9IG9ub2ZmID8gXCJvblwiIDogXCJvZmZcIjtcclxuXHJcbiAgICB0aGlzLm1hcFtvbm9yb2ZmXShcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZSwgdGhpcyk7XHJcbiAgICB0aGlzLm1hcFtvbm9yb2ZmXShcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVVwTGVhdmUsIHRoaXMpO1xyXG4gIH1cclxuICAvL09uIGhvbGRcclxuICBwcml2YXRlIHN1YnRyYWN0UG9seWdvbihsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICB0aGlzLnN1YnRyYWN0KGxhdGxuZ3MpO1xyXG4gIH1cclxuICAvL2ZpbmVcclxuICBwcml2YXRlIGFkZFBvbHlnb24obGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiwgc2ltcGxpZnk6IGJvb2xlYW4sIG5vTWVyZ2U6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgY29uc29sZS5sb2coXCJhZGRQb2x5Z29uXCIsIGxhdGxuZ3MsIHNpbXBsaWZ5LCBub01lcmdlLCB0aGlzLmtpbmtzLCB0aGlzLmNvbmZpZyk7XHJcblxyXG4gICAgaWYgKHRoaXMubWVyZ2VQb2x5Z29ucyAmJiAhbm9NZXJnZSAmJiB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDAgJiYgIXRoaXMua2lua3MpIHtcclxuICAgICAgdGhpcy5tZXJnZShsYXRsbmdzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxhdGxuZ3MsIHNpbXBsaWZ5KTtcclxuICAgIH1cclxuICB9XHJcbiAgLy9maW5lXHJcbiAgcHJpdmF0ZSBhZGRQb2x5Z29uTGF5ZXIobGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiwgc2ltcGxpZnk6IGJvb2xlYW4pIHtcclxuICAgIGxldCBmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwID0gbmV3IEwuRmVhdHVyZUdyb3VwKCk7XHJcblxyXG4gICAgY29uc3QgbGF0TG5ncyA9IHNpbXBsaWZ5ID8gdGhpcy50dXJmSGVscGVyLmdldFNpbXBsaWZpZWQobGF0bG5ncykgOiBsYXRsbmdzO1xyXG4gICAgY29uc29sZS5sb2coXCJBZGRQb2x5Z29uTGF5ZXI6IFwiLCBsYXRMbmdzKTtcclxuICAgIGxldCBwb2x5Z29uID0gdGhpcy5nZXRQb2x5Z29uKGxhdExuZ3MpO1xyXG4gICAgZmVhdHVyZUdyb3VwLmFkZExheWVyKHBvbHlnb24pO1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbik7XHJcbiAgICBsZXQgbWFya2VyTGF0bG5ncyA9IHBvbHlnb24uZ2V0TGF0TG5ncygpO1xyXG4gICAgbWFya2VyTGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICBwb2x5Z29uLmZvckVhY2goKHBvbHlFbGVtZW50OiBJTGF0TG5nW10sIGk6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLmFkZE1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hZGRIb2xlTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJIdWxsOiBcIiwgcG9seUVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIC8vIHRoaXMuYWRkTWFya2VyKHBvbHlnb25bMF0sIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgIC8vVE9ETyAtIEh2aXMgcG9seWdvbi5sZW5ndGggPjEsIHPDpSBoYXIgZGVuIGh1bGw6IGVnZW4gYWRkTWFya2VyIGZ1bmtzam9uXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgIGNvbnNvbGUubG9nKFwiQXJyYXk6IFwiLCB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzKTtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuXHJcbiAgICBmZWF0dXJlR3JvdXAub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgdGhpcy5wb2x5Z29uQ2xpY2tlZChlLCBsYXRMbmdzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICAvL2ZpbmVcclxuICBwcml2YXRlIHBvbHlnb25DbGlja2VkKGU6IGFueSwgcG9seTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3QgbmV3UG9pbnQgPSBlLmxhdGxuZztcclxuICAgIGlmIChwb2x5Lmdlb21ldHJ5LnR5cGUgPT09IFwiTXVsdGlQb2x5Z29uXCIpIHtcclxuICAgICAgbGV0IG5ld1BvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIuaW5qZWN0UG9pbnRUb1BvbHlnb24ocG9seSwgW25ld1BvaW50LmxuZywgbmV3UG9pbnQubGF0XSk7XHJcbiAgICAgIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihwb2x5KSk7XHJcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld1BvbHlnb24sIGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy9maW5lXHJcbiAgcHJpdmF0ZSBnZXRQb2x5Z29uKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZ2V0UG9seWdvbnM6IFwiLCBsYXRsbmdzKTtcclxuICAgIGxldCBwb2x5Z29uID0gTC5HZW9KU09OLmdlb21ldHJ5VG9MYXllcihsYXRsbmdzKSBhcyBhbnk7XHJcblxyXG4gICAgcG9seWdvbi5zZXRTdHlsZSh0aGlzLmNvbmZpZy5wb2x5Z29uT3B0aW9ucyk7XHJcbiAgICByZXR1cm4gcG9seWdvbjtcclxuICB9XHJcbiAgLy9maW5lXHJcbiAgcHJpdmF0ZSBtZXJnZShsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1lcmdlXCIsIGxhdGxuZ3MpO1xyXG4gICAgbGV0IHBvbHlnb25GZWF0dXJlID0gW107XHJcbiAgICBjb25zdCBuZXdBcnJheTogTC5GZWF0dXJlR3JvdXBbXSA9IFtdO1xyXG4gICAgbGV0IHBvbHlJbnRlcnNlY3Rpb246IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICBsZXQgZmVhdHVyZUNvbGxlY3Rpb24gPSBmZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xyXG4gICAgICBpZiAoZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICBsZXQgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcclxuICAgICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcclxuICAgICAgICAgIGlmIChwb2x5SW50ZXJzZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIG5ld0FycmF5LnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXSk7XHJcbiAgICAgICAgcG9seUludGVyc2VjdGlvbiA9IHRoaXMudHVyZkhlbHBlci5wb2x5Z29uSW50ZXJzZWN0KGZlYXR1cmUsIGxhdGxuZ3MpO1xyXG4gICAgICAgIGlmIChwb2x5SW50ZXJzZWN0aW9uKSB7XHJcbiAgICAgICAgICBuZXdBcnJheS5wdXNoKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICBwb2x5Z29uRmVhdHVyZS5wdXNoKGZlYXR1cmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zb2xlLmxvZyhuZXdBcnJheSk7XHJcbiAgICBpZiAobmV3QXJyYXkubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLnVuaW9uUG9seWdvbnMobmV3QXJyYXksIGxhdGxuZ3MsIHBvbHlnb25GZWF0dXJlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxhdGxuZ3MsIHRydWUpO1xyXG4gICAgfVxyXG4gIH1cclxuICAvL25leHRcclxuICBwcml2YXRlIHN1YnRyYWN0KGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGxldCBhZGRIb2xlID0gbGF0bG5ncztcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICBsZXQgZmVhdHVyZUNvbGxlY3Rpb24gPSBmZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xyXG4gICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdO1xyXG4gICAgICBsZXQgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcclxuICAgICAgbGV0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24oZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0pO1xyXG4gICAgICBsZXQgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5wb2x5Z29uRGlmZmVyZW5jZShmZWF0dXJlLCBhZGRIb2xlKTtcclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKHBvbHkpO1xyXG4gICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cE9uTWVyZ2UoZmVhdHVyZUdyb3VwKTtcclxuICAgICAgYWRkSG9sZSA9IG5ld1BvbHlnb247XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBuZXdMYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+ID0gYWRkSG9sZTtcclxuICAgIGxldCBjb29yZHMgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0Q29vcmRzKG5ld0xhdGxuZ3MpO1xyXG4gICAgY29vcmRzLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcih0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFt2YWx1ZV0pLCB0cnVlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICAvL2ZpbmVcclxuICBwcml2YXRlIGV2ZW50cyhvbm9mZjogYm9vbGVhbikge1xyXG4gICAgY29uc3Qgb25vcm9mZiA9IG9ub2ZmID8gXCJvblwiIDogXCJvZmZcIjtcclxuICAgIHRoaXMubWFwW29ub3JvZmZdKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VEb3duLCB0aGlzKTtcclxuICB9XHJcbiAgLy9maW5lLCBUT0RPOiBpZiBzcGVjaWFsIG1hcmtlcnNcclxuICBwcml2YXRlIGFkZE1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuXHJcbiAgICBjb25zdCBtZW51TWFya2VySWR4ID0gdGhpcy5nZXRNYXJrZXJJbmRleChsYXRsbmdzLCB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnBvc2l0aW9uKTtcclxuICAgIGNvbnN0IGRlbGV0ZU1hcmtlcklkeCA9IHRoaXMuZ2V0TWFya2VySW5kZXgobGF0bG5ncywgdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnBvc2l0aW9uKTtcclxuXHJcbiAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgaSkgPT4ge1xyXG4gICAgICBsZXQgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICBpZiAoaSA9PT0gbWVudU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyTWVudUljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09PSBkZWxldGVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgbWFya2VyID0gbmV3IEwuTWFya2VyKGxhdGxuZywgeyBpY29uOiB0aGlzLmNyZWF0ZURpdkljb24oaWNvbkNsYXNzZXMpLCBkcmFnZ2FibGU6IHRydWUsIHRpdGxlOiBpLnRvU3RyaW5nKCkgfSk7XHJcbiAgICAgIEZlYXR1cmVHcm91cC5hZGRMYXllcihtYXJrZXIpLmFkZFRvKHRoaXMubWFwKTtcclxuICAgICAgLy8gY29uc29sZS5sb2coXCJGZWF0dXJlR3JvdXA6IFwiLCBGZWF0dXJlR3JvdXApO1xyXG4gICAgICBtYXJrZXIub24oXCJkcmFnXCIsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZyhGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgbWFya2VyLm9uKFwiZHJhZ2VuZFwiLCBlID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlckRyYWdFbmQoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChpID09PSBtZW51TWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvLyBtYXJrZXIuYmluZFBvcHVwKFxyXG4gICAgICAgIC8vICAgdGhpcy5nZXRIdG1sQ29udGVudChlID0+IHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJjbGlja2VkIG9uXCIsIGUudGFyZ2V0KTtcclxuICAgICAgICAvLyAgIH0pXHJcbiAgICAgICAgLy8gKTtcclxuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuY29udmVydFRvQm91bmRzUG9seWdvbihsYXRsbmdzLCB0cnVlKTtcclxuICAgICAgICAgIC8vdGhpcy5jb252ZXJ0VG9TaW1wbGlmaWVkUG9seWdvbihsYXRsbmdzKTtcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09PSBkZWxldGVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkSG9sZU1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XHJcbiAgICAgIGxldCBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VySWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIC8qICBpZiAoaSA9PT0gMCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyTWVudUljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICB9XHJcbiAgICAgIC8vVE9ETy0gbGVnZyB0aWwgZmlsbCBpY29uXHJcbiAgICAgIGlmIChpID09PSBsYXRsbmdzLmxlbmd0aCAtIDEgJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH0gKi9cclxuICAgICAgY29uc3QgbWFya2VyID0gbmV3IEwuTWFya2VyKGxhdGxuZywgeyBpY29uOiB0aGlzLmNyZWF0ZURpdkljb24oaWNvbkNsYXNzZXMpLCBkcmFnZ2FibGU6IHRydWUsIHRpdGxlOiBpLnRvU3RyaW5nKCkgfSk7XHJcbiAgICAgIEZlYXR1cmVHcm91cC5hZGRMYXllcihtYXJrZXIpLmFkZFRvKHRoaXMubWFwKTtcclxuXHJcbiAgICAgIG1hcmtlci5vbihcImRyYWdcIiwgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBtYXJrZXIub24oXCJkcmFnZW5kXCIsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgLyogICBpZiAoaSA9PT0gMCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuICAgICAgICBtYXJrZXIuYmluZFBvcHVwKHRoaXMuZ2V0SHRtbENvbnRlbnQoKGUpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBvblwiLCBlLnRhcmdldCk7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIC8vIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgIC8vICAgdGhpcy50b2dnbGVNYXJrZXJNZW51KCk7XHJcbiAgICAgICAgLy8gfSlcclxuICAgICAgfVxyXG4gICAgICBpZiAoaSA9PT0gbGF0bG5ncy5sZW5ndGggLSAxICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XHJcbiAgICAgICAgbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSAqL1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgY3JlYXRlRGl2SWNvbihjbGFzc05hbWVzOiBzdHJpbmdbXSk6IEwuRGl2SWNvbiB7XHJcbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcy5qb2luKFwiIFwiKTtcclxuICAgIGNvbnN0IGljb24gPSBMLmRpdkljb24oeyBjbGFzc05hbWU6IGNsYXNzZXMgfSk7XHJcbiAgICByZXR1cm4gaWNvbjtcclxuICB9XHJcbiAgLy9UT0RPOiBDbGVhbnVwXHJcbiAgcHJpdmF0ZSBtYXJrZXJEcmFnKEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnN0IG5ld1BvcyA9IFtdO1xyXG4gICAgbGV0IHRlc3RhcnJheSA9IFtdO1xyXG4gICAgbGV0IGhvbGUgPSBbXTtcclxuICAgIGNvbnN0IGxheWVyTGVuZ3RoID0gRmVhdHVyZUdyb3VwLmdldExheWVycygpIGFzIGFueTtcclxuICAgIGxldCBwb3NhcnJheXMgPSBsYXllckxlbmd0aFswXS5nZXRMYXRMbmdzKCk7XHJcbiAgICBjb25zb2xlLmxvZyhwb3NhcnJheXMpO1xyXG4gICAgbGV0IGxlbmd0aCA9IDA7XHJcbiAgICBpZiAocG9zYXJyYXlzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBvc2FycmF5cy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICB0ZXN0YXJyYXkgPSBbXTtcclxuICAgICAgICBob2xlID0gW107XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJQb3Npc2pvbmVyOiBcIiwgcG9zYXJyYXlzW2luZGV4XSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICBpZiAocG9zYXJyYXlzWzBdLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQb3Npc2pvbmVyIDI6IFwiLCBwb3NhcnJheXNbaW5kZXhdW2ldKTtcclxuXHJcbiAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1baV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVswXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkhvbGU6IFwiLCBob2xlKTtcclxuICAgICAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZW5ndGggKz0gcG9zYXJyYXlzW2luZGV4IC0gMV1bMF0ubGVuZ3RoO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJTVGFydCBpbmRleDogXCIsIGxlbmd0aCk7XHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoOyBqIDwgcG9zYXJyYXlzW2luZGV4XVswXS5sZW5ndGggKyBsZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICB0ZXN0YXJyYXkucHVzaCgobGF5ZXJMZW5ndGhbaiArIDFdIGFzIGFueSkuZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICBuZXdQb3MucHVzaChob2xlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHRlc3RhcnJheSA9IFtdXHJcbiAgICAgIGhvbGUgPSBbXTtcclxuICAgICAgbGV0IGxlbmd0aDIgPSAwO1xyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHRlc3RhcnJheSA9IFtdO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiUG9seWdvbiBkcmFnOiBcIiwgcG9zYXJyYXlzWzBdW2luZGV4XSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICBpZiAocG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdWzBdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZW5ndGgyICs9IHBvc2FycmF5c1swXVtpbmRleCAtIDFdLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoMjsgaiA8IHBvc2FycmF5c1swXVtpbmRleF0ubGVuZ3RoICsgbGVuZ3RoMjsgaisrKSB7XHJcbiAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICB9XHJcbiAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkhvbGUgMjogXCIsIGhvbGUpO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJOeWUgcG9zaXNqb25lcjogXCIsIG5ld1Bvcyk7XHJcbiAgICBsYXllckxlbmd0aFswXS5zZXRMYXRMbmdzKG5ld1Bvcyk7XHJcbiAgfVxyXG4gIC8vIGNoZWNrIHRoaXNcclxuICBwcml2YXRlIG1hcmtlckRyYWdFbmQoRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgbGV0IGZlYXR1cmVDb2xsZWN0aW9uID0gRmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyZHJhZ2VuZCBwb2x5Z29uOiBcIiwgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xyXG4gICAgaWYgKGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICBsZXQgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJNYXJrZXJkcmFnZW5kOiBcIiwgZmVhdHVyZSk7XHJcbiAgICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xyXG4gICAgICAgICAgdGhpcy5raW5rcyA9IHRydWU7XHJcbiAgICAgICAgICBsZXQgdW5raW5rID0gdGhpcy50dXJmSGVscGVyLmdldEtpbmtzKGZlYXR1cmUpO1xyXG4gICAgICAgICAgLy8gdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGZlYXR1cmUpKTtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlVua2luazogXCIsIHVua2luayk7XHJcbiAgICAgICAgICB1bmtpbmsuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihwb2x5Z29uKSwgZmFsc2UsIHRydWUpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMua2lua3MgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMuYWRkUG9seWdvbihmZWF0dXJlLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcyk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiTWFya2VyZHJhZ2VuZDogXCIsIGZlYXR1cmUpO1xyXG4gICAgICBpZiAodGhpcy50dXJmSGVscGVyLmhhc0tpbmtzKGZlYXR1cmUpKSB7XHJcbiAgICAgICAgdGhpcy5raW5rcyA9IHRydWU7XHJcbiAgICAgICAgbGV0IHVua2luayA9IHRoaXMudHVyZkhlbHBlci5nZXRLaW5rcyhmZWF0dXJlKTtcclxuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJVbmtpbms6IFwiLCB1bmtpbmspO1xyXG4gICAgICAgIHVua2luay5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihwb2x5Z29uKSwgZmFsc2UsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihmZWF0dXJlKSk7XHJcbiAgICAgICAgdGhpcy5raW5rcyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbihmZWF0dXJlLCBmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UodGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcyk7XHJcbiAgfVxyXG4gIC8vZmluZSwgY2hlY2sgdGhlIHJldHVybmVkIHR5cGVcclxuICBwcml2YXRlIGdldExhdExuZ3NGcm9tSnNvbihmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KTogSUxhdExuZ1tdW10ge1xyXG4gICAgY29uc29sZS5sb2coXCJnZXRMYXRMbmdzRnJvbUpzb246IFwiLCBmZWF0dXJlKTtcclxuICAgIGxldCBjb29yZDtcclxuICAgIGlmIChmZWF0dXJlKSB7XHJcbiAgICAgIGlmIChmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEgJiYgZmVhdHVyZS5nZW9tZXRyeS50eXBlID09PSBcIk11bHRpUG9seWdvblwiKSB7XHJcbiAgICAgICAgY29vcmQgPSBMLkdlb0pTT04uY29vcmRzVG9MYXRMbmdzKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1bMF0pO1xyXG4gICAgICB9IGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0ubGVuZ3RoID4gMSAmJiBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT09IFwiUG9seWdvblwiKSB7XHJcbiAgICAgICAgY29vcmQgPSBMLkdlb0pTT04uY29vcmRzVG9MYXRMbmdzKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvb3JkID0gTC5HZW9KU09OLmNvb3Jkc1RvTGF0TG5ncyhmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdWzBdKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb29yZDtcclxuICB9XHJcblxyXG4gIC8vZmluZVxyXG4gIHByaXZhdGUgdW5pb25Qb2x5Z29ucyhsYXllcnMsIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sIHBvbHlnb25GZWF0dXJlKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInVuaW9uUG9seWdvbnNcIiwgbGF5ZXJzLCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XHJcblxyXG4gICAgbGV0IGFkZE5ldyA9IGxhdGxuZ3M7XHJcbiAgICBsYXllcnMuZm9yRWFjaCgoZmVhdHVyZUdyb3VwLCBpKSA9PiB7XHJcbiAgICAgIGxldCBmZWF0dXJlQ29sbGVjdGlvbiA9IGZlYXR1cmVHcm91cC50b0dlb0pTT04oKTtcclxuICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXTtcclxuICAgICAgbGV0IHBvbHkgPSB0aGlzLmdldExhdExuZ3NGcm9tSnNvbihsYXllcik7XHJcbiAgICAgIGNvbnN0IHVuaW9uID0gdGhpcy50dXJmSGVscGVyLnVuaW9uKGFkZE5ldywgcG9seWdvbkZlYXR1cmVbaV0pOyAvL0NoZWNrIGZvciBtdWx0aXBvbHlnb25zXHJcbiAgICAgIC8vTmVlZHMgYSBjbGVhbnVwIGZvciB0aGUgbmV3IHZlcnNpb25cclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uT25NZXJnZShwb2x5KTtcclxuICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICAgIGFkZE5ldyA9IHVuaW9uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbmV3TGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiA9IGFkZE5ldzsgLy9UcmVuZ2VyIGthbnNramUgdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKCBhZGROZXcpO1xyXG4gICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobmV3TGF0bG5ncywgdHJ1ZSk7XHJcbiAgfVxyXG4gIC8vZmluZVxyXG4gIHByaXZhdGUgcmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlRmVhdHVyZUdyb3VwXCIsIGZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5maWx0ZXIoZmVhdHVyZUdyb3VwcyA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXApO1xyXG4gICAgLy8gdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3VwKTtcclxuICB9XHJcbiAgLy9maW5lIHVudGlsIHJlZmFjdG9yaW5nXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZVwiLCBmZWF0dXJlR3JvdXApO1xyXG5cclxuICAgIGxldCBuZXdBcnJheSA9IFtdO1xyXG4gICAgaWYgKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSkge1xyXG4gICAgICBsZXQgcG9seWdvbiA9IChmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55KS5nZXRMYXRMbmdzKClbMF07XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZm9yRWFjaCh2ID0+IHtcclxuICAgICAgICBpZiAodi5wb2x5Z29uLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF0udG9TdHJpbmcoKSAmJiB2LnBvbHlnb25bMF0udG9TdHJpbmcoKSA9PT0gcG9seWdvblswXVswXS50b1N0cmluZygpKSB7XHJcbiAgICAgICAgICB2LnBvbHlnb24gPSBwb2x5Z29uO1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaCh2KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh2LnBvbHlnb24udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXS50b1N0cmluZygpICYmIHYucG9seWdvblswXS50b1N0cmluZygpICE9PSBwb2x5Z29uWzBdWzBdLnRvU3RyaW5nKCkpIHtcclxuICAgICAgICAgIG5ld0FycmF5LnB1c2godik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMgPSB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZpbHRlcihmZWF0dXJlR3JvdXBzID0+IGZlYXR1cmVHcm91cHMgIT09IGZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xyXG4gICAgfVxyXG4gIH1cclxuICAvL2ZpbmUgdW50aWwgcmVmYWN0b3JpbmdcclxuICBwcml2YXRlIGRlbGV0ZVBvbHlnb25Pbk1lcmdlKHBvbHlnb24pIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZGVsZXRlUG9seWdvbk9uTWVyZ2VcIiwgcG9seWdvbik7XHJcbiAgICBsZXQgcG9seWdvbjIgPSBbXVxyXG4gICAgaWYgKHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBsZXQgbGF5ZXIgPSBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55O1xyXG4gICAgICAgIGxldCBsYXRsbmdzID0gbGF5ZXIuZ2V0TGF0TG5ncygpWzBdO1xyXG4gICAgICAgIHBvbHlnb24yID0gWy4uLmxhdGxuZ3NbMF1dXHJcbiAgICAgICAgaWYgKGxhdGxuZ3NbMF1bMF0gIT09IGxhdGxuZ3NbMF1bbGF0bG5nc1swXS5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgcG9seWdvbjIucHVzaChsYXRsbmdzWzBdWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZXF1YWxzID0gdGhpcy5wb2x5Z29uQXJyYXlFcXVhbHNNZXJnZShwb2x5Z29uMiwgcG9seWdvbik7XHJcblxyXG4gICAgICAgIGlmIChlcXVhbHMpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVFVQUxTXCIsIHBvbHlnb24pO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seWdvbik7XHJcbiAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuICAgICAgICAgIC8vIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy9UT0RPIC0gbGVnZ2UgZXQgYW5uZXQgc3RlZFxyXG4gIHByaXZhdGUgcG9seWdvbkFycmF5RXF1YWxzTWVyZ2UocG9seTE6IGFueVtdLCBwb2x5MjogYW55W10pOiBib29sZWFuIHtcclxuICAgIHJldHVybiBwb2x5MS50b1N0cmluZygpID09PSBwb2x5Mi50b1N0cmluZygpO1xyXG4gIH1cclxuICAvL1RPRE8gLSBsZWdnZSBldCBhbm5ldCBzdGVkXHJcbiAgcHJpdmF0ZSBwb2x5Z29uQXJyYXlFcXVhbHMocG9seTE6IGFueVtdLCBwb2x5MjogYW55W10pOiBib29sZWFuIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwicG9seWdvbkFycmF5RXF1YWxzXCIsIHBvbHkxLCBwb2x5Mik7XHJcblxyXG4gICAgaWYgKHBvbHkxWzBdWzBdKSB7XHJcbiAgICAgIGlmICghcG9seTFbMF1bMF0uZXF1YWxzKHBvbHkyWzBdWzBdKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKCFwb2x5MVswXS5lcXVhbHMocG9seTJbMF0pKSByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAocG9seTEubGVuZ3RoICE9PSBwb2x5Mi5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgLy9maW5lXHJcbiAgcHJpdmF0ZSBzZXRMZWFmbGV0TWFwRXZlbnRzKGVuYWJsZURyYWdnaW5nOiBib29sZWFuLCBlbmFibGVEb3VibGVDbGlja1pvb206IGJvb2xlYW4sIGVuYWJsZVNjcm9sbFdoZWVsWm9vbTogYm9vbGVhbikge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcInNldExlYWZsZXRNYXBFdmVudHNcIiwgZW5hYmxlRHJhZ2dpbmcsIGVuYWJsZURvdWJsZUNsaWNrWm9vbSwgZW5hYmxlU2Nyb2xsV2hlZWxab29tKTtcclxuXHJcbiAgICBlbmFibGVEcmFnZ2luZyA/IHRoaXMubWFwLmRyYWdnaW5nLmVuYWJsZSgpIDogdGhpcy5tYXAuZHJhZ2dpbmcuZGlzYWJsZSgpO1xyXG4gICAgZW5hYmxlRG91YmxlQ2xpY2tab29tID8gdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmVuYWJsZSgpIDogdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmRpc2FibGUoKTtcclxuICAgIGVuYWJsZVNjcm9sbFdoZWVsWm9vbSA/IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5lbmFibGUoKSA6IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XHJcbiAgfVxyXG4gIC8vZmluZVxyXG4gIHNldERyYXdNb2RlKG1vZGU6IERyYXdNb2RlKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInNldERyYXdNb2RlXCIsIHRoaXMubWFwKTtcclxuICAgIHRoaXMuZHJhd01vZGVTdWJqZWN0Lm5leHQobW9kZSk7XHJcbiAgICBpZiAoISF0aGlzLm1hcCkge1xyXG4gICAgICBsZXQgaXNBY3RpdmVEcmF3TW9kZSA9IHRydWU7XHJcbiAgICAgIHN3aXRjaCAobW9kZSkge1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuT2ZmOlxyXG4gICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMubWFwLmdldENvbnRhaW5lcigpLCBcImNyb3NzaGFpci1jdXJzb3ItZW5hYmxlZFwiKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKGZhbHNlKTtcclxuICAgICAgICAgIHRoaXMuc3RvcERyYXcoKTtcclxuICAgICAgICAgIHRoaXMudHJhY2VyLnNldFN0eWxlKHtcclxuICAgICAgICAgICAgY29sb3I6IFwiXCJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5zZXRMZWFmbGV0TWFwRXZlbnRzKHRydWUsIHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgaXNBY3RpdmVEcmF3TW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5BZGRQb2x5Z29uOlxyXG4gICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMubWFwLmdldENvbnRhaW5lcigpLCBcImNyb3NzaGFpci1jdXJzb3ItZW5hYmxlZFwiKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKHRydWUpO1xyXG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xyXG4gICAgICAgICAgICBjb2xvcjogZGVmYXVsdENvbmZpZy5wb2x5TGluZU9wdGlvbnMuY29sb3JcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5zZXRMZWFmbGV0TWFwRXZlbnRzKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdFBvbHlnb246XHJcbiAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksIFwiY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkXCIpO1xyXG4gICAgICAgICAgdGhpcy5ldmVudHModHJ1ZSk7XHJcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XHJcbiAgICAgICAgICAgIGNvbG9yOiBcIiNEOTQ2MEZcIlxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLnNldExlYWZsZXRNYXBFdmVudHMoZmFsc2UsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbW9kZUNoYW5nZShtb2RlOiBEcmF3TW9kZSk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShtb2RlKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy9yZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXHJcbiAgZHJhd01vZGVDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuQWRkUG9seWdvbik7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vcmVtb3ZlLCB1c2UgbW9kZUNoYW5nZVxyXG4gIGZyZWVkcmF3TWVudUNsaWNrKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5BZGRQb2x5Z29uKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcblxyXG4gIC8vcmVtb3ZlLCB1c2UgbW9kZUNoYW5nZVxyXG4gIHN1YnRyYWN0Q2xpY2soKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLlN1YnRyYWN0UG9seWdvbik7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vZmluZVxyXG4gIHByaXZhdGUgcmVzZXRUcmFja2VyKCkge1xyXG4gICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbWzAsIDBdXSk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVNYXJrZXJNZW51KCk6IHZvaWQge1xyXG4gICAgYWxlcnQoXCJvcGVuIG1lbnVcIik7XHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0SHRtbENvbnRlbnQoY2FsbEJhY2s6IEZ1bmN0aW9uKTogSFRNTEVsZW1lbnQge1xyXG4gICAgY29uc3QgY29tcCA9IHRoaXMucG9wdXBHZW5lcmF0b3IuZ2VuZXJhdGVBbHRlclBvcHVwKCk7XHJcbiAgICBjb21wLmluc3RhbmNlLmJib3hDbGlja2VkLnN1YnNjcmliZShlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coXCJiYm94IGNsaWNrZWRcIiwgZSk7XHJcbiAgICAgIGNhbGxCYWNrKGUpO1xyXG4gICAgfSk7XHJcbiAgICBjb21wLmluc3RhbmNlLnNpbXBseWZpQ2xpY2tlZC5zdWJzY3JpYmUoZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwic2ltcGx5ZmkgY2xpY2tlZFwiLCBlKTtcclxuICAgICAgY2FsbEJhY2soZSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb21wLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgfVxyXG4gIHByaXZhdGUgY29udmVydFRvQm91bmRzUG9seWdvbihsYXRsbmdzOiBJTGF0TG5nW10sIGFkZE1pZHBvaW50TWFya2VyczogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcclxuICAgIGxldCBwb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbih0aGlzLmNvbnZlcnRUb0Nvb3JkcyhbbGF0bG5nc10pKTtcclxuICAgIGxldCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihwb2x5Z29uLCBhZGRNaWRwb2ludE1hcmtlcnMpO1xyXG5cclxuXHJcbiAgICB0aGlzLmFkZFBvbHlnb25MYXllcih0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24obmV3UG9seWdvbiksIGZhbHNlKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBjb252ZXJ0VG9TaW1wbGlmaWVkUG9seWdvbihsYXRsbmdzOiBJTGF0TG5nW10pIHtcclxuICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgbGV0IG5ld1BvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKHRoaXMuY29udmVydFRvQ29vcmRzKFtsYXRsbmdzXSkpO1xyXG4gICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIodGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKG5ld1BvbHlnb24pLCB0cnVlKTtcclxuXHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0TWFya2VySW5kZXgobGF0bG5nczogSUxhdExuZ1tdLCBwb3NpdGlvbjogTWFya2VyUG9zaXRpb24pOiBudW1iZXIge1xyXG4gICAgY29uc3QgYm91bmRzOiBMLkxhdExuZ0JvdW5kcyA9IFBvbHlEcmF3VXRpbC5nZXRCb3VuZHMobGF0bG5ncywgKE1hdGguc3FydCgyKSAvIDIpKTtcclxuICAgIGNvbnN0IGNvbXBhc3MgPSBuZXcgQ29tcGFzcyhib3VuZHMuZ2V0U291dGgoKSwgYm91bmRzLmdldFdlc3QoKSwgYm91bmRzLmdldE5vcnRoKCksIGJvdW5kcy5nZXRFYXN0KCkpO1xyXG4gICAgY29uc3QgY29tcGFzc0RpcmVjdGlvbiA9IGNvbXBhc3MuZ2V0RGlyZWN0aW9uKHBvc2l0aW9uKTtcclxuICAgIGNvbnN0IGxhdExuZ1BvaW50OiBJTGF0TG5nID0ge1xyXG4gICAgICAgIGxhdDogY29tcGFzc0RpcmVjdGlvbi5sYXQsXHJcbiAgICAgICAgbG5nOiBjb21wYXNzRGlyZWN0aW9uLmxuZ1xyXG4gICAgfVxyXG4gICAgY29uc3QgdGFyZ2V0UG9pbnQgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0Q29vcmQobGF0TG5nUG9pbnQpO1xyXG4gICAgY29uc3QgZmMgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0RmVhdHVyZVBvaW50Q29sbGVjdGlvbihsYXRsbmdzKTtcclxuICAgIGNvbnN0IG5lYXJlc3RQb2ludElkeCA9IHRoaXMudHVyZkhlbHBlci5nZXROZWFyZXN0UG9pbnRJbmRleCh0YXJnZXRQb2ludCwgZmMgYXMgYW55KVxyXG5cclxuICAgIHJldHVybiBuZWFyZXN0UG9pbnRJZHg7XHJcbn1cclxuXHJcblxyXG59XHJcbi8vZmx5dHQgdGlsIGVudW0udHNcclxuZXhwb3J0IGVudW0gRHJhd01vZGUge1xyXG4gIE9mZiA9IDAsXHJcbiAgQWRkUG9seWdvbiA9IDEsXHJcbiAgRWRpdFBvbHlnb24gPSAyLFxyXG4gIFN1YnRyYWN0UG9seWdvbiA9IDMsXHJcbiAgTG9hZFBvbHlnb24gPSA0XHJcbn0iXX0=