import { __decorate } from "tslib";
import { NgModule } from "@angular/core";
import { AlterPolygonComponent } from "./popups/alter-polygon/alter-polygon.component";
import { PolyDrawService } from './polydraw.service';
import { PolygonInformationService } from './polygon-information.service';
import { PolyStateService } from './map-state.service';
let MyLibModule = class MyLibModule {
};
MyLibModule = __decorate([
    NgModule({
        declarations: [AlterPolygonComponent],
        imports: [],
        providers: [PolyDrawService, PolygonInformationService, PolyStateService],
        exports: [AlterPolygonComponent],
        entryComponents: [AlterPolygonComponent]
    })
], MyLibModule);
export { MyLibModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktbGliLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL215LWxpYi8iLCJzb3VyY2VzIjpbImxpYi9teS1saWIubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQVN2RCxJQUFhLFdBQVcsR0FBeEIsTUFBYSxXQUFXO0NBQUcsQ0FBQTtBQUFkLFdBQVc7SUFQdkIsUUFBUSxDQUFDO1FBQ1IsWUFBWSxFQUFFLENBQUUscUJBQXFCLENBQUM7UUFDdEMsT0FBTyxFQUFFLEVBQUU7UUFDWCxTQUFTLEVBQUUsQ0FBQyxlQUFlLEVBQUUseUJBQXlCLEVBQUUsZ0JBQWdCLENBQUM7UUFDekUsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUU7UUFDakMsZUFBZSxFQUFFLENBQUMscUJBQXFCLENBQUM7S0FDekMsQ0FBQztHQUNXLFdBQVcsQ0FBRztTQUFkLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IEFsdGVyUG9seWdvbkNvbXBvbmVudCB9IGZyb20gXCIuL3BvcHVwcy9hbHRlci1wb2x5Z29uL2FsdGVyLXBvbHlnb24uY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IFBvbHlEcmF3U2VydmljZSB9IGZyb20gJy4vcG9seWRyYXcuc2VydmljZSc7XHJcbmltcG9ydCB7IFBvbHlnb25JbmZvcm1hdGlvblNlcnZpY2UgfSBmcm9tICcuL3BvbHlnb24taW5mb3JtYXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IFBvbHlTdGF0ZVNlcnZpY2UgfSBmcm9tICcuL21hcC1zdGF0ZS5zZXJ2aWNlJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgZGVjbGFyYXRpb25zOiBbIEFsdGVyUG9seWdvbkNvbXBvbmVudF0sXHJcbiAgaW1wb3J0czogW10sXHJcbiAgcHJvdmlkZXJzOiBbUG9seURyYXdTZXJ2aWNlLCBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlLCBQb2x5U3RhdGVTZXJ2aWNlXSxcclxuICBleHBvcnRzOiBbQWx0ZXJQb2x5Z29uQ29tcG9uZW50IF0sXHJcbiAgZW50cnlDb21wb25lbnRzOiBbQWx0ZXJQb2x5Z29uQ29tcG9uZW50XVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTXlMaWJNb2R1bGUge31cclxuIl19