import { NgModule } from "@angular/core";
import { MyLibComponent } from "./my-lib.component";
import { AlterPolygonComponent } from "./popups/alter-polygon/alter-polygon.component";

@NgModule({
  declarations: [MyLibComponent, AlterPolygonComponent],
  imports: [],
  exports: [MyLibComponent, AlterPolygonComponent]
})
export class MyLibModule {}
