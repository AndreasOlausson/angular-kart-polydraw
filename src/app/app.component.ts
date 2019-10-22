import { Component } from '@angular/core';
import * as L  from 'leaflet';




@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  name = 'Angular';


togglePolyDraw(idx: number): void {
  console.log(idx);
         
}

}
