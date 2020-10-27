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
var ɵ0 = addClass;
var removeClass = function (selector, className) {
    var elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        elements.item(i).classList.remove(className);
    }
};
var ɵ1 = removeClass;
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
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbXktbGliLyIsInNvdXJjZXMiOlsibGliL3BvbHlnb24taGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0M7SUFLRSxxQkFBWSxPQUFPO1FBQW5CLGlCQVNDO1FBYkQsWUFBTyxHQUFrQixFQUFFLENBQUM7UUFDNUIsa0JBQWEsR0FBYyxFQUFFLENBQUM7UUFDOUIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixjQUFTLEdBQWEsRUFBRSxDQUFDO1FBR3ZCLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQixLQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRCxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVoRSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxnQ0FBVSxHQUFWLFVBQVcsSUFBWTtRQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDO0lBQ08sc0NBQWdCLEdBQXhCLFVBQXlCLE9BQWtCO1FBQ3pDLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUN4QixJQUFJLEVBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxHQUFHLEVBQUwsQ0FBSyxDQUFDLENBQ3hCLENBQUM7UUFDRixJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEVBQWIsQ0FBYSxDQUFDLENBQUM7UUFFbEQsSUFBSSxhQUFzQixDQUFDO1FBQzNCLElBQUksU0FBa0IsQ0FBQztRQUV2QixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDWCxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqQyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDNUIsU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDOUI7aUJBQU07Z0JBQ0wsU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN4QjtTQUNGO2FBQU07WUFDTCxhQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDOUI7UUFFRCxJQUFNLFdBQVcsR0FDZixhQUFhLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRWhFLElBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRXBFLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFDTywwQ0FBb0IsR0FBNUIsVUFBNkIsT0FBa0I7UUFDN0MsSUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFjLENBQUMsQ0FBQztRQUNwRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDTywrQ0FBeUIsR0FBakMsVUFBa0MsT0FBa0I7UUFDbEQsSUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxPQUFjLENBQUMsQ0FBQztRQUMzRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBQ0gsa0JBQUM7QUFBRCxDQUFDLEFBdkRELElBdURDOztBQUNELElBQU0sUUFBUSxHQUFrRCxVQUM5RCxRQUFnQixFQUNoQixTQUFpQjtJQUVqQixJQUFNLFFBQVEsR0FBNEIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUMzQztBQUNILENBQUMsQ0FBQzs7QUFFRixJQUFNLFdBQVcsR0FBa0QsVUFDakUsUUFBZ0IsRUFDaEIsU0FBaUI7SUFFakIsSUFBTSxRQUFRLEdBQTRCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5RSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDOUM7QUFDSCxDQUFDLENBQUM7O0FBRUY7SUFTRTtRQUNFLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQzVCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRCxvQ0FBUSxHQUFSO1FBQ0UsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVELGlDQUFLLEdBQUw7UUFDRSxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUVwQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELDBDQUFjLEdBQWQ7UUFDRSxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztRQUM1QixXQUFXLENBQUMsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUMxQixDQUFDO0lBRUQsMkNBQWUsR0FBZixVQUFnQixNQUF1QjtRQUF2Qix1QkFBQSxFQUFBLGNBQXVCO1FBQ3JDLElBQUksTUFBTSxFQUFFO1lBQ1YsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDekI7UUFDRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDcEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzNCLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQy9DLElBQUksTUFBTSxFQUFFO2dCQUNWLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2FBQ3BCO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsdUNBQVcsR0FBWDtRQUNFLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNwQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7U0FDeEI7SUFDSCxDQUFDO0lBRUQsK0NBQW1CLEdBQW5CO1FBQ0UsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUNILHdCQUFDO0FBQUQsQ0FBQyxBQTFERCxJQTBEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBvbHlnb25VdGlsIH0gZnJvbSAnLi9wb2x5Z29uLnV0aWwnO1xuXG5leHBvcnQgY2xhc3MgUG9seWdvbkluZm8ge1xuICBwb2x5Z29uOiBJTGF0TG5nW11bXVtdID0gW107XG4gIHRyYXNoY2FuUG9pbnQ6IElMYXRMbmdbXSA9IFtdO1xuICBzcW1BcmVhOiBudW1iZXJbXSA9IFtdO1xuICBwZXJpbWV0ZXI6IG51bWJlcltdID0gW107XG4gIGNvbnN0cnVjdG9yKHBvbHlnb24pIHtcbiAgICBcbiAgICBwb2x5Z29uLmZvckVhY2goKHBvbHlnb25zLCBpKSA9PiB7XG4gICAgICB0aGlzLnRyYXNoY2FuUG9pbnRbaV0gPSB0aGlzLmdldFRyYXNoY2FuUG9pbnQocG9seWdvbnNbMF0pO1xuICAgICAgdGhpcy5zcW1BcmVhW2ldID0gdGhpcy5jYWxjdWxhdGVQb2x5Z29uQXJlYShwb2x5Z29uc1swXSk7XG4gICAgICB0aGlzLnBlcmltZXRlcltpXSA9IHRoaXMuY2FsY3VsYXRlUG9seWdvblBlcmltZXRlcihwb2x5Z29uc1swXSk7XG4gICAgXG4gICAgICB0aGlzLnBvbHlnb25baV0gPSBwb2x5Z29ucztcbiAgICB9KTtcbiAgfVxuICBzZXRTcW1BcmVhKGFyZWE6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc3FtQXJlYVswXSA9IGFyZWE7XG4gIH1cbiAgcHJpdmF0ZSBnZXRUcmFzaGNhblBvaW50KHBvbHlnb246IElMYXRMbmdbXSk6IElMYXRMbmcge1xuICAgIGNvbnN0IHJlcyA9IE1hdGgubWF4LmFwcGx5KFxuICAgICAgTWF0aCxcbiAgICAgIHBvbHlnb24ubWFwKG8gPT4gby5sYXQpXG4gICAgKTtcbiAgICBjb25zdCBpZHggPSBwb2x5Z29uLmZpbmRJbmRleChvID0+IG8ubGF0ID09PSByZXMpO1xuXG4gICAgbGV0IHByZXZpb3VzUG9pbnQ6IElMYXRMbmc7XG4gICAgbGV0IG5leHRQb2ludDogSUxhdExuZztcblxuICAgIGlmIChpZHggPiAwKSB7XG4gICAgICBwcmV2aW91c1BvaW50ID0gcG9seWdvbltpZHggLSAxXTtcbiAgICAgIGlmIChpZHggPCBwb2x5Z29uLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgbmV4dFBvaW50ID0gcG9seWdvbltpZHggKyAxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRQb2ludCA9IHBvbHlnb25bMF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZpb3VzUG9pbnQgPSBwb2x5Z29uW3BvbHlnb24ubGVuZ3RoIC0gMV07XG4gICAgICBuZXh0UG9pbnQgPSBwb2x5Z29uW2lkeCArIDFdO1xuICAgIH1cblxuICAgIGNvbnN0IHNlY29uZFBvaW50ID1cbiAgICAgIHByZXZpb3VzUG9pbnQubG5nIDwgbmV4dFBvaW50LmxuZyA/IHByZXZpb3VzUG9pbnQgOiBuZXh0UG9pbnQ7XG5cbiAgICBjb25zdCBtaWRwb2ludCA9IFBvbHlnb25VdGlsLmdldE1pZFBvaW50KHBvbHlnb25baWR4XSwgc2Vjb25kUG9pbnQpO1xuXG4gICAgcmV0dXJuIG1pZHBvaW50O1xuICB9XG4gIHByaXZhdGUgY2FsY3VsYXRlUG9seWdvbkFyZWEocG9seWdvbjogSUxhdExuZ1tdKTogbnVtYmVyIHtcbiAgICBjb25zdCBhcmVhID0gUG9seWdvblV0aWwuZ2V0U3FtQXJlYShwb2x5Z29uIGFzIGFueSk7XG4gICAgcmV0dXJuIGFyZWE7XG4gIH1cbiAgcHJpdmF0ZSBjYWxjdWxhdGVQb2x5Z29uUGVyaW1ldGVyKHBvbHlnb246IElMYXRMbmdbXSk6IG51bWJlciB7XG4gICAgY29uc3QgcGVyaW1ldGVyID0gUG9seWdvblV0aWwuZ2V0UGVyaW1ldGVyKHBvbHlnb24gYXMgYW55KTtcbiAgICByZXR1cm4gcGVyaW1ldGVyO1xuICB9XG59XG5jb25zdCBhZGRDbGFzczogKHNlbGVjdG9yOiBzdHJpbmcsIGNsYXNzTmFtZTogc3RyaW5nKSA9PiB2b2lkID0gKFxuICBzZWxlY3Rvcjogc3RyaW5nLFxuICBjbGFzc05hbWU6IHN0cmluZ1xuKTogdm9pZCA9PiB7XG4gIGNvbnN0IGVsZW1lbnRzOiBOb2RlTGlzdE9mPEhUTUxFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZWxlbWVudHMuaXRlbShpKS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gIH1cbn07XG5cbmNvbnN0IHJlbW92ZUNsYXNzOiAoc2VsZWN0b3I6IHN0cmluZywgY2xhc3NOYW1lOiBzdHJpbmcpID0+IHZvaWQgPSAoXG4gIHNlbGVjdG9yOiBzdHJpbmcsXG4gIGNsYXNzTmFtZTogc3RyaW5nXG4pOiB2b2lkID0+IHtcbiAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBlbGVtZW50cy5pdGVtKGkpLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgfVxufTtcblxuZXhwb3J0IGNsYXNzIFBvbHlnb25EcmF3U3RhdGVzIHtcbiAgaXNBY3RpdmF0ZWQ6IGJvb2xlYW47XG4gIGlzRnJlZURyYXdNb2RlOiBib29sZWFuO1xuICBpc01vdmVNb2RlOiBib29sZWFuO1xuICBjYW5SZXZlcnQ6IGJvb2xlYW47XG4gIGlzQXV0bzogYm9vbGVhbjtcbiAgaGFzUG9seWdvbnM6IGJvb2xlYW47XG4gIGNhblVzZVBvbHlEcmF3OiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2FuVXNlUG9seURyYXcgPSBmYWxzZTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5pc0FjdGl2YXRlZCA9IHRydWU7XG4gIH1cblxuICByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLmlzQWN0aXZhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5oYXNQb2x5Z29ucyA9IGZhbHNlO1xuICAgIHRoaXMuY2FuUmV2ZXJ0ID0gZmFsc2U7XG4gICAgdGhpcy5pc0F1dG8gPSBmYWxzZTtcblxuICAgIHRoaXMucmVzZXREcmF3TW9kZXMoKTtcbiAgfVxuXG4gIHJlc2V0RHJhd01vZGVzKCk6IHZvaWQge1xuICAgIHRoaXMuaXNGcmVlRHJhd01vZGUgPSBmYWxzZTtcbiAgICByZW1vdmVDbGFzcygnaW1nLmxlYWZsZXQtdGlsZScsICdkaXNhYmxlLWV2ZW50cycpO1xuICAgIHRoaXMuaXNNb3ZlTW9kZSA9IGZhbHNlO1xuICB9XG5cbiAgc2V0RnJlZURyYXdNb2RlKGlzQXV0bzogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgaWYgKGlzQXV0bykge1xuICAgICAgdGhpcy5pc0FjdGl2YXRlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzQWN0aXZhdGVkKSB7XG4gICAgICB0aGlzLnJlc2V0RHJhd01vZGVzKCk7XG4gICAgICB0aGlzLmlzRnJlZURyYXdNb2RlID0gdHJ1ZTtcbiAgICAgIGFkZENsYXNzKCdpbWcubGVhZmxldC10aWxlJywgJ2Rpc2FibGUtZXZlbnRzJyk7XG4gICAgICBpZiAoaXNBdXRvKSB7XG4gICAgICAgIHRoaXMuaXNBdXRvID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRNb3ZlTW9kZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc0FjdGl2YXRlZCkge1xuICAgICAgdGhpcy5yZXNldERyYXdNb2RlcygpO1xuICAgICAgdGhpcy5pc01vdmVNb2RlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmb3JjZUNhblVzZUZyZWVEcmF3KCk6IHZvaWQge1xuICAgIHRoaXMuY2FuVXNlUG9seURyYXcgPSB0cnVlO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUxhdExuZyB7XG4gIGxhdDogbnVtYmVyO1xuICBsbmc6IG51bWJlcjtcbn1cbiJdfQ==