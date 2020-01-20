export declare class PolygonInfo {
    polygon: ILatLng[][][];
    trashcanPoint: ILatLng[];
    sqmArea: number[];
    perimeter: number[];
    constructor(polygon: any);
    setSqmArea(area: number): void;
    private getTrashcanPoint;
    private calculatePolygonArea;
    private calculatePolygonPerimeter;
}
export declare class PolygonDrawStates {
    isActivated: boolean;
    isFreeDrawMode: boolean;
    isMoveMode: boolean;
    canRevert: boolean;
    isAuto: boolean;
    hasPolygons: boolean;
    canUsePolyDraw: boolean;
    constructor();
    activate(): void;
    reset(): void;
    resetDrawModes(): void;
    setFreeDrawMode(isAuto?: boolean): void;
    setMoveMode(): void;
    forceCanUseFreeDraw(): void;
}
export interface ILatLng {
    lat: number;
    lng: number;
}
