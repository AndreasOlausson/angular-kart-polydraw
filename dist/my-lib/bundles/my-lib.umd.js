(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('leaflet'), require('rxjs'), require('rxjs/operators'), require('@turf/turf'), require('concaveman')) :
    typeof define === 'function' && define.amd ? define('my-lib', ['exports', '@angular/core', 'leaflet', 'rxjs', 'rxjs/operators', '@turf/turf', 'concaveman'], factory) :
    (global = global || self, factory(global['my-lib'] = {}, global.ng.core, global.leaflet, global.rxjs, global.rxjs.operators, global.turf, global.concaveman));
}(this, (function (exports, core, leaflet, rxjs, operators, turf, concaveman) { 'use strict';

    concaveman = concaveman && Object.prototype.hasOwnProperty.call(concaveman, 'default') ? concaveman['default'] : concaveman;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __createBinding(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }

    function __exportStar(m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var PolyStateService = /** @class */ (function () {
        function PolyStateService() {
            this.mapSubject = new rxjs.BehaviorSubject(null);
            this.map$ = this.mapSubject.asObservable();
            this.polygonSubject = new rxjs.BehaviorSubject(null);
            this.polygons$ = this.polygonSubject.asObservable();
            this.mapStateSubject = new rxjs.BehaviorSubject(new MapStateModel());
            this.mapState$ = this.mapStateSubject.asObservable();
            this.mapZoomLevel$ = this.mapState$.pipe(operators.map(function (state) { return state.mapBoundState.zoom; }));
        }
        PolyStateService.prototype.updateMapStates = function (newState) {
            var state = this.mapStateSubject.value;
            state = __assign(__assign({}, state), newState);
            this.mapStateSubject.next(state);
        };
        PolyStateService.prototype.updateMapState = function (map) {
            this.mapSubject.next(map);
        };
        PolyStateService.prototype.updatePolygons = function (polygons) {
            this.polygonSubject.next(polygons);
        };
        PolyStateService.prototype.updateMapBounds = function (mapBounds) {
            this.updateMapStates({ mapBoundState: mapBounds });
        };
        PolyStateService.ɵprov = core.ɵɵdefineInjectable({ factory: function PolyStateService_Factory() { return new PolyStateService(); }, token: PolyStateService, providedIn: "root" });
        PolyStateService = __decorate([
            core.Injectable({
                providedIn: 'root'
            }),
            __metadata("design:paramtypes", [])
        ], PolyStateService);
        return PolyStateService;
    }());
    var MapStateModel = /** @class */ (function () {
        function MapStateModel(mapBoundState) {
            if (mapBoundState === void 0) { mapBoundState = new MapBoundsState(null, 11); }
            this.mapBoundState = mapBoundState;
        }
        return MapStateModel;
    }());
    var MapBoundsState = /** @class */ (function () {
        function MapBoundsState(bounds, zoom) {
            this.bounds = bounds;
            this.zoom = zoom;
        }
        return MapBoundsState;
    }());


    (function (DrawMode) {
        DrawMode[DrawMode["Off"] = 0] = "Off";
        DrawMode[DrawMode["Add"] = 1] = "Add";
        DrawMode[DrawMode["Edit"] = 2] = "Edit";
        DrawMode[DrawMode["Subtract"] = 4] = "Subtract";
        DrawMode[DrawMode["AppendMarker"] = 8] = "AppendMarker";
        DrawMode[DrawMode["LoadPredefined"] = 16] = "LoadPredefined";
    })(exports.DrawMode || (exports.DrawMode = {}));

    (function (MarkerPosition) {
        // CenterOfMass = 0,
        MarkerPosition[MarkerPosition["North"] = 1] = "North";
        MarkerPosition[MarkerPosition["East"] = 2] = "East";
        MarkerPosition[MarkerPosition["South"] = 3] = "South";
        MarkerPosition[MarkerPosition["West"] = 4] = "West";
        MarkerPosition[MarkerPosition["NorthEast"] = 5] = "NorthEast";
        MarkerPosition[MarkerPosition["NorthWest"] = 6] = "NorthWest";
        MarkerPosition[MarkerPosition["SouthEast"] = 7] = "SouthEast";
        MarkerPosition[MarkerPosition["SouthWest"] = 8] = "SouthWest";
        // BoundingBoxCenter = 9
    })(exports.MarkerPosition || (exports.MarkerPosition = {}));

    var PolyDrawUtil = /** @class */ (function () {
        function PolyDrawUtil() {
        }
        PolyDrawUtil.getBounds = function (polygon, padding) {
            if (padding === void 0) { padding = 0; }
            var tmpLatLng = [];
            polygon.forEach(function (ll) {
                if (isNaN(ll.lat) || isNaN(ll.lng)) {
                }
                tmpLatLng.push(ll);
            });
            var polyLine = new leaflet.Polyline(tmpLatLng);
            var bounds = polyLine.getBounds();
            if (padding !== 0) {
                return bounds.pad(padding);
            }
            return bounds;
        };
        return PolyDrawUtil;
    }());
    //TODO make compass ILatLng
    var Compass = /** @class */ (function () {
        function Compass(minLat, minLng, maxLat, maxLng) {
            if (minLat === void 0) { minLat = 0; }
            if (minLng === void 0) { minLng = 0; }
            if (maxLat === void 0) { maxLat = 0; }
            if (maxLng === void 0) { maxLng = 0; }
            this.direction = {
                // BoundingBoxCenter: { lat: 0, lng: 0 },
                // CenterOfMass: { lat: 0, lng: 0 },
                East: { lat: 0, lng: 0 },
                North: { lat: 0, lng: 0 },
                NorthEast: { lat: 0, lng: 0 },
                NorthWest: { lat: 0, lng: 0 },
                South: { lat: 0, lng: 0 },
                SouthEast: { lat: 0, lng: 0 },
                SouthWest: { lat: 0, lng: 0 },
                West: { lat: 0, lng: 0 }
            };
            this.direction.North = { lat: maxLat, lng: (minLng + maxLng) / 2 };
            this.direction.NorthEast = { lat: maxLat, lng: maxLng };
            this.direction.East = { lat: (minLat + maxLat) / 2, lng: maxLng };
            this.direction.SouthEast = { lat: minLat, lng: maxLng };
            this.direction.South = { lat: minLat, lng: (minLng + maxLng) / 2 };
            this.direction.SouthWest = { lat: minLat, lng: minLng };
            this.direction.West = { lat: (minLat + maxLat) / 2, lng: minLng };
            this.direction.NorthWest = { lat: maxLat, lng: minLng };
            // this.direction.CenterOfMass = { lat: 0, lng: 0 };
            // this.direction.BoundingBoxCenter = {lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2};
        }
        //TODO default return.
        Compass.prototype.getDirection = function (direction) {
            switch (direction) {
                // case MarkerPosition.CenterOfMass:
                //     return this.direction.CenterOfMass;
                case exports.MarkerPosition.North:
                    return this.direction.North;
                case exports.MarkerPosition.NorthEast:
                    return this.direction.NorthEast;
                case exports.MarkerPosition.East:
                    return this.direction.East;
                case exports.MarkerPosition.SouthEast:
                    return this.direction.SouthEast;
                case exports.MarkerPosition.South:
                    return this.direction.South;
                case exports.MarkerPosition.SouthWest:
                    return this.direction.SouthWest;
                case exports.MarkerPosition.West:
                    return this.direction.West;
                case exports.MarkerPosition.NorthWest:
                    return this.direction.NorthWest;
                // case MarkerPosition.BoundingBoxCenter:
                //     return this.direction.BoundingBoxCenter;
                default:
                    return this.direction.North;
            }
        };
        //TODO startNode, go clockwise or not
        Compass.prototype.getPositions = function (startNode, clockwise, addClosingNode) {
            if (startNode === void 0) { startNode = exports.MarkerPosition.SouthWest; }
            if (clockwise === void 0) { clockwise = false; }
            if (addClosingNode === void 0) { addClosingNode = true; }
            var positions = [];
            positions.push([this.direction.SouthWest.lng, this.direction.SouthWest.lat]);
            positions.push([this.direction.SouthWest.lng, this.direction.SouthWest.lat]);
            positions.push([this.direction.South.lng, this.direction.South.lat]);
            positions.push([this.direction.SouthEast.lng, this.direction.SouthEast.lat]);
            positions.push([this.direction.East.lng, this.direction.East.lat]);
            positions.push([this.direction.NorthEast.lng, this.direction.NorthEast.lat]);
            positions.push([this.direction.North.lng, this.direction.North.lat]);
            positions.push([this.direction.NorthWest.lng, this.direction.NorthWest.lat]);
            positions.push([this.direction.West.lng, this.direction.West.lat]);
            if (addClosingNode) {
                positions.push([this.direction.SouthWest.lng, this.direction.SouthWest.lat]);
            }
            return positions;
        };
        return Compass;
    }());

    var TurfHelperService = /** @class */ (function () {
        function TurfHelperService() {
            this.simplifyTolerance = { tolerance: 0.0001, highQuality: false };
        }
        TurfHelperService.prototype.union = function (poly1, poly2) {
            var union$1 = turf.union(poly1, poly2);
            return this.getTurfPolygon(union$1);
        };
        TurfHelperService.prototype.turfConcaveman = function (feature) {
            var points = turf.explode(feature);
            var coordinates = points.features.map(function (f) { return f.geometry.coordinates; });
            return turf.multiPolygon([[concaveman(coordinates)]]);
        };
        //TODO add some sort of dynamic tolerance
        TurfHelperService.prototype.getSimplified = function (polygon) {
            var tolerance = this.simplifyTolerance;
            var simplified = turf.simplify(polygon, tolerance);
            return simplified;
        };
        TurfHelperService.prototype.getTurfPolygon = function (polygon) {
            var turfPolygon;
            // if (polygon.geometry)
            if (polygon.geometry.type === 'Polygon') {
                turfPolygon = turf.multiPolygon([polygon.geometry.coordinates]);
            }
            else {
                turfPolygon = turf.multiPolygon(polygon.geometry.coordinates);
            }
            return turfPolygon;
        };
        TurfHelperService.prototype.getMultiPolygon = function (polygonArray) {
            return turf.multiPolygon(polygonArray);
        };
        TurfHelperService.prototype.getKinks = function (feature) {
            var unkink = turf.unkinkPolygon(feature);
            var coordinates = [];
            turf.featureEach(unkink, function (current) {
                coordinates.push(current);
            });
            return coordinates;
        };
        TurfHelperService.prototype.getCoords = function (feature) {
            return turf.getCoords(feature);
        };
        TurfHelperService.prototype.hasKinks = function (feature) {
            var kinks = turf.kinks(feature);
            return kinks.features.length > 0;
        };
        TurfHelperService.prototype.polygonIntersect = function (polygon, latlngs) {
            var _a, _b;
            // const oldPolygon = polygon.toGeoJSON();
            var poly = [];
            var poly2 = [];
            var latlngsCoords = turf.getCoords(latlngs);
            latlngsCoords.forEach(function (element) {
                var feat = { type: 'Polygon', coordinates: [element[0]] };
                poly.push(feat);
            });
            var polygonCoords = turf.getCoords(polygon);
            polygonCoords.forEach(function (element) {
                var feat = { type: 'Polygon', coordinates: [element[0]] };
                poly2.push(feat);
            });
            var intersect$1 = false;
            loop1: for (var i = 0; i < poly.length; i++) {
                if (this.getKinks(poly[i]).length < 2) {
                    for (var j = 0; j < poly2.length; j++) {
                        if (this.getKinks(poly2[j]).length < 2) {
                            var test = turf.intersect(poly[i], poly2[j]);
                            if (((_a = test) === null || _a === void 0 ? void 0 : _a.geometry.type) === 'Point') {
                                intersect$1 = !(turf.booleanPointInPolygon(test, poly[i]) &&
                                    turf.booleanPointInPolygon(test, poly2[j]));
                            }
                            else if (((_b = test) === null || _b === void 0 ? void 0 : _b.geometry.type) === 'Polygon') {
                                intersect$1 = !!turf.intersect(poly[i], poly2[j]);
                            }
                            if (intersect$1) {
                                break loop1;
                            }
                        }
                    }
                }
            }
            return intersect$1;
        };
        TurfHelperService.prototype.getIntersection = function (poly1, poly2) {
            return turf.intersect(poly1, poly2);
        };
        TurfHelperService.prototype.getDistance = function (point1, point2) {
            return turf.distance(point1, point2);
        };
        TurfHelperService.prototype.isWithin = function (polygon1, polygon2) {
            return turf.booleanWithin(turf.polygon([polygon1]), turf.polygon([polygon2]));
        };
        TurfHelperService.prototype.equalPolygons = function (polygon1, polygon2) {
        };
        //TODO optional add extra markers for N E S W (We have the corners NW, NE, SE, SW)
        TurfHelperService.prototype.convertToBoundingBoxPolygon = function (polygon, addMidpointMarkers) {
            if (addMidpointMarkers === void 0) { addMidpointMarkers = false; }
            var bbox$1 = turf.bbox(polygon.geometry);
            var bboxPolygon$1 = turf.bboxPolygon(bbox$1);
            var compass = new Compass(bbox$1[1], bbox$1[0], bbox$1[3], bbox$1[2]);
            var compassPositions = compass.getPositions();
            bboxPolygon$1.geometry.coordinates = [];
            bboxPolygon$1.geometry.coordinates = [compassPositions];
            return bboxPolygon$1;
        };
        TurfHelperService.prototype.polygonToMultiPolygon = function (poly) {
            var multi = turf.multiPolygon([poly.geometry.coordinates]);
            return multi;
        };
        //TODO -cleanup
        TurfHelperService.prototype.injectPointToPolygon = function (polygon$1, point) {
            var coords = turf.getCoords(polygon$1);
            var newPolygon;
            if (coords.length < 2) {
                var polygonPoints = turf.explode(polygon$1);
                var index_1 = turf.nearestPoint(point, polygonPoints).properties
                    .featureIndex;
                var test = turf.coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
                    if (index_1 === i) {
                        return __spread(accumulator, [oldPoint, point]);
                    }
                    return __spread(accumulator, [oldPoint]);
                }, []);
                newPolygon = turf.multiPolygon([[test]]);
            }
            else {
                var pos_1 = [];
                var coordinates_1 = [];
                coords.forEach(function (element) {
                    var polygon$1 = turf.polygon(element);
                    // turf.booleanPointInPolygon(point, polygon)
                    if (turf.booleanPointInPolygon(point, polygon$1)) {
                        var polygonPoints = turf.explode(polygon$1);
                        var index_2 = turf.nearestPoint(point, polygonPoints).properties
                            .featureIndex;
                        coordinates_1 = turf.coordReduce(polygonPoints, function (accumulator, oldPoint, i) {
                            if (index_2 === i) {
                                return __spread(accumulator, [oldPoint, point]);
                            }
                            return __spread(accumulator, [oldPoint]);
                        }, []);
                    }
                    else {
                        pos_1.push(element);
                    }
                });
                pos_1.push([coordinates_1]);
                newPolygon = turf.multiPolygon(pos_1);
            }
            return newPolygon;
        };
        TurfHelperService.prototype.polygonDifference = function (polygon1, polygon2) {
            var diff = turf.difference(polygon1, polygon2);
            return this.getTurfPolygon(diff);
        };
        TurfHelperService.prototype.getBoundingBoxCompassPosition = function (polygon, MarkerPosition, useOffset, offsetDirection) {
            var p = this.getMultiPolygon(polygon);
            var compass = this.getBoundingBoxCompass(polygon);
            var polygonPoints = turf.explode(polygon);
            var coord = this.getCoord(compass.direction.North);
            var nearestPoint$1 = turf.nearestPoint(coord, polygonPoints);
            return null;
        };
        TurfHelperService.prototype.getBoundingBoxCompass = function (polygon) {
            var p = this.getMultiPolygon(polygon);
            var centerOfMass$1 = turf.centerOfMass(p);
            var b = turf.bbox(p);
            var minX = b[0];
            var minY = b[1];
            var maxX = b[2];
            var maxY = b[3];
            var compass = new Compass(minX, minY, maxX, maxY);
            // compass.direction.CenterOfMass = centerOfMass.geometry.coordinates[0][0];
            return compass;
        };
        TurfHelperService.prototype.getNearestPointIndex = function (targetPoint, points) {
            var index = turf.nearestPoint(targetPoint, points).properties.featureIndex;
            return index;
        };
        TurfHelperService.prototype.getCoord = function (point) {
            var coord = turf.getCoord([point.lng, point.lat]);
            return coord;
        };
        TurfHelperService.prototype.getFeaturePointCollection = function (points) {
            var pts = [];
            points.forEach(function (v) {
                var p = turf.point([v.lng, v.lat], {});
                pts.push(p);
            });
            var fc = turf.featureCollection(pts);
            return fc;
        };
        TurfHelperService.ɵprov = core.ɵɵdefineInjectable({ factory: function TurfHelperService_Factory() { return new TurfHelperService(); }, token: TurfHelperService, providedIn: "root" });
        TurfHelperService = __decorate([
            core.Injectable({ providedIn: 'root' }),
            __metadata("design:paramtypes", [])
        ], TurfHelperService);
        return TurfHelperService;
    }());

    var PolygonUtil = /** @class */ (function () {
        function PolygonUtil() {
        }
        PolygonUtil.getCenter = function (polygon) {
            var pi = Math.PI;
            var x = 0;
            var y = 0;
            var z = 0;
            polygon.forEach(function (v) {
                var lat1 = v.lat;
                var lon1 = v.lng;
                lat1 = lat1 * pi / 180;
                lon1 = lon1 * pi / 180;
                x += Math.cos(lat1) * Math.cos(lon1);
                y += Math.cos(lat1) * Math.sin(lon1);
                z += Math.sin(lat1);
            });
            var lng = Math.atan2(y, x);
            var hyp = Math.sqrt(x * x + y * y);
            var lat = Math.atan2(z, hyp);
            lat = lat * 180 / pi;
            lng = lng * 180 / pi;
            var center = { lat: lat, lng: lng };
            return center;
        };
        PolygonUtil.getSouthWest = function (polygon) {
            var bounds = this.getBounds(polygon);
            return bounds.getNorthWest();
        };
        PolygonUtil.getNorthEast = function (polygon) {
            var bounds = this.getBounds(polygon);
            return bounds.getNorthEast();
        };
        PolygonUtil.getNorthWest = function (polygon) {
            var bounds = this.getBounds(polygon);
            return bounds.getNorthWest();
        };
        PolygonUtil.getSouthEast = function (polygon) {
            var bounds = this.getBounds(polygon);
            return bounds.getSouthEast();
        };
        PolygonUtil.getNorth = function (polygon) {
            var bounds = this.getBounds(polygon);
            return bounds.getNorth();
        };
        PolygonUtil.getSouth = function (polygon) {
            var bounds = this.getBounds(polygon);
            return bounds.getSouth();
        };
        PolygonUtil.getWest = function (polygon) {
            var bounds = this.getBounds(polygon);
            return bounds.getWest();
        };
        PolygonUtil.getEast = function (polygon) {
            var bounds = this.getBounds(polygon);
            return bounds.getEast();
        };
        PolygonUtil.getSqmArea = function (polygon) {
            var poly = new leaflet.Polygon(polygon);
            var geoJsonPoly = poly.toGeoJSON();
            var area$1 = turf.area((geoJsonPoly));
            return area$1;
        };
        PolygonUtil.getPerimeter = function (polygon) {
            var poly = new leaflet.Polygon(polygon);
            var geoJsonPoly = poly.toGeoJSON();
            var perimeter = turf.length((geoJsonPoly), { units: "meters" });
            return perimeter;
        };
        PolygonUtil.getPolygonChecksum = function (polygon) {
            var uniqueLatLngs = polygon.filter(function (v, i, a) {
                return a.indexOf(a.find(function (x) { return x.lat === v.lat && x.lng === v.lng; })) === i;
            });
            return uniqueLatLngs.reduce(function (a, b) { return +a + +b.lat; }, 0) * uniqueLatLngs.reduce(function (a, b) { return +a + +b.lng; }, 0);
        };
        PolygonUtil.getMidPoint = function (point1, point2) {
            var p1 = turf.point([point1.lng, point1.lat]);
            var p2 = turf.point([point2.lng, point2.lat]);
            var midpoint$1 = turf.midpoint(p1, p2);
            var returnPoint = {
                lat: midpoint$1.geometry.coordinates[1],
                lng: midpoint$1.geometry.coordinates[0]
            };
            return returnPoint;
        };
        PolygonUtil.getBounds = function (polygon) {
            var tmpLatLng = [];
            polygon.forEach(function (ll) {
                if (isNaN(ll.lat) || isNaN(ll.lng)) {
                }
                tmpLatLng.push(ll);
            });
            var polyLine = new leaflet.Polyline(tmpLatLng);
            var bounds = polyLine.getBounds();
            return bounds;
        };
        return PolygonUtil;
    }());
    //export class FreedrawSubtract extends L.FreeDraw {
    //    constructor() {
    //        //this will become L.FreeDraw
    //        super(null);
    //        //call methods in freedraw by this
    //        const foo = this.size();
    //        this.consoleLogNumberOfPolygons(foo);
    //    }
    //    consoleLogNumberOfPolygons(size: number): void {
    //        console.log("Number of polygons: ", size);
    //    }
    //}

    var PolygonInfo = /** @class */ (function () {
        function PolygonInfo(polygon) {
            var _this = this;
            this.polygon = [];
            this.trashcanPoint = [];
            this.sqmArea = [];
            this.perimeter = [];
            polygon.forEach(function (polygons, i) {
                _this.trashcanPoint[i] = _this.getTrashcanPoint(polygons[0]);
                _this.sqmArea[i] = _this.calculatePolygonArea(polygons[0]);
                _this.perimeter[i] = _this.calculatePolygonPerimeter(polygons[0]);
                _this.polygon[i] = polygons;
            });
        }
        PolygonInfo.prototype.setSqmArea = function (area) {
            this.sqmArea[0] = area;
        };
        PolygonInfo.prototype.getTrashcanPoint = function (polygon) {
            var res = Math.max.apply(Math, polygon.map(function (o) { return o.lat; }));
            var idx = polygon.findIndex(function (o) { return o.lat === res; });
            var previousPoint;
            var nextPoint;
            if (idx > 0) {
                previousPoint = polygon[idx - 1];
                if (idx < polygon.length - 1) {
                    nextPoint = polygon[idx + 1];
                }
                else {
                    nextPoint = polygon[0];
                }
            }
            else {
                previousPoint = polygon[polygon.length - 1];
                nextPoint = polygon[idx + 1];
            }
            var secondPoint = previousPoint.lng < nextPoint.lng ? previousPoint : nextPoint;
            var midpoint = PolygonUtil.getMidPoint(polygon[idx], secondPoint);
            return midpoint;
        };
        PolygonInfo.prototype.calculatePolygonArea = function (polygon) {
            var area = PolygonUtil.getSqmArea(polygon);
            return area;
        };
        PolygonInfo.prototype.calculatePolygonPerimeter = function (polygon) {
            var perimeter = PolygonUtil.getPerimeter(polygon);
            return perimeter;
        };
        return PolygonInfo;
    }());
    var addClass = function (selector, className) {
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            elements.item(i).classList.add(className);
        }
    };
    var ɵ0 = addClass;
    var removeClass = function (selector, className) {
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            elements.item(i).classList.remove(className);
        }
    };
    var ɵ1 = removeClass;
    var PolygonDrawStates = /** @class */ (function () {
        function PolygonDrawStates() {
            this.canUsePolyDraw = false;
            this.reset();
        }
        PolygonDrawStates.prototype.activate = function () {
            this.reset();
            this.isActivated = true;
        };
        PolygonDrawStates.prototype.reset = function () {
            this.isActivated = false;
            this.hasPolygons = false;
            this.canRevert = false;
            this.isAuto = false;
            this.resetDrawModes();
        };
        PolygonDrawStates.prototype.resetDrawModes = function () {
            this.isFreeDrawMode = false;
            removeClass('img.leaflet-tile', 'disable-events');
            this.isMoveMode = false;
        };
        PolygonDrawStates.prototype.setFreeDrawMode = function (isAuto) {
            if (isAuto === void 0) { isAuto = false; }
            if (isAuto) {
                this.isActivated = true;
            }
            if (this.isActivated) {
                this.resetDrawModes();
                this.isFreeDrawMode = true;
                addClass('img.leaflet-tile', 'disable-events');
                if (isAuto) {
                    this.isAuto = true;
                }
            }
        };
        PolygonDrawStates.prototype.setMoveMode = function () {
            if (this.isActivated) {
                this.resetDrawModes();
                this.isMoveMode = true;
            }
        };
        PolygonDrawStates.prototype.forceCanUseFreeDraw = function () {
            this.canUsePolyDraw = true;
        };
        return PolygonDrawStates;
    }());

    var PolygonInformationService = /** @class */ (function () {
        function PolygonInformationService(mapStateService) {
            this.mapStateService = mapStateService;
            this.polygonInformationSubject = new rxjs.Subject();
            this.polygonInformation$ = this.polygonInformationSubject.asObservable();
            this.polygonDrawStatesSubject = new rxjs.Subject();
            this.polygonDrawStates$ = this.polygonDrawStatesSubject.asObservable();
            this.polygonDrawStates = null;
            this.polygonInformationStorage = [];
            this.polygonDrawStates = new PolygonDrawStates();
        }
        PolygonInformationService.prototype.updatePolygons = function () {
            var newPolygons = null;
            if (this.polygonInformationStorage.length > 0) {
                newPolygons = [];
                this.polygonInformationStorage.forEach(function (v) {
                    var test = [];
                    v.polygon.forEach(function (poly) {
                        var test2 = [];
                        poly.forEach(function (polygon) {
                            test2 = __spread(polygon);
                            if (polygon[0].toString() !== polygon[polygon.length - 1].toString()) {
                                test2.push(polygon[0]);
                            }
                            test.push(test2);
                        });
                    });
                    newPolygons.push(test);
                });
                this.polygonDrawStates.hasPolygons = true;
            }
            else {
                this.polygonDrawStates.reset();
                this.polygonDrawStates.hasPolygons = false;
            }
            this.mapStateService.updatePolygons(newPolygons);
            this.saveCurrentState();
        };
        PolygonInformationService.prototype.saveCurrentState = function () {
            this.polygonInformationSubject.next(this.polygonInformationStorage);
            this.polygonDrawStatesSubject.next(this.polygonDrawStates);
        };
        PolygonInformationService.prototype.deleteTrashcan = function (polygon) {
            var idx = this.polygonInformationStorage.findIndex(function (v) { return v.polygon[0] === polygon; });
            this.polygonInformationStorage.splice(idx, 1);
            this.updatePolygons();
        };
        PolygonInformationService.prototype.deleteTrashCanOnMulti = function (polygon) {
            var index = 0;
            // const idx = this.polygonInformationStorage.findIndex(v => v.polygon.forEach(poly =>{ poly === polygon}) );
            this.polygonInformationStorage.forEach(function (v, i) {
                var id = v.polygon.findIndex(function (poly) { return poly.toString() === polygon.toString(); });
                if (id >= 0) {
                    index = i;
                    v.trashcanPoint.splice(id, 1);
                    v.sqmArea.splice(id, 1);
                    v.perimeter.splice(id, 1);
                    v.polygon.splice(id, 1);
                }
            });
            this.updatePolygons();
            if (this.polygonInformationStorage.length > 1) {
                this.polygonInformationStorage.splice(index, 1);
            }
        };
        PolygonInformationService.prototype.deletePolygonInformationStorage = function () {
            this.polygonInformationStorage = [];
        };
        PolygonInformationService.prototype.createPolygonInformationStorage = function (arrayOfFeatureGroups) {
            var _this = this;
            if (arrayOfFeatureGroups.length > 0) {
                arrayOfFeatureGroups.forEach(function (featureGroup) {
                    var polyInfo = new PolygonInfo(featureGroup.getLayers()[0].getLatLngs());
                    _this.polygonInformationStorage.push(polyInfo);
                });
                this.updatePolygons();
            }
        };
        PolygonInformationService.prototype.activate = function () {
            this.polygonDrawStates.activate();
        };
        PolygonInformationService.prototype.reset = function () {
            this.polygonDrawStates.reset();
        };
        PolygonInformationService.prototype.setMoveMode = function () {
            this.polygonDrawStates.setMoveMode();
        };
        PolygonInformationService.prototype.setFreeDrawMode = function () {
            this.polygonDrawStates.setFreeDrawMode();
        };
        PolygonInformationService.ctorParameters = function () { return [
            { type: PolyStateService }
        ]; };
        PolygonInformationService.ɵprov = core.ɵɵdefineInjectable({ factory: function PolygonInformationService_Factory() { return new PolygonInformationService(core.ɵɵinject(PolyStateService)); }, token: PolygonInformationService, providedIn: "root" });
        PolygonInformationService = __decorate([
            core.Injectable({ providedIn: "root" }),
            __metadata("design:paramtypes", [PolyStateService])
        ], PolygonInformationService);
        return PolygonInformationService;
    }());

    var touchSupport = true;
    var mergePolygons = true;
    var kinks = false;
    var markers = {
    	menu: true,
    	"delete": true,
    	markerIcon: {
    		styleClasses: [
    			"polygon-marker"
    		]
    	},
    	holeIcon: {
    		styleClasses: [
    			"polygon-marker",
    			"hole"
    		]
    	},
    	markerMenuIcon: {
    		position: 4,
    		styleClasses: [
    			"polygon-marker",
    			"menu"
    		]
    	},
    	markerDeleteIcon: {
    		position: 1,
    		styleClasses: [
    			"polygon-marker",
    			"delete"
    		]
    	}
    };
    var polyLineOptions = {
    	color: "#50622b",
    	opacity: 1,
    	smoothFactor: 0,
    	noClip: true,
    	clickable: false,
    	weight: 2
    };
    var subtractLineOptions = {
    	color: "#50622b",
    	opacity: 1,
    	smoothFactor: 0,
    	noClip: true,
    	clickable: false,
    	weight: 2
    };
    var polygonOptions = {
    	smoothFactor: 0.3,
    	color: "#50622b",
    	fillColor: "#b4cd8a",
    	noClip: true
    };
    var defaultConfig = {
    	touchSupport: touchSupport,
    	mergePolygons: mergePolygons,
    	kinks: kinks,
    	markers: markers,
    	polyLineOptions: polyLineOptions,
    	subtractLineOptions: subtractLineOptions,
    	polygonOptions: polygonOptions
    };

    var AlterPolygonComponent = /** @class */ (function () {
        function AlterPolygonComponent() {
            this.simplyfiClicked = new core.EventEmitter();
            this.bboxClicked = new core.EventEmitter();
        }
        AlterPolygonComponent.prototype.onSimplify = function ($event) {
            this.simplyfiClicked.emit($event);
        };
        AlterPolygonComponent.prototype.onBbox = function ($event) {
            this.bboxClicked.emit($event);
        };
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AlterPolygonComponent.prototype, "simplyfiClicked", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AlterPolygonComponent.prototype, "bboxClicked", void 0);
        AlterPolygonComponent = __decorate([
            core.Component({
                selector: 'app-alter-polygon',
                template: "<div class=\"marker-menu-inner-wrapper\">\r\n  <div class=\"marker-menu-header\">Alter polygon</div>\r\n  <div class=\"marker-menu-content\">\r\n    <div class=\"marker-menu-button simplify\" (click)=\"onSimplify($event)\">Simplify</div>\r\n    <div class=\"marker-menu-separator\"></div>\r\n    <div class=\"marker-menu-button bbox\" (click)=\"onBbox($event)\" >bbox</div>\r\n  </div>\r\n</div>",
                styles: [""]
            })
        ], AlterPolygonComponent);
        return AlterPolygonComponent;
    }());

    var ComponentGeneraterService = /** @class */ (function () {
        function ComponentGeneraterService(cfr, injector) {
            this.cfr = cfr;
            this.injector = injector;
            this.clusterPopuprefs = [];
        }
        ComponentGeneraterService.prototype.ngOnDestroy = function () {
            this.destroyAngularPopupComponents();
        };
        ComponentGeneraterService.prototype.generateAlterPopup = function () {
            var cmpFactory = this.cfr.resolveComponentFactory(AlterPolygonComponent);
            var popupComponentRef = cmpFactory.create(this.injector);
            this.clusterPopuprefs.push(popupComponentRef);
            return popupComponentRef;
        };
        ComponentGeneraterService.prototype.destroyAngularPopupComponents = function () {
            this.clusterPopuprefs.forEach(function (cref) {
                if (cref) {
                    cref.destroy();
                }
            });
            this.clusterPopuprefs = [];
        };
        ComponentGeneraterService.ctorParameters = function () { return [
            { type: core.ComponentFactoryResolver },
            { type: core.Injector }
        ]; };
        ComponentGeneraterService.ɵprov = core.ɵɵdefineInjectable({ factory: function ComponentGeneraterService_Factory() { return new ComponentGeneraterService(core.ɵɵinject(core.ComponentFactoryResolver), core.ɵɵinject(core.INJECTOR)); }, token: ComponentGeneraterService, providedIn: "root" });
        ComponentGeneraterService = __decorate([
            core.Injectable({
                providedIn: 'root'
            }),
            __metadata("design:paramtypes", [core.ComponentFactoryResolver,
                core.Injector])
        ], ComponentGeneraterService);
        return ComponentGeneraterService;
    }());

    var LeafletHelperService = /** @class */ (function () {
        function LeafletHelperService() {
        }
        LeafletHelperService.prototype.createPolygon = function (latLngs) {
            var p = leaflet.polygon(latLngs);
            return p;
        };
        LeafletHelperService.ɵprov = core.ɵɵdefineInjectable({ factory: function LeafletHelperService_Factory() { return new LeafletHelperService(); }, token: LeafletHelperService, providedIn: "root" });
        LeafletHelperService = __decorate([
            core.Injectable({ providedIn: "root" }),
            __metadata("design:paramtypes", [])
        ], LeafletHelperService);
        return LeafletHelperService;
    }());

    var PolyDrawService = /** @class */ (function () {
        function PolyDrawService(mapState, popupGenerator, turfHelper, polygonInformation, leafletHelper) {
            var _this = this;
            this.mapState = mapState;
            this.popupGenerator = popupGenerator;
            this.turfHelper = turfHelper;
            this.polygonInformation = polygonInformation;
            this.leafletHelper = leafletHelper;
            // DrawModes, determine UI buttons etc...
            this.drawModeSubject = new rxjs.BehaviorSubject(exports.DrawMode.Off);
            this.drawMode$ = this.drawModeSubject.asObservable();
            this.minimumFreeDrawZoomLevel = 12;
            // add to config
            this.arrayOfFeatureGroups = [];
            this.tracer = {};
            // end add to config
            this.ngUnsubscribe = new rxjs.Subject();
            this.config = null;
            this.mapState.map$
                .pipe(operators.filter(function (m) { return m !== null; }))
                .subscribe(function (map) {
                _this.map = map;
                _this.config = defaultConfig;
                _this.configurate({});
                _this.tracer = leaflet.polyline([[0, 0]], _this.config.polyLineOptions);
                _this.initPolyDraw();
            });
            this.mapState.mapZoomLevel$
                .pipe(operators.debounceTime(100), operators.takeUntil(this.ngUnsubscribe))
                .subscribe(function (zoom) {
                _this.onZoomChange(zoom);
            });
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
            this.setDrawMode(exports.DrawMode.Off);
            this.removeAllFeatureGroups();
        };
        // make readable
        PolyDrawService.prototype.deletePolygon = function (polygon) {
            var _this = this;
            if (polygon.length > 1) {
                polygon.length = 1;
            }
            if (this.arrayOfFeatureGroups.length > 0) {
                this.arrayOfFeatureGroups.forEach(function (featureGroup) {
                    var layer = featureGroup.getLayers()[0];
                    var latlngs = layer.getLatLngs();
                    var length = latlngs.length;
                    //  = []
                    latlngs.forEach(function (latlng, index) {
                        var polygon3;
                        var test = __spread(latlng);
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
                        var equals = _this.polygonArrayEquals(polygon3, polygon);
                        if (equals && length === 1) {
                            _this.polygonInformation.deleteTrashcan(polygon);
                            _this.removeFeatureGroup(featureGroup);
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
            return this.drawModeSubject.value;
        };
        PolyDrawService.prototype.addViken = function (polygon) {
            this.addPolygonLayer(polygon, true);
        };
        // check this
        PolyDrawService.prototype.addAutoPolygon = function (geographicBorders) {
            var _this = this;
            geographicBorders.forEach(function (group) {
                var featureGroup = new leaflet.FeatureGroup();
                var polygon2 = _this.turfHelper.getMultiPolygon(_this.convertToCoords(group));
                var polygon = _this.getPolygon(polygon2);
                featureGroup.addLayer(polygon);
                var markerLatlngs = polygon.getLatLngs();
                markerLatlngs.forEach(function (polygon) {
                    polygon.forEach(function (polyElement, i) {
                        if (i === 0) {
                            _this.addMarker(polyElement, featureGroup);
                        }
                        else {
                            _this.addHoleMarker(polyElement, featureGroup);
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
        };
        // innehåll i if'ar flytta till egna metoder
        PolyDrawService.prototype.convertToCoords = function (latlngs) {
            var coords = [];
            if (latlngs.length > 1 && latlngs.length < 3) {
                var coordinates_1 = [];
                // tslint:disable-next-line: max-line-length
                var within = this.turfHelper.isWithin(leaflet.GeoJSON.latLngsToCoords(latlngs[latlngs.length - 1]), leaflet.GeoJSON.latLngsToCoords(latlngs[0]));
                if (within) {
                    latlngs.forEach(function (polygon) {
                        coordinates_1.push(leaflet.GeoJSON.latLngsToCoords(polygon));
                    });
                }
                else {
                    latlngs.forEach(function (polygon) {
                        coords.push([leaflet.GeoJSON.latLngsToCoords(polygon)]);
                    });
                }
                if (coordinates_1.length >= 1) {
                    coords.push(coordinates_1);
                }
            }
            else if (latlngs.length > 2) {
                var coordinates_2 = [];
                for (var index = 1; index < latlngs.length - 1; index++) {
                    var within = this.turfHelper.isWithin(leaflet.GeoJSON.latLngsToCoords(latlngs[index]), leaflet.GeoJSON.latLngsToCoords(latlngs[0]));
                    if (within) {
                        latlngs.forEach(function (polygon) {
                            coordinates_2.push(leaflet.GeoJSON.latLngsToCoords(polygon));
                        });
                        coords.push(coordinates_2);
                    }
                    else {
                        latlngs.forEach(function (polygon) {
                            coords.push([leaflet.GeoJSON.latLngsToCoords(polygon)]);
                        });
                    }
                }
            }
            else {
                coords.push([leaflet.GeoJSON.latLngsToCoords(latlngs[0])]);
            }
            return coords;
        };
        // fine
        PolyDrawService.prototype.initPolyDraw = function () {
            var _this = this;
            var container = this.map.getContainer();
            var drawMode = this.getDrawMode();
            if (this.config.touchSupport) {
                container.addEventListener("touchstart", function (e) {
                    _this.mouseDown(e);
                });
                container.addEventListener("touchend", function (e) {
                    if (drawMode !== exports.DrawMode.Off) {
                        _this.mouseUpLeave(e);
                    }
                });
                container.addEventListener("touchmove", function (e) {
                    if (drawMode !== exports.DrawMode.Off) {
                        _this.mouseMove(e);
                    }
                });
            }
            this.map.addLayer(this.tracer);
            this.setDrawMode(exports.DrawMode.Off);
        };
        // Test L.MouseEvent
        PolyDrawService.prototype.mouseDown = function (event) {
            if (event.originalEvent != null) {
                this.tracer.setLatLngs([event.latlng]);
            }
            else {
                var latlng = this.map.containerPointToLatLng([
                    event.touches[0].clientX,
                    event.touches[0].clientY,
                ]);
                this.tracer.setLatLngs([latlng]);
            }
            this.startDraw();
        };
        // TODO event type, create containerPointToLatLng-method
        PolyDrawService.prototype.mouseMove = function (event) {
            if (event.originalEvent != null) {
                this.tracer.addLatLng(event.latlng);
            }
            else {
                var latlng = this.map.containerPointToLatLng([
                    event.touches[0].clientX,
                    event.touches[0].clientY,
                ]);
                this.tracer.addLatLng(latlng);
            }
        };
        // fine
        PolyDrawService.prototype.mouseUpLeave = function (event) {
            this.polygonInformation.deletePolygonInformationStorage();
            var geoPos = this.turfHelper.turfConcaveman(this.tracer.toGeoJSON());
            this.stopDraw();
            switch (this.getDrawMode()) {
                case exports.DrawMode.Add:
                    this.addPolygon(geoPos, true);
                    break;
                case exports.DrawMode.Subtract:
                    this.subtractPolygon(geoPos);
                    break;
                default:
                    break;
            }
            this.polygonInformation.createPolygonInformationStorage(this.arrayOfFeatureGroups);
        };
        // fine
        PolyDrawService.prototype.startDraw = function () {
            this.drawStartedEvents(true);
        };
        // fine
        PolyDrawService.prototype.stopDraw = function () {
            this.resetTracker();
            this.drawStartedEvents(false);
        };
        PolyDrawService.prototype.onZoomChange = function (zoomLevel) {
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
            var _this = this;
            var onoroff = onoff ? "on" : "off";
            this.map[onoroff]("mousemove", this.mouseMove, this);
            this.map[onoroff]("mouseup", this.mouseUpLeave, this);
            if (onoff) {
                this.map
                    .getContainer()
                    .addEventListener("touchmove", function (e) { return _this.mouseMove(e); });
                this.map
                    .getContainer()
                    .addEventListener("touchend", function (e) { return _this.mouseUpLeave(e); });
            }
            else {
                this.map
                    .getContainer()
                    .removeEventListener("touchmove", function (e) { return _this.mouseMove(e); }, true);
                this.map
                    .getContainer()
                    .removeEventListener("touchend", function (e) { return _this.mouseUpLeave(e); }, true);
            }
        };
        // On hold
        PolyDrawService.prototype.subtractPolygon = function (latlngs) {
            this.subtract(latlngs);
        };
        // fine
        PolyDrawService.prototype.addPolygon = function (latlngs, simplify, noMerge) {
            if (noMerge === void 0) { noMerge = false; }
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
            var featureGroup = new leaflet.FeatureGroup();
            var latLngs = simplify ? this.turfHelper.getSimplified(latlngs) : latlngs;
            var polygon = this.getPolygon(latLngs);
            featureGroup.addLayer(polygon);
            var markerLatlngs = polygon.getLatLngs();
            markerLatlngs.forEach(function (polygon) {
                polygon.forEach(function (polyElement, i) {
                    if (i === 0) {
                        _this.addMarker(polyElement, featureGroup);
                    }
                    else {
                        _this.addHoleMarker(polyElement, featureGroup);
                    }
                });
                // this.addMarker(polygon[0], featureGroup);
                // TODO - Hvis polygon.length >1, så har den hull: egen addMarker funksjon
            });
            this.arrayOfFeatureGroups.push(featureGroup);
            this.polygonInformation.activate();
            this.setDrawMode(exports.DrawMode.Off);
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
                    newPoint.lat,
                ]);
                this.deletePolygon(this.getLatLngsFromJson(poly));
                this.addPolygonLayer(newPolygon, false);
            }
        };
        // fine
        PolyDrawService.prototype.getPolygon = function (latlngs) {
            var polygon = leaflet.GeoJSON.geometryToLayer(latlngs);
            polygon.setStyle(this.config.polygonOptions);
            return polygon;
        };
        // fine
        PolyDrawService.prototype.merge = function (latlngs) {
            var _this = this;
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
            var _this = this;
            var onoroff = onoff ? "on" : "off";
            this.map[onoroff]("mousedown", this.mouseDown, this);
            if (onoff) {
                this.map
                    .getContainer()
                    .addEventListener("touchstart", function (e) { return _this.mouseDown(e); });
            }
            else {
                this.map
                    .getContainer()
                    .removeEventListener("touchstart", function (e) { return _this.mouseDown(e); }, true);
            }
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
                var marker = new leaflet.Marker(latlng, {
                    icon: _this.createDivIcon(iconClasses),
                    draggable: true,
                    title: i.toString(),
                });
                FeatureGroup.addLayer(marker).addTo(_this.map);
                marker.on("drag", function (e) {
                    _this.markerDrag(FeatureGroup);
                });
                marker.on("dragend", function (e) {
                    _this.markerDragEnd(FeatureGroup);
                });
                if (i === menuMarkerIdx && _this.config.markers.menu) {
                    // marker.bindPopup(
                    //   this.getHtmlContent(e => {
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
                var marker = new leaflet.Marker(latlng, {
                    icon: _this.createDivIcon(iconClasses),
                    draggable: true,
                    title: i.toString(),
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
            var icon = leaflet.divIcon({ className: classes });
            return icon;
        };
        // TODO: Cleanup
        PolyDrawService.prototype.markerDrag = function (FeatureGroup) {
            var newPos = [];
            var testarray = [];
            var hole = [];
            var layerLength = FeatureGroup.getLayers();
            var posarrays = layerLength[0].getLatLngs();
            var length = 0;
            if (posarrays.length > 1) {
                for (var index = 0; index < posarrays.length; index++) {
                    testarray = [];
                    hole = [];
                    if (index === 0) {
                        if (posarrays[0].length > 1) {
                            for (var i = 0; index < posarrays[0].length; i++) {
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
                        newPos.push(hole);
                    }
                    else {
                        length += posarrays[index - 1][0].length;
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
            }
            layerLength[0].setLatLngs(newPos);
        };
        // check this
        PolyDrawService.prototype.markerDragEnd = function (FeatureGroup) {
            var _this = this;
            this.polygonInformation.deletePolygonInformationStorage();
            var featureCollection = FeatureGroup.toGeoJSON();
            if (featureCollection.features[0].geometry.coordinates.length > 1) {
                featureCollection.features[0].geometry.coordinates.forEach(function (element) {
                    var feature = _this.turfHelper.getMultiPolygon([element]);
                    if (_this.turfHelper.hasKinks(feature)) {
                        _this.kinks = true;
                        var unkink = _this.turfHelper.getKinks(feature);
                        // this.deletePolygon(this.getLatLngsFromJson(feature));
                        _this.removeFeatureGroup(FeatureGroup);
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
                if (this.turfHelper.hasKinks(feature)) {
                    this.kinks = true;
                    var unkink = this.turfHelper.getKinks(feature);
                    // this.deletePolygon(this.getLatLngsFromJson(feature));
                    this.removeFeatureGroup(FeatureGroup);
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
            var coord;
            if (feature) {
                if (feature.geometry.coordinates.length > 1 &&
                    feature.geometry.type === "MultiPolygon") {
                    coord = leaflet.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
                }
                else if (feature.geometry.coordinates[0].length > 1 &&
                    feature.geometry.type === "Polygon") {
                    coord = leaflet.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0]);
                }
                else {
                    coord = leaflet.GeoJSON.coordsToLatLngs(feature.geometry.coordinates[0][0]);
                }
            }
            return coord;
        };
        // fine
        PolyDrawService.prototype.unionPolygons = function (layers, latlngs, polygonFeature) {
            var _this = this;
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
            featureGroup.clearLayers();
            this.arrayOfFeatureGroups = this.arrayOfFeatureGroups.filter(function (featureGroups) { return featureGroups !== featureGroup; });
            // this.updatePolygons();
            this.map.removeLayer(featureGroup);
        };
        // fine until refactoring
        PolyDrawService.prototype.removeFeatureGroupOnMerge = function (featureGroup) {
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
            this.drawModeSubject.next(mode);
            if (!!this.map) {
                var isActiveDrawMode = true;
                switch (mode) {
                    case exports.DrawMode.Off:
                        leaflet.DomUtil.removeClass(this.map.getContainer(), "crosshair-cursor-enabled");
                        this.events(false);
                        this.stopDraw();
                        this.tracer.setStyle({
                            color: "",
                        });
                        this.setLeafletMapEvents(true, true, true);
                        isActiveDrawMode = false;
                        break;
                    case exports.DrawMode.Add:
                        leaflet.DomUtil.addClass(this.map.getContainer(), "crosshair-cursor-enabled");
                        this.events(true);
                        this.tracer.setStyle({
                            color: defaultConfig.polyLineOptions.color,
                        });
                        this.setLeafletMapEvents(false, false, false);
                        break;
                    case exports.DrawMode.Subtract:
                        leaflet.DomUtil.addClass(this.map.getContainer(), "crosshair-cursor-enabled");
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
        };
        PolyDrawService.prototype.modeChange = function (mode) {
            this.setDrawMode(mode);
            this.polygonInformation.saveCurrentState();
        };
        // remove, use modeChange
        PolyDrawService.prototype.drawModeClick = function () {
            if (this.polygonInformation.polygonDrawStates.isFreeDrawMode) {
                this.polygonInformation.setMoveMode();
                this.setDrawMode(exports.DrawMode.Off);
            }
            else {
                this.polygonInformation.setFreeDrawMode();
                this.setDrawMode(exports.DrawMode.Add);
            }
            this.polygonInformation.saveCurrentState();
        };
        // remove, use modeChange
        PolyDrawService.prototype.freedrawMenuClick = function () {
            this.setDrawMode(exports.DrawMode.Add);
            this.polygonInformation.activate();
            this.polygonInformation.saveCurrentState();
        };
        // remove, use modeChange
        PolyDrawService.prototype.subtractClick = function () {
            this.setDrawMode(exports.DrawMode.Subtract);
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
                callBack(e);
            });
            comp.instance.simplyfiClicked.subscribe(function (e) {
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
                lng: compassDirection.lng,
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
        PolyDrawService.ɵprov = core.ɵɵdefineInjectable({ factory: function PolyDrawService_Factory() { return new PolyDrawService(core.ɵɵinject(PolyStateService), core.ɵɵinject(ComponentGeneraterService), core.ɵɵinject(TurfHelperService), core.ɵɵinject(PolygonInformationService), core.ɵɵinject(LeafletHelperService)); }, token: PolyDrawService, providedIn: "root" });
        PolyDrawService = __decorate([
            core.Injectable({
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
        return PolyDrawService;
    }());

    var MyLibModule = /** @class */ (function () {
        function MyLibModule() {
        }
        MyLibModule = __decorate([
            core.NgModule({
                declarations: [AlterPolygonComponent],
                imports: [],
                providers: [PolyDrawService, PolygonInformationService, PolyStateService],
                exports: [AlterPolygonComponent],
                entryComponents: [AlterPolygonComponent]
            })
        ], MyLibModule);
        return MyLibModule;
    }());

    exports.AlterPolygonComponent = AlterPolygonComponent;
    exports.ComponentGeneraterService = ComponentGeneraterService;
    exports.MyLibModule = MyLibModule;
    exports.PolyDrawService = PolyDrawService;
    exports.PolyStateService = PolyStateService;
    exports.PolygonDrawStates = PolygonDrawStates;
    exports.PolygonInfo = PolygonInfo;
    exports.PolygonInformationService = PolygonInformationService;
    exports.ɵ0 = ɵ0;
    exports.ɵ1 = ɵ1;
    exports.ɵa = TurfHelperService;
    exports.ɵb = LeafletHelperService;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=my-lib.umd.js.map
