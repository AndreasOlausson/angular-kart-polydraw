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
        if (polygon.length > 1) {
            polygon.length = 1;
        }
        if (this.arrayOfFeatureGroups.length > 0) {
            this.arrayOfFeatureGroups.forEach(function (featureGroup) {
                var layer = featureGroup.getLayers()[0];
                var latlngs = layer.getLatLngs();
                var length = latlngs.length;
                //  = []
                console.log(latlngs);
                latlngs.forEach(function (latlng, index) {
                    var polygon3;
                    var test = __spread(latlng);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9wb2x5ZHJhdy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdCLHNDQUFzQztBQUN0QyxPQUFPLEVBQWMsZUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNoRCxPQUFPLEVBQWtCLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNuRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQzs7Ozs7OztBQU1oRTtJQW9CRSx5QkFDVSxRQUEwQixFQUMxQixjQUF5QyxFQUN6QyxVQUE2QixFQUM3QixrQkFBNkMsRUFDN0MsYUFBbUM7UUFMN0MsaUJBK0JDO1FBOUJTLGFBQVEsR0FBUixRQUFRLENBQWtCO1FBQzFCLG1CQUFjLEdBQWQsY0FBYyxDQUEyQjtRQUN6QyxlQUFVLEdBQVYsVUFBVSxDQUFtQjtRQUM3Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTJCO1FBQzdDLGtC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QVk7WUFDM0IsR0FBRyxFQUFFLGdCQUFnQixDQUFDLEdBQUc7WUFDekIsR0FBRyxFQUFFLGdCQUFnQixDQUFDLEdBQUc7U0FDMUIsQ0FBQztRQUNGLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFELElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUQsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FDMUQsV0FBVyxFQUNYLEVBQVMsQ0FDVixDQUFDO1FBRUYsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQzs7Z0JBbC9CbUIsZ0JBQWdCO2dCQUNWLHlCQUF5QjtnQkFDN0IsaUJBQWlCO2dCQUNULHlCQUF5QjtnQkFDOUIsb0JBQW9COzs7SUF6QmxDLGVBQWU7UUFKM0IsVUFBVSxDQUFDO1lBQ1YsVUFBVSxFQUFFLE1BQU07U0FDbkIsQ0FBQztRQUNGLDJCQUEyQjs7eUNBc0JMLGdCQUFnQjtZQUNWLHlCQUF5QjtZQUM3QixpQkFBaUI7WUFDVCx5QkFBeUI7WUFDOUIsb0JBQW9CO09BekJsQyxlQUFlLENBd2dDM0I7MEJBNWhDRDtDQTRoQ0MsQUF4Z0NELElBd2dDQztTQXhnQ1ksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIE9wdGlvbmFsIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0ICogYXMgTCBmcm9tIFwibGVhZmxldFwiO1xyXG4vLyBpbXBvcnQgKiBhcyB0dXJmIGZyb20gXCJAdHVyZi90dXJmXCI7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIEJlaGF2aW9yU3ViamVjdCwgU3ViamVjdCB9IGZyb20gXCJyeGpzXCI7XHJcbmltcG9ydCB7IGZpbHRlciwgZGVib3VuY2VUaW1lLCB0YWtlVW50aWwgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcclxuaW1wb3J0IHsgRmVhdHVyZSwgUG9seWdvbiwgTXVsdGlQb2x5Z29uIH0gZnJvbSBcIkB0dXJmL3R1cmZcIjtcclxuaW1wb3J0IHsgUG9seVN0YXRlU2VydmljZSB9IGZyb20gXCIuL21hcC1zdGF0ZS5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IFR1cmZIZWxwZXJTZXJ2aWNlIH0gZnJvbSBcIi4vdHVyZi1oZWxwZXIuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlIH0gZnJvbSBcIi4vcG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlXCI7XHJcbmltcG9ydCBkZWZhdWx0Q29uZmlnIGZyb20gXCIuL3BvbHlpbmZvLmpzb25cIjtcclxuaW1wb3J0IHsgSUxhdExuZywgUG9seWdvbkRyYXdTdGF0ZXMgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcclxuaW1wb3J0IHsgQ29tcG9uZW50R2VuZXJhdGVyU2VydmljZSB9IGZyb20gXCIuL2NvbXBvbmVudC1nZW5lcmF0ZXIuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBDb21wYXNzLCBQb2x5RHJhd1V0aWwgfSBmcm9tIFwiLi91dGlsc1wiO1xyXG5pbXBvcnQgeyBNYXJrZXJQb3NpdGlvbiwgRHJhd01vZGUgfSBmcm9tIFwiLi9lbnVtc1wiO1xyXG5pbXBvcnQgeyBMZWFmbGV0SGVscGVyU2VydmljZSB9IGZyb20gXCIuL2xlYWZsZXQtaGVscGVyLnNlcnZpY2VcIjtcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICBwcm92aWRlZEluOiBcInJvb3RcIlxyXG59KVxyXG4vLyBSZW5hbWUgLSBQb2x5RHJhd1NlcnZpY2VcclxuZXhwb3J0IGNsYXNzIFBvbHlEcmF3U2VydmljZSB7XHJcbiAgLy8gRHJhd01vZGVzLCBkZXRlcm1pbmUgVUkgYnV0dG9ucyBldGMuLi5cclxuICBkcmF3TW9kZVN1YmplY3Q6IEJlaGF2aW9yU3ViamVjdDxEcmF3TW9kZT4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0PERyYXdNb2RlPihcclxuICAgIERyYXdNb2RlLk9mZlxyXG4gICk7XHJcbiAgZHJhd01vZGUkOiBPYnNlcnZhYmxlPERyYXdNb2RlPiA9IHRoaXMuZHJhd01vZGVTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IG1pbmltdW1GcmVlRHJhd1pvb21MZXZlbDogbnVtYmVyID0gMTI7XHJcbiAgcHJpdmF0ZSBtYXA6IEwuTWFwO1xyXG5cclxuICBwcml2YXRlIG1lcmdlUG9seWdvbnM6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBraW5rczogYm9vbGVhbjtcclxuICAvLyBhZGQgdG8gY29uZmlnXHJcbiAgcHJpdmF0ZSBhcnJheU9mRmVhdHVyZUdyb3VwczogTC5GZWF0dXJlR3JvdXA8TC5MYXllcj5bXSA9IFtdO1xyXG4gIHByaXZhdGUgdHJhY2VyOiBMLlBvbHlsaW5lID0ge30gYXMgYW55O1xyXG4gIC8vIGVuZCBhZGQgdG8gY29uZmlnXHJcblxyXG4gIHByaXZhdGUgbmdVbnN1YnNjcmliZSA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHJpdmF0ZSBjb25maWc6IHR5cGVvZiBkZWZhdWx0Q29uZmlnID0gbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIG1hcFN0YXRlOiBQb2x5U3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBwb3B1cEdlbmVyYXRvcjogQ29tcG9uZW50R2VuZXJhdGVyU2VydmljZSxcclxuICAgIHByaXZhdGUgdHVyZkhlbHBlcjogVHVyZkhlbHBlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHBvbHlnb25JbmZvcm1hdGlvbjogUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSxcclxuICAgIHByaXZhdGUgbGVhZmxldEhlbHBlcjogTGVhZmxldEhlbHBlclNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMubWFwU3RhdGUubWFwJC5waXBlKGZpbHRlcihtID0+IG0gIT09IG51bGwpKS5zdWJzY3JpYmUoKG1hcDogTC5NYXApID0+IHtcclxuICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiS2FydGV0IGkgcG9seWRyYXc6IFwiLCB0aGlzLm1hcCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwicHJlIHRoaXMuY29uZmlnXCIsIHRoaXMuY29uZmlnKTtcclxuICAgICAgdGhpcy5jb25maWcgPSBkZWZhdWx0Q29uZmlnO1xyXG4gICAgICBjb25zb2xlLmxvZyhcInRoaXMuY29uZmlnXCIsIHRoaXMuY29uZmlnKTtcclxuICAgICAgdGhpcy5jb25maWd1cmF0ZSh7fSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiYWZ0ZXIgdGhpcy5jb25maWdcIiwgdGhpcy5jb25maWcpO1xyXG4gICAgICB0aGlzLnRyYWNlciA9IEwucG9seWxpbmUoW1swLCAwXV0sIHRoaXMuY29uZmlnLnBvbHlMaW5lT3B0aW9ucyk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiVHJhY2VyIHBpcGU6IFwiLCB0aGlzLnRyYWNlcik7XHJcbiAgICAgIHRoaXMuaW5pdFBvbHlEcmF3KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLm1hcFN0YXRlLm1hcFpvb21MZXZlbCRcclxuICAgICAgLnBpcGUoZGVib3VuY2VUaW1lKDEwMCksIHRha2VVbnRpbCh0aGlzLm5nVW5zdWJzY3JpYmUpKVxyXG4gICAgICAuc3Vic2NyaWJlKCh6b29tOiBudW1iZXIpID0+IHtcclxuICAgICAgICB0aGlzLm9uWm9vbUNoYW5nZSh6b29tKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkluZm9ybWF0aW9uJC5zdWJzY3JpYmUoayA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiUG9seUluZm8gc3RhcnQ6IFwiLCBrKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRPRE8gLSBsYWdlIGVuIGNvbmZpZyBvYnNlcnZhYmxlIGkgbWFwU3RhdGUgb2cgb3BwZGF0ZXIgdGhpcy5jb25maWcgbWVkIGRlblxyXG4gIH1cclxuICAvLyBuZXdcclxuICBjb25maWd1cmF0ZShjb25maWc6IE9iamVjdCk6IHZvaWQge1xyXG4gICAgLy8gVE9ETyBpZiBjb25maWcgaXMgcGF0aC4uLlxyXG4gICAgdGhpcy5jb25maWcgPSB7IC4uLmRlZmF1bHRDb25maWcsIC4uLmNvbmZpZyB9O1xyXG5cclxuICAgIHRoaXMubWVyZ2VQb2x5Z29ucyA9IHRoaXMuY29uZmlnLm1lcmdlUG9seWdvbnM7XHJcbiAgICB0aGlzLmtpbmtzID0gdGhpcy5jb25maWcua2lua3M7XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgY2xvc2VBbmRSZXNldCgpOiB2b2lkIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiY2xvc2VBbmRSZXNldFwiKTtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuICAgIHRoaXMucmVtb3ZlQWxsRmVhdHVyZUdyb3VwcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gbWFrZSByZWFkYWJsZVxyXG4gIGRlbGV0ZVBvbHlnb24ocG9seWdvbjogSUxhdExuZ1tdW10pIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZGVsZXRlUG9seWdvbjogXCIsIHBvbHlnb24pO1xyXG4gICAgaWYocG9seWdvbi5sZW5ndGggPiAxKSB7XHJcbiAgICAgIHBvbHlnb24ubGVuZ3RoID0gMTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55O1xyXG4gICAgICAgIGNvbnN0IGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gbGF0bG5ncy5sZW5ndGg7XHJcbiAgICAgICAgLy8gID0gW11cclxuICAgICAgICBjb25zb2xlLmxvZyhsYXRsbmdzKTtcclxuICAgICAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgaW5kZXgpID0+IHtcclxuICAgICAgICAgIGxldCBwb2x5Z29uMztcclxuICAgICAgICAgIGNvbnN0IHRlc3QgPSBbLi4ubGF0bG5nXTtcclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhsYXRsbmcpO1xyXG4gICAgICAgICAgaWYgKGxhdGxuZy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGlmIChsYXRsbmdbMF1bMF0gIT09IGxhdGxuZ1swXVtsYXRsbmdbMF0ubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgICAgICB0ZXN0WzBdLnB1c2gobGF0bG5nWzBdWzBdKTtcclxuICAgICAgICAgICAgICB9IFxyXG5cclxuICAgICAgICAgICAgcG9seWdvbjMgPSBbdGVzdFswXV07XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAobGF0bG5nWzBdICE9PSBsYXRsbmdbbGF0bG5nLmxlbmd0aCAtIDFdKSB7XHJcbiAgICAgICAgICAgICAgdGVzdC5wdXNoKGxhdGxuZ1swXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcG9seWdvbjMgPSB0ZXN0O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGVzdDogXCIsIHBvbHlnb24zKTtcclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhwb2x5Z29uKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBlcXVhbHMgPSB0aGlzLnBvbHlnb25BcnJheUVxdWFscyhwb2x5Z29uMywgcG9seWdvbik7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImVxdWFsczogXCIsIGVxdWFscywgXCIgbGVuZ3RoOiBcIiwgbGVuZ3RoKTtcclxuICAgICAgICAgIGlmIChlcXVhbHMgJiYgbGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVRyYXNoY2FuKHBvbHlnb24pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZmVhdHVyZUdyb3VwLmdldExheWVycygpKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXF1YWxzICYmIGxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlVHJhc2hDYW5Pbk11bHRpKFtwb2x5Z29uXSk7XHJcbiAgICAgICAgICAgIGxhdGxuZ3Muc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgbGF5ZXIuc2V0TGF0TG5ncyhsYXRsbmdzKTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobGF5ZXIudG9HZW9KU09OKCksIGZhbHNlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICByZW1vdmVBbGxGZWF0dXJlR3JvdXBzKCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJyZW1vdmVBbGxGZWF0dXJlR3JvdXBzXCIsIG51bGwpO1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cHMgPT4ge1xyXG4gICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXBzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMgPSBbXTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnJlc2V0KCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi51cGRhdGVQb2x5Z29ucygpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgZ2V0RHJhd01vZGUoKTogRHJhd01vZGUge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJnZXREcmF3TW9kZVwiLCBudWxsKTtcclxuICAgIHJldHVybiB0aGlzLmRyYXdNb2RlU3ViamVjdC52YWx1ZTtcclxuICB9XHJcblxyXG4gIGFkZFZpa2VuKHBvbHlnb24pIHtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHBvbHlnb24sIHRydWUpO1xyXG4gIH1cclxuXHJcbiAgLy8gY2hlY2sgdGhpc1xyXG4gIGFkZEF1dG9Qb2x5Z29uKGdlb2dyYXBoaWNCb3JkZXJzOiBMLkxhdExuZ1tdW11bXSk6IHZvaWQge1xyXG4gICAgZ2VvZ3JhcGhpY0JvcmRlcnMuZm9yRWFjaChncm91cCA9PiB7XHJcbiAgICBjb25zdCBmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwID0gbmV3IEwuRmVhdHVyZUdyb3VwKCk7XHJcblxyXG4gICAgY29uc3QgcG9seWdvbjIgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFxyXG4gICAgICB0aGlzLmNvbnZlcnRUb0Nvb3Jkcyhncm91cClcclxuICAgICk7XHJcbiAgICBjb25zb2xlLmxvZyhwb2x5Z29uMik7XHJcbiAgICBjb25zdCBwb2x5Z29uID0gdGhpcy5nZXRQb2x5Z29uKHBvbHlnb24yKTtcclxuXHJcbiAgICBmZWF0dXJlR3JvdXAuYWRkTGF5ZXIocG9seWdvbik7XHJcbiAgICBjb25zdCBtYXJrZXJMYXRsbmdzID0gcG9seWdvbi5nZXRMYXRMbmdzKCk7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1hcmtlcnM6IFwiLCBtYXJrZXJMYXRsbmdzKTtcclxuICAgIG1hcmtlckxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcclxuICAgICAgcG9seWdvbi5mb3JFYWNoKChwb2x5RWxlbWVudCwgaSkgPT4ge1xyXG4gICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLmFkZE1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hZGRIb2xlTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJIdWxsOiBcIiwgcG9seUVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIC8vIHRoaXMuYWRkTWFya2VyKHBvbHlnb25bMF0sIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgIC8vIFRPRE8gLSBIdmlzIHBvbHlnb24ubGVuZ3RoID4xLCBzw6UgaGFyIGRlbiBodWxsOiBlZ2VuIGFkZE1hcmtlciBmdW5rc2pvblxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5wdXNoKGZlYXR1cmVHcm91cCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKFxyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzXHJcbiAgICApO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uYWN0aXZhdGUoKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vIGlubmVow6VsbCBpIGlmJ2FyIGZseXR0YSB0aWxsIGVnbmEgbWV0b2RlclxyXG4gIHByaXZhdGUgY29udmVydFRvQ29vcmRzKGxhdGxuZ3M6IElMYXRMbmdbXVtdKSB7XHJcbiAgICBjb25zdCBjb29yZHMgPSBbXTtcclxuICAgIGNvbnNvbGUubG9nKGxhdGxuZ3MubGVuZ3RoLCBsYXRsbmdzKTtcclxuICAgIGlmIChsYXRsbmdzLmxlbmd0aCA+IDEgJiYgbGF0bG5ncy5sZW5ndGggPCAzKSB7XHJcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gW107XHJcbiAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1tsYXRsbmdzLmxlbmd0aCAtIDFdKSxcclxuICAgICAgICBsYXRsbmdzW2xhdGxuZ3MubGVuZ3RoIC0gMV0ubGVuZ3RoXHJcbiAgICAgICk7XHJcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbWF4LWxpbmUtbGVuZ3RoXHJcbiAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihcclxuICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSksXHJcbiAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKVxyXG4gICAgICApO1xyXG4gICAgICBpZiAod2l0aGluKSB7XHJcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgY29vcmRpbmF0ZXMucHVzaChMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKHBvbHlnb24pKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPj0gMSkge1xyXG4gICAgICAgIGNvb3Jkcy5wdXNoKGNvb3JkaW5hdGVzKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZyhcIldpdGhpbjEgXCIsIHdpdGhpbik7XHJcbiAgICB9IGVsc2UgaWYgKGxhdGxuZ3MubGVuZ3RoID4gMikge1xyXG4gICAgICBjb25zdCBjb29yZGluYXRlcyA9IFtdO1xyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDE7IGluZGV4IDwgbGF0bG5ncy5sZW5ndGggLSAxOyBpbmRleCsrKSB7XHJcbiAgICAgICAgY29uc3Qgd2l0aGluID0gdGhpcy50dXJmSGVscGVyLmlzV2l0aGluKFxyXG4gICAgICAgICAgTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzW2luZGV4XSksXHJcbiAgICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbMF0pXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAod2l0aGluKSB7XHJcbiAgICAgICAgICBsYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzLnB1c2goTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGNvb3Jkcy5wdXNoKGNvb3JkaW5hdGVzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKV0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3JkcyhsYXRsbmdzWzBdKV0pO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coY29vcmRzKTtcclxuICAgIHJldHVybiBjb29yZHM7XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSBpbml0UG9seURyYXcoKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImluaXRQb2x5RHJhd1wiLCBudWxsKTtcclxuXHJcbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCk7XHJcbiAgICBjb25zdCBkcmF3TW9kZSA9IHRoaXMuZ2V0RHJhd01vZGUoKTtcclxuICAgIGlmICh0aGlzLmNvbmZpZy50b3VjaFN1cHBvcnQpIHtcclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIGUgPT4ge1xyXG4gICAgICAgIGlmIChkcmF3TW9kZSAhPT0gRHJhd01vZGUuT2ZmKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdXNlRG93bihlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCBlID0+IHtcclxuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xyXG4gICAgICAgICAgdGhpcy5tb3VzZVVwTGVhdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgZSA9PiB7XHJcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcclxuICAgICAgICAgIHRoaXMubW91c2VNb3ZlKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhcIk1hcCBpbml0OiBcIiwgdGhpcy5tYXApO1xyXG4gICAgY29uc29sZS5sb2coXCJUcmFjZXIgaW5pdDogXCIsIHRoaXMudHJhY2VyKTtcclxuICAgIHRoaXMubWFwLmFkZExheWVyKHRoaXMudHJhY2VyKTtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuICB9XHJcbiAgLy8gVGVzdCBMLk1vdXNlRXZlbnRcclxuICBwcml2YXRlIG1vdXNlRG93bihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coXCJtb3VzZURvd25cIiwgZXZlbnQpO1xyXG5cclxuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9IG51bGwpIHtcclxuICAgICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbZXZlbnQubGF0bG5nXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBsYXRsbmcgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKFtcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZXHJcbiAgICAgIF0pO1xyXG4gICAgICB0aGlzLnRyYWNlci5zZXRMYXRMbmdzKFtsYXRsbmddKTtcclxuICAgIH1cclxuICAgIHRoaXMuc3RhcnREcmF3KCk7XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPIGV2ZW50IHR5cGUsIGNyZWF0ZSBjb250YWluZXJQb2ludFRvTGF0TG5nLW1ldGhvZFxyXG4gIHByaXZhdGUgbW91c2VNb3ZlKGV2ZW50KSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm1vdXNlTW92ZVwiLCBldmVudCk7XHJcblxyXG4gICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT0gbnVsbCkge1xyXG4gICAgICB0aGlzLnRyYWNlci5hZGRMYXRMbmcoZXZlbnQubGF0bG5nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGxhdGxuZyA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcoW1xyXG4gICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCxcclxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFlcclxuICAgICAgXSk7XHJcbiAgICAgIHRoaXMudHJhY2VyLmFkZExhdExuZyhsYXRsbmcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgbW91c2VVcExlYXZlKCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJtb3VzZVVwTGVhdmVcIiwgbnVsbCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLURlbGV0ZSB0cmFzaGNhbnNcIiwgbnVsbCk7XHJcbiAgICBjb25zdCBnZW9Qb3M6IEZlYXR1cmU8XHJcbiAgICAgIFBvbHlnb24gfCBNdWx0aVBvbHlnb25cclxuICAgID4gPSB0aGlzLnR1cmZIZWxwZXIudHVyZkNvbmNhdmVtYW4odGhpcy50cmFjZXIudG9HZW9KU09OKCkgYXMgYW55KTtcclxuICAgIHRoaXMuc3RvcERyYXcoKTtcclxuICAgIHN3aXRjaCAodGhpcy5nZXREcmF3TW9kZSgpKSB7XHJcbiAgICAgIGNhc2UgRHJhd01vZGUuQWRkOlxyXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbihnZW9Qb3MsIHRydWUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIERyYXdNb2RlLlN1YnRyYWN0OlxyXG4gICAgICAgIHRoaXMuc3VidHJhY3RQb2x5Z29uKGdlb1Bvcyk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwc1xyXG4gICAgKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tY3JlYXRlIHRyYXNoY2Fuc1wiLCBudWxsKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc3RhcnREcmF3KCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJzdGFydERyYXdcIiwgbnVsbCk7XHJcblxyXG4gICAgdGhpcy5kcmF3U3RhcnRlZEV2ZW50cyh0cnVlKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc3RvcERyYXcoKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInN0b3BEcmF3XCIsIG51bGwpO1xyXG5cclxuICAgIHRoaXMucmVzZXRUcmFja2VyKCk7XHJcbiAgICB0aGlzLmRyYXdTdGFydGVkRXZlbnRzKGZhbHNlKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25ab29tQ2hhbmdlKHpvb21MZXZlbDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm9uWm9vbUNoYW5nZVwiLCB6b29tTGV2ZWwpO1xyXG5cclxuICAgIGlmICh6b29tTGV2ZWwgPj0gdGhpcy5taW5pbXVtRnJlZURyYXdab29tTGV2ZWwpIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkRyYXdTdGF0ZXMuY2FuVXNlUG9seURyYXcgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkRyYXdTdGF0ZXMuY2FuVXNlUG9seURyYXcgPSBmYWxzZTtcclxuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0TW92ZU1vZGUoKTtcclxuICAgIH1cclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZHJhd1N0YXJ0ZWRFdmVudHMob25vZmY6IGJvb2xlYW4pIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwiZHJhd1N0YXJ0ZWRFdmVudHNcIiwgb25vZmYpO1xyXG5cclxuICAgIGNvbnN0IG9ub3JvZmYgPSBvbm9mZiA/IFwib25cIiA6IFwib2ZmXCI7XHJcblxyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmUsIHRoaXMpO1xyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcExlYXZlLCB0aGlzKTtcclxuICB9XHJcbiAgLy8gT24gaG9sZFxyXG4gIHByaXZhdGUgc3VidHJhY3RQb2x5Z29uKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIHRoaXMuc3VidHJhY3QobGF0bG5ncyk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGFkZFBvbHlnb24oXHJcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxyXG4gICAgc2ltcGxpZnk6IGJvb2xlYW4sXHJcbiAgICBub01lcmdlOiBib29sZWFuID0gZmFsc2VcclxuICApIHtcclxuICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICBcImFkZFBvbHlnb25cIixcclxuICAgICAgbGF0bG5ncyxcclxuICAgICAgc2ltcGxpZnksXHJcbiAgICAgIG5vTWVyZ2UsXHJcbiAgICAgIHRoaXMua2lua3MsXHJcbiAgICAgIHRoaXMuY29uZmlnXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgdGhpcy5tZXJnZVBvbHlnb25zICYmXHJcbiAgICAgICFub01lcmdlICYmXHJcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCAmJlxyXG4gICAgICAhdGhpcy5raW5rc1xyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMubWVyZ2UobGF0bG5ncyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXRsbmdzLCBzaW1wbGlmeSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGFkZFBvbHlnb25MYXllcihcclxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXHJcbiAgICBzaW1wbGlmeTogYm9vbGVhblxyXG4gICkge1xyXG4gICAgY29uc3QgZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCA9IG5ldyBMLkZlYXR1cmVHcm91cCgpO1xyXG5cclxuICAgIGNvbnN0IGxhdExuZ3MgPSBzaW1wbGlmeSA/IHRoaXMudHVyZkhlbHBlci5nZXRTaW1wbGlmaWVkKGxhdGxuZ3MpIDogbGF0bG5ncztcclxuICAgIGNvbnNvbGUubG9nKFwiQWRkUG9seWdvbkxheWVyOiBcIiwgbGF0TG5ncyk7XHJcbiAgICBjb25zdCBwb2x5Z29uID0gdGhpcy5nZXRQb2x5Z29uKGxhdExuZ3MpO1xyXG4gICAgZmVhdHVyZUdyb3VwLmFkZExheWVyKHBvbHlnb24pO1xyXG4gICAgY29uc29sZS5sb2cocG9seWdvbik7XHJcbiAgICBjb25zdCBtYXJrZXJMYXRsbmdzID0gcG9seWdvbi5nZXRMYXRMbmdzKCk7XHJcbiAgICBtYXJrZXJMYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XHJcbiAgICAgIHBvbHlnb24uZm9yRWFjaCgocG9seUVsZW1lbnQ6IElMYXRMbmdbXSwgaTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgaWYgKGkgPT09IDApIHtcclxuICAgICAgICAgIHRoaXMuYWRkTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmFkZEhvbGVNYXJrZXIocG9seUVsZW1lbnQsIGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkh1bGw6IFwiLCBwb2x5RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgLy8gdGhpcy5hZGRNYXJrZXIocG9seWdvblswXSwgZmVhdHVyZUdyb3VwKTtcclxuICAgICAgLy8gVE9ETyAtIEh2aXMgcG9seWdvbi5sZW5ndGggPjEsIHPDpSBoYXIgZGVuIGh1bGw6IGVnZW4gYWRkTWFya2VyIGZ1bmtzam9uXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgIGNvbnNvbGUubG9nKFwiQXJyYXk6IFwiLCB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLk9mZik7XHJcblxyXG4gICAgZmVhdHVyZUdyb3VwLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgIHRoaXMucG9seWdvbkNsaWNrZWQoZSwgbGF0TG5ncyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgcG9seWdvbkNsaWNrZWQoZTogYW55LCBwb2x5OiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XHJcbiAgICBjb25zdCBuZXdQb2ludCA9IGUubGF0bG5nO1xyXG4gICAgaWYgKHBvbHkuZ2VvbWV0cnkudHlwZSA9PT0gXCJNdWx0aVBvbHlnb25cIikge1xyXG4gICAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmluamVjdFBvaW50VG9Qb2x5Z29uKHBvbHksIFtcclxuICAgICAgICBuZXdQb2ludC5sbmcsXHJcbiAgICAgICAgbmV3UG9pbnQubGF0XHJcbiAgICAgIF0pO1xyXG4gICAgICB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24ocG9seSkpO1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihuZXdQb2x5Z29uLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIGdldFBvbHlnb24obGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgY29uc29sZS5sb2coXCJnZXRQb2x5Z29uczogXCIsIGxhdGxuZ3MpO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IEwuR2VvSlNPTi5nZW9tZXRyeVRvTGF5ZXIobGF0bG5ncykgYXMgYW55O1xyXG5cclxuICAgIHBvbHlnb24uc2V0U3R5bGUodGhpcy5jb25maWcucG9seWdvbk9wdGlvbnMpO1xyXG4gICAgcmV0dXJuIHBvbHlnb247XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBwcml2YXRlIG1lcmdlKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcclxuICAgIGNvbnNvbGUubG9nKFwibWVyZ2VcIiwgbGF0bG5ncyk7XHJcbiAgICBjb25zdCBwb2x5Z29uRmVhdHVyZSA9IFtdO1xyXG4gICAgY29uc3QgbmV3QXJyYXk6IEwuRmVhdHVyZUdyb3VwW10gPSBbXTtcclxuICAgIGxldCBwb2x5SW50ZXJzZWN0aW9uID0gZmFsc2U7XHJcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcclxuICAgICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBmZWF0dXJlR3JvdXAudG9HZW9KU09OKCkgYXMgYW55O1xyXG4gICAgICBjb25zb2xlLmxvZyhcIk1lcmdlcjogXCIsIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdKTtcclxuICAgICAgaWYgKGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcclxuICAgICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcclxuICAgICAgICAgIGlmIChwb2x5SW50ZXJzZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIG5ld0FycmF5LnB1c2goZmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKFxyXG4gICAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF1cclxuICAgICAgICApO1xyXG4gICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcclxuICAgICAgICBpZiAocG9seUludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgbmV3QXJyYXkucHVzaChmZWF0dXJlR3JvdXApO1xyXG4gICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY29uc29sZS5sb2cobmV3QXJyYXkpO1xyXG4gICAgaWYgKG5ld0FycmF5Lmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy51bmlvblBvbHlnb25zKG5ld0FycmF5LCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXRsbmdzLCB0cnVlKTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gbmV4dFxyXG4gIHByaXZhdGUgc3VidHJhY3QobGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPikge1xyXG4gICAgbGV0IGFkZEhvbGUgPSBsYXRsbmdzO1xyXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcclxuICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXTtcclxuICAgICAgY29uc3QgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcclxuICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25EaWZmZXJlbmNlKGZlYXR1cmUsIGFkZEhvbGUpO1xyXG4gICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seSk7XHJcbiAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXApO1xyXG4gICAgICBhZGRIb2xlID0gbmV3UG9seWdvbjtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG5ld0xhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4gPSBhZGRIb2xlO1xyXG4gICAgY29uc3QgY29vcmRzID0gdGhpcy50dXJmSGVscGVyLmdldENvb3JkcyhuZXdMYXRsbmdzKTtcclxuICAgIGNvb3Jkcy5mb3JFYWNoKHZhbHVlID0+IHtcclxuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIodGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihbdmFsdWVdKSwgdHJ1ZSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgZXZlbnRzKG9ub2ZmOiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBvbm9yb2ZmID0gb25vZmYgPyBcIm9uXCIgOiBcIm9mZlwiO1xyXG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZURvd24sIHRoaXMpO1xyXG4gIH1cclxuICAvLyBmaW5lLCBUT0RPOiBpZiBzcGVjaWFsIG1hcmtlcnNcclxuICBwcml2YXRlIGFkZE1hcmtlcihsYXRsbmdzOiBJTGF0TG5nW10sIEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnN0IG1lbnVNYXJrZXJJZHggPSB0aGlzLmdldE1hcmtlckluZGV4KFxyXG4gICAgICBsYXRsbmdzLFxyXG4gICAgICB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnBvc2l0aW9uXHJcbiAgICApO1xyXG4gICAgY29uc3QgZGVsZXRlTWFya2VySWR4ID0gdGhpcy5nZXRNYXJrZXJJbmRleChcclxuICAgICAgbGF0bG5ncyxcclxuICAgICAgdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnBvc2l0aW9uXHJcbiAgICApO1xyXG5cclxuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XHJcbiAgICAgIGxldCBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VySWNvbi5zdHlsZUNsYXNzZXM7XHJcbiAgICAgIC8qICAgaWYgKGkgPT09IG1lbnVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XHJcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfVxyXG4gICAgICBpZiAoaSA9PT0gZGVsZXRlTWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XHJcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckRlbGV0ZUljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICB9ICovXHJcbiAgICAgIGNvbnN0IG1hcmtlciA9IG5ldyBMLk1hcmtlcihsYXRsbmcsIHtcclxuICAgICAgICBpY29uOiB0aGlzLmNyZWF0ZURpdkljb24oaWNvbkNsYXNzZXMpLFxyXG4gICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcclxuICAgICAgICB0aXRsZTogaS50b1N0cmluZygpXHJcbiAgICAgIH0pO1xyXG4gICAgICBGZWF0dXJlR3JvdXAuYWRkTGF5ZXIobWFya2VyKS5hZGRUbyh0aGlzLm1hcCk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiRmVhdHVyZUdyb3VwOiBcIiwgRmVhdHVyZUdyb3VwKTtcclxuICAgICAgbWFya2VyLm9uKFwiZHJhZ1wiLCBlID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlckRyYWcoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIG1hcmtlci5vbihcImRyYWdlbmRcIiwgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoaSA9PT0gbWVudU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLm1lbnUpIHtcclxuICAgICAgICAvLyBtYXJrZXIuYmluZFBvcHVwKFxyXG4gICAgICAgIC8vICAgdGhpcy5nZXRIdG1sQ29udGVudChlID0+IHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJjbGlja2VkIG9uXCIsIGUudGFyZ2V0KTtcclxuICAgICAgICAvLyAgIH0pXHJcbiAgICAgICAgLy8gKTtcclxuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuY29udmVydFRvQm91bmRzUG9seWdvbihsYXRsbmdzLCB0cnVlKTtcclxuICAgICAgICAgIC8vIHRoaXMuY29udmVydFRvU2ltcGxpZmllZFBvbHlnb24obGF0bG5ncyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGkgPT09IGRlbGV0ZU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRIb2xlTWFya2VyKGxhdGxuZ3M6IElMYXRMbmdbXSwgRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIGkpID0+IHtcclxuICAgICAgY29uc3QgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckljb24uc3R5bGVDbGFzc2VzO1xyXG4gICAgICAvKiAgaWYgKGkgPT09IDAgJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XHJcbiAgICAgICAgaWNvbkNsYXNzZXMgPSB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlck1lbnVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy9UT0RPLSBsZWdnIHRpbCBmaWxsIGljb25cclxuICAgICAgaWYgKGkgPT09IGxhdGxuZ3MubGVuZ3RoIC0gMSAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xyXG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnN0eWxlQ2xhc3NlcztcclxuICAgICAgfSAqL1xyXG4gICAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5NYXJrZXIobGF0bG5nLCB7XHJcbiAgICAgICAgaWNvbjogdGhpcy5jcmVhdGVEaXZJY29uKGljb25DbGFzc2VzKSxcclxuICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgdGl0bGU6IGkudG9TdHJpbmcoKVxyXG4gICAgICB9KTtcclxuICAgICAgRmVhdHVyZUdyb3VwLmFkZExheWVyKG1hcmtlcikuYWRkVG8odGhpcy5tYXApO1xyXG5cclxuICAgICAgbWFya2VyLm9uKFwiZHJhZ1wiLCBlID0+IHtcclxuICAgICAgICB0aGlzLm1hcmtlckRyYWcoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIG1hcmtlci5vbihcImRyYWdlbmRcIiwgZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvKiAgIGlmIChpID09PSAwICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xyXG4gICAgICAgIG1hcmtlci5iaW5kUG9wdXAodGhpcy5nZXRIdG1sQ29udGVudCgoZSkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJjbGlja2VkIG9uXCIsIGUudGFyZ2V0KTtcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgLy8gbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgLy8gICB0aGlzLnRvZ2dsZU1hcmtlck1lbnUoKTtcclxuICAgICAgICAvLyB9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09PSBsYXRsbmdzLmxlbmd0aCAtIDEgJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcclxuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9ICovXHJcbiAgICB9KTtcclxuICB9XHJcbiAgcHJpdmF0ZSBjcmVhdGVEaXZJY29uKGNsYXNzTmFtZXM6IHN0cmluZ1tdKTogTC5EaXZJY29uIHtcclxuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzLmpvaW4oXCIgXCIpO1xyXG4gICAgY29uc3QgaWNvbiA9IEwuZGl2SWNvbih7IGNsYXNzTmFtZTogY2xhc3NlcyB9KTtcclxuICAgIHJldHVybiBpY29uO1xyXG4gIH1cclxuICAvLyBUT0RPOiBDbGVhbnVwXHJcbiAgcHJpdmF0ZSBtYXJrZXJEcmFnKEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnN0IG5ld1BvcyA9IFtdO1xyXG4gICAgbGV0IHRlc3RhcnJheSA9IFtdO1xyXG4gICAgbGV0IGhvbGUgPSBbXTtcclxuICAgIGNvbnN0IGxheWVyTGVuZ3RoID0gRmVhdHVyZUdyb3VwLmdldExheWVycygpIGFzIGFueTtcclxuICAgIGNvbnN0IHBvc2FycmF5cyA9IGxheWVyTGVuZ3RoWzBdLmdldExhdExuZ3MoKTtcclxuICAgIGNvbnNvbGUubG9nKHBvc2FycmF5cyk7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1hcmtlcmRyYWc6IFwiLCBsYXllckxlbmd0aCk7XHJcbiAgICBsZXQgbGVuZ3RoID0gMDtcclxuICAgIGlmIChwb3NhcnJheXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcG9zYXJyYXlzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHRlc3RhcnJheSA9IFtdO1xyXG4gICAgICAgIGhvbGUgPSBbXTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlBvc2lzam9uZXI6IFwiLCBwb3NhcnJheXNbaW5kZXhdKTtcclxuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF0ubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaW5kZXggPCBwb3NhcnJheXNbMF0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlBvc2lzam9uZXIgMjogXCIsIHBvc2FycmF5c1tpbmRleF1baV0pO1xyXG5cclxuICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVtpXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdWzBdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBob2xlLnB1c2godGVzdGFycmF5KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiSG9sZTogXCIsIGhvbGUpO1xyXG4gICAgICAgICAgbmV3UG9zLnB1c2goaG9sZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlbmd0aCArPSBwb3NhcnJheXNbaW5kZXggLSAxXVswXS5sZW5ndGg7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNUYXJ0IGluZGV4OiBcIiwgbGVuZ3RoKTtcclxuICAgICAgICAgIGZvciAobGV0IGogPSBsZW5ndGg7IGogPCBwb3NhcnJheXNbaW5kZXhdWzBdLmxlbmd0aCArIGxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKChsYXllckxlbmd0aFtqICsgMV0gYXMgYW55KS5nZXRMYXRMbmcoKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBob2xlLnB1c2godGVzdGFycmF5KTtcclxuICAgICAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gdGVzdGFycmF5ID0gW11cclxuICAgICAgaG9sZSA9IFtdO1xyXG4gICAgICBsZXQgbGVuZ3RoMiA9IDA7XHJcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NhcnJheXNbMF0ubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgdGVzdGFycmF5ID0gW107XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJQb2x5Z29uIGRyYWc6IFwiLCBwb3NhcnJheXNbMF1baW5kZXhdKTtcclxuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1bMF0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxlbmd0aDIgKz0gcG9zYXJyYXlzWzBdW2luZGV4IC0gMV0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgIGZvciAobGV0IGogPSBsZW5ndGgyOyBqIDwgcG9zYXJyYXlzWzBdW2luZGV4XS5sZW5ndGggKyBsZW5ndGgyOyBqKyspIHtcclxuICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XHJcbiAgICAgIH1cclxuICAgICAgbmV3UG9zLnB1c2goaG9sZSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiSG9sZSAyOiBcIiwgaG9sZSk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhcIk55ZSBwb3Npc2pvbmVyOiBcIiwgbmV3UG9zKTtcclxuICAgIGxheWVyTGVuZ3RoWzBdLnNldExhdExuZ3MobmV3UG9zKTtcclxuICB9XHJcbiAgLy8gY2hlY2sgdGhpc1xyXG4gIHByaXZhdGUgbWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XHJcbiAgICBjb25zdCBmZWF0dXJlQ29sbGVjdGlvbiA9IEZlYXR1cmVHcm91cC50b0dlb0pTT04oKSBhcyBhbnk7XHJcbiAgICBjb25zb2xlLmxvZyhcclxuICAgICAgXCJNYXJrZXJkcmFnZW5kIHBvbHlnb246IFwiLFxyXG4gICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlc1xyXG4gICAgKTtcclxuICAgIGlmIChmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJNYXJrZXJkcmFnZW5kOiBcIiwgZmVhdHVyZSk7XHJcbiAgICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xyXG4gICAgICAgICAgdGhpcy5raW5rcyA9IHRydWU7XHJcbiAgICAgICAgICBjb25zdCB1bmtpbmsgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0S2lua3MoZmVhdHVyZSk7XHJcbiAgICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoRmVhdHVyZUdyb3VwKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5raW5rOiBcIiwgdW5raW5rKTtcclxuICAgICAgICAgIHVua2luay5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFkZFBvbHlnb24oXHJcbiAgICAgICAgICAgICAgdGhpcy50dXJmSGVscGVyLmdldFR1cmZQb2x5Z29uKHBvbHlnb24pLFxyXG4gICAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAgIHRydWVcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmtpbmtzID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLmFkZFBvbHlnb24oZmVhdHVyZSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihcclxuICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlc1xyXG4gICAgICApO1xyXG4gICAgICBjb25zb2xlLmxvZyhcIk1hcmtlcmRyYWdlbmQ6IFwiLCBmZWF0dXJlKTtcclxuICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xyXG4gICAgICAgIHRoaXMua2lua3MgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IHVua2luayA9IHRoaXMudHVyZkhlbHBlci5nZXRLaW5rcyhmZWF0dXJlKTtcclxuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJVbmtpbms6IFwiLCB1bmtpbmspO1xyXG4gICAgICAgIGxldCB0ZXN0Q29vcmQgPSBbXVxyXG4gICAgICAgIHVua2luay5mb3JFYWNoKHBvbHlnb24gPT4ge1xyXG4gICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKFxyXG4gICAgICAgICAgICB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24ocG9seWdvbiksXHJcbiAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIHRoaXMuYWRkUG9seWdvbih0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKHRlc3RDb29yZCksIGZhbHNlLCB0cnVlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xyXG4gICAgICAgIHRoaXMua2lua3MgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmFkZFBvbHlnb24oZmVhdHVyZSwgZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKFxyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzXHJcbiAgICApO1xyXG4gIH1cclxuICAvLyBmaW5lLCBjaGVjayB0aGUgcmV0dXJuZWQgdHlwZVxyXG4gIHByaXZhdGUgZ2V0TGF0TG5nc0Zyb21Kc29uKFxyXG4gICAgZmVhdHVyZTogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPlxyXG4gICk6IElMYXRMbmdbXVtdIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZ2V0TGF0TG5nc0Zyb21Kc29uOiBcIiwgZmVhdHVyZSk7XHJcbiAgICBsZXQgY29vcmQ7XHJcbiAgICBpZiAoZmVhdHVyZSkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGggPiAxICYmXHJcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS50eXBlID09PSBcIk11bHRpUG9seWdvblwiXHJcbiAgICAgICkge1xyXG4gICAgICAgIGNvb3JkID0gTC5HZW9KU09OLmNvb3Jkc1RvTGF0TG5ncyhmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdWzBdKTtcclxuICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdLmxlbmd0aCA+IDEgJiZcclxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT09IFwiUG9seWdvblwiXHJcbiAgICAgICkge1xyXG4gICAgICAgIGNvb3JkID0gTC5HZW9KU09OLmNvb3Jkc1RvTGF0TG5ncyhmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29vcmQ7XHJcbiAgfVxyXG5cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSB1bmlvblBvbHlnb25zKFxyXG4gICAgbGF5ZXJzLFxyXG4gICAgbGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPixcclxuICAgIHBvbHlnb25GZWF0dXJlXHJcbiAgKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInVuaW9uUG9seWdvbnNcIiwgbGF5ZXJzLCBsYXRsbmdzLCBwb2x5Z29uRmVhdHVyZSk7XHJcblxyXG4gICAgbGV0IGFkZE5ldyA9IGxhdGxuZ3M7XHJcbiAgICBsYXllcnMuZm9yRWFjaCgoZmVhdHVyZUdyb3VwLCBpKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpO1xyXG4gICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdO1xyXG4gICAgICBjb25zdCBwb2x5ID0gdGhpcy5nZXRMYXRMbmdzRnJvbUpzb24obGF5ZXIpO1xyXG4gICAgICBjb25zdCB1bmlvbiA9IHRoaXMudHVyZkhlbHBlci51bmlvbihhZGROZXcsIHBvbHlnb25GZWF0dXJlW2ldKTsgLy8gQ2hlY2sgZm9yIG11bHRpcG9seWdvbnNcclxuICAgICAgLy8gTmVlZHMgYSBjbGVhbnVwIGZvciB0aGUgbmV3IHZlcnNpb25cclxuICAgICAgdGhpcy5kZWxldGVQb2x5Z29uT25NZXJnZShwb2x5KTtcclxuICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICAgIGFkZE5ldyA9IHVuaW9uO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbmV3TGF0bG5nczogRmVhdHVyZTxQb2x5Z29uIHwgTXVsdGlQb2x5Z29uPiA9IGFkZE5ldzsgLy8gVHJlbmdlciBrYW5za2plIHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbiggYWRkTmV3KTtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKG5ld0xhdGxuZ3MsIHRydWUpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXAoZmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xyXG4gICAgY29uc29sZS5sb2coXCJyZW1vdmVGZWF0dXJlR3JvdXBcIiwgZmVhdHVyZUdyb3VwKTtcclxuXHJcbiAgICBmZWF0dXJlR3JvdXAuY2xlYXJMYXllcnMoKTtcclxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMgPSB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZpbHRlcihcclxuICAgICAgZmVhdHVyZUdyb3VwcyA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXBcclxuICAgICk7XHJcbiAgICAvLyB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XHJcbiAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xyXG4gIH1cclxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXHJcbiAgcHJpdmF0ZSByZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcclxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZVwiLCBmZWF0dXJlR3JvdXApO1xyXG5cclxuICAgIGNvbnN0IG5ld0FycmF5ID0gW107XHJcbiAgICBpZiAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdKSB7XHJcbiAgICAgIGNvbnN0IHBvbHlnb24gPSAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueSkuZ2V0TGF0TG5ncygpWzBdO1xyXG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlLmZvckVhY2godiA9PiB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgdi5wb2x5Z29uLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF0udG9TdHJpbmcoKSAmJlxyXG4gICAgICAgICAgdi5wb2x5Z29uWzBdLnRvU3RyaW5nKCkgPT09IHBvbHlnb25bMF1bMF0udG9TdHJpbmcoKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgdi5wb2x5Z29uID0gcG9seWdvbjtcclxuICAgICAgICAgIG5ld0FycmF5LnB1c2godik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICB2LnBvbHlnb24udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXS50b1N0cmluZygpICYmXHJcbiAgICAgICAgICB2LnBvbHlnb25bMF0udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXVswXS50b1N0cmluZygpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBuZXdBcnJheS5wdXNoKHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIGZlYXR1cmVHcm91cC5jbGVhckxheWVycygpO1xyXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5maWx0ZXIoXHJcbiAgICAgICAgZmVhdHVyZUdyb3VwcyA9PiBmZWF0dXJlR3JvdXBzICE9PSBmZWF0dXJlR3JvdXBcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKGZlYXR1cmVHcm91cCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vIGZpbmUgdW50aWwgcmVmYWN0b3JpbmdcclxuICBwcml2YXRlIGRlbGV0ZVBvbHlnb25Pbk1lcmdlKHBvbHlnb24pIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZGVsZXRlUG9seWdvbk9uTWVyZ2VcIiwgcG9seWdvbik7XHJcbiAgICBsZXQgcG9seWdvbjIgPSBbXTtcclxuICAgIGlmICh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSBmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0gYXMgYW55O1xyXG4gICAgICAgIGNvbnN0IGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKClbMF07XHJcbiAgICAgICAgcG9seWdvbjIgPSBbLi4ubGF0bG5nc1swXV07XHJcbiAgICAgICAgaWYgKGxhdGxuZ3NbMF1bMF0gIT09IGxhdGxuZ3NbMF1bbGF0bG5nc1swXS5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgcG9seWdvbjIucHVzaChsYXRsbmdzWzBdWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZXF1YWxzID0gdGhpcy5wb2x5Z29uQXJyYXlFcXVhbHNNZXJnZShwb2x5Z29uMiwgcG9seWdvbik7XHJcblxyXG4gICAgICAgIGlmIChlcXVhbHMpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVFVQUxTXCIsIHBvbHlnb24pO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlKGZlYXR1cmVHcm91cCk7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seWdvbik7XHJcbiAgICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVUcmFzaGNhbihwb2x5Z29uKTtcclxuICAgICAgICAgIC8vIHRoaXMudXBkYXRlUG9seWdvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFsc01lcmdlKHBvbHkxOiBhbnlbXSwgcG9seTI6IGFueVtdKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gcG9seTEudG9TdHJpbmcoKSA9PT0gcG9seTIudG9TdHJpbmcoKTtcclxuICB9XHJcbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcclxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFscyhwb2x5MTogYW55W10sIHBvbHkyOiBhbnlbXSk6IGJvb2xlYW4ge1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJwb2x5Z29uQXJyYXlFcXVhbHNcIiwgcG9seTEsIHBvbHkyKTtcclxuXHJcbiAgICBpZiAocG9seTFbMF1bMF0pIHtcclxuICAgICAgaWYgKCFwb2x5MVswXVswXS5lcXVhbHMocG9seTJbMF1bMF0pKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoIXBvbHkxWzBdLmVxdWFscyhwb2x5MlswXSkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChwb2x5MS5sZW5ndGggIT09IHBvbHkyLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgLy8gZmluZVxyXG4gIHByaXZhdGUgc2V0TGVhZmxldE1hcEV2ZW50cyhcclxuICAgIGVuYWJsZURyYWdnaW5nOiBib29sZWFuLFxyXG4gICAgZW5hYmxlRG91YmxlQ2xpY2tab29tOiBib29sZWFuLFxyXG4gICAgZW5hYmxlU2Nyb2xsV2hlZWxab29tOiBib29sZWFuXHJcbiAgKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInNldExlYWZsZXRNYXBFdmVudHNcIiwgZW5hYmxlRHJhZ2dpbmcsIGVuYWJsZURvdWJsZUNsaWNrWm9vbSwgZW5hYmxlU2Nyb2xsV2hlZWxab29tKTtcclxuXHJcbiAgICBlbmFibGVEcmFnZ2luZyA/IHRoaXMubWFwLmRyYWdnaW5nLmVuYWJsZSgpIDogdGhpcy5tYXAuZHJhZ2dpbmcuZGlzYWJsZSgpO1xyXG4gICAgZW5hYmxlRG91YmxlQ2xpY2tab29tXHJcbiAgICAgID8gdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmVuYWJsZSgpXHJcbiAgICAgIDogdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmRpc2FibGUoKTtcclxuICAgIGVuYWJsZVNjcm9sbFdoZWVsWm9vbVxyXG4gICAgICA/IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5lbmFibGUoKVxyXG4gICAgICA6IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XHJcbiAgfVxyXG4gIC8vIGZpbmVcclxuICBzZXREcmF3TW9kZShtb2RlOiBEcmF3TW9kZSkge1xyXG4gICAgY29uc29sZS5sb2coXCJzZXREcmF3TW9kZVwiLCB0aGlzLm1hcCk7XHJcbiAgICB0aGlzLmRyYXdNb2RlU3ViamVjdC5uZXh0KG1vZGUpO1xyXG4gICAgaWYgKCEhdGhpcy5tYXApIHtcclxuICAgICAgbGV0IGlzQWN0aXZlRHJhd01vZGUgPSB0cnVlO1xyXG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICBjYXNlIERyYXdNb2RlLk9mZjpcclxuICAgICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhcclxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXHJcbiAgICAgICAgICAgIFwiY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkXCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50cyhmYWxzZSk7XHJcbiAgICAgICAgICB0aGlzLnN0b3BEcmF3KCk7XHJcbiAgICAgICAgICB0aGlzLnRyYWNlci5zZXRTdHlsZSh7XHJcbiAgICAgICAgICAgIGNvbG9yOiBcIlwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyh0cnVlLCB0cnVlLCB0cnVlKTtcclxuICAgICAgICAgIGlzQWN0aXZlRHJhd01vZGUgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgRHJhd01vZGUuQWRkOlxyXG4gICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKFxyXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcclxuICAgICAgICAgICAgXCJjcm9zc2hhaXItY3Vyc29yLWVuYWJsZWRcIlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMuZXZlbnRzKHRydWUpO1xyXG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xyXG4gICAgICAgICAgICBjb2xvcjogZGVmYXVsdENvbmZpZy5wb2x5TGluZU9wdGlvbnMuY29sb3JcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5zZXRMZWFmbGV0TWFwRXZlbnRzKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdDpcclxuICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhcclxuICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCksXHJcbiAgICAgICAgICAgIFwiY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkXCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLmV2ZW50cyh0cnVlKTtcclxuICAgICAgICAgIHRoaXMudHJhY2VyLnNldFN0eWxlKHtcclxuICAgICAgICAgICAgY29sb3I6IFwiI0Q5NDYwRlwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyhmYWxzZSwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaXNBY3RpdmVEcmF3TW9kZSkge1xyXG4gICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldEZyZWVEcmF3TW9kZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIG1vZGVDaGFuZ2UobW9kZTogRHJhd01vZGUpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUobW9kZSk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcclxuICBkcmF3TW9kZUNsaWNrKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25EcmF3U3RhdGVzLmlzRnJlZURyYXdNb2RlKSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XHJcbiAgICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldEZyZWVEcmF3TW9kZSgpO1xyXG4gICAgICB0aGlzLnNldERyYXdNb2RlKERyYXdNb2RlLkFkZCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcclxuICBmcmVlZHJhd01lbnVDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuQWRkKTtcclxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zYXZlQ3VycmVudFN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXHJcbiAgc3VidHJhY3RDbGljaygpOiB2b2lkIHtcclxuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuU3VidHJhY3QpO1xyXG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xyXG4gIH1cclxuICAvLyBmaW5lXHJcbiAgcHJpdmF0ZSByZXNldFRyYWNrZXIoKSB7XHJcbiAgICB0aGlzLnRyYWNlci5zZXRMYXRMbmdzKFtbMCwgMF1dKTtcclxuICB9XHJcblxyXG4gIHRvZ2dsZU1hcmtlck1lbnUoKTogdm9pZCB7XHJcbiAgICBhbGVydChcIm9wZW4gbWVudVwiKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBnZXRIdG1sQ29udGVudChjYWxsQmFjazogRnVuY3Rpb24pOiBIVE1MRWxlbWVudCB7XHJcbiAgICBjb25zdCBjb21wID0gdGhpcy5wb3B1cEdlbmVyYXRvci5nZW5lcmF0ZUFsdGVyUG9wdXAoKTtcclxuICAgIGNvbXAuaW5zdGFuY2UuYmJveENsaWNrZWQuc3Vic2NyaWJlKGUgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZyhcImJib3ggY2xpY2tlZFwiLCBlKTtcclxuICAgICAgY2FsbEJhY2soZSk7XHJcbiAgICB9KTtcclxuICAgIGNvbXAuaW5zdGFuY2Uuc2ltcGx5ZmlDbGlja2VkLnN1YnNjcmliZShlID0+IHtcclxuICAgICAgY29uc29sZS5sb2coXCJzaW1wbHlmaSBjbGlja2VkXCIsIGUpO1xyXG4gICAgICBjYWxsQmFjayhlKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvbXAubG9jYXRpb24ubmF0aXZlRWxlbWVudDtcclxuICB9XHJcbiAgcHJpdmF0ZSBjb252ZXJ0VG9Cb3VuZHNQb2x5Z29uKFxyXG4gICAgbGF0bG5nczogSUxhdExuZ1tdLFxyXG4gICAgYWRkTWlkcG9pbnRNYXJrZXJzOiBib29sZWFuID0gZmFsc2VcclxuICApIHtcclxuICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xyXG4gICAgY29uc3QgcG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXHJcbiAgICAgIHRoaXMuY29udmVydFRvQ29vcmRzKFtsYXRsbmdzXSlcclxuICAgICk7XHJcbiAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmNvbnZlcnRUb0JvdW5kaW5nQm94UG9seWdvbihcclxuICAgICAgcG9seWdvbixcclxuICAgICAgYWRkTWlkcG9pbnRNYXJrZXJzXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihuZXdQb2x5Z29uKSwgZmFsc2UpO1xyXG4gIH1cclxuICBwcml2YXRlIGNvbnZlcnRUb1NpbXBsaWZpZWRQb2x5Z29uKGxhdGxuZ3M6IElMYXRMbmdbXSkge1xyXG4gICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XHJcbiAgICBjb25zdCBuZXdQb2x5Z29uID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihcclxuICAgICAgdGhpcy5jb252ZXJ0VG9Db29yZHMoW2xhdGxuZ3NdKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihuZXdQb2x5Z29uKSwgdHJ1ZSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0TWFya2VySW5kZXgobGF0bG5nczogSUxhdExuZ1tdLCBwb3NpdGlvbjogTWFya2VyUG9zaXRpb24pOiBudW1iZXIge1xyXG4gICAgY29uc3QgYm91bmRzOiBMLkxhdExuZ0JvdW5kcyA9IFBvbHlEcmF3VXRpbC5nZXRCb3VuZHMoXHJcbiAgICAgIGxhdGxuZ3MsXHJcbiAgICAgIE1hdGguc3FydCgyKSAvIDJcclxuICAgICk7XHJcbiAgICBjb25zdCBjb21wYXNzID0gbmV3IENvbXBhc3MoXHJcbiAgICAgIGJvdW5kcy5nZXRTb3V0aCgpLFxyXG4gICAgICBib3VuZHMuZ2V0V2VzdCgpLFxyXG4gICAgICBib3VuZHMuZ2V0Tm9ydGgoKSxcclxuICAgICAgYm91bmRzLmdldEVhc3QoKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGNvbXBhc3NEaXJlY3Rpb24gPSBjb21wYXNzLmdldERpcmVjdGlvbihwb3NpdGlvbik7XHJcbiAgICBjb25zdCBsYXRMbmdQb2ludDogSUxhdExuZyA9IHtcclxuICAgICAgbGF0OiBjb21wYXNzRGlyZWN0aW9uLmxhdCxcclxuICAgICAgbG5nOiBjb21wYXNzRGlyZWN0aW9uLmxuZ1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHRhcmdldFBvaW50ID0gdGhpcy50dXJmSGVscGVyLmdldENvb3JkKGxhdExuZ1BvaW50KTtcclxuICAgIGNvbnN0IGZjID0gdGhpcy50dXJmSGVscGVyLmdldEZlYXR1cmVQb2ludENvbGxlY3Rpb24obGF0bG5ncyk7XHJcbiAgICBjb25zdCBuZWFyZXN0UG9pbnRJZHggPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TmVhcmVzdFBvaW50SW5kZXgoXHJcbiAgICAgIHRhcmdldFBvaW50LFxyXG4gICAgICBmYyBhcyBhbnlcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIG5lYXJlc3RQb2ludElkeDtcclxuICB9XHJcbn1cclxuIl19