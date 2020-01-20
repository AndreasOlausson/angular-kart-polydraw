import * as L from "leaflet";
import { MarkerPlacement } from "./enums";
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
        var polyLine = new L.Polyline(tmpLatLng);
        var bounds = polyLine.getBounds();
        if (padding !== 0) {
            return bounds.pad(padding);
        }
        return bounds;
    };
    return PolyDrawUtil;
}());
export { PolyDrawUtil };
//TODO make compass ILatLng
var Compass = /** @class */ (function () {
    function Compass(minLat, minLng, maxLat, maxLng) {
        if (minLat === void 0) { minLat = 0; }
        if (minLng === void 0) { minLng = 0; }
        if (maxLat === void 0) { maxLat = 0; }
        if (maxLng === void 0) { maxLng = 0; }
        this.direction = {
            BoundingBoxCenter: [0, 0],
            CenterOfMass: [0, 0],
            East: [0, 0],
            North: [0, 0],
            NorthEast: [0, 0],
            NorthWest: [0, 0],
            South: [0, 0],
            SouthEast: [0, 0],
            SouthWest: [0, 0],
            West: [0, 0]
        };
        this.direction.North = [(minLat + maxLat) / 2, maxLng];
        this.direction.NorthEast = [maxLat, maxLng];
        this.direction.East = [maxLat, (minLng + maxLng) / 2];
        this.direction.SouthEast = [maxLat, minLng];
        this.direction.South = [(minLat + maxLat) / 2, minLng];
        this.direction.SouthWest = [minLat, minLng];
        this.direction.West = [minLat, (minLng + maxLng) / 2];
        this.direction.NorthWest = [minLat, maxLng];
        this.direction.CenterOfMass = [0, 0];
        this.direction.BoundingBoxCenter = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
    }
    //TODO default return.
    Compass.prototype.getDirection = function (direction) {
        switch (direction) {
            case MarkerPlacement.CenterOfMass:
                return this.direction.CenterOfMass;
            case MarkerPlacement.North:
                return this.direction.North;
            case MarkerPlacement.NorthEast:
                return this.direction.NorthEast;
            case MarkerPlacement.East:
                return this.direction.East;
            case MarkerPlacement.SouthEast:
                return this.direction.SouthEast;
            case MarkerPlacement.South:
                return this.direction.South;
            case MarkerPlacement.SouthWest:
                return this.direction.SouthWest;
            case MarkerPlacement.West:
                return this.direction.West;
            case MarkerPlacement.NorthWest:
                return this.direction.NorthWest;
            case MarkerPlacement.BoundingBoxCenter:
                return this.direction.BoundingBoxCenter;
            default:
                return this.direction.North;
        }
    };
    return Compass;
}());
export { Compass };
//# sourceMappingURL=utils.js.map