import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import {MapComponent} from './map/map.component';

import { LibModule } from 'projects/lib/src/public_api';


@NgModule({
  imports:      [ BrowserModule, FormsModule, LibModule ],
  declarations: [ AppComponent, HelloComponent,
  MapComponent, ],
  bootstrap:    [ AppComponent ],
  
})
export class AppModule { }
