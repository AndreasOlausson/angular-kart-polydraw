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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL2NvbXBvbmVudC1nZW5lcmF0ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckksT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7O0FBS3ZGO0lBSUUsbUNBQ21CLEdBQTZCLEVBQzdCLFFBQWtCO1FBRGxCLFFBQUcsR0FBSCxHQUFHLENBQTBCO1FBQzdCLGFBQVEsR0FBUixRQUFRLENBQVU7UUFKN0IscUJBQWdCLEdBQTBDLEVBQUUsQ0FBQztJQUtqRSxDQUFDO0lBRUwsK0NBQVcsR0FBWDtRQUNFLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxzREFBa0IsR0FBbEI7UUFDRSxJQUFNLFVBQVUsR0FBNEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3BILElBQU0saUJBQWlCLEdBQXdDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM5QyxPQUFPLGlCQUFpQixDQUFDO0lBQzNCLENBQUM7SUFFRCxpRUFBNkIsR0FBN0I7UUFDRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtZQUNoQyxJQUFJLElBQUksRUFBRTtnQkFDUixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDaEI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQzs7Z0JBdEJ1Qix3QkFBd0I7Z0JBQ25CLFFBQVE7OztJQU4xQix5QkFBeUI7UUFIckMsVUFBVSxDQUFDO1lBQ1YsVUFBVSxFQUFFLE1BQU07U0FDbkIsQ0FBQzt5Q0FNd0Isd0JBQXdCO1lBQ25CLFFBQVE7T0FOMUIseUJBQXlCLENBNEJyQztvQ0FsQ0Q7Q0FrQ0MsQUE1QkQsSUE0QkM7U0E1QlkseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBJbmplY3RvciwgQ29tcG9uZW50UmVmLCBDb21wb25lbnRGYWN0b3J5LCBPbkRlc3Ryb3ksIENvbXBvbmVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWx0ZXJQb2x5Z29uQ29tcG9uZW50IH0gZnJvbSAnLi9wb3B1cHMvYWx0ZXItcG9seWdvbi9hbHRlci1wb2x5Z29uLmNvbXBvbmVudCc7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEdlbmVyYXRlclNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuXG4gIHByaXZhdGUgY2x1c3RlclBvcHVwcmVmczogQ29tcG9uZW50UmVmPEFsdGVyUG9seWdvbkNvbXBvbmVudD5bXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2ZyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbmplY3RvcjogSW5qZWN0b3JcbiAgKSB7IH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3Ryb3lBbmd1bGFyUG9wdXBDb21wb25lbnRzKCk7XG4gIH1cblxuICBnZW5lcmF0ZUFsdGVyUG9wdXAoKTogQ29tcG9uZW50UmVmPEFsdGVyUG9seWdvbkNvbXBvbmVudD4ge1xuICAgIGNvbnN0IGNtcEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8QWx0ZXJQb2x5Z29uQ29tcG9uZW50PiA9IHRoaXMuY2ZyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KEFsdGVyUG9seWdvbkNvbXBvbmVudCk7XG4gICAgY29uc3QgcG9wdXBDb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxBbHRlclBvbHlnb25Db21wb25lbnQ+ID0gY21wRmFjdG9yeS5jcmVhdGUodGhpcy5pbmplY3Rvcik7XG4gICAgdGhpcy5jbHVzdGVyUG9wdXByZWZzLnB1c2gocG9wdXBDb21wb25lbnRSZWYpO1xuICAgIHJldHVybiBwb3B1cENvbXBvbmVudFJlZjtcbiAgfVxuXG4gIGRlc3Ryb3lBbmd1bGFyUG9wdXBDb21wb25lbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuY2x1c3RlclBvcHVwcmVmcy5mb3JFYWNoKGNyZWYgPT4ge1xuICAgICAgaWYgKGNyZWYpIHtcbiAgICAgICAgY3JlZi5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5jbHVzdGVyUG9wdXByZWZzID0gW107XG4gIH1cbn1cbiJdfQ==