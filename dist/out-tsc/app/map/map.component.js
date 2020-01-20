var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import * as L from "leaflet";
import { MapStateService } from './map-state.service';
var MapComponent = /** @class */ (function () {
    function MapComponent(mapState) {
        this.mapState = mapState;
    }
    MapComponent.prototype.ngAfterViewInit = function () {
        this.initMap();
    };
    MapComponent.prototype.initMap = function () {
        this.map = new L.Map("map");
        this.map.setView(new L.LatLng(59.913491, 10.723933), 16);
        /*    L.tileLayer(`http://{s}.basemaps.cartocdn.com/hot/{z}/{x}/{y}.png`, {
                   maxZoom: 20,
                  //  minZoom: 3,
                   maxBounds: [
                     [90, -180],
                     [-90, 180]
                     ],
                    noWrap: true,
                   attribution: 'HOT'
                }).addTo(this.map); */
        L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            maxZoom: 20,
            maxBounds: [
                [90, -180],
                [-90, 180]
            ],
            noWrap: true,
            attribution: 'HOT'
        }).addTo(this.map);
        this.mapState.updateMapState(this.map);
    };
    MapComponent = __decorate([
        Component({
            selector: 'map-cmp',
            template: "\n  <div id=\"map\">map</div>\n  ",
            styles: ["\n  #map{\n    height:100%;\n    width:100%;\n    border:1px solid red;\n  }\n  "]
        }),
        __metadata("design:paramtypes", [MapStateService])
    ], MapComponent);
    return MapComponent;
}());
export { MapComponent };
//# sourceMappingURL=map.component.js.map