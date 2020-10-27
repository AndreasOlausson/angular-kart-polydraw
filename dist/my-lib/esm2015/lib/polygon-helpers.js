import { PolygonUtil } from './polygon.util';
export class PolygonInfo {
    constructor(polygon) {
        this.polygon = [];
        this.trashcanPoint = [];
        this.sqmArea = [];
        this.perimeter = [];
        polygon.forEach((polygons, i) => {
            this.trashcanPoint[i] = this.getTrashcanPoint(polygons[0]);
            this.sqmArea[i] = this.calculatePolygonArea(polygons[0]);
            this.perimeter[i] = this.calculatePolygonPerimeter(polygons[0]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0MsTUFBTSxPQUFPLFdBQVc7SUFLdEIsWUFBWSxPQUFPO1FBSm5CLFlBQU8sR0FBa0IsRUFBRSxDQUFDO1FBQzVCLGtCQUFhLEdBQWMsRUFBRSxDQUFDO1FBQzlCLFlBQU8sR0FBYSxFQUFFLENBQUM7UUFDdkIsY0FBUyxHQUFhLEVBQUUsQ0FBQztRQUd2QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzlCLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWhFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNELFVBQVUsQ0FBQyxJQUFZO1FBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFDTyxnQkFBZ0IsQ0FBQyxPQUFrQjtRQUN6QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FDeEIsSUFBSSxFQUNKLE9B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O1FBQ0gsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFcEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxjQUFjO1FBQ1osSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFDNUIsV0FBVyxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVELGVBQWUsQ0FBQyxTQUFrQixLQUFLO1FBQ3JDLElBQUksTUFBTSxFQUFFO1lBQ1YsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDcEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzNCLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQy9DLElBQUksTUFBTSxFQUFFO2dCQUNWLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2FBQ3BCO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNwQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7U0FDeEI7SUFDSCxDQUFDO0lBRUQsbUJBQW1CO1FBQ2pCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQzdCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBvbHlnb25VdGlsIH0gZnJvbSAnLi9wb2x5Z29uLnV0aWwnO1xuXG5leHBvcnQgY2xhc3MgUG9seWdvbkluZm8ge1xuICBwb2x5Z29uOiBJTGF0TG5nW11bXVtdID0gW107XG4gIHRyYXNoY2FuUG9pbnQ6IElMYXRMbmdbXSA9IFtdO1xuICBzcW1BcmVhOiBudW1iZXJbXSA9IFtdO1xuICBwZXJpbWV0ZXI6IG51bWJlcltdID0gW107XG4gIGNvbnN0cnVjdG9yKHBvbHlnb24pIHtcbiAgICBcbiAgICBwb2x5Z29uLmZvckVhY2goKHBvbHlnb25zLCBpKSA9PiB7XG4gICAgICB0aGlzLnRyYXNoY2FuUG9pbnRbaV0gPSB0aGlzLmdldFRyYXNoY2FuUG9pbnQocG9seWdvbnNbMF0pO1xuICAgICAgdGhpcy5zcW1BcmVhW2ldID0gdGhpcy5jYWxjdWxhdGVQb2x5Z29uQXJlYShwb2x5Z29uc1swXSk7XG4gICAgICB0aGlzLnBlcmltZXRlcltpXSA9IHRoaXMuY2FsY3VsYXRlUG9seWdvblBlcmltZXRlcihwb2x5Z29uc1swXSk7XG4gICAgXG4gICAgICB0aGlzLnBvbHlnb25baV0gPSBwb2x5Z29ucztcbiAgICB9KTtcbiAgfVxuICBzZXRTcW1BcmVhKGFyZWE6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc3FtQXJlYVswXSA9IGFyZWE7XG4gIH1cbiAgcHJpdmF0ZSBnZXRUcmFzaGNhblBvaW50KHBvbHlnb246IElMYXRMbmdbXSk6IElMYXRMbmcge1xuICAgIGNvbnN0IHJlcyA9IE1hdGgubWF4LmFwcGx5KFxuICAgICAgTWF0aCxcbiAgICAgIHBvbHlnb24ubWFwKG8gPT4gby5sYXQpXG4gICAgKTtcbiAgICBjb25zdCBpZHggPSBwb2x5Z29uLmZpbmRJbmRleChvID0+IG8ubGF0ID09PSByZXMpO1xuXG4gICAgbGV0IHByZXZpb3VzUG9pbnQ6IElMYXRMbmc7XG4gICAgbGV0IG5leHRQb2ludDogSUxhdExuZztcblxuICAgIGlmIChpZHggPiAwKSB7XG4gICAgICBwcmV2aW91c1BvaW50ID0gcG9seWdvbltpZHggLSAxXTtcbiAgICAgIGlmIChpZHggPCBwb2x5Z29uLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgbmV4dFBvaW50ID0gcG9seWdvbltpZHggKyAxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRQb2ludCA9IHBvbHlnb25bMF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZpb3VzUG9pbnQgPSBwb2x5Z29uW3BvbHlnb24ubGVuZ3RoIC0gMV07XG4gICAgICBuZXh0UG9pbnQgPSBwb2x5Z29uW2lkeCArIDFdO1xuICAgIH1cblxuICAgIGNvbnN0IHNlY29uZFBvaW50ID1cbiAgICAgIHByZXZpb3VzUG9pbnQubG5nIDwgbmV4dFBvaW50LmxuZyA/IHByZXZpb3VzUG9pbnQgOiBuZXh0UG9pbnQ7XG5cbiAgICBjb25zdCBtaWRwb2ludCA9IFBvbHlnb25VdGlsLmdldE1pZFBvaW50KHBvbHlnb25baWR4XSwgc2Vjb25kUG9pbnQpO1xuXG4gICAgcmV0dXJuIG1pZHBvaW50O1xuICB9XG4gIHByaXZhdGUgY2FsY3VsYXRlUG9seWdvbkFyZWEocG9seWdvbjogSUxhdExuZ1tdKTogbnVtYmVyIHtcbiAgICBjb25zdCBhcmVhID0gUG9seWdvblV0aWwuZ2V0U3FtQXJlYShwb2x5Z29uIGFzIGFueSk7XG4gICAgcmV0dXJuIGFyZWE7XG4gIH1cbiAgcHJpdmF0ZSBjYWxjdWxhdGVQb2x5Z29uUGVyaW1ldGVyKHBvbHlnb246IElMYXRMbmdbXSk6IG51bWJlciB7XG4gICAgY29uc3QgcGVyaW1ldGVyID0gUG9seWdvblV0aWwuZ2V0UGVyaW1ldGVyKHBvbHlnb24gYXMgYW55KTtcbiAgICByZXR1cm4gcGVyaW1ldGVyO1xuICB9XG59XG5jb25zdCBhZGRDbGFzczogKHNlbGVjdG9yOiBzdHJpbmcsIGNsYXNzTmFtZTogc3RyaW5nKSA9PiB2b2lkID0gKFxuICBzZWxlY3Rvcjogc3RyaW5nLFxuICBjbGFzc05hbWU6IHN0cmluZ1xuKTogdm9pZCA9PiB7XG4gIGNvbnN0IGVsZW1lbnRzOiBOb2RlTGlzdE9mPEhUTUxFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZWxlbWVudHMuaXRlbShpKS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gIH1cbn07XG5cbmNvbnN0IHJlbW92ZUNsYXNzOiAoc2VsZWN0b3I6IHN0cmluZywgY2xhc3NOYW1lOiBzdHJpbmcpID0+IHZvaWQgPSAoXG4gIHNlbGVjdG9yOiBzdHJpbmcsXG4gIGNsYXNzTmFtZTogc3RyaW5nXG4pOiB2b2lkID0+IHtcbiAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBlbGVtZW50cy5pdGVtKGkpLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgfVxufTtcblxuZXhwb3J0IGNsYXNzIFBvbHlnb25EcmF3U3RhdGVzIHtcbiAgaXNBY3RpdmF0ZWQ6IGJvb2xlYW47XG4gIGlzRnJlZURyYXdNb2RlOiBib29sZWFuO1xuICBpc01vdmVNb2RlOiBib29sZWFuO1xuICBjYW5SZXZlcnQ6IGJvb2xlYW47XG4gIGlzQXV0bzogYm9vbGVhbjtcbiAgaGFzUG9seWdvbnM6IGJvb2xlYW47XG4gIGNhblVzZVBvbHlEcmF3OiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2FuVXNlUG9seURyYXcgPSBmYWxzZTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5pc0FjdGl2YXRlZCA9IHRydWU7XG4gIH1cblxuICByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLmlzQWN0aXZhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5oYXNQb2x5Z29ucyA9IGZhbHNlO1xuICAgIHRoaXMuY2FuUmV2ZXJ0ID0gZmFsc2U7XG4gICAgdGhpcy5pc0F1dG8gPSBmYWxzZTtcblxuICAgIHRoaXMucmVzZXREcmF3TW9kZXMoKTtcbiAgfVxuXG4gIHJlc2V0RHJhd01vZGVzKCk6IHZvaWQge1xuICAgIHRoaXMuaXNGcmVlRHJhd01vZGUgPSBmYWxzZTtcbiAgICByZW1vdmVDbGFzcygnaW1nLmxlYWZsZXQtdGlsZScsICdkaXNhYmxlLWV2ZW50cycpO1xuICAgIHRoaXMuaXNNb3ZlTW9kZSA9IGZhbHNlO1xuICB9XG5cbiAgc2V0RnJlZURyYXdNb2RlKGlzQXV0bzogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgaWYgKGlzQXV0bykge1xuICAgICAgdGhpcy5pc0FjdGl2YXRlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzQWN0aXZhdGVkKSB7XG4gICAgICB0aGlzLnJlc2V0RHJhd01vZGVzKCk7XG4gICAgICB0aGlzLmlzRnJlZURyYXdNb2RlID0gdHJ1ZTtcbiAgICAgIGFkZENsYXNzKCdpbWcubGVhZmxldC10aWxlJywgJ2Rpc2FibGUtZXZlbnRzJyk7XG4gICAgICBpZiAoaXNBdXRvKSB7XG4gICAgICAgIHRoaXMuaXNBdXRvID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRNb3ZlTW9kZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc0FjdGl2YXRlZCkge1xuICAgICAgdGhpcy5yZXNldERyYXdNb2RlcygpO1xuICAgICAgdGhpcy5pc01vdmVNb2RlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmb3JjZUNhblVzZUZyZWVEcmF3KCk6IHZvaWQge1xuICAgIHRoaXMuY2FuVXNlUG9seURyYXcgPSB0cnVlO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUxhdExuZyB7XG4gIGxhdDogbnVtYmVyO1xuICBsbmc6IG51bWJlcjtcbn1cbiJdfQ==