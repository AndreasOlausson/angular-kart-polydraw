import { ComponentFactoryResolver, Injector, ComponentRef, OnDestroy } from '@angular/core';
import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';
export declare class ComponentGeneraterService implements OnDestroy {
    private readonly cfr;
    private readonly injector;
    private clusterPopuprefs;
    constructor(cfr: ComponentFactoryResolver, injector: Injector);
    ngOnDestroy(): void;
    generateAlterPopup(): ComponentRef<AlterPolygonComponent>;
    destroyAngularPopupComponents(): void;
}
