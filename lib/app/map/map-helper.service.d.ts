import * as L from "leaflet";
import { Observable, BehaviorSubject } from "rxjs";
import { MapStateService } from "./map-state.service";
import { TurfHelperService } from "./turf-helper.service";
import { PolygonInformationService } from "./polygon-information.service";
import { ILatLng } from "./polygon-helpers";
import { ComponentGeneraterService } from "./component-generater.service";
import { LeafletHelperService } from "./leaflet-helper.service";
export declare class MapHelperService {
    private mapState;
    private popupGenerator;
    private turfHelper;
    private polygonInformation;
    private leafletHelper;
    drawModeSubject: BehaviorSubject<DrawMode>;
    drawMode$: Observable<DrawMode>;
    private map;
    private mergePolygons;
    private kinks;
    private arrayOfFeatureGroups;
    private tracer;
    private readonly polygonDrawStates;
    private ngUnsubscribe;
    private config;
    constructor(mapState: MapStateService, popupGenerator: ComponentGeneraterService, turfHelper: TurfHelperService, polygonInformation: PolygonInformationService, leafletHelper: LeafletHelperService);
    configurate(config: Object): void;
    closeAndReset(): void;
    deletePolygon(polygon: ILatLng[][]): void;
    removeAllFeatureGroups(): void;
    getDrawMode(): DrawMode;
    addViken(polygon: any): void;
    addAutoPolygon(geographicBorders: L.LatLng[][]): void;
    private convertToCoords;
    private initPolyDraw;
    private mouseDown;
    private mouseMove;
    private mouseUpLeave;
    private startDraw;
    private stopDraw;
    private drawStartedEvents;
    private subtractPolygon;
    private addPolygon;
    private addPolygonLayer;
    private polygonClicked;
    private getPolygon;
    private merge;
    private subtract;
    private events;
    private addMarker;
    private addHoleMarker;
    private createDivIcon;
    private markerDrag;
    private markerDragEnd;
    private getLatLngsFromJson;
    private unionPolygons;
    private removeFeatureGroup;
    private removeFeatureGroupOnMerge;
    private deletePolygonOnMerge;
    private polygonArrayEqualsMerge;
    private polygonArrayEquals;
    private setLeafletMapEvents;
    setDrawMode(mode: DrawMode): void;
    modeChange(mode: DrawMode): void;
    drawModeClick(): void;
    freedrawMenuClick(): void;
    subtractClick(): void;
    private resetTracker;
    toggleMarkerMenu(): void;
    private getHtmlContent;
    private convertToBoundsPolygon;
    private getMarkerIndex;
}
export declare enum DrawMode {
    Off = 0,
    AddPolygon = 1,
    EditPolygon = 2,
    SubtractPolygon = 3,
    LoadPolygon = 4
}
