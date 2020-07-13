import { NgModule } from "@angular/core";
import { AlterPolygonComponent } from "./popups/alter-polygon/alter-polygon.component";
import { PolyDrawService } from './polydraw.service';
import { PolygonInformationService } from './polygon-information.service';
import { PolyStateService } from './map-state.service';
import * as i0 from "@angular/core";
var MyLibModule = /** @class */ (function () {
    function MyLibModule() {
    }
    MyLibModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyLibModule });
    MyLibModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyLibModule_Factory(t) { return new (t || MyLibModule)(); }, providers: [PolyDrawService, PolygonInformationService, PolyStateService], imports: [[]] });
    return MyLibModule;
}());
export { MyLibModule };
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyLibModule, { declarations: [AlterPolygonComponent], exports: [AlterPolygonComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyLibModule, [{
        type: NgModule,
        args: [{
                declarations: [AlterPolygonComponent],
                imports: [],
                providers: [PolyDrawService, PolygonInformationService, PolyStateService],
                exports: [AlterPolygonComponent],
                entryComponents: [AlterPolygonComponent]
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktbGliLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9teS1saWIubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDdkYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDOztBQUV2RDtJQUFBO0tBTzJCO21EQUFkLFdBQVc7eUdBQVgsV0FBVyxtQkFKWCxDQUFDLGVBQWUsRUFBRSx5QkFBeUIsRUFBRSxnQkFBZ0IsQ0FBQyxZQURoRSxFQUFFO3NCQVJiO0NBYTJCLEFBUDNCLElBTzJCO1NBQWQsV0FBVzt3RkFBWCxXQUFXLG1CQU5OLHFCQUFxQixhQUczQixxQkFBcUI7a0RBR3BCLFdBQVc7Y0FQdkIsUUFBUTtlQUFDO2dCQUNSLFlBQVksRUFBRSxDQUFFLHFCQUFxQixDQUFDO2dCQUN0QyxPQUFPLEVBQUUsRUFBRTtnQkFDWCxTQUFTLEVBQUUsQ0FBQyxlQUFlLEVBQUUseUJBQXlCLEVBQUUsZ0JBQWdCLENBQUM7Z0JBQ3pFLE9BQU8sRUFBRSxDQUFDLHFCQUFxQixDQUFFO2dCQUNqQyxlQUFlLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQzthQUN6QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHsgQWx0ZXJQb2x5Z29uQ29tcG9uZW50IH0gZnJvbSBcIi4vcG9wdXBzL2FsdGVyLXBvbHlnb24vYWx0ZXItcG9seWdvbi5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgUG9seURyYXdTZXJ2aWNlIH0gZnJvbSAnLi9wb2x5ZHJhdy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSB9IGZyb20gJy4vcG9seWdvbi1pbmZvcm1hdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUG9seVN0YXRlU2VydmljZSB9IGZyb20gJy4vbWFwLXN0YXRlLnNlcnZpY2UnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBkZWNsYXJhdGlvbnM6IFsgQWx0ZXJQb2x5Z29uQ29tcG9uZW50XSxcclxuICBpbXBvcnRzOiBbXSxcclxuICBwcm92aWRlcnM6IFtQb2x5RHJhd1NlcnZpY2UsIFBvbHlnb25JbmZvcm1hdGlvblNlcnZpY2UsIFBvbHlTdGF0ZVNlcnZpY2VdLFxyXG4gIGV4cG9ydHM6IFtBbHRlclBvbHlnb25Db21wb25lbnQgXSxcclxuICBlbnRyeUNvbXBvbmVudHM6IFtBbHRlclBvbHlnb25Db21wb25lbnRdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBNeUxpYk1vZHVsZSB7fVxyXG4iXX0=