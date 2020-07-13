import { Component, Output, EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
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
    AlterPolygonComponent.ɵfac = function AlterPolygonComponent_Factory(t) { return new (t || AlterPolygonComponent)(); };
    AlterPolygonComponent.ɵcmp = i0.ɵɵdefineComponent({ type: AlterPolygonComponent, selectors: [["app-alter-polygon"]], outputs: { simplyfiClicked: "simplyfiClicked", bboxClicked: "bboxClicked" }, decls: 9, vars: 0, consts: [[1, "marker-menu-inner-wrapper"], [1, "marker-menu-header"], [1, "marker-menu-content"], [1, "marker-menu-button", "simplify", 3, "click"], [1, "marker-menu-separator"], [1, "marker-menu-button", "bbox", 3, "click"]], template: function AlterPolygonComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵelementStart(1, "div", 1);
            i0.ɵɵtext(2, "Alter polygon");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "div", 2);
            i0.ɵɵelementStart(4, "div", 3);
            i0.ɵɵlistener("click", function AlterPolygonComponent_Template_div_click_4_listener($event) { return ctx.onSimplify($event); });
            i0.ɵɵtext(5, "Simplify");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(6, "div", 4);
            i0.ɵɵelementStart(7, "div", 5);
            i0.ɵɵlistener("click", function AlterPolygonComponent_Template_div_click_7_listener($event) { return ctx.onBbox($event); });
            i0.ɵɵtext(8, "bbox");
            i0.ɵɵelementEnd();
            i0.ɵɵelementEnd();
            i0.ɵɵelementEnd();
        } }, styles: [""] });
    return AlterPolygonComponent;
}());
export { AlterPolygonComponent };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(AlterPolygonComponent, [{
        type: Component,
        args: [{
                selector: 'app-alter-polygon',
                templateUrl: './alter-polygon.component.html',
                styleUrls: ['./alter-polygon.component.css']
            }]
    }], null, { simplyfiClicked: [{
            type: Output
        }], bboxClicked: [{
            type: Output
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWx0ZXItcG9seWdvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvcG9wdXBzL2FsdGVyLXBvbHlnb24vYWx0ZXItcG9seWdvbi5jb21wb25lbnQudHMiLCJsaWIvcG9wdXBzL2FsdGVyLXBvbHlnb24vYWx0ZXItcG9seWdvbi5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBRWhFO0lBQUE7UUFPWSxvQkFBZSxHQUE2QixJQUFJLFlBQVksRUFBYyxDQUFDO1FBRTNFLGdCQUFXLEdBQTZCLElBQUksWUFBWSxFQUFjLENBQUM7S0FVbEY7SUFSQywwQ0FBVSxHQUFWLFVBQVcsTUFBa0I7UUFDM0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELHNDQUFNLEdBQU4sVUFBTyxNQUFrQjtRQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoQyxDQUFDOzhGQVpVLHFCQUFxQjs4REFBckIscUJBQXFCO1lDUGxDLDhCQUNFO1lBQUEsOEJBQWdDO1lBQUEsNkJBQWE7WUFBQSxpQkFBTTtZQUNuRCw4QkFDRTtZQUFBLDhCQUFzRTtZQUE3QixxR0FBUyxzQkFBa0IsSUFBQztZQUFDLHdCQUFRO1lBQUEsaUJBQU07WUFDcEYseUJBQXlDO1lBQ3pDLDhCQUErRDtZQUExQixxR0FBUyxrQkFBYyxJQUFDO1lBQUUsb0JBQUk7WUFBQSxpQkFBTTtZQUMzRSxpQkFBTTtZQUNSLGlCQUFNOztnQ0RQTjtDQXFCQyxBQW5CRCxJQW1CQztTQWRZLHFCQUFxQjtrREFBckIscUJBQXFCO2NBTGpDLFNBQVM7ZUFBQztnQkFDVCxRQUFRLEVBQUUsbUJBQW1CO2dCQUM3QixXQUFXLEVBQUUsZ0NBQWdDO2dCQUM3QyxTQUFTLEVBQUUsQ0FBQywrQkFBK0IsQ0FBQzthQUM3Qzs7a0JBR0UsTUFBTTs7a0JBRU4sTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnYXBwLWFsdGVyLXBvbHlnb24nLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9hbHRlci1wb2x5Z29uLmNvbXBvbmVudC5odG1sJyxcclxuICBzdHlsZVVybHM6IFsnLi9hbHRlci1wb2x5Z29uLmNvbXBvbmVudC5jc3MnXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgQWx0ZXJQb2x5Z29uQ29tcG9uZW50IHtcclxuXHJcbiAgQE91dHB1dCgpIHNpbXBseWZpQ2xpY2tlZDogRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xyXG5cclxuICBAT3V0cHV0KCkgYmJveENsaWNrZWQ6IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4oKTtcclxuXHJcbiAgb25TaW1wbGlmeSgkZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIHRoaXMuc2ltcGx5ZmlDbGlja2VkLmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG4gIG9uQmJveCgkZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIHRoaXMuYmJveENsaWNrZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbn1cclxuIiwiPGRpdiBjbGFzcz1cIm1hcmtlci1tZW51LWlubmVyLXdyYXBwZXJcIj5cclxuICA8ZGl2IGNsYXNzPVwibWFya2VyLW1lbnUtaGVhZGVyXCI+QWx0ZXIgcG9seWdvbjwvZGl2PlxyXG4gIDxkaXYgY2xhc3M9XCJtYXJrZXItbWVudS1jb250ZW50XCI+XHJcbiAgICA8ZGl2IGNsYXNzPVwibWFya2VyLW1lbnUtYnV0dG9uIHNpbXBsaWZ5XCIgKGNsaWNrKT1cIm9uU2ltcGxpZnkoJGV2ZW50KVwiPlNpbXBsaWZ5PC9kaXY+XHJcbiAgICA8ZGl2IGNsYXNzPVwibWFya2VyLW1lbnUtc2VwYXJhdG9yXCI+PC9kaXY+XHJcbiAgICA8ZGl2IGNsYXNzPVwibWFya2VyLW1lbnUtYnV0dG9uIGJib3hcIiAoY2xpY2spPVwib25CYm94KCRldmVudClcIiA+YmJveDwvZGl2PlxyXG4gIDwvZGl2PlxyXG48L2Rpdj4iXX0=