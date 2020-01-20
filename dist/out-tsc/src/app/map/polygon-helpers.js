import { PolygonUtil } from "./polygon.util";
var PolygonInfo = /** @class */ (function () {
    function PolygonInfo(polygon) {
        var _this = this;
        this.polygon = [];
        this.trashcanPoint = [];
        this.sqmArea = [];
        this.perimeter = [];
        console.log("PolygonInfo: ", polygon);
        polygon.forEach(function (polygons, i) {
            _this.trashcanPoint[i] = _this.getTrashcanPoint(polygons[0]);
            _this.sqmArea[i] = _this.calculatePolygonArea(polygons[0]);
            _this.perimeter[i] = _this.calculatePolygonPerimeter(polygons[0]);
            console.log(polygons[0]);
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
        var secondPoint = (previousPoint.lng < nextPoint.lng) ? previousPoint : nextPoint;
        var midpoint = PolygonUtil.getMidPoint(polygon[idx], secondPoint);
        return midpoint;
    };
    PolygonInfo.prototype.calculatePolygonArea = function (polygon) {
        var area = PolygonUtil.getSqmArea((polygon));
        return area;
    };
    PolygonInfo.prototype.calculatePolygonPerimeter = function (polygon) {
        var perimeter = PolygonUtil.getPerimeter((polygon));
        return perimeter;
    };
    return PolygonInfo;
}());
export { PolygonInfo };
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
export { PolygonDrawStates };
//# sourceMappingURL=polygon-helpers.js.map