import { BehaviorSubject } from 'rxjs';
/* @Injectable({
    providedIn: 'root'
}) */
var MapStateService = /** @class */ (function () {
    function MapStateService() {
        this.mapSubject = new BehaviorSubject(null);
        this.map$ = this.mapSubject.asObservable();
    }
    MapStateService.prototype.updateMapState = function (map) {
        this.mapSubject.next(map);
    };
    MapStateService.prototype.updatePolygons = function (polygons) {
        console.log("map-state", polygons);
    };
    return MapStateService;
}());
export { MapStateService };
//# sourceMappingURL=map-state.service.js.map