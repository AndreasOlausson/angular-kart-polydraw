var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Output, EventEmitter } from '@angular/core';
var AlterPolygonComponent = /** @class */ (function () {
    function AlterPolygonComponent() {
        this.simplyfiClicked = new EventEmitter();
        this.bboxClicked = new EventEmitter();
    }
    AlterPolygonComponent.prototype.onSimplify = function ($event) {
        this.simplyfiClicked.emit($event);
    };
    AlterPolygonComponent.prototype.onBbox = function ($event) {
        this.bboxClicked.emit($event);
    };
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AlterPolygonComponent.prototype, "simplyfiClicked", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AlterPolygonComponent.prototype, "bboxClicked", void 0);
    AlterPolygonComponent = __decorate([
        Component({
            selector: 'app-alter-polygon',
            templateUrl: './alter-polygon.component.html',
            styleUrls: ['./alter-polygon.component.css']
        })
    ], AlterPolygonComponent);
    return AlterPolygonComponent;
}());
export { AlterPolygonComponent };
//# sourceMappingURL=alter-polygon.component.js.map