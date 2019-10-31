import { Component } from '@angular/core';




@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  name = 'Angular';
  mode: number = 0;

togglePolyDraw(idx: number): void {
  console.log(idx);
  this.mode = idx
         
}

setDrawMode(drawMode:number){
  console.log("setDrawMode:", drawMode);
  this.mode = drawMode
}

}
