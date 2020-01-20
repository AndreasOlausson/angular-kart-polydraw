import { Subject, Observable, BehaviorSubject } from "rxjs";
import { PolygonInfo, PolygonDrawStates, ILatLng } from "./polygon-helpers";
export declare class PolygonInformationService {
    polygonInformationSubject: Subject<PolygonInfo[]>;
    polygonInformation$: Observable<PolygonInfo[]>;
    polygonDrawStatesSubject: Subject<PolygonDrawStates>;
    polygonDrawStates$: Observable<PolygonDrawStates>;
    polygonsSubject$: BehaviorSubject<ILatLng[][][]>;
    polygons$: Observable<ILatLng[][][]>;
    polygonInformationStorage: any[];
    private readonly polygonDrawStates;
    constructor();
    updatePolygons(): void;
    saveCurrentState(): void;
    deleteTrashcan(polygon: any): void;
    deleteTrashCanOnMulti(polygon: ILatLng[][][]): void;
    deletePolygonInformationStorage(): void;
    createPolygonInformationStorage(arrayOfFeatureGroups: any): void;
    setFreeDrawMode(): void;
    setMoveMode(): void;
    activate(): void;
    reset(): void;
}
