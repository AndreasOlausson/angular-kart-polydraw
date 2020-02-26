import { __decorate, __metadata } from "tslib";
import { Injectable, ComponentFactoryResolver, Injector, ComponentRef, ComponentFactory, OnDestroy, Component } from '@angular/core';
import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';
import { MyLibModule } from './my-lib.module';
import * as i0 from "@angular/core";
import * as i1 from "./my-lib.module";
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
    ComponentGeneraterService.ɵprov = i0.ɵɵdefineInjectable({ factory: function ComponentGeneraterService_Factory() { return new ComponentGeneraterService(i0.ɵɵinject(i0.ComponentFactoryResolver), i0.ɵɵinject(i0.INJECTOR)); }, token: ComponentGeneraterService, providedIn: i1.MyLibModule });
    ComponentGeneraterService = __decorate([
        Injectable({
            providedIn: MyLibModule
        }),
        __metadata("design:paramtypes", [ComponentFactoryResolver,
            Injector])
    ], ComponentGeneraterService);
    return ComponentGeneraterService;
}());
export { ComponentGeneraterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL2NvbXBvbmVudC1nZW5lcmF0ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckksT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDdkYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFDOzs7QUFLOUM7SUFJRSxtQ0FDbUIsR0FBNkIsRUFDN0IsUUFBa0I7UUFEbEIsUUFBRyxHQUFILEdBQUcsQ0FBMEI7UUFDN0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUo3QixxQkFBZ0IsR0FBMEMsRUFBRSxDQUFDO0lBS2pFLENBQUM7SUFFTCwrQ0FBVyxHQUFYO1FBQ0UsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELHNEQUFrQixHQUFsQjtRQUNFLElBQU0sVUFBVSxHQUE0QyxJQUFJLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDcEgsSUFBTSxpQkFBaUIsR0FBd0MsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzlDLE9BQU8saUJBQWlCLENBQUM7SUFDM0IsQ0FBQztJQUVELGlFQUE2QixHQUE3QjtRQUNFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO1lBQ2hDLElBQUksSUFBSSxFQUFFO2dCQUNSLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNoQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUM3QixDQUFDOztnQkF0QnVCLHdCQUF3QjtnQkFDbkIsUUFBUTs7O0lBTjFCLHlCQUF5QjtRQUhyQyxVQUFVLENBQUM7WUFDVixVQUFVLEVBQUUsV0FBVztTQUN4QixDQUFDO3lDQU13Qix3QkFBd0I7WUFDbkIsUUFBUTtPQU4xQix5QkFBeUIsQ0E0QnJDO29DQW5DRDtDQW1DQyxBQTVCRCxJQTRCQztTQTVCWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIEluamVjdG9yLCBDb21wb25lbnRSZWYsIENvbXBvbmVudEZhY3RvcnksIE9uRGVzdHJveSwgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEFsdGVyUG9seWdvbkNvbXBvbmVudCB9IGZyb20gJy4vcG9wdXBzL2FsdGVyLXBvbHlnb24vYWx0ZXItcG9seWdvbi5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBNeUxpYk1vZHVsZSB9IGZyb20gJy4vbXktbGliLm1vZHVsZSc7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgcHJvdmlkZWRJbjogTXlMaWJNb2R1bGVcclxufSlcclxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEdlbmVyYXRlclNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG5cclxuICBwcml2YXRlIGNsdXN0ZXJQb3B1cHJlZnM6IENvbXBvbmVudFJlZjxBbHRlclBvbHlnb25Db21wb25lbnQ+W10gPSBbXTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNmcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbmplY3RvcjogSW5qZWN0b3JcclxuICApIHsgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGVzdHJveUFuZ3VsYXJQb3B1cENvbXBvbmVudHMoKTtcclxuICB9XHJcblxyXG4gIGdlbmVyYXRlQWx0ZXJQb3B1cCgpOiBDb21wb25lbnRSZWY8QWx0ZXJQb2x5Z29uQ29tcG9uZW50PiB7XHJcbiAgICBjb25zdCBjbXBGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PEFsdGVyUG9seWdvbkNvbXBvbmVudD4gPSB0aGlzLmNmci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShBbHRlclBvbHlnb25Db21wb25lbnQpO1xyXG4gICAgY29uc3QgcG9wdXBDb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxBbHRlclBvbHlnb25Db21wb25lbnQ+ID0gY21wRmFjdG9yeS5jcmVhdGUodGhpcy5pbmplY3Rvcik7XHJcbiAgICB0aGlzLmNsdXN0ZXJQb3B1cHJlZnMucHVzaChwb3B1cENvbXBvbmVudFJlZik7XHJcbiAgICByZXR1cm4gcG9wdXBDb21wb25lbnRSZWY7XHJcbiAgfVxyXG5cclxuICBkZXN0cm95QW5ndWxhclBvcHVwQ29tcG9uZW50cygpOiB2b2lkIHtcclxuICAgIHRoaXMuY2x1c3RlclBvcHVwcmVmcy5mb3JFYWNoKGNyZWYgPT4ge1xyXG4gICAgICBpZiAoY3JlZikge1xyXG4gICAgICAgIGNyZWYuZGVzdHJveSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHRoaXMuY2x1c3RlclBvcHVwcmVmcyA9IFtdO1xyXG4gIH1cclxufVxyXG4iXX0=