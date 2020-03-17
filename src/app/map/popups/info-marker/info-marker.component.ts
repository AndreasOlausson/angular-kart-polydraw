import { Subject } from "rxjs";

export class InfoMarkerPopupComponent {
  test = "JADA";
  test2 = 60;

  simplyfiClicked: Subject<MouseEvent> = new Subject<MouseEvent>();

  bboxClicked: Subject<MouseEvent> = new Subject<MouseEvent>();

  onSimplify($event: MouseEvent): void {
    this.simplyfiClicked.next($event);
  }

  onBbox($event: MouseEvent): void {
    this.bboxClicked.next($event);
  }

  getTestLabel(): string {
    return "yay";
  }
}
