import { Subject, Observable } from "rxjs";
import { PolygonInfo, PolygonDrawStates, ILatLng } from "./polygon-helpers";
import { PolyStateService } from "./map-state.service";
export declare class PolygonInformationService {
    private mapStateService;
    polygonInformationSubject: Subject<PolygonInfo[]>;
    polygonInformation$: Observable<PolygonInfo[]>;
    polygonDrawStatesSubject: Subject<PolygonDrawStates>;
    polygonDrawStates$: Observable<PolygonDrawStates>;
    polygonDrawStates: PolygonDrawStates;
    polygonInformationStorage: any[];
    constructor(mapStateService: PolyStateService);
    updatePolygons(): void;
    saveCurrentState(): void;
    deleteTrashcan(polygon: any): void;
    deleteTrashCanOnMulti(polygon: ILatLng[][][]): void;
    deletePolygonInformationStorage(): void;
    createPolygonInformationStorage(arrayOfFeatureGroups: any): void;
    activate(): void;
    reset(): void;
    setMoveMode(): void;
    setFreeDrawMode(): void;
}
