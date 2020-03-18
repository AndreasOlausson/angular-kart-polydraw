import "reflect-metadata";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { MapComponent } from './map/map.component';
import { MapStateService } from './map/map-state';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, HelloComponent,
    MapComponent,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
  ],
  providers:[
    MapStateService,
  ]
})
export class AppModule { }
