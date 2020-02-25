import { __decorate, __metadata } from "tslib";
import { Injectable, ComponentFactoryResolver, Injector, ComponentRef, ComponentFactory, OnDestroy, Component } from '@angular/core';
import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';
import * as i0 from "@angular/core";
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
ComponentGeneraterService.ɵprov = i0.ɵɵdefineInjectable({ factory: function ComponentGeneraterService_Factory() { return new ComponentGeneraterService(i0.ɵɵinject(i0.ComponentFactoryResolver), i0.ɵɵinject(i0.INJECTOR)); }, token: ComponentGeneraterService, providedIn: "root" });
ComponentGeneraterService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [ComponentFactoryResolver,
        Injector])
], ComponentGeneraterService);
export { ComponentGeneraterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL2NvbXBvbmVudC1nZW5lcmF0ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckksT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7O0FBS3ZGLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBSXBDLFlBQ21CLEdBQTZCLEVBQzdCLFFBQWtCO1FBRGxCLFFBQUcsR0FBSCxHQUFHLENBQTBCO1FBQzdCLGFBQVEsR0FBUixRQUFRLENBQVU7UUFKN0IscUJBQWdCLEdBQTBDLEVBQUUsQ0FBQztJQUtqRSxDQUFDO0lBRUwsV0FBVztRQUNULElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsTUFBTSxVQUFVLEdBQTRDLElBQUksQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNwSCxNQUFNLGlCQUFpQixHQUF3QyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDOUMsT0FBTyxpQkFBaUIsQ0FBQztJQUMzQixDQUFDO0lBRUQsNkJBQTZCO1FBQzNCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkMsSUFBSSxJQUFJLEVBQUU7Z0JBQ1IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ2hCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7Q0FDRixDQUFBOztZQXZCeUIsd0JBQXdCO1lBQ25CLFFBQVE7OztBQU4xQix5QkFBeUI7SUFIckMsVUFBVSxDQUFDO1FBQ1YsVUFBVSxFQUFFLE1BQU07S0FDbkIsQ0FBQztxQ0FNd0Isd0JBQXdCO1FBQ25CLFFBQVE7R0FOMUIseUJBQXlCLENBNEJyQztTQTVCWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIEluamVjdG9yLCBDb21wb25lbnRSZWYsIENvbXBvbmVudEZhY3RvcnksIE9uRGVzdHJveSwgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEFsdGVyUG9seWdvbkNvbXBvbmVudCB9IGZyb20gJy4vcG9wdXBzL2FsdGVyLXBvbHlnb24vYWx0ZXItcG9seWdvbi5jb21wb25lbnQnO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50R2VuZXJhdGVyU2VydmljZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcblxyXG4gIHByaXZhdGUgY2x1c3RlclBvcHVwcmVmczogQ29tcG9uZW50UmVmPEFsdGVyUG9seWdvbkNvbXBvbmVudD5bXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2ZyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGluamVjdG9yOiBJbmplY3RvclxyXG4gICkgeyB9XHJcblxyXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdGhpcy5kZXN0cm95QW5ndWxhclBvcHVwQ29tcG9uZW50cygpO1xyXG4gIH1cclxuXHJcbiAgZ2VuZXJhdGVBbHRlclBvcHVwKCk6IENvbXBvbmVudFJlZjxBbHRlclBvbHlnb25Db21wb25lbnQ+IHtcclxuICAgIGNvbnN0IGNtcEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8QWx0ZXJQb2x5Z29uQ29tcG9uZW50PiA9IHRoaXMuY2ZyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KEFsdGVyUG9seWdvbkNvbXBvbmVudCk7XHJcbiAgICBjb25zdCBwb3B1cENvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPEFsdGVyUG9seWdvbkNvbXBvbmVudD4gPSBjbXBGYWN0b3J5LmNyZWF0ZSh0aGlzLmluamVjdG9yKTtcclxuICAgIHRoaXMuY2x1c3RlclBvcHVwcmVmcy5wdXNoKHBvcHVwQ29tcG9uZW50UmVmKTtcclxuICAgIHJldHVybiBwb3B1cENvbXBvbmVudFJlZjtcclxuICB9XHJcblxyXG4gIGRlc3Ryb3lBbmd1bGFyUG9wdXBDb21wb25lbnRzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5jbHVzdGVyUG9wdXByZWZzLmZvckVhY2goY3JlZiA9PiB7XHJcbiAgICAgIGlmIChjcmVmKSB7XHJcbiAgICAgICAgY3JlZi5kZXN0cm95KCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5jbHVzdGVyUG9wdXByZWZzID0gW107XHJcbiAgfVxyXG59XHJcbiJdfQ==