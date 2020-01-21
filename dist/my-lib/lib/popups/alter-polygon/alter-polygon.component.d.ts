import { EventEmitter } from '@angular/core';
export declare class AlterPolygonComponent {
    simplyfiClicked: EventEmitter<MouseEvent>;
    bboxClicked: EventEmitter<MouseEvent>;
    onSimplify($event: MouseEvent): void;
    onBbox($event: MouseEvent): void;
}
