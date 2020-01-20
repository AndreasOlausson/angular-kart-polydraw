import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AlterPolygonComponent } from './map/popups/alter-polygon/alter-polygon.component';
export {PolygonInformationService} from "./map/polygon-information.service"
export {MapStateService} from "./map/map-state.service"
@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ 
  AlterPolygonComponent ],
  bootstrap:    [  ],
  entryComponents:[
    AlterPolygonComponent
  ]
})
export class AppModule { }