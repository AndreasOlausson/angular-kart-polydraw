import { Injectable, ComponentFactoryResolver, Injector, ComponentRef, ComponentFactory, OnDestroy, Component } from '@angular/core';
import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';


export class ComponentGeneraterService implements OnDestroy {

  private clusterPopuprefs: ComponentRef<AlterPolygonComponent>[] = [];

  constructor(
    private readonly cfr: ComponentFactoryResolver,
    private readonly injector: Injector
  ) { }

  ngOnDestroy(): void {
    this.destroyAngularPopupComponents();
  }

  generateAlterPopup(): ComponentRef<AlterPolygonComponent> {
    const cmpFactory: ComponentFactory<AlterPolygonComponent> = this.cfr.resolveComponentFactory(AlterPolygonComponent);
    const popupComponentRef: ComponentRef<AlterPolygonComponent> = cmpFactory.create(this.injector);
    this.clusterPopuprefs.push(popupComponentRef);
    return popupComponentRef;
  }

  destroyAngularPopupComponents(): void {
    this.clusterPopuprefs.forEach(cref => {
      if (cref) {
        cref.destroy();
      }
    });
    this.clusterPopuprefs = [];
  }
}
