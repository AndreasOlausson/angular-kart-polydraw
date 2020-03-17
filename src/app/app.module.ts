import "reflect-metadata";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { MapComponent } from './map/map.component';
import { AlterPolygonComponent } from './map/popups/alter-polygon/alter-polygon.component';
import { InfoMarkerPopupComponent } from './map/popups/info-marker/info-marker.component';
import { MapStateService } from './map/map-state';
import { PolygonInformationService } from './map/polygon-information';
import { ComponentGeneratorService } from './map/component-generator.service';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, HelloComponent,
    MapComponent,
    // AlterPolygonComponent,
    InfoMarkerPopupComponent],
  bootstrap: [AppComponent],
  entryComponents: [
    // AlterPolygonComponent,
    InfoMarkerPopupComponent
  ],
  providers:[
    MapStateService,
  ]
})
export class AppModule { }
