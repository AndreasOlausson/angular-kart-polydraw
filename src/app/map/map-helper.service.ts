import { Injectable } from '@angular/core';

import {Observable} from "rxjs";
// import 'rxjs/add/observable/of';

import L from 'leaflet';
import FreeDraw from 'leaflet-freedraw';

import PolyDraw, { NONE, CREATE, EDIT, DELETE, APPEND, ALL, polygons } from "../scripts/polydraw/polydraw"

@Injectable()
export class MapHelperService {
  public map; 
  pd = new PolyDraw({mode: ALL});
  polygons = polygons; 

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
   
} 
   drawPoints(data){
      // points
      data.points.forEach(p=>this.addMarker(p.pos.lat, p.pos.lon));
      // lines
      data.lines.forEach(l=>{
        // src
        this.addMarker(l.pos.src.lat, l.pos.src.lon);
        // dest
        this.addMarker(l.pos.dest.lat, l.pos.dest.lon);
        // line       
        this.addLine(l.pos.src, l.pos.dest);             
      });
   }

    draw(mode: number){
      console.log(mode)
      if(mode === 4){
        this.deletePolygon()
      }
      else{
        console.log("draw: ", this.polygons);
      this.pd.mode(mode)
    }
    
    }

    deletePolygon(){
      this.pd.clear();
    }

   addMarker(lat,lng){
    let m = L.marker([lat,lng]).addTo(this.map);
   }
   addLine(src, dest) {
         let line = L.polyline(
                [
                    [src.lat, src.lon],
                    [dest.lat, dest.lon]
                ],
                {color: 'red'}
         ).addTo(this.map)
   }
}