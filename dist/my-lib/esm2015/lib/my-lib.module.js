import { NgModule } from "@angular/core";
import { AlterPolygonComponent } from "./popups/alter-polygon/alter-polygon.component";
import { PolyDrawService } from './polydraw.service';
import { PolygonInformationService } from './polygon-information.service';
import { PolyStateService } from './map-state.service';
export class MyLibModule {
}
MyLibModule.decorators = [
    { type: NgModule, args: [{
                declarations: [AlterPolygonComponent],
                imports: [],
                providers: [PolyDrawService, PolygonInformationService, PolyStateService],
                exports: [AlterPolygonComponent],
                entryComponents: [AlterPolygonComponent]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktbGliLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL215LWxpYi9zcmMvbGliL215LWxpYi5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUN2RixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDckQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDMUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFTdkQsTUFBTSxPQUFPLFdBQVc7OztZQVB2QixRQUFRLFNBQUM7Z0JBQ1IsWUFBWSxFQUFFLENBQUUscUJBQXFCLENBQUM7Z0JBQ3RDLE9BQU8sRUFBRSxFQUFFO2dCQUNYLFNBQVMsRUFBRSxDQUFDLGVBQWUsRUFBRSx5QkFBeUIsRUFBRSxnQkFBZ0IsQ0FBQztnQkFDekUsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUU7Z0JBQ2pDLGVBQWUsRUFBRSxDQUFDLHFCQUFxQixDQUFDO2FBQ3pDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgeyBBbHRlclBvbHlnb25Db21wb25lbnQgfSBmcm9tIFwiLi9wb3B1cHMvYWx0ZXItcG9seWdvbi9hbHRlci1wb2x5Z29uLmNvbXBvbmVudFwiO1xyXG5pbXBvcnQgeyBQb2x5RHJhd1NlcnZpY2UgfSBmcm9tICcuL3BvbHlkcmF3LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBQb2x5Z29uSW5mb3JtYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi9wb2x5Z29uLWluZm9ybWF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBQb2x5U3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi9tYXAtc3RhdGUuc2VydmljZSc7XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gIGRlY2xhcmF0aW9uczogWyBBbHRlclBvbHlnb25Db21wb25lbnRdLFxyXG4gIGltcG9ydHM6IFtdLFxyXG4gIHByb3ZpZGVyczogW1BvbHlEcmF3U2VydmljZSwgUG9seWdvbkluZm9ybWF0aW9uU2VydmljZSwgUG9seVN0YXRlU2VydmljZV0sXHJcbiAgZXhwb3J0czogW0FsdGVyUG9seWdvbkNvbXBvbmVudCBdLFxyXG4gIGVudHJ5Q29tcG9uZW50czogW0FsdGVyUG9seWdvbkNvbXBvbmVudF1cclxufSlcclxuZXhwb3J0IGNsYXNzIE15TGliTW9kdWxlIHt9XHJcbiJdfQ==