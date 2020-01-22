import { ICompass } from "./interface";
import * as L from "leaflet";
import { ILatLng } from "./polygon-helpers";
import { MarkerPosition } from "./enums";

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

        this.direction.North = { lat: maxLat, lng: (minLng + maxLng) / 2 };
        this.direction.NorthEast = { lat: maxLat, lng: maxLng };
        this.direction.East = { lat: (minLat + maxLat) / 2, lng: maxLng };
        this.direction.SouthEast = { lat: minLat, lng: maxLng };
        this.direction.South = { lat: minLat, lng: (minLng + maxLng) / 2 };
        this.direction.SouthWest = { lat: minLat, lng: minLng };
        this.direction.West = { lat: (minLat + maxLat) / 2, lng: minLng };
        this.direction.NorthWest = { lat: maxLat, lng: minLng };
        // this.direction.CenterOfMass = { lat: 0, lng: 0 };
        // this.direction.BoundingBoxCenter = {lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2};
    }
    //TODO default return.
    getDirection(direction: MarkerPosition) {
        switch (direction) {
            // case MarkerPosition.CenterOfMass:
            //     return this.direction.CenterOfMass;
            case MarkerPosition.North:
                return this.direction.North;
            case MarkerPosition.NorthEast:
                return this.direction.NorthEast;
            case MarkerPosition.East:
                return this.direction.East;
            case MarkerPosition.SouthEast:
                return this.direction.SouthEast;
            case MarkerPosition.South:
                return this.direction.South;
            case MarkerPosition.SouthWest:
                return this.direction.SouthWest;
            case MarkerPosition.West:
                return this.direction.West;
            case MarkerPosition.NorthWest:
                return this.direction.NorthWest;
            // case MarkerPosition.BoundingBoxCenter:
            //     return this.direction.BoundingBoxCenter;
            default:
                return this.direction.North;
        }
    }
    //TODO startNode, go clockwise or not
    getPositions(startNode: MarkerPosition = MarkerPosition.SouthWest, clockwise: boolean = false, addClosingNode: boolean = true): number[][] {

        let positions: number[][] = [];

        positions.push([this.direction.SouthWest.lng, this.direction.SouthWest.lat]);
        positions.push([this.direction.SouthWest.lng, this.direction.SouthWest.lat]);
        positions.push([this.direction.South.lng, this.direction.South.lat]);
        positions.push([this.direction.SouthEast.lng, this.direction.SouthEast.lat]);
        positions.push([this.direction.East.lng, this.direction.East.lat]);
        positions.push([this.direction.NorthEast.lng, this.direction.NorthEast.lat]);
        positions.push([this.direction.North.lng, this.direction.North.lat]);
        positions.push([this.direction.NorthWest.lng, this.direction.NorthWest.lat]);
        positions.push([this.direction.West.lng, this.direction.West.lat]);
        if (addClosingNode) {
            positions.push([this.direction.SouthWest.lng, this.direction.SouthWest.lat]);
        }



        return positions;
    }
}