import { Injectable } from '@angular/core';

import {Observable} from "rxjs";
// import 'rxjs/add/observable/of';

import L from 'leaflet';
import FreeDraw from 'leaflet-freedraw';

import PolyDraw from "../scripts/polydraw/polydraw"

@Injectable()
export class MapHelperService {
  public map; 
  pd = new PolyDraw();

initMap(){
     this.map = new L.Map("map");
     this.map.setView(new L.LatLng(59.911491, 10.757933), 14);
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
          }).addTo(this.map);
   
   this.map.addLayer(this.pd);
   this.pd.onAdd(this.map)
   this.pd.__events('off');
   
} 

    draw(mode:number){
      console.log(mode)
      if(mode === 1){
        console.log("setMode");
        this.pd.__events('on');
        this.pd.setMode("add")
      }
      else if(mode === 2){
        
        this.pd.__events('on');
        this.pd.setMode("subtract")
      }
      else{
        console.log("draw: ");
      
    }
    
    }
}