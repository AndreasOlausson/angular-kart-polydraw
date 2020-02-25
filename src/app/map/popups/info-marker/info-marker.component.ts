import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-info-marker',
  templateUrl: './info-marker.component.html',
  styleUrls: ['./info-marker.component.css']
})
export class InfoMarkerPopupComponent {
  test= 'JADA'
  test2 = 60

  @Output() simplyfiClicked: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  @Output() bboxClicked: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  onSimplify($event: MouseEvent): void {
    this.simplyfiClicked.emit($event);
  }

  onBbox($event: MouseEvent): void {
    this.bboxClicked.emit($event);
  }

}
