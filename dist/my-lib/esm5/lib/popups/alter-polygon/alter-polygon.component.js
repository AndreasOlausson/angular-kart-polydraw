import { __decorate, __metadata } from "tslib";
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
            template: "<div class=\"marker-menu-inner-wrapper\">\r\n  <div class=\"marker-menu-header\">Alter polygon</div>\r\n  <div class=\"marker-menu-content\">\r\n    <div class=\"marker-menu-button simplify\" (click)=\"onSimplify($event)\">Simplify</div>\r\n    <div class=\"marker-menu-separator\"></div>\r\n    <div class=\"marker-menu-button bbox\" (click)=\"onBbox($event)\" >bbox</div>\r\n  </div>\r\n</div>",
            styles: [""]
        })
    ], AlterPolygonComponent);
    return AlterPolygonComponent;
}());
export { AlterPolygonComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWx0ZXItcG9seWdvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9wb2x5ZHJhdy8iLCJzb3VyY2VzIjpbImxpYi9wb3B1cHMvYWx0ZXItcG9seWdvbi9hbHRlci1wb2x5Z29uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBT2hFO0lBQUE7UUFFWSxvQkFBZSxHQUE2QixJQUFJLFlBQVksRUFBYyxDQUFDO1FBRTNFLGdCQUFXLEdBQTZCLElBQUksWUFBWSxFQUFjLENBQUM7SUFVbkYsQ0FBQztJQVJDLDBDQUFVLEdBQVYsVUFBVyxNQUFrQjtRQUMzQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsc0NBQU0sR0FBTixVQUFPLE1BQWtCO1FBQ3ZCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFWUztRQUFULE1BQU0sRUFBRTtrQ0FBa0IsWUFBWTtrRUFBOEM7SUFFM0U7UUFBVCxNQUFNLEVBQUU7a0NBQWMsWUFBWTs4REFBOEM7SUFKdEUscUJBQXFCO1FBTGpDLFNBQVMsQ0FBQztZQUNULFFBQVEsRUFBRSxtQkFBbUI7WUFDN0IsdVpBQTZDOztTQUU5QyxDQUFDO09BQ1cscUJBQXFCLENBY2pDO0lBQUQsNEJBQUM7Q0FBQSxBQWRELElBY0M7U0FkWSxxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE91dHB1dCwgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2FwcC1hbHRlci1wb2x5Z29uJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vYWx0ZXItcG9seWdvbi5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vYWx0ZXItcG9seWdvbi5jb21wb25lbnQuY3NzJ11cclxufSlcclxuZXhwb3J0IGNsYXNzIEFsdGVyUG9seWdvbkNvbXBvbmVudCB7XHJcblxyXG4gIEBPdXRwdXQoKSBzaW1wbHlmaUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4oKTtcclxuXHJcbiAgQE91dHB1dCgpIGJib3hDbGlja2VkOiBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+KCk7XHJcblxyXG4gIG9uU2ltcGxpZnkoJGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICB0aGlzLnNpbXBseWZpQ2xpY2tlZC5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBvbkJib3goJGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICB0aGlzLmJib3hDbGlja2VkLmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG59XHJcbiJdfQ==