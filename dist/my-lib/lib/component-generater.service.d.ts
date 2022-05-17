import { ComponentFactoryResolver, Injector, ComponentRef, OnDestroy } from '@angular/core';
import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';
import * as i0 from "@angular/core";
export declare class ComponentGeneraterService implements OnDestroy {
    private readonly cfr;
    private readonly injector;
    private clusterPopuprefs;
    constructor(cfr: ComponentFactoryResolver, injector: Injector);
    ngOnDestroy(): void;
    generateAlterPopup(): ComponentRef<AlterPolygonComponent>;
    destroyAngularPopupComponents(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ComponentGeneraterService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ComponentGeneraterService>;
}
