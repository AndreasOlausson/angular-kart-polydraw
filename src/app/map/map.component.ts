import { Component, OnChanges, AfterViewInit, Input } from '@angular/core';
import {MapHelperService} from './map-helper.service'



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
  ` ],
  providers:[MapHelperService]
 
})
export class MapComponent implements OnChanges, AfterViewInit {
  map;
  @Input() mode: number; 
  
  constructor(private helper:MapHelperService){

  }

  ngOnChanges(ch) {
    if(ch.mode.currentValue != null){
      console.dir(ch);
      this.helper.draw(ch.mode.currentValue)
    }
   

  }

  ngAfterViewInit() {
    this.helper.initMap();   
  }

}
