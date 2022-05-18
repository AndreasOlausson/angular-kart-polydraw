import { Component, Output, EventEmitter } from '@angular/core';
export class AlterPolygonComponent {
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
}
AlterPolygonComponent.decorators = [
    { type: Component, args: [{
                selector: 'app-alter-polygon',
                template: "<div class=\"marker-menu-inner-wrapper\">\r\n  <div class=\"marker-menu-header\">Alter polygon</div>\r\n  <div class=\"marker-menu-content\">\r\n    <div class=\"marker-menu-button simplify\" (click)=\"onSimplify($event)\">Simplify</div>\r\n    <div class=\"marker-menu-separator\"></div>\r\n    <div class=\"marker-menu-button bbox\" (click)=\"onBbox($event)\" >bbox</div>\r\n  </div>\r\n</div>",
                styles: [""]
            },] }
];
AlterPolygonComponent.propDecorators = {
    simplyfiClicked: [{ type: Output }],
    bboxClicked: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWx0ZXItcG9seWdvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9teS1saWIvc3JjL2xpYi9wb3B1cHMvYWx0ZXItcG9seWdvbi9hbHRlci1wb2x5Z29uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFPaEUsTUFBTSxPQUFPLHFCQUFxQjtJQUxsQztRQU9ZLG9CQUFlLEdBQTZCLElBQUksWUFBWSxFQUFjLENBQUM7UUFFM0UsZ0JBQVcsR0FBNkIsSUFBSSxZQUFZLEVBQWMsQ0FBQztJQVVuRixDQUFDO0lBUkMsVUFBVSxDQUFDLE1BQWtCO1FBQzNCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBa0I7UUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsQ0FBQzs7O1lBakJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsbUJBQW1CO2dCQUM3Qix1WkFBNkM7O2FBRTlDOzs7OEJBR0UsTUFBTTswQkFFTixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPdXRwdXQsIEV2ZW50RW1pdHRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdhcHAtYWx0ZXItcG9seWdvbicsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL2FsdGVyLXBvbHlnb24uY29tcG9uZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsczogWycuL2FsdGVyLXBvbHlnb24uY29tcG9uZW50LmNzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBbHRlclBvbHlnb25Db21wb25lbnQge1xyXG5cclxuICBAT3V0cHV0KCkgc2ltcGx5ZmlDbGlja2VkOiBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+KCk7XHJcblxyXG4gIEBPdXRwdXQoKSBiYm94Q2xpY2tlZDogRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xyXG5cclxuICBvblNpbXBsaWZ5KCRldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgdGhpcy5zaW1wbHlmaUNsaWNrZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25CYm94KCRldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgdGhpcy5iYm94Q2xpY2tlZC5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxufVxyXG4iXX0=