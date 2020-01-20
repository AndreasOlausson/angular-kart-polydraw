import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AlterPolygonComponent } from './map/popups/alter-polygon/alter-polygon.component';

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