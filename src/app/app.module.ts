import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import {MapComponent} from './map/map.component';
import { AlterPolygonComponent } from './map/popups/alter-polygon/alter-polygon.component';
import { LibModule } from 'lib';

@NgModule({
  imports:      [ BrowserModule, FormsModule, LibModule ],
  declarations: [ AppComponent, HelloComponent,
  MapComponent,
  AlterPolygonComponent ],
  bootstrap:    [ AppComponent ],
  entryComponents:[
    AlterPolygonComponent
  ]
})
export class AppModule { }
