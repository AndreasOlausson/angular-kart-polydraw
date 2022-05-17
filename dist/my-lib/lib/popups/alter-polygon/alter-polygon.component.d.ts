import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class AlterPolygonComponent {
    simplyfiClicked: EventEmitter<MouseEvent>;
    bboxClicked: EventEmitter<MouseEvent>;
    onSimplify($event: MouseEvent): void;
    onBbox($event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AlterPolygonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AlterPolygonComponent, "app-alter-polygon", never, {}, { "simplyfiClicked": "simplyfiClicked"; "bboxClicked": "bboxClicked"; }, never, never>;
}
