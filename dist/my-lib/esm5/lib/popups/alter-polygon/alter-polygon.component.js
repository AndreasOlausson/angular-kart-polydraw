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
    AlterPolygonComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AlterPolygonComponent, selectors: [["app-alter-polygon"]], outputs: { simplyfiClicked: "simplyfiClicked", bboxClicked: "bboxClicked" }, decls: 9, vars: 0, consts: [[1, "marker-menu-inner-wrapper"], [1, "marker-menu-header"], [1, "marker-menu-content"], [1, "marker-menu-button", "simplify", 3, "click"], [1, "marker-menu-separator"], [1, "marker-menu-button", "bbox", 3, "click"]], template: function AlterPolygonComponent_Template(rf, ctx) { if (rf & 1) {
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
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AlterPolygonComponent, [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWx0ZXItcG9seWdvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvcG9wdXBzL2FsdGVyLXBvbHlnb24vYWx0ZXItcG9seWdvbi5jb21wb25lbnQudHMiLCJsaWIvcG9wdXBzL2FsdGVyLXBvbHlnb24vYWx0ZXItcG9seWdvbi5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBRWhFO0lBQUE7UUFPWSxvQkFBZSxHQUE2QixJQUFJLFlBQVksRUFBYyxDQUFDO1FBRTNFLGdCQUFXLEdBQTZCLElBQUksWUFBWSxFQUFjLENBQUM7S0FVbEY7SUFSQywwQ0FBVSxHQUFWLFVBQVcsTUFBa0I7UUFDM0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELHNDQUFNLEdBQU4sVUFBTyxNQUFrQjtRQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoQyxDQUFDOzhGQVpVLHFCQUFxQjs0RUFBckIscUJBQXFCO1lDUGxDLDhCQUF1QztZQUNyQyw4QkFBZ0M7WUFBQSw2QkFBYTtZQUFBLGlCQUFNO1lBQ25ELDhCQUFpQztZQUMvQiw4QkFBc0U7WUFBN0IscUdBQVMsc0JBQWtCLElBQUM7WUFBQyx3QkFBUTtZQUFBLGlCQUFNO1lBQ3BGLHlCQUF5QztZQUN6Qyw4QkFBK0Q7WUFBMUIscUdBQVMsa0JBQWMsSUFBQztZQUFFLG9CQUFJO1lBQUEsaUJBQU07WUFDM0UsaUJBQU07WUFDUixpQkFBTTs7Z0NEUE47Q0FxQkMsQUFuQkQsSUFtQkM7U0FkWSxxQkFBcUI7dUZBQXJCLHFCQUFxQjtjQUxqQyxTQUFTO2VBQUM7Z0JBQ1QsUUFBUSxFQUFFLG1CQUFtQjtnQkFDN0IsV0FBVyxFQUFFLGdDQUFnQztnQkFDN0MsU0FBUyxFQUFFLENBQUMsK0JBQStCLENBQUM7YUFDN0M7Z0JBR1csZUFBZTtrQkFBeEIsTUFBTTtZQUVHLFdBQVc7a0JBQXBCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE91dHB1dCwgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2FwcC1hbHRlci1wb2x5Z29uJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vYWx0ZXItcG9seWdvbi5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vYWx0ZXItcG9seWdvbi5jb21wb25lbnQuY3NzJ11cclxufSlcclxuZXhwb3J0IGNsYXNzIEFsdGVyUG9seWdvbkNvbXBvbmVudCB7XHJcblxyXG4gIEBPdXRwdXQoKSBzaW1wbHlmaUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4oKTtcclxuXHJcbiAgQE91dHB1dCgpIGJib3hDbGlja2VkOiBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+KCk7XHJcblxyXG4gIG9uU2ltcGxpZnkoJGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICB0aGlzLnNpbXBseWZpQ2xpY2tlZC5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBvbkJib3goJGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICB0aGlzLmJib3hDbGlja2VkLmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG59XHJcbiIsIjxkaXYgY2xhc3M9XCJtYXJrZXItbWVudS1pbm5lci13cmFwcGVyXCI+XHJcbiAgPGRpdiBjbGFzcz1cIm1hcmtlci1tZW51LWhlYWRlclwiPkFsdGVyIHBvbHlnb248L2Rpdj5cclxuICA8ZGl2IGNsYXNzPVwibWFya2VyLW1lbnUtY29udGVudFwiPlxyXG4gICAgPGRpdiBjbGFzcz1cIm1hcmtlci1tZW51LWJ1dHRvbiBzaW1wbGlmeVwiIChjbGljayk9XCJvblNpbXBsaWZ5KCRldmVudClcIj5TaW1wbGlmeTwvZGl2PlxyXG4gICAgPGRpdiBjbGFzcz1cIm1hcmtlci1tZW51LXNlcGFyYXRvclwiPjwvZGl2PlxyXG4gICAgPGRpdiBjbGFzcz1cIm1hcmtlci1tZW51LWJ1dHRvbiBiYm94XCIgKGNsaWNrKT1cIm9uQmJveCgkZXZlbnQpXCIgPmJib3g8L2Rpdj5cclxuICA8L2Rpdj5cclxuPC9kaXY+Il19