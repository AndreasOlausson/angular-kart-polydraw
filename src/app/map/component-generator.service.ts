import { Injectable, ComponentFactoryResolver, Injector, ComponentRef, ComponentFactory, OnDestroy, Component } from '@angular/core';
import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';
import { InfoMarkerPopupComponent } from './popups/info-marker/info-marker.component';
import { Service } from './ServiceDecorator';
import { injectable } from 'tsyringe';

@injectable()
export class ComponentGeneratorService implements OnDestroy {

  private clusterPopuprefs: ComponentRef<AlterPolygonComponent>[] = [];
  private infoMarkerClusterPopuprefs: ComponentRef<InfoMarkerPopupComponent>[] = [];

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
  generateInfoMarkerPopup(): ComponentRef<InfoMarkerPopupComponent> {
    const cmpFactory: ComponentFactory<InfoMarkerPopupComponent> = this.cfr.resolveComponentFactory(InfoMarkerPopupComponent);
    const popupComponentRef: ComponentRef<InfoMarkerPopupComponent> = cmpFactory.create(this.injector);
    this.infoMarkerClusterPopuprefs.push(popupComponentRef);
    return popupComponentRef;
  }
  destroyAngularPopupComponents(): void {
    this.clusterPopuprefs.forEach(cref => {
      if (cref) {
        cref.destroy();
      }
    });
    this.clusterPopuprefs = [];
    this.infoMarkerClusterPopuprefs.forEach(cref => {
      if (cref) {
        cref.destroy();
      }
    });
    this.infoMarkerClusterPopuprefs = [];
  }
}