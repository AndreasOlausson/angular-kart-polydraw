import { Component } from '@angular/core';
import { MapHelperService } from './map/map-helper.service';
import { ILatLng } from './map/polygon-helpers';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  name = 'Angular';

  pn0254: ILatLng[][] = [
  
    [
      { lat: 59.9137669995347, lng: 10.716912 },
      { lat: 59.9119439995347, lng: 10.718086 },
      { lat: 59.9122099995347, lng: 10.719407 },
      { lat: 59.9119269995347, lng: 10.721145 },
      { lat: 59.9123129995347, lng: 10.722227 },
      { lat: 59.9121599995347, lng: 10.722759 },
      { lat: 59.9118759995347, lng: 10.722396 },
      { lat: 59.9117869995347, lng: 10.72365 },
      { lat: 59.9124999995347, lng: 10.723694 },
      { lat: 59.9122829995347, lng: 10.724347 },
      { lat: 59.9128319995347, lng: 10.725652 },
      { lat: 59.9132499995347, lng: 10.723503 },
      { lat: 59.9134449995347, lng: 10.723672 },
      { lat: 59.9140599995347, lng: 10.722228 },
      { lat: 59.9145049995347, lng: 10.723162 },
      { lat: 59.9152129995348, lng: 10.722434 },
      { lat: 59.9148489995347, lng: 10.720304 },
      { lat: 59.9145679995347, lng: 10.720726 },
      { lat: 59.9141289995347, lng: 10.719708 },
      { lat: 59.9144329995347, lng: 10.718779 },
      { lat: 59.9142809995348, lng: 10.718283 },
      { lat: 59.9139759995347, lng: 10.718653 },
      { lat: 59.9137669995347, lng: 10.716912 }
    ],
    [
      { lat: 59.9132319995347, lng: 10.722003 },
      { lat: 59.9134349995347, lng: 10.721425 },
      { lat: 59.9136029995347, lng: 10.721683 },
      { lat: 59.9130309995347, lng: 10.723528 },
      { lat: 59.9124709995347, lng: 10.723031 },
      { lat: 59.9125529995347, lng: 10.721881 },
      { lat: 59.9132319995347, lng: 10.722003 }
    ]
  ];

  pn0253: ILatLng[][] = [
    [
      { lat: 59.9132319995347, lng: 10.722003 },
      { lat: 59.9125529995347, lng: 10.721881 },
      { lat: 59.9124709995347, lng: 10.723031 },
      { lat: 59.9130309995347, lng: 10.723528 },
      { lat: 59.9136029995347, lng: 10.721683 },
      { lat: 59.9134349995347, lng: 10.721425 },
      { lat: 59.9132319995347, lng: 10.722003 }
    ],
    [
      { lat: 59.9150619995347, lng: 10.722853 },
      { lat: 59.9148829995347, lng: 10.722514 },
      { lat: 59.9145049995347, lng: 10.723162 },
      { lat: 59.9140599995347, lng: 10.722228 },
      { lat: 59.9134449995347, lng: 10.723672 },
      { lat: 59.9132499995347, lng: 10.723503 },
      { lat: 59.9128319995347, lng: 10.725652 },
      { lat: 59.9137149995347, lng: 10.72558 },
      { lat: 59.9147939995347, lng: 10.727637 },
      { lat: 59.9151369995347, lng: 10.72675 },
      { lat: 59.9151279995347, lng: 10.724659 },
      { lat: 59.9146349995347, lng: 10.723891 },
      { lat: 59.9150619995347, lng: 10.722853 }
    ],
    [
      { lat: 59.9117199995347, lng: 10.720544 },
      { lat: 59.9112809995347, lng: 10.720322 },
      { lat: 59.9111309995347, lng: 10.722066 },
      { lat: 59.9116549995347, lng: 10.722184 },
      { lat: 59.9115809995347, lng: 10.723459 },
      { lat: 59.9117869995347, lng: 10.72365 },
      { lat: 59.9118759995347, lng: 10.722396 },
      { lat: 59.9121599995347, lng: 10.722759 },
      { lat: 59.9123129995347, lng: 10.722227 },
      { lat: 59.9120699995347, lng: 10.721374 },
      { lat: 59.9116419995347, lng: 10.723379 },
      { lat: 59.9117199995347, lng: 10.720544 }
    ]
  ];
  constructor(private readonly mapHelperService: MapHelperService){

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }


onFreedrawMenuClick(): void { 
     this.mapHelperService.freedrawMenuClick();             
}
onSubtractClick(): void { 
  this.mapHelperService.subtractClick();             
}

add0254(){
  this.mapHelperService.addAutoPolygon(this.pn0254)
}

add0253(){
  this.mapHelperService.addAutoPolygon(this.pn0253)
}

}
