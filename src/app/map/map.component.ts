import { Component, OnChanges, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import {MapHelperService} from './map-helper.service'
import { DrawMode } from '../scripts/polydraw/polydraw';



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
  @Output() newDrawMode: EventEmitter<number> = new EventEmitter();
  
  constructor(private helper:MapHelperService){

  }

  ngOnChanges(ch) {
    if(ch.mode.currentValue != null){
      console.dir(ch);
      this.helper.setDrawMode(ch.mode.currentValue)
      
    }
  }

  ngAfterViewInit() {
    this.helper.initMap(); 
    this.helper.drawMode$.subscribe(mode =>{
      
      this.newDrawMode.emit(mode)
    })  
  }

}
