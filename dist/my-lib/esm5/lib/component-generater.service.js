import * as tslib_1 from "tslib";
import { Injectable, ComponentFactoryResolver, Injector, ComponentRef, ComponentFactory, OnDestroy, Component } from '@angular/core';
import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';
import * as i0 from "@angular/core";
var ComponentGeneraterService = /** @class */ (function () {
    function ComponentGeneraterService(cfr, injector) {
        this.cfr = cfr;
        this.injector = injector;
        this.clusterPopuprefs = [];
    }
    ComponentGeneraterService.prototype.ngOnDestroy = function () {
        this.destroyAngularPopupComponents();
    };
    ComponentGeneraterService.prototype.generateAlterPopup = function () {
        var cmpFactory = this.cfr.resolveComponentFactory(AlterPolygonComponent);
        var popupComponentRef = cmpFactory.create(this.injector);
        this.clusterPopuprefs.push(popupComponentRef);
        return popupComponentRef;
    };
    ComponentGeneraterService.prototype.destroyAngularPopupComponents = function () {
        this.clusterPopuprefs.forEach(function (cref) {
            if (cref) {
                cref.destroy();
            }
        });
        this.clusterPopuprefs = [];
    };
    ComponentGeneraterService.ctorParameters = function () { return [
        { type: ComponentFactoryResolver },
        { type: Injector }
    ]; };
    ComponentGeneraterService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function ComponentGeneraterService_Factory() { return new ComponentGeneraterService(i0.ɵɵinject(i0.ComponentFactoryResolver), i0.ɵɵinject(i0.INJECTOR)); }, token: ComponentGeneraterService, providedIn: "root" });
    ComponentGeneraterService = tslib_1.__decorate([
        Injectable({
            providedIn: 'root'
        }),
        tslib_1.__metadata("design:paramtypes", [ComponentFactoryResolver,
            Injector])
    ], ComponentGeneraterService);
    return ComponentGeneraterService;
}());
export { ComponentGeneraterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL2NvbXBvbmVudC1nZW5lcmF0ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckksT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7O0FBS3ZGO0lBSUUsbUNBQ21CLEdBQTZCLEVBQzdCLFFBQWtCO1FBRGxCLFFBQUcsR0FBSCxHQUFHLENBQTBCO1FBQzdCLGFBQVEsR0FBUixRQUFRLENBQVU7UUFKN0IscUJBQWdCLEdBQTBDLEVBQUUsQ0FBQztJQUtqRSxDQUFDO0lBRUwsK0NBQVcsR0FBWDtRQUNFLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxzREFBa0IsR0FBbEI7UUFDRSxJQUFNLFVBQVUsR0FBNEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3BILElBQU0saUJBQWlCLEdBQXdDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM5QyxPQUFPLGlCQUFpQixDQUFDO0lBQzNCLENBQUM7SUFFRCxpRUFBNkIsR0FBN0I7UUFDRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtZQUNoQyxJQUFJLElBQUksRUFBRTtnQkFDUixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDaEI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQzs7Z0JBdEJ1Qix3QkFBd0I7Z0JBQ25CLFFBQVE7OztJQU4xQix5QkFBeUI7UUFIckMsVUFBVSxDQUFDO1lBQ1YsVUFBVSxFQUFFLE1BQU07U0FDbkIsQ0FBQztpREFNd0Isd0JBQXdCO1lBQ25CLFFBQVE7T0FOMUIseUJBQXlCLENBNEJyQztvQ0FsQ0Q7Q0FrQ0MsQUE1QkQsSUE0QkM7U0E1QlkseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBJbmplY3RvciwgQ29tcG9uZW50UmVmLCBDb21wb25lbnRGYWN0b3J5LCBPbkRlc3Ryb3ksIENvbXBvbmVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBBbHRlclBvbHlnb25Db21wb25lbnQgfSBmcm9tICcuL3BvcHVwcy9hbHRlci1wb2x5Z29uL2FsdGVyLXBvbHlnb24uY29tcG9uZW50JztcclxuXHJcbkBJbmplY3RhYmxlKHtcclxuICBwcm92aWRlZEluOiAncm9vdCdcclxufSlcclxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEdlbmVyYXRlclNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG5cclxuICBwcml2YXRlIGNsdXN0ZXJQb3B1cHJlZnM6IENvbXBvbmVudFJlZjxBbHRlclBvbHlnb25Db21wb25lbnQ+W10gPSBbXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNmcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbmplY3RvcjogSW5qZWN0b3JcclxuICApIHsgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGVzdHJveUFuZ3VsYXJQb3B1cENvbXBvbmVudHMoKTtcclxuICB9XHJcblxyXG4gIGdlbmVyYXRlQWx0ZXJQb3B1cCgpOiBDb21wb25lbnRSZWY8QWx0ZXJQb2x5Z29uQ29tcG9uZW50PiB7XHJcbiAgICBjb25zdCBjbXBGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PEFsdGVyUG9seWdvbkNvbXBvbmVudD4gPSB0aGlzLmNmci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShBbHRlclBvbHlnb25Db21wb25lbnQpO1xyXG4gICAgY29uc3QgcG9wdXBDb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxBbHRlclBvbHlnb25Db21wb25lbnQ+ID0gY21wRmFjdG9yeS5jcmVhdGUodGhpcy5pbmplY3Rvcik7XHJcbiAgICB0aGlzLmNsdXN0ZXJQb3B1cHJlZnMucHVzaChwb3B1cENvbXBvbmVudFJlZik7XHJcbiAgICByZXR1cm4gcG9wdXBDb21wb25lbnRSZWY7XHJcbiAgfVxyXG5cclxuICBkZXN0cm95QW5ndWxhclBvcHVwQ29tcG9uZW50cygpOiB2b2lkIHtcclxuICAgIHRoaXMuY2x1c3RlclBvcHVwcmVmcy5mb3JFYWNoKGNyZWYgPT4ge1xyXG4gICAgICBpZiAoY3JlZikge1xyXG4gICAgICAgIGNyZWYuZGVzdHJveSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHRoaXMuY2x1c3RlclBvcHVwcmVmcyA9IFtdO1xyXG4gIH1cclxufVxyXG4iXX0=