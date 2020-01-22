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
        this.tracer.addTo(this.map);
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
        /*     const menuMarkerIdx = this.getMarkerIndex(
              latlngs,
              this.config.markers.markerMenuIcon.position
            );
            const deleteMarkerIdx = this.getMarkerIndex(
              latlngs,
              this.config.markers.markerDeleteIcon.position
            ); */
        var _this = this;
        latlngs.forEach(function (latlng, i) {
            var iconClasses = _this.config.markers.markerIcon.styleClasses;
            /*     if (i === menuMarkerIdx && this.config.markers.menu) {
                  iconClasses = this.config.markers.markerMenuIcon.styleClasses;
                }
                if (i === deleteMarkerIdx && this.config.markers.delete) {
                  iconClasses = this.config.markers.markerDeleteIcon.styleClasses;
                } */
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
            /*   if (i === menuMarkerIdx && this.config.markers.menu) {
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
              } */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9wb2x5ZHJhdy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdCLHNDQUFzQztBQUN0QyxPQUFPLEVBQWMsZUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBRTVDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRWhELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDOzs7Ozs7O0FBT2hFO0lBb0JFLHlCQUNVLFFBQXlCLEVBQ3pCLGNBQXlDLEVBQ3pDLFVBQTZCLEVBQzdCLGtCQUE2QyxFQUM3QyxhQUFtQztRQUw3QyxpQkF5QkM7UUF4QlMsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7UUFDekIsbUJBQWMsR0FBZCxjQUFjLENBQTJCO1FBQ3pDLGVBQVUsR0FBVixVQUFVLENBQW1CO1FBQzdCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBMkI7UUFDN0Msa0JBQWEsR0FBYixhQUFhLENBQXNCO1FBeEI3Qyx5Q0FBeUM7UUFDekMsb0JBQWUsR0FBOEIsSUFBSSxlQUFlLENB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QUFDO1lBQ3hCLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7U0FDekIsQ0FBQztRQUNGLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFELElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUQsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FDMUQsV0FBVyxFQUNYLEVBQVMsQ0FDVixDQUFDO1FBRUYsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQzs7Z0JBbDdCbUIsZUFBZTtnQkFDVCx5QkFBeUI7Z0JBQzdCLGlCQUFpQjtnQkFDVCx5QkFBeUI7Z0JBQzlCLG9CQUFvQjs7O0lBekJsQyxlQUFlO1FBSjNCLFVBQVUsQ0FBQztZQUNWLFVBQVUsRUFBRSxNQUFNO1NBQ25CLENBQUM7UUFDRiwyQkFBMkI7O2lEQXNCTCxlQUFlO1lBQ1QseUJBQXlCO1lBQzdCLGlCQUFpQjtZQUNULHlCQUF5QjtZQUM5QixvQkFBb0I7T0F6QmxDLGVBQWUsQ0F3OEIzQjswQkE3OUJEO0NBNjlCQyxBQXg4QkQsSUF3OEJDO1NBeDhCWSxlQUFlO0FBeThCNUIsb0JBQW9CO0FBQ3BCLE1BQU0sQ0FBTixJQUFZLFFBTVg7QUFORCxXQUFZLFFBQVE7SUFDbEIscUNBQU8sQ0FBQTtJQUNQLG1EQUFjLENBQUE7SUFDZCxxREFBZSxDQUFBO0lBQ2YsNkRBQW1CLENBQUE7SUFDbkIscURBQWUsQ0FBQTtBQUNqQixDQUFDLEVBTlcsUUFBUSxLQUFSLFFBQVEsUUFNbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gJ2xlYWZsZXQnO1xyXG4vLyBpbXBvcnQgKiBhcyB0dXJmIGZyb20gXCJAdHVyZi90dXJmXCI7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIEJlaGF2aW9yU3ViamVjdCwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBmaWx0ZXIgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IEZlYXR1cmUsIFBvbHlnb24sIE11bHRpUG9seWdvbiB9IGZyb20gJ0B0dXJmL3R1cmYnO1xyXG5pbXBvcnQgeyBNYXBTdGF0ZVNlcnZpY2UgfSBmcm9tICcuL21hcC1zdGF0ZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVHVyZkhlbHBlclNlcnZpY2UgfSBmcm9tICcuL3R1cmYtaGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi9wb2x5Z29uLWluZm9ybWF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgZGVmYXVsdENvbmZpZyBmcm9tIFwiLi9wb2x5aW5mby5qc29uXCI7XHJcblxyXG5pbXBvcnQgeyBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlIH0gZnJvbSAnLi9jb21wb25lbnQtZ2VuZXJhdGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb21wYXNzLCBQb2x5RHJhd1V0aWwgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgTWFya2VyUGxhY2VtZW50IH0gZnJvbSAnLi9lbnVtcyc7XHJcbmltcG9ydCB7IExlYWZsZXRIZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi9sZWFmbGV0LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gJy4vcG9seWdvbi1oZWxwZXJzJztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICBwcm92aWRlZEluOiAncm9vdCdcclxufSlcclxuLy8gUmVuYW1lIC0gUG9seURyYXdTZXJ2aWNlXHJcbmV4cG9ydCBjbGFzcyBQb2x5RHJhd1NlcnZpY2Uge1xyXG4gIC8vIERyYXdNb2RlcywgZGV0ZXJtaW5lIFVJIGJ1dHRvbnMgZXRjLi4uXHJcbiAgZHJhd01vZGVTdWJqZWN0OiBCZWhhdmlvclN1YmplY3Q8RHJhd01vZGU+ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxEcmF3TW9kZT4oXHJcbiAgICBEcmF3TW9kZS5PZmZcclxuICApO1xyXG4gIGRyYXdNb2RlJDogT2JzZXJ2YWJsZTxEcmF3TW9kZT4gPSB0aGlzLmRyYXdNb2RlU3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuXHJcbiAgcHJpdmF0ZSBtYXA6IEwuTWFwO1xyXG5cclxuICBwcml2YXRlIG1lcmdlUG9seWdvbnM6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBraW5rczogYm9vbGVhbjtcclxuICAvLyBhZGQgdG8gY29uZmlnXHJcbiAgcHJpdmF0ZSBhcnJheU9mRmVhdHVyZUdyb3VwczogTC5GZWF0dXJlR3JvdXA8TC5MYXllcj5bXSA9IFtdO1xyXG4gIHByaXZhdGUgdHJhY2VyOiBMLlBvbHlsaW5lID0ge30gYXMgYW55O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcG9seWdvbkRyYXdTdGF0ZXMgPSBudWxsO1xyXG4gIC8vIGVuZCBhZGQgdG8gY29uZmlnXHJcblxyXG4gIHByaXZhdGUgbmdVbnN1YnNjcmliZSA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHJpdmF0ZSBjb25maWc6IHR5cGVvZiBkZWZhdWx0Q29uZmlnID0gbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIG1hcFN0YXRlOiBNYXBTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBvcHVwR2VuZXJhdG9yOiBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0dXJmSGVscGVyOiBUdXJmSGVscGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgcG9seWdvbkluZm9ybWF0aW9uOiBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsZWFmbGV0SGVscGVyOiBMZWFmbGV0SGVscGVyU2VydmljZVxyXG4gICkge1xyXG4gICAgdGhpcy5tYXBTdGF0ZS5tYXAkLnBpcGUoZmlsdGVyKG0gPT4gbSAhPT0gbnVsbCkpLnN1YnNjcmliZSgobWFwOiBMLk1hcCkgPT4ge1xyXG4gICAgICB0aGlzLm1hcCA9IG1hcDtcclxuICAgICAgY29uc29sZS5sb2coXCJLYXJ0ZXQ6IFwiLCBtYXApO1xyXG4gICAgICBjb25zb2xlLmxvZygncHJlIHRoaXMuY29uZmlnJywgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLmNvbmZpZyA9IGRlZmF1bHRDb25maWc7XHJcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzLmNvbmZpZycsIHRoaXMuY29uZmlnKTtcclxuICAgICAgdGhpcy5jb25maWd1cmF0ZSh7fSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdhZnRlciB0aGlzLmNvbmZpZycsIHRoaXMuY29uZmlnKTtcclxuICAgICAgdGhpcy50cmFjZXIgPSBMLnBvbHlsaW5lKFtbMCwgMF1dLCB0aGlzLmNvbmZpZy5wb2x5TGluZU9wdGlvbnMpO1xyXG5cclxuICAgICAgdGhpcy5pbml0UG9seURyYXcoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25JbmZvcm1hdGlvbiQuc3Vic2NyaWJlKGsgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnUG9seUluZm8gc3RhcnQ6ICcsIGspO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVE9ETyAtIGxhZ2UgZW4gY29uZmlnIG9ic2VydmFibGUgaSBtYXBTdGF0ZSBvZyBvcHBkYXRlciB0aGlzLmNvbmZpZyBtZWQgZGVuXHJcbiAgfVxyXG4gIC8vIG5ld1xyXG4gIGNvbmZpZ3VyYXRlKGNvbmZpZzogT2JqZWN0KTogdm9pZCB7XHJcbiAgICAvLyBUT0RPIGlmIGNvbmZpZyBpcyBwYXRoLi4uXHJcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4uZGVmYXVsdENvbmZpZywgLi4uY29uZmlnIH07XHJcblxyXG4gICAgdGhpcy5tZXJnZVBvbHlnb25zID0gdGhpcy5jb25maWcubWVyZ2VQb2x5Z29ucztcclxuICAgIHRoaXMua2lua3MgPSB0aGlzLmNvbmZpZy5raW5rcztcclxuICB9XHJcblxyXG4gIC8vIGZpbmVcclxuICBjbG9zZUFuZFJlc2V0KCk6IHZvaWQge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJjbG9zZUFuZFJlc2V0XCIpO1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xyXG4gICAgdGhpcy5yZW1vdmVBbGxGZWF0dXJlR3JvdXBzKCk7XHJcbiAgfVxyXG5cclxuICAvLyBtYWtlIHJlYWRhYmxlXHJcbiAgZGVsZXRlUG9seWdvbihwb2x5Z29uOiBJTGF0TG5nW11bXSkge1xyXG4gICAgY29uc29sZS5sb2coJ2RlbGV0ZVBvbHlnb246ICcsIHBvbHlnb24pO1xyXG4gICAgaWYgKHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSBhcyBhbnk7XHJcbiAgICAgICAgY29uc3QgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKTtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBsYXRsbmdzLmxlbmd0aDtcclxuICAgICAgICAvLyAgPSBbXVxyXG4gICAgICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgbGV0IHBvbHlnb24zO1xyXG4gICAgICAgICAgY29uc3QgdGVzdCA9IFsuLi5sYXRsbmddO1xyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKGxhdGxuZyk7XHJcbiAgICAgICAgICBpZiAobGF0bG5nLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXVswXSAhPT0gbGF0bG5nWzBdW2xhdGxuZ1swXS5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICAgIHRlc3RbMF0ucHVzaChsYXRsbmdbMF1bMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gW3Rlc3RbMF1dO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXSAhPT0gbGF0bG5nW2xhdGxuZy5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICAgIHRlc3QucHVzaChsYXRsbmdbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gdGVzdDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnVGVzdDogJywgcG9seWdvbjMpO1xyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKHBvbHlnb24pO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGVxdWFscyA9IHRoaXMucG9seWdvbkFycmF5RXF1YWxzKHBvbHlnb24zLCBwb2x5Z29uKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdlcXVhbHM6ICcsIGVxdWFscywgJyBsZW5ndGg6ICcsIGxlbmd0aCk7XHJcbiAgICAgICAgICBpZiAoZXF1YWxzICYmIGxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVxdWFscyAmJiBsZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVRyYXNoQ2FuT25NdWx0aShbcG9seWdvbl0pO1xyXG4gICAgICAgICAgICBsYXRsbmdzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIGxheWVyLnNldExhdExuZ3MobGF0bG5ncyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxheWVyLnRvR2VvSlNPTigpLCBmYWxzZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcmVtb3ZlQWxsRmVhdHVyZUdyb3VwcygpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwicmVtb3ZlQWxsRmVhdHVyZUdyb3Vwc1wiLCBudWxsKTtcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXBzID0+IHtcclxuICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3Vwcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gW107XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICAvLyB0aGlzLnBvbHlnb25EcmF3U3RhdGVzLnJlc2V0KCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi51cGRhdGVQb2x5Z29ucygpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgZ2V0RHJhd01vZGUoKTogRHJhd01vZGUge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJnZXREcmF3TW9kZVwiLCBudWxsKTtcclxuICAgIHJldHVybiB0aGlzLmRyYXdNb2RlU3ViamVjdC52YWx1ZTtcclxuICB9XHJcblxyXG4gIGFkZFZpa2VuKHBvbHlnb24pIHtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHBvbHlnb24sIHRydWUpO1xyXG4gIH1cclxuXHJcbiAgLy8gY2hlY2sgdGhpc1xyXG4gIGFkZEF1dG9Qb2x5Z29uKGdlb2dyYXBoaWNCb3JkZXJzOiBMLkxhdExuZ1tdW10pOiB2b2lkIHtcclxuICAgIGNvbnN0IGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXAgPSBuZXcgTC5GZWF0dXJlR3JvdXAoKTtcclxuXHJcbiAgICBjb25zdCBwb2x5Z29uMiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXHJcbiAgICAgIHRoaXMuY29udmVydFRvQ29vcmRzKGdlb2dyYXBoaWNCb3JkZXJzKVxyXG4gICAgKTtcclxuICAgIGNvbnNvbGUubG9nKHBvbHlnb24yKTtcclxuICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLmdldFBvbHlnb24ocG9seWdvbjIpO1xyXG5cclxuICAgIGZlYXR1cmVHcm91cC5hZGRMYXllcihwb2x5Z29uKTtcclxuICAgIGNvbnN0IG1hcmtlckxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcclxuICAgIGNvbnNvbGUubG9nKCdtYXJrZXJzOiAnLCBtYXJrZXJMYXRsbmdzKTtcclxuICAgIG1hcmtlckxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgcG9seWdvbi5mb3JFYWNoKChwb2x5RWxlbWVudCwgaSkgPT4ge1xyXG4gICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLmFkZE1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hZGRIb2xlTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ0h1bGw6ICcsIHBvbHlFbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyB0aGlzLmFkZE1hcmtlcihwb2x5Z29uWzBdLCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAvLyBUT0RPIC0gSHZpcyBwb2x5Z29uLmxlbmd0aCA+MSwgc8OlIGhhciBkZW4gaHVsbDogZWdlbiBhZGRNYXJrZXIgZnVua3Nqb25cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwc1xyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIGlubmVow6VsbCBpIGlmJ2FyIGZseXR0YSB0aWxsIGVnbmEgbWV0b2RlclxyXG4gIHByaXZhdGUgY29udmVydFRvQ29vcmRzKGxhdGxuZ3M6IElMYXRMbmdbXVtdKSB7XHJcbiAgICBjb25zdCBjb29yZHMgPSBbXTtcclxuICAgIGNvbnNvbGUubG9nKGxhdGxuZ3MubGVuZ3RoLCBsYXRsbmdzKTtcclxuICAgIGlmIChsYXRsbmdzLmxlbmd0aCA+IDEgJiYgbGF0bG5ncy5sZW5ndGggPCAzKSB7XHJcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdKSxcclxuICAgICAgICBsYXRsbmdzW2xhdGxuZ3MubGVuZ3RoIC0gMV0ubGVuZ3RoXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihcclxuICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSksXHJcbiAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKVxyXG4gICAgICApO1xyXG4gICAgICBpZiAod2l0aGluKSB7XHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgY29vcmRpbmF0ZXMucHVzaChMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHBvbHlnb24pKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPj0gMSkge1xyXG4gICAgICAgIGNvb3Jkcy5wdXNoKGNvb3JkaW5hdGVzKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZygnV2l0aGluMSAnLCB3aXRoaW4pO1xyXG4gICAgfSBlbHNlIGlmIChsYXRsbmdzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAxOyBpbmRleCA8IGxhdGxuZ3MubGVuZ3RoIC0gMTsgaW5kZXgrKykge1xyXG4gICAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihcclxuICAgICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tpbmRleF0pLFxyXG4gICAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKHdpdGhpbikge1xyXG4gICAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICBjb29yZGluYXRlcy5wdXNoKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbikpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbildKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSldKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKGNvb3Jkcyk7XHJcbiAgICByZXR1cm4gY29vcmRzO1xyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgaW5pdFBvbHlEcmF3KCkge1xyXG4gICAgY29uc29sZS5sb2coXCJpbml0UG9seURyYXdcIiwgdGhpcy5tYXAsIHRoaXMudHJhY2VyKTtcclxuXHJcbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCk7XHJcbiAgICBjb25zdCBkcmF3TW9kZSA9IHRoaXMuZ2V0RHJhd01vZGUoKTtcclxuICAgIGlmICh0aGlzLmNvbmZpZy50b3VjaFN1cHBvcnQpIHtcclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBlID0+IHtcclxuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xyXG4gICAgICAgICAgdGhpcy5tb3VzZURvd24oZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGUgPT4ge1xyXG4gICAgICAgIGlmIChkcmF3TW9kZSAhPT0gRHJhd01vZGUuT2ZmKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdXNlVXBMZWF2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcclxuICAgICAgICAgIHRoaXMubW91c2VNb3ZlKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50cmFjZXIuYWRkVG8odGhpcy5tYXApXHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XHJcbiAgfVxyXG4gIC8vIFRlc3QgTC5Nb3VzZUV2ZW50XHJcbiAgcHJpdmF0ZSBtb3VzZURvd24oZXZlbnQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdtb3VzZURvd24nLCBldmVudCk7XHJcblxyXG4gICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT0gbnVsbCkge1xyXG4gICAgICB0aGlzLnRyYWNlci5zZXRMYXRMbmdzKFtldmVudC5sYXRsbmddKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGxhdGxuZyA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcoW1xyXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCxcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFlcclxuICAgICAgXSk7XHJcbiAgICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW2xhdGxuZ10pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zdGFydERyYXcoKTtcclxuICB9XHJcblxyXG4gIC8vIFRPRE8gZXZlbnQgdHlwZSwgY3JlYXRlIGNvbnRhaW5lclBvaW50VG9MYXRMbmctbWV0aG9kXHJcbiAgcHJpdmF0ZSBtb3VzZU1vdmUoZXZlbnQpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwibW91c2VNb3ZlXCIsIGV2ZW50KTtcclxuXHJcbiAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMudHJhY2VyLmFkZExhdExuZyhldmVudC5sYXRsbmcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgbGF0bG5nID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhbXHJcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLFxyXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WVxyXG4gICAgICBdKTtcclxuICAgICAgdGhpcy50cmFjZXIuYWRkTGF0TG5nKGxhdGxuZyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBtb3VzZVVwTGVhdmUoKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm1vdXNlVXBMZWF2ZVwiLCBudWxsKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRGVsZXRlIHRyYXNoY2Fuc1wiLCBudWxsKTtcclxuICAgIGNvbnN0IGdlb1BvczogRmVhdHVyZTxcclxuICAgICAgUG9seWdvbiB8IE11bHRpUG9seWdvblxyXG4gICAgPiA9IHRoaXMudHVyZkhlbHBlci50dXJmQ29uY2F2ZW1hbih0aGlzLnRyYWNlci50b0dlb0pTT04oKSBhcyBhbnkpO1xyXG4gICAgdGhpcy5zdG9wRHJhdygpO1xyXG4gICAgc3dpdGNoICh0aGlzLmdldERyYXdNb2RlKCkpIHtcclxuICAgICAgY2FzZSBEcmF3TW9kZS5BZGRQb2x5Z29uOlxyXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbihnZW9Qb3MsIHRydWUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIERyYXdNb2RlLlN1YnRyYWN0UG9seWdvbjpcclxuICAgICAgICB0aGlzLnN1YnRyYWN0UG9seWdvbihnZW9Qb3MpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHNcclxuICAgICk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWNyZWF0ZSB0cmFzaGNhbnNcIiwgbnVsbCk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHN0YXJ0RHJhdygpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwic3RhcnREcmF3XCIsIG51bGwpO1xyXG5cclxuICAgIHRoaXMuZHJhd1N0YXJ0ZWRFdmVudHModHJ1ZSk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHN0b3BEcmF3KCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJzdG9wRHJhd1wiLCBudWxsKTtcclxuXHJcbiAgICB0aGlzLnJlc2V0VHJhY2tlcigpO1xyXG4gICAgdGhpcy5kcmF3U3RhcnRlZEV2ZW50cyhmYWxzZSk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGRyYXdTdGFydGVkRXZlbnRzKG9ub2ZmOiBib29sZWFuKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImRyYXdTdGFydGVkRXZlbnRzXCIsIG9ub2ZmKTtcclxuXHJcbiAgICBjb25zdCBvbm9yb2ZmID0gb25vZmYgPyAnb24nIDogJ29mZic7XHJcblxyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlLCB0aGlzKTtcclxuICAgIHRoaXMubWFwW29ub3JvZmZdKCdtb3VzZXVwJywgdGhpcy5tb3VzZVVwTGVhdmUsIHRoaXMpO1xyXG4gIH1cclxuICAvLyBPbiBob2xkXHJcbiAgcHJpdmF0ZSBzdWJ0cmFjdFBvbHlnb24obGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgdGhpcy5zdWJ0cmFjdChsYXRsbmdzKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgYWRkUG9seWdvbihcclxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBzaW1wbGlmeTogYm9vbGVhbixcclxuICAgIG5vTWVyZ2U6IGJvb2xlYW4gPSBmYWxzZVxyXG4gICkge1xyXG4gICAgY29uc29sZS5sb2coXHJcbiAgICAgICdhZGRQb2x5Z29uJyxcclxuICAgICAgbGF0bG5ncyxcclxuICAgICAgc2ltcGxpZnksXHJcbiAgICAgIG5vTWVyZ2UsXHJcbiAgICAgIHRoaXMua2lua3MsXHJcbiAgICAgIHRoaXMuY29uZmlnXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgdGhpcy5tZXJnZVBvbHlnb25zICYmXHJcbiAgICAgICFub01lcmdlICYmXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCAmJlxyXG4gICAgICAhdGhpcy5raW5rc1xyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMubWVyZ2UobGF0bG5ncyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXRsbmdzLCBzaW1wbGlmeSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGFkZFBvbHlnb25MYXllcihcclxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBzaW1wbGlmeTogYm9vbGVhblxyXG4gICkge1xyXG4gICAgY29uc3QgZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCA9IG5ldyBMLkZlYXR1cmVHcm91cCgpO1xyXG5cclxuICAgIGNvbnN0IGxhdExuZ3MgPSBzaW1wbGlmeSA/IHRoaXMudHVyZkhlbHBlci5nZXRTaW1wbGlmaWVkKGxhdGxuZ3MpIDogbGF0bG5ncztcclxuICAgIGNvbnNvbGUubG9nKCdBZGRQb2x5Z29uTGF5ZXI6ICcsIGxhdExuZ3MpO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IHRoaXMuZ2V0UG9seWdvbihsYXRMbmdzKTtcclxuICAgIGZlYXR1cmVHcm91cC5hZGRMYXllcihwb2x5Z29uKTtcclxuICAgIGNvbnNvbGUubG9nKHBvbHlnb24pO1xyXG4gICAgY29uc3QgbWFya2VyTGF0bG5ncyA9IHBvbHlnb24uZ2V0TGF0TG5ncygpO1xyXG4gICAgbWFya2VyTGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICBwb2x5Z29uLmZvckVhY2goKHBvbHlFbGVtZW50OiBJTGF0TG5nW10sIGk6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLmFkZE1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hZGRIb2xlTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ0h1bGw6ICcsIHBvbHlFbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyB0aGlzLmFkZE1hcmtlcihwb2x5Z29uWzBdLCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAvLyBUT0RPIC0gSHZpcyBwb2x5Z29uLmxlbmd0aCA+MSwgc8OlIGhhciBkZW4gaHVsbDogZWdlbiBhZGRNYXJrZXIgZnVua3Nqb25cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgY29uc29sZS5sb2coJ0FycmF5OiAnLCB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzKTtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuXHJcbiAgICBmZWF0dXJlR3JvdXAub24oJ2NsaWNrJywgZSA9PiB7XHJcbiAgICAgIHRoaXMucG9seWdvbkNsaWNrZWQoZSwgbGF0TG5ncyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgcG9seWdvbkNsaWNrZWQoZTogYW55LCBwb2x5OiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zdCBuZXdQb2ludCA9IGUubGF0bG5nO1xyXG4gICAgaWYgKHBvbHkuZ2VvbWV0cnkudHlwZSA9PT0gJ011bHRpUG9seWdvbicpIHtcclxuICAgICAgY29uc3QgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5pbmplY3RQb2ludFRvUG9seWdvbihwb2x5LCBbXHJcbiAgICAgICAgbmV3UG9pbnQubG5nLFxyXG4gICAgICAgIG5ld1BvaW50LmxhdFxyXG4gICAgICBdKTtcclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKHBvbHkpKTtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobmV3UG9seWdvbiwgZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBnZXRQb2x5Z29uKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnNvbGUubG9nKCdnZXRQb2x5Z29uczogJywgbGF0bG5ncyk7XHJcbiAgICBjb25zdCBwb2x5Z29uID0gTC5HZW9KU09OLmdlb21ldHJ5VG9MYXllcihsYXRsbmdzKSBhcyBhbnk7XHJcblxyXG4gICAgcG9seWdvbi5zZXRTdHlsZSh0aGlzLmNvbmZpZy5wb2x5Z29uT3B0aW9ucyk7XHJcbiAgICByZXR1cm4gcG9seWdvbjtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgbWVyZ2UobGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc29sZS5sb2coJ21lcmdlJywgbGF0bG5ncyk7XHJcbiAgICBjb25zdCBwb2x5Z29uRmVhdHVyZSA9IFtdO1xyXG4gICAgY29uc3QgbmV3QXJyYXk6IEwuRmVhdHVyZUdyb3VwW10gPSBbXTtcclxuICAgIGxldCBwb2x5SW50ZXJzZWN0aW9uID0gZmFsc2U7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBmZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xyXG4gICAgICBpZiAoZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihbZWxlbWVudF0pO1xyXG4gICAgICAgICAgcG9seUludGVyc2VjdGlvbiA9IHRoaXMudHVyZkhlbHBlci5wb2x5Z29uSW50ZXJzZWN0KGZlYXR1cmUsIGxhdGxuZ3MpO1xyXG4gICAgICAgICAgaWYgKHBvbHlJbnRlcnNlY3Rpb24pIHtcclxuICAgICAgICAgICAgbmV3QXJyYXkucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgICBwb2x5Z29uRmVhdHVyZS5wdXNoKGZlYXR1cmUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24oXHJcbiAgICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcG9seUludGVyc2VjdGlvbiA9IHRoaXMudHVyZkhlbHBlci5wb2x5Z29uSW50ZXJzZWN0KGZlYXR1cmUsIGxhdGxuZ3MpO1xyXG4gICAgICAgIGlmIChwb2x5SW50ZXJzZWN0aW9uKSB7XHJcbiAgICAgICAgICBuZXdBcnJheS5wdXNoKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICBwb2x5Z29uRmVhdHVyZS5wdXNoKGZlYXR1cmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zb2xlLmxvZyhuZXdBcnJheSk7XHJcbiAgICBpZiAobmV3QXJyYXkubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLnVuaW9uUG9seWdvbnMobmV3QXJyYXksIGxhdGxuZ3MsIHBvbHlnb25GZWF0dXJlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxhdGxuZ3MsIHRydWUpO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBuZXh0XHJcbiAgcHJpdmF0ZSBzdWJ0cmFjdChsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBsZXQgYWRkSG9sZSA9IGxhdGxuZ3M7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBmZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xyXG4gICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdO1xyXG4gICAgICBjb25zdCBwb2x5ID0gdGhpcy5nZXRMYXRMbmdzRnJvbUpzb24obGF5ZXIpO1xyXG4gICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKFxyXG4gICAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IG5ld1BvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkRpZmZlcmVuY2UoZmVhdHVyZSwgYWRkSG9sZSk7XHJcbiAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihwb2x5KTtcclxuICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgIGFkZEhvbGUgPSBuZXdQb2x5Z29uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbmV3TGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiA9IGFkZEhvbGU7XHJcbiAgICBjb25zdCBjb29yZHMgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0Q29vcmRzKG5ld0xhdGxuZ3MpO1xyXG4gICAgY29vcmRzLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcih0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFt2YWx1ZV0pLCB0cnVlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBldmVudHMob25vZmY6IGJvb2xlYW4pIHtcclxuICAgIGNvbnN0IG9ub3JvZmYgPSBvbm9mZiA/ICdvbicgOiAnb2ZmJztcclxuICAgIHRoaXMubWFwW29ub3JvZmZdKCdtb3VzZWRvd24nLCB0aGlzLm1vdXNlRG93biwgdGhpcyk7XHJcbiAgfVxyXG4gIC8vIGZpbmUsIFRPRE86IGlmIHNwZWNpYWwgbWFya2Vyc1xyXG4gIHByaXZhdGUgYWRkTWFya2VyKGxhdGxuZ3M6IElMYXRMbmdbXSwgRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4vKiAgICAgY29uc3QgbWVudU1hcmtlcklkeCA9IHRoaXMuZ2V0TWFya2VySW5kZXgoXHJcbiAgICAgIGxhdGxuZ3MsXHJcbiAgICAgIHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyTWVudUljb24ucG9zaXRpb25cclxuICAgICk7XHJcbiAgICBjb25zdCBkZWxldGVNYXJrZXJJZHggPSB0aGlzLmdldE1hcmtlckluZGV4KFxyXG4gICAgICBsYXRsbmdzLFxyXG4gICAgICB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckRlbGV0ZUljb24ucG9zaXRpb25cclxuICAgICk7ICovXHJcblxyXG4gICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIGkpID0+IHtcclxuICAgICAgbGV0IGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJJY29uLnN0eWxlQ2xhc3NlcztcclxuICAvKiAgICAgaWYgKGkgPT09IG1lbnVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XHJcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfVxyXG4gICAgICBpZiAoaSA9PT0gZGVsZXRlTWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XHJcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckRlbGV0ZUljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICB9ICovXHJcbiAgICAgIGNvbnN0IG1hcmtlciA9IG5ldyBMLk1hcmtlcihsYXRsbmcsIHtcclxuICAgICAgICBpY29uOiB0aGlzLmNyZWF0ZURpdkljb24oaWNvbkNsYXNzZXMpLFxyXG4gICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcclxuICAgICAgICB0aXRsZTogaS50b1N0cmluZygpXHJcbiAgICAgIH0pO1xyXG4gICAgICBGZWF0dXJlR3JvdXAuYWRkTGF5ZXIobWFya2VyKS5hZGRUbyh0aGlzLm1hcCk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiRmVhdHVyZUdyb3VwOiBcIiwgRmVhdHVyZUdyb3VwKTtcclxuICAgICAgbWFya2VyLm9uKCdkcmFnJywgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBtYXJrZXIub24oJ2RyYWdlbmQnLCBlID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlckRyYWdFbmQoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgfSk7XHJcbiAgICAvKiAgIGlmIChpID09PSBtZW51TWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIC8vIG1hcmtlci5iaW5kUG9wdXAoXHJcbiAgICAgICAgLy8gICB0aGlzLmdldEh0bWxDb250ZW50KGUgPT4ge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImNsaWNrZWQgb25cIiwgZS50YXJnZXQpO1xyXG4gICAgICAgIC8vICAgfSlcclxuICAgICAgICAvLyApO1xyXG4gICAgICAgIC8vIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgIC8vICAgdGhpcy5jb252ZXJ0VG9Cb3VuZHNQb2x5Z29uKGUsIGxhdGxuZ3MpXHJcbiAgICAgICAgLy8gfSlcclxuICAgICAgfVxyXG4gICAgICBpZiAoaSA9PT0gZGVsZXRlTWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XHJcbiAgICAgICAgbWFya2VyLm9uKCdjbGljaycsIGUgPT4ge1xyXG4gICAgICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gKi9cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRIb2xlTWFya2VyKGxhdGxuZ3M6IElMYXRMbmdbXSwgRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIGkpID0+IHtcclxuICAgICAgY29uc3QgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICAvKiAgaWYgKGkgPT09IDAgJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XHJcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy9UT0RPLSBsZWdnIHRpbCBmaWxsIGljb25cclxuICAgICAgaWYgKGkgPT09IGxhdGxuZ3MubGVuZ3RoIC0gMSAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfSAqL1xyXG4gICAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5NYXJrZXIobGF0bG5nLCB7XHJcbiAgICAgICAgaWNvbjogdGhpcy5jcmVhdGVEaXZJY29uKGljb25DbGFzc2VzKSxcclxuICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgdGl0bGU6IGkudG9TdHJpbmcoKVxyXG4gICAgICB9KTtcclxuICAgICAgRmVhdHVyZUdyb3VwLmFkZExheWVyKG1hcmtlcikuYWRkVG8odGhpcy5tYXApO1xyXG5cclxuICAgICAgbWFya2VyLm9uKCdkcmFnJywgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBtYXJrZXIub24oJ2RyYWdlbmQnLCBlID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlckRyYWdFbmQoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIC8qICAgaWYgKGkgPT09IDAgJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XHJcbiAgICAgICAgbWFya2VyLmJpbmRQb3B1cCh0aGlzLmdldEh0bWxDb250ZW50KChlKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImNsaWNrZWQgb25cIiwgZS50YXJnZXQpO1xyXG4gICAgICAgIH0pKTtcclxuICAgICAgICAvLyBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAvLyAgIHRoaXMudG9nZ2xlTWFya2VyTWVudSgpO1xyXG4gICAgICAgIC8vIH0pXHJcbiAgICAgIH1cclxuICAgICAgaWYgKGkgPT09IGxhdGxuZ3MubGVuZ3RoIC0gMSAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gKi9cclxuICAgIH0pO1xyXG4gIH1cclxuICBwcml2YXRlIGNyZWF0ZURpdkljb24oY2xhc3NOYW1lczogc3RyaW5nW10pOiBMLkRpdkljb24ge1xyXG4gICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMuam9pbignICcpO1xyXG4gICAgY29uc3QgaWNvbiA9IEwuZGl2SWNvbih7IGNsYXNzTmFtZTogY2xhc3NlcyB9KTtcclxuICAgIHJldHVybiBpY29uO1xyXG4gIH1cclxuICAvLyBUT0RPOiBDbGVhbnVwXHJcbiAgcHJpdmF0ZSBtYXJrZXJEcmFnKEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnN0IG5ld1BvcyA9IFtdO1xyXG4gICAgbGV0IHRlc3RhcnJheSA9IFtdO1xyXG4gICAgbGV0IGhvbGUgPSBbXTtcclxuICAgIGNvbnN0IGxheWVyTGVuZ3RoID0gRmVhdHVyZUdyb3VwLmdldExheWVycygpIGFzIGFueTtcclxuICAgIGNvbnN0IHBvc2FycmF5cyA9IGxheWVyTGVuZ3RoWzBdLmdldExhdExuZ3MoKTtcclxuICAgIGNvbnNvbGUubG9nKHBvc2FycmF5cyk7XHJcbiAgICBsZXQgbGVuZ3RoID0gMDtcclxuICAgIGlmIChwb3NhcnJheXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcG9zYXJyYXlzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHRlc3RhcnJheSA9IFtdO1xyXG4gICAgICAgIGhvbGUgPSBbXTtcclxuICAgICAgICBjb25zb2xlLmxvZygnUG9zaXNqb25lcjogJywgcG9zYXJyYXlzW2luZGV4XSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICBpZiAocG9zYXJyYXlzWzBdLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1Bvc2lzam9uZXIgMjogJywgcG9zYXJyYXlzW2luZGV4XVtpXSk7XHJcblxyXG4gICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdW2ldLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBob2xlLnB1c2godGVzdGFycmF5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1bMF0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc29sZS5sb2coJ0hvbGU6ICcsIGhvbGUpO1xyXG4gICAgICAgICAgbmV3UG9zLnB1c2goaG9sZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlbmd0aCArPSBwb3NhcnJheXNbaW5kZXggLSAxXVswXS5sZW5ndGg7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnU1RhcnQgaW5kZXg6ICcsIGxlbmd0aCk7XHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoOyBqIDwgcG9zYXJyYXlzW2luZGV4XVswXS5sZW5ndGggKyBsZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICB0ZXN0YXJyYXkucHVzaCgobGF5ZXJMZW5ndGhbaiArIDFdIGFzIGFueSkuZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICBuZXdQb3MucHVzaChob2xlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHRlc3RhcnJheSA9IFtdXHJcbiAgICAgIGhvbGUgPSBbXTtcclxuICAgICAgbGV0IGxlbmd0aDIgPSAwO1xyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHRlc3RhcnJheSA9IFtdO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdQb2x5Z29uIGRyYWc6ICcsIHBvc2FycmF5c1swXVtpbmRleF0pO1xyXG4gICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgaWYgKHBvc2FycmF5c1swXVtpbmRleF0ubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVtpbmRleF0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVswXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGVuZ3RoMiArPSBwb3NhcnJheXNbMF1baW5kZXggLSAxXS5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgZm9yIChsZXQgaiA9IGxlbmd0aDI7IGogPCBwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aCArIGxlbmd0aDI7IGorKykge1xyXG4gICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBob2xlLnB1c2godGVzdGFycmF5KTtcclxuICAgICAgfVxyXG4gICAgICBuZXdQb3MucHVzaChob2xlKTtcclxuICAgICAgY29uc29sZS5sb2coJ0hvbGUgMjogJywgaG9sZSk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZygnTnllIHBvc2lzam9uZXI6ICcsIG5ld1Bvcyk7XHJcbiAgICBsYXllckxlbmd0aFswXS5zZXRMYXRMbmdzKG5ld1Bvcyk7XHJcbiAgfVxyXG4gIC8vIGNoZWNrIHRoaXNcclxuICBwcml2YXRlIG1hcmtlckRyYWdFbmQoRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBGZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xyXG4gICAgY29uc29sZS5sb2coXHJcbiAgICAgICdNYXJrZXJkcmFnZW5kIHBvbHlnb246ICcsXHJcbiAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzXHJcbiAgICApO1xyXG4gICAgaWYgKGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihbZWxlbWVudF0pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnTWFya2VyZHJhZ2VuZDogJywgZmVhdHVyZSk7XHJcbiAgICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xyXG4gICAgICAgICAgdGhpcy5raW5rcyA9IHRydWU7XHJcbiAgICAgICAgICBjb25zdCB1bmtpbmsgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0S2lua3MoZmVhdHVyZSk7XHJcbiAgICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdVbmtpbms6ICcsIHVua2luayk7XHJcbiAgICAgICAgICB1bmtpbmsuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKFxyXG4gICAgICAgICAgICAgIHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihwb2x5Z29uKSxcclxuICAgICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5raW5rcyA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKGZlYXR1cmUsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXHJcbiAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXNcclxuICAgICAgKTtcclxuICAgICAgY29uc29sZS5sb2coJ01hcmtlcmRyYWdlbmQ6ICcsIGZlYXR1cmUpO1xyXG4gICAgICBpZiAodGhpcy50dXJmSGVscGVyLmhhc0tpbmtzKGZlYXR1cmUpKSB7XHJcbiAgICAgICAgdGhpcy5raW5rcyA9IHRydWU7XHJcbiAgICAgICAgY29uc3QgdW5raW5rID0gdGhpcy50dXJmSGVscGVyLmdldEtpbmtzKGZlYXR1cmUpO1xyXG4gICAgICAgIC8vIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihmZWF0dXJlKSk7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnVW5raW5rOiAnLCB1bmtpbmspO1xyXG4gICAgICAgIHVua2luay5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihwb2x5Z29uKSwgZmFsc2UsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihmZWF0dXJlKSk7XHJcbiAgICAgICAgdGhpcy5raW5rcyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbihmZWF0dXJlLCBmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHNcclxuICAgICk7XHJcbiAgfVxyXG4gIC8vIGZpbmUsIGNoZWNrIHRoZSByZXR1cm5lZCB0eXBlXHJcbiAgcHJpdmF0ZSBnZXRMYXRMbmdzRnJvbUpzb24oXHJcbiAgICBmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XHJcbiAgKTogSUxhdExuZ1tdW10ge1xyXG4gICAgY29uc29sZS5sb2coJ2dldExhdExuZ3NGcm9tSnNvbjogJywgZmVhdHVyZSk7XHJcbiAgICBsZXQgY29vcmQ7XHJcbiAgICBpZiAoZmVhdHVyZSkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggPiAxICYmXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS50eXBlID09PSAnTXVsdGlQb2x5Z29uJ1xyXG4gICAgICApIHtcclxuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXS5sZW5ndGggPiAxICYmXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS50eXBlID09PSAnUG9seWdvbidcclxuICAgICAgKSB7XHJcbiAgICAgICAgY29vcmQgPSBMLkdlb0pTT04uY29vcmRzVG9MYXRMbmdzKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvb3JkID0gTC5HZW9KU09OLmNvb3Jkc1RvTGF0TG5ncyhmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdWzBdKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb29yZDtcclxuICB9XHJcblxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHVuaW9uUG9seWdvbnMoXHJcbiAgICBsYXllcnMsXHJcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgcG9seWdvbkZlYXR1cmVcclxuICApIHtcclxuICAgIGNvbnNvbGUubG9nKCd1bmlvblBvbHlnb25zJywgbGF5ZXJzLCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XHJcblxyXG4gICAgbGV0IGFkZE5ldyA9IGxhdGxuZ3M7XHJcbiAgICBsYXllcnMuZm9yRWFjaCgoZmVhdHVyZUdyb3VwLCBpKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpO1xyXG4gICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdO1xyXG4gICAgICBjb25zdCBwb2x5ID0gdGhpcy5nZXRMYXRMbmdzRnJvbUpzb24obGF5ZXIpO1xyXG4gICAgICBjb25zdCB1bmlvbiA9IHRoaXMudHVyZkhlbHBlci51bmlvbihhZGROZXcsIHBvbHlnb25GZWF0dXJlW2ldKTsgLy8gQ2hlY2sgZm9yIG11bHRpcG9seWdvbnNcclxuICAgICAgLy8gTmVlZHMgYSBjbGVhbnVwIGZvciB0aGUgbmV3IHZlcnNpb25cclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uT25NZXJnZShwb2x5KTtcclxuICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICAgIGFkZE5ldyA9IHVuaW9uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbmV3TGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiA9IGFkZE5ldzsgLy8gVHJlbmdlciBrYW5za2plIHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbiggYWRkTmV3KTtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld0xhdGxuZ3MsIHRydWUpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgY29uc29sZS5sb2coJ3JlbW92ZUZlYXR1cmVHcm91cCcsIGZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5maWx0ZXIoXHJcbiAgICAgIGZlYXR1cmVHcm91cHMgPT4gZmVhdHVyZUdyb3VwcyAhPT0gZmVhdHVyZUdyb3VwXHJcbiAgICApO1xyXG4gICAgLy8gdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3VwKTtcclxuICB9XHJcbiAgLy8gZmluZSB1bnRpbCByZWZhY3RvcmluZ1xyXG4gIHByaXZhdGUgcmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICBjb25zb2xlLmxvZygncmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZScsIGZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgY29uc3QgbmV3QXJyYXkgPSBbXTtcclxuICAgIGlmIChmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0pIHtcclxuICAgICAgY29uc3QgcG9seWdvbiA9IChmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55KS5nZXRMYXRMbmdzKClbMF07XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UuZm9yRWFjaCh2ID0+IHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICB2LnBvbHlnb24udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXS50b1N0cmluZygpICYmXHJcbiAgICAgICAgICB2LnBvbHlnb25bMF0udG9TdHJpbmcoKSA9PT0gcG9seWdvblswXVswXS50b1N0cmluZygpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICB2LnBvbHlnb24gPSBwb2x5Z29uO1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaCh2KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIHYucG9seWdvbi50b1N0cmluZygpICE9PSBwb2x5Z29uWzBdLnRvU3RyaW5nKCkgJiZcclxuICAgICAgICAgIHYucG9seWdvblswXS50b1N0cmluZygpICE9PSBwb2x5Z29uWzBdWzBdLnRvU3RyaW5nKClcclxuICAgICAgICApIHtcclxuICAgICAgICAgIG5ld0FycmF5LnB1c2godik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMgPSB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZpbHRlcihcclxuICAgICAgICBmZWF0dXJlR3JvdXBzID0+IGZlYXR1cmVHcm91cHMgIT09IGZlYXR1cmVHcm91cFxyXG4gICAgICApO1xyXG5cclxuICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3VwKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gZmluZSB1bnRpbCByZWZhY3RvcmluZ1xyXG4gIHByaXZhdGUgZGVsZXRlUG9seWdvbk9uTWVyZ2UocG9seWdvbikge1xyXG4gICAgY29uc29sZS5sb2coJ2RlbGV0ZVBvbHlnb25Pbk1lcmdlJywgcG9seWdvbik7XHJcbiAgICBsZXQgcG9seWdvbjIgPSBbXTtcclxuICAgIGlmICh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55O1xyXG4gICAgICAgIGNvbnN0IGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKClbMF07XHJcbiAgICAgICAgcG9seWdvbjIgPSBbLi4ubGF0bG5nc1swXV07XHJcbiAgICAgICAgaWYgKGxhdGxuZ3NbMF1bMF0gIT09IGxhdGxuZ3NbMF1bbGF0bG5nc1swXS5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgcG9seWdvbjIucHVzaChsYXRsbmdzWzBdWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZXF1YWxzID0gdGhpcy5wb2x5Z29uQXJyYXlFcXVhbHNNZXJnZShwb2x5Z29uMiwgcG9seWdvbik7XHJcblxyXG4gICAgICAgIGlmIChlcXVhbHMpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdFUVVBTFMnLCBwb2x5Z29uKTtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKHBvbHlnb24pO1xyXG4gICAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlVHJhc2hjYW4ocG9seWdvbik7XHJcbiAgICAgICAgICAvLyB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFRPRE8gLSBsZWdnZSBldCBhbm5ldCBzdGVkXHJcbiAgcHJpdmF0ZSBwb2x5Z29uQXJyYXlFcXVhbHNNZXJnZShwb2x5MTogYW55W10sIHBvbHkyOiBhbnlbXSk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHBvbHkxLnRvU3RyaW5nKCkgPT09IHBvbHkyLnRvU3RyaW5nKCk7XHJcbiAgfVxyXG4gIC8vIFRPRE8gLSBsZWdnZSBldCBhbm5ldCBzdGVkXHJcbiAgcHJpdmF0ZSBwb2x5Z29uQXJyYXlFcXVhbHMocG9seTE6IGFueVtdLCBwb2x5MjogYW55W10pOiBib29sZWFuIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwicG9seWdvbkFycmF5RXF1YWxzXCIsIHBvbHkxLCBwb2x5Mik7XHJcblxyXG4gICAgaWYgKHBvbHkxWzBdWzBdKSB7XHJcbiAgICAgIGlmICghcG9seTFbMF1bMF0uZXF1YWxzKHBvbHkyWzBdWzBdKSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICghcG9seTFbMF0uZXF1YWxzKHBvbHkyWzBdKSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgIH1cclxuICAgIGlmIChwb2x5MS5sZW5ndGggIT09IHBvbHkyLmxlbmd0aCkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc2V0TGVhZmxldE1hcEV2ZW50cyhcclxuICAgIGVuYWJsZURyYWdnaW5nOiBib29sZWFuLFxyXG4gICAgZW5hYmxlRG91YmxlQ2xpY2tab29tOiBib29sZWFuLFxyXG4gICAgZW5hYmxlU2Nyb2xsV2hlZWxab29tOiBib29sZWFuXHJcbiAgKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInNldExlYWZsZXRNYXBFdmVudHNcIiwgZW5hYmxlRHJhZ2dpbmcsIGVuYWJsZURvdWJsZUNsaWNrWm9vbSwgZW5hYmxlU2Nyb2xsV2hlZWxab29tKTtcclxuXHJcbiAgICBlbmFibGVEcmFnZ2luZyA/IHRoaXMubWFwLmRyYWdnaW5nLmVuYWJsZSgpIDogdGhpcy5tYXAuZHJhZ2dpbmcuZGlzYWJsZSgpO1xyXG4gICAgZW5hYmxlRG91YmxlQ2xpY2tab29tXHJcbiAgICAgID8gdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmVuYWJsZSgpXHJcbiAgICAgIDogdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmRpc2FibGUoKTtcclxuICAgIGVuYWJsZVNjcm9sbFdoZWVsWm9vbVxyXG4gICAgICA/IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5lbmFibGUoKVxyXG4gICAgICA6IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBzZXREcmF3TW9kZShtb2RlOiBEcmF3TW9kZSkge1xyXG4gICAgY29uc29sZS5sb2coJ3NldERyYXdNb2RlJywgdGhpcy5tYXApO1xyXG4gICAgdGhpcy5kcmF3TW9kZVN1YmplY3QubmV4dChtb2RlKTtcclxuICAgIGlmICghIXRoaXMubWFwKSB7XHJcbiAgICAgIGxldCBpc0FjdGl2ZURyYXdNb2RlID0gdHJ1ZTtcclxuICAgICAgc3dpdGNoIChtb2RlKSB7XHJcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5PZmY6XHJcbiAgICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3MoXHJcbiAgICAgICAgICAgIHRoaXMubWFwLmdldENvbnRhaW5lcigpLFxyXG4gICAgICAgICAgICAnY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkJ1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKGZhbHNlKTtcclxuICAgICAgICAgIHRoaXMuc3RvcERyYXcoKTtcclxuICAgICAgICAgIHRoaXMudHJhY2VyLnNldFN0eWxlKHtcclxuICAgICAgICAgICAgY29sb3I6ICcnXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyh0cnVlLCB0cnVlLCB0cnVlKTtcclxuICAgICAgICAgIGlzQWN0aXZlRHJhd01vZGUgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuQWRkUG9seWdvbjpcclxuICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhcclxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXHJcbiAgICAgICAgICAgICdjcm9zc2hhaXItY3Vyc29yLWVuYWJsZWQnXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgdGhpcy5ldmVudHModHJ1ZSk7XHJcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XHJcbiAgICAgICAgICAgIGNvbG9yOiBkZWZhdWx0Q29uZmlnLnBvbHlMaW5lT3B0aW9ucy5jb2xvclxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLnNldExlYWZsZXRNYXBFdmVudHMoZmFsc2UsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIERyYXdNb2RlLlN1YnRyYWN0UG9seWdvbjpcclxuICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhcclxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXHJcbiAgICAgICAgICAgICdjcm9zc2hhaXItY3Vyc29yLWVuYWJsZWQnXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgdGhpcy5ldmVudHModHJ1ZSk7XHJcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XHJcbiAgICAgICAgICAgIGNvbG9yOiAnI0Q5NDYwRidcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5zZXRMZWFmbGV0TWFwRXZlbnRzKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIG1vZGVDaGFuZ2UobW9kZTogRHJhd01vZGUpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUobW9kZSk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcclxuICBkcmF3TW9kZUNsaWNrKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5BZGRQb2x5Z29uKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy8gcmVtb3ZlLCB1c2UgbW9kZUNoYW5nZVxyXG4gIGZyZWVkcmF3TWVudUNsaWNrKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5BZGRQb2x5Z29uKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcblxyXG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcclxuICBzdWJ0cmFjdENsaWNrKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5TdWJ0cmFjdFBvbHlnb24pO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSByZXNldFRyYWNrZXIoKSB7XHJcbiAgICB0aGlzLnRyYWNlci5zZXRMYXRMbmdzKFtbMCwgMF1dKTtcclxuICB9XHJcblxyXG4gIHRvZ2dsZU1hcmtlck1lbnUoKTogdm9pZCB7XHJcbiAgICBhbGVydCgnb3BlbiBtZW51Jyk7XHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0SHRtbENvbnRlbnQoY2FsbEJhY2s6IEZ1bmN0aW9uKTogSFRNTEVsZW1lbnQge1xyXG4gICAgY29uc3QgY29tcCA9IHRoaXMucG9wdXBHZW5lcmF0b3IuZ2VuZXJhdGVBbHRlclBvcHVwKCk7XHJcbiAgICBjb21wLmluc3RhbmNlLmJib3hDbGlja2VkLnN1YnNjcmliZShlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ2Jib3ggY2xpY2tlZCcsIGUpO1xyXG4gICAgICBjYWxsQmFjayhlKTtcclxuICAgIH0pO1xyXG4gICAgY29tcC5pbnN0YW5jZS5zaW1wbHlmaUNsaWNrZWQuc3Vic2NyaWJlKGUgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnc2ltcGx5ZmkgY2xpY2tlZCcsIGUpO1xyXG4gICAgICBjYWxsQmFjayhlKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvbXAubG9jYXRpb24ubmF0aXZlRWxlbWVudDtcclxuICB9XHJcbiAgcHJpdmF0ZSBjb252ZXJ0VG9Cb3VuZHNQb2x5Z29uKGxhdGxuZ3M6IElMYXRMbmdbXSkge1xyXG4gICAgY29uc3QgbFBvbHkgPSB0aGlzLmxlYWZsZXRIZWxwZXIuY3JlYXRlUG9seWdvbihsYXRsbmdzKTtcclxuXHJcbiAgICAvLyBjb25zdCBjb29yZHMgPSB0aGlzLmNvbnZlcnRUb0Nvb3JkcyhbbGF0bG5nc10pO1xyXG4gICAgLy8gY29uc3QgcCA9IHRoaXMuZ2V0UG9seWdvbigpXHJcblxyXG4gICAgLy8gaWYgKHBvbHkuZ2VvbWV0cnkudHlwZSA9PT0gXCJNdWx0aVBvbHlnb25cIikge1xyXG4gICAgLy8gICBsZXQgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5jb252ZXJ0VG9Cb3VuZGluZ0JveFBvbHlnb24ocG9seSk7XHJcbiAgICAvLyAgIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihwb2x5KSk7XHJcbiAgICAvLyAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld1BvbHlnb24sIGZhbHNlKTtcclxuICAgIC8vIH1cclxuICB9XHJcbiAgcHJpdmF0ZSBnZXRNYXJrZXJJbmRleChcclxuICAgIGxhdGxuZ3M6IElMYXRMbmdbXSxcclxuICAgIHBvc2l0aW9uOiBNYXJrZXJQbGFjZW1lbnRcclxuICApOiBudW1iZXIge1xyXG4gICAgY29uc3QgYm91bmRzOiBMLkxhdExuZ0JvdW5kcyA9IFBvbHlEcmF3VXRpbC5nZXRCb3VuZHMoXHJcbiAgICAgIGxhdGxuZ3MsXHJcbiAgICAgIE1hdGguc3FydCgyKSAvIDJcclxuICAgICk7XHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MoXHJcbiAgICAgIGJvdW5kcy5nZXRXZXN0KCksXHJcbiAgICAgIGJvdW5kcy5nZXRTb3V0aCgpLFxyXG4gICAgICBib3VuZHMuZ2V0RWFzdCgpLFxyXG4gICAgICBib3VuZHMuZ2V0Tm9ydGgoKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGNvbXBhc3NEaXJlY3Rpb24gPSBjb21wYXNzLmdldERpcmVjdGlvbihwb3NpdGlvbik7XHJcbiAgICBjb25zdCBsYXRMbmdQb2ludDogSUxhdExuZyA9IHtcclxuICAgICAgbGF0OiBjb21wYXNzRGlyZWN0aW9uWzFdLFxyXG4gICAgICBsbmc6IGNvbXBhc3NEaXJlY3Rpb25bMF1cclxuICAgIH07XHJcbiAgICBjb25zdCB0YXJnZXRQb2ludCA9IHRoaXMudHVyZkhlbHBlci5nZXRDb29yZChsYXRMbmdQb2ludCk7XHJcbiAgICBjb25zdCBmYyA9IHRoaXMudHVyZkhlbHBlci5nZXRGZWF0dXJlUG9pbnRDb2xsZWN0aW9uKGxhdGxuZ3MpO1xyXG4gICAgY29uc3QgbmVhcmVzdFBvaW50SWR4ID0gdGhpcy50dXJmSGVscGVyLmdldE5lYXJlc3RQb2ludEluZGV4KFxyXG4gICAgICB0YXJnZXRQb2ludCxcclxuICAgICAgZmMgYXMgYW55XHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBuZWFyZXN0UG9pbnRJZHg7XHJcbiAgfVxyXG59XHJcbi8vIGZseXR0IHRpbCBlbnVtLnRzXHJcbmV4cG9ydCBlbnVtIERyYXdNb2RlIHtcclxuICBPZmYgPSAwLFxyXG4gIEFkZFBvbHlnb24gPSAxLFxyXG4gIEVkaXRQb2x5Z29uID0gMixcclxuICBTdWJ0cmFjdFBvbHlnb24gPSAzLFxyXG4gIExvYWRQb2x5Z29uID0gNFxyXG59XHJcbiJdfQ==