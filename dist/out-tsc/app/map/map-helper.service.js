var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@angular/core";
import * as L from "leaflet";
//import * as turf from "@turf/turf";
import { BehaviorSubject, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { MapStateService } from "./map-state.service";
import { TurfHelperService } from "./turf-helper.service";
import { PolygonInformationService } from "./polygon-information.service";
import defaultConfig from "./config.json";
import { ComponentGeneraterService } from "./component-generater.service";
import { Compass, PolyDrawUtil } from "./utils";
import { LeafletHelperService } from "./leaflet-helper.service";
var MapHelperService = /** @class */ (function () {
    function MapHelperService(mapState, popupGenerator, turfHelper, polygonInformation, leafletHelper) {
        var _this = this;
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
        this.mapState.map$.pipe(filter(function (m) { return m !== null; })).subscribe(function (map) {
            _this.map = map;
            console.log("pre this.config", _this.config);
            _this.config = defaultConfig;
            console.log("this.config", _this.config);
            _this.configurate({});
            console.log("after this.config", _this.config);
            _this.tracer = L.polyline([[0, 0]], _this.config.polyLineOptions);
            _this.initPolyDraw();
        });
        this.polygonInformation.polygonInformation$.subscribe(function (k) {
            console.log("PolyInfo start: ", k);
        });
        //TODO - lage en config observable i mapState og oppdater this.config med den
    }
    //new
    MapHelperService.prototype.configurate = function (config) {
        //TODO if config is path...
        this.config = __assign({}, defaultConfig, config);
        this.mergePolygons = this.config.mergePolygons;
        this.kinks = this.config.kinks;
    };
    //fine
    MapHelperService.prototype.closeAndReset = function () {
        //console.log("closeAndReset");
        this.setDrawMode(DrawMode.Off);
        this.removeAllFeatureGroups();
    };
    //make readable
    MapHelperService.prototype.deletePolygon = function (polygon) {
        var _this = this;
        console.log("deletePolygon: ", polygon);
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(function (featureGroup) {
                var layer = featureGroup.getLayers()[0];
                var latlngs = layer.getLatLngs();
                var length = latlngs.length;
                //  = []
                latlngs.forEach(function (latlng, index) {
                    var polygon3;
                    var test = latlng.slice();
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
                    var equals = _this.polygonArrayEquals(polygon3, polygon);
                    console.log("equals: ", equals, " length: ", length);
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
    //fine
    MapHelperService.prototype.removeAllFeatureGroups = function () {
        var _this = this;
        //console.log("removeAllFeatureGroups", null);
        this.arrayOfFeatureGroups.forEach(function (featureGroups) {
            _this.map.removeLayer(featureGroups);
        });
        this.arrayOfFeatureGroups = [];
        this.polygonInformation.deletePolygonInformationStorage();
        // this.polygonDrawStates.reset();
        this.polygonInformation.updatePolygons();
    };
    //fine
    MapHelperService.prototype.getDrawMode = function () {
        //console.log("getDrawMode", null);
        return this.drawModeSubject.value;
    };
    MapHelperService.prototype.addViken = function (polygon) {
        this.addPolygonLayer(polygon, true);
    };
    //check this
    MapHelperService.prototype.addAutoPolygon = function (geographicBorders) {
        var _this = this;
        var featureGroup = new L.FeatureGroup();
        var polygon2 = this.turfHelper.getMultiPolygon(this.convertToCoords(geographicBorders));
        console.log(polygon2);
        var polygon = this.getPolygon(polygon2);
        featureGroup.addLayer(polygon);
        var markerLatlngs = polygon.getLatLngs();
        console.log("markers: ", markerLatlngs);
        markerLatlngs.forEach(function (polygon) {
            polygon.forEach(function (polyElement, i) {
                if (i === 0) {
                    _this.addMarker(polyElement, featureGroup);
                }
                else {
                    _this.addHoleMarker(polyElement, featureGroup);
                    console.log("Hull: ", polyElement);
                }
            });
            // this.addMarker(polygon[0], featureGroup);
            //TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
        });
        this.arrayOfFeatureGroups.push(featureGroup);
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
    };
    //innehåll i if'ar flytta till egna metoder
    MapHelperService.prototype.convertToCoords = function (latlngs) {
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
            console.log("Within1 ", within);
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
    //fine
    MapHelperService.prototype.initPolyDraw = function () {
        //console.log("initPolyDraw", null);
        var _this = this;
        var container = this.map.getContainer();
        var drawMode = this.getDrawMode();
        if (this.config.touchSupport) {
            container.addEventListener("touchstart", function (e) {
                if (drawMode !== DrawMode.Off) {
                    _this.mouseDown(e);
                }
            });
            container.addEventListener("touchend", function (e) {
                if (drawMode !== DrawMode.Off) {
                    _this.mouseUpLeave();
                }
            });
            container.addEventListener("touchmove", function (e) {
                if (drawMode !== DrawMode.Off) {
                    _this.mouseMove(e);
                }
            });
        }
        this.map.addLayer(this.tracer);
        this.setDrawMode(DrawMode.Off);
    };
    //Test L.MouseEvent
    MapHelperService.prototype.mouseDown = function (event) {
        console.log("mouseDown", event);
        if (event.originalEvent != null) {
            this.tracer.setLatLngs([event.latlng]);
        }
        else {
            var latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
            this.tracer.setLatLngs([latlng]);
        }
        this.startDraw();
    };
    //TODO event type, create containerPointToLatLng-method
    MapHelperService.prototype.mouseMove = function (event) {
        //console.log("mouseMove", event);
        if (event.originalEvent != null) {
            this.tracer.addLatLng(event.latlng);
        }
        else {
            var latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY]);
            this.tracer.addLatLng(latlng);
        }
    };
    //fine
    MapHelperService.prototype.mouseUpLeave = function () {
        //console.log("mouseUpLeave", null);
        this.polygonInformation.deletePolygonInformationStorage();
        //console.log("------------------------------Delete trashcans", null);
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
        //console.log("------------------------------create trashcans", null);
    };
    //fine
    MapHelperService.prototype.startDraw = function () {
        //console.log("startDraw", null);
        this.drawStartedEvents(true);
    };
    //fine
    MapHelperService.prototype.stopDraw = function () {
        //console.log("stopDraw", null);
        this.resetTracker();
        this.drawStartedEvents(false);
    };
    //fine
    MapHelperService.prototype.drawStartedEvents = function (onoff) {
        //console.log("drawStartedEvents", onoff);
        var onoroff = onoff ? "on" : "off";
        this.map[onoroff]("mousemove", this.mouseMove, this);
        this.map[onoroff]("mouseup", this.mouseUpLeave, this);
    };
    //On hold
    MapHelperService.prototype.subtractPolygon = function (latlngs) {
        this.subtract(latlngs);
    };
    //fine
    MapHelperService.prototype.addPolygon = function (latlngs, simplify, noMerge) {
        if (noMerge === void 0) { noMerge = false; }
        console.log("addPolygon", latlngs, simplify, noMerge, this.kinks, this.config);
        if (this.mergePolygons && !noMerge && this.arrayOfFeatureGroups.length > 0 && !this.kinks) {
            this.merge(latlngs);
        }
        else {
            this.addPolygonLayer(latlngs, simplify);
        }
    };
    //fine
    MapHelperService.prototype.addPolygonLayer = function (latlngs, simplify) {
        var _this = this;
        var featureGroup = new L.FeatureGroup();
        var latLngs = simplify ? this.turfHelper.getSimplified(latlngs) : latlngs;
        console.log("AddPolygonLayer: ", latLngs);
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
                    console.log("Hull: ", polyElement);
                }
            });
            // this.addMarker(polygon[0], featureGroup);
            //TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
        });
        this.arrayOfFeatureGroups.push(featureGroup);
        console.log("Array: ", this.arrayOfFeatureGroups);
        this.setDrawMode(DrawMode.Off);
        featureGroup.on("click", function (e) {
            _this.polygonClicked(e, latLngs);
        });
    };
    //fine
    MapHelperService.prototype.polygonClicked = function (e, poly) {
        var newPoint = e.latlng;
        if (poly.geometry.type === "MultiPolygon") {
            var newPolygon = this.turfHelper.injectPointToPolygon(poly, [newPoint.lng, newPoint.lat]);
            this.deletePolygon(this.getLatLngsFromJson(poly));
            this.addPolygonLayer(newPolygon, false);
        }
    };
    //fine
    MapHelperService.prototype.getPolygon = function (latlngs) {
        console.log("getPolygons: ", latlngs);
        var polygon = L.GeoJSON.geometryToLayer(latlngs);
        polygon.setStyle(this.config.polygonOptions);
        return polygon;
    };
    //fine
    MapHelperService.prototype.merge = function (latlngs) {
        var _this = this;
        console.log("merge", latlngs);
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
    //next
    MapHelperService.prototype.subtract = function (latlngs) {
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
    //fine
    MapHelperService.prototype.events = function (onoff) {
        var onoroff = onoff ? "on" : "off";
        this.map[onoroff]("mousedown", this.mouseDown, this);
    };
    //fine, TODO: if special markers
    MapHelperService.prototype.addMarker = function (latlngs, FeatureGroup) {
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
            var marker = new L.Marker(latlng, { icon: _this.createDivIcon(iconClasses), draggable: true, title: i.toString() });
            FeatureGroup.addLayer(marker).addTo(_this.map);
            // console.log("FeatureGroup: ", FeatureGroup);
            marker.on("drag", function (e) {
                _this.markerDrag(FeatureGroup);
            });
            marker.on("dragend", function (e) {
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
                marker.on("click", function (e) {
                    _this.deletePolygon([latlngs]);
                });
            }
        });
    };
    MapHelperService.prototype.addHoleMarker = function (latlngs, FeatureGroup) {
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
            var marker = new L.Marker(latlng, { icon: _this.createDivIcon(iconClasses), draggable: true, title: i.toString() });
            FeatureGroup.addLayer(marker).addTo(_this.map);
            marker.on("drag", function (e) {
                _this.markerDrag(FeatureGroup);
            });
            marker.on("dragend", function (e) {
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
    MapHelperService.prototype.createDivIcon = function (classNames) {
        var classes = classNames.join(" ");
        var icon = L.divIcon({ className: classes });
        return icon;
    };
    //TODO: Cleanup
    MapHelperService.prototype.markerDrag = function (FeatureGroup) {
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
                console.log("Posisjoner: ", posarrays[index]);
                if (index === 0) {
                    if (posarrays[0].length > 1) {
                        for (var i = 0; index < posarrays[0].length; i++) {
                            console.log("Posisjoner 2: ", posarrays[index][i]);
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
                    console.log("Hole: ", hole);
                    newPos.push(hole);
                }
                else {
                    length += posarrays[index - 1][0].length;
                    console.log("STart index: ", length);
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
                console.log("Polygon drag: ", posarrays[0][index]);
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
            console.log("Hole 2: ", hole);
        }
        console.log("Nye posisjoner: ", newPos);
        layerLength[0].setLatLngs(newPos);
    };
    // check this
    MapHelperService.prototype.markerDragEnd = function (FeatureGroup) {
        var _this = this;
        this.polygonInformation.deletePolygonInformationStorage();
        var featureCollection = FeatureGroup.toGeoJSON();
        console.log("Markerdragend polygon: ", featureCollection.features[0].geometry.coordinates);
        if (featureCollection.features[0].geometry.coordinates.length > 1) {
            featureCollection.features[0].geometry.coordinates.forEach(function (element) {
                var feature = _this.turfHelper.getMultiPolygon([element]);
                console.log("Markerdragend: ", feature);
                if (_this.turfHelper.hasKinks(feature)) {
                    _this.kinks = true;
                    var unkink = _this.turfHelper.getKinks(feature);
                    // this.deletePolygon(this.getLatLngsFromJson(feature));
                    _this.removeFeatureGroup(FeatureGroup);
                    console.log("Unkink: ", unkink);
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
            console.log("Markerdragend: ", feature);
            if (this.turfHelper.hasKinks(feature)) {
                this.kinks = true;
                var unkink = this.turfHelper.getKinks(feature);
                // this.deletePolygon(this.getLatLngsFromJson(feature));
                this.removeFeatureGroup(FeatureGroup);
                console.log("Unkink: ", unkink);
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
    //fine, check the returned type
    MapHelperService.prototype.getLatLngsFromJson = function (feature) {
        console.log("getLatLngsFromJson: ", feature);
        var coord;
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
    };
    //fine
    MapHelperService.prototype.unionPolygons = function (layers, latlngs, polygonFeature) {
        var _this = this;
        console.log("unionPolygons", layers, latlngs, polygonFeature);
        var addNew = latlngs;
        layers.forEach(function (featureGroup, i) {
            var featureCollection = featureGroup.toGeoJSON();
            var layer = featureCollection.features[0];
            var poly = _this.getLatLngsFromJson(layer);
            var union = _this.turfHelper.union(addNew, polygonFeature[i]); //Check for multipolygons
            //Needs a cleanup for the new version
            _this.deletePolygonOnMerge(poly);
            _this.removeFeatureGroup(featureGroup);
            addNew = union;
        });
        var newLatlngs = addNew; //Trenger kanskje this.turfHelper.getTurfPolygon( addNew);
        this.addPolygonLayer(newLatlngs, true);
    };
    //fine
    MapHelperService.prototype.removeFeatureGroup = function (featureGroup) {
        console.log("removeFeatureGroup", featureGroup);
        featureGroup.clearLayers();
        this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(function (featureGroups) { return featureGroups !== featureGroup; });
        // this.updatePolygons();
        this.map.removeLayer(featureGroup);
    };
    //fine until refactoring
    MapHelperService.prototype.removeFeatureGroupOnMerge = function (featureGroup) {
        console.log("removeFeatureGroupOnMerge", featureGroup);
        var newArray = [];
        if (featureGroup.getLayers()[0]) {
            var polygon_1 = featureGroup.getLayers()[0].getLatLngs()[0];
            this.polygonInformation.polygonInformationStorage.forEach(function (v) {
                if (v.polygon.toString() !== polygon_1[0].toString() && v.polygon[0].toString() === polygon_1[0][0].toString()) {
                    v.polygon = polygon_1;
                    newArray.push(v);
                }
                if (v.polygon.toString() !== polygon_1[0].toString() && v.polygon[0].toString() !== polygon_1[0][0].toString()) {
                    newArray.push(v);
                }
            });
            featureGroup.clearLayers();
            this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(function (featureGroups) { return featureGroups !== featureGroup; });
            this.map.removeLayer(featureGroup);
        }
    };
    //fine until refactoring
    MapHelperService.prototype.deletePolygonOnMerge = function (polygon) {
        var _this = this;
        console.log("deletePolygonOnMerge", polygon);
        var polygon2 = [];
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(function (featureGroup) {
                var layer = featureGroup.getLayers()[0];
                var latlngs = layer.getLatLngs()[0];
                polygon2 = latlngs[0].slice();
                if (latlngs[0][0] !== latlngs[0][latlngs[0].length - 1]) {
                    polygon2.push(latlngs[0][0]);
                }
                var equals = _this.polygonArrayEqualsMerge(polygon2, polygon);
                if (equals) {
                    console.log("EQUALS", polygon);
                    _this.removeFeatureGroupOnMerge(featureGroup);
                    _this.deletePolygon(polygon);
                    _this.polygonInformation.deleteTrashcan(polygon);
                    // this.updatePolygons();
                }
            });
        }
    };
    //TODO - legge et annet sted
    MapHelperService.prototype.polygonArrayEqualsMerge = function (poly1, poly2) {
        return poly1.toString() === poly2.toString();
    };
    //TODO - legge et annet sted
    MapHelperService.prototype.polygonArrayEquals = function (poly1, poly2) {
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
    };
    //fine
    MapHelperService.prototype.setLeafletMapEvents = function (enableDragging, enableDoubleClickZoom, enableScrollWheelZoom) {
        //console.log("setLeafletMapEvents", enableDragging, enableDoubleClickZoom, enableScrollWheelZoom);
        enableDragging ? this.map.dragging.enable() : this.map.dragging.disable();
        enableDoubleClickZoom ? this.map.doubleClickZoom.enable() : this.map.doubleClickZoom.disable();
        enableScrollWheelZoom ? this.map.scrollWheelZoom.enable() : this.map.scrollWheelZoom.disable();
    };
    //fine
    MapHelperService.prototype.setDrawMode = function (mode) {
        console.log("setDrawMode", this.map);
        this.drawModeSubject.next(mode);
        if (!!this.map) {
            var isActiveDrawMode = true;
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
    };
    MapHelperService.prototype.modeChange = function (mode) {
        this.setDrawMode(mode);
        this.polygonInformation.saveCurrentState();
    };
    //remove, use modeChange
    MapHelperService.prototype.drawModeClick = function () {
        this.setDrawMode(DrawMode.AddPolygon);
        this.polygonInformation.saveCurrentState();
    };
    //remove, use modeChange
    MapHelperService.prototype.freedrawMenuClick = function () {
        this.setDrawMode(DrawMode.AddPolygon);
        this.polygonInformation.saveCurrentState();
    };
    //remove, use modeChange
    MapHelperService.prototype.subtractClick = function () {
        this.setDrawMode(DrawMode.SubtractPolygon);
        this.polygonInformation.saveCurrentState();
    };
    //fine
    MapHelperService.prototype.resetTracker = function () {
        this.tracer.setLatLngs([[0, 0]]);
    };
    MapHelperService.prototype.toggleMarkerMenu = function () {
        alert("open menu");
    };
    MapHelperService.prototype.getHtmlContent = function (callBack) {
        var comp = this.popupGenerator.generateAlterPopup();
        comp.instance.bboxClicked.subscribe(function (e) {
            console.log("bbox clicked", e);
            callBack(e);
        });
        comp.instance.simplyfiClicked.subscribe(function (e) {
            console.log("simplyfi clicked", e);
            callBack(e);
        });
        return comp.location.nativeElement;
    };
    MapHelperService.prototype.convertToBoundsPolygon = function (latlngs) {
        var lPoly = this.leafletHelper.createPolygon(latlngs);
        // const coords = this.convertToCoords([latlngs]);
        // const p = this.getPolygon()
        // if (poly.geometry.type === "MultiPolygon") {
        //   let newPolygon = this.turfHelper.convertToBoundingBoxPolygon(poly);
        //   this.deletePolygon(this.getLatLngsFromJson(poly));
        //   this.addPolygonLayer(newPolygon, false);
        // }
    };
    MapHelperService.prototype.getMarkerIndex = function (latlngs, position) {
        var bounds = PolyDrawUtil.getBounds(latlngs, (Math.sqrt(2) / 2));
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
    MapHelperService = __decorate([
        Injectable({
            providedIn: "root"
        })
        //Rename - PolyDrawService
        ,
        __metadata("design:paramtypes", [MapStateService,
            ComponentGeneraterService,
            TurfHelperService,
            PolygonInformationService,
            LeafletHelperService])
    ], MapHelperService);
    return MapHelperService;
}());
export { MapHelperService };
//flytt til enum.ts
export var DrawMode;
(function (DrawMode) {
    DrawMode[DrawMode["Off"] = 0] = "Off";
    DrawMode[DrawMode["AddPolygon"] = 1] = "AddPolygon";
    DrawMode[DrawMode["EditPolygon"] = 2] = "EditPolygon";
    DrawMode[DrawMode["SubtractPolygon"] = 3] = "SubtractPolygon";
    DrawMode[DrawMode["LoadPolygon"] = 4] = "LoadPolygon";
})(DrawMode || (DrawMode = {}));
//# sourceMappingURL=map-helper.service.js.map