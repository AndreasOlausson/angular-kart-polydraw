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
        });
        this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
        this.polygonInformation.activate();
        this.polygonInformation.setMoveMode();
        console.log(this.polygonInformation.polygonInformationStorage);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWRyYXcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9wb2x5ZHJhdy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdCLHNDQUFzQztBQUN0QyxPQUFPLEVBQWMsZUFBZSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNoRCxPQUFPLEVBQWtCLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNuRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQzs7Ozs7OztBQU1oRTtJQW9CRSx5QkFDVSxRQUEwQixFQUMxQixjQUF5QyxFQUN6QyxVQUE2QixFQUM3QixrQkFBNkMsRUFDN0MsYUFBbUM7UUFMN0MsaUJBK0JDO1FBOUJTLGFBQVEsR0FBUixRQUFRLENBQWtCO1FBQzFCLG1CQUFjLEdBQWQsY0FBYyxDQUEyQjtRQUN6QyxlQUFVLEdBQVYsVUFBVSxDQUFtQjtRQUM3Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTJCO1FBQzdDLGtC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Z0JBQWdCLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4RCxJQUFNLFdBQVcsR0FBWTtZQUMzQixHQUFHLEVBQUUsZ0JBQWdCLENBQUMsR0FBRztZQUN6QixHQUFHLEVBQUUsZ0JBQWdCLENBQUMsR0FBRztTQUMxQixDQUFDO1FBQ0YsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUQsSUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5RCxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUMxRCxXQUFXLEVBQ1gsRUFBUyxDQUNWLENBQUM7UUFFRixPQUFPLGVBQWUsQ0FBQztJQUN6QixDQUFDOztnQkFwL0JtQixnQkFBZ0I7Z0JBQ1YseUJBQXlCO2dCQUM3QixpQkFBaUI7Z0JBQ1QseUJBQXlCO2dCQUM5QixvQkFBb0I7OztJQXpCbEMsZUFBZTtRQUozQixVQUFVLENBQUM7WUFDVixVQUFVLEVBQUUsTUFBTTtTQUNuQixDQUFDO1FBQ0YsMkJBQTJCOzt5Q0FzQkwsZ0JBQWdCO1lBQ1YseUJBQXlCO1lBQzdCLGlCQUFpQjtZQUNULHlCQUF5QjtZQUM5QixvQkFBb0I7T0F6QmxDLGVBQWUsQ0EwZ0MzQjswQkE5aENEO0NBOGhDQyxBQTFnQ0QsSUEwZ0NDO1NBMWdDWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgT3B0aW9uYWwgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0ICogYXMgTCBmcm9tIFwibGVhZmxldFwiO1xuLy8gaW1wb3J0ICogYXMgdHVyZiBmcm9tIFwiQHR1cmYvdHVyZlwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgQmVoYXZpb3JTdWJqZWN0LCBTdWJqZWN0IH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IGZpbHRlciwgZGVib3VuY2VUaW1lLCB0YWtlVW50aWwgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7IEZlYXR1cmUsIFBvbHlnb24sIE11bHRpUG9seWdvbiB9IGZyb20gXCJAdHVyZi90dXJmXCI7XG5pbXBvcnQgeyBQb2x5U3RhdGVTZXJ2aWNlIH0gZnJvbSBcIi4vbWFwLXN0YXRlLnNlcnZpY2VcIjtcbmltcG9ydCB7IFR1cmZIZWxwZXJTZXJ2aWNlIH0gZnJvbSBcIi4vdHVyZi1oZWxwZXIuc2VydmljZVwiO1xuaW1wb3J0IHsgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSB9IGZyb20gXCIuL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZVwiO1xuaW1wb3J0IGRlZmF1bHRDb25maWcgZnJvbSBcIi4vcG9seWluZm8uanNvblwiO1xuaW1wb3J0IHsgSUxhdExuZywgUG9seWdvbkRyYXdTdGF0ZXMgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcbmltcG9ydCB7IENvbXBvbmVudEdlbmVyYXRlclNlcnZpY2UgfSBmcm9tIFwiLi9jb21wb25lbnQtZ2VuZXJhdGVyLnNlcnZpY2VcIjtcbmltcG9ydCB7IENvbXBhc3MsIFBvbHlEcmF3VXRpbCB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBNYXJrZXJQb3NpdGlvbiwgRHJhd01vZGUgfSBmcm9tIFwiLi9lbnVtc1wiO1xuaW1wb3J0IHsgTGVhZmxldEhlbHBlclNlcnZpY2UgfSBmcm9tIFwiLi9sZWFmbGV0LWhlbHBlci5zZXJ2aWNlXCI7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogXCJyb290XCJcbn0pXG4vLyBSZW5hbWUgLSBQb2x5RHJhd1NlcnZpY2VcbmV4cG9ydCBjbGFzcyBQb2x5RHJhd1NlcnZpY2Uge1xuICAvLyBEcmF3TW9kZXMsIGRldGVybWluZSBVSSBidXR0b25zIGV0Yy4uLlxuICBkcmF3TW9kZVN1YmplY3Q6IEJlaGF2aW9yU3ViamVjdDxEcmF3TW9kZT4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0PERyYXdNb2RlPihcbiAgICBEcmF3TW9kZS5PZmZcbiAgKTtcbiAgZHJhd01vZGUkOiBPYnNlcnZhYmxlPERyYXdNb2RlPiA9IHRoaXMuZHJhd01vZGVTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgbWluaW11bUZyZWVEcmF3Wm9vbUxldmVsOiBudW1iZXIgPSAxMjtcbiAgcHJpdmF0ZSBtYXA6IEwuTWFwO1xuXG4gIHByaXZhdGUgbWVyZ2VQb2x5Z29uczogYm9vbGVhbjtcbiAgcHJpdmF0ZSBraW5rczogYm9vbGVhbjtcbiAgLy8gYWRkIHRvIGNvbmZpZ1xuICBwcml2YXRlIGFycmF5T2ZGZWF0dXJlR3JvdXBzOiBMLkZlYXR1cmVHcm91cDxMLkxheWVyPltdID0gW107XG4gIHByaXZhdGUgdHJhY2VyOiBMLlBvbHlsaW5lID0ge30gYXMgYW55O1xuICAvLyBlbmQgYWRkIHRvIGNvbmZpZ1xuXG4gIHByaXZhdGUgbmdVbnN1YnNjcmliZSA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgY29uZmlnOiB0eXBlb2YgZGVmYXVsdENvbmZpZyA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBtYXBTdGF0ZTogUG9seVN0YXRlU2VydmljZSxcbiAgICBwcml2YXRlIHBvcHVwR2VuZXJhdG9yOiBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgdHVyZkhlbHBlcjogVHVyZkhlbHBlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSBwb2x5Z29uSW5mb3JtYXRpb246IFBvbHlnb25JbmZvcm1hdGlvblNlcnZpY2UsXG4gICAgcHJpdmF0ZSBsZWFmbGV0SGVscGVyOiBMZWFmbGV0SGVscGVyU2VydmljZVxuICApIHtcbiAgICB0aGlzLm1hcFN0YXRlLm1hcCQucGlwZShmaWx0ZXIobSA9PiBtICE9PSBudWxsKSkuc3Vic2NyaWJlKChtYXA6IEwuTWFwKSA9PiB7XG4gICAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICAgIGNvbnNvbGUubG9nKFwiS2FydGV0IGkgcG9seWRyYXc6IFwiLCB0aGlzLm1hcCk7XG4gICAgICBjb25zb2xlLmxvZyhcInByZSB0aGlzLmNvbmZpZ1wiLCB0aGlzLmNvbmZpZyk7XG4gICAgICB0aGlzLmNvbmZpZyA9IGRlZmF1bHRDb25maWc7XG4gICAgICBjb25zb2xlLmxvZyhcInRoaXMuY29uZmlnXCIsIHRoaXMuY29uZmlnKTtcbiAgICAgIHRoaXMuY29uZmlndXJhdGUoe30pO1xuICAgICAgY29uc29sZS5sb2coXCJhZnRlciB0aGlzLmNvbmZpZ1wiLCB0aGlzLmNvbmZpZyk7XG4gICAgICB0aGlzLnRyYWNlciA9IEwucG9seWxpbmUoW1swLCAwXV0sIHRoaXMuY29uZmlnLnBvbHlMaW5lT3B0aW9ucyk7XG4gICAgICBjb25zb2xlLmxvZyhcIlRyYWNlciBwaXBlOiBcIiwgdGhpcy50cmFjZXIpO1xuICAgICAgdGhpcy5pbml0UG9seURyYXcoKTtcbiAgICB9KTtcblxuICAgIHRoaXMubWFwU3RhdGUubWFwWm9vbUxldmVsJFxuICAgICAgLnBpcGUoZGVib3VuY2VUaW1lKDEwMCksIHRha2VVbnRpbCh0aGlzLm5nVW5zdWJzY3JpYmUpKVxuICAgICAgLnN1YnNjcmliZSgoem9vbTogbnVtYmVyKSA9PiB7XG4gICAgICAgIHRoaXMub25ab29tQ2hhbmdlKHpvb20pO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb24kLnN1YnNjcmliZShrID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiUG9seUluZm8gc3RhcnQ6IFwiLCBrKTtcbiAgICB9KTtcblxuICAgIC8vIFRPRE8gLSBsYWdlIGVuIGNvbmZpZyBvYnNlcnZhYmxlIGkgbWFwU3RhdGUgb2cgb3BwZGF0ZXIgdGhpcy5jb25maWcgbWVkIGRlblxuICB9XG4gIC8vIG5ld1xuICBjb25maWd1cmF0ZShjb25maWc6IE9iamVjdCk6IHZvaWQge1xuICAgIC8vIFRPRE8gaWYgY29uZmlnIGlzIHBhdGguLi5cbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4uZGVmYXVsdENvbmZpZywgLi4uY29uZmlnIH07XG5cbiAgICB0aGlzLm1lcmdlUG9seWdvbnMgPSB0aGlzLmNvbmZpZy5tZXJnZVBvbHlnb25zO1xuICAgIHRoaXMua2lua3MgPSB0aGlzLmNvbmZpZy5raW5rcztcbiAgfVxuXG4gIC8vIGZpbmVcbiAgY2xvc2VBbmRSZXNldCgpOiB2b2lkIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcImNsb3NlQW5kUmVzZXRcIik7XG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xuICAgIHRoaXMucmVtb3ZlQWxsRmVhdHVyZUdyb3VwcygpO1xuICB9XG5cbiAgLy8gbWFrZSByZWFkYWJsZVxuICBkZWxldGVQb2x5Z29uKHBvbHlnb246IElMYXRMbmdbXVtdKSB7XG4gICAgY29uc29sZS5sb2coXCJkZWxldGVQb2x5Z29uOiBcIiwgcG9seWdvbik7XG4gICAgaWYocG9seWdvbi5sZW5ndGggPiAxKSB7XG4gICAgICBwb2x5Z29uLmxlbmd0aCA9IDE7XG4gICAgfVxuICAgIGlmICh0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMuZm9yRWFjaChmZWF0dXJlR3JvdXAgPT4ge1xuICAgICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVHcm91cC5nZXRMYXllcnMoKVswXSBhcyBhbnk7XG4gICAgICAgIGNvbnN0IGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGxhdGxuZ3MubGVuZ3RoO1xuICAgICAgICAvLyAgPSBbXVxuICAgICAgICBjb25zb2xlLmxvZyhsYXRsbmdzKTtcbiAgICAgICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIGluZGV4KSA9PiB7XG4gICAgICAgICAgbGV0IHBvbHlnb24zO1xuICAgICAgICAgIGNvbnN0IHRlc3QgPSBbLi4ubGF0bG5nXTtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKGxhdGxuZyk7XG4gICAgICAgICAgaWYgKGxhdGxuZy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBpZiAobGF0bG5nWzBdWzBdICE9PSBsYXRsbmdbMF1bbGF0bG5nWzBdLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgICAgIHRlc3RbMF0ucHVzaChsYXRsbmdbMF1bMF0pO1xuICAgICAgICAgICAgICB9IFxuXG4gICAgICAgICAgICBwb2x5Z29uMyA9IFt0ZXN0WzBdXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGxhdGxuZ1swXSAhPT0gbGF0bG5nW2xhdGxuZy5sZW5ndGggLSAxXSkge1xuICAgICAgICAgICAgICB0ZXN0LnB1c2gobGF0bG5nWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvbHlnb24zID0gdGVzdDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlRlc3Q6IFwiLCBwb2x5Z29uMyk7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZyhwb2x5Z29uKTtcblxuICAgICAgICAgIGNvbnN0IGVxdWFscyA9IHRoaXMucG9seWdvbkFycmF5RXF1YWxzKHBvbHlnb24zLCBwb2x5Z29uKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImVxdWFsczogXCIsIGVxdWFscywgXCIgbGVuZ3RoOiBcIiwgbGVuZ3RoKTtcbiAgICAgICAgICBpZiAoZXF1YWxzICYmIGxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlVHJhc2hjYW4ocG9seWdvbik7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKCkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZXF1YWxzICYmIGxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmRlbGV0ZVRyYXNoQ2FuT25NdWx0aShbcG9seWdvbl0pO1xuICAgICAgICAgICAgbGF0bG5ncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgbGF5ZXIuc2V0TGF0TG5ncyhsYXRsbmdzKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKGZlYXR1cmVHcm91cCk7XG4gICAgICAgICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXllci50b0dlb0pTT04oKSwgZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgLy8gZmluZVxuICByZW1vdmVBbGxGZWF0dXJlR3JvdXBzKCkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwicmVtb3ZlQWxsRmVhdHVyZUdyb3Vwc1wiLCBudWxsKTtcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwcyA9PiB7XG4gICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXBzKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMgPSBbXTtcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucmVzZXQoKTtcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi51cGRhdGVQb2x5Z29ucygpO1xuICB9XG4gIC8vIGZpbmVcbiAgZ2V0RHJhd01vZGUoKTogRHJhd01vZGUge1xuICAgIC8vIGNvbnNvbGUubG9nKFwiZ2V0RHJhd01vZGVcIiwgbnVsbCk7XG4gICAgcmV0dXJuIHRoaXMuZHJhd01vZGVTdWJqZWN0LnZhbHVlO1xuICB9XG5cbiAgYWRkVmlrZW4ocG9seWdvbikge1xuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHBvbHlnb24sIHRydWUpO1xuICB9XG5cbiAgLy8gY2hlY2sgdGhpc1xuICBhZGRBdXRvUG9seWdvbihnZW9ncmFwaGljQm9yZGVyczogTC5MYXRMbmdbXVtdW10pOiB2b2lkIHtcbiAgICBnZW9ncmFwaGljQm9yZGVycy5mb3JFYWNoKGdyb3VwID0+IHtcbiAgICBjb25zdCBmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwID0gbmV3IEwuRmVhdHVyZUdyb3VwKCk7XG5cbiAgICBjb25zdCBwb2x5Z29uMiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXG4gICAgICB0aGlzLmNvbnZlcnRUb0Nvb3Jkcyhncm91cClcbiAgICApO1xuICAgIGNvbnNvbGUubG9nKHBvbHlnb24yKTtcbiAgICBjb25zdCBwb2x5Z29uID0gdGhpcy5nZXRQb2x5Z29uKHBvbHlnb24yKTtcblxuICAgIGZlYXR1cmVHcm91cC5hZGRMYXllcihwb2x5Z29uKTtcbiAgICBjb25zdCBtYXJrZXJMYXRsbmdzID0gcG9seWdvbi5nZXRMYXRMbmdzKCk7XG4gICAgY29uc29sZS5sb2coXCJtYXJrZXJzOiBcIiwgbWFya2VyTGF0bG5ncyk7XG4gICAgbWFya2VyTGF0bG5ncy5mb3JFYWNoKHBvbHlnb24gPT4ge1xuICAgICAgcG9seWdvbi5mb3JFYWNoKChwb2x5RWxlbWVudCwgaSkgPT4ge1xuICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuYWRkTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuYWRkSG9sZU1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkh1bGw6IFwiLCBwb2x5RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gdGhpcy5hZGRNYXJrZXIocG9seWdvblswXSwgZmVhdHVyZUdyb3VwKTtcbiAgICAgIC8vIFRPRE8gLSBIdmlzIHBvbHlnb24ubGVuZ3RoID4xLCBzw6UgaGFyIGRlbiBodWxsOiBlZ2VuIGFkZE1hcmtlciBmdW5rc2pvblxuICAgIH0pO1xuXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5wdXNoKGZlYXR1cmVHcm91cCk7XG4gICAgXG4gICAgfSk7XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uY3JlYXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZShcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHNcbiAgICApO1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0TW92ZU1vZGUoKTtcbiAgICBjb25zb2xlLmxvZyh0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5wb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKTtcbiAgfVxuXG4gIC8vIGlubmVow6VsbCBpIGlmJ2FyIGZseXR0YSB0aWxsIGVnbmEgbWV0b2RlclxuICBwcml2YXRlIGNvbnZlcnRUb0Nvb3JkcyhsYXRsbmdzOiBJTGF0TG5nW11bXSkge1xuICAgIGNvbnN0IGNvb3JkcyA9IFtdO1xuICAgIGNvbnNvbGUubG9nKGxhdGxuZ3MubGVuZ3RoLCBsYXRsbmdzKTtcbiAgICBpZiAobGF0bG5ncy5sZW5ndGggPiAxICYmIGxhdGxuZ3MubGVuZ3RoIDwgMykge1xuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBbXTtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSksXG4gICAgICAgIGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXS5sZW5ndGhcbiAgICAgICk7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG1heC1saW5lLWxlbmd0aFxuICAgICAgY29uc3Qgd2l0aGluID0gdGhpcy50dXJmSGVscGVyLmlzV2l0aGluKFxuICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbbGF0bG5ncy5sZW5ndGggLSAxXSksXG4gICAgICAgIEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMobGF0bG5nc1swXSlcbiAgICAgICk7XG4gICAgICBpZiAod2l0aGluKSB7XG4gICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgICAgICBjb29yZGluYXRlcy5wdXNoKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbikpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhdGxuZ3MuZm9yRWFjaChwb2x5Z29uID0+IHtcbiAgICAgICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKV0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPj0gMSkge1xuICAgICAgICBjb29yZHMucHVzaChjb29yZGluYXRlcyk7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcIldpdGhpbjEgXCIsIHdpdGhpbik7XG4gICAgfSBlbHNlIGlmIChsYXRsbmdzLmxlbmd0aCA+IDIpIHtcbiAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gW107XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDE7IGluZGV4IDwgbGF0bG5ncy5sZW5ndGggLSAxOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHdpdGhpbiA9IHRoaXMudHVyZkhlbHBlci5pc1dpdGhpbihcbiAgICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbaW5kZXhdKSxcbiAgICAgICAgICBMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbMF0pXG4gICAgICAgICk7XG4gICAgICAgIGlmICh3aXRoaW4pIHtcbiAgICAgICAgICBsYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XG4gICAgICAgICAgICBjb29yZGluYXRlcy5wdXNoKEwuR2VvSlNPTi5sYXRMbmdzVG9Db29yZHMocG9seWdvbikpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvb3Jkcy5wdXNoKGNvb3JkaW5hdGVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XG4gICAgICAgICAgICBjb29yZHMucHVzaChbTC5HZW9KU09OLmxhdExuZ3NUb0Nvb3Jkcyhwb2x5Z29uKV0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvb3Jkcy5wdXNoKFtMLkdlb0pTT04ubGF0TG5nc1RvQ29vcmRzKGxhdGxuZ3NbMF0pXSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGNvb3Jkcyk7XG4gICAgcmV0dXJuIGNvb3JkcztcbiAgfVxuXG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBpbml0UG9seURyYXcoKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJpbml0UG9seURyYXdcIiwgbnVsbCk7XG5cbiAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCk7XG4gICAgY29uc3QgZHJhd01vZGUgPSB0aGlzLmdldERyYXdNb2RlKCk7XG4gICAgaWYgKHRoaXMuY29uZmlnLnRvdWNoU3VwcG9ydCkge1xuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIGUgPT4ge1xuICAgICAgICBpZiAoZHJhd01vZGUgIT09IERyYXdNb2RlLk9mZikge1xuICAgICAgICAgIHRoaXMubW91c2VEb3duKGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCBlID0+IHtcbiAgICAgICAgaWYgKGRyYXdNb2RlICE9PSBEcmF3TW9kZS5PZmYpIHtcbiAgICAgICAgICB0aGlzLm1vdXNlVXBMZWF2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgZSA9PiB7XG4gICAgICAgIGlmIChkcmF3TW9kZSAhPT0gRHJhd01vZGUuT2ZmKSB7XG4gICAgICAgICAgdGhpcy5tb3VzZU1vdmUoZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcIk1hcCBpbml0OiBcIiwgdGhpcy5tYXApO1xuICAgIGNvbnNvbGUubG9nKFwiVHJhY2VyIGluaXQ6IFwiLCB0aGlzLnRyYWNlcik7XG4gICAgdGhpcy5tYXAuYWRkTGF5ZXIodGhpcy50cmFjZXIpO1xuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuT2ZmKTtcbiAgfVxuICAvLyBUZXN0IEwuTW91c2VFdmVudFxuICBwcml2YXRlIG1vdXNlRG93bihldmVudCkge1xuICAgIGNvbnNvbGUubG9nKFwibW91c2VEb3duXCIsIGV2ZW50KTtcblxuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9IG51bGwpIHtcbiAgICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW2V2ZW50LmxhdGxuZ10pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBsYXRsbmcgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKFtcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLFxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFlcbiAgICAgIF0pO1xuICAgICAgdGhpcy50cmFjZXIuc2V0TGF0TG5ncyhbbGF0bG5nXSk7XG4gICAgfVxuICAgIHRoaXMuc3RhcnREcmF3KCk7XG4gIH1cblxuICAvLyBUT0RPIGV2ZW50IHR5cGUsIGNyZWF0ZSBjb250YWluZXJQb2ludFRvTGF0TG5nLW1ldGhvZFxuICBwcml2YXRlIG1vdXNlTW92ZShldmVudCkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwibW91c2VNb3ZlXCIsIGV2ZW50KTtcblxuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9IG51bGwpIHtcbiAgICAgIHRoaXMudHJhY2VyLmFkZExhdExuZyhldmVudC5sYXRsbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBsYXRsbmcgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKFtcbiAgICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLFxuICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFlcbiAgICAgIF0pO1xuICAgICAgdGhpcy50cmFjZXIuYWRkTGF0TG5nKGxhdGxuZyk7XG4gICAgfVxuICB9XG5cbiAgLy8gZmluZVxuICBwcml2YXRlIG1vdXNlVXBMZWF2ZSgpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIm1vdXNlVXBMZWF2ZVwiLCBudWxsKTtcbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5kZWxldGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKCk7XG4gICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1EZWxldGUgdHJhc2hjYW5zXCIsIG51bGwpO1xuICAgIGNvbnN0IGdlb1BvczogRmVhdHVyZTxcbiAgICAgIFBvbHlnb24gfCBNdWx0aVBvbHlnb25cbiAgICA+ID0gdGhpcy50dXJmSGVscGVyLnR1cmZDb25jYXZlbWFuKHRoaXMudHJhY2VyLnRvR2VvSlNPTigpIGFzIGFueSk7XG4gICAgdGhpcy5zdG9wRHJhdygpO1xuICAgIHN3aXRjaCAodGhpcy5nZXREcmF3TW9kZSgpKSB7XG4gICAgICBjYXNlIERyYXdNb2RlLkFkZDpcbiAgICAgICAgdGhpcy5hZGRQb2x5Z29uKGdlb1BvcywgdHJ1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdDpcbiAgICAgICAgdGhpcy5zdWJ0cmFjdFBvbHlnb24oZ2VvUG9zKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5jcmVhdGVQb2x5Z29uSW5mb3JtYXRpb25TdG9yYWdlKFxuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwc1xuICAgICk7XG4gICAgLy8gY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1jcmVhdGUgdHJhc2hjYW5zXCIsIG51bGwpO1xuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBzdGFydERyYXcoKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJzdGFydERyYXdcIiwgbnVsbCk7XG5cbiAgICB0aGlzLmRyYXdTdGFydGVkRXZlbnRzKHRydWUpO1xuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBzdG9wRHJhdygpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcInN0b3BEcmF3XCIsIG51bGwpO1xuXG4gICAgdGhpcy5yZXNldFRyYWNrZXIoKTtcbiAgICB0aGlzLmRyYXdTdGFydGVkRXZlbnRzKGZhbHNlKTtcbiAgfVxuXG4gIHByaXZhdGUgb25ab29tQ2hhbmdlKHpvb21MZXZlbDogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gY29uc29sZS5sb2coXCJvblpvb21DaGFuZ2VcIiwgem9vbUxldmVsKTtcblxuICAgIGlmICh6b29tTGV2ZWwgPj0gdGhpcy5taW5pbXVtRnJlZURyYXdab29tTGV2ZWwpIHtcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25EcmF3U3RhdGVzLmNhblVzZVBvbHlEcmF3ID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkRyYXdTdGF0ZXMuY2FuVXNlUG9seURyYXcgPSBmYWxzZTtcbiAgICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNldE1vdmVNb2RlKCk7XG4gICAgfVxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcbiAgfVxuICAvLyBmaW5lXG4gIHByaXZhdGUgZHJhd1N0YXJ0ZWRFdmVudHMob25vZmY6IGJvb2xlYW4pIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcImRyYXdTdGFydGVkRXZlbnRzXCIsIG9ub2ZmKTtcblxuICAgIGNvbnN0IG9ub3JvZmYgPSBvbm9mZiA/IFwib25cIiA6IFwib2ZmXCI7XG5cbiAgICB0aGlzLm1hcFtvbm9yb2ZmXShcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZSwgdGhpcyk7XG4gICAgdGhpcy5tYXBbb25vcm9mZl0oXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcExlYXZlLCB0aGlzKTtcbiAgfVxuICAvLyBPbiBob2xkXG4gIHByaXZhdGUgc3VidHJhY3RQb2x5Z29uKGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcbiAgICB0aGlzLnN1YnRyYWN0KGxhdGxuZ3MpO1xuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBhZGRQb2x5Z29uKFxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXG4gICAgc2ltcGxpZnk6IGJvb2xlYW4sXG4gICAgbm9NZXJnZTogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgXCJhZGRQb2x5Z29uXCIsXG4gICAgICBsYXRsbmdzLFxuICAgICAgc2ltcGxpZnksXG4gICAgICBub01lcmdlLFxuICAgICAgdGhpcy5raW5rcyxcbiAgICAgIHRoaXMuY29uZmlnXG4gICAgKTtcblxuICAgIGlmIChcbiAgICAgIHRoaXMubWVyZ2VQb2x5Z29ucyAmJlxuICAgICAgIW5vTWVyZ2UgJiZcbiAgICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCAmJlxuICAgICAgIXRoaXMua2lua3NcbiAgICApIHtcbiAgICAgIHRoaXMubWVyZ2UobGF0bG5ncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKGxhdGxuZ3MsIHNpbXBsaWZ5KTtcbiAgICB9XG4gIH1cbiAgLy8gZmluZVxuICBwcml2YXRlIGFkZFBvbHlnb25MYXllcihcbiAgICBsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+LFxuICAgIHNpbXBsaWZ5OiBib29sZWFuXG4gICkge1xuICAgIGNvbnN0IGZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXAgPSBuZXcgTC5GZWF0dXJlR3JvdXAoKTtcblxuICAgIGNvbnN0IGxhdExuZ3MgPSBzaW1wbGlmeSA/IHRoaXMudHVyZkhlbHBlci5nZXRTaW1wbGlmaWVkKGxhdGxuZ3MpIDogbGF0bG5ncztcbiAgICBjb25zb2xlLmxvZyhcIkFkZFBvbHlnb25MYXllcjogXCIsIGxhdExuZ3MpO1xuICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLmdldFBvbHlnb24obGF0TG5ncyk7XG4gICAgZmVhdHVyZUdyb3VwLmFkZExheWVyKHBvbHlnb24pO1xuICAgIGNvbnNvbGUubG9nKHBvbHlnb24pO1xuICAgIGNvbnN0IG1hcmtlckxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcbiAgICBtYXJrZXJMYXRsbmdzLmZvckVhY2gocG9seWdvbiA9PiB7XG4gICAgICBwb2x5Z29uLmZvckVhY2goKHBvbHlFbGVtZW50OiBJTGF0TG5nW10sIGk6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuYWRkTWFya2VyKHBvbHlFbGVtZW50LCBmZWF0dXJlR3JvdXApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuYWRkSG9sZU1hcmtlcihwb2x5RWxlbWVudCwgZmVhdHVyZUdyb3VwKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkh1bGw6IFwiLCBwb2x5RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gdGhpcy5hZGRNYXJrZXIocG9seWdvblswXSwgZmVhdHVyZUdyb3VwKTtcbiAgICAgIC8vIFRPRE8gLSBIdmlzIHBvbHlnb24ubGVuZ3RoID4xLCBzw6UgaGFyIGRlbiBodWxsOiBlZ2VuIGFkZE1hcmtlciBmdW5rc2pvblxuICAgIH0pO1xuXG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5wdXNoKGZlYXR1cmVHcm91cCk7XG4gICAgY29uc29sZS5sb2coXCJBcnJheTogXCIsIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMpO1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xuXG4gICAgZmVhdHVyZUdyb3VwLm9uKFwiY2xpY2tcIiwgZSA9PiB7XG4gICAgICB0aGlzLnBvbHlnb25DbGlja2VkKGUsIGxhdExuZ3MpO1xuICAgIH0pO1xuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBwb2x5Z29uQ2xpY2tlZChlOiBhbnksIHBvbHk6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcbiAgICBjb25zdCBuZXdQb2ludCA9IGUubGF0bG5nO1xuICAgIGlmIChwb2x5Lmdlb21ldHJ5LnR5cGUgPT09IFwiTXVsdGlQb2x5Z29uXCIpIHtcbiAgICAgIGNvbnN0IG5ld1BvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIuaW5qZWN0UG9pbnRUb1BvbHlnb24ocG9seSwgW1xuICAgICAgICBuZXdQb2ludC5sbmcsXG4gICAgICAgIG5ld1BvaW50LmxhdFxuICAgICAgXSk7XG4gICAgICB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24ocG9seSkpO1xuICAgICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobmV3UG9seWdvbiwgZmFsc2UpO1xuICAgIH1cbiAgfVxuICAvLyBmaW5lXG4gIHByaXZhdGUgZ2V0UG9seWdvbihsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XG4gICAgY29uc29sZS5sb2coXCJnZXRQb2x5Z29uczogXCIsIGxhdGxuZ3MpO1xuICAgIGNvbnN0IHBvbHlnb24gPSBMLkdlb0pTT04uZ2VvbWV0cnlUb0xheWVyKGxhdGxuZ3MpIGFzIGFueTtcblxuICAgIHBvbHlnb24uc2V0U3R5bGUodGhpcy5jb25maWcucG9seWdvbk9wdGlvbnMpO1xuICAgIHJldHVybiBwb2x5Z29uO1xuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBtZXJnZShsYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+KSB7XG4gICAgY29uc29sZS5sb2coXCJtZXJnZVwiLCBsYXRsbmdzKTtcbiAgICBjb25zdCBwb2x5Z29uRmVhdHVyZSA9IFtdO1xuICAgIGNvbnN0IG5ld0FycmF5OiBMLkZlYXR1cmVHcm91cFtdID0gW107XG4gICAgbGV0IHBvbHlJbnRlcnNlY3Rpb24gPSBmYWxzZTtcbiAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZvckVhY2goZmVhdHVyZUdyb3VwID0+IHtcbiAgICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gZmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcbiAgICAgIGNvbnNvbGUubG9nKFwiTWVyZ2VyOiBcIiwgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0pO1xuICAgICAgaWYgKGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICBjb25zdCBmZWF0dXJlID0gdGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbihbZWxlbWVudF0pO1xuICAgICAgICAgIHBvbHlJbnRlcnNlY3Rpb24gPSB0aGlzLnR1cmZIZWxwZXIucG9seWdvbkludGVyc2VjdChmZWF0dXJlLCBsYXRsbmdzKTtcbiAgICAgICAgICBpZiAocG9seUludGVyc2VjdGlvbikge1xuICAgICAgICAgICAgbmV3QXJyYXkucHVzaChmZWF0dXJlR3JvdXApO1xuICAgICAgICAgICAgcG9seWdvbkZlYXR1cmUucHVzaChmZWF0dXJlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihcbiAgICAgICAgICBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlc1swXVxuICAgICAgICApO1xuICAgICAgICBwb2x5SW50ZXJzZWN0aW9uID0gdGhpcy50dXJmSGVscGVyLnBvbHlnb25JbnRlcnNlY3QoZmVhdHVyZSwgbGF0bG5ncyk7XG4gICAgICAgIGlmIChwb2x5SW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgbmV3QXJyYXkucHVzaChmZWF0dXJlR3JvdXApO1xuICAgICAgICAgIHBvbHlnb25GZWF0dXJlLnB1c2goZmVhdHVyZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZyhuZXdBcnJheSk7XG4gICAgaWYgKG5ld0FycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMudW5pb25Qb2x5Z29ucyhuZXdBcnJheSwgbGF0bG5ncywgcG9seWdvbkZlYXR1cmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFkZFBvbHlnb25MYXllcihsYXRsbmdzLCB0cnVlKTtcbiAgICB9XG4gIH1cbiAgLy8gbmV4dFxuICBwcml2YXRlIHN1YnRyYWN0KGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4pIHtcbiAgICBsZXQgYWRkSG9sZSA9IGxhdGxuZ3M7XG4gICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XG4gICAgICBjb25zdCBmZWF0dXJlQ29sbGVjdGlvbiA9IGZlYXR1cmVHcm91cC50b0dlb0pTT04oKSBhcyBhbnk7XG4gICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdO1xuICAgICAgY29uc3QgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24oXG4gICAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdXG4gICAgICApO1xuICAgICAgY29uc3QgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5wb2x5Z29uRGlmZmVyZW5jZShmZWF0dXJlLCBhZGRIb2xlKTtcbiAgICAgIHRoaXMuZGVsZXRlUG9seWdvbihwb2x5KTtcbiAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXApO1xuICAgICAgYWRkSG9sZSA9IG5ld1BvbHlnb247XG4gICAgfSk7XG5cbiAgICBjb25zdCBuZXdMYXRsbmdzOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+ID0gYWRkSG9sZTtcbiAgICBjb25zdCBjb29yZHMgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0Q29vcmRzKG5ld0xhdGxuZ3MpO1xuICAgIGNvb3Jkcy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW3ZhbHVlXSksIHRydWUpO1xuICAgIH0pO1xuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBldmVudHMob25vZmY6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBvbm9yb2ZmID0gb25vZmYgPyBcIm9uXCIgOiBcIm9mZlwiO1xuICAgIHRoaXMubWFwW29ub3JvZmZdKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VEb3duLCB0aGlzKTtcbiAgfVxuICAvLyBmaW5lLCBUT0RPOiBpZiBzcGVjaWFsIG1hcmtlcnNcbiAgcHJpdmF0ZSBhZGRNYXJrZXIobGF0bG5nczogSUxhdExuZ1tdLCBGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XG4gICAgY29uc3QgbWVudU1hcmtlcklkeCA9IHRoaXMuZ2V0TWFya2VySW5kZXgoXG4gICAgICBsYXRsbmdzLFxuICAgICAgdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5wb3NpdGlvblxuICAgICk7XG4gICAgY29uc3QgZGVsZXRlTWFya2VySWR4ID0gdGhpcy5nZXRNYXJrZXJJbmRleChcbiAgICAgIGxhdGxuZ3MsXG4gICAgICB0aGlzLmNvbmZpZy5tYXJrZXJzLm1hcmtlckRlbGV0ZUljb24ucG9zaXRpb25cbiAgICApO1xuXG4gICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIGkpID0+IHtcbiAgICAgIGxldCBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VySWNvbi5zdHlsZUNsYXNzZXM7XG4gICAgICAvKiAgIGlmIChpID09PSBtZW51TWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyTWVudUljb24uc3R5bGVDbGFzc2VzO1xuICAgICAgfVxuICAgICAgaWYgKGkgPT09IGRlbGV0ZU1hcmtlcklkeCAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xuICAgICAgICBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VyRGVsZXRlSWNvbi5zdHlsZUNsYXNzZXM7XG4gICAgICB9ICovXG4gICAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5NYXJrZXIobGF0bG5nLCB7XG4gICAgICAgIGljb246IHRoaXMuY3JlYXRlRGl2SWNvbihpY29uQ2xhc3NlcyksXG4gICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgdGl0bGU6IGkudG9TdHJpbmcoKVxuICAgICAgfSk7XG4gICAgICBGZWF0dXJlR3JvdXAuYWRkTGF5ZXIobWFya2VyKS5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkZlYXR1cmVHcm91cDogXCIsIEZlYXR1cmVHcm91cCk7XG4gICAgICBtYXJrZXIub24oXCJkcmFnXCIsIGUgPT4ge1xuICAgICAgICB0aGlzLm1hcmtlckRyYWcoRmVhdHVyZUdyb3VwKTtcbiAgICAgIH0pO1xuICAgICAgbWFya2VyLm9uKFwiZHJhZ2VuZFwiLCBlID0+IHtcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnRW5kKEZlYXR1cmVHcm91cCk7XG4gICAgICB9KTtcbiAgICAgIGlmIChpID09PSBtZW51TWFya2VySWR4ICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xuICAgICAgICAvLyBtYXJrZXIuYmluZFBvcHVwKFxuICAgICAgICAvLyAgIHRoaXMuZ2V0SHRtbENvbnRlbnQoZSA9PiB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImNsaWNrZWQgb25cIiwgZS50YXJnZXQpO1xuICAgICAgICAvLyAgIH0pXG4gICAgICAgIC8vICk7XG4gICAgICAgIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xuICAgICAgICAgIHRoaXMuY29udmVydFRvQm91bmRzUG9seWdvbihsYXRsbmdzLCB0cnVlKTtcbiAgICAgICAgICAvLyB0aGlzLmNvbnZlcnRUb1NpbXBsaWZpZWRQb2x5Z29uKGxhdGxuZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChpID09PSBkZWxldGVNYXJrZXJJZHggJiYgdGhpcy5jb25maWcubWFya2Vycy5kZWxldGUpIHtcbiAgICAgICAgbWFya2VyLm9uKFwiY2xpY2tcIiwgZSA9PiB7XG4gICAgICAgICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRIb2xlTWFya2VyKGxhdGxuZ3M6IElMYXRMbmdbXSwgRmVhdHVyZUdyb3VwOiBMLkZlYXR1cmVHcm91cCkge1xuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBpKSA9PiB7XG4gICAgICBjb25zdCBpY29uQ2xhc3NlcyA9IHRoaXMuY29uZmlnLm1hcmtlcnMubWFya2VySWNvbi5zdHlsZUNsYXNzZXM7XG4gICAgICAvKiAgaWYgKGkgPT09IDAgJiYgdGhpcy5jb25maWcubWFya2Vycy5tZW51KSB7XG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJNZW51SWNvbi5zdHlsZUNsYXNzZXM7XG4gICAgICB9XG5cbiAgICAgIC8vVE9ETy0gbGVnZyB0aWwgZmlsbCBpY29uXG4gICAgICBpZiAoaSA9PT0gbGF0bG5ncy5sZW5ndGggLSAxICYmIHRoaXMuY29uZmlnLm1hcmtlcnMuZGVsZXRlKSB7XG4gICAgICAgIGljb25DbGFzc2VzID0gdGhpcy5jb25maWcubWFya2Vycy5tYXJrZXJEZWxldGVJY29uLnN0eWxlQ2xhc3NlcztcbiAgICAgIH0gKi9cbiAgICAgIGNvbnN0IG1hcmtlciA9IG5ldyBMLk1hcmtlcihsYXRsbmcsIHtcbiAgICAgICAgaWNvbjogdGhpcy5jcmVhdGVEaXZJY29uKGljb25DbGFzc2VzKSxcbiAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgICB0aXRsZTogaS50b1N0cmluZygpXG4gICAgICB9KTtcbiAgICAgIEZlYXR1cmVHcm91cC5hZGRMYXllcihtYXJrZXIpLmFkZFRvKHRoaXMubWFwKTtcblxuICAgICAgbWFya2VyLm9uKFwiZHJhZ1wiLCBlID0+IHtcbiAgICAgICAgdGhpcy5tYXJrZXJEcmFnKEZlYXR1cmVHcm91cCk7XG4gICAgICB9KTtcbiAgICAgIG1hcmtlci5vbihcImRyYWdlbmRcIiwgZSA9PiB7XG4gICAgICAgIHRoaXMubWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXApO1xuICAgICAgfSk7XG4gICAgICAvKiAgIGlmIChpID09PSAwICYmIHRoaXMuY29uZmlnLm1hcmtlcnMubWVudSkge1xuICAgICAgICBtYXJrZXIuYmluZFBvcHVwKHRoaXMuZ2V0SHRtbENvbnRlbnQoKGUpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImNsaWNrZWQgb25cIiwgZS50YXJnZXQpO1xuICAgICAgICB9KSk7XG4gICAgICAgIC8vIG1hcmtlci5vbihcImNsaWNrXCIsIGUgPT4ge1xuICAgICAgICAvLyAgIHRoaXMudG9nZ2xlTWFya2VyTWVudSgpO1xuICAgICAgICAvLyB9KVxuICAgICAgfVxuICAgICAgaWYgKGkgPT09IGxhdGxuZ3MubGVuZ3RoIC0gMSAmJiB0aGlzLmNvbmZpZy5tYXJrZXJzLmRlbGV0ZSkge1xuICAgICAgICBtYXJrZXIub24oXCJjbGlja1wiLCBlID0+IHtcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24oW2xhdGxuZ3NdKTtcbiAgICAgICAgfSk7XG4gICAgICB9ICovXG4gICAgfSk7XG4gIH1cbiAgcHJpdmF0ZSBjcmVhdGVEaXZJY29uKGNsYXNzTmFtZXM6IHN0cmluZ1tdKTogTC5EaXZJY29uIHtcbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcy5qb2luKFwiIFwiKTtcbiAgICBjb25zdCBpY29uID0gTC5kaXZJY29uKHsgY2xhc3NOYW1lOiBjbGFzc2VzIH0pO1xuICAgIHJldHVybiBpY29uO1xuICB9XG4gIC8vIFRPRE86IENsZWFudXBcbiAgcHJpdmF0ZSBtYXJrZXJEcmFnKEZlYXR1cmVHcm91cDogTC5GZWF0dXJlR3JvdXApIHtcbiAgICBjb25zdCBuZXdQb3MgPSBbXTtcbiAgICBsZXQgdGVzdGFycmF5ID0gW107XG4gICAgbGV0IGhvbGUgPSBbXTtcbiAgICBjb25zdCBsYXllckxlbmd0aCA9IEZlYXR1cmVHcm91cC5nZXRMYXllcnMoKSBhcyBhbnk7XG4gICAgY29uc3QgcG9zYXJyYXlzID0gbGF5ZXJMZW5ndGhbMF0uZ2V0TGF0TG5ncygpO1xuICAgIGNvbnNvbGUubG9nKHBvc2FycmF5cyk7XG4gICAgY29uc29sZS5sb2coXCJtYXJrZXJkcmFnOiBcIiwgbGF5ZXJMZW5ndGgpO1xuICAgIGxldCBsZW5ndGggPSAwO1xuICAgIGlmIChwb3NhcnJheXMubGVuZ3RoID4gMSkge1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBvc2FycmF5cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdGVzdGFycmF5ID0gW107XG4gICAgICAgIGhvbGUgPSBbXTtcbiAgICAgICAgY29uc29sZS5sb2coXCJQb3Npc2pvbmVyOiBcIiwgcG9zYXJyYXlzW2luZGV4XSk7XG4gICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgIGlmIChwb3NhcnJheXNbMF0ubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUG9zaXNqb25lciAyOiBcIiwgcG9zYXJyYXlzW2luZGV4XVtpXSk7XG5cbiAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1baV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc2FycmF5c1swXVswXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICB0ZXN0YXJyYXkucHVzaChsYXllckxlbmd0aFtqICsgMV0uZ2V0TGF0TG5nKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiSG9sZTogXCIsIGhvbGUpO1xuICAgICAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxlbmd0aCArPSBwb3NhcnJheXNbaW5kZXggLSAxXVswXS5sZW5ndGg7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJTVGFydCBpbmRleDogXCIsIGxlbmd0aCk7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IGxlbmd0aDsgaiA8IHBvc2FycmF5c1tpbmRleF1bMF0ubGVuZ3RoICsgbGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKChsYXllckxlbmd0aFtqICsgMV0gYXMgYW55KS5nZXRMYXRMbmcoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGhvbGUucHVzaCh0ZXN0YXJyYXkpO1xuICAgICAgICAgIG5ld1Bvcy5wdXNoKGhvbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHRlc3RhcnJheSA9IFtdXG4gICAgICBob2xlID0gW107XG4gICAgICBsZXQgbGVuZ3RoMiA9IDA7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcG9zYXJyYXlzWzBdLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB0ZXN0YXJyYXkgPSBbXTtcbiAgICAgICAgY29uc29sZS5sb2coXCJQb2x5Z29uIGRyYWc6IFwiLCBwb3NhcnJheXNbMF1baW5kZXhdKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgaWYgKHBvc2FycmF5c1swXVtpbmRleF0ubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zYXJyYXlzWzBdWzBdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgIHRlc3RhcnJheS5wdXNoKGxheWVyTGVuZ3RoW2ogKyAxXS5nZXRMYXRMbmcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxlbmd0aDIgKz0gcG9zYXJyYXlzWzBdW2luZGV4IC0gMV0ubGVuZ3RoO1xuXG4gICAgICAgICAgZm9yIChsZXQgaiA9IGxlbmd0aDI7IGogPCBwb3NhcnJheXNbMF1baW5kZXhdLmxlbmd0aCArIGxlbmd0aDI7IGorKykge1xuICAgICAgICAgICAgdGVzdGFycmF5LnB1c2gobGF5ZXJMZW5ndGhbaiArIDFdLmdldExhdExuZygpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaG9sZS5wdXNoKHRlc3RhcnJheSk7XG4gICAgICB9XG4gICAgICBuZXdQb3MucHVzaChob2xlKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiSG9sZSAyOiBcIiwgaG9sZSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFwiTnllIHBvc2lzam9uZXI6IFwiLCBuZXdQb3MpO1xuICAgIGxheWVyTGVuZ3RoWzBdLnNldExhdExuZ3MobmV3UG9zKTtcbiAgfVxuICAvLyBjaGVjayB0aGlzXG4gIHByaXZhdGUgbWFya2VyRHJhZ0VuZChGZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlUG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZSgpO1xuICAgIGNvbnN0IGZlYXR1cmVDb2xsZWN0aW9uID0gRmVhdHVyZUdyb3VwLnRvR2VvSlNPTigpIGFzIGFueTtcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIFwiTWFya2VyZHJhZ2VuZCBwb2x5Z29uOiBcIixcbiAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzXG4gICAgKTtcbiAgICBpZiAoZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoID4gMSkge1xuICAgICAgZmVhdHVyZUNvbGxlY3Rpb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oW2VsZW1lbnRdKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIk1hcmtlcmRyYWdlbmQ6IFwiLCBmZWF0dXJlKTtcbiAgICAgICAgaWYgKHRoaXMudHVyZkhlbHBlci5oYXNLaW5rcyhmZWF0dXJlKSkge1xuICAgICAgICAgIHRoaXMua2lua3MgPSB0cnVlO1xuICAgICAgICAgIGNvbnN0IHVua2luayA9IHRoaXMudHVyZkhlbHBlci5nZXRLaW5rcyhmZWF0dXJlKTtcbiAgICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xuICAgICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJVbmtpbms6IFwiLCB1bmtpbmspO1xuICAgICAgICAgIHVua2luay5mb3JFYWNoKHBvbHlnb24gPT4ge1xuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uKFxuICAgICAgICAgICAgICB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24ocG9seWdvbiksXG4gICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMua2lua3MgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLmFkZFBvbHlnb24oZmVhdHVyZSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZmVhdHVyZSA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXG4gICAgICAgIGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdLmdlb21ldHJ5LmNvb3JkaW5hdGVzXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coXCJNYXJrZXJkcmFnZW5kOiBcIiwgZmVhdHVyZSk7XG4gICAgICBpZiAodGhpcy50dXJmSGVscGVyLmhhc0tpbmtzKGZlYXR1cmUpKSB7XG4gICAgICAgIHRoaXMua2lua3MgPSB0cnVlO1xuICAgICAgICBjb25zdCB1bmtpbmsgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0S2lua3MoZmVhdHVyZSk7XG4gICAgICAgIC8vIHRoaXMuZGVsZXRlUG9seWdvbih0aGlzLmdldExhdExuZ3NGcm9tSnNvbihmZWF0dXJlKSk7XG4gICAgICAgIHRoaXMucmVtb3ZlRmVhdHVyZUdyb3VwKEZlYXR1cmVHcm91cCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVW5raW5rOiBcIiwgdW5raW5rKTtcbiAgICAgICAgbGV0IHRlc3RDb29yZCA9IFtdXG4gICAgICAgIHVua2luay5mb3JFYWNoKHBvbHlnb24gPT4ge1xuICAgICAgICAgIHRoaXMuYWRkUG9seWdvbihcbiAgICAgICAgICAgIHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihwb2x5Z29uKSxcbiAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyB0aGlzLmFkZFBvbHlnb24odGhpcy50dXJmSGVscGVyLmdldE11bHRpUG9seWdvbih0ZXN0Q29vcmQpLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB0aGlzLmRlbGV0ZVBvbHlnb24odGhpcy5nZXRMYXRMbmdzRnJvbUpzb24oZmVhdHVyZSkpO1xuICAgICAgICB0aGlzLmtpbmtzID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYWRkUG9seWdvbihmZWF0dXJlLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmNyZWF0ZVBvbHlnb25JbmZvcm1hdGlvblN0b3JhZ2UoXG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzXG4gICAgKTtcbiAgfVxuICAvLyBmaW5lLCBjaGVjayB0aGUgcmV0dXJuZWQgdHlwZVxuICBwcml2YXRlIGdldExhdExuZ3NGcm9tSnNvbihcbiAgICBmZWF0dXJlOiBGZWF0dXJlPFBvbHlnb24gfCBNdWx0aVBvbHlnb24+XG4gICk6IElMYXRMbmdbXVtdIHtcbiAgICBjb25zb2xlLmxvZyhcImdldExhdExuZ3NGcm9tSnNvbjogXCIsIGZlYXR1cmUpO1xuICAgIGxldCBjb29yZDtcbiAgICBpZiAoZmVhdHVyZSkge1xuICAgICAgaWYgKFxuICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS50eXBlID09PSBcIk11bHRpUG9seWdvblwiXG4gICAgICApIHtcbiAgICAgICAgY29vcmQgPSBMLkdlb0pTT04uY29vcmRzVG9MYXRMbmdzKGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1bMF0pO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXS5sZW5ndGggPiAxICYmXG4gICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PT0gXCJQb2x5Z29uXCJcbiAgICAgICkge1xuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb29yZCA9IEwuR2VvSlNPTi5jb29yZHNUb0xhdExuZ3MoZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc1swXVswXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvb3JkO1xuICB9XG5cbiAgLy8gZmluZVxuICBwcml2YXRlIHVuaW9uUG9seWdvbnMoXG4gICAgbGF5ZXJzLFxuICAgIGxhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4sXG4gICAgcG9seWdvbkZlYXR1cmVcbiAgKSB7XG4gICAgY29uc29sZS5sb2coXCJ1bmlvblBvbHlnb25zXCIsIGxheWVycywgbGF0bG5ncywgcG9seWdvbkZlYXR1cmUpO1xuXG4gICAgbGV0IGFkZE5ldyA9IGxhdGxuZ3M7XG4gICAgbGF5ZXJzLmZvckVhY2goKGZlYXR1cmVHcm91cCwgaSkgPT4ge1xuICAgICAgY29uc3QgZmVhdHVyZUNvbGxlY3Rpb24gPSBmZWF0dXJlR3JvdXAudG9HZW9KU09OKCk7XG4gICAgICBjb25zdCBsYXllciA9IGZlYXR1cmVDb2xsZWN0aW9uLmZlYXR1cmVzWzBdO1xuICAgICAgY29uc3QgcG9seSA9IHRoaXMuZ2V0TGF0TG5nc0Zyb21Kc29uKGxheWVyKTtcbiAgICAgIGNvbnN0IHVuaW9uID0gdGhpcy50dXJmSGVscGVyLnVuaW9uKGFkZE5ldywgcG9seWdvbkZlYXR1cmVbaV0pOyAvLyBDaGVjayBmb3IgbXVsdGlwb2x5Z29uc1xuICAgICAgLy8gTmVlZHMgYSBjbGVhbnVwIGZvciB0aGUgbmV3IHZlcnNpb25cbiAgICAgIHRoaXMuZGVsZXRlUG9seWdvbk9uTWVyZ2UocG9seSk7XG4gICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cChmZWF0dXJlR3JvdXApO1xuXG4gICAgICBhZGROZXcgPSB1bmlvbjtcbiAgICB9KTtcblxuICAgIGNvbnN0IG5ld0xhdGxuZ3M6IEZlYXR1cmU8UG9seWdvbiB8IE11bHRpUG9seWdvbj4gPSBhZGROZXc7IC8vIFRyZW5nZXIga2Fuc2tqZSB0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24oIGFkZE5ldyk7XG4gICAgdGhpcy5hZGRQb2x5Z29uTGF5ZXIobmV3TGF0bG5ncywgdHJ1ZSk7XG4gIH1cbiAgLy8gZmluZVxuICBwcml2YXRlIHJlbW92ZUZlYXR1cmVHcm91cChmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XG4gICAgY29uc29sZS5sb2coXCJyZW1vdmVGZWF0dXJlR3JvdXBcIiwgZmVhdHVyZUdyb3VwKTtcblxuICAgIGZlYXR1cmVHcm91cC5jbGVhckxheWVycygpO1xuICAgIHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMgPSB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzLmZpbHRlcihcbiAgICAgIGZlYXR1cmVHcm91cHMgPT4gZmVhdHVyZUdyb3VwcyAhPT0gZmVhdHVyZUdyb3VwXG4gICAgKTtcbiAgICAvLyB0aGlzLnVwZGF0ZVBvbHlnb25zKCk7XG4gICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIoZmVhdHVyZUdyb3VwKTtcbiAgfVxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXG4gIHByaXZhdGUgcmVtb3ZlRmVhdHVyZUdyb3VwT25NZXJnZShmZWF0dXJlR3JvdXA6IEwuRmVhdHVyZUdyb3VwKSB7XG4gICAgY29uc29sZS5sb2coXCJyZW1vdmVGZWF0dXJlR3JvdXBPbk1lcmdlXCIsIGZlYXR1cmVHcm91cCk7XG5cbiAgICBjb25zdCBuZXdBcnJheSA9IFtdO1xuICAgIGlmIChmZWF0dXJlR3JvdXAuZ2V0TGF5ZXJzKClbMF0pIHtcbiAgICAgIGNvbnN0IHBvbHlnb24gPSAoZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueSkuZ2V0TGF0TG5ncygpWzBdO1xuICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24ucG9seWdvbkluZm9ybWF0aW9uU3RvcmFnZS5mb3JFYWNoKHYgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdi5wb2x5Z29uLnRvU3RyaW5nKCkgIT09IHBvbHlnb25bMF0udG9TdHJpbmcoKSAmJlxuICAgICAgICAgIHYucG9seWdvblswXS50b1N0cmluZygpID09PSBwb2x5Z29uWzBdWzBdLnRvU3RyaW5nKClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdi5wb2x5Z29uID0gcG9seWdvbjtcbiAgICAgICAgICBuZXdBcnJheS5wdXNoKHYpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHYucG9seWdvbi50b1N0cmluZygpICE9PSBwb2x5Z29uWzBdLnRvU3RyaW5nKCkgJiZcbiAgICAgICAgICB2LnBvbHlnb25bMF0udG9TdHJpbmcoKSAhPT0gcG9seWdvblswXVswXS50b1N0cmluZygpXG4gICAgICAgICkge1xuICAgICAgICAgIG5ld0FycmF5LnB1c2godik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgZmVhdHVyZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XG4gICAgICB0aGlzLmFycmF5T2ZGZWF0dXJlR3JvdXBzID0gdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5maWx0ZXIoXG4gICAgICAgIGZlYXR1cmVHcm91cHMgPT4gZmVhdHVyZUdyb3VwcyAhPT0gZmVhdHVyZUdyb3VwXG4gICAgICApO1xuXG4gICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcihmZWF0dXJlR3JvdXApO1xuICAgIH1cbiAgfVxuICAvLyBmaW5lIHVudGlsIHJlZmFjdG9yaW5nXG4gIHByaXZhdGUgZGVsZXRlUG9seWdvbk9uTWVyZ2UocG9seWdvbikge1xuICAgIGNvbnNvbGUubG9nKFwiZGVsZXRlUG9seWdvbk9uTWVyZ2VcIiwgcG9seWdvbik7XG4gICAgbGV0IHBvbHlnb24yID0gW107XG4gICAgaWYgKHRoaXMuYXJyYXlPZkZlYXR1cmVHcm91cHMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5hcnJheU9mRmVhdHVyZUdyb3Vwcy5mb3JFYWNoKGZlYXR1cmVHcm91cCA9PiB7XG4gICAgICAgIGNvbnN0IGxheWVyID0gZmVhdHVyZUdyb3VwLmdldExheWVycygpWzBdIGFzIGFueTtcbiAgICAgICAgY29uc3QgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKVswXTtcbiAgICAgICAgcG9seWdvbjIgPSBbLi4ubGF0bG5nc1swXV07XG4gICAgICAgIGlmIChsYXRsbmdzWzBdWzBdICE9PSBsYXRsbmdzWzBdW2xhdGxuZ3NbMF0ubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICBwb2x5Z29uMi5wdXNoKGxhdGxuZ3NbMF1bMF0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVxdWFscyA9IHRoaXMucG9seWdvbkFycmF5RXF1YWxzTWVyZ2UocG9seWdvbjIsIHBvbHlnb24pO1xuXG4gICAgICAgIGlmIChlcXVhbHMpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVRVUFMU1wiLCBwb2x5Z29uKTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUZlYXR1cmVHcm91cE9uTWVyZ2UoZmVhdHVyZUdyb3VwKTtcbiAgICAgICAgICB0aGlzLmRlbGV0ZVBvbHlnb24ocG9seWdvbik7XG4gICAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uZGVsZXRlVHJhc2hjYW4ocG9seWdvbik7XG4gICAgICAgICAgLy8gdGhpcy51cGRhdGVQb2x5Z29ucygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIC0gbGVnZ2UgZXQgYW5uZXQgc3RlZFxuICBwcml2YXRlIHBvbHlnb25BcnJheUVxdWFsc01lcmdlKHBvbHkxOiBhbnlbXSwgcG9seTI6IGFueVtdKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHBvbHkxLnRvU3RyaW5nKCkgPT09IHBvbHkyLnRvU3RyaW5nKCk7XG4gIH1cbiAgLy8gVE9ETyAtIGxlZ2dlIGV0IGFubmV0IHN0ZWRcbiAgcHJpdmF0ZSBwb2x5Z29uQXJyYXlFcXVhbHMocG9seTE6IGFueVtdLCBwb2x5MjogYW55W10pOiBib29sZWFuIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcInBvbHlnb25BcnJheUVxdWFsc1wiLCBwb2x5MSwgcG9seTIpO1xuXG4gICAgaWYgKHBvbHkxWzBdWzBdKSB7XG4gICAgICBpZiAoIXBvbHkxWzBdWzBdLmVxdWFscyhwb2x5MlswXVswXSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXBvbHkxWzBdLmVxdWFscyhwb2x5MlswXSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocG9seTEubGVuZ3RoICE9PSBwb2x5Mi5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIC8vIGZpbmVcbiAgcHJpdmF0ZSBzZXRMZWFmbGV0TWFwRXZlbnRzKFxuICAgIGVuYWJsZURyYWdnaW5nOiBib29sZWFuLFxuICAgIGVuYWJsZURvdWJsZUNsaWNrWm9vbTogYm9vbGVhbixcbiAgICBlbmFibGVTY3JvbGxXaGVlbFpvb206IGJvb2xlYW5cbiAgKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJzZXRMZWFmbGV0TWFwRXZlbnRzXCIsIGVuYWJsZURyYWdnaW5nLCBlbmFibGVEb3VibGVDbGlja1pvb20sIGVuYWJsZVNjcm9sbFdoZWVsWm9vbSk7XG5cbiAgICBlbmFibGVEcmFnZ2luZyA/IHRoaXMubWFwLmRyYWdnaW5nLmVuYWJsZSgpIDogdGhpcy5tYXAuZHJhZ2dpbmcuZGlzYWJsZSgpO1xuICAgIGVuYWJsZURvdWJsZUNsaWNrWm9vbVxuICAgICAgPyB0aGlzLm1hcC5kb3VibGVDbGlja1pvb20uZW5hYmxlKClcbiAgICAgIDogdGhpcy5tYXAuZG91YmxlQ2xpY2tab29tLmRpc2FibGUoKTtcbiAgICBlbmFibGVTY3JvbGxXaGVlbFpvb21cbiAgICAgID8gdGhpcy5tYXAuc2Nyb2xsV2hlZWxab29tLmVuYWJsZSgpXG4gICAgICA6IHRoaXMubWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gIH1cbiAgLy8gZmluZVxuICBzZXREcmF3TW9kZShtb2RlOiBEcmF3TW9kZSkge1xuICAgIGNvbnNvbGUubG9nKFwic2V0RHJhd01vZGVcIiwgdGhpcy5tYXApO1xuICAgIHRoaXMuZHJhd01vZGVTdWJqZWN0Lm5leHQobW9kZSk7XG4gICAgaWYgKCEhdGhpcy5tYXApIHtcbiAgICAgIGxldCBpc0FjdGl2ZURyYXdNb2RlID0gdHJ1ZTtcbiAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICBjYXNlIERyYXdNb2RlLk9mZjpcbiAgICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3MoXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcbiAgICAgICAgICAgIFwiY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkXCJcbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMuZXZlbnRzKGZhbHNlKTtcbiAgICAgICAgICB0aGlzLnN0b3BEcmF3KCk7XG4gICAgICAgICAgdGhpcy50cmFjZXIuc2V0U3R5bGUoe1xuICAgICAgICAgICAgY29sb3I6IFwiXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLnNldExlYWZsZXRNYXBFdmVudHModHJ1ZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgaXNBY3RpdmVEcmF3TW9kZSA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIERyYXdNb2RlLkFkZDpcbiAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcbiAgICAgICAgICAgIFwiY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkXCJcbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMuZXZlbnRzKHRydWUpO1xuICAgICAgICAgIHRoaXMudHJhY2VyLnNldFN0eWxlKHtcbiAgICAgICAgICAgIGNvbG9yOiBkZWZhdWx0Q29uZmlnLnBvbHlMaW5lT3B0aW9ucy5jb2xvclxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyhmYWxzZSwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBEcmF3TW9kZS5TdWJ0cmFjdDpcbiAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoXG4gICAgICAgICAgICB0aGlzLm1hcC5nZXRDb250YWluZXIoKSxcbiAgICAgICAgICAgIFwiY3Jvc3NoYWlyLWN1cnNvci1lbmFibGVkXCJcbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMuZXZlbnRzKHRydWUpO1xuICAgICAgICAgIHRoaXMudHJhY2VyLnNldFN0eWxlKHtcbiAgICAgICAgICAgIGNvbG9yOiBcIiNEOTQ2MEZcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuc2V0TGVhZmxldE1hcEV2ZW50cyhmYWxzZSwgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQWN0aXZlRHJhd01vZGUpIHtcbiAgICAgICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2V0RnJlZURyYXdNb2RlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRNb3ZlTW9kZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG1vZGVDaGFuZ2UobW9kZTogRHJhd01vZGUpOiB2b2lkIHtcbiAgICB0aGlzLnNldERyYXdNb2RlKG1vZGUpO1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcbiAgfVxuICAvLyByZW1vdmUsIHVzZSBtb2RlQ2hhbmdlXG4gIGRyYXdNb2RlQ2xpY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnBvbHlnb25EcmF3U3RhdGVzLmlzRnJlZURyYXdNb2RlKSB7XG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRNb3ZlTW9kZSgpO1xuICAgICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5PZmYpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBvbHlnb25JbmZvcm1hdGlvbi5zZXRGcmVlRHJhd01vZGUoKTtcbiAgICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuQWRkKTtcbiAgICB9XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xuICB9XG4gIC8vIHJlbW92ZSwgdXNlIG1vZGVDaGFuZ2VcbiAgZnJlZWRyYXdNZW51Q2xpY2soKTogdm9pZCB7XG4gICAgdGhpcy5zZXREcmF3TW9kZShEcmF3TW9kZS5BZGQpO1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLmFjdGl2YXRlKCk7XG4gICAgdGhpcy5wb2x5Z29uSW5mb3JtYXRpb24uc2F2ZUN1cnJlbnRTdGF0ZSgpO1xuICB9XG5cbiAgLy8gcmVtb3ZlLCB1c2UgbW9kZUNoYW5nZVxuICBzdWJ0cmFjdENsaWNrKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0RHJhd01vZGUoRHJhd01vZGUuU3VidHJhY3QpO1xuICAgIHRoaXMucG9seWdvbkluZm9ybWF0aW9uLnNhdmVDdXJyZW50U3RhdGUoKTtcbiAgfVxuICAvLyBmaW5lXG4gIHByaXZhdGUgcmVzZXRUcmFja2VyKCkge1xuICAgIHRoaXMudHJhY2VyLnNldExhdExuZ3MoW1swLCAwXV0pO1xuICB9XG5cbiAgdG9nZ2xlTWFya2VyTWVudSgpOiB2b2lkIHtcbiAgICBhbGVydChcIm9wZW4gbWVudVwiKTtcbiAgfVxuICBwcml2YXRlIGdldEh0bWxDb250ZW50KGNhbGxCYWNrOiBGdW5jdGlvbik6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBjb21wID0gdGhpcy5wb3B1cEdlbmVyYXRvci5nZW5lcmF0ZUFsdGVyUG9wdXAoKTtcbiAgICBjb21wLmluc3RhbmNlLmJib3hDbGlja2VkLnN1YnNjcmliZShlID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmJveCBjbGlja2VkXCIsIGUpO1xuICAgICAgY2FsbEJhY2soZSk7XG4gICAgfSk7XG4gICAgY29tcC5pbnN0YW5jZS5zaW1wbHlmaUNsaWNrZWQuc3Vic2NyaWJlKGUgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJzaW1wbHlmaSBjbGlja2VkXCIsIGUpO1xuICAgICAgY2FsbEJhY2soZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbXAubG9jYXRpb24ubmF0aXZlRWxlbWVudDtcbiAgfVxuICBwcml2YXRlIGNvbnZlcnRUb0JvdW5kc1BvbHlnb24oXG4gICAgbGF0bG5nczogSUxhdExuZ1tdLFxuICAgIGFkZE1pZHBvaW50TWFya2VyczogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHRoaXMuZGVsZXRlUG9seWdvbihbbGF0bG5nc10pO1xuICAgIGNvbnN0IHBvbHlnb24gPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TXVsdGlQb2x5Z29uKFxuICAgICAgdGhpcy5jb252ZXJ0VG9Db29yZHMoW2xhdGxuZ3NdKVxuICAgICk7XG4gICAgY29uc3QgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5jb252ZXJ0VG9Cb3VuZGluZ0JveFBvbHlnb24oXG4gICAgICBwb2x5Z29uLFxuICAgICAgYWRkTWlkcG9pbnRNYXJrZXJzXG4gICAgKTtcblxuICAgIHRoaXMuYWRkUG9seWdvbkxheWVyKHRoaXMudHVyZkhlbHBlci5nZXRUdXJmUG9seWdvbihuZXdQb2x5Z29uKSwgZmFsc2UpO1xuICB9XG4gIHByaXZhdGUgY29udmVydFRvU2ltcGxpZmllZFBvbHlnb24obGF0bG5nczogSUxhdExuZ1tdKSB7XG4gICAgdGhpcy5kZWxldGVQb2x5Z29uKFtsYXRsbmdzXSk7XG4gICAgY29uc3QgbmV3UG9seWdvbiA9IHRoaXMudHVyZkhlbHBlci5nZXRNdWx0aVBvbHlnb24oXG4gICAgICB0aGlzLmNvbnZlcnRUb0Nvb3JkcyhbbGF0bG5nc10pXG4gICAgKTtcbiAgICB0aGlzLmFkZFBvbHlnb25MYXllcih0aGlzLnR1cmZIZWxwZXIuZ2V0VHVyZlBvbHlnb24obmV3UG9seWdvbiksIHRydWUpO1xuICB9XG4gIHByaXZhdGUgZ2V0TWFya2VySW5kZXgobGF0bG5nczogSUxhdExuZ1tdLCBwb3NpdGlvbjogTWFya2VyUG9zaXRpb24pOiBudW1iZXIge1xuICAgIGNvbnN0IGJvdW5kczogTC5MYXRMbmdCb3VuZHMgPSBQb2x5RHJhd1V0aWwuZ2V0Qm91bmRzKFxuICAgICAgbGF0bG5ncyxcbiAgICAgIE1hdGguc3FydCgyKSAvIDJcbiAgICApO1xuICAgIGNvbnN0IGNvbXBhc3MgPSBuZXcgQ29tcGFzcyhcbiAgICAgIGJvdW5kcy5nZXRTb3V0aCgpLFxuICAgICAgYm91bmRzLmdldFdlc3QoKSxcbiAgICAgIGJvdW5kcy5nZXROb3J0aCgpLFxuICAgICAgYm91bmRzLmdldEVhc3QoKVxuICAgICk7XG4gICAgY29uc3QgY29tcGFzc0RpcmVjdGlvbiA9IGNvbXBhc3MuZ2V0RGlyZWN0aW9uKHBvc2l0aW9uKTtcbiAgICBjb25zdCBsYXRMbmdQb2ludDogSUxhdExuZyA9IHtcbiAgICAgIGxhdDogY29tcGFzc0RpcmVjdGlvbi5sYXQsXG4gICAgICBsbmc6IGNvbXBhc3NEaXJlY3Rpb24ubG5nXG4gICAgfTtcbiAgICBjb25zdCB0YXJnZXRQb2ludCA9IHRoaXMudHVyZkhlbHBlci5nZXRDb29yZChsYXRMbmdQb2ludCk7XG4gICAgY29uc3QgZmMgPSB0aGlzLnR1cmZIZWxwZXIuZ2V0RmVhdHVyZVBvaW50Q29sbGVjdGlvbihsYXRsbmdzKTtcbiAgICBjb25zdCBuZWFyZXN0UG9pbnRJZHggPSB0aGlzLnR1cmZIZWxwZXIuZ2V0TmVhcmVzdFBvaW50SW5kZXgoXG4gICAgICB0YXJnZXRQb2ludCxcbiAgICAgIGZjIGFzIGFueVxuICAgICk7XG5cbiAgICByZXR1cm4gbmVhcmVzdFBvaW50SWR4O1xuICB9XG59XG4iXX0=