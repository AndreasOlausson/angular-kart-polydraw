
import { Subject } from 'rxjs';

export class AlterPolygonComponent {

  simplyfiClicked: Subject<MouseEvent> = new Subject<MouseEvent>();

  bboxClicked: Subject<MouseEvent> = new Subject<MouseEvent>();

  onSimplify($event: MouseEvent): void {
    this.simplyfiClicked.next($event);
  }

  onBbox($event: MouseEvent): void {
    this.bboxClicked.next($event);
  }

}
