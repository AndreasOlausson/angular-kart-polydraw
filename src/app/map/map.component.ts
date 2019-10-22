import { Component, OnChanges, AfterViewInit } from '@angular/core';
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
  constructor(private helper:MapHelperService){

  }

  ngOnChanges(ch) {
    
  }

  ngAfterViewInit() {
    this.helper.initMap();   
  }

}
