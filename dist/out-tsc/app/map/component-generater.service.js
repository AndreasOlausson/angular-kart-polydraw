var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ComponentFactoryResolver, Injector } from '@angular/core';
import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';
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
//# sourceMappingURL=component-generater.service.js.map