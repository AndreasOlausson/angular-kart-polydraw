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
        if (padding !== 0) {
            return bounds.pad(padding);
        }
        return bounds;
    }
}
//TODO make compass ILatLng
export class Compass {

    public direction: ICompass = {
        // BoundingBoxCenter: { lat: 0, lng: 0 },
        // CenterOfMass: { lat: 0, lng: 0 },
        East: { lat: 0, lng: 0 },
        North: { lat: 0, lng: 0 },
        NorthEast: { lat: 0, lng: 0 },
        NorthWest: { lat: 0, lng: 0 },
        South: { lat: 0, lng: 0 },
        SouthEast: { lat: 0, lng: 0 },
        SouthWest: { lat: 0, lng: 0 },
        West: { lat: 0, lng: 0 }
    };

    constructor(minLat: number = 0, minLng: number = 0, maxLat: number = 0, maxLng: number = 0) {
        
        this.direction.North = {lat: maxLat, lng: (minLng + maxLng) / 2};
        this.direction.NorthEast = {lat: maxLat, lng: maxLng};
        this.direction.East = {lat: (minLat + maxLat) / 2, lng: maxLng};
        this.direction.SouthEast = {lat: minLat, lng: maxLng};
        this.direction.South = {lat: minLat, lng: (minLng + maxLng) / 2};
        this.direction.SouthWest = {lat: minLat, lng: minLng};
        this.direction.West = {lat:(minLat + maxLat) / 2, lng: minLng};
        this.direction.NorthWest = {lat: maxLat, lng: minLng};
        // this.direction.CenterOfMass = { lat: 0, lng: 0 };
        // this.direction.BoundingBoxCenter = {lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2};
    }
    //TODO default return.
    getDirection(direction: MarkerPlacement) {
        switch (direction) {
            // case MarkerPlacement.CenterOfMass:
            //     return this.direction.CenterOfMass;
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
            // case MarkerPlacement.BoundingBoxCenter:
            //     return this.direction.BoundingBoxCenter;
            default:
                return this.direction.North;
        }
    }
}