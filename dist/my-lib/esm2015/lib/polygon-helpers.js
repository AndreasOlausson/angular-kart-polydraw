import { PolygonUtil } from './polygon.util';
export class PolygonInfo {
    constructor(polygon) {
        this.polygon = [];
        this.trashcanPoint = [];
        this.sqmArea = [];
        this.perimeter = [];
        console.log('PolygonInfo: ', polygon);
        polygon.forEach((polygons, i) => {
            this.trashcanPoint[i] = this.getTrashcanPoint(polygons[0]);
            this.sqmArea[i] = this.calculatePolygonArea(polygons[0]);
            this.perimeter[i] = this.calculatePolygonPerimeter(polygons[0]);
            console.log(polygons[0]);
            this.polygon[i] = polygons;
        });
    }
    setSqmArea(area) {
        this.sqmArea[0] = area;
    }
    getTrashcanPoint(polygon) {
        const res = Math.max.apply(Math, polygon.map(o => o.lat));
        const idx = polygon.findIndex(o => o.lat === res);
        let previousPoint;
        let nextPoint;
        if (idx > 0) {
            previousPoint = polygon[idx - 1];
            if (idx < polygon.length - 1) {
                nextPoint = polygon[idx + 1];
            }
            else {
                nextPoint = polygon[0];
            }
        }
        else {
            previousPoint = polygon[polygon.length - 1];
            nextPoint = polygon[idx + 1];
        }
        const secondPoint = previousPoint.lng < nextPoint.lng ? previousPoint : nextPoint;
        const midpoint = PolygonUtil.getMidPoint(polygon[idx], secondPoint);
        return midpoint;
    }
    calculatePolygonArea(polygon) {
        const area = PolygonUtil.getSqmArea(polygon);
        return area;
    }
    calculatePolygonPerimeter(polygon) {
        const perimeter = PolygonUtil.getPerimeter(polygon);
        return perimeter;
    }
}
const addClass = (selector, className) => {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
        elements.item(i).classList.add(className);
    }
};
const ɵ0 = addClass;
const removeClass = (selector, className) => {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
        elements.item(i).classList.remove(className);
    }
};
const ɵ1 = removeClass;
export class PolygonDrawStates {
    constructor() {
        this.canUsePolyDraw = false;
        this.reset();
    }
    activate() {
        this.reset();
        this.isActivated = true;
    }
    reset() {
        this.isActivated = false;
        this.hasPolygons = false;
        this.canRevert = false;
        this.isAuto = false;
        this.resetDrawModes();
    }
    resetDrawModes() {
        this.isFreeDrawMode = false;
        removeClass('img.leaflet-tile', 'disable-events');
        this.isMoveMode = false;
    }
    setFreeDrawMode(isAuto = false) {
        if (isAuto) {
            this.isActivated = true;
        }
        if (this.isActivated) {
            this.resetDrawModes();
            this.isFreeDrawMode = true;
            addClass('img.leaflet-tile', 'disable-events');
            if (isAuto) {
                this.isAuto = true;
            }
        }
    }
    setMoveMode() {
        if (this.isActivated) {
            this.resetDrawModes();
            this.isMoveMode = true;
        }
    }
    forceCanUseFreeDraw() {
        this.canUsePolyDraw = true;
    }
}
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0MsTUFBTSxPQUFPLFdBQVc7SUFLdEIsWUFBWSxPQUFPO1FBSm5CLFlBQU8sR0FBa0IsRUFBRSxDQUFDO1FBQzVCLGtCQUFhLEdBQWMsRUFBRSxDQUFDO1FBQzlCLFlBQU8sR0FBYSxFQUFFLENBQUM7UUFDdkIsY0FBUyxHQUFhLEVBQUUsQ0FBQztRQUV2QixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0QyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzlCLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsVUFBVSxDQUFDLElBQVk7UUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUNPLGdCQUFnQixDQUFDLE9BQWtCO1FBQ3pDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUN4QixJQUFJLEVBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDeEIsQ0FBQztRQUNGLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRWxELElBQUksYUFBc0IsQ0FBQztRQUMzQixJQUFJLFNBQWtCLENBQUM7UUFFdkIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO1lBQ1gsYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDakMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzlCO2lCQUFNO2dCQUNMLFNBQVMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEI7U0FDRjthQUFNO1lBQ0wsYUFBYSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzVDLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzlCO1FBRUQsTUFBTSxXQUFXLEdBQ2YsYUFBYSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUVoRSxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUVwRSxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBQ08sb0JBQW9CLENBQUMsT0FBa0I7UUFDN0MsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFjLENBQUMsQ0FBQztRQUNwRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDTyx5QkFBeUIsQ0FBQyxPQUFrQjtRQUNsRCxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLE9BQWMsQ0FBQyxDQUFDO1FBQzNELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7Q0FDRjtBQUNELE1BQU0sUUFBUSxHQUFrRCxDQUM5RCxRQUFnQixFQUNoQixTQUFpQixFQUNYLEVBQUU7SUFDUixNQUFNLFFBQVEsR0FBNEIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUMzQztBQUNILENBQUMsQ0FBQzs7QUFFRixNQUFNLFdBQVcsR0FBa0QsQ0FDakUsUUFBZ0IsRUFDaEIsU0FBaUIsRUFDWCxFQUFFO0lBQ1IsTUFBTSxRQUFRLEdBQTRCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5RSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDOUM7QUFDSCxDQUFDLENBQUM7O0FBRUYsTUFBTSxPQUFPLGlCQUFpQjtJQVM1QjtRQUNFLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQzVCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUVwQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELGNBQWM7UUFDWixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztRQUM1QixXQUFXLENBQUMsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUMxQixDQUFDO0lBRUQsZUFBZSxDQUFDLFNBQWtCLEtBQUs7UUFDckMsSUFBSSxNQUFNLEVBQUU7WUFDVixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUN6QjtRQUNELElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNwQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDM0IsUUFBUSxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDL0MsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7YUFDcEI7U0FDRjtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUN4QjtJQUNILENBQUM7SUFFRCxtQkFBbUI7UUFDakIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUG9seWdvblV0aWwgfSBmcm9tICcuL3BvbHlnb24udXRpbCc7XHJcblxyXG5leHBvcnQgY2xhc3MgUG9seWdvbkluZm8ge1xyXG4gIHBvbHlnb246IElMYXRMbmdbXVtdW10gPSBbXTtcclxuICB0cmFzaGNhblBvaW50OiBJTGF0TG5nW10gPSBbXTtcclxuICBzcW1BcmVhOiBudW1iZXJbXSA9IFtdO1xyXG4gIHBlcmltZXRlcjogbnVtYmVyW10gPSBbXTtcclxuICBjb25zdHJ1Y3Rvcihwb2x5Z29uKSB7XHJcbiAgICBjb25zb2xlLmxvZygnUG9seWdvbkluZm86ICcsIHBvbHlnb24pO1xyXG4gICAgcG9seWdvbi5mb3JFYWNoKChwb2x5Z29ucywgaSkgPT4ge1xyXG4gICAgICB0aGlzLnRyYXNoY2FuUG9pbnRbaV0gPSB0aGlzLmdldFRyYXNoY2FuUG9pbnQocG9seWdvbnNbMF0pO1xyXG4gICAgICB0aGlzLnNxbUFyZWFbaV0gPSB0aGlzLmNhbGN1bGF0ZVBvbHlnb25BcmVhKHBvbHlnb25zWzBdKTtcclxuICAgICAgdGhpcy5wZXJpbWV0ZXJbaV0gPSB0aGlzLmNhbGN1bGF0ZVBvbHlnb25QZXJpbWV0ZXIocG9seWdvbnNbMF0pO1xyXG4gICAgICBjb25zb2xlLmxvZyhwb2x5Z29uc1swXSk7XHJcbiAgICAgIHRoaXMucG9seWdvbltpXSA9IHBvbHlnb25zO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHNldFNxbUFyZWEoYXJlYTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLnNxbUFyZWFbMF0gPSBhcmVhO1xyXG4gIH1cclxuICBwcml2YXRlIGdldFRyYXNoY2FuUG9pbnQocG9seWdvbjogSUxhdExuZ1tdKTogSUxhdExuZyB7XHJcbiAgICBjb25zdCByZXMgPSBNYXRoLm1heC5hcHBseShcclxuICAgICAgTWF0aCxcclxuICAgICAgcG9seWdvbi5tYXAobyA9PiBvLmxhdClcclxuICAgICk7XHJcbiAgICBjb25zdCBpZHggPSBwb2x5Z29uLmZpbmRJbmRleChvID0+IG8ubGF0ID09PSByZXMpO1xyXG5cclxuICAgIGxldCBwcmV2aW91c1BvaW50OiBJTGF0TG5nO1xyXG4gICAgbGV0IG5leHRQb2ludDogSUxhdExuZztcclxuXHJcbiAgICBpZiAoaWR4ID4gMCkge1xyXG4gICAgICBwcmV2aW91c1BvaW50ID0gcG9seWdvbltpZHggLSAxXTtcclxuICAgICAgaWYgKGlkeCA8IHBvbHlnb24ubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgIG5leHRQb2ludCA9IHBvbHlnb25baWR4ICsgMV07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV4dFBvaW50ID0gcG9seWdvblswXTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcHJldmlvdXNQb2ludCA9IHBvbHlnb25bcG9seWdvbi5sZW5ndGggLSAxXTtcclxuICAgICAgbmV4dFBvaW50ID0gcG9seWdvbltpZHggKyAxXTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZWNvbmRQb2ludCA9XHJcbiAgICAgIHByZXZpb3VzUG9pbnQubG5nIDwgbmV4dFBvaW50LmxuZyA/IHByZXZpb3VzUG9pbnQgOiBuZXh0UG9pbnQ7XHJcblxyXG4gICAgY29uc3QgbWlkcG9pbnQgPSBQb2x5Z29uVXRpbC5nZXRNaWRQb2ludChwb2x5Z29uW2lkeF0sIHNlY29uZFBvaW50KTtcclxuXHJcbiAgICByZXR1cm4gbWlkcG9pbnQ7XHJcbiAgfVxyXG4gIHByaXZhdGUgY2FsY3VsYXRlUG9seWdvbkFyZWEocG9seWdvbjogSUxhdExuZ1tdKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGFyZWEgPSBQb2x5Z29uVXRpbC5nZXRTcW1BcmVhKHBvbHlnb24gYXMgYW55KTtcclxuICAgIHJldHVybiBhcmVhO1xyXG4gIH1cclxuICBwcml2YXRlIGNhbGN1bGF0ZVBvbHlnb25QZXJpbWV0ZXIocG9seWdvbjogSUxhdExuZ1tdKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHBlcmltZXRlciA9IFBvbHlnb25VdGlsLmdldFBlcmltZXRlcihwb2x5Z29uIGFzIGFueSk7XHJcbiAgICByZXR1cm4gcGVyaW1ldGVyO1xyXG4gIH1cclxufVxyXG5jb25zdCBhZGRDbGFzczogKHNlbGVjdG9yOiBzdHJpbmcsIGNsYXNzTmFtZTogc3RyaW5nKSA9PiB2b2lkID0gKFxyXG4gIHNlbGVjdG9yOiBzdHJpbmcsXHJcbiAgY2xhc3NOYW1lOiBzdHJpbmdcclxuKTogdm9pZCA9PiB7XHJcbiAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgZWxlbWVudHMuaXRlbShpKS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgcmVtb3ZlQ2xhc3M6IChzZWxlY3Rvcjogc3RyaW5nLCBjbGFzc05hbWU6IHN0cmluZykgPT4gdm9pZCA9IChcclxuICBzZWxlY3Rvcjogc3RyaW5nLFxyXG4gIGNsYXNzTmFtZTogc3RyaW5nXHJcbik6IHZvaWQgPT4ge1xyXG4gIGNvbnN0IGVsZW1lbnRzOiBOb2RlTGlzdE9mPEhUTUxFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgIGVsZW1lbnRzLml0ZW0oaSkuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyBQb2x5Z29uRHJhd1N0YXRlcyB7XHJcbiAgaXNBY3RpdmF0ZWQ6IGJvb2xlYW47XHJcbiAgaXNGcmVlRHJhd01vZGU6IGJvb2xlYW47XHJcbiAgaXNNb3ZlTW9kZTogYm9vbGVhbjtcclxuICBjYW5SZXZlcnQ6IGJvb2xlYW47XHJcbiAgaXNBdXRvOiBib29sZWFuO1xyXG4gIGhhc1BvbHlnb25zOiBib29sZWFuO1xyXG4gIGNhblVzZVBvbHlEcmF3OiBib29sZWFuO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuY2FuVXNlUG9seURyYXcgPSBmYWxzZTtcclxuICAgIHRoaXMucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZXNldCgpO1xyXG4gICAgdGhpcy5pc0FjdGl2YXRlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNBY3RpdmF0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuaGFzUG9seWdvbnMgPSBmYWxzZTtcclxuICAgIHRoaXMuY2FuUmV2ZXJ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzQXV0byA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMucmVzZXREcmF3TW9kZXMoKTtcclxuICB9XHJcblxyXG4gIHJlc2V0RHJhd01vZGVzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc0ZyZWVEcmF3TW9kZSA9IGZhbHNlO1xyXG4gICAgcmVtb3ZlQ2xhc3MoJ2ltZy5sZWFmbGV0LXRpbGUnLCAnZGlzYWJsZS1ldmVudHMnKTtcclxuICAgIHRoaXMuaXNNb3ZlTW9kZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgc2V0RnJlZURyYXdNb2RlKGlzQXV0bzogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XHJcbiAgICBpZiAoaXNBdXRvKSB7XHJcbiAgICAgIHRoaXMuaXNBY3RpdmF0ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuaXNBY3RpdmF0ZWQpIHtcclxuICAgICAgdGhpcy5yZXNldERyYXdNb2RlcygpO1xyXG4gICAgICB0aGlzLmlzRnJlZURyYXdNb2RlID0gdHJ1ZTtcclxuICAgICAgYWRkQ2xhc3MoJ2ltZy5sZWFmbGV0LXRpbGUnLCAnZGlzYWJsZS1ldmVudHMnKTtcclxuICAgICAgaWYgKGlzQXV0bykge1xyXG4gICAgICAgIHRoaXMuaXNBdXRvID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0TW92ZU1vZGUoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5pc0FjdGl2YXRlZCkge1xyXG4gICAgICB0aGlzLnJlc2V0RHJhd01vZGVzKCk7XHJcbiAgICAgIHRoaXMuaXNNb3ZlTW9kZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmb3JjZUNhblVzZUZyZWVEcmF3KCk6IHZvaWQge1xyXG4gICAgdGhpcy5jYW5Vc2VQb2x5RHJhdyA9IHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElMYXRMbmcge1xyXG4gIGxhdDogbnVtYmVyO1xyXG4gIGxuZzogbnVtYmVyO1xyXG59XHJcbiJdfQ==