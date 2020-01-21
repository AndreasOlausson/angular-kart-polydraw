import * as tslib_1 from "tslib";
import { Component, Output, EventEmitter } from '@angular/core';
let AlterPolygonComponent = class AlterPolygonComponent {
    constructor() {
        this.simplyfiClicked = new EventEmitter();
        this.bboxClicked = new EventEmitter();
    }
    onSimplify($event) {
        this.simplyfiClicked.emit($event);
    }
    onBbox($event) {
        this.bboxClicked.emit($event);
    }
};
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], AlterPolygonComponent.prototype, "simplyfiClicked", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], AlterPolygonComponent.prototype, "bboxClicked", void 0);
AlterPolygonComponent = tslib_1.__decorate([
    Component({
        selector: 'app-alter-polygon',
        template: "<div class=\"marker-menu-inner-wrapper\">\r\n  <div class=\"marker-menu-header\">Alter polygon</div>\r\n  <div class=\"marker-menu-content\">\r\n    <div class=\"marker-menu-button simplify\" (click)=\"onSimplify($event)\">Simplify</div>\r\n    <div class=\"marker-menu-separator\"></div>\r\n    <div class=\"marker-menu-button bbox\" (click)=\"onBbox($event)\" >bbox</div>\r\n  </div>\r\n</div>",
        styles: [""]
    })
], AlterPolygonComponent);
export { AlterPolygonComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWx0ZXItcG9seWdvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvcG9wdXBzL2FsdGVyLXBvbHlnb24vYWx0ZXItcG9seWdvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU9oRSxJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFxQjtJQUxsQztRQU9ZLG9CQUFlLEdBQTZCLElBQUksWUFBWSxFQUFjLENBQUM7UUFFM0UsZ0JBQVcsR0FBNkIsSUFBSSxZQUFZLEVBQWMsQ0FBQztJQVVuRixDQUFDO0lBUkMsVUFBVSxDQUFDLE1BQWtCO1FBQzNCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBa0I7UUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUVGLENBQUE7QUFaVztJQUFULE1BQU0sRUFBRTtzQ0FBa0IsWUFBWTs4REFBOEM7QUFFM0U7SUFBVCxNQUFNLEVBQUU7c0NBQWMsWUFBWTswREFBOEM7QUFKdEUscUJBQXFCO0lBTGpDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxtQkFBbUI7UUFDN0IsdVpBQTZDOztLQUU5QyxDQUFDO0dBQ1cscUJBQXFCLENBY2pDO1NBZFkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPdXRwdXQsIEV2ZW50RW1pdHRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdhcHAtYWx0ZXItcG9seWdvbicsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL2FsdGVyLXBvbHlnb24uY29tcG9uZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsczogWycuL2FsdGVyLXBvbHlnb24uY29tcG9uZW50LmNzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBbHRlclBvbHlnb25Db21wb25lbnQge1xyXG5cclxuICBAT3V0cHV0KCkgc2ltcGx5ZmlDbGlja2VkOiBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+KCk7XHJcblxyXG4gIEBPdXRwdXQoKSBiYm94Q2xpY2tlZDogRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xyXG5cclxuICBvblNpbXBsaWZ5KCRldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgdGhpcy5zaW1wbHlmaUNsaWNrZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25CYm94KCRldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgdGhpcy5iYm94Q2xpY2tlZC5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxufVxyXG4iXX0=