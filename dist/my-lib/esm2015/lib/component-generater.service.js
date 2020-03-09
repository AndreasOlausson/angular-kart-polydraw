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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL2NvbXBvbmVudC1nZW5lcmF0ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckksT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7O0FBS3ZGLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBSXBDLFlBQ21CLEdBQTZCLEVBQzdCLFFBQWtCO1FBRGxCLFFBQUcsR0FBSCxHQUFHLENBQTBCO1FBQzdCLGFBQVEsR0FBUixRQUFRLENBQVU7UUFKN0IscUJBQWdCLEdBQTBDLEVBQUUsQ0FBQztJQUtqRSxDQUFDO0lBRUwsV0FBVztRQUNULElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsTUFBTSxVQUFVLEdBQTRDLElBQUksQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNwSCxNQUFNLGlCQUFpQixHQUF3QyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDOUMsT0FBTyxpQkFBaUIsQ0FBQztJQUMzQixDQUFDO0lBRUQsNkJBQTZCO1FBQzNCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkMsSUFBSSxJQUFJLEVBQUU7Z0JBQ1IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ2hCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7Q0FDRixDQUFBOztZQXZCeUIsd0JBQXdCO1lBQ25CLFFBQVE7OztBQU4xQix5QkFBeUI7SUFIckMsVUFBVSxDQUFDO1FBQ1YsVUFBVSxFQUFFLE1BQU07S0FDbkIsQ0FBQztxQ0FNd0Isd0JBQXdCO1FBQ25CLFFBQVE7R0FOMUIseUJBQXlCLENBNEJyQztTQTVCWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIEluamVjdG9yLCBDb21wb25lbnRSZWYsIENvbXBvbmVudEZhY3RvcnksIE9uRGVzdHJveSwgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBbHRlclBvbHlnb25Db21wb25lbnQgfSBmcm9tICcuL3BvcHVwcy9hbHRlci1wb2x5Z29uL2FsdGVyLXBvbHlnb24uY29tcG9uZW50JztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50R2VuZXJhdGVyU2VydmljZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG5cbiAgcHJpdmF0ZSBjbHVzdGVyUG9wdXByZWZzOiBDb21wb25lbnRSZWY8QWx0ZXJQb2x5Z29uQ29tcG9uZW50PltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjZnI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGluamVjdG9yOiBJbmplY3RvclxuICApIHsgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveUFuZ3VsYXJQb3B1cENvbXBvbmVudHMoKTtcbiAgfVxuXG4gIGdlbmVyYXRlQWx0ZXJQb3B1cCgpOiBDb21wb25lbnRSZWY8QWx0ZXJQb2x5Z29uQ29tcG9uZW50PiB7XG4gICAgY29uc3QgY21wRmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxBbHRlclBvbHlnb25Db21wb25lbnQ+ID0gdGhpcy5jZnIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoQWx0ZXJQb2x5Z29uQ29tcG9uZW50KTtcbiAgICBjb25zdCBwb3B1cENvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPEFsdGVyUG9seWdvbkNvbXBvbmVudD4gPSBjbXBGYWN0b3J5LmNyZWF0ZSh0aGlzLmluamVjdG9yKTtcbiAgICB0aGlzLmNsdXN0ZXJQb3B1cHJlZnMucHVzaChwb3B1cENvbXBvbmVudFJlZik7XG4gICAgcmV0dXJuIHBvcHVwQ29tcG9uZW50UmVmO1xuICB9XG5cbiAgZGVzdHJveUFuZ3VsYXJQb3B1cENvbXBvbmVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5jbHVzdGVyUG9wdXByZWZzLmZvckVhY2goY3JlZiA9PiB7XG4gICAgICBpZiAoY3JlZikge1xuICAgICAgICBjcmVmLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmNsdXN0ZXJQb3B1cHJlZnMgPSBbXTtcbiAgfVxufVxuIl19