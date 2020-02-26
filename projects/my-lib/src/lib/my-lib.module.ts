import { NgModule } from "@angular/core";
import { AlterPolygonComponent } from "./popups/alter-polygon/alter-polygon.component";
import { ComponentGeneraterService } from './component-generater.service';

@NgModule({
  declarations: [ AlterPolygonComponent],
  imports: [],
  providers: [ComponentGeneraterService],
  exports: [AlterPolygonComponent ],
  entryComponents: [AlterPolygonComponent]
})
export class MyLibModule {}
