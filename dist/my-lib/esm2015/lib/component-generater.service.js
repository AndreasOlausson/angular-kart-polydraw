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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vcG9seWRyYXcvIiwic291cmNlcyI6WyJsaWIvY29tcG9uZW50LWdlbmVyYXRlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLHdCQUF3QixFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNySSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQzs7QUFLdkYsSUFBYSx5QkFBeUIsR0FBdEMsTUFBYSx5QkFBeUI7SUFJcEMsWUFDbUIsR0FBNkIsRUFDN0IsUUFBa0I7UUFEbEIsUUFBRyxHQUFILEdBQUcsQ0FBMEI7UUFDN0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUo3QixxQkFBZ0IsR0FBMEMsRUFBRSxDQUFDO0lBS2pFLENBQUM7SUFFTCxXQUFXO1FBQ1QsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixNQUFNLFVBQVUsR0FBNEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3BILE1BQU0saUJBQWlCLEdBQXdDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM5QyxPQUFPLGlCQUFpQixDQUFDO0lBQzNCLENBQUM7SUFFRCw2QkFBNkI7UUFDM0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNuQyxJQUFJLElBQUksRUFBRTtnQkFDUixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDaEI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQztDQUNGLENBQUE7O1lBdkJ5Qix3QkFBd0I7WUFDbkIsUUFBUTs7O0FBTjFCLHlCQUF5QjtJQUhyQyxVQUFVLENBQUM7UUFDVixVQUFVLEVBQUUsTUFBTTtLQUNuQixDQUFDO3FDQU13Qix3QkFBd0I7UUFDbkIsUUFBUTtHQU4xQix5QkFBeUIsQ0E0QnJDO1NBNUJZLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgSW5qZWN0b3IsIENvbXBvbmVudFJlZiwgQ29tcG9uZW50RmFjdG9yeSwgT25EZXN0cm95LCBDb21wb25lbnQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQWx0ZXJQb2x5Z29uQ29tcG9uZW50IH0gZnJvbSAnLi9wb3B1cHMvYWx0ZXItcG9seWdvbi9hbHRlci1wb2x5Z29uLmNvbXBvbmVudCc7XHJcblxyXG5ASW5qZWN0YWJsZSh7XHJcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDb21wb25lbnRHZW5lcmF0ZXJTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcclxuXHJcbiAgcHJpdmF0ZSBjbHVzdGVyUG9wdXByZWZzOiBDb21wb25lbnRSZWY8QWx0ZXJQb2x5Z29uQ29tcG9uZW50PltdID0gW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBjZnI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgaW5qZWN0b3I6IEluamVjdG9yXHJcbiAgKSB7IH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB0aGlzLmRlc3Ryb3lBbmd1bGFyUG9wdXBDb21wb25lbnRzKCk7XHJcbiAgfVxyXG5cclxuICBnZW5lcmF0ZUFsdGVyUG9wdXAoKTogQ29tcG9uZW50UmVmPEFsdGVyUG9seWdvbkNvbXBvbmVudD4ge1xyXG4gICAgY29uc3QgY21wRmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxBbHRlclBvbHlnb25Db21wb25lbnQ+ID0gdGhpcy5jZnIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoQWx0ZXJQb2x5Z29uQ29tcG9uZW50KTtcclxuICAgIGNvbnN0IHBvcHVwQ29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8QWx0ZXJQb2x5Z29uQ29tcG9uZW50PiA9IGNtcEZhY3RvcnkuY3JlYXRlKHRoaXMuaW5qZWN0b3IpO1xyXG4gICAgdGhpcy5jbHVzdGVyUG9wdXByZWZzLnB1c2gocG9wdXBDb21wb25lbnRSZWYpO1xyXG4gICAgcmV0dXJuIHBvcHVwQ29tcG9uZW50UmVmO1xyXG4gIH1cclxuXHJcbiAgZGVzdHJveUFuZ3VsYXJQb3B1cENvbXBvbmVudHMoKTogdm9pZCB7XHJcbiAgICB0aGlzLmNsdXN0ZXJQb3B1cHJlZnMuZm9yRWFjaChjcmVmID0+IHtcclxuICAgICAgaWYgKGNyZWYpIHtcclxuICAgICAgICBjcmVmLmRlc3Ryb3koKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB0aGlzLmNsdXN0ZXJQb3B1cHJlZnMgPSBbXTtcclxuICB9XHJcbn1cclxuIl19