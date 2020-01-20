import { AlterPolygonComponent } from './popups/alter-polygon/alter-polygon.component';
/* @Injectable({
  providedIn: 'root'
}) */
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
    return ComponentGeneraterService;
}());
export { ComponentGeneraterService };
//# sourceMappingURL=component-generater.service.js.map