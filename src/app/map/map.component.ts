import { Component, OnChanges, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

import * as L from "leaflet"
import { MapStateService } from './map-state.service';

@Component({
  selector: 'map-cmp',
  template:`
  <div id="map">map</div>
  `,
  styles:[`
  #map{
    height:100%;
    width:100%;
    border:1px solid red;
  }
  ` ]
 
})
export class MapComponent {
  map;


 

  constructor(private mapState: MapStateService){

  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(){
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

           L.tileLayer(`https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`, {
            maxZoom: 20,
              maxBounds: [
              [90, -180],
              [-90, 180]
              ],
              noWrap: true,
            attribution: 'HOT'
         } as any).addTo(this.map);
    this.mapState.updateMapState(this.map)
  }
  

}
