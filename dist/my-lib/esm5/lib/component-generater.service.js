import { __decorate, __metadata } from "tslib";
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
    ComponentGeneraterService.ɵprov = i0.ɵɵdefineInjectable({ factory: function ComponentGeneraterService_Factory() { return new ComponentGeneraterService(i0.ɵɵinject(i0.ComponentFactoryResolver), i0.ɵɵinject(i0.INJECTOR)); }, token: ComponentGeneraterService, providedIn: "root" });
    ComponentGeneraterService = __decorate([
        Injectable({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [ComponentFactoryResolver,
            Injector])
    ], ComponentGeneraterService);
    return ComponentGeneraterService;
}());
export { ComponentGeneraterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vcG9seWRyYXcvIiwic291cmNlcyI6WyJsaWIvY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLHdCQUF3QixFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNySSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQzs7QUFLdkY7SUFJRSxtQ0FDbUIsR0FBNkIsRUFDN0IsUUFBa0I7UUFEbEIsUUFBRyxHQUFILEdBQUcsQ0FBMEI7UUFDN0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUo3QixxQkFBZ0IsR0FBMEMsRUFBRSxDQUFDO0lBS2pFLENBQUM7SUFFTCwrQ0FBVyxHQUFYO1FBQ0UsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELHNEQUFrQixHQUFsQjtRQUNFLElBQU0sVUFBVSxHQUE0QyxJQUFJLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDcEgsSUFBTSxpQkFBaUIsR0FBd0MsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzlDLE9BQU8saUJBQWlCLENBQUM7SUFDM0IsQ0FBQztJQUVELGlFQUE2QixHQUE3QjtRQUNFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO1lBQ2hDLElBQUksSUFBSSxFQUFFO2dCQUNSLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNoQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUM3QixDQUFDOztnQkF0QnVCLHdCQUF3QjtnQkFDbkIsUUFBUTs7O0lBTjFCLHlCQUF5QjtRQUhyQyxVQUFVLENBQUM7WUFDVixVQUFVLEVBQUUsTUFBTTtTQUNuQixDQUFDO3lDQU13Qix3QkFBd0I7WUFDbkIsUUFBUTtPQU4xQix5QkFBeUIsQ0E0QnJDO29DQWxDRDtDQWtDQyxBQTVCRCxJQTRCQztTQTVCWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIEluamVjdG9yLCBDb21wb25lbnRSZWYsIENvbXBvbmVudEZhY3RvcnksIE9uRGVzdHJveSwgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEFsdGVyUG9seWdvbkNvbXBvbmVudCB9IGZyb20gJy4vcG9wdXBzL2FsdGVyLXBvbHlnb24vYWx0ZXItcG9seWdvbi5jb21wb25lbnQnO1xyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46ICdyb290J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50R2VuZXJhdGVyU2VydmljZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcblxyXG4gIHByaXZhdGUgY2x1c3RlclBvcHVwcmVmczogQ29tcG9uZW50UmVmPEFsdGVyUG9seWdvbkNvbXBvbmVudD5bXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2ZyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGluamVjdG9yOiBJbmplY3RvclxyXG4gICkgeyB9XHJcblxyXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdGhpcy5kZXN0cm95QW5ndWxhclBvcHVwQ29tcG9uZW50cygpO1xyXG4gIH1cclxuXHJcbiAgZ2VuZXJhdGVBbHRlclBvcHVwKCk6IENvbXBvbmVudFJlZjxBbHRlclBvbHlnb25Db21wb25lbnQ+IHtcclxuICAgIGNvbnN0IGNtcEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8QWx0ZXJQb2x5Z29uQ29tcG9uZW50PiA9IHRoaXMuY2ZyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KEFsdGVyUG9seWdvbkNvbXBvbmVudCk7XHJcbiAgICBjb25zdCBwb3B1cENvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPEFsdGVyUG9seWdvbkNvbXBvbmVudD4gPSBjbXBGYWN0b3J5LmNyZWF0ZSh0aGlzLmluamVjdG9yKTtcclxuICAgIHRoaXMuY2x1c3RlclBvcHVwcmVmcy5wdXNoKHBvcHVwQ29tcG9uZW50UmVmKTtcclxuICAgIHJldHVybiBwb3B1cENvbXBvbmVudFJlZjtcclxuICB9XHJcblxyXG4gIGRlc3Ryb3lBbmd1bGFyUG9wdXBDb21wb25lbnRzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5jbHVzdGVyUG9wdXByZWZzLmZvckVhY2goY3JlZiA9PiB7XHJcbiAgICAgIGlmIChjcmVmKSB7XHJcbiAgICAgICAgY3JlZi5kZXN0cm95KCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5jbHVzdGVyUG9wdXByZWZzID0gW107XHJcbiAgfVxyXG59XHJcbiJdfQ==