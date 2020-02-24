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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWx0ZXItcG9seWdvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvcG9wdXBzL2FsdGVyLXBvbHlnb24vYWx0ZXItcG9seWdvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU9oRTtJQUFBO1FBRVksb0JBQWUsR0FBNkIsSUFBSSxZQUFZLEVBQWMsQ0FBQztRQUUzRSxnQkFBVyxHQUE2QixJQUFJLFlBQVksRUFBYyxDQUFDO0lBVW5GLENBQUM7SUFSQywwQ0FBVSxHQUFWLFVBQVcsTUFBa0I7UUFDM0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELHNDQUFNLEdBQU4sVUFBTyxNQUFrQjtRQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBVlM7UUFBVCxNQUFNLEVBQUU7a0NBQWtCLFlBQVk7a0VBQThDO0lBRTNFO1FBQVQsTUFBTSxFQUFFO2tDQUFjLFlBQVk7OERBQThDO0lBSnRFLHFCQUFxQjtRQUxqQyxTQUFTLENBQUM7WUFDVCxRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLHVaQUE2Qzs7U0FFOUMsQ0FBQztPQUNXLHFCQUFxQixDQWNqQztJQUFELDRCQUFDO0NBQUEsQUFkRCxJQWNDO1NBZFkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPdXRwdXQsIEV2ZW50RW1pdHRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdhcHAtYWx0ZXItcG9seWdvbicsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL2FsdGVyLXBvbHlnb24uY29tcG9uZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsczogWycuL2FsdGVyLXBvbHlnb24uY29tcG9uZW50LmNzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBbHRlclBvbHlnb25Db21wb25lbnQge1xyXG5cclxuICBAT3V0cHV0KCkgc2ltcGx5ZmlDbGlja2VkOiBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+KCk7XHJcblxyXG4gIEBPdXRwdXQoKSBiYm94Q2xpY2tlZDogRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xyXG5cclxuICBvblNpbXBsaWZ5KCRldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgdGhpcy5zaW1wbHlmaUNsaWNrZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25CYm94KCRldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgdGhpcy5iYm94Q2xpY2tlZC5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxufVxyXG4iXX0=