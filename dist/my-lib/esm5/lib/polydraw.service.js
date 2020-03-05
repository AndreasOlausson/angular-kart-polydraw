import { __assign, __decorate, __metadata, __read, __spread } from "tslib";
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
        this.minimumFreeDrawZoomLevel = 12;
        // add to config
        this.arrayOfFeatureGroups = [];
        this.tracer = {};
        // end add to config
        this.ngUnsubscribe = new Subject();
        this.config = null;
        this.mapState.map$.pipe(filter(function (m) { return m !== null; })).subscribe(function (map) {
            _this.map = map;
            console.log("Kartet i polydraw: ", _this.map);
            console.log("pre this.config", _this.config);
            _this.config = defaultConfig;
            console.log("this.config", _this.config);
            _this.configurate({});
            console.log("after this.config", _this.config);
            _this.tracer = L.polyline([[0, 0]], _this.config.polyLineOptions);
            console.log("Tracer pipe: ", _this.tracer);
            _this.initPolyDraw();
        });
        this.mapState.mapZoomLevel$
            .pipe(debounceTime(100), takeUntil(this.ngUnsubscribe))
            .subscribe(function (zoom) {
            _this.onZoomChange(zoom);
        });
        this.polygonInformation.polygonInformation$.subscribe(function (k) {
            console.log("PolyInfo start: ", k);
        });
        // TODO - lage en config observable i mapState og oppdater this.config med den
    }
    // new
    PolyDrawService.prototype.configurate = function (config) {
        // TODO if config is path...
        this.config = __assign(__assign({}, defaultConfig), config);
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
        console.log("deletePolygon: ", polygon);
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(function (featureGroup) {
                var layer = featureGroup.getLayers()[0];
                var latlngs = layer.getLatLngs();
                var length = latlngs.length;
                //  = []
                latlngs.forEach(function (latlng, index) {
                    var polygon3;
                    var test = __spread(latlng);
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
    // fine
    PolyDrawService.prototype.removeAllFeatureGroups = function () {
        var _this = this;
        // console.log("removeAllFeatureGroups", null);
        this.arrayOfFeatureGroups.forEach(function (featureGroups) {
            _this.map.removeLayer(featureGroups);
        });
        this.arrayOfFeatureGroups = [];
        this.polygonInformation.deletePolygonInformationStorage();
        this.polygonInformation.reset();
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
        geographicBorders.forEach(function (group) {
            var featureGroup = new L.FeatureGroup();
            var polygon2 = _this.turfHelper.getMultiPolygon(_this.convertToCoords(group));
            console.log(polygon2);
            var polygon = _this.getPolygon(polygon2);
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
                // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
            });
            _this.arrayOfFeatureGroups.push(featureGroup);
            _this.polygonInformation.createPolygonInformationStorage(_this.arrayOfFeatureGroups);
            _this.polygonInformation.activate();
            _this.polygonInformation.setMoveMode();
        });
    };
    // innehåll i if'ar flytta till egna metoder
    PolyDrawService.prototype.convertToCoords = function (latlngs) {
        var coords = [];
        console.log(latlngs.length, latlngs);
        if (latlngs.length > 1 && latlngs.length < 3) {
            var coordinates_1 = [];
            console.log(L.GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), latlngs[latlngs.length - 1].length);
            // tslint:disable-next-line: max-line-length
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
    // fine
    PolyDrawService.prototype.initPolyDraw = function () {
        // console.log("initPolyDraw", null);
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
        console.log("Map init: ", this.map);
        console.log("Tracer init: ", this.tracer);
        this.map.addLayer(this.tracer);
        this.setDrawMode(DrawMode.Off);
    };
    // Test L.MouseEvent
    PolyDrawService.prototype.mouseDown = function (event) {
        console.log("mouseDown", event);
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
    PolyDrawService.prototype.onZoomChange = function (zoomLevel) {
        // console.log("onZoomChange", zoomLevel);
        if (zoomLevel >= this.minimumFreeDrawZoomLevel) {
            this.polygonInformation.polygonDrawStates.canUsePolyDraw = true;
        }
        else {
            this.polygonInformation.polygonDrawStates.canUsePolyDraw = false;
            this.polygonInformation.setMoveMode();
        }
        this.polygonInformation.saveCurrentState();
    };
    // fine
    PolyDrawService.prototype.drawStartedEvents = function (onoff) {
        // console.log("drawStartedEvents", onoff);
        var onoroff = onoff ? "on" : "off";
        this.map[onoroff]("mousemove", this.mouseMove, this);
        this.map[onoroff]("mouseup", this.mouseUpLeave, this);
    };
    // On hold
    PolyDrawService.prototype.subtractPolygon = function (latlngs) {
        this.subtract(latlngs);
    };
    // fine
    PolyDrawService.prototype.addPolygon = function (latlngs, simplify, noMerge) {
        if (noMerge === void 0) { noMerge = false; }
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
    };
    // fine
    PolyDrawService.prototype.addPolygonLayer = function (latlngs, simplify) {
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
            // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
        });
        this.arrayOfFeatureGroups.push(featureGroup);
        console.log("Array: ", this.arrayOfFeatureGroups);
        this.polygonInformation.activate();
        this.setDrawMode(DrawMode.Off);
        featureGroup.on("click", function (e) {
            _this.polygonClicked(e, latLngs);
        });
    };
    // fine
    PolyDrawService.prototype.polygonClicked = function (e, poly) {
        var newPoint = e.latlng;
        if (poly.geometry.type === "MultiPolygon") {
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
        console.log("getPolygons: ", latlngs);
        var polygon = L.GeoJSON.geometryToLayer(latlngs);
        polygon.setStyle(this.config.polygonOptions);
        return polygon;
    };
    // fine
    PolyDrawService.prototype.merge = function (latlngs) {
        var _this = this;
        console.log("merge", latlngs);
        var polygonFeature = [];
        var newArray = [];
        var polyIntersection = false;
        this.arrayOfFeatureGroups.forEach(function (featureGroup) {
            var featureCollection = featureGroup.toGeoJSON();
            console.log("Merger: ", featureCollection.features[0]);
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
        var onoroff = onoff ? "on" : "off";
        this.map[onoroff]("mousedown", this.mouseDown, this);
    };
    // fine, TODO: if special markers
    PolyDrawService.prototype.addMarker = function (latlngs, FeatureGroup) {
        var _this = this;
        var menuMarkerIdx = this.getMarkerIndex(latlngs, this.config.markers.markerMenuIcon.position);
        var deleteMarkerIdx = this.getMarkerIndex(latlngs, this.config.markers.markerDeleteIcon.position);
        latlngs.forEach(function (latlng, i) {
            var iconClasses = _this.config.markers.markerIcon.styleClasses;
            /*   if (i === menuMarkerIdx && this.config.markers.menu) {
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
                marker.on("click", function (e) {
                    _this.convertToBoundsPolygon(latlngs, true);
                    // this.convertToSimplifiedPolygon(latlngs);
                });
            }
            if (i === deleteMarkerIdx && _this.config.markers.delete) {
                marker.on("click", function (e) {
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
    PolyDrawService.prototype.createDivIcon = function (classNames) {
        var classes = classNames.join(" ");
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
        console.log("markerdrag: ", layerLength);
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
    PolyDrawService.prototype.markerDragEnd = function (FeatureGroup) {
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
                var testCoord = [];
                unkink.forEach(function (polygon) {
                    _this.addPolygon(_this.turfHelper.getTurfPolygon(polygon), false, true);
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
    };
    // fine, check the returned type
    PolyDrawService.prototype.getLatLngsFromJson = function (feature) {
        console.log("getLatLngsFromJson: ", feature);
        var coord;
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
    };
    // fine
    PolyDrawService.prototype.unionPolygons = function (layers, latlngs, polygonFeature) {
        var _this = this;
        console.log("unionPolygons", layers, latlngs, polygonFeature);
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
        console.log("removeFeatureGroup", featureGroup);
        featureGroup.clearLayers();
        this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(function (featureGroups) { return featureGroups !== featureGroup; });
        // this.updatePolygons();
        this.map.removeLayer(featureGroup);
    };
    // fine until refactoring
    PolyDrawService.prototype.removeFeatureGroupOnMerge = function (featureGroup) {
        console.log("removeFeatureGroupOnMerge", featureGroup);
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
        console.log("deletePolygonOnMerge", polygon);
        var polygon2 = [];
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(function (featureGroup) {
                var layer = featureGroup.getLayers()[0];
                var latlngs = layer.getLatLngs()[0];
                polygon2 = __spread(latlngs[0]);
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
    };
    PolyDrawService.prototype.modeChange = function (mode) {
        this.setDrawMode(mode);
        this.polygonInformation.saveCurrentState();
    };
    // remove, use modeChange
    PolyDrawService.prototype.drawModeClick = function () {
        if (this.polygonInformation.polygonDrawStates.isFreeDrawMode) {
            this.polygonInformation.setMoveMode();
            this.setDrawMode(DrawMode.Off);
        }
        else {
            this.polygonInformation.setFreeDrawMode();
            this.setDrawMode(DrawMode.Add);
        }
        this.polygonInformation.saveCurrentState();
    };
    // remove, use modeChange
    PolyDrawService.prototype.freedrawMenuClick = function () {
        this.setDrawMode(DrawMode.Add);
        this.polygonInformation.activate();
        this.polygonInformation.saveCurrentState();
    };
    // remove, use modeChange
    PolyDrawService.prototype.subtractClick = function () {
        this.setDrawMode(DrawMode.Subtract);
        this.polygonInformation.saveCurrentState();
    };
    // fine
    PolyDrawService.prototype.resetTracker = function () {
        this.tracer.setLatLngs([[0, 0]]);
    };
    PolyDrawService.prototype.toggleMarkerMenu = function () {
        alert("open menu");
    };
    PolyDrawService.prototype.getHtmlContent = function (callBack) {
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
    PolyDrawService.prototype.convertToBoundsPolygon = function (latlngs, addMidpointMarkers) {
        if (addMidpointMarkers === void 0) { addMidpointMarkers = false; }
        this.deletePolygon([latlngs]);
        var polygon = this.turfHelper.getMultiPolygon(this.convertToCoords([latlngs]));
        var newPolygon = this.turfHelper.convertToBoundingBoxPolygon(polygon, addMidpointMarkers);
        this.addPolygonLayer(this.turfHelper.getTurfPolygon(newPolygon), false);
    };
    PolyDrawService.prototype.convertToSimplifiedPolygon = function (latlngs) {
        this.deletePolygon([latlngs]);
        var newPolygon = this.turfHelper.getMultiPolygon(this.convertToCoords([latlngs]));
        this.addPolygonLayer(this.turfHelper.getTurfPolygon(newPolygon), true);
    };
    PolyDrawService.prototype.getMarkerIndex = function (latlngs, position) {
        var bounds = PolyDrawUtil.getBounds(latlngs, Math.sqrt(2) / 2);
        var compass = new Compass(bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast());
        var compassDirection = compass.getDirection(position);
        var latLngPoint = {
            lat: compassDirection.lat,
            lng: compassDirection.lng
        };
        var targetPoint = this.turfHelper.getCoord(latLngPoint);
        var fc = this.turfHelper.getFeaturePointCollection(latlngs);
        var nearestPointIdx = this.turfHelper.getNearestPointIndex(targetPoint, fc);
        return nearestPointIdx;
    };
    PolyDrawService.ctorParameters = function () { return [
        { type: PolyStateService },
        { type: ComponentGeneraterService },
        { type: TurfHelperService },
        { type: PolygonInformationService },
        { type: LeafletHelperService }
    ]; };
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
    return PolyDrawService;
}());
export { PolyDrawService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9wb2x5ZHJhdy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdCLHNDQUFzQztBQUN0QyxPQUFPLEVBQWMsZUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNoRCxPQUFPLEVBQWtCLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNuRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQzs7Ozs7OztBQU1oRTtJQW9CRSx5QkFDVSxRQUEwQixFQUMxQixjQUF5QyxFQUN6QyxVQUE2QixFQUM3QixrQkFBNkMsRUFDN0MsYUFBbUM7UUFMN0MsaUJBK0JDO1FBOUJTLGFBQVEsR0FBUixRQUFRLENBQWtCO1FBQzFCLG1CQUFjLEdBQWQsY0FBYyxDQUEyQjtRQUN6QyxlQUFVLEdBQVYsVUFBVSxDQUFtQjtRQUM3Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTJCO1FBQzdDLGtC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QixnQkFBZ0I7Z0JBQ1YseUJBQXlCO2dCQUM3QixpQkFBaUI7Z0JBQ1QseUJBQXlCO2dCQUM5QixvQkFBb0I7OztJQXpCbEMsZUFBZTtRQUozQixVQUFVLENBQUM7WUFDVixVQUFVLEVBQUUsTUFBTTtTQUNuQixDQUFDO1FBQ0YsMkJBQTJCOzt5Q0FzQkwsZ0JBQWdCO1lBQ1YseUJBQXlCO1lBQzdCLGlCQUFpQjtZQUNULHlCQUF5QjtZQUM5QixvQkFBb0I7T0F6QmxDLGVBQWUsQ0FvZ0MzQjswQkF4aENEO0NBd2hDQyxBQXBnQ0QsSUFvZ0NDO1NBcGdDWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgT3B0aW9uYWwgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCI7XHJcbi8vIGltcG9ydCAqIGFzIHR1cmYgZnJvbSBcIkB0dXJmL3R1cmZcIjtcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgQmVoYXZpb3JTdWJqZWN0LCBTdWJqZWN0IH0gZnJvbSBcInJ4anNcIjtcclxuaW1wb3J0IHsgZmlsdGVyLCBkZWJvdW5jZVRpbWUsIHRha2VVbnRpbCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xyXG5pbXBvcnQgeyBGZWF0dXJlLCBQb2x5Z29uLCBNdWx0aVBvbHlnb24gfSBmcm9tIFwiQHR1cmYvdHVyZlwiO1xyXG5pbXBvcnQgeyBQb2x5U3RhdGVTZXJ2aWNlIH0gZnJvbSBcIi4vbWFwLXN0YXRlLnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgVHVyZkhlbHBlclNlcnZpY2UgfSBmcm9tIFwiLi90dXJmLWhlbHBlci5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IFBvbHlnb25JbmZvcm1hdGlvblNlcnZpY2UgfSBmcm9tIFwiLi9wb2x5Z29uLWluZm9ybWF0aW9uLnNlcnZpY2VcIjtcclxuaW1wb3J0IGRlZmF1bHRDb25maWcgZnJvbSBcIi4vcG9seWluZm8uanNvblwiO1xyXG5pbXBvcnQgeyBJTGF0TG5nLCBQb2x5Z29uRHJhd1N0YXRlcyB9IGZyb20gXCIuL3BvbHlnb24taGVscGVyc1wiO1xyXG5pbXBvcnQgeyBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlIH0gZnJvbSBcIi4vY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IENvbXBhc3MsIFBvbHlEcmF3VXRpbCB9IGZyb20gXCIuL3V0aWxzXCI7XHJcbmltcG9ydCB7IE1hcmtlclBvc2l0aW9uLCBEcmF3TW9kZSB9IGZyb20gXCIuL2VudW1zXCI7XHJcbmltcG9ydCB7IExlYWZsZXRIZWxwZXJTZXJ2aWNlIH0gZnJvbSBcIi4vbGVhZmxldC1oZWxwZXIuc2VydmljZVwiO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46IFwicm9vdFwiXHJcbn0pXHJcbi8vIFJlbmFtZSAtIFBvbHlEcmF3U2VydmljZVxyXG5leHBvcnQgY2xhc3MgUG9seURyYXdTZXJ2aWNlIHtcclxuICAvLyBEcmF3TW9kZXMsIGRldGVybWluZSBVSSBidXR0b25zIGV0Yy4uLlxyXG4gIGRyYXdNb2RlU3ViamVjdDogQmVoYXZpb3JTdWJqZWN0PERyYXdNb2RlPiA9IG5ldyBCZWhhdmlvclN1YmplY3Q8RHJhd01vZGU+KFxyXG4gICAgRHJhd01vZGUuT2ZmXHJcbiAgKTtcclxuICBkcmF3TW9kZSQ6IE9ic2VydmFibGU8RHJhd01vZGU+ID0gdGhpcy5kcmF3TW9kZVN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWluaW11bUZyZWVEcmF3Wm9vbUxldmVsOiBudW1iZXIgPSAxMjtcclxuICBwcml2YXRlIG1hcDogTC5NYXA7XHJcblxyXG4gIHByaXZhdGUgbWVyZ2VQb2x5Z29uczogYm9vbGVhbjtcclxuICBwcml2YXRlIGtpbmtzOiBib29sZWFuO1xyXG4gIC8vIGFkZCB0byBjb25maWdcclxuICBwcml2YXRlIGFycmF5T2ZGZWF0dXJlR3JvdXBzOiBMLkZlYXR1cmVHcm91cDxMLkxheWVyPltdID0gW107XHJcbiAgcHJpdmF0ZSB0cmFjZXI6IEwuUG9seWxpbmUgPSB7fSBhcyBhbnk7XHJcbiAgLy8gZW5kIGFkZCB0byBjb25maWdcclxuXHJcbiAgcHJpdmF0ZSBuZ1Vuc3Vic2NyaWJlID0gbmV3IFN1YmplY3QoKTtcclxuICBwcml2YXRlIGNvbmZpZzogdHlwZW9mIGRlZmF1bHRDb25maWcgPSBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgbWFwU3RhdGU6IFBvbHlTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBvcHVwR2VuZXJhdG9yOiBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB0dXJmSGVscGVyOiBUdXJmSGVscGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgcG9seWdvbkluZm9ybWF0aW9uOiBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsZWFmbGV0SGVscGVyOiBMZWFmbGV0SGVscGVyU2VydmljZVxyXG4gICkge1xyXG4gICAgdGhpcy5tYXBTdGF0ZS5tYXAkLnBpcGUoZmlsdGVyKG0gPT4gbSAhPT0gbnVsbCkpLnN1YnNjcmliZSgobWFwOiBMLk1hcCkgPT4ge1xyXG4gICAgICB0aGlzLm1hcCA9IG1hcDtcclxuICAgICAgY29uc29sZS5sb2coXCJLYXJ0ZXQgaSBwb2x5ZHJhdzogXCIsIHRoaXMubWFwKTtcclxuICAgICAgY29uc29sZS5sb2coXCJwcmUgdGhpcy5jb25maWdcIiwgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLmNvbmZpZyA9IGRlZmF1bHRDb25maWc7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwidGhpcy5jb25maWdcIiwgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLmNvbmZpZ3VyYXRlKHt9KTtcclxuICAgICAgY29uc29sZS5sb2coXCJhZnRlciB0aGlzLmNvbmZpZ1wiLCB0aGlzLmNvbmZpZyk7XHJcbiAgICAgIHRoaXMudHJhY2VyID0gTC5wb2x5bGluZShbWzAsIDBdXSwgdGhpcy5jb25maWcucG9seUxpbmVPcHRpb25zKTtcclxuICAgICAgY29uc29sZS5sb2coXCJUcmFjZXIgcGlwZTogXCIsIHRoaXMudHJhY2VyKTtcclxuICAgICAgdGhpcy5pbml0UG9seURyYXcoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMubWFwU3RhdGUubWFwWm9vbUxldmVsJFxyXG4gICAgICAucGlwZShkZWJvdW5jZVRpbWUoMTAwKSwgdGFrZVVudGlsKHRoaXMubmdVbnN1YnNjcmliZSkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKHpvb206IG51bWJlcikgPT4ge1xyXG4gICAgICAgIHRoaXMub25ab29tQ2hhbmdlKHpvb20pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb24kLnN1YnNjcmliZShrID0+IHtcclxuICAgICAgY29uc29sZS5sb2coXCJQb2x5SW5mbyBzdGFydDogXCIsIGspO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVE9ETyAtIGxhZ2UgZW4gY29uZmlnIG9ic2VydmFibGUgaSBtYXBTdGF0ZSBvZyBvcHBkYXRlciB0aGlzLmNvbmZpZyBtZWQgZGVuXHJcbiAgfVxyXG4gIC8vIG5ld1xyXG4gIGNvbmZpZ3VyYXRlKGNvbmZpZzogT2JqZWN0KTogdm9pZCB7XHJcbiAgICAvLyBUT0RPIGlmIGNvbmZpZyBpcyBwYXRoLi4uXHJcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4uZGVmYXVsdENvbmZpZywgLi4uY29uZmlnIH07XHJcblxyXG4gICAgdGhpcy5tZXJnZVBvbHlnb25zID0gdGhpcy5jb25maWcubWVyZ2VQb2x5Z29ucztcclxuICAgIHRoaXMua2lua3MgPSB0aGlzLmNvbmZpZy5raW5rcztcclxuICB9XHJcblxyXG4gIC8vIGZpbmVcclxuICBjbG9zZUFuZFJlc2V0KCk6IHZvaWQge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJjbG9zZUFuZFJlc2V0XCIpO1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xyXG4gICAgdGhpcy5yZW1vdmVBbGxGZWF0dXJlR3JvdXBzKCk7XHJcbiAgfVxyXG5cclxuICAvLyBtYWtlIHJlYWRhYmxlXHJcbiAgZGVsZXRlUG9seWdvbihwb2x5Z29uOiBJTGF0TG5nW11bXSkge1xyXG4gICAgY29uc29sZS5sb2coXCJkZWxldGVQb2x5Z29uOiBcIiwgcG9seWdvbik7XHJcbiAgICBpZiAodGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueTtcclxuICAgICAgICBjb25zdCBsYXRsbmdzID0gbGF5ZXIuZ2V0TGF0TG5ncygpO1xyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGxhdGxuZ3MubGVuZ3RoO1xyXG4gICAgICAgIC8vICA9IFtdXHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICBsZXQgcG9seWdvbjM7XHJcbiAgICAgICAgICBjb25zdCB0ZXN0ID0gWy4uLmxhdGxuZ107XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2cobGF0bG5nKTtcclxuICAgICAgICAgIGlmIChsYXRsbmcubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAvKiBpZiAobGF0bG5nWzBdWzBdICE9PSBsYXRsbmdbMF1bbGF0bG5nWzBdLmxlbmd0aCAtIDFdKSB7XHJcbiAgICAgICAgICAgICAgdGVzdFswXS5wdXNoKGxhdGxuZ1swXVswXSk7XHJcbiAgICAgICAgICAgICAgfSAgKi9cclxuXHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gW3Rlc3RbMF1dO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXSAhPT0gbGF0bG5nW2xhdGxuZy5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICAgIHRlc3QucHVzaChsYXRsbmdbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBvbHlnb24zID0gdGVzdDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlRlc3Q6IFwiLCBwb2x5Z29uMyk7XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2cocG9seWdvbik7XHJcblxyXG4gICAgICAgICAgY29uc3QgZXF1YWxzID0gdGhpcy5wb2x5Z29uQXJyYXlFcXVhbHMocG9seWdvbjMsIHBvbHlnb24pO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJlcXVhbHM6IFwiLCBlcXVhbHMsIFwiIGxlbmd0aDogXCIsIGxlbmd0aCk7XHJcbiAgICAgICAgICBpZiAoZXF1YWxzICYmIGxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVxdWFscyAmJiBsZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVRyYXNoQ2FuT25NdWx0aShbcG9seWdvbl0pO1xyXG4gICAgICAgICAgICBsYXRsbmdzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIGxheWVyLnNldExhdExuZ3MobGF0bG5ncyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxheWVyLnRvR2VvSlNPTigpLCBmYWxzZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcmVtb3ZlQWxsRmVhdHVyZUdyb3VwcygpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwicmVtb3ZlQWxsRmVhdHVyZUdyb3Vwc1wiLCBudWxsKTtcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXBzID0+IHtcclxuICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3Vwcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gW107XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5yZXNldCgpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24udXBkYXRlUG9seWdvbnMoKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIGdldERyYXdNb2RlKCk6IERyYXdNb2RlIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZ2V0RHJhd01vZGVcIiwgbnVsbCk7XHJcbiAgICByZXR1cm4gdGhpcy5kcmF3TW9kZVN1YmplY3QudmFsdWU7XHJcbiAgfVxyXG5cclxuICBhZGRWaWtlbihwb2x5Z29uKSB7XHJcbiAgICB0aGlzLmFkZFBvbHlnb25MYXllcihwb2x5Z29uLCB0cnVlKTtcclxuICB9XHJcblxyXG4gIC8vIGNoZWNrIHRoaXNcclxuICBhZGRBdXRvUG9seWdvbihnZW9ncmFwaGljQm9yZGVyczogTC5MYXRMbmdbXVtdW10pOiB2b2lkIHtcclxuICAgIGdlb2dyYXBoaWNCb3JkZXJzLmZvckVhY2goZ3JvdXAgPT4ge1xyXG4gICAgY29uc3QgZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCA9IG5ldyBMLkZlYXR1cmVHcm91cCgpO1xyXG5cclxuICAgIGNvbnN0IHBvbHlnb24yID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihcclxuICAgICAgdGhpcy5jb252ZXJ0VG9Db29yZHMoZ3JvdXApXHJcbiAgICApO1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbjIpO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IHRoaXMuZ2V0UG9seWdvbihwb2x5Z29uMik7XHJcblxyXG4gICAgZmVhdHVyZUdyb3VwLmFkZExheWVyKHBvbHlnb24pO1xyXG4gICAgY29uc3QgbWFya2VyTGF0bG5ncyA9IHBvbHlnb24uZ2V0TGF0TG5ncygpO1xyXG4gICAgY29uc29sZS5sb2coXCJtYXJrZXJzOiBcIiwgbWFya2VyTGF0bG5ncyk7XHJcbiAgICBtYXJrZXJMYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgIHBvbHlnb24uZm9yRWFjaCgocG9seUVsZW1lbnQsIGkpID0+IHtcclxuICAgICAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgdGhpcy5hZGRNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuYWRkSG9sZU1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiSHVsbDogXCIsIHBvbHlFbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyB0aGlzLmFkZE1hcmtlcihwb2x5Z29uWzBdLCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAvLyBUT0RPIC0gSHZpcyBwb2x5Z29uLmxlbmd0aCA+MSwgc8OlIGhhciBkZW4gaHVsbDogZWdlbiBhZGRNYXJrZXIgZnVua3Nqb25cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwc1xyXG4gICAgKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRNb3ZlTW9kZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyBpbm5laMOlbGwgaSBpZidhciBmbHl0dGEgdGlsbCBlZ25hIG1ldG9kZXJcclxuICBwcml2YXRlIGNvbnZlcnRUb0Nvb3JkcyhsYXRsbmdzOiBJTGF0TG5nW11bXSkge1xyXG4gICAgY29uc3QgY29vcmRzID0gW107XHJcbiAgICBjb25zb2xlLmxvZyhsYXRsbmdzLmxlbmd0aCwgbGF0bG5ncyk7XHJcbiAgICBpZiAobGF0bG5ncy5sZW5ndGggPiAxICYmIGxhdGxuZ3MubGVuZ3RoIDwgMykge1xyXG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IFtdO1xyXG4gICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSksXHJcbiAgICAgICAgbGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdLmxlbmd0aFxyXG4gICAgICApO1xyXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG1heC1saW5lLWxlbmd0aFxyXG4gICAgICBjb25zdCB3aXRoaW4gPSB0aGlzLnR1cmZIZWxwZXIuaXNXaXRoaW4oXHJcbiAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzW2xhdGxuZ3MubGVuZ3RoIC0gMV0pLFxyXG4gICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSlcclxuICAgICAgKTtcclxuICAgICAgaWYgKHdpdGhpbikge1xyXG4gICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgIGNvb3JkaW5hdGVzLnB1c2goTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbildKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID49IDEpIHtcclxuICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc29sZS5sb2coXCJXaXRoaW4xIFwiLCB3aXRoaW4pO1xyXG4gICAgfSBlbHNlIGlmIChsYXRsbmdzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBbXTtcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAxOyBpbmRleCA8IGxhdGxuZ3MubGVuZ3RoIC0gMTsgaW5kZXgrKykge1xyXG4gICAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihcclxuICAgICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tpbmRleF0pLFxyXG4gICAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKHdpdGhpbikge1xyXG4gICAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICBjb29yZGluYXRlcy5wdXNoKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbikpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbildKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29vcmRzLnB1c2goW0wuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSldKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKGNvb3Jkcyk7XHJcbiAgICByZXR1cm4gY29vcmRzO1xyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgaW5pdFBvbHlEcmF3KCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJpbml0UG9seURyYXdcIiwgbnVsbCk7XHJcblxyXG4gICAgY29uc3QgY29udGFpbmVyOiBIVE1MRWxlbWVudCA9IHRoaXMubWFwLmdldENvbnRhaW5lcigpO1xyXG4gICAgY29uc3QgZHJhd01vZGUgPSB0aGlzLmdldERyYXdNb2RlKCk7XHJcbiAgICBpZiAodGhpcy5jb25maWcudG91Y2hTdXBwb3J0KSB7XHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCBlID0+IHtcclxuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xyXG4gICAgICAgICAgdGhpcy5tb3VzZURvd24oZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgZSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcclxuICAgICAgICAgIHRoaXMubW91c2VVcExlYXZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIGUgPT4ge1xyXG4gICAgICAgIGlmIChkcmF3TW9kZSAhPT0gRHJhd01vZGUuT2ZmKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdXNlTW92ZShlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJNYXAgaW5pdDogXCIsIHRoaXMubWFwKTtcclxuICAgIGNvbnNvbGUubG9nKFwiVHJhY2VyIGluaXQ6IFwiLCB0aGlzLnRyYWNlcik7XHJcbiAgICB0aGlzLm1hcC5hZGRMYXllcih0aGlzLnRyYWNlcik7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XHJcbiAgfVxyXG4gIC8vIFRlc3QgTC5Nb3VzZUV2ZW50XHJcbiAgcHJpdmF0ZSBtb3VzZURvd24oZXZlbnQpIHtcclxuICAgIGNvbnNvbGUubG9nKFwibW91c2VEb3duXCIsIGV2ZW50KTtcclxuXHJcbiAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW2V2ZW50LmxhdGxuZ10pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgbGF0bG5nID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhbXHJcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLFxyXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WVxyXG4gICAgICBdKTtcclxuICAgICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbbGF0bG5nXSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXJ0RHJhdygpO1xyXG4gIH1cclxuXHJcbiAgLy8gVE9ETyBldmVudCB0eXBlLCBjcmVhdGUgY29udGFpbmVyUG9pbnRUb0xhdExuZy1tZXRob2RcclxuICBwcml2YXRlIG1vdXNlTW92ZShldmVudCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJtb3VzZU1vdmVcIiwgZXZlbnQpO1xyXG5cclxuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9IG51bGwpIHtcclxuICAgICAgdGhpcy50cmFjZXIuYWRkTGF0TG5nKGV2ZW50LmxhdGxuZyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBsYXRsbmcgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKFtcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgIF0pO1xyXG4gICAgICB0aGlzLnRyYWNlci5hZGRMYXRMbmcobGF0bG5nKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIG1vdXNlVXBMZWF2ZSgpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwibW91c2VVcExlYXZlXCIsIG51bGwpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1EZWxldGUgdHJhc2hjYW5zXCIsIG51bGwpO1xyXG4gICAgY29uc3QgZ2VvUG9zOiBGZWF0dXJlPFxyXG4gICAgICBQb2x5Z29uIHwgTXVsdGlQb2x5Z29uXHJcbiAgICA+ID0gdGhpcy50dXJmSGVscGVyLnR1cmZDb25jYXZlbWFuKHRoaXMudHJhY2VyLnRvR2VvSlNPTigpIGFzIGFueSk7XHJcbiAgICB0aGlzLnN0b3BEcmF3KCk7XHJcbiAgICBzd2l0Y2ggKHRoaXMuZ2V0RHJhd01vZGUoKSkge1xyXG4gICAgICBjYXNlIERyYXdNb2RlLkFkZDpcclxuICAgICAgICB0aGlzLmFkZFBvbHlnb24oZ2VvUG9zLCB0cnVlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdDpcclxuICAgICAgICB0aGlzLnN1YnRyYWN0UG9seWdvbihnZW9Qb3MpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHNcclxuICAgICk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWNyZWF0ZSB0cmFzaGNhbnNcIiwgbnVsbCk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHN0YXJ0RHJhdygpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwic3RhcnREcmF3XCIsIG51bGwpO1xyXG5cclxuICAgIHRoaXMuZHJhd1N0YXJ0ZWRFdmVudHModHJ1ZSk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHN0b3BEcmF3KCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJzdG9wRHJhd1wiLCBudWxsKTtcclxuXHJcbiAgICB0aGlzLnJlc2V0VHJhY2tlcigpO1xyXG4gICAgdGhpcy5kcmF3U3RhcnRlZEV2ZW50cyhmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uWm9vbUNoYW5nZSh6b29tTGV2ZWw6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJvblpvb21DaGFuZ2VcIiwgem9vbUxldmVsKTtcclxuXHJcbiAgICBpZiAoem9vbUxldmVsID49IHRoaXMubWluaW11bUZyZWVEcmF3Wm9vbUxldmVsKSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25EcmF3U3RhdGVzLmNhblVzZVBvbHlEcmF3ID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25EcmF3U3RhdGVzLmNhblVzZVBvbHlEcmF3ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGRyYXdTdGFydGVkRXZlbnRzKG9ub2ZmOiBib29sZWFuKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImRyYXdTdGFydGVkRXZlbnRzXCIsIG9ub2ZmKTtcclxuXHJcbiAgICBjb25zdCBvbm9yb2ZmID0gb25vZmYgPyBcIm9uXCIgOiBcIm9mZlwiO1xyXG5cclxuICAgIHRoaXMubWFwW29ub3JvZmZdKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2VNb3ZlLCB0aGlzKTtcclxuICAgIHRoaXMubWFwW29ub3JvZmZdKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlVXBMZWF2ZSwgdGhpcyk7XHJcbiAgfVxyXG4gIC8vIE9uIGhvbGRcclxuICBwcml2YXRlIHN1YnRyYWN0UG9seWdvbihsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICB0aGlzLnN1YnRyYWN0KGxhdGxuZ3MpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBhZGRQb2x5Z29uKFxyXG4gICAgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIHNpbXBsaWZ5OiBib29sZWFuLFxyXG4gICAgbm9NZXJnZTogYm9vbGVhbiA9IGZhbHNlXHJcbiAgKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcclxuICAgICAgXCJhZGRQb2x5Z29uXCIsXHJcbiAgICAgIGxhdGxuZ3MsXHJcbiAgICAgIHNpbXBsaWZ5LFxyXG4gICAgICBub01lcmdlLFxyXG4gICAgICB0aGlzLmtpbmtzLFxyXG4gICAgICB0aGlzLmNvbmZpZ1xyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoXHJcbiAgICAgIHRoaXMubWVyZ2VQb2x5Z29ucyAmJlxyXG4gICAgICAhbm9NZXJnZSAmJlxyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDAgJiZcclxuICAgICAgIXRoaXMua2lua3NcclxuICAgICkge1xyXG4gICAgICB0aGlzLm1lcmdlKGxhdGxuZ3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobGF0bG5ncywgc2ltcGxpZnkpO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBhZGRQb2x5Z29uTGF5ZXIoXHJcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgc2ltcGxpZnk6IGJvb2xlYW5cclxuICApIHtcclxuICAgIGNvbnN0IGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXAgPSBuZXcgTC5GZWF0dXJlR3JvdXAoKTtcclxuXHJcbiAgICBjb25zdCBsYXRMbmdzID0gc2ltcGxpZnkgPyB0aGlzLnR1cmZIZWxwZXIuZ2V0U2ltcGxpZmllZChsYXRsbmdzKSA6IGxhdGxuZ3M7XHJcbiAgICBjb25zb2xlLmxvZyhcIkFkZFBvbHlnb25MYXllcjogXCIsIGxhdExuZ3MpO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IHRoaXMuZ2V0UG9seWdvbihsYXRMbmdzKTtcclxuICAgIGZlYXR1cmVHcm91cC5hZGRMYXllcihwb2x5Z29uKTtcclxuICAgIGNvbnNvbGUubG9nKHBvbHlnb24pO1xyXG4gICAgY29uc3QgbWFya2VyTGF0bG5ncyA9IHBvbHlnb24uZ2V0TGF0TG5ncygpO1xyXG4gICAgbWFya2VyTGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICBwb2x5Z29uLmZvckVhY2goKHBvbHlFbGVtZW50OiBJTGF0TG5nW10sIGk6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLmFkZE1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hZGRIb2xlTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJIdWxsOiBcIiwgcG9seUVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIC8vIHRoaXMuYWRkTWFya2VyKHBvbHlnb25bMF0sIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgIC8vIFRPRE8gLSBIdmlzIHBvbHlnb24ubGVuZ3RoID4xLCBzw6UgaGFyIGRlbiBodWxsOiBlZ2VuIGFkZE1hcmtlciBmdW5rc2pvblxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5wdXNoKGZlYXR1cmVHcm91cCk7XHJcbiAgICBjb25zb2xlLmxvZyhcIkFycmF5OiBcIiwgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcyk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5hY3RpdmF0ZSgpO1xyXG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xyXG5cclxuICAgIGZlYXR1cmVHcm91cC5vbihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICB0aGlzLnBvbHlnb25DbGlja2VkKGUsIGxhdExuZ3MpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHBvbHlnb25DbGlja2VkKGU6IGFueSwgcG9seTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc3QgbmV3UG9pbnQgPSBlLmxhdGxuZztcclxuICAgIGlmIChwb2x5Lmdlb21ldHJ5LnR5cGUgPT09IFwiTXVsdGlQb2x5Z29uXCIpIHtcclxuICAgICAgY29uc3QgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5pbmplY3RQb2ludFRvUG9seWdvbihwb2x5LCBbXHJcbiAgICAgICAgbmV3UG9pbnQubG5nLFxyXG4gICAgICAgIG5ld1BvaW50LmxhdFxyXG4gICAgICBdKTtcclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKHBvbHkpKTtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobmV3UG9seWdvbiwgZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBnZXRQb2x5Z29uKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZ2V0UG9seWdvbnM6IFwiLCBsYXRsbmdzKTtcclxuICAgIGNvbnN0IHBvbHlnb24gPSBMLkdlb0pTT04uZ2VvbWV0cnlUb0xheWVyKGxhdGxuZ3MpIGFzIGFueTtcclxuXHJcbiAgICBwb2x5Z29uLnNldFN0eWxlKHRoaXMuY29uZmlnLnBvbHlnb25PcHRpb25zKTtcclxuICAgIHJldHVybiBwb2x5Z29uO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBtZXJnZShsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1lcmdlXCIsIGxhdGxuZ3MpO1xyXG4gICAgY29uc3QgcG9seWdvbkZlYXR1cmUgPSBbXTtcclxuICAgIGNvbnN0IG5ld0FycmF5OiBMLkZlYXR1cmVHcm91cFtdID0gW107XHJcbiAgICBsZXQgcG9seUludGVyc2VjdGlvbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuICAgICAgY29uc29sZS5sb2coXCJNZXJnZXI6IFwiLCBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXSk7XHJcbiAgICAgIGlmIChmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFtlbGVtZW50XSk7XHJcbiAgICAgICAgICBwb2x5SW50ZXJzZWN0aW9uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25JbnRlcnNlY3QoZmVhdHVyZSwgbGF0bG5ncyk7XHJcbiAgICAgICAgICBpZiAocG9seUludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgICBuZXdBcnJheS5wdXNoKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICAgIHBvbHlnb25GZWF0dXJlLnB1c2goZmVhdHVyZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihcclxuICAgICAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdXHJcbiAgICAgICAgKTtcclxuICAgICAgICBwb2x5SW50ZXJzZWN0aW9uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25JbnRlcnNlY3QoZmVhdHVyZSwgbGF0bG5ncyk7XHJcbiAgICAgICAgaWYgKHBvbHlJbnRlcnNlY3Rpb24pIHtcclxuICAgICAgICAgIG5ld0FycmF5LnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIHBvbHlnb25GZWF0dXJlLnB1c2goZmVhdHVyZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGNvbnNvbGUubG9nKG5ld0FycmF5KTtcclxuICAgIGlmIChuZXdBcnJheS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMudW5pb25Qb2x5Z29ucyhuZXdBcnJheSwgbGF0bG5ncywgcG9seWdvbkZlYXR1cmUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobGF0bG5ncywgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIG5leHRcclxuICBwcml2YXRlIHN1YnRyYWN0KGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGxldCBhZGRIb2xlID0gbGF0bG5ncztcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICBjb25zdCBmZWF0dXJlQ29sbGVjdGlvbiA9IGZlYXR1cmVHcm91cC50b0dlb0pTT04oKSBhcyBhbnk7XHJcbiAgICAgIGNvbnN0IGxheWVyID0gZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF07XHJcbiAgICAgIGNvbnN0IHBvbHkgPSB0aGlzLmdldExhdExuZ3NGcm9tSnNvbihsYXllcik7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24oXHJcbiAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF1cclxuICAgICAgKTtcclxuICAgICAgY29uc3QgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5wb2x5Z29uRGlmZmVyZW5jZShmZWF0dXJlLCBhZGRIb2xlKTtcclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKHBvbHkpO1xyXG4gICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cE9uTWVyZ2UoZmVhdHVyZUdyb3VwKTtcclxuICAgICAgYWRkSG9sZSA9IG5ld1BvbHlnb247XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBuZXdMYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+ID0gYWRkSG9sZTtcclxuICAgIGNvbnN0IGNvb3JkcyA9IHRoaXMudHVyZkhlbHBlci5nZXRDb29yZHMobmV3TGF0bG5ncyk7XHJcbiAgICBjb29yZHMuZm9yRWFjaCh2YWx1ZSA9PiB7XHJcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW3ZhbHVlXSksIHRydWUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGV2ZW50cyhvbm9mZjogYm9vbGVhbikge1xyXG4gICAgY29uc3Qgb25vcm9mZiA9IG9ub2ZmID8gXCJvblwiIDogXCJvZmZcIjtcclxuICAgIHRoaXMubWFwW29ub3JvZmZdKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VEb3duLCB0aGlzKTtcclxuICB9XHJcbiAgLy8gZmluZSwgVE9ETzogaWYgc3BlY2lhbCBtYXJrZXJzXHJcbiAgcHJpdmF0ZSBhZGRNYXJrZXIobGF0bG5nczogSUxhdExuZ1tdLCBGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICBjb25zdCBtZW51TWFya2VySWR4ID0gdGhpcy5nZXRNYXJrZXJJbmRleChcclxuICAgICAgbGF0bG5ncyxcclxuICAgICAgdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5wb3NpdGlvblxyXG4gICAgKTtcclxuICAgIGNvbnN0IGRlbGV0ZU1hcmtlcklkeCA9IHRoaXMuZ2V0TWFya2VySW5kZXgoXHJcbiAgICAgIGxhdGxuZ3MsXHJcbiAgICAgIHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5wb3NpdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgaSkgPT4ge1xyXG4gICAgICBsZXQgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICAvKiAgIGlmIChpID09PSBtZW51TWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGkgPT09IGRlbGV0ZU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfSAqL1xyXG4gICAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5NYXJrZXIobGF0bG5nLCB7XHJcbiAgICAgICAgaWNvbjogdGhpcy5jcmVhdGVEaXZJY29uKGljb25DbGFzc2VzKSxcclxuICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgdGl0bGU6IGkudG9TdHJpbmcoKVxyXG4gICAgICB9KTtcclxuICAgICAgRmVhdHVyZUdyb3VwLmFkZExheWVyKG1hcmtlcikuYWRkVG8odGhpcy5tYXApO1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkZlYXR1cmVHcm91cDogXCIsIEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIG1hcmtlci5vbihcImRyYWdcIiwgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBtYXJrZXIub24oXCJkcmFnZW5kXCIsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgaWYgKGkgPT09IG1lbnVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XHJcbiAgICAgICAgLy8gbWFya2VyLmJpbmRQb3B1cChcclxuICAgICAgICAvLyAgIHRoaXMuZ2V0SHRtbENvbnRlbnQoZSA9PiB7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBvblwiLCBlLnRhcmdldCk7XHJcbiAgICAgICAgLy8gICB9KVxyXG4gICAgICAgIC8vICk7XHJcbiAgICAgICAgbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNvbnZlcnRUb0JvdW5kc1BvbHlnb24obGF0bG5ncywgdHJ1ZSk7XHJcbiAgICAgICAgICAvLyB0aGlzLmNvbnZlcnRUb1NpbXBsaWZpZWRQb2x5Z29uKGxhdGxuZ3MpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09PSBkZWxldGVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkSG9sZU1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XHJcbiAgICAgIGNvbnN0IGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgLyogIGlmIChpID09PSAwICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vVE9ETy0gbGVnZyB0aWwgZmlsbCBpY29uXHJcbiAgICAgIGlmIChpID09PSBsYXRsbmdzLmxlbmd0aCAtIDEgJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIH0gKi9cclxuICAgICAgY29uc3QgbWFya2VyID0gbmV3IEwuTWFya2VyKGxhdGxuZywge1xyXG4gICAgICAgIGljb246IHRoaXMuY3JlYXRlRGl2SWNvbihpY29uQ2xhc3NlcyksXHJcbiAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgIHRpdGxlOiBpLnRvU3RyaW5nKClcclxuICAgICAgfSk7XHJcbiAgICAgIEZlYXR1cmVHcm91cC5hZGRMYXllcihtYXJrZXIpLmFkZFRvKHRoaXMubWFwKTtcclxuXHJcbiAgICAgIG1hcmtlci5vbihcImRyYWdcIiwgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBtYXJrZXIub24oXCJkcmFnZW5kXCIsIGUgPT4ge1xyXG4gICAgICAgIHRoaXMubWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXApO1xyXG4gICAgICB9KTtcclxuICAgICAgLyogICBpZiAoaSA9PT0gMCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuICAgICAgICBtYXJrZXIuYmluZFBvcHVwKHRoaXMuZ2V0SHRtbENvbnRlbnQoKGUpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBvblwiLCBlLnRhcmdldCk7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIC8vIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgIC8vICAgdGhpcy50b2dnbGVNYXJrZXJNZW51KCk7XHJcbiAgICAgICAgLy8gfSlcclxuICAgICAgfVxyXG4gICAgICBpZiAoaSA9PT0gbGF0bG5ncy5sZW5ndGggLSAxICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XHJcbiAgICAgICAgbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSAqL1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgY3JlYXRlRGl2SWNvbihjbGFzc05hbWVzOiBzdHJpbmdbXSk6IEwuRGl2SWNvbiB7XHJcbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcy5qb2luKFwiIFwiKTtcclxuICAgIGNvbnN0IGljb24gPSBMLmRpdkljb24oeyBjbGFzc05hbWU6IGNsYXNzZXMgfSk7XHJcbiAgICByZXR1cm4gaWNvbjtcclxuICB9XHJcbiAgLy8gVE9ETzogQ2xlYW51cFxyXG4gIHByaXZhdGUgbWFya2VyRHJhZyhGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICBjb25zdCBuZXdQb3MgPSBbXTtcclxuICAgIGxldCB0ZXN0YXJyYXkgPSBbXTtcclxuICAgIGxldCBob2xlID0gW107XHJcbiAgICBjb25zdCBsYXllckxlbmd0aCA9IEZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSBhcyBhbnk7XHJcbiAgICBjb25zdCBwb3NhcnJheXMgPSBsYXllckxlbmd0aFswXS5nZXRMYXRMbmdzKCk7XHJcbiAgICBjb25zb2xlLmxvZyhwb3NhcnJheXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJtYXJrZXJkcmFnOiBcIiwgbGF5ZXJMZW5ndGgpO1xyXG4gICAgbGV0IGxlbmd0aCA9IDA7XHJcbiAgICBpZiAocG9zYXJyYXlzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBvc2FycmF5cy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICB0ZXN0YXJyYXkgPSBbXTtcclxuICAgICAgICBob2xlID0gW107XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJQb3Npc2pvbmVyOiBcIiwgcG9zYXJyYXlzW2luZGV4XSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICBpZiAocG9zYXJyYXlzWzBdLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQb3Npc2pvbmVyIDI6IFwiLCBwb3NhcnJheXNbaW5kZXhdW2ldKTtcclxuXHJcbiAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1baV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVswXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkhvbGU6IFwiLCBob2xlKTtcclxuICAgICAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZW5ndGggKz0gcG9zYXJyYXlzW2luZGV4IC0gMV1bMF0ubGVuZ3RoO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJTVGFydCBpbmRleDogXCIsIGxlbmd0aCk7XHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoOyBqIDwgcG9zYXJyYXlzW2luZGV4XVswXS5sZW5ndGggKyBsZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICB0ZXN0YXJyYXkucHVzaCgobGF5ZXJMZW5ndGhbaiArIDFdIGFzIGFueSkuZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICBuZXdQb3MucHVzaChob2xlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHRlc3RhcnJheSA9IFtdXHJcbiAgICAgIGhvbGUgPSBbXTtcclxuICAgICAgbGV0IGxlbmd0aDIgPSAwO1xyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHRlc3RhcnJheSA9IFtdO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiUG9seWdvbiBkcmFnOiBcIiwgcG9zYXJyYXlzWzBdW2luZGV4XSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICBpZiAocG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdWzBdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZW5ndGgyICs9IHBvc2FycmF5c1swXVtpbmRleCAtIDFdLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gbGVuZ3RoMjsgaiA8IHBvc2FycmF5c1swXVtpbmRleF0ubGVuZ3RoICsgbGVuZ3RoMjsgaisrKSB7XHJcbiAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xyXG4gICAgICB9XHJcbiAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkhvbGUgMjogXCIsIGhvbGUpO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJOeWUgcG9zaXNqb25lcjogXCIsIG5ld1Bvcyk7XHJcbiAgICBsYXllckxlbmd0aFswXS5zZXRMYXRMbmdzKG5ld1Bvcyk7XHJcbiAgfVxyXG4gIC8vIGNoZWNrIHRoaXNcclxuICBwcml2YXRlIG1hcmtlckRyYWdFbmQoRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xyXG4gICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBGZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xyXG4gICAgY29uc29sZS5sb2coXHJcbiAgICAgIFwiTWFya2VyZHJhZ2VuZCBwb2x5Z29uOiBcIixcclxuICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXNcclxuICAgICk7XHJcbiAgICBpZiAoZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFtlbGVtZW50XSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiTWFya2VyZHJhZ2VuZDogXCIsIGZlYXR1cmUpO1xyXG4gICAgICAgIGlmICh0aGlzLnR1cmZIZWxwZXIuaGFzS2lua3MoZmVhdHVyZSkpIHtcclxuICAgICAgICAgIHRoaXMua2lua3MgPSB0cnVlO1xyXG4gICAgICAgICAgY29uc3QgdW5raW5rID0gdGhpcy50dXJmSGVscGVyLmdldEtpbmtzKGZlYXR1cmUpO1xyXG4gICAgICAgICAgLy8gdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGZlYXR1cmUpKTtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlVua2luazogXCIsIHVua2luayk7XHJcbiAgICAgICAgICB1bmtpbmsuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKFxyXG4gICAgICAgICAgICAgIHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihwb2x5Z29uKSxcclxuICAgICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5raW5rcyA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKGZlYXR1cmUsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXHJcbiAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXNcclxuICAgICAgKTtcclxuICAgICAgY29uc29sZS5sb2coXCJNYXJrZXJkcmFnZW5kOiBcIiwgZmVhdHVyZSk7XHJcbiAgICAgIGlmICh0aGlzLnR1cmZIZWxwZXIuaGFzS2lua3MoZmVhdHVyZSkpIHtcclxuICAgICAgICB0aGlzLmtpbmtzID0gdHJ1ZTtcclxuICAgICAgICBjb25zdCB1bmtpbmsgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0S2lua3MoZmVhdHVyZSk7XHJcbiAgICAgICAgLy8gdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGZlYXR1cmUpKTtcclxuICAgICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChGZWF0dXJlR3JvdXApO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiVW5raW5rOiBcIiwgdW5raW5rKTtcclxuICAgICAgICBsZXQgdGVzdENvb3JkID0gW11cclxuICAgICAgICB1bmtpbmsuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgICAgIHRoaXMuYWRkUG9seWdvbihcclxuICAgICAgICAgICAgdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKHBvbHlnb24pLFxyXG4gICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgdHJ1ZVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyB0aGlzLmFkZFBvbHlnb24odGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbih0ZXN0Q29vcmQpLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gdGhpcy5kZWxldGVQb2x5Z29uKHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGZlYXR1cmUpKTtcclxuICAgICAgICB0aGlzLmtpbmtzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hZGRQb2x5Z29uKGZlYXR1cmUsIGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwc1xyXG4gICAgKTtcclxuICB9XHJcbiAgLy8gZmluZSwgY2hlY2sgdGhlIHJldHVybmVkIHR5cGVcclxuICBwcml2YXRlIGdldExhdExuZ3NGcm9tSnNvbihcclxuICAgIGZlYXR1cmU6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj5cclxuICApOiBJTGF0TG5nW11bXSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImdldExhdExuZ3NGcm9tSnNvbjogXCIsIGZlYXR1cmUpO1xyXG4gICAgbGV0IGNvb3JkO1xyXG4gICAgaWYgKGZlYXR1cmUpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSAmJlxyXG4gICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PT0gXCJNdWx0aVBvbHlnb25cIlxyXG4gICAgICApIHtcclxuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXS5sZW5ndGggPiAxICYmXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS50eXBlID09PSBcIlBvbHlnb25cIlxyXG4gICAgICApIHtcclxuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29vcmQgPSBMLkdlb0pTT04uY29vcmRzVG9MYXRMbmdzKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1bMF0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvb3JkO1xyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgdW5pb25Qb2x5Z29ucyhcclxuICAgIGxheWVycyxcclxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBwb2x5Z29uRmVhdHVyZVxyXG4gICkge1xyXG4gICAgY29uc29sZS5sb2coXCJ1bmlvblBvbHlnb25zXCIsIGxheWVycywgbGF0bG5ncywgcG9seWdvbkZlYXR1cmUpO1xyXG5cclxuICAgIGxldCBhZGROZXcgPSBsYXRsbmdzO1xyXG4gICAgbGF5ZXJzLmZvckVhY2goKGZlYXR1cmVHcm91cCwgaSkgPT4ge1xyXG4gICAgICBjb25zdCBmZWF0dXJlQ29sbGVjdGlvbiA9IGZlYXR1cmVHcm91cC50b0dlb0pTT04oKTtcclxuICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXTtcclxuICAgICAgY29uc3QgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcclxuICAgICAgY29uc3QgdW5pb24gPSB0aGlzLnR1cmZIZWxwZXIudW5pb24oYWRkTmV3LCBwb2x5Z29uRmVhdHVyZVtpXSk7IC8vIENoZWNrIGZvciBtdWx0aXBvbHlnb25zXHJcbiAgICAgIC8vIE5lZWRzIGEgY2xlYW51cCBmb3IgdGhlIG5ldyB2ZXJzaW9uXHJcbiAgICAgIHRoaXMuZGVsZXRlUG9seWdvbk9uTWVyZ2UocG9seSk7XHJcbiAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgICBhZGROZXcgPSB1bmlvbjtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG5ld0xhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4gPSBhZGROZXc7IC8vIFRyZW5nZXIga2Fuc2tqZSB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24oIGFkZE5ldyk7XHJcbiAgICB0aGlzLmFkZFBvbHlnb25MYXllcihuZXdMYXRsbmdzLCB0cnVlKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgcmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlRmVhdHVyZUdyb3VwXCIsIGZlYXR1cmVHcm91cCk7XHJcblxyXG4gICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5maWx0ZXIoXHJcbiAgICAgIGZlYXR1cmVHcm91cHMgPT4gZmVhdHVyZUdyb3VwcyAhPT0gZmVhdHVyZUdyb3VwXHJcbiAgICApO1xyXG4gICAgLy8gdGhpcy51cGRhdGVQb2x5Z29ucygpO1xyXG4gICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3VwKTtcclxuICB9XHJcbiAgLy8gZmluZSB1bnRpbCByZWZhY3RvcmluZ1xyXG4gIHByaXZhdGUgcmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInJlbW92ZUZlYXR1cmVHcm91cE9uTWVyZ2VcIiwgZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICBjb25zdCBuZXdBcnJheSA9IFtdO1xyXG4gICAgaWYgKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSkge1xyXG4gICAgICBjb25zdCBwb2x5Z29uID0gKGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSBhcyBhbnkpLmdldExhdExuZ3MoKVswXTtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5mb3JFYWNoKHYgPT4ge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIHYucG9seWdvbi50b1N0cmluZygpICE9PSBwb2x5Z29uWzBdLnRvU3RyaW5nKCkgJiZcclxuICAgICAgICAgIHYucG9seWdvblswXS50b1N0cmluZygpID09PSBwb2x5Z29uWzBdWzBdLnRvU3RyaW5nKClcclxuICAgICAgICApIHtcclxuICAgICAgICAgIHYucG9seWdvbiA9IHBvbHlnb247XHJcbiAgICAgICAgICBuZXdBcnJheS5wdXNoKHYpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgdi5wb2x5Z29uLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF0udG9TdHJpbmcoKSAmJlxyXG4gICAgICAgICAgdi5wb2x5Z29uWzBdLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF1bMF0udG9TdHJpbmcoKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaCh2KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBmZWF0dXJlR3JvdXAuY2xlYXJMYXllcnMoKTtcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3VwcyA9IHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZmlsdGVyKFxyXG4gICAgICAgIGZlYXR1cmVHcm91cHMgPT4gZmVhdHVyZUdyb3VwcyAhPT0gZmVhdHVyZUdyb3VwXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXHJcbiAgcHJpdmF0ZSBkZWxldGVQb2x5Z29uT25NZXJnZShwb2x5Z29uKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImRlbGV0ZVBvbHlnb25Pbk1lcmdlXCIsIHBvbHlnb24pO1xyXG4gICAgbGV0IHBvbHlnb24yID0gW107XHJcbiAgICBpZiAodGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueTtcclxuICAgICAgICBjb25zdCBsYXRsbmdzID0gbGF5ZXIuZ2V0TGF0TG5ncygpWzBdO1xyXG4gICAgICAgIHBvbHlnb24yID0gWy4uLmxhdGxuZ3NbMF1dO1xyXG4gICAgICAgIGlmIChsYXRsbmdzWzBdWzBdICE9PSBsYXRsbmdzWzBdW2xhdGxuZ3NbMF0ubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgIHBvbHlnb24yLnB1c2gobGF0bG5nc1swXVswXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGVxdWFscyA9IHRoaXMucG9seWdvbkFycmF5RXF1YWxzTWVyZ2UocG9seWdvbjIsIHBvbHlnb24pO1xyXG5cclxuICAgICAgICBpZiAoZXF1YWxzKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVRVUFMU1wiLCBwb2x5Z29uKTtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKHBvbHlnb24pO1xyXG4gICAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlVHJhc2hjYW4ocG9seWdvbik7XHJcbiAgICAgICAgICAvLyB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFRPRE8gLSBsZWdnZSBldCBhbm5ldCBzdGVkXHJcbiAgcHJpdmF0ZSBwb2x5Z29uQXJyYXlFcXVhbHNNZXJnZShwb2x5MTogYW55W10sIHBvbHkyOiBhbnlbXSk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHBvbHkxLnRvU3RyaW5nKCkgPT09IHBvbHkyLnRvU3RyaW5nKCk7XHJcbiAgfVxyXG4gIC8vIFRPRE8gLSBsZWdnZSBldCBhbm5ldCBzdGVkXHJcbiAgcHJpdmF0ZSBwb2x5Z29uQXJyYXlFcXVhbHMocG9seTE6IGFueVtdLCBwb2x5MjogYW55W10pOiBib29sZWFuIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwicG9seWdvbkFycmF5RXF1YWxzXCIsIHBvbHkxLCBwb2x5Mik7XHJcblxyXG4gICAgaWYgKHBvbHkxWzBdWzBdKSB7XHJcbiAgICAgIGlmICghcG9seTFbMF1bMF0uZXF1YWxzKHBvbHkyWzBdWzBdKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKCFwb2x5MVswXS5lcXVhbHMocG9seTJbMF0pKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocG9seTEubGVuZ3RoICE9PSBwb2x5Mi5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIHNldExlYWZsZXRNYXBFdmVudHMoXHJcbiAgICBlbmFibGVEcmFnZ2luZzogYm9vbGVhbixcclxuICAgIGVuYWJsZURvdWJsZUNsaWNrWm9vbTogYm9vbGVhbixcclxuICAgIGVuYWJsZVNjcm9sbFdoZWVsWm9vbTogYm9vbGVhblxyXG4gICkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJzZXRMZWFmbGV0TWFwRXZlbnRzXCIsIGVuYWJsZURyYWdnaW5nLCBlbmFibGVEb3VibGVDbGlja1pvb20sIGVuYWJsZVNjcm9sbFdoZWVsWm9vbSk7XHJcblxyXG4gICAgZW5hYmxlRHJhZ2dpbmcgPyB0aGlzLm1hcC5kcmFnZ2luZy5lbmFibGUoKSA6IHRoaXMubWFwLmRyYWdnaW5nLmRpc2FibGUoKTtcclxuICAgIGVuYWJsZURvdWJsZUNsaWNrWm9vbVxyXG4gICAgICA/IHRoaXMubWFwLmRvdWJsZUNsaWNrWm9vbS5lbmFibGUoKVxyXG4gICAgICA6IHRoaXMubWFwLmRvdWJsZUNsaWNrWm9vbS5kaXNhYmxlKCk7XHJcbiAgICBlbmFibGVTY3JvbGxXaGVlbFpvb21cclxuICAgICAgPyB0aGlzLm1hcC5zY3JvbGxXaGVlbFpvb20uZW5hYmxlKClcclxuICAgICAgOiB0aGlzLm1hcC5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgc2V0RHJhd01vZGUobW9kZTogRHJhd01vZGUpIHtcclxuICAgIGNvbnNvbGUubG9nKFwic2V0RHJhd01vZGVcIiwgdGhpcy5tYXApO1xyXG4gICAgdGhpcy5kcmF3TW9kZVN1YmplY3QubmV4dChtb2RlKTtcclxuICAgIGlmICghIXRoaXMubWFwKSB7XHJcbiAgICAgIGxldCBpc0FjdGl2ZURyYXdNb2RlID0gdHJ1ZTtcclxuICAgICAgc3dpdGNoIChtb2RlKSB7XHJcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5PZmY6XHJcbiAgICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3MoXHJcbiAgICAgICAgICAgIHRoaXMubWFwLmdldENvbnRhaW5lcigpLFxyXG4gICAgICAgICAgICBcImNyb3NzaGFpci1jdXJzb3ItZW5hYmxlZFwiXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgdGhpcy5ldmVudHMoZmFsc2UpO1xyXG4gICAgICAgICAgdGhpcy5zdG9wRHJhdygpO1xyXG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xyXG4gICAgICAgICAgICBjb2xvcjogXCJcIlxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLnNldExlYWZsZXRNYXBFdmVudHModHJ1ZSwgdHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgICBpc0FjdGl2ZURyYXdNb2RlID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIERyYXdNb2RlLkFkZDpcclxuICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhcclxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXHJcbiAgICAgICAgICAgIFwiY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkXCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50cyh0cnVlKTtcclxuICAgICAgICAgIHRoaXMudHJhY2VyLnNldFN0eWxlKHtcclxuICAgICAgICAgICAgY29sb3I6IGRlZmF1bHRDb25maWcucG9seUxpbmVPcHRpb25zLmNvbG9yXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyhmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuU3VidHJhY3Q6XHJcbiAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoXHJcbiAgICAgICAgICAgIHRoaXMubWFwLmdldENvbnRhaW5lcigpLFxyXG4gICAgICAgICAgICBcImNyb3NzaGFpci1jdXJzb3ItZW5hYmxlZFwiXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgdGhpcy5ldmVudHModHJ1ZSk7XHJcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XHJcbiAgICAgICAgICAgIGNvbG9yOiBcIiNEOTQ2MEZcIlxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLnNldExlYWZsZXRNYXBFdmVudHMoZmFsc2UsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGlzQWN0aXZlRHJhd01vZGUpIHtcclxuICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRGcmVlRHJhd01vZGUoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRNb3ZlTW9kZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBtb2RlQ2hhbmdlKG1vZGU6IERyYXdNb2RlKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKG1vZGUpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXHJcbiAgZHJhd01vZGVDbGljaygpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uRHJhd1N0YXRlcy5pc0ZyZWVEcmF3TW9kZSkge1xyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRNb3ZlTW9kZSgpO1xyXG4gICAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRGcmVlRHJhd01vZGUoKTtcclxuICAgICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5BZGQpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXHJcbiAgZnJlZWRyYXdNZW51Q2xpY2soKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLkFkZCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5hY3RpdmF0ZSgpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gcmVtb3ZlLCB1c2UgbW9kZUNoYW5nZVxyXG4gIHN1YnRyYWN0Q2xpY2soKTogdm9pZCB7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLlN1YnRyYWN0KTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgcmVzZXRUcmFja2VyKCkge1xyXG4gICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbWzAsIDBdXSk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVNYXJrZXJNZW51KCk6IHZvaWQge1xyXG4gICAgYWxlcnQoXCJvcGVuIG1lbnVcIik7XHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0SHRtbENvbnRlbnQoY2FsbEJhY2s6IEZ1bmN0aW9uKTogSFRNTEVsZW1lbnQge1xyXG4gICAgY29uc3QgY29tcCA9IHRoaXMucG9wdXBHZW5lcmF0b3IuZ2VuZXJhdGVBbHRlclBvcHVwKCk7XHJcbiAgICBjb21wLmluc3RhbmNlLmJib3hDbGlja2VkLnN1YnNjcmliZShlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coXCJiYm94IGNsaWNrZWRcIiwgZSk7XHJcbiAgICAgIGNhbGxCYWNrKGUpO1xyXG4gICAgfSk7XHJcbiAgICBjb21wLmluc3RhbmNlLnNpbXBseWZpQ2xpY2tlZC5zdWJzY3JpYmUoZSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwic2ltcGx5ZmkgY2xpY2tlZFwiLCBlKTtcclxuICAgICAgY2FsbEJhY2soZSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb21wLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgfVxyXG4gIHByaXZhdGUgY29udmVydFRvQm91bmRzUG9seWdvbihcclxuICAgIGxhdGxuZ3M6IElMYXRMbmdbXSxcclxuICAgIGFkZE1pZHBvaW50TWFya2VyczogYm9vbGVhbiA9IGZhbHNlXHJcbiAgKSB7XHJcbiAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcclxuICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFxyXG4gICAgICB0aGlzLmNvbnZlcnRUb0Nvb3JkcyhbbGF0bG5nc10pXHJcbiAgICApO1xyXG4gICAgY29uc3QgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5jb252ZXJ0VG9Cb3VuZGluZ0JveFBvbHlnb24oXHJcbiAgICAgIHBvbHlnb24sXHJcbiAgICAgIGFkZE1pZHBvaW50TWFya2Vyc1xyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmFkZFBvbHlnb25MYXllcih0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24obmV3UG9seWdvbiksIGZhbHNlKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBjb252ZXJ0VG9TaW1wbGlmaWVkUG9seWdvbihsYXRsbmdzOiBJTGF0TG5nW10pIHtcclxuICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgY29uc3QgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXHJcbiAgICAgIHRoaXMuY29udmVydFRvQ29vcmRzKFtsYXRsbmdzXSlcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZFBvbHlnb25MYXllcih0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24obmV3UG9seWdvbiksIHRydWUpO1xyXG4gIH1cclxuICBwcml2YXRlIGdldE1hcmtlckluZGV4KGxhdGxuZ3M6IElMYXRMbmdbXSwgcG9zaXRpb246IE1hcmtlclBvc2l0aW9uKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGJvdW5kczogTC5MYXRMbmdCb3VuZHMgPSBQb2x5RHJhd1V0aWwuZ2V0Qm91bmRzKFxyXG4gICAgICBsYXRsbmdzLFxyXG4gICAgICBNYXRoLnNxcnQoMikgLyAyXHJcbiAgICApO1xyXG4gICAgY29uc3QgY29tcGFzcyA9IG5ldyBDb21wYXNzKFxyXG4gICAgICBib3VuZHMuZ2V0U291dGgoKSxcclxuICAgICAgYm91bmRzLmdldFdlc3QoKSxcclxuICAgICAgYm91bmRzLmdldE5vcnRoKCksXHJcbiAgICAgIGJvdW5kcy5nZXRFYXN0KClcclxuICAgICk7XHJcbiAgICBjb25zdCBjb21wYXNzRGlyZWN0aW9uID0gY29tcGFzcy5nZXREaXJlY3Rpb24ocG9zaXRpb24pO1xyXG4gICAgY29uc3QgbGF0TG5nUG9pbnQ6IElMYXRMbmcgPSB7XHJcbiAgICAgIGxhdDogY29tcGFzc0RpcmVjdGlvbi5sYXQsXHJcbiAgICAgIGxuZzogY29tcGFzc0RpcmVjdGlvbi5sbmdcclxuICAgIH07XHJcbiAgICBjb25zdCB0YXJnZXRQb2ludCA9IHRoaXMudHVyZkhlbHBlci5nZXRDb29yZChsYXRMbmdQb2ludCk7XHJcbiAgICBjb25zdCBmYyA9IHRoaXMudHVyZkhlbHBlci5nZXRGZWF0dXJlUG9pbnRDb2xsZWN0aW9uKGxhdGxuZ3MpO1xyXG4gICAgY29uc3QgbmVhcmVzdFBvaW50SWR4ID0gdGhpcy50dXJmSGVscGVyLmdldE5lYXJlc3RQb2ludEluZGV4KFxyXG4gICAgICB0YXJnZXRQb2ludCxcclxuICAgICAgZmMgYXMgYW55XHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBuZWFyZXN0UG9pbnRJZHg7XHJcbiAgfVxyXG59XHJcbiJdfQ==