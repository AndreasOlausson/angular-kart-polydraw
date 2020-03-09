import { NgModule } from "@angular/core";
import { AlterPolygonComponent } from "./popups/alter-polygon/alter-polygon.component";
import { PolyDrawService } from './polydraw.service';
import { PolygonInformationService } from './polygon-information.service';
import { PolyStateService } from './map-state.service';

@NgModule({
  declarations: [ AlterPolygonComponent],
  imports: [],
  providers: [PolyDrawService, PolygonInformationService, PolyStateService],
  exports: [AlterPolygonComponent ],
  entryComponents: [AlterPolygonComponent]
})
export class MyLibModule {}
