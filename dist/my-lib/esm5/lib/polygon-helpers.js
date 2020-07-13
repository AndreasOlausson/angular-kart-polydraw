import { PolygonUtil } from './polygon.util';
var PolygonInfo = /** @class */ (function () {
    function PolygonInfo(polygon) {
        var _this = this;
        this.polygon = [];
        this.trashcanPoint = [];
        this.sqmArea = [];
        this.perimeter = [];
        polygon.forEach(function (polygons, i) {
            _this.trashcanPoint[i] = _this.getTrashcanPoint(polygons[0]);
            _this.sqmArea[i] = _this.calculatePolygonArea(polygons[0]);
            _this.perimeter[i] = _this.calculatePolygonPerimeter(polygons[0]);
            _this.polygon[i] = polygons;
        });
    }
    PolygonInfo.prototype.setSqmArea = function (area) {
        this.sqmArea[0] = area;
    };
    PolygonInfo.prototype.getTrashcanPoint = function (polygon) {
        var res = Math.max.apply(Math, polygon.map(function (o) { return o.lat; }));
        var idx = polygon.findIndex(function (o) { return o.lat === res; });
        var previousPoint;
        var nextPoint;
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
        var secondPoint = previousPoint.lng < nextPoint.lng ? previousPoint : nextPoint;
        var midpoint = PolygonUtil.getMidPoint(polygon[idx], secondPoint);
        return midpoint;
    };
    PolygonInfo.prototype.calculatePolygonArea = function (polygon) {
        var area = PolygonUtil.getSqmArea(polygon);
        return area;
    };
    PolygonInfo.prototype.calculatePolygonPerimeter = function (polygon) {
        var perimeter = PolygonUtil.getPerimeter(polygon);
        return perimeter;
    };
    return PolygonInfo;
}());
export { PolygonInfo };
var addClass = function (selector, className) {
    var elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        elements.item(i).classList.add(className);
    }
};
var removeClass = function (selector, className) {
    var elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        elements.item(i).classList.remove(className);
    }
};
var PolygonDrawStates = /** @class */ (function () {
    function PolygonDrawStates() {
        this.canUsePolyDraw = false;
        this.reset();
    }
    PolygonDrawStates.prototype.activate = function () {
        this.reset();
        this.isActivated = true;
    };
    PolygonDrawStates.prototype.reset = function () {
        this.isActivated = false;
        this.hasPolygons = false;
        this.canRevert = false;
        this.isAuto = false;
        this.resetDrawModes();
    };
    PolygonDrawStates.prototype.resetDrawModes = function () {
        this.isFreeDrawMode = false;
        removeClass('img.leaflet-tile', 'disable-events');
        this.isMoveMode = false;
    };
    PolygonDrawStates.prototype.setFreeDrawMode = function (isAuto) {
        if (isAuto === void 0) { isAuto = false; }
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
    };
    PolygonDrawStates.prototype.setMoveMode = function () {
        if (this.isActivated) {
            this.resetDrawModes();
            this.isMoveMode = true;
        }
    };
    PolygonDrawStates.prototype.forceCanUseFreeDraw = function () {
        this.canUsePolyDraw = true;
    };
    return PolygonDrawStates;
}());
export { PolygonDrawStates };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0M7SUFLRSxxQkFBWSxPQUFPO1FBQW5CLGlCQVNDO1FBYkQsWUFBTyxHQUFrQixFQUFFLENBQUM7UUFDNUIsa0JBQWEsR0FBYyxFQUFFLENBQUM7UUFDOUIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixjQUFTLEdBQWEsRUFBRSxDQUFDO1FBR3ZCLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQixLQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRCxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVoRSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxnQ0FBVSxHQUFWLFVBQVcsSUFBWTtRQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDO0lBQ08sc0NBQWdCLEdBQXhCLFVBQXlCLE9BQWtCO1FBQ3pDLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUN4QixJQUFJLEVBQ0osT0FB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QztBQUFELENBQUMsQUExREQsSUEwREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQb2x5Z29uVXRpbCB9IGZyb20gJy4vcG9seWdvbi51dGlsJztcclxuXHJcbmV4cG9ydCBjbGFzcyBQb2x5Z29uSW5mbyB7XHJcbiAgcG9seWdvbjogSUxhdExuZ1tdW11bXSA9IFtdO1xyXG4gIHRyYXNoY2FuUG9pbnQ6IElMYXRMbmdbXSA9IFtdO1xyXG4gIHNxbUFyZWE6IG51bWJlcltdID0gW107XHJcbiAgcGVyaW1ldGVyOiBudW1iZXJbXSA9IFtdO1xyXG4gIGNvbnN0cnVjdG9yKHBvbHlnb24pIHtcclxuICAgIFxyXG4gICAgcG9seWdvbi5mb3JFYWNoKChwb2x5Z29ucywgaSkgPT4ge1xyXG4gICAgICB0aGlzLnRyYXNoY2FuUG9pbnRbaV0gPSB0aGlzLmdldFRyYXNoY2FuUG9pbnQocG9seWdvbnNbMF0pO1xyXG4gICAgICB0aGlzLnNxbUFyZWFbaV0gPSB0aGlzLmNhbGN1bGF0ZVBvbHlnb25BcmVhKHBvbHlnb25zWzBdKTtcclxuICAgICAgdGhpcy5wZXJpbWV0ZXJbaV0gPSB0aGlzLmNhbGN1bGF0ZVBvbHlnb25QZXJpbWV0ZXIocG9seWdvbnNbMF0pO1xyXG4gICAgXHJcbiAgICAgIHRoaXMucG9seWdvbltpXSA9IHBvbHlnb25zO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHNldFNxbUFyZWEoYXJlYTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLnNxbUFyZWFbMF0gPSBhcmVhO1xyXG4gIH1cclxuICBwcml2YXRlIGdldFRyYXNoY2FuUG9pbnQocG9seWdvbjogSUxhdExuZ1tdKTogSUxhdExuZyB7XHJcbiAgICBjb25zdCByZXMgPSBNYXRoLm1heC5hcHBseShcclxuICAgICAgTWF0aCxcclxuICAgICAgcG9seWdvbi5tYXAobyA9PiBvLmxhdClcclxuICAgICk7XHJcbiAgICBjb25zdCBpZHggPSBwb2x5Z29uLmZpbmRJbmRleChvID0+IG8ubGF0ID09PSByZXMpO1xyXG5cclxuICAgIGxldCBwcmV2aW91c1BvaW50OiBJTGF0TG5nO1xyXG4gICAgbGV0IG5leHRQb2ludDogSUxhdExuZztcclxuXHJcbiAgICBpZiAoaWR4ID4gMCkge1xyXG4gICAgICBwcmV2aW91c1BvaW50ID0gcG9seWdvbltpZHggLSAxXTtcclxuICAgICAgaWYgKGlkeCA8IHBvbHlnb24ubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgIG5leHRQb2ludCA9IHBvbHlnb25baWR4ICsgMV07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV4dFBvaW50ID0gcG9seWdvblswXTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcHJldmlvdXNQb2ludCA9IHBvbHlnb25bcG9seWdvbi5sZW5ndGggLSAxXTtcclxuICAgICAgbmV4dFBvaW50ID0gcG9seWdvbltpZHggKyAxXTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZWNvbmRQb2ludCA9XHJcbiAgICAgIHByZXZpb3VzUG9pbnQubG5nIDwgbmV4dFBvaW50LmxuZyA/IHByZXZpb3VzUG9pbnQgOiBuZXh0UG9pbnQ7XHJcblxyXG4gICAgY29uc3QgbWlkcG9pbnQgPSBQb2x5Z29uVXRpbC5nZXRNaWRQb2ludChwb2x5Z29uW2lkeF0sIHNlY29uZFBvaW50KTtcclxuXHJcbiAgICByZXR1cm4gbWlkcG9pbnQ7XHJcbiAgfVxyXG4gIHByaXZhdGUgY2FsY3VsYXRlUG9seWdvbkFyZWEocG9seWdvbjogSUxhdExuZ1tdKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGFyZWEgPSBQb2x5Z29uVXRpbC5nZXRTcW1BcmVhKHBvbHlnb24gYXMgYW55KTtcclxuICAgIHJldHVybiBhcmVhO1xyXG4gIH1cclxuICBwcml2YXRlIGNhbGN1bGF0ZVBvbHlnb25QZXJpbWV0ZXIocG9seWdvbjogSUxhdExuZ1tdKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHBlcmltZXRlciA9IFBvbHlnb25VdGlsLmdldFBlcmltZXRlcihwb2x5Z29uIGFzIGFueSk7XHJcbiAgICByZXR1cm4gcGVyaW1ldGVyO1xyXG4gIH1cclxufVxyXG5jb25zdCBhZGRDbGFzczogKHNlbGVjdG9yOiBzdHJpbmcsIGNsYXNzTmFtZTogc3RyaW5nKSA9PiB2b2lkID0gKFxyXG4gIHNlbGVjdG9yOiBzdHJpbmcsXHJcbiAgY2xhc3NOYW1lOiBzdHJpbmdcclxuKTogdm9pZCA9PiB7XHJcbiAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgZWxlbWVudHMuaXRlbShpKS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgcmVtb3ZlQ2xhc3M6IChzZWxlY3Rvcjogc3RyaW5nLCBjbGFzc05hbWU6IHN0cmluZykgPT4gdm9pZCA9IChcclxuICBzZWxlY3Rvcjogc3RyaW5nLFxyXG4gIGNsYXNzTmFtZTogc3RyaW5nXHJcbik6IHZvaWQgPT4ge1xyXG4gIGNvbnN0IGVsZW1lbnRzOiBOb2RlTGlzdE9mPEhUTUxFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgIGVsZW1lbnRzLml0ZW0oaSkuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyBQb2x5Z29uRHJhd1N0YXRlcyB7XHJcbiAgaXNBY3RpdmF0ZWQ6IGJvb2xlYW47XHJcbiAgaXNGcmVlRHJhd01vZGU6IGJvb2xlYW47XHJcbiAgaXNNb3ZlTW9kZTogYm9vbGVhbjtcclxuICBjYW5SZXZlcnQ6IGJvb2xlYW47XHJcbiAgaXNBdXRvOiBib29sZWFuO1xyXG4gIGhhc1BvbHlnb25zOiBib29sZWFuO1xyXG4gIGNhblVzZVBvbHlEcmF3OiBib29sZWFuO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuY2FuVXNlUG9seURyYXcgPSBmYWxzZTtcclxuICAgIHRoaXMucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZXNldCgpO1xyXG4gICAgdGhpcy5pc0FjdGl2YXRlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNBY3RpdmF0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuaGFzUG9seWdvbnMgPSBmYWxzZTtcclxuICAgIHRoaXMuY2FuUmV2ZXJ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzQXV0byA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMucmVzZXREcmF3TW9kZXMoKTtcclxuICB9XHJcblxyXG4gIHJlc2V0RHJhd01vZGVzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc0ZyZWVEcmF3TW9kZSA9IGZhbHNlO1xyXG4gICAgcmVtb3ZlQ2xhc3MoJ2ltZy5sZWFmbGV0LXRpbGUnLCAnZGlzYWJsZS1ldmVudHMnKTtcclxuICAgIHRoaXMuaXNNb3ZlTW9kZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgc2V0RnJlZURyYXdNb2RlKGlzQXV0bzogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XHJcbiAgICBpZiAoaXNBdXRvKSB7XHJcbiAgICAgIHRoaXMuaXNBY3RpdmF0ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuaXNBY3RpdmF0ZWQpIHtcclxuICAgICAgdGhpcy5yZXNldERyYXdNb2RlcygpO1xyXG4gICAgICB0aGlzLmlzRnJlZURyYXdNb2RlID0gdHJ1ZTtcclxuICAgICAgYWRkQ2xhc3MoJ2ltZy5sZWFmbGV0LXRpbGUnLCAnZGlzYWJsZS1ldmVudHMnKTtcclxuICAgICAgaWYgKGlzQXV0bykge1xyXG4gICAgICAgIHRoaXMuaXNBdXRvID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0TW92ZU1vZGUoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5pc0FjdGl2YXRlZCkge1xyXG4gICAgICB0aGlzLnJlc2V0RHJhd01vZGVzKCk7XHJcbiAgICAgIHRoaXMuaXNNb3ZlTW9kZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmb3JjZUNhblVzZUZyZWVEcmF3KCk6IHZvaWQge1xyXG4gICAgdGhpcy5jYW5Vc2VQb2x5RHJhdyA9IHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElMYXRMbmcge1xyXG4gIGxhdDogbnVtYmVyO1xyXG4gIGxuZzogbnVtYmVyO1xyXG59XHJcbiJdfQ==