import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-marker',
  templateUrl: './info-marker.component.html',
  styleUrls: ['./info-marker.component.css']
})
export class InfoMarkerPopupComponent implements OnInit {
  ngOnInit(): void {
    this.areaLabel = "fooo"
  }

  areaLabel: string = "Areaz"

  @Output() simplyfiClicked: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  @Output() bboxClicked: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();



  onSimplify($event: MouseEvent): void {
    this.simplyfiClicked.emit($event);
  }

  onBbox($event: MouseEvent): void {
    this.bboxClicked.emit($event);
  }

  getTestLabel():string{
    return "yay";
  }
}
