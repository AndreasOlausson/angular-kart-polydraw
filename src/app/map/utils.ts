import { ICompass } from "./interface";
import * as L from "leaflet";
import { ILatLng } from "./polygon-helpers";
import { MarkerPlacement } from "./enums";
import { TurfHelperService } from "./turf-helper.service"

export class PolyDrawUtil {
    static getBounds(polygon: ILatLng[], padding: number = 0): L.LatLngBounds {
        const tmpLatLng: L.LatLng[] = [];
        polygon.forEach(ll => {
            if (isNaN(ll.lat) || isNaN(ll.lng)) {
            }
            tmpLatLng.push(ll as L.LatLng);
        });
        const polyLine: L.Polyline = new L.Polyline(tmpLatLng);
        const bounds = polyLine.getBounds();
        if (padding !== 0){
            return bounds.pad(padding);
        }
        return bounds;
    }






}
//TODO make compass ILatLng
export class Compass {

    public direction: ICompass = {
        BoundingBoxCenter: [0, 0],
        CenterOfMass: [0, 0],
        East: [0, 0],
        North: [0, 0],
        NorthEast: [0, 0],
        NorthWest: [0, 0],
        South: [0, 0],
        SouthEast: [0, 0],
        SouthWest: [0, 0],
        West: [0, 0]
    };

    constructor(minLat: number = 0, minLng: number = 0, maxLat: number = 0, maxLng: number = 0) {
         this.direction.North = [(minLat + maxLat) / 2, maxLng];
         this.direction.NorthEast = [maxLat, maxLng];
         this.direction.East = [maxLat, (minLng + maxLng) / 2];
         this.direction.SouthEast = [maxLat, minLng];
         this.direction.South = [(minLat + maxLat) / 2, minLng];
         this.direction.SouthWest = [minLat, minLng];
         this.direction.West = [minLat, (minLng + maxLng) / 2];
         this.direction.NorthWest = [minLat, maxLng];
         this.direction.CenterOfMass = [0, 0];
         this.direction.BoundingBoxCenter = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
    }
    //TODO default return.
    getDirection(direction: MarkerPlacement) {
        switch (direction) {
            case MarkerPlacement.CenterOfMass:
                return this.direction.CenterOfMass;
            case MarkerPlacement.North:
                return this.direction.North;
            case MarkerPlacement.NorthEast:
                return this.direction.NorthEast;
            case MarkerPlacement.East:
                return this.direction.East;
            case MarkerPlacement.SouthEast:
                return this.direction.SouthEast;
            case MarkerPlacement.South:
                return this.direction.South;
            case MarkerPlacement.SouthWest:
                return this.direction.SouthWest;
            case MarkerPlacement.West:
                return this.direction.West;
            case MarkerPlacement.NorthWest:
                return this.direction.NorthWest;
            case MarkerPlacement.BoundingBoxCenter:
                return this.direction.BoundingBoxCenter;
            default:
                return this.direction.North;
        }
    }
}