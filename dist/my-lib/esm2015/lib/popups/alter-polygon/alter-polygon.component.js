import { __decorate, __metadata } from "tslib";
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
        template: "<div class=\"marker-menu-inner-wrapper\">\n  <div class=\"marker-menu-header\">Alter polygon</div>\n  <div class=\"marker-menu-content\">\n    <div class=\"marker-menu-button simplify\" (click)=\"onSimplify($event)\">Simplify</div>\n    <div class=\"marker-menu-separator\"></div>\n    <div class=\"marker-menu-button bbox\" (click)=\"onBbox($event)\" >bbox</div>\n  </div>\n</div>",
        styles: [""]
    })
], AlterPolygonComponent);
export { AlterPolygonComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWx0ZXItcG9seWdvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvcG9wdXBzL2FsdGVyLXBvbHlnb24vYWx0ZXItcG9seWdvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU9oRSxJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFxQjtJQUFsQztRQUVZLG9CQUFlLEdBQTZCLElBQUksWUFBWSxFQUFjLENBQUM7UUFFM0UsZ0JBQVcsR0FBNkIsSUFBSSxZQUFZLEVBQWMsQ0FBQztJQVVuRixDQUFDO0lBUkMsVUFBVSxDQUFDLE1BQWtCO1FBQzNCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBa0I7UUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUVGLENBQUE7QUFaVztJQUFULE1BQU0sRUFBRTs4QkFBa0IsWUFBWTs4REFBOEM7QUFFM0U7SUFBVCxNQUFNLEVBQUU7OEJBQWMsWUFBWTswREFBOEM7QUFKdEUscUJBQXFCO0lBTGpDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxtQkFBbUI7UUFDN0IseVlBQTZDOztLQUU5QyxDQUFDO0dBQ1cscUJBQXFCLENBY2pDO1NBZFkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPdXRwdXQsIEV2ZW50RW1pdHRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdhcHAtYWx0ZXItcG9seWdvbicsXG4gIHRlbXBsYXRlVXJsOiAnLi9hbHRlci1wb2x5Z29uLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vYWx0ZXItcG9seWdvbi5jb21wb25lbnQuY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgQWx0ZXJQb2x5Z29uQ29tcG9uZW50IHtcblxuICBAT3V0cHV0KCkgc2ltcGx5ZmlDbGlja2VkOiBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+KCk7XG5cbiAgQE91dHB1dCgpIGJib3hDbGlja2VkOiBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+KCk7XG5cbiAgb25TaW1wbGlmeSgkZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnNpbXBseWZpQ2xpY2tlZC5lbWl0KCRldmVudCk7XG4gIH1cblxuICBvbkJib3goJGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5iYm94Q2xpY2tlZC5lbWl0KCRldmVudCk7XG4gIH1cblxufVxuIl19