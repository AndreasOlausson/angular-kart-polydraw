import { Component } from '@angular/core';
import { MapHelperService } from './map/map-helper.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  name = 'Angular';

  constructor(private readonly mapHelperService: MapHelperService){

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }


onFreedrawMenuClick(): void { 
     this.mapHelperService.freedrawMenuClick();             
}


}
