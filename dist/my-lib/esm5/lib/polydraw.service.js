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
var PolyDrawService = /** @class */ (function () {
    function PolyDrawService(mapState, popupGenerator, turfHelper, polygonInformation, leafletHelper) {
        var _this = this;
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
        this.mapState.map$.pipe(filter(function (m) { return m !== null; })).subscribe(function (map) {
            _this.map = map;
            console.log("Kartet: ", map);
            console.log('pre this.config', _this.config);
            _this.config = defaultConfig;
            console.log('this.config', _this.config);
            _this.configurate({});
            console.log('after this.config', _this.config);
            _this.tracer = L.polyline([[0, 0]], _this.config.polyLineOptions);
            _this.initPolyDraw();
        });
        this.polygonInformation.polygonInformation$.subscribe(function (k) {
            console.log('PolyInfo start: ', k);
        });
        // TODO - lage en config observable i mapState og oppdater this.config med den
    }
    // new
    PolyDrawService.prototype.configurate = function (config) {
        // TODO if config is path...
        this.config = tslib_1.__assign({}, defaultConfig, config);
        this.mergePolygons = this.config.mergePolygons;
        this.kinks = this.config.kinks;
    };
    // fine
    PolyDrawService.prototype.closeAndReset = function () {
        // console.log("closeAndReset");
        this.setDrawMode(DrawMode.Off);
        this.removeAllFeatureGroups();
    };
    // make readable
    PolyDrawService.prototype.deletePolygon = function (polygon) {
        var _this = this;
        console.log('deletePolygon: ', polygon);
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(function (featureGroup) {
                var layer = featureGroup.getLayers()[0];
                var latlngs = layer.getLatLngs();
                var length = latlngs.length;
                //  = []
                latlngs.forEach(function (latlng, index) {
                    var polygon3;
                    var test = tslib_1.__spread(latlng);
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
                    var equals = _this.polygonArrayEquals(polygon3, polygon);
                    console.log('equals: ', equals, ' length: ', length);
                    if (equals && length === 1) {
                        _this.polygonInformation.deleteTrashcan(polygon);
                        _this.removeFeatureGroup(featureGroup);
                        console.log(featureGroup.getLayers());
                    }
                    else if (equals && length > 1) {
                        _this.polygonInformation.deleteTrashCanOnMulti([polygon]);
                        latlngs.splice(index, 1);
                        layer.setLatLngs(latlngs);
                        _this.removeFeatureGroup(featureGroup);
                        _this.addPolygonLayer(layer.toGeoJSON(), false);
                    }
                });
            });
        }
    };
    // fine
    PolyDrawService.prototype.removeAllFeatureGroups = function () {
        var _this = this;
        // console.log("removeAllFeatureGroups", null);
        this.arrayOfFeatureGroups.forEach(function (featureGroups) {
            _this.map.removeLayer(featureGroups);
        });
        this.arrayOfFeatureGroups = [];
        this.polygonInformation.deletePolygonInformationStorage();
        // this.polygonDrawStates.reset();
        this.polygonInformation.updatePolygons();
    };
    // fine
    PolyDrawService.prototype.getDrawMode = function () {
        // console.log("getDrawMode", null);
        return this.drawModeSubject.value;
    };
    PolyDrawService.prototype.addViken = function (polygon) {
        this.addPolygonLayer(polygon, true);
    };
    // check this
    PolyDrawService.prototype.addAutoPolygon = function (geographicBorders) {
        var _this = this;
        var featureGroup = new L.FeatureGroup();
        var polygon2 = this.turfHelper.getMultiPolygon(this.convertToCoords(geographicBorders));
        console.log(polygon2);
        var polygon = this.getPolygon(polygon2);
        featureGroup.addLayer(polygon);
        var markerLatlngs = polygon.getLatLngs();
        console.log('markers: ', markerLatlngs);
        markerLatlngs.forEach(function (polygon) {
            polygon.forEach(function (polyElement, i) {
                if (i === 0) {
                    _this.addMarker(polyElement, featureGroup);
                }
                else {
                    _this.addHoleMarker(polyElement, featureGroup);
                    console.log('Hull: ', polyElement);
                }
            });
            // this.addMarker(polygon[0], featureGroup);
            // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
        });
        this.arrayOfFeatureGroups.push(featureGroup);
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
    };
    // innehåll i if'ar flytta till egna metoder
    PolyDrawService.prototype.convertToCoords = function (latlngs) {
        var coords = [];
        console.log(latlngs.length, latlngs);
        if (latlngs.length > 1 && latlngs.length < 3) {
            var coordinates_1 = [];
            console.log(L.GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), latlngs[latlngs.length - 1].length);
            var within = this.turfHelper.isWithin(L.GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), L.GeoJSON.latLngsToCoords(latlngs[0]));
            if (within) {
                latlngs.forEach(function (polygon) {
                    coordinates_1.push(L.GeoJSON.latLngsToCoords(polygon));
                });
            }
            else {
                latlngs.forEach(function (polygon) {
                    coords.push([L.GeoJSON.latLngsToCoords(polygon)]);
                });
            }
            if (coordinates_1.length >= 1) {
                coords.push(coordinates_1);
            }
            console.log('Within1 ', within);
        }
        else if (latlngs.length > 2) {
            var coordinates_2 = [];
            for (var index = 1; index < latlngs.length - 1; index++) {
                var within = this.turfHelper.isWithin(L.GeoJSON.latLngsToCoords(latlngs[index]), L.GeoJSON.latLngsToCoords(latlngs[0]));
                if (within) {
                    latlngs.forEach(function (polygon) {
                        coordinates_2.push(L.GeoJSON.latLngsToCoords(polygon));
                    });
                    coords.push(coordinates_2);
                }
                else {
                    latlngs.forEach(function (polygon) {
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
    };
    // fine
    PolyDrawService.prototype.initPolyDraw = function () {
        var _this = this;
        console.log("initPolyDraw", this.map, this.tracer);
        var container = this.map.getContainer();
        var drawMode = this.getDrawMode();
        if (this.config.touchSupport) {
            container.addEventListener('touchstart', function (e) {
                if (drawMode !== DrawMode.Off) {
                    _this.mouseDown(e);
                }
            });
            container.addEventListener('touchend', function (e) {
                if (drawMode !== DrawMode.Off) {
                    _this.mouseUpLeave();
                }
            });
            container.addEventListener('touchmove', function (e) {
                if (drawMode !== DrawMode.Off) {
                    _this.mouseMove(e);
                }
            });
        }
        this.map.addLayer(this.tracer);
        this.setDrawMode(DrawMode.Off);
    };
    // Test L.MouseEvent
    PolyDrawService.prototype.mouseDown = function (event) {
        console.log('mouseDown', event);
        if (event.originalEvent != null) {
            this.tracer.setLatLngs([event.latlng]);
        }
        else {
            var latlng = this.map.containerPointToLatLng([
                event.touches[0].clientX,
                event.touches[0].clientY
            ]);
            this.tracer.setLatLngs([latlng]);
        }
        this.startDraw();
    };
    // TODO event type, create containerPointToLatLng-method
    PolyDrawService.prototype.mouseMove = function (event) {
        // console.log("mouseMove", event);
        if (event.originalEvent != null) {
            this.tracer.addLatLng(event.latlng);
        }
        else {
            var latlng = this.map.containerPointToLatLng([
                event.touches[0].clientX,
                event.touches[0].clientY
            ]);
            this.tracer.addLatLng(latlng);
        }
    };
    // fine
    PolyDrawService.prototype.mouseUpLeave = function () {
        // console.log("mouseUpLeave", null);
        this.polygonInformation.deletePolygonInformationStorage();
        // console.log("------------------------------Delete trashcans", null);
        var geoPos = this.turfHelper.turfConcaveman(this.tracer.toGeoJSON());
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
    };
    // fine
    PolyDrawService.prototype.startDraw = function () {
        // console.log("startDraw", null);
        this.drawStartedEvents(true);
    };
    // fine
    PolyDrawService.prototype.stopDraw = function () {
        // console.log("stopDraw", null);
        this.resetTracker();
        this.drawStartedEvents(false);
    };
    // fine
    PolyDrawService.prototype.drawStartedEvents = function (onoff) {
        // console.log("drawStartedEvents", onoff);
        var onoroff = onoff ? 'on' : 'off';
        this.map[onoroff]('mousemove', this.mouseMove, this);
        this.map[onoroff]('mouseup', this.mouseUpLeave, this);
    };
    // On hold
    PolyDrawService.prototype.subtractPolygon = function (latlngs) {
        this.subtract(latlngs);
    };
    // fine
    PolyDrawService.prototype.addPolygon = function (latlngs, simplify, noMerge) {
        if (noMerge === void 0) { noMerge = false; }
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
    };
    // fine
    PolyDrawService.prototype.addPolygonLayer = function (latlngs, simplify) {
        var _this = this;
        var featureGroup = new L.FeatureGroup();
        var latLngs = simplify ? this.turfHelper.getSimplified(latlngs) : latlngs;
        console.log('AddPolygonLayer: ', latLngs);
        var polygon = this.getPolygon(latLngs);
        featureGroup.addLayer(polygon);
        console.log(polygon);
        var markerLatlngs = polygon.getLatLngs();
        markerLatlngs.forEach(function (polygon) {
            polygon.forEach(function (polyElement, i) {
                if (i === 0) {
                    _this.addMarker(polyElement, featureGroup);
                }
                else {
                    _this.addHoleMarker(polyElement, featureGroup);
                    console.log('Hull: ', polyElement);
                }
            });
            // this.addMarker(polygon[0], featureGroup);
            // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
        });
        this.arrayOfFeatureGroups.push(featureGroup);
        console.log('Array: ', this.arrayOfFeatureGroups);
        this.setDrawMode(DrawMode.Off);
        featureGroup.on('click', function (e) {
            _this.polygonClicked(e, latLngs);
        });
    };
    // fine
    PolyDrawService.prototype.polygonClicked = function (e, poly) {
        var newPoint = e.latlng;
        if (poly.geometry.type === 'MultiPolygon') {
            var newPolygon = this.turfHelper.injectPointToPolygon(poly, [
                newPoint.lng,
                newPoint.lat
            ]);
            this.deletePolygon(this.getLatLngsFromJson(poly));
            this.addPolygonLayer(newPolygon, false);
        }
    };
    // fine
    PolyDrawService.prototype.getPolygon = function (latlngs) {
        console.log('getPolygons: ', latlngs);
        var polygon = L.GeoJSON.geometryToLayer(latlngs);
        polygon.setStyle(this.config.polygonOptions);
        return polygon;
    };
    // fine
    PolyDrawService.prototype.merge = function (latlngs) {
        var _this = this;
        console.log('merge', latlngs);
        var polygonFeature = [];
        var newArray = [];
        var polyIntersection = false;
        this.arrayOfFeatureGroups.forEach(function (featureGroup) {
            var featureCollection = featureGroup.toGeoJSON();
            if (featureCollection.features[0].geometry.coordinates.length > 1) {
                featureCollection.features[0].geometry.coordinates.forEach(function (element) {
                    var feature = _this.turfHelper.getMultiPolygon([element]);
                    polyIntersection = _this.turfHelper.polygonIntersect(feature, latlngs);
                    if (polyIntersection) {
                        newArray.push(featureGroup);
                        polygonFeature.push(feature);
                    }
                });
            }
            else {
                var feature = _this.turfHelper.getTurfPolygon(featureCollection.features[0]);
                polyIntersection = _this.turfHelper.polygonIntersect(feature, latlngs);
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
    };
    // next
    PolyDrawService.prototype.subtract = function (latlngs) {
        var _this = this;
        var addHole = latlngs;
        this.arrayOfFeatureGroups.forEach(function (featureGroup) {
            var featureCollection = featureGroup.toGeoJSON();
            var layer = featureCollection.features[0];
            var poly = _this.getLatLngsFromJson(layer);
            var feature = _this.turfHelper.getTurfPolygon(featureCollection.features[0]);
            var newPolygon = _this.turfHelper.polygonDifference(feature, addHole);
            _this.deletePolygon(poly);
            _this.removeFeatureGroupOnMerge(featureGroup);
            addHole = newPolygon;
        });
        var newLatlngs = addHole;
        var coords = this.turfHelper.getCoords(newLatlngs);
        coords.forEach(function (value) {
            _this.addPolygonLayer(_this.turfHelper.getMultiPolygon([value]), true);
        });
    };
    // fine
    PolyDrawService.prototype.events = function (onoff) {
        var onoroff = onoff ? 'on' : 'off';
        this.map[onoroff]('mousedown', this.mouseDown, this);
    };
    // fine, TODO: if special markers
    PolyDrawService.prototype.addMarker = function (latlngs, FeatureGroup) {
        var _this = this;
        var menuMarkerIdx = this.getMarkerIndex(latlngs, this.config.markers.markerMenuIcon.position);
        var deleteMarkerIdx = this.getMarkerIndex(latlngs, this.config.markers.markerDeleteIcon.position);
        latlngs.forEach(function (latlng, i) {
            var iconClasses = _this.config.markers.markerIcon.styleClasses;
            if (i === menuMarkerIdx && _this.config.markers.menu) {
                iconClasses = _this.config.markers.markerMenuIcon.styleClasses;
            }
            if (i === deleteMarkerIdx && _this.config.markers.delete) {
                iconClasses = _this.config.markers.markerDeleteIcon.styleClasses;
            }
            var marker = new L.Marker(latlng, {
                icon: _this.createDivIcon(iconClasses),
                draggable: true,
                title: i.toString()
            });
            FeatureGroup.addLayer(marker).addTo(_this.map);
            // console.log("FeatureGroup: ", FeatureGroup);
            marker.on('drag', function (e) {
                _this.markerDrag(FeatureGroup);
            });
            marker.on('dragend', function (e) {
                _this.markerDragEnd(FeatureGroup);
            });
            if (i === menuMarkerIdx && _this.config.markers.menu) {
                // marker.bindPopup(
                //   this.getHtmlContent(e => {
                //     console.log("clicked on", e.target);
                //   })
                // );
                // marker.on("click", e => {
                //   this.convertToBoundsPolygon(e, latlngs)
                // })
            }
            if (i === deleteMarkerIdx && _this.config.markers.delete) {
                marker.on('click', function (e) {
                    _this.deletePolygon([latlngs]);
                });
            }
        });
    };
    PolyDrawService.prototype.addHoleMarker = function (latlngs, FeatureGroup) {
        var _this = this;
        latlngs.forEach(function (latlng, i) {
            var iconClasses = _this.config.markers.markerIcon.styleClasses;
            /*  if (i === 0 && this.config.markers.menu) {
              iconClasses = this.config.markers.markerMenuIcon.styleClasses;
            }
      
            //TODO- legg til fill icon
            if (i === latlngs.length - 1 && this.config.markers.delete) {
              iconClasses = this.config.markers.markerDeleteIcon.styleClasses;
            } */
            var marker = new L.Marker(latlng, {
                icon: _this.createDivIcon(iconClasses),
                draggable: true,
                title: i.toString()
            });
            FeatureGroup.addLayer(marker).addTo(_this.map);
            marker.on('drag', function (e) {
                _this.markerDrag(FeatureGroup);
            });
            marker.on('dragend', function (e) {
                _this.markerDragEnd(FeatureGroup);
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
    };
    PolyDrawService.prototype.createDivIcon = function (classNames) {
        var classes = classNames.join(' ');
        var icon = L.divIcon({ className: classes });
        return icon;
    };
    // TODO: Cleanup
    PolyDrawService.prototype.markerDrag = function (FeatureGroup) {
        var newPos = [];
        var testarray = [];
        var hole = [];
        var layerLength = FeatureGroup.getLayers();
        var posarrays = layerLength[0].getLatLngs();
        console.log(posarrays);
        var length = 0;
        if (posarrays.length > 1) {
            for (var index = 0; index < posarrays.length; index++) {
                testarray = [];
                hole = [];
                console.log('Posisjoner: ', posarrays[index]);
                if (index === 0) {
                    if (posarrays[0].length > 1) {
                        for (var i = 0; index < posarrays[0].length; i++) {
                            console.log('Posisjoner 2: ', posarrays[index][i]);
                            for (var j = 0; j < posarrays[0][i].length; j++) {
                                testarray.push(layerLength[j + 1].getLatLng());
                            }
                            hole.push(testarray);
                        }
                    }
                    else {
                        for (var j = 0; j < posarrays[0][0].length; j++) {
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
                    for (var j = length; j < posarrays[index][0].length + length; j++) {
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
            var length2 = 0;
            for (var index = 0; index < posarrays[0].length; index++) {
                testarray = [];
                console.log('Polygon drag: ', posarrays[0][index]);
                if (index === 0) {
                    if (posarrays[0][index].length > 1) {
                        for (var j = 0; j < posarrays[0][index].length; j++) {
                            testarray.push(layerLength[j + 1].getLatLng());
                        }
                    }
                    else {
                        for (var j = 0; j < posarrays[0][0].length; j++) {
                            testarray.push(layerLength[j + 1].getLatLng());
                        }
                    }
                }
                else {
                    length2 += posarrays[0][index - 1].length;
                    for (var j = length2; j < posarrays[0][index].length + length2; j++) {
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
    };
    // check this
    PolyDrawService.prototype.markerDragEnd = function (FeatureGroup) {
        var _this = this;
        this.polygonInformation.deletePolygonInformationStorage();
        var featureCollection = FeatureGroup.toGeoJSON();
        console.log('Markerdragend polygon: ', featureCollection.features[0].geometry.coordinates);
        if (featureCollection.features[0].geometry.coordinates.length > 1) {
            featureCollection.features[0].geometry.coordinates.forEach(function (element) {
                var feature = _this.turfHelper.getMultiPolygon([element]);
                console.log('Markerdragend: ', feature);
                if (_this.turfHelper.hasKinks(feature)) {
                    _this.kinks = true;
                    var unkink = _this.turfHelper.getKinks(feature);
                    // this.deletePolygon(this.getLatLngsFromJson(feature));
                    _this.removeFeatureGroup(FeatureGroup);
                    console.log('Unkink: ', unkink);
                    unkink.forEach(function (polygon) {
                        _this.addPolygon(_this.turfHelper.getTurfPolygon(polygon), false, true);
                    });
                }
                else {
                    _this.kinks = false;
                    _this.addPolygon(feature, false);
                }
            });
        }
        else {
            var feature = this.turfHelper.getMultiPolygon(featureCollection.features[0].geometry.coordinates);
            console.log('Markerdragend: ', feature);
            if (this.turfHelper.hasKinks(feature)) {
                this.kinks = true;
                var unkink = this.turfHelper.getKinks(feature);
                // this.deletePolygon(this.getLatLngsFromJson(feature));
                this.removeFeatureGroup(FeatureGroup);
                console.log('Unkink: ', unkink);
                unkink.forEach(function (polygon) {
                    _this.addPolygon(_this.turfHelper.getTurfPolygon(polygon), false, true);
                });
            }
            else {
                // this.deletePolygon(this.getLatLngsFromJson(feature));
                this.kinks = false;
                this.addPolygon(feature, false);
            }
        }
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
    };
    // fine, check the returned type
    PolyDrawService.prototype.getLatLngsFromJson = function (feature) {
        console.log('getLatLngsFromJson: ', feature);
        var coord;
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
    };
    // fine
    PolyDrawService.prototype.unionPolygons = function (layers, latlngs, polygonFeature) {
        var _this = this;
        console.log('unionPolygons', layers, latlngs, polygonFeature);
        var addNew = latlngs;
        layers.forEach(function (featureGroup, i) {
            var featureCollection = featureGroup.toGeoJSON();
            var layer = featureCollection.features[0];
            var poly = _this.getLatLngsFromJson(layer);
            var union = _this.turfHelper.union(addNew, polygonFeature[i]); // Check for multipolygons
            // Needs a cleanup for the new version
            _this.deletePolygonOnMerge(poly);
            _this.removeFeatureGroup(featureGroup);
            addNew = union;
        });
        var newLatlngs = addNew; // Trenger kanskje this.turfHelper.getTurfPolygon( addNew);
        this.addPolygonLayer(newLatlngs, true);
    };
    // fine
    PolyDrawService.prototype.removeFeatureGroup = function (featureGroup) {
        console.log('removeFeatureGroup', featureGroup);
        featureGroup.clearLayers();
        this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(function (featureGroups) { return featureGroups !== featureGroup; });
        // this.updatePolygons();
        this.map.removeLayer(featureGroup);
    };
    // fine until refactoring
    PolyDrawService.prototype.removeFeatureGroupOnMerge = function (featureGroup) {
        console.log('removeFeatureGroupOnMerge', featureGroup);
        var newArray = [];
        if (featureGroup.getLayers()[0]) {
            var polygon_1 = featureGroup.getLayers()[0].getLatLngs()[0];
            this.polygonInformation.polygonInformationStorage.forEach(function (v) {
                if (v.polygon.toString() !== polygon_1[0].toString() &&
                    v.polygon[0].toString() === polygon_1[0][0].toString()) {
                    v.polygon = polygon_1;
                    newArray.push(v);
                }
                if (v.polygon.toString() !== polygon_1[0].toString() &&
                    v.polygon[0].toString() !== polygon_1[0][0].toString()) {
                    newArray.push(v);
                }
            });
            featureGroup.clearLayers();
            this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(function (featureGroups) { return featureGroups !== featureGroup; });
            this.map.removeLayer(featureGroup);
        }
    };
    // fine until refactoring
    PolyDrawService.prototype.deletePolygonOnMerge = function (polygon) {
        var _this = this;
        console.log('deletePolygonOnMerge', polygon);
        var polygon2 = [];
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(function (featureGroup) {
                var layer = featureGroup.getLayers()[0];
                var latlngs = layer.getLatLngs()[0];
                polygon2 = tslib_1.__spread(latlngs[0]);
                if (latlngs[0][0] !== latlngs[0][latlngs[0].length - 1]) {
                    polygon2.push(latlngs[0][0]);
                }
                var equals = _this.polygonArrayEqualsMerge(polygon2, polygon);
                if (equals) {
                    console.log('EQUALS', polygon);
                    _this.removeFeatureGroupOnMerge(featureGroup);
                    _this.deletePolygon(polygon);
                    _this.polygonInformation.deleteTrashcan(polygon);
                    // this.updatePolygons();
                }
            });
        }
    };
    // TODO - legge et annet sted
    PolyDrawService.prototype.polygonArrayEqualsMerge = function (poly1, poly2) {
        return poly1.toString() === poly2.toString();
    };
    // TODO - legge et annet sted
    PolyDrawService.prototype.polygonArrayEquals = function (poly1, poly2) {
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
    };
    // fine
    PolyDrawService.prototype.setLeafletMapEvents = function (enableDragging, enableDoubleClickZoom, enableScrollWheelZoom) {
        // console.log("setLeafletMapEvents", enableDragging, enableDoubleClickZoom, enableScrollWheelZoom);
        enableDragging ? this.map.dragging.enable() : this.map.dragging.disable();
        enableDoubleClickZoom
            ? this.map.doubleClickZoom.enable()
            : this.map.doubleClickZoom.disable();
        enableScrollWheelZoom
            ? this.map.scrollWheelZoom.enable()
            : this.map.scrollWheelZoom.disable();
    };
    // fine
    PolyDrawService.prototype.setDrawMode = function (mode) {
        console.log('setDrawMode', this.map);
        this.drawModeSubject.next(mode);
        if (!!this.map) {
            var isActiveDrawMode = true;
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
    };
    PolyDrawService.prototype.modeChange = function (mode) {
        this.setDrawMode(mode);
        this.polygonInformation.saveCurrentState();
    };
    // remove, use modeChange
    PolyDrawService.prototype.drawModeClick = function () {
        this.setDrawMode(DrawMode.AddPolygon);
        this.polygonInformation.saveCurrentState();
    };
    // remove, use modeChange
    PolyDrawService.prototype.freedrawMenuClick = function () {
        this.setDrawMode(DrawMode.AddPolygon);
        this.polygonInformation.saveCurrentState();
    };
    // remove, use modeChange
    PolyDrawService.prototype.subtractClick = function () {
        this.setDrawMode(DrawMode.SubtractPolygon);
        this.polygonInformation.saveCurrentState();
    };
    // fine
    PolyDrawService.prototype.resetTracker = function () {
        this.tracer.setLatLngs([[0, 0]]);
    };
    PolyDrawService.prototype.toggleMarkerMenu = function () {
        alert('open menu');
    };
    PolyDrawService.prototype.getHtmlContent = function (callBack) {
        var comp = this.popupGenerator.generateAlterPopup();
        comp.instance.bboxClicked.subscribe(function (e) {
            console.log('bbox clicked', e);
            callBack(e);
        });
        comp.instance.simplyfiClicked.subscribe(function (e) {
            console.log('simplyfi clicked', e);
            callBack(e);
        });
        return comp.location.nativeElement;
    };
    PolyDrawService.prototype.convertToBoundsPolygon = function (latlngs) {
        var lPoly = this.leafletHelper.createPolygon(latlngs);
        // const coords = this.convertToCoords([latlngs]);
        // const p = this.getPolygon()
        // if (poly.geometry.type === "MultiPolygon") {
        //   let newPolygon = this.turfHelper.convertToBoundingBoxPolygon(poly);
        //   this.deletePolygon(this.getLatLngsFromJson(poly));
        //   this.addPolygonLayer(newPolygon, false);
        // }
    };
    PolyDrawService.prototype.getMarkerIndex = function (latlngs, position) {
        var bounds = PolyDrawUtil.getBounds(latlngs, Math.sqrt(2) / 2);
        var compass = new Compass(bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());
        var compassDirection = compass.getDirection(position);
        var latLngPoint = {
            lat: compassDirection[1],
            lng: compassDirection[0]
        };
        var targetPoint = this.turfHelper.getCoord(latLngPoint);
        var fc = this.turfHelper.getFeaturePointCollection(latlngs);
        var nearestPointIdx = this.turfHelper.getNearestPointIndex(targetPoint, fc);
        return nearestPointIdx;
    };
    PolyDrawService.ctorParameters = function () { return [
        { type: MapStateService },
        { type: ComponentGeneraterService },
        { type: TurfHelperService },
        { type: PolygonInformationService },
        { type: LeafletHelperService }
    ]; };
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
    return PolyDrawService;
}());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9wb2x5ZHJhdy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdCLHNDQUFzQztBQUN0QyxPQUFPLEVBQWMsZUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBRTVDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRWhELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDOzs7Ozs7O0FBT2hFO0lBb0JFLHlCQUNVLFFBQXlCLEVBQ3pCLGNBQXlDLEVBQ3pDLFVBQTZCLEVBQzdCLGtCQUE2QyxFQUM3QyxhQUFtQztRQUw3QyxpQkF5QkM7UUF4QlMsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7UUFDekIsbUJBQWMsR0FBZCxjQUFjLENBQTJCO1FBQ3pDLGVBQVUsR0FBVixVQUFVLENBQW1CO1FBQzdCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBMkI7UUFDN0Msa0JBQWEsR0FBYixhQUFhLENBQXNCO1FBeEI3Qyx5Q0FBeUM7UUFDekMsb0JBQWUsR0FBOEIsSUFBSSxlQUFlLENB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LENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxRCxJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlELElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQzFELFdBQVcsRUFDWCxFQUFTLENBQ1YsQ0FBQztRQUVGLE9BQU8sZUFBZSxDQUFDO0lBQ3pCLENBQUM7O2dCQWw3Qm1CLGVBQWU7Z0JBQ1QseUJBQXlCO2dCQUM3QixpQkFBaUI7Z0JBQ1QseUJBQXlCO2dCQUM5QixvQkFBb0I7OztJQXpCbEMsZUFBZTtRQUozQixVQUFVLENBQUM7WUFDVixVQUFVLEVBQUUsTUFBTTtTQUNuQixDQUFDO1FBQ0YsMkJBQTJCOztpREFzQkwsZUFBZTtZQUNULHlCQUF5QjtZQUM3QixpQkFBaUI7WUFDVCx5QkFBeUI7WUFDOUIsb0JBQW9CO09BekJsQyxlQUFlLENBdzhCM0I7MEJBNzlCRDtDQTY5QkMsQUF4OEJELElBdzhCQztTQXg4QlksZUFBZTtBQXk4QjVCLG9CQUFvQjtBQUNwQixNQUFNLENBQU4sSUFBWSxRQU1YO0FBTkQsV0FBWSxRQUFRO0lBQ2xCLHFDQUFPLENBQUE7SUFDUCxtREFBYyxDQUFBO0lBQ2QscURBQWUsQ0FBQTtJQUNmLDZEQUFtQixDQUFBO0lBQ25CLHFEQUFlLENBQUE7QUFDakIsQ0FBQyxFQU5XLFFBQVEsS0FBUixRQUFRLFFBTW5CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0ICogYXMgTCBmcm9tICdsZWFmbGV0JztcclxuLy8gaW1wb3J0ICogYXMgdHVyZiBmcm9tIFwiQHR1cmYvdHVyZlwiO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBCZWhhdmlvclN1YmplY3QsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBGZWF0dXJlLCBQb2x5Z29uLCBNdWx0aVBvbHlnb24gfSBmcm9tICdAdHVyZi90dXJmJztcclxuaW1wb3J0IHsgTWFwU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi9tYXAtc3RhdGUuc2VydmljZSc7XHJcbmltcG9ydCB7IFR1cmZIZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi90dXJmLWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSB9IGZyb20gJy4vcG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IGRlZmF1bHRDb25maWcgZnJvbSBcIi4vcG9seWluZm8uanNvblwiO1xyXG5cclxuaW1wb3J0IHsgQ29tcG9uZW50R2VuZXJhdGVyU2VydmljZSB9IGZyb20gJy4vY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29tcGFzcywgUG9seURyYXdVdGlsIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IE1hcmtlclBsYWNlbWVudCB9IGZyb20gJy4vZW51bXMnO1xyXG5pbXBvcnQgeyBMZWFmbGV0SGVscGVyU2VydmljZSB9IGZyb20gJy4vbGVhZmxldC1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tICcuL3BvbHlnb24taGVscGVycyc7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXHJcbn0pXHJcbi8vIFJlbmFtZSAtIFBvbHlEcmF3U2VydmljZVxyXG5leHBvcnQgY2xhc3MgUG9seURyYXdTZXJ2aWNlIHtcclxuICAvLyBEcmF3TW9kZXMsIGRldGVybWluZSBVSSBidXR0b25zIGV0Yy4uLlxyXG4gIGRyYXdNb2RlU3ViamVjdDogQmVoYXZpb3JTdWJqZWN0PERyYXdNb2RlPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8RHJhd01vZGU+KFxyXG4gICAgRHJhd01vZGUuT2ZmXHJcbiAgKTtcclxuICBkcmF3TW9kZSQ6IE9ic2VydmFibGU8RHJhd01vZGU+ID0gdGhpcy5kcmF3TW9kZVN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gIHByaXZhdGUgbWFwOiBMLk1hcDtcclxuXHJcbiAgcHJpdmF0ZSBtZXJnZVBvbHlnb25zOiBib29sZWFuO1xyXG4gIHByaXZhdGUga2lua3M6IGJvb2xlYW47XHJcbiAgLy8gYWRkIHRvIGNvbmZpZ1xyXG4gIHByaXZhdGUgYXJyYXlPZkZlYXR1cmVHcm91cHM6IEwuRmVhdHVyZUdyb3VwPEwuTGF5ZXI+W10gPSBbXTtcclxuICBwcml2YXRlIHRyYWNlcjogTC5Qb2x5bGluZSA9IHt9IGFzIGFueTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHBvbHlnb25EcmF3U3RhdGVzID0gbnVsbDtcclxuICAvLyBlbmQgYWRkIHRvIGNvbmZpZ1xyXG5cclxuICBwcml2YXRlIG5nVW5zdWJzY3JpYmUgPSBuZXcgU3ViamVjdCgpO1xyXG4gIHByaXZhdGUgY29uZmlnOiB0eXBlb2YgZGVmYXVsdENvbmZpZyA9IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBtYXBTdGF0ZTogTWFwU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBwb3B1cEdlbmVyYXRvcjogQ29tcG9uZW50R2VuZXJhdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgdHVyZkhlbHBlcjogVHVyZkhlbHBlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBvbHlnb25JbmZvcm1hdGlvbjogUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSxcclxuICAgIHByaXZhdGUgbGVhZmxldEhlbHBlcjogTGVhZmxldEhlbHBlclNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMubWFwU3RhdGUubWFwJC5waXBlKGZpbHRlcihtID0+IG0gIT09IG51bGwpKS5zdWJzY3JpYmUoKG1hcDogTC5NYXApID0+IHtcclxuICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiS2FydGV0OiBcIiwgbWFwKTtcclxuICAgICAgY29uc29sZS5sb2coJ3ByZSB0aGlzLmNvbmZpZycsIHRoaXMuY29uZmlnKTtcclxuICAgICAgdGhpcy5jb25maWcgPSBkZWZhdWx0Q29uZmlnO1xyXG4gICAgICBjb25zb2xlLmxvZygndGhpcy5jb25maWcnLCB0aGlzLmNvbmZpZyk7XHJcbiAgICAgIHRoaXMuY29uZmlndXJhdGUoe30pO1xyXG4gICAgICBjb25zb2xlLmxvZygnYWZ0ZXIgdGhpcy5jb25maWcnLCB0aGlzLmNvbmZpZyk7XHJcbiAgICAgIHRoaXMudHJhY2VyID0gTC5wb2x5bGluZShbWzAsIDBdXSwgdGhpcy5jb25maWcucG9seUxpbmVPcHRpb25zKTtcclxuXHJcbiAgICAgIHRoaXMuaW5pdFBvbHlEcmF3KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb24kLnN1YnNjcmliZShrID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ1BvbHlJbmZvIHN0YXJ0OiAnLCBrKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRPRE8gLSBsYWdlIGVuIGNvbmZpZyBvYnNlcnZhYmxlIGkgbWFwU3RhdGUgb2cgb3BwZGF0ZXIgdGhpcy5jb25maWcgbWVkIGRlblxyXG4gIH1cclxuICAvLyBuZXdcclxuICBjb25maWd1cmF0ZShjb25maWc6IE9iamVjdCk6IHZvaWQge1xyXG4gICAgLy8gVE9ETyBpZiBjb25maWcgaXMgcGF0aC4uLlxyXG4gICAgdGhpcy5jb25maWcgPSB7IC4uLmRlZmF1bHRDb25maWcsIC4uLmNvbmZpZyB9O1xyXG5cclxuICAgIHRoaXMubWVyZ2VQb2x5Z29ucyA9IHRoaXMuY29uZmlnLm1lcmdlUG9seWdvbnM7XHJcbiAgICB0aGlzLmtpbmtzID0gdGhpcy5jb25maWcua2lua3M7XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgY2xvc2VBbmRSZXNldCgpOiB2b2lkIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiY2xvc2VBbmRSZXNldFwiKTtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuICAgIHRoaXMucmVtb3ZlQWxsRmVhdHVyZUdyb3VwcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gbWFrZSByZWFkYWJsZVxyXG4gIGRlbGV0ZVBvbHlnb24ocG9seWdvbjogSUxhdExuZ1tdW10pIHtcclxuICAgIGNvbnNvbGUubG9nKCdkZWxldGVQb2x5Z29uOiAnLCBwb2x5Z29uKTtcclxuICAgIGlmICh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55O1xyXG4gICAgICAgIGNvbnN0IGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gbGF0bG5ncy5sZW5ndGg7XHJcbiAgICAgICAgLy8gID0gW11cclxuICAgICAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgaW5kZXgpID0+IHtcclxuICAgICAgICAgIGxldCBwb2x5Z29uMztcclxuICAgICAgICAgIGNvbnN0IHRlc3QgPSBbLi4ubGF0bG5nXTtcclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhsYXRsbmcpO1xyXG4gICAgICAgICAgaWYgKGxhdGxuZy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGlmIChsYXRsbmdbMF1bMF0gIT09IGxhdGxuZ1swXVtsYXRsbmdbMF0ubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgICAgICB0ZXN0WzBdLnB1c2gobGF0bG5nWzBdWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwb2x5Z29uMyA9IFt0ZXN0WzBdXTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChsYXRsbmdbMF0gIT09IGxhdGxuZ1tsYXRsbmcubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgICAgICB0ZXN0LnB1c2gobGF0bG5nWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwb2x5Z29uMyA9IHRlc3Q7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1Rlc3Q6ICcsIHBvbHlnb24zKTtcclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBlcXVhbHMgPSB0aGlzLnBvbHlnb25BcnJheUVxdWFscyhwb2x5Z29uMywgcG9seWdvbik7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnZXF1YWxzOiAnLCBlcXVhbHMsICcgbGVuZ3RoOiAnLCBsZW5ndGgpO1xyXG4gICAgICAgICAgaWYgKGVxdWFscyAmJiBsZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlVHJhc2hjYW4ocG9seWdvbik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKCkpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChlcXVhbHMgJiYgbGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaENhbk9uTXVsdGkoW3BvbHlnb25dKTtcclxuICAgICAgICAgICAgbGF0bG5ncy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICBsYXllci5zZXRMYXRMbmdzKGxhdGxuZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXllci50b0dlb0pTT04oKSwgZmFsc2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHJlbW92ZUFsbEZlYXR1cmVHcm91cHMoKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInJlbW92ZUFsbEZlYXR1cmVHcm91cHNcIiwgbnVsbCk7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwcyA9PiB7XHJcbiAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKGZlYXR1cmVHcm91cHMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3VwcyA9IFtdO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgLy8gdGhpcy5wb2x5Z29uRHJhd1N0YXRlcy5yZXNldCgpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24udXBkYXRlUG9seWdvbnMoKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIGdldERyYXdNb2RlKCk6IERyYXdNb2RlIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZ2V0RHJhd01vZGVcIiwgbnVsbCk7XHJcbiAgICByZXR1cm4gdGhpcy5kcmF3TW9kZVN1YmplY3QudmFsdWU7XHJcbiAgfVxyXG5cclxuICBhZGRWaWtlbihwb2x5Z29uKSB7XHJcbiAgICB0aGlzLmFkZFBvbHlnb25MYXllcihwb2x5Z29uLCB0cnVlKTtcclxuICB9XHJcblxyXG4gIC8vIGNoZWNrIHRoaXNcclxuICBhZGRBdXRvUG9seWdvbihnZW9ncmFwaGljQm9yZGVyczogTC5MYXRMbmdbXVtdKTogdm9pZCB7XHJcbiAgICBjb25zdCBmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwID0gbmV3IEwuRmVhdHVyZUdyb3VwKCk7XHJcblxyXG4gICAgY29uc3QgcG9seWdvbjIgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFxyXG4gICAgICB0aGlzLmNvbnZlcnRUb0Nvb3JkcyhnZW9ncmFwaGljQm9yZGVycylcclxuICAgICk7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMik7XHJcbiAgICBjb25zdCBwb2x5Z29uID0gdGhpcy5nZXRQb2x5Z29uKHBvbHlnb24yKTtcclxuXHJcbiAgICBmZWF0dXJlR3JvdXAuYWRkTGF5ZXIocG9seWdvbik7XHJcbiAgICBjb25zdCBtYXJrZXJMYXRsbmdzID0gcG9seWdvbi5nZXRMYXRMbmdzKCk7XHJcbiAgICBjb25zb2xlLmxvZygnbWFya2VyczogJywgbWFya2VyTGF0bG5ncyk7XHJcbiAgICBtYXJrZXJMYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgIHBvbHlnb24uZm9yRWFjaCgocG9seUVsZW1lbnQsIGkpID0+IHtcclxuICAgICAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgdGhpcy5hZGRNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuYWRkSG9sZU1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdIdWxsOiAnLCBwb2x5RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgLy8gdGhpcy5hZGRNYXJrZXIocG9seWdvblswXSwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgLy8gVE9ETyAtIEh2aXMgcG9seWdvbi5sZW5ndGggPjEsIHPDpSBoYXIgZGVuIGh1bGw6IGVnZW4gYWRkTWFya2VyIGZ1bmtzam9uXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHNcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBpbm5laMOlbGwgaSBpZidhciBmbHl0dGEgdGlsbCBlZ25hIG1ldG9kZXJcclxuICBwcml2YXRlIGNvbnZlcnRUb0Nvb3JkcyhsYXRsbmdzOiBJTGF0TG5nW11bXSkge1xyXG4gICAgY29uc3QgY29vcmRzID0gW107XHJcbiAgICBjb25zb2xlLmxvZyhsYXRsbmdzLmxlbmd0aCwgbGF0bG5ncyk7XHJcbiAgICBpZiAobGF0bG5ncy5sZW5ndGggPiAxICYmIGxhdGxuZ3MubGVuZ3RoIDwgMykge1xyXG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IFtdO1xyXG4gICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSksXHJcbiAgICAgICAgbGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdLmxlbmd0aFxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCB3aXRoaW4gPSB0aGlzLnR1cmZIZWxwZXIuaXNXaXRoaW4oXHJcbiAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzW2xhdGxuZ3MubGVuZ3RoIC0gMV0pLFxyXG4gICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSlcclxuICAgICAgKTtcclxuICAgICAgaWYgKHdpdGhpbikge1xyXG4gICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgIGNvb3JkaW5hdGVzLnB1c2goTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbildKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID49IDEpIHtcclxuICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc29sZS5sb2coJ1dpdGhpbjEgJywgd2l0aGluKTtcclxuICAgIH0gZWxzZSBpZiAobGF0bG5ncy5sZW5ndGggPiAyKSB7XHJcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMTsgaW5kZXggPCBsYXRsbmdzLmxlbmd0aCAtIDE7IGluZGV4KyspIHtcclxuICAgICAgICBjb25zdCB3aXRoaW4gPSB0aGlzLnR1cmZIZWxwZXIuaXNXaXRoaW4oXHJcbiAgICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbaW5kZXhdKSxcclxuICAgICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSlcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmICh3aXRoaW4pIHtcclxuICAgICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgY29vcmRpbmF0ZXMucHVzaChMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHBvbHlnb24pKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgY29vcmRzLnB1c2goY29vcmRpbmF0ZXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICAgIGNvb3Jkcy5wdXNoKFtMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHBvbHlnb24pXSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvb3Jkcy5wdXNoKFtMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbMF0pXSk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhjb29yZHMpO1xyXG4gICAgcmV0dXJuIGNvb3JkcztcclxuICB9XHJcblxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGluaXRQb2x5RHJhdygpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiaW5pdFBvbHlEcmF3XCIsIHRoaXMubWFwLCB0aGlzLnRyYWNlcik7XHJcblxyXG4gICAgY29uc3QgY29udGFpbmVyOiBIVE1MRWxlbWVudCA9IHRoaXMubWFwLmdldENvbnRhaW5lcigpO1xyXG4gICAgY29uc3QgZHJhd01vZGUgPSB0aGlzLmdldERyYXdNb2RlKCk7XHJcbiAgICBpZiAodGhpcy5jb25maWcudG91Y2hTdXBwb3J0KSB7XHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcclxuICAgICAgICAgIHRoaXMubW91c2VEb3duKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBlID0+IHtcclxuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xyXG4gICAgICAgICAgdGhpcy5tb3VzZVVwTGVhdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGUgPT4ge1xyXG4gICAgICAgIGlmIChkcmF3TW9kZSAhPT0gRHJhd01vZGUuT2ZmKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdXNlTW92ZShlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWFwLmFkZExheWVyKHRoaXMudHJhY2VyKTtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuICB9XHJcbiAgLy8gVGVzdCBMLk1vdXNlRXZlbnRcclxuICBwcml2YXRlIG1vdXNlRG93bihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coJ21vdXNlRG93bicsIGV2ZW50KTtcclxuXHJcbiAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW2V2ZW50LmxhdGxuZ10pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgbGF0bG5nID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhbXHJcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLFxyXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WVxyXG4gICAgICBdKTtcclxuICAgICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbbGF0bG5nXSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXJ0RHJhdygpO1xyXG4gIH1cclxuXHJcbiAgLy8gVE9ETyBldmVudCB0eXBlLCBjcmVhdGUgY29udGFpbmVyUG9pbnRUb0xhdExuZy1tZXRob2RcclxuICBwcml2YXRlIG1vdXNlTW92ZShldmVudCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJtb3VzZU1vdmVcIiwgZXZlbnQpO1xyXG5cclxuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9IG51bGwpIHtcclxuICAgICAgdGhpcy50cmFjZXIuYWRkTGF0TG5nKGV2ZW50LmxhdGxuZyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBsYXRsbmcgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKFtcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgIF0pO1xyXG4gICAgICB0aGlzLnRyYWNlci5hZGRMYXRMbmcobGF0bG5nKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIG1vdXNlVXBMZWF2ZSgpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwibW91c2VVcExlYXZlXCIsIG51bGwpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1EZWxldGUgdHJhc2hjYW5zXCIsIG51bGwpO1xyXG4gICAgY29uc3QgZ2VvUG9zOiBGZWF0dXJlPFxyXG4gICAgICBQb2x5Z29uIHwgTXVsdGlQb2x5Z29uXHJcbiAgICA+ID0gdGhpcy50dXJmSGVscGVyLnR1cmZDb25jYXZlbWFuKHRoaXMudHJhY2VyLnRvR2VvSlNPTigpIGFzIGFueSk7XHJcbiAgICB0aGlzLnN0b3BEcmF3KCk7XHJcbiAgICBzd2l0Y2ggKHRoaXMuZ2V0RHJhd01vZGUoKSkge1xyXG4gICAgICBjYXNlIERyYXdNb2RlLkFkZFBvbHlnb246XHJcbiAgICAgICAgdGhpcy5hZGRQb2x5Z29uKGdlb1BvcywgdHJ1ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgRHJhd01vZGUuU3VidHJhY3RQb2x5Z29uOlxyXG4gICAgICAgIHRoaXMuc3VidHJhY3RQb2x5Z29uKGdlb1Bvcyk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwc1xyXG4gICAgKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tY3JlYXRlIHRyYXNoY2Fuc1wiLCBudWxsKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc3RhcnREcmF3KCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJzdGFydERyYXdcIiwgbnVsbCk7XHJcblxyXG4gICAgdGhpcy5kcmF3U3RhcnRlZEV2ZW50cyh0cnVlKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc3RvcERyYXcoKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInN0b3BEcmF3XCIsIG51bGwpO1xyXG5cclxuICAgIHRoaXMucmVzZXRUcmFja2VyKCk7XHJcbiAgICB0aGlzLmRyYXdTdGFydGVkRXZlbnRzKGZhbHNlKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZHJhd1N0YXJ0ZWRFdmVudHMob25vZmY6IGJvb2xlYW4pIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZHJhd1N0YXJ0ZWRFdmVudHNcIiwgb25vZmYpO1xyXG5cclxuICAgIGNvbnN0IG9ub3JvZmYgPSBvbm9mZiA/ICdvbicgOiAnb2ZmJztcclxuXHJcbiAgICB0aGlzLm1hcFtvbm9yb2ZmXSgnbW91c2Vtb3ZlJywgdGhpcy5tb3VzZU1vdmUsIHRoaXMpO1xyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oJ21vdXNldXAnLCB0aGlzLm1vdXNlVXBMZWF2ZSwgdGhpcyk7XHJcbiAgfVxyXG4gIC8vIE9uIGhvbGRcclxuICBwcml2YXRlIHN1YnRyYWN0UG9seWdvbihsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICB0aGlzLnN1YnRyYWN0KGxhdGxuZ3MpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBhZGRQb2x5Z29uKFxyXG4gICAgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIHNpbXBsaWZ5OiBib29sZWFuLFxyXG4gICAgbm9NZXJnZTogYm9vbGVhbiA9IGZhbHNlXHJcbiAgKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcclxuICAgICAgJ2FkZFBvbHlnb24nLFxyXG4gICAgICBsYXRsbmdzLFxyXG4gICAgICBzaW1wbGlmeSxcclxuICAgICAgbm9NZXJnZSxcclxuICAgICAgdGhpcy5raW5rcyxcclxuICAgICAgdGhpcy5jb25maWdcclxuICAgICk7XHJcblxyXG4gICAgaWYgKFxyXG4gICAgICB0aGlzLm1lcmdlUG9seWdvbnMgJiZcclxuICAgICAgIW5vTWVyZ2UgJiZcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwICYmXHJcbiAgICAgICF0aGlzLmtpbmtzXHJcbiAgICApIHtcclxuICAgICAgdGhpcy5tZXJnZShsYXRsbmdzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxhdGxuZ3MsIHNpbXBsaWZ5KTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgYWRkUG9seWdvbkxheWVyKFxyXG4gICAgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIHNpbXBsaWZ5OiBib29sZWFuXHJcbiAgKSB7XHJcbiAgICBjb25zdCBmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwID0gbmV3IEwuRmVhdHVyZUdyb3VwKCk7XHJcblxyXG4gICAgY29uc3QgbGF0TG5ncyA9IHNpbXBsaWZ5ID8gdGhpcy50dXJmSGVscGVyLmdldFNpbXBsaWZpZWQobGF0bG5ncykgOiBsYXRsbmdzO1xyXG4gICAgY29uc29sZS5sb2coJ0FkZFBvbHlnb25MYXllcjogJywgbGF0TG5ncyk7XHJcbiAgICBjb25zdCBwb2x5Z29uID0gdGhpcy5nZXRQb2x5Z29uKGxhdExuZ3MpO1xyXG4gICAgZmVhdHVyZUdyb3VwLmFkZExheWVyKHBvbHlnb24pO1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbik7XHJcbiAgICBjb25zdCBtYXJrZXJMYXRsbmdzID0gcG9seWdvbi5nZXRMYXRMbmdzKCk7XHJcbiAgICBtYXJrZXJMYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgIHBvbHlnb24uZm9yRWFjaCgocG9seUVsZW1lbnQ6IElMYXRMbmdbXSwgaTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGkgPT09IDApIHtcclxuICAgICAgICAgIHRoaXMuYWRkTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmFkZEhvbGVNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnSHVsbDogJywgcG9seUVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIC8vIHRoaXMuYWRkTWFya2VyKHBvbHlnb25bMF0sIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgIC8vIFRPRE8gLSBIdmlzIHBvbHlnb24ubGVuZ3RoID4xLCBzw6UgaGFyIGRlbiBodWxsOiBlZ2VuIGFkZE1hcmtlciBmdW5rc2pvblxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5wdXNoKGZlYXR1cmVHcm91cCk7XHJcbiAgICBjb25zb2xlLmxvZygnQXJyYXk6ICcsIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMpO1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xyXG5cclxuICAgIGZlYXR1cmVHcm91cC5vbignY2xpY2snLCBlID0+IHtcclxuICAgICAgdGhpcy5wb2x5Z29uQ2xpY2tlZChlLCBsYXRMbmdzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBwb2x5Z29uQ2xpY2tlZChlOiBhbnksIHBvbHk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnN0IG5ld1BvaW50ID0gZS5sYXRsbmc7XHJcbiAgICBpZiAocG9seS5nZW9tZXRyeS50eXBlID09PSAnTXVsdGlQb2x5Z29uJykge1xyXG4gICAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmluamVjdFBvaW50VG9Qb2x5Z29uKHBvbHksIFtcclxuICAgICAgICBuZXdQb2ludC5sbmcsXHJcbiAgICAgICAgbmV3UG9pbnQubGF0XHJcbiAgICAgIF0pO1xyXG4gICAgICB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24ocG9seSkpO1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihuZXdQb2x5Z29uLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGdldFBvbHlnb24obGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc29sZS5sb2coJ2dldFBvbHlnb25zOiAnLCBsYXRsbmdzKTtcclxuICAgIGNvbnN0IHBvbHlnb24gPSBMLkdlb0pTT04uZ2VvbWV0cnlUb0xheWVyKGxhdGxuZ3MpIGFzIGFueTtcclxuXHJcbiAgICBwb2x5Z29uLnNldFN0eWxlKHRoaXMuY29uZmlnLnBvbHlnb25PcHRpb25zKTtcclxuICAgIHJldHVybiBwb2x5Z29uO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBtZXJnZShsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zb2xlLmxvZygnbWVyZ2UnLCBsYXRsbmdzKTtcclxuICAgIGNvbnN0IHBvbHlnb25GZWF0dXJlID0gW107XHJcbiAgICBjb25zdCBuZXdBcnJheTogTC5GZWF0dXJlR3JvdXBbXSA9IFtdO1xyXG4gICAgbGV0IHBvbHlJbnRlcnNlY3Rpb24gPSBmYWxzZTtcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICBjb25zdCBmZWF0dXJlQ29sbGVjdGlvbiA9IGZlYXR1cmVHcm91cC50b0dlb0pTT04oKSBhcyBhbnk7XHJcbiAgICAgIGlmIChmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFtlbGVtZW50XSk7XHJcbiAgICAgICAgICBwb2x5SW50ZXJzZWN0aW9uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25JbnRlcnNlY3QoZmVhdHVyZSwgbGF0bG5ncyk7XHJcbiAgICAgICAgICBpZiAocG9seUludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgICBuZXdBcnJheS5wdXNoKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIHBvbHlnb25GZWF0dXJlLnB1c2goZmVhdHVyZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihcclxuICAgICAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdXHJcbiAgICAgICAgKTtcclxuICAgICAgICBwb2x5SW50ZXJzZWN0aW9uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25JbnRlcnNlY3QoZmVhdHVyZSwgbGF0bG5ncyk7XHJcbiAgICAgICAgaWYgKHBvbHlJbnRlcnNlY3Rpb24pIHtcclxuICAgICAgICAgIG5ld0FycmF5LnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIHBvbHlnb25GZWF0dXJlLnB1c2goZmVhdHVyZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGNvbnNvbGUubG9nKG5ld0FycmF5KTtcclxuICAgIGlmIChuZXdBcnJheS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMudW5pb25Qb2x5Z29ucyhuZXdBcnJheSwgbGF0bG5ncywgcG9seWdvbkZlYXR1cmUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobGF0bG5ncywgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIG5leHRcclxuICBwcml2YXRlIHN1YnRyYWN0KGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGxldCBhZGRIb2xlID0gbGF0bG5ncztcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICBjb25zdCBmZWF0dXJlQ29sbGVjdGlvbiA9IGZlYXR1cmVHcm91cC50b0dlb0pTT04oKSBhcyBhbnk7XHJcbiAgICAgIGNvbnN0IGxheWVyID0gZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF07XHJcbiAgICAgIGNvbnN0IHBvbHkgPSB0aGlzLmdldExhdExuZ3NGcm9tSnNvbihsYXllcik7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24oXHJcbiAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF1cclxuICAgICAgKTtcclxuICAgICAgY29uc3QgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5wb2x5Z29uRGlmZmVyZW5jZShmZWF0dXJlLCBhZGRIb2xlKTtcclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKHBvbHkpO1xyXG4gICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cE9uTWVyZ2UoZmVhdHVyZUdyb3VwKTtcclxuICAgICAgYWRkSG9sZSA9IG5ld1BvbHlnb247XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBuZXdMYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+ID0gYWRkSG9sZTtcclxuICAgIGNvbnN0IGNvb3JkcyA9IHRoaXMudHVyZkhlbHBlci5nZXRDb29yZHMobmV3TGF0bG5ncyk7XHJcbiAgICBjb29yZHMuZm9yRWFjaCh2YWx1ZSA9PiB7XHJcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW3ZhbHVlXSksIHRydWUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGV2ZW50cyhvbm9mZjogYm9vbGVhbikge1xyXG4gICAgY29uc3Qgb25vcm9mZiA9IG9ub2ZmID8gJ29uJyA6ICdvZmYnO1xyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oJ21vdXNlZG93bicsIHRoaXMubW91c2VEb3duLCB0aGlzKTtcclxuICB9XHJcbiAgLy8gZmluZSwgVE9ETzogaWYgc3BlY2lhbCBtYXJrZXJzXHJcbiAgcHJpdmF0ZSBhZGRNYXJrZXIobGF0bG5nczogSUxhdExuZ1tdLCBGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICBjb25zdCBtZW51TWFya2VySWR4ID0gdGhpcy5nZXRNYXJrZXJJbmRleChcclxuICAgICAgbGF0bG5ncyxcclxuICAgICAgdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5wb3NpdGlvblxyXG4gICAgKTtcclxuICAgIGNvbnN0IGRlbGV0ZU1hcmtlcklkeCA9IHRoaXMuZ2V0TWFya2VySW5kZXgoXHJcbiAgICAgIGxhdGxuZ3MsXHJcbiAgICAgIHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5wb3NpdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgaSkgPT4ge1xyXG4gICAgICBsZXQgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICBpZiAoaSA9PT0gbWVudU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyTWVudUljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09PSBkZWxldGVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgbWFya2VyID0gbmV3IEwuTWFya2VyKGxhdGxuZywge1xyXG4gICAgICAgIGljb246IHRoaXMuY3JlYXRlRGl2SWNvbihpY29uQ2xhc3NlcyksXHJcbiAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgIHRpdGxlOiBpLnRvU3RyaW5nKClcclxuICAgICAgfSk7XHJcbiAgICAgIEZlYXR1cmVHcm91cC5hZGRMYXllcihtYXJrZXIpLmFkZFRvKHRoaXMubWFwKTtcclxuICAgICAgLy8gY29uc29sZS5sb2coXCJGZWF0dXJlR3JvdXA6IFwiLCBGZWF0dXJlR3JvdXApO1xyXG4gICAgICBtYXJrZXIub24oJ2RyYWcnLCBlID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlckRyYWcoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIG1hcmtlci5vbignZHJhZ2VuZCcsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgaWYgKGkgPT09IG1lbnVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XHJcbiAgICAgICAgLy8gbWFya2VyLmJpbmRQb3B1cChcclxuICAgICAgICAvLyAgIHRoaXMuZ2V0SHRtbENvbnRlbnQoZSA9PiB7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBvblwiLCBlLnRhcmdldCk7XHJcbiAgICAgICAgLy8gICB9KVxyXG4gICAgICAgIC8vICk7XHJcbiAgICAgICAgLy8gbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgLy8gICB0aGlzLmNvbnZlcnRUb0JvdW5kc1BvbHlnb24oZSwgbGF0bG5ncylcclxuICAgICAgICAvLyB9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09PSBkZWxldGVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBtYXJrZXIub24oJ2NsaWNrJywgZSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkZEhvbGVNYXJrZXIobGF0bG5nczogSUxhdExuZ1tdLCBGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgaSkgPT4ge1xyXG4gICAgICBjb25zdCBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VySWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIC8qICBpZiAoaSA9PT0gMCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyTWVudUljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL1RPRE8tIGxlZ2cgdGlsIGZpbGwgaWNvblxyXG4gICAgICBpZiAoaSA9PT0gbGF0bG5ncy5sZW5ndGggLSAxICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XHJcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckRlbGV0ZUljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICB9ICovXHJcbiAgICAgIGNvbnN0IG1hcmtlciA9IG5ldyBMLk1hcmtlcihsYXRsbmcsIHtcclxuICAgICAgICBpY29uOiB0aGlzLmNyZWF0ZURpdkljb24oaWNvbkNsYXNzZXMpLFxyXG4gICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcclxuICAgICAgICB0aXRsZTogaS50b1N0cmluZygpXHJcbiAgICAgIH0pO1xyXG4gICAgICBGZWF0dXJlR3JvdXAuYWRkTGF5ZXIobWFya2VyKS5hZGRUbyh0aGlzLm1hcCk7XHJcblxyXG4gICAgICBtYXJrZXIub24oJ2RyYWcnLCBlID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlckRyYWcoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIG1hcmtlci5vbignZHJhZ2VuZCcsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgLyogICBpZiAoaSA9PT0gMCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuICAgICAgICBtYXJrZXIuYmluZFBvcHVwKHRoaXMuZ2V0SHRtbENvbnRlbnQoKGUpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBvblwiLCBlLnRhcmdldCk7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIC8vIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgIC8vICAgdGhpcy50b2dnbGVNYXJrZXJNZW51KCk7XHJcbiAgICAgICAgLy8gfSlcclxuICAgICAgfVxyXG4gICAgICBpZiAoaSA9PT0gbGF0bG5ncy5sZW5ndGggLSAxICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XHJcbiAgICAgICAgbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSAqL1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgY3JlYXRlRGl2SWNvbihjbGFzc05hbWVzOiBzdHJpbmdbXSk6IEwuRGl2SWNvbiB7XHJcbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcy5qb2luKCcgJyk7XHJcbiAgICBjb25zdCBpY29uID0gTC5kaXZJY29uKHsgY2xhc3NOYW1lOiBjbGFzc2VzIH0pO1xyXG4gICAgcmV0dXJuIGljb247XHJcbiAgfVxyXG4gIC8vIFRPRE86IENsZWFudXBcclxuICBwcml2YXRlIG1hcmtlckRyYWcoRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgY29uc3QgbmV3UG9zID0gW107XHJcbiAgICBsZXQgdGVzdGFycmF5ID0gW107XHJcbiAgICBsZXQgaG9sZSA9IFtdO1xyXG4gICAgY29uc3QgbGF5ZXJMZW5ndGggPSBGZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKCkgYXMgYW55O1xyXG4gICAgY29uc3QgcG9zYXJyYXlzID0gbGF5ZXJMZW5ndGhbMF0uZ2V0TGF0TG5ncygpO1xyXG4gICAgY29uc29sZS5sb2cocG9zYXJyYXlzKTtcclxuICAgIGxldCBsZW5ndGggPSAwO1xyXG4gICAgaWYgKHBvc2FycmF5cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NhcnJheXMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgdGVzdGFycmF5ID0gW107XHJcbiAgICAgICAgaG9sZSA9IFtdO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdQb3Npc2pvbmVyOiAnLCBwb3NhcnJheXNbaW5kZXhdKTtcclxuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF0ubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaW5kZXggPCBwb3NhcnJheXNbMF0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUG9zaXNqb25lciAyOiAnLCBwb3NhcnJheXNbaW5kZXhdW2ldKTtcclxuXHJcbiAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1baV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVswXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnSG9sZTogJywgaG9sZSk7XHJcbiAgICAgICAgICBuZXdQb3MucHVzaChob2xlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGVuZ3RoICs9IHBvc2FycmF5c1tpbmRleCAtIDFdWzBdLmxlbmd0aDtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdTVGFydCBpbmRleDogJywgbGVuZ3RoKTtcclxuICAgICAgICAgIGZvciAobGV0IGogPSBsZW5ndGg7IGogPCBwb3NhcnJheXNbaW5kZXhdWzBdLmxlbmd0aCArIGxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKChsYXllckxlbmd0aFtqICsgMV0gYXMgYW55KS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBob2xlLnB1c2godGVzdGFycmF5KTtcclxuICAgICAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gdGVzdGFycmF5ID0gW11cclxuICAgICAgaG9sZSA9IFtdO1xyXG4gICAgICBsZXQgbGVuZ3RoMiA9IDA7XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NhcnJheXNbMF0ubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgdGVzdGFycmF5ID0gW107XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1BvbHlnb24gZHJhZzogJywgcG9zYXJyYXlzWzBdW2luZGV4XSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICBpZiAocG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdWzBdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZW5ndGgyICs9IHBvc2FycmF5c1swXVtpbmRleCAtIDFdLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoMjsgaiA8IHBvc2FycmF5c1swXVtpbmRleF0ubGVuZ3RoICsgbGVuZ3RoMjsgaisrKSB7XHJcbiAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICB9XHJcbiAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICBjb25zb2xlLmxvZygnSG9sZSAyOiAnLCBob2xlKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKCdOeWUgcG9zaXNqb25lcjogJywgbmV3UG9zKTtcclxuICAgIGxheWVyTGVuZ3RoWzBdLnNldExhdExuZ3MobmV3UG9zKTtcclxuICB9XHJcbiAgLy8gY2hlY2sgdGhpc1xyXG4gIHByaXZhdGUgbWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICBjb25zdCBmZWF0dXJlQ29sbGVjdGlvbiA9IEZlYXR1cmVHcm91cC50b0dlb0pTT04oKSBhcyBhbnk7XHJcbiAgICBjb25zb2xlLmxvZyhcclxuICAgICAgJ01hcmtlcmRyYWdlbmQgcG9seWdvbjogJyxcclxuICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXNcclxuICAgICk7XHJcbiAgICBpZiAoZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFtlbGVtZW50XSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdNYXJrZXJkcmFnZW5kOiAnLCBmZWF0dXJlKTtcclxuICAgICAgICBpZiAodGhpcy50dXJmSGVscGVyLmhhc0tpbmtzKGZlYXR1cmUpKSB7XHJcbiAgICAgICAgICB0aGlzLmtpbmtzID0gdHJ1ZTtcclxuICAgICAgICAgIGNvbnN0IHVua2luayA9IHRoaXMudHVyZkhlbHBlci5nZXRLaW5rcyhmZWF0dXJlKTtcclxuICAgICAgICAgIC8vIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihmZWF0dXJlKSk7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChGZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1Vua2luazogJywgdW5raW5rKTtcclxuICAgICAgICAgIHVua2luay5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFkZFBvbHlnb24oXHJcbiAgICAgICAgICAgICAgdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKHBvbHlnb24pLFxyXG4gICAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAgIHRydWVcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmtpbmtzID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLmFkZFBvbHlnb24oZmVhdHVyZSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlc1xyXG4gICAgICApO1xyXG4gICAgICBjb25zb2xlLmxvZygnTWFya2VyZHJhZ2VuZDogJywgZmVhdHVyZSk7XHJcbiAgICAgIGlmICh0aGlzLnR1cmZIZWxwZXIuaGFzS2lua3MoZmVhdHVyZSkpIHtcclxuICAgICAgICB0aGlzLmtpbmtzID0gdHJ1ZTtcclxuICAgICAgICBjb25zdCB1bmtpbmsgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0S2lua3MoZmVhdHVyZSk7XHJcbiAgICAgICAgLy8gdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGZlYXR1cmUpKTtcclxuICAgICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChGZWF0dXJlR3JvdXApO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdVbmtpbms6ICcsIHVua2luayk7XHJcbiAgICAgICAgdW5raW5rLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICB0aGlzLmFkZFBvbHlnb24odGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKHBvbHlnb24pLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGZlYXR1cmUpKTtcclxuICAgICAgICB0aGlzLmtpbmtzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hZGRQb2x5Z29uKGZlYXR1cmUsIGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwc1xyXG4gICAgKTtcclxuICB9XHJcbiAgLy8gZmluZSwgY2hlY2sgdGhlIHJldHVybmVkIHR5cGVcclxuICBwcml2YXRlIGdldExhdExuZ3NGcm9tSnNvbihcclxuICAgIGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cclxuICApOiBJTGF0TG5nW11bXSB7XHJcbiAgICBjb25zb2xlLmxvZygnZ2V0TGF0TG5nc0Zyb21Kc29uOiAnLCBmZWF0dXJlKTtcclxuICAgIGxldCBjb29yZDtcclxuICAgIGlmIChmZWF0dXJlKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEgJiZcclxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT09ICdNdWx0aVBvbHlnb24nXHJcbiAgICAgICkge1xyXG4gICAgICAgIGNvb3JkID0gTC5HZW9KU09OLmNvb3Jkc1RvTGF0TG5ncyhmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdWzBdKTtcclxuICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdLmxlbmd0aCA+IDEgJiZcclxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJ1xyXG4gICAgICApIHtcclxuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29vcmQgPSBMLkdlb0pTT04uY29vcmRzVG9MYXRMbmdzKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1bMF0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvb3JkO1xyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgdW5pb25Qb2x5Z29ucyhcclxuICAgIGxheWVycyxcclxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBwb2x5Z29uRmVhdHVyZVxyXG4gICkge1xyXG4gICAgY29uc29sZS5sb2coJ3VuaW9uUG9seWdvbnMnLCBsYXllcnMsIGxhdGxuZ3MsIHBvbHlnb25GZWF0dXJlKTtcclxuXHJcbiAgICBsZXQgYWRkTmV3ID0gbGF0bG5ncztcclxuICAgIGxheWVycy5mb3JFYWNoKChmZWF0dXJlR3JvdXAsIGkpID0+IHtcclxuICAgICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBmZWF0dXJlR3JvdXAudG9HZW9KU09OKCk7XHJcbiAgICAgIGNvbnN0IGxheWVyID0gZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF07XHJcbiAgICAgIGNvbnN0IHBvbHkgPSB0aGlzLmdldExhdExuZ3NGcm9tSnNvbihsYXllcik7XHJcbiAgICAgIGNvbnN0IHVuaW9uID0gdGhpcy50dXJmSGVscGVyLnVuaW9uKGFkZE5ldywgcG9seWdvbkZlYXR1cmVbaV0pOyAvLyBDaGVjayBmb3IgbXVsdGlwb2x5Z29uc1xyXG4gICAgICAvLyBOZWVkcyBhIGNsZWFudXAgZm9yIHRoZSBuZXcgdmVyc2lvblxyXG4gICAgICB0aGlzLmRlbGV0ZVBvbHlnb25Pbk1lcmdlKHBvbHkpO1xyXG4gICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChmZWF0dXJlR3JvdXApO1xyXG5cclxuICAgICAgYWRkTmV3ID0gdW5pb247XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBuZXdMYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+ID0gYWRkTmV3OyAvLyBUcmVuZ2VyIGthbnNramUgdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKCBhZGROZXcpO1xyXG4gICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobmV3TGF0bG5ncywgdHJ1ZSk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHJlbW92ZUZlYXR1cmVHcm91cChmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICBjb25zb2xlLmxvZygncmVtb3ZlRmVhdHVyZUdyb3VwJywgZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICBmZWF0dXJlR3JvdXAuY2xlYXJMYXllcnMoKTtcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMgPSB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZpbHRlcihcclxuICAgICAgZmVhdHVyZUdyb3VwcyA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXBcclxuICAgICk7XHJcbiAgICAvLyB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xyXG4gIH1cclxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnNvbGUubG9nKCdyZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlJywgZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICBjb25zdCBuZXdBcnJheSA9IFtdO1xyXG4gICAgaWYgKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSkge1xyXG4gICAgICBjb25zdCBwb2x5Z29uID0gKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSBhcyBhbnkpLmdldExhdExuZ3MoKVswXTtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5mb3JFYWNoKHYgPT4ge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIHYucG9seWdvbi50b1N0cmluZygpICE9PSBwb2x5Z29uWzBdLnRvU3RyaW5nKCkgJiZcclxuICAgICAgICAgIHYucG9seWdvblswXS50b1N0cmluZygpID09PSBwb2x5Z29uWzBdWzBdLnRvU3RyaW5nKClcclxuICAgICAgICApIHtcclxuICAgICAgICAgIHYucG9seWdvbiA9IHBvbHlnb247XHJcbiAgICAgICAgICBuZXdBcnJheS5wdXNoKHYpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgdi5wb2x5Z29uLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF0udG9TdHJpbmcoKSAmJlxyXG4gICAgICAgICAgdi5wb2x5Z29uWzBdLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF1bMF0udG9TdHJpbmcoKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaCh2KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBmZWF0dXJlR3JvdXAuY2xlYXJMYXllcnMoKTtcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3VwcyA9IHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZmlsdGVyKFxyXG4gICAgICAgIGZlYXR1cmVHcm91cHMgPT4gZmVhdHVyZUdyb3VwcyAhPT0gZmVhdHVyZUdyb3VwXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXHJcbiAgcHJpdmF0ZSBkZWxldGVQb2x5Z29uT25NZXJnZShwb2x5Z29uKSB7XHJcbiAgICBjb25zb2xlLmxvZygnZGVsZXRlUG9seWdvbk9uTWVyZ2UnLCBwb2x5Z29uKTtcclxuICAgIGxldCBwb2x5Z29uMiA9IFtdO1xyXG4gICAgaWYgKHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSBhcyBhbnk7XHJcbiAgICAgICAgY29uc3QgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKVswXTtcclxuICAgICAgICBwb2x5Z29uMiA9IFsuLi5sYXRsbmdzWzBdXTtcclxuICAgICAgICBpZiAobGF0bG5nc1swXVswXSAhPT0gbGF0bG5nc1swXVtsYXRsbmdzWzBdLmxlbmd0aCAtIDFdKSB7XHJcbiAgICAgICAgICBwb2x5Z29uMi5wdXNoKGxhdGxuZ3NbMF1bMF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBlcXVhbHMgPSB0aGlzLnBvbHlnb25BcnJheUVxdWFsc01lcmdlKHBvbHlnb24yLCBwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgaWYgKGVxdWFscykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ0VRVUFMUycsIHBvbHlnb24pO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seWdvbik7XHJcbiAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuICAgICAgICAgIC8vIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFsc01lcmdlKHBvbHkxOiBhbnlbXSwgcG9seTI6IGFueVtdKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gcG9seTEudG9TdHJpbmcoKSA9PT0gcG9seTIudG9TdHJpbmcoKTtcclxuICB9XHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFscyhwb2x5MTogYW55W10sIHBvbHkyOiBhbnlbXSk6IGJvb2xlYW4ge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJwb2x5Z29uQXJyYXlFcXVhbHNcIiwgcG9seTEsIHBvbHkyKTtcclxuXHJcbiAgICBpZiAocG9seTFbMF1bMF0pIHtcclxuICAgICAgaWYgKCFwb2x5MVswXVswXS5lcXVhbHMocG9seTJbMF1bMF0pKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKCFwb2x5MVswXS5lcXVhbHMocG9seTJbMF0pKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgfVxyXG4gICAgaWYgKHBvbHkxLmxlbmd0aCAhPT0gcG9seTIubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBzZXRMZWFmbGV0TWFwRXZlbnRzKFxyXG4gICAgZW5hYmxlRHJhZ2dpbmc6IGJvb2xlYW4sXHJcbiAgICBlbmFibGVEb3VibGVDbGlja1pvb206IGJvb2xlYW4sXHJcbiAgICBlbmFibGVTY3JvbGxXaGVlbFpvb206IGJvb2xlYW5cclxuICApIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwic2V0TGVhZmxldE1hcEV2ZW50c1wiLCBlbmFibGVEcmFnZ2luZywgZW5hYmxlRG91YmxlQ2xpY2tab29tLCBlbmFibGVTY3JvbGxXaGVlbFpvb20pO1xyXG5cclxuICAgIGVuYWJsZURyYWdnaW5nID8gdGhpcy5tYXAuZHJhZ2dpbmcuZW5hYmxlKCkgOiB0aGlzLm1hcC5kcmFnZ2luZy5kaXNhYmxlKCk7XHJcbiAgICBlbmFibGVEb3VibGVDbGlja1pvb21cclxuICAgICAgPyB0aGlzLm1hcC5kb3VibGVDbGlja1pvb20uZW5hYmxlKClcclxuICAgICAgOiB0aGlzLm1hcC5kb3VibGVDbGlja1pvb20uZGlzYWJsZSgpO1xyXG4gICAgZW5hYmxlU2Nyb2xsV2hlZWxab29tXHJcbiAgICAgID8gdGhpcy5tYXAuc2Nyb2xsV2hlZWxab29tLmVuYWJsZSgpXHJcbiAgICAgIDogdGhpcy5tYXAuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHNldERyYXdNb2RlKG1vZGU6IERyYXdNb2RlKSB7XHJcbiAgICBjb25zb2xlLmxvZygnc2V0RHJhd01vZGUnLCB0aGlzLm1hcCk7XHJcbiAgICB0aGlzLmRyYXdNb2RlU3ViamVjdC5uZXh0KG1vZGUpO1xyXG4gICAgaWYgKCEhdGhpcy5tYXApIHtcclxuICAgICAgbGV0IGlzQWN0aXZlRHJhd01vZGUgPSB0cnVlO1xyXG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICBjYXNlIERyYXdNb2RlLk9mZjpcclxuICAgICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhcclxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXHJcbiAgICAgICAgICAgICdjcm9zc2hhaXItY3Vyc29yLWVuYWJsZWQnXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgdGhpcy5ldmVudHMoZmFsc2UpO1xyXG4gICAgICAgICAgdGhpcy5zdG9wRHJhdygpO1xyXG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xyXG4gICAgICAgICAgICBjb2xvcjogJydcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5zZXRMZWFmbGV0TWFwRXZlbnRzKHRydWUsIHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgaXNBY3RpdmVEcmF3TW9kZSA9IGZhbHNlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5BZGRQb2x5Z29uOlxyXG4gICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKFxyXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcclxuICAgICAgICAgICAgJ2Nyb3NzaGFpci1jdXJzb3ItZW5hYmxlZCdcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50cyh0cnVlKTtcclxuICAgICAgICAgIHRoaXMudHJhY2VyLnNldFN0eWxlKHtcclxuICAgICAgICAgICAgY29sb3I6IGRlZmF1bHRDb25maWcucG9seUxpbmVPcHRpb25zLmNvbG9yXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyhmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuU3VidHJhY3RQb2x5Z29uOlxyXG4gICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKFxyXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcclxuICAgICAgICAgICAgJ2Nyb3NzaGFpci1jdXJzb3ItZW5hYmxlZCdcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50cyh0cnVlKTtcclxuICAgICAgICAgIHRoaXMudHJhY2VyLnNldFN0eWxlKHtcclxuICAgICAgICAgICAgY29sb3I6ICcjRDk0NjBGJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLnNldExlYWZsZXRNYXBFdmVudHMoZmFsc2UsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbW9kZUNoYW5nZShtb2RlOiBEcmF3TW9kZSk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShtb2RlKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy8gcmVtb3ZlLCB1c2UgbW9kZUNoYW5nZVxyXG4gIGRyYXdNb2RlQ2xpY2soKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLkFkZFBvbHlnb24pO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXHJcbiAgZnJlZWRyYXdNZW51Q2xpY2soKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLkFkZFBvbHlnb24pO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gcmVtb3ZlLCB1c2UgbW9kZUNoYW5nZVxyXG4gIHN1YnRyYWN0Q2xpY2soKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLlN1YnRyYWN0UG9seWdvbik7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHJlc2V0VHJhY2tlcigpIHtcclxuICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW1swLCAwXV0pO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlTWFya2VyTWVudSgpOiB2b2lkIHtcclxuICAgIGFsZXJ0KCdvcGVuIG1lbnUnKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBnZXRIdG1sQ29udGVudChjYWxsQmFjazogRnVuY3Rpb24pOiBIVE1MRWxlbWVudCB7XHJcbiAgICBjb25zdCBjb21wID0gdGhpcy5wb3B1cEdlbmVyYXRvci5nZW5lcmF0ZUFsdGVyUG9wdXAoKTtcclxuICAgIGNvbXAuaW5zdGFuY2UuYmJveENsaWNrZWQuc3Vic2NyaWJlKGUgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnYmJveCBjbGlja2VkJywgZSk7XHJcbiAgICAgIGNhbGxCYWNrKGUpO1xyXG4gICAgfSk7XHJcbiAgICBjb21wLmluc3RhbmNlLnNpbXBseWZpQ2xpY2tlZC5zdWJzY3JpYmUoZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdzaW1wbHlmaSBjbGlja2VkJywgZSk7XHJcbiAgICAgIGNhbGxCYWNrKGUpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY29tcC5sb2NhdGlvbi5uYXRpdmVFbGVtZW50O1xyXG4gIH1cclxuICBwcml2YXRlIGNvbnZlcnRUb0JvdW5kc1BvbHlnb24obGF0bG5nczogSUxhdExuZ1tdKSB7XHJcbiAgICBjb25zdCBsUG9seSA9IHRoaXMubGVhZmxldEhlbHBlci5jcmVhdGVQb2x5Z29uKGxhdGxuZ3MpO1xyXG5cclxuICAgIC8vIGNvbnN0IGNvb3JkcyA9IHRoaXMuY29udmVydFRvQ29vcmRzKFtsYXRsbmdzXSk7XHJcbiAgICAvLyBjb25zdCBwID0gdGhpcy5nZXRQb2x5Z29uKClcclxuXHJcbiAgICAvLyBpZiAocG9seS5nZW9tZXRyeS50eXBlID09PSBcIk11bHRpUG9seWdvblwiKSB7XHJcbiAgICAvLyAgIGxldCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihwb2x5KTtcclxuICAgIC8vICAgdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKHBvbHkpKTtcclxuICAgIC8vICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobmV3UG9seWdvbiwgZmFsc2UpO1xyXG4gICAgLy8gfVxyXG4gIH1cclxuICBwcml2YXRlIGdldE1hcmtlckluZGV4KFxyXG4gICAgbGF0bG5nczogSUxhdExuZ1tdLFxyXG4gICAgcG9zaXRpb246IE1hcmtlclBsYWNlbWVudFxyXG4gICk6IG51bWJlciB7XHJcbiAgICBjb25zdCBib3VuZHM6IEwuTGF0TG5nQm91bmRzID0gUG9seURyYXdVdGlsLmdldEJvdW5kcyhcclxuICAgICAgbGF0bG5ncyxcclxuICAgICAgTWF0aC5zcXJ0KDIpIC8gMlxyXG4gICAgKTtcclxuICAgIGNvbnN0IGNvbXBhc3MgPSBuZXcgQ29tcGFzcyhcclxuICAgICAgYm91bmRzLmdldFdlc3QoKSxcclxuICAgICAgYm91bmRzLmdldFNvdXRoKCksXHJcbiAgICAgIGJvdW5kcy5nZXRFYXN0KCksXHJcbiAgICAgIGJvdW5kcy5nZXROb3J0aCgpXHJcbiAgICApO1xyXG4gICAgY29uc3QgY29tcGFzc0RpcmVjdGlvbiA9IGNvbXBhc3MuZ2V0RGlyZWN0aW9uKHBvc2l0aW9uKTtcclxuICAgIGNvbnN0IGxhdExuZ1BvaW50OiBJTGF0TG5nID0ge1xyXG4gICAgICBsYXQ6IGNvbXBhc3NEaXJlY3Rpb25bMV0sXHJcbiAgICAgIGxuZzogY29tcGFzc0RpcmVjdGlvblswXVxyXG4gICAgfTtcclxuICAgIGNvbnN0IHRhcmdldFBvaW50ID0gdGhpcy50dXJmSGVscGVyLmdldENvb3JkKGxhdExuZ1BvaW50KTtcclxuICAgIGNvbnN0IGZjID0gdGhpcy50dXJmSGVscGVyLmdldEZlYXR1cmVQb2ludENvbGxlY3Rpb24obGF0bG5ncyk7XHJcbiAgICBjb25zdCBuZWFyZXN0UG9pbnRJZHggPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TmVhcmVzdFBvaW50SW5kZXgoXHJcbiAgICAgIHRhcmdldFBvaW50LFxyXG4gICAgICBmYyBhcyBhbnlcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIG5lYXJlc3RQb2ludElkeDtcclxuICB9XHJcbn1cclxuLy8gZmx5dHQgdGlsIGVudW0udHNcclxuZXhwb3J0IGVudW0gRHJhd01vZGUge1xyXG4gIE9mZiA9IDAsXHJcbiAgQWRkUG9seWdvbiA9IDEsXHJcbiAgRWRpdFBvbHlnb24gPSAyLFxyXG4gIFN1YnRyYWN0UG9seWdvbiA9IDMsXHJcbiAgTG9hZFBvbHlnb24gPSA0XHJcbn1cclxuIl19