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
            // case MarkerPlacement.CenterOfMass:
            //     return this.direction.CenterOfMass;
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
            // case MarkerPlacement.BoundingBoxCenter:
            //     return this.direction.BoundingBoxCenter;
            default:
                return this.direction.North;
        }
    };
    return Compass;
}());
export { Compass };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxLQUFLLENBQUMsTUFBTSxTQUFTLENBQUM7QUFFN0IsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUcxQztJQUFBO0lBZUEsQ0FBQztJQWRVLHNCQUFTLEdBQWhCLFVBQWlCLE9BQWtCLEVBQUUsT0FBbUI7UUFBbkIsd0JBQUEsRUFBQSxXQUFtQjtRQUNwRCxJQUFNLFNBQVMsR0FBZSxFQUFFLENBQUM7UUFDakMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7WUFDZCxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTthQUNuQztZQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBYyxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFNLFFBQVEsR0FBZSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkQsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3BDLElBQUksT0FBTyxLQUFLLENBQUMsRUFBRTtZQUNmLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM5QjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDTCxtQkFBQztBQUFELENBQUMsQUFmRCxJQWVDOztBQUNELDJCQUEyQjtBQUMzQjtJQWVJLGlCQUFZLE1BQWtCLEVBQUUsTUFBa0IsRUFBRSxNQUFrQixFQUFFLE1BQWtCO1FBQTlFLHVCQUFBLEVBQUEsVUFBa0I7UUFBRSx1QkFBQSxFQUFBLFVBQWtCO1FBQUUsdUJBQUEsRUFBQSxVQUFrQjtRQUFFLHVCQUFBLEVBQUEsVUFBa0I7UUFibkYsY0FB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QztZQUNoQyxLQUFLLGVBQWUsQ0FBQyxTQUFTO2dCQUMxQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO1lBQ3BDLEtBQUssZUFBZSxDQUFDLElBQUk7Z0JBQ3JCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7WUFDL0IsS0FBSyxlQUFlLENBQUMsU0FBUztnQkFDMUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztZQUNwQywwQ0FBMEM7WUFDMUMsK0NBQStDO1lBQy9DO2dCQUNJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7U0FDbkM7SUFDTCxDQUFDO0lBQ0wsY0FBQztBQUFELENBQUMsQUF2REQsSUF1REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJQ29tcGFzcyB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xyXG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCI7XHJcbmltcG9ydCB7IElMYXRMbmcgfSBmcm9tIFwiLi9wb2x5Z29uLWhlbHBlcnNcIjtcclxuaW1wb3J0IHsgTWFya2VyUGxhY2VtZW50IH0gZnJvbSBcIi4vZW51bXNcIjtcclxuaW1wb3J0IHsgVHVyZkhlbHBlclNlcnZpY2UgfSBmcm9tIFwiLi90dXJmLWhlbHBlci5zZXJ2aWNlXCJcclxuXHJcbmV4cG9ydCBjbGFzcyBQb2x5RHJhd1V0aWwge1xyXG4gICAgc3RhdGljIGdldEJvdW5kcyhwb2x5Z29uOiBJTGF0TG5nW10sIHBhZGRpbmc6IG51bWJlciA9IDApOiBMLkxhdExuZ0JvdW5kcyB7XHJcbiAgICAgICAgY29uc3QgdG1wTGF0TG5nOiBMLkxhdExuZ1tdID0gW107XHJcbiAgICAgICAgcG9seWdvbi5mb3JFYWNoKGxsID0+IHtcclxuICAgICAgICAgICAgaWYgKGlzTmFOKGxsLmxhdCkgfHwgaXNOYU4obGwubG5nKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRtcExhdExuZy5wdXNoKGxsIGFzIEwuTGF0TG5nKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBwb2x5TGluZTogTC5Qb2x5bGluZSA9IG5ldyBMLlBvbHlsaW5lKHRtcExhdExuZyk7XHJcbiAgICAgICAgY29uc3QgYm91bmRzID0gcG9seUxpbmUuZ2V0Qm91bmRzKCk7XHJcbiAgICAgICAgaWYgKHBhZGRpbmcgIT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJvdW5kcy5wYWQocGFkZGluZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBib3VuZHM7XHJcbiAgICB9XHJcbn1cclxuLy9UT0RPIG1ha2UgY29tcGFzcyBJTGF0TG5nXHJcbmV4cG9ydCBjbGFzcyBDb21wYXNzIHtcclxuXHJcbiAgICBwdWJsaWMgZGlyZWN0aW9uOiBJQ29tcGFzcyA9IHtcclxuICAgICAgICAvLyBCb3VuZGluZ0JveENlbnRlcjogeyBsYXQ6IDAsIGxuZzogMCB9LFxyXG4gICAgICAgIC8vIENlbnRlck9mTWFzczogeyBsYXQ6IDAsIGxuZzogMCB9LFxyXG4gICAgICAgIEVhc3Q6IHsgbGF0OiAwLCBsbmc6IDAgfSxcclxuICAgICAgICBOb3J0aDogeyBsYXQ6IDAsIGxuZzogMCB9LFxyXG4gICAgICAgIE5vcnRoRWFzdDogeyBsYXQ6IDAsIGxuZzogMCB9LFxyXG4gICAgICAgIE5vcnRoV2VzdDogeyBsYXQ6IDAsIGxuZzogMCB9LFxyXG4gICAgICAgIFNvdXRoOiB7IGxhdDogMCwgbG5nOiAwIH0sXHJcbiAgICAgICAgU291dGhFYXN0OiB7IGxhdDogMCwgbG5nOiAwIH0sXHJcbiAgICAgICAgU291dGhXZXN0OiB7IGxhdDogMCwgbG5nOiAwIH0sXHJcbiAgICAgICAgV2VzdDogeyBsYXQ6IDAsIGxuZzogMCB9XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1pbkxhdDogbnVtYmVyID0gMCwgbWluTG5nOiBudW1iZXIgPSAwLCBtYXhMYXQ6IG51bWJlciA9IDAsIG1heExuZzogbnVtYmVyID0gMCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uLk5vcnRoID0ge2xhdDogbWF4TGF0LCBsbmc6IChtaW5MbmcgKyBtYXhMbmcpIC8gMn07XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24uTm9ydGhFYXN0ID0ge2xhdDogbWF4TGF0LCBsbmc6IG1heExuZ307XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24uRWFzdCA9IHtsYXQ6IChtaW5MYXQgKyBtYXhMYXQpIC8gMiwgbG5nOiBtYXhMbmd9O1xyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uLlNvdXRoRWFzdCA9IHtsYXQ6IG1pbkxhdCwgbG5nOiBtYXhMbmd9O1xyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uLlNvdXRoID0ge2xhdDogbWluTGF0LCBsbmc6IChtaW5MbmcgKyBtYXhMbmcpIC8gMn07XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24uU291dGhXZXN0ID0ge2xhdDogbWluTGF0LCBsbmc6IG1pbkxuZ307XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24uV2VzdCA9IHtsYXQ6KG1pbkxhdCArIG1heExhdCkgLyAyLCBsbmc6IG1pbkxuZ307XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24uTm9ydGhXZXN0ID0ge2xhdDogbWF4TGF0LCBsbmc6IG1pbkxuZ307XHJcbiAgICAgICAgLy8gdGhpcy5kaXJlY3Rpb24uQ2VudGVyT2ZNYXNzID0geyBsYXQ6IDAsIGxuZzogMCB9O1xyXG4gICAgICAgIC8vIHRoaXMuZGlyZWN0aW9uLkJvdW5kaW5nQm94Q2VudGVyID0ge2xhdDogKG1pbkxhdCArIG1heExhdCkgLyAyLCBsbmc6IChtaW5MbmcgKyBtYXhMbmcpIC8gMn07XHJcbiAgICB9XHJcbiAgICAvL1RPRE8gZGVmYXVsdCByZXR1cm4uXHJcbiAgICBnZXREaXJlY3Rpb24oZGlyZWN0aW9uOiBNYXJrZXJQbGFjZW1lbnQpIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICAvLyBjYXNlIE1hcmtlclBsYWNlbWVudC5DZW50ZXJPZk1hc3M6XHJcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24uQ2VudGVyT2ZNYXNzO1xyXG4gICAgICAgICAgICBjYXNlIE1hcmtlclBsYWNlbWVudC5Ob3J0aDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbi5Ob3J0aDtcclxuICAgICAgICAgICAgY2FzZSBNYXJrZXJQbGFjZW1lbnQuTm9ydGhFYXN0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uLk5vcnRoRWFzdDtcclxuICAgICAgICAgICAgY2FzZSBNYXJrZXJQbGFjZW1lbnQuRWFzdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbi5FYXN0O1xyXG4gICAgICAgICAgICBjYXNlIE1hcmtlclBsYWNlbWVudC5Tb3V0aEVhc3Q6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24uU291dGhFYXN0O1xyXG4gICAgICAgICAgICBjYXNlIE1hcmtlclBsYWNlbWVudC5Tb3V0aDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbi5Tb3V0aDtcclxuICAgICAgICAgICAgY2FzZSBNYXJrZXJQbGFjZW1lbnQuU291dGhXZXN0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uLlNvdXRoV2VzdDtcclxuICAgICAgICAgICAgY2FzZSBNYXJrZXJQbGFjZW1lbnQuV2VzdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbi5XZXN0O1xyXG4gICAgICAgICAgICBjYXNlIE1hcmtlclBsYWNlbWVudC5Ob3J0aFdlc3Q6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24uTm9ydGhXZXN0O1xyXG4gICAgICAgICAgICAvLyBjYXNlIE1hcmtlclBsYWNlbWVudC5Cb3VuZGluZ0JveENlbnRlcjpcclxuICAgICAgICAgICAgLy8gICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbi5Cb3VuZGluZ0JveENlbnRlcjtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbi5Ob3J0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=