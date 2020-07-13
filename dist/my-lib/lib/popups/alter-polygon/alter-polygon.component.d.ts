import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class AlterPolygonComponent {
    simplyfiClicked: EventEmitter<MouseEvent>;
    bboxClicked: EventEmitter<MouseEvent>;
    onSimplify($event: MouseEvent): void;
    onBbox($event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDef<AlterPolygonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<AlterPolygonComponent, "app-alter-polygon", never, {}, { "simplyfiClicked": "simplyfiClicked"; "bboxClicked": "bboxClicked"; }, never, never>;
}
