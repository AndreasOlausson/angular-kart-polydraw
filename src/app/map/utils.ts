import { ICompass } from "./interface";


export class Compass {

    direction: ICompass;
  
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