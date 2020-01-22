import { NgModule } from "@angular/core";
import { AlterPolygonComponent } from "./popups/alter-polygon/alter-polygon.component";
import { PolyDrawService } from './polydraw.service';

@NgModule({
  declarations: [ AlterPolygonComponent],
  imports: [],
  providers:[PolyDrawService],
  exports: [ ]
})
export class MyLibModule {}
