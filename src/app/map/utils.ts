import { ICompass } from "./interface";
import * as L from "leaflet";
import { ILatLng } from "./polygon-helpers";

export class PolyDrawUtil {
    static getBounds(polygon: ILatLng[]): L.LatLngBounds {
        const tmpLatLng: L.LatLng[] = [];
        polygon.forEach(ll => {
            if (isNaN(ll.lat) || isNaN(ll.lng)) {
            }
            tmpLatLng.push(ll as L.LatLng);
        });
        const polyLine: L.Polyline = new L.Polyline(tmpLatLng);
        const bounds = polyLine.getBounds();
        return bounds;
    }
}

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

    constructor(minX: number = 0, minY: number = 0, maxX: number = 0, maxY: number = 0) {
        this.direction.North = [(minX + maxX) / 2, maxY];
        this.direction.NorthEast = [maxX, maxY];
        this.direction.East = [maxX, (minY + maxY) / 2];
        this.direction.SouthEast = [maxX, minY];
        this.direction.South = [(minX + maxX) / 2, minY];
        this.direction.SouthWest = [minX, minY];
        this.direction.West = [minX, (minY + maxY) / 2];
        this.direction.NorthWest = [minX, maxY];
        this.direction.CenterOfMass = [0, 0];
        this.direction.BoundingBoxCenter = [(minX + maxX) / 2, (minY + maxY) / 2];
    }
}