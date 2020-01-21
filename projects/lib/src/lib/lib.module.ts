import { NgModule } from '@angular/core';
import { LibComponent } from './lib.component';
import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';

@NgModule({
  declarations: [LibComponent, AlterPolygonComponent],
  imports: [
  ],
  exports: [LibComponent, AlterPolygonComponent]
})
export class LibModule { }
