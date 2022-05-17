import { Injectable, ComponentFactoryResolver, Injector } from '@angular/core';
import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';
import * as i0 from "@angular/core";
export class ComponentGeneraterService {
    constructor(cfr, injector) {
        this.cfr = cfr;
        this.injector = injector;
        this.clusterPopuprefs = [];
    }
    ngOnDestroy() {
        this.destroyAngularPopupComponents();
    }
    generateAlterPopup() {
        const cmpFactory = this.cfr.resolveComponentFactory(AlterPolygonComponent);
        const popupComponentRef = cmpFactory.create(this.injector);
        this.clusterPopuprefs.push(popupComponentRef);
        return popupComponentRef;
    }
    destroyAngularPopupComponents() {
        this.clusterPopuprefs.forEach(cref => {
            if (cref) {
                cref.destroy();
            }
        });
        this.clusterPopuprefs = [];
    }
}
ComponentGeneraterService.ɵfac = function ComponentGeneraterService_Factory(t) { return new (t || ComponentGeneraterService)(i0.ɵɵinject(i0.ComponentFactoryResolver), i0.ɵɵinject(i0.Injector)); };
ComponentGeneraterService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ComponentGeneraterService, factory: ComponentGeneraterService.ɵfac, providedIn: 'root' });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ComponentGeneraterService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: i0.ComponentFactoryResolver }, { type: i0.Injector }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL2NvbXBvbmVudC1nZW5lcmF0ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLHdCQUF3QixFQUFFLFFBQVEsRUFBd0QsTUFBTSxlQUFlLENBQUM7QUFDckksT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7O0FBS3ZGLE1BQU0sT0FBTyx5QkFBeUI7SUFJcEMsWUFDbUIsR0FBNkIsRUFDN0IsUUFBa0I7UUFEbEIsUUFBRyxHQUFILEdBQUcsQ0FBMEI7UUFDN0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUo3QixxQkFBZ0IsR0FBMEMsRUFBRSxDQUFDO0lBS2pFLENBQUM7SUFFTCxXQUFXO1FBQ1QsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixNQUFNLFVBQVUsR0FBNEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3BILE1BQU0saUJBQWlCLEdBQXdDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM5QyxPQUFPLGlCQUFpQixDQUFDO0lBQzNCLENBQUM7SUFFRCw2QkFBNkI7UUFDM0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuQyxJQUFJLElBQUksRUFBRTtnQkFDUixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDaEI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQzs7a0dBM0JVLHlCQUF5QjsrRUFBekIseUJBQXlCLFdBQXpCLHlCQUF5QixtQkFGeEIsTUFBTTt1RkFFUCx5QkFBeUI7Y0FIckMsVUFBVTtlQUFDO2dCQUNWLFVBQVUsRUFBRSxNQUFNO2FBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBJbmplY3RvciwgQ29tcG9uZW50UmVmLCBDb21wb25lbnRGYWN0b3J5LCBPbkRlc3Ryb3ksIENvbXBvbmVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBBbHRlclBvbHlnb25Db21wb25lbnQgfSBmcm9tICcuL3BvcHVwcy9hbHRlci1wb2x5Z29uL2FsdGVyLXBvbHlnb24uY29tcG9uZW50JztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICBwcm92aWRlZEluOiAncm9vdCdcclxufSlcclxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEdlbmVyYXRlclNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG5cclxuICBwcml2YXRlIGNsdXN0ZXJQb3B1cHJlZnM6IENvbXBvbmVudFJlZjxBbHRlclBvbHlnb25Db21wb25lbnQ+W10gPSBbXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNmcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbmplY3RvcjogSW5qZWN0b3JcclxuICApIHsgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGVzdHJveUFuZ3VsYXJQb3B1cENvbXBvbmVudHMoKTtcclxuICB9XHJcblxyXG4gIGdlbmVyYXRlQWx0ZXJQb3B1cCgpOiBDb21wb25lbnRSZWY8QWx0ZXJQb2x5Z29uQ29tcG9uZW50PiB7XHJcbiAgICBjb25zdCBjbXBGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PEFsdGVyUG9seWdvbkNvbXBvbmVudD4gPSB0aGlzLmNmci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShBbHRlclBvbHlnb25Db21wb25lbnQpO1xyXG4gICAgY29uc3QgcG9wdXBDb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxBbHRlclBvbHlnb25Db21wb25lbnQ+ID0gY21wRmFjdG9yeS5jcmVhdGUodGhpcy5pbmplY3Rvcik7XHJcbiAgICB0aGlzLmNsdXN0ZXJQb3B1cHJlZnMucHVzaChwb3B1cENvbXBvbmVudFJlZik7XHJcbiAgICByZXR1cm4gcG9wdXBDb21wb25lbnRSZWY7XHJcbiAgfVxyXG5cclxuICBkZXN0cm95QW5ndWxhclBvcHVwQ29tcG9uZW50cygpOiB2b2lkIHtcclxuICAgIHRoaXMuY2x1c3RlclBvcHVwcmVmcy5mb3JFYWNoKGNyZWYgPT4ge1xyXG4gICAgICBpZiAoY3JlZikge1xyXG4gICAgICAgIGNyZWYuZGVzdHJveSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHRoaXMuY2x1c3RlclBvcHVwcmVmcyA9IFtdO1xyXG4gIH1cclxufVxyXG4iXX0=