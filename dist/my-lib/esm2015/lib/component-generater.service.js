import { __decorate, __metadata } from "tslib";
import { Injectable, ComponentFactoryResolver, Injector, ComponentRef, ComponentFactory, OnDestroy, Component } from '@angular/core';
import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';
import { MyLibModule } from './my-lib.module';
import * as i0 from "@angular/core";
import * as i1 from "./my-lib.module";
let ComponentGeneraterService = class ComponentGeneraterService {
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
};
ComponentGeneraterService.ctorParameters = () => [
    { type: ComponentFactoryResolver },
    { type: Injector }
];
ComponentGeneraterService.ɵprov = i0.ɵɵdefineInjectable({ factory: function ComponentGeneraterService_Factory() { return new ComponentGeneraterService(i0.ɵɵinject(i0.ComponentFactoryResolver), i0.ɵɵinject(i0.INJECTOR)); }, token: ComponentGeneraterService, providedIn: i1.MyLibModule });
ComponentGeneraterService = __decorate([
    Injectable({
        providedIn: MyLibModule
    }),
    __metadata("design:paramtypes", [ComponentFactoryResolver,
        Injector])
], ComponentGeneraterService);
export { ComponentGeneraterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL2NvbXBvbmVudC1nZW5lcmF0ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckksT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDdkYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFDOzs7QUFLOUMsSUFBYSx5QkFBeUIsR0FBdEMsTUFBYSx5QkFBeUI7SUFJcEMsWUFDbUIsR0FBNkIsRUFDN0IsUUFBa0I7UUFEbEIsUUFBRyxHQUFILEdBQUcsQ0FBMEI7UUFDN0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUo3QixxQkFBZ0IsR0FBMEMsRUFBRSxDQUFDO0lBS2pFLENBQUM7SUFFTCxXQUFXO1FBQ1QsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixNQUFNLFVBQVUsR0FBNEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3BILE1BQU0saUJBQWlCLEdBQXdDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM5QyxPQUFPLGlCQUFpQixDQUFDO0lBQzNCLENBQUM7SUFFRCw2QkFBNkI7UUFDM0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuQyxJQUFJLElBQUksRUFBRTtnQkFDUixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDaEI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQztDQUNGLENBQUE7O1lBdkJ5Qix3QkFBd0I7WUFDbkIsUUFBUTs7O0FBTjFCLHlCQUF5QjtJQUhyQyxVQUFVLENBQUM7UUFDVixVQUFVLEVBQUUsV0FBVztLQUN4QixDQUFDO3FDQU13Qix3QkFBd0I7UUFDbkIsUUFBUTtHQU4xQix5QkFBeUIsQ0E0QnJDO1NBNUJZLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgSW5qZWN0b3IsIENvbXBvbmVudFJlZiwgQ29tcG9uZW50RmFjdG9yeSwgT25EZXN0cm95LCBDb21wb25lbnQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQWx0ZXJQb2x5Z29uQ29tcG9uZW50IH0gZnJvbSAnLi9wb3B1cHMvYWx0ZXItcG9seWdvbi9hbHRlci1wb2x5Z29uLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IE15TGliTW9kdWxlIH0gZnJvbSAnLi9teS1saWIubW9kdWxlJztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICBwcm92aWRlZEluOiBNeUxpYk1vZHVsZVxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50R2VuZXJhdGVyU2VydmljZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcblxyXG4gIHByaXZhdGUgY2x1c3RlclBvcHVwcmVmczogQ29tcG9uZW50UmVmPEFsdGVyUG9seWdvbkNvbXBvbmVudD5bXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2ZyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGluamVjdG9yOiBJbmplY3RvclxyXG4gICkgeyB9XHJcblxyXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdGhpcy5kZXN0cm95QW5ndWxhclBvcHVwQ29tcG9uZW50cygpO1xyXG4gIH1cclxuXHJcbiAgZ2VuZXJhdGVBbHRlclBvcHVwKCk6IENvbXBvbmVudFJlZjxBbHRlclBvbHlnb25Db21wb25lbnQ+IHtcclxuICAgIGNvbnN0IGNtcEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8QWx0ZXJQb2x5Z29uQ29tcG9uZW50PiA9IHRoaXMuY2ZyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KEFsdGVyUG9seWdvbkNvbXBvbmVudCk7XHJcbiAgICBjb25zdCBwb3B1cENvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPEFsdGVyUG9seWdvbkNvbXBvbmVudD4gPSBjbXBGYWN0b3J5LmNyZWF0ZSh0aGlzLmluamVjdG9yKTtcclxuICAgIHRoaXMuY2x1c3RlclBvcHVwcmVmcy5wdXNoKHBvcHVwQ29tcG9uZW50UmVmKTtcclxuICAgIHJldHVybiBwb3B1cENvbXBvbmVudFJlZjtcclxuICB9XHJcblxyXG4gIGRlc3Ryb3lBbmd1bGFyUG9wdXBDb21wb25lbnRzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5jbHVzdGVyUG9wdXByZWZzLmZvckVhY2goY3JlZiA9PiB7XHJcbiAgICAgIGlmIChjcmVmKSB7XHJcbiAgICAgICAgY3JlZi5kZXN0cm95KCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5jbHVzdGVyUG9wdXByZWZzID0gW107XHJcbiAgfVxyXG59XHJcbiJdfQ==