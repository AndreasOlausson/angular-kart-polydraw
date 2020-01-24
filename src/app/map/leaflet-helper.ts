import * as L from "leaflet";
import { ILatLng } from "./polygon-helpers";

export class LeafletHelper {

  constructor() { }

  createPolygon(latLngs: ILatLng[]): L.Polygon {
    const p = L.polygon(latLngs)
    return p;
  }
}


