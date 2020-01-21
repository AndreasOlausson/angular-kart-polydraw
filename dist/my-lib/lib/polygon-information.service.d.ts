import { Subject, Observable } from "rxjs";
import { PolygonInfo, PolygonDrawStates, ILatLng } from "./polygon-helpers";
import { MapStateService } from "./map-state.service";
export declare class PolygonInformationService {
    private mapStateService;
    polygonInformationSubject: Subject<PolygonInfo[]>;
    polygonInformation$: Observable<PolygonInfo[]>;
    polygonDrawStatesSubject: Subject<PolygonDrawStates>;
    polygonDrawStates$: Observable<PolygonDrawStates>;
    polygonInformationStorage: any[];
    constructor(mapStateService: MapStateService);
    updatePolygons(): void;
    saveCurrentState(): void;
    deleteTrashcan(polygon: any): void;
    deleteTrashCanOnMulti(polygon: ILatLng[][][]): void;
    deletePolygonInformationStorage(): void;
    createPolygonInformationStorage(arrayOfFeatureGroups: any): void;
}
