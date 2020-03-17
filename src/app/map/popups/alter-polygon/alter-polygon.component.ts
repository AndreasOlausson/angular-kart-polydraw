import { Component, Output, EventEmitter } from '@angular/core';

/* @Component({
  selector: 'app-alter-polygon',
  templateUrl: './alter-polygon.component.html',
  styleUrls: ['./alter-polygon.component.css']
}) */
export class AlterPolygonComponent {

  simplyfiClicked: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  bboxClicked: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  onSimplify($event: MouseEvent): void {
    this.simplyfiClicked.emit($event);
  }

  onBbox($event: MouseEvent): void {
    this.bboxClicked.emit($event);
  }

}
