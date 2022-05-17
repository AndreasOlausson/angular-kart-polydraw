import { NgModule } from "@angular/core";
import { AlterPolygonComponent } from "./popups/alter-polygon/alter-polygon.component";
import { PolyDrawService } from './polydraw.service';
import { PolygonInformationService } from './polygon-information.service';
import { PolyStateService } from './map-state.service';
import * as i0 from "@angular/core";
export class MyLibModule {
}
MyLibModule.ɵfac = function MyLibModule_Factory(t) { return new (t || MyLibModule)(); };
MyLibModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyLibModule });
MyLibModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [PolyDrawService, PolygonInformationService, PolyStateService], imports: [[]] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyLibModule, [{
        type: NgModule,
        args: [{
                declarations: [AlterPolygonComponent],
                imports: [],
                providers: [PolyDrawService, PolygonInformationService, PolyStateService],
                exports: [AlterPolygonComponent],
                entryComponents: [AlterPolygonComponent]
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyLibModule, { declarations: [AlterPolygonComponent], exports: [AlterPolygonComponent] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktbGliLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9teS1saWIubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDdkYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDOztBQVN2RCxNQUFNLE9BQU8sV0FBVzs7c0VBQVgsV0FBVzs2REFBWCxXQUFXO2tFQUpYLENBQUMsZUFBZSxFQUFFLHlCQUF5QixFQUFFLGdCQUFnQixDQUFDLFlBRGhFLEVBQUU7dUZBS0EsV0FBVztjQVB2QixRQUFRO2VBQUM7Z0JBQ1IsWUFBWSxFQUFFLENBQUUscUJBQXFCLENBQUM7Z0JBQ3RDLE9BQU8sRUFBRSxFQUFFO2dCQUNYLFNBQVMsRUFBRSxDQUFDLGVBQWUsRUFBRSx5QkFBeUIsRUFBRSxnQkFBZ0IsQ0FBQztnQkFDekUsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUU7Z0JBQ2pDLGVBQWUsRUFBRSxDQUFDLHFCQUFxQixDQUFDO2FBQ3pDOzt3RkFDWSxXQUFXLG1CQU5OLHFCQUFxQixhQUczQixxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IEFsdGVyUG9seWdvbkNvbXBvbmVudCB9IGZyb20gXCIuL3BvcHVwcy9hbHRlci1wb2x5Z29uL2FsdGVyLXBvbHlnb24uY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IFBvbHlEcmF3U2VydmljZSB9IGZyb20gJy4vcG9seWRyYXcuc2VydmljZSc7XHJcbmltcG9ydCB7IFBvbHlnb25JbmZvcm1hdGlvblNlcnZpY2UgfSBmcm9tICcuL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IFBvbHlTdGF0ZVNlcnZpY2UgfSBmcm9tICcuL21hcC1zdGF0ZS5zZXJ2aWNlJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgZGVjbGFyYXRpb25zOiBbIEFsdGVyUG9seWdvbkNvbXBvbmVudF0sXHJcbiAgaW1wb3J0czogW10sXHJcbiAgcHJvdmlkZXJzOiBbUG9seURyYXdTZXJ2aWNlLCBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlLCBQb2x5U3RhdGVTZXJ2aWNlXSxcclxuICBleHBvcnRzOiBbQWx0ZXJQb2x5Z29uQ29tcG9uZW50IF0sXHJcbiAgZW50cnlDb21wb25lbnRzOiBbQWx0ZXJQb2x5Z29uQ29tcG9uZW50XVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTXlMaWJNb2R1bGUge31cclxuIl19