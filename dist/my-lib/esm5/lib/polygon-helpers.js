import { PolygonUtil } from './polygon.util';
var PolygonInfo = /** @class */ (function () {
    function PolygonInfo(polygon) {
        var _this = this;
        this.polygon = [];
        this.trashcanPoint = [];
        this.sqmArea = [];
        this.perimeter = [];
        console.log('PolygonInfo: ', polygon);
        polygon.forEach(function (polygons, i) {
            _this.trashcanPoint[i] = _this.getTrashcanPoint(polygons[0]);
            _this.sqmArea[i] = _this.calculatePolygonArea(polygons[0]);
            _this.perimeter[i] = _this.calculatePolygonPerimeter(polygons[0]);
            console.log(polygons[0]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vcG9seWRyYXcvIiwic291cmNlcyI6WyJsaWIvcG9seWdvbi1oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3QztJQUtFLHFCQUFZLE9BQU87UUFBbkIsaUJBU0M7UUFiRCxZQUFPLEdBQWtCLEVBQUUsQ0FBQztRQUM1QixrQkFBYSxHQUFjLEVBQUUsQ0FBQztRQUM5QixZQUFPLEdBQWEsRUFBRSxDQUFDO1FBQ3ZCLGNBQVMsR0FBYSxFQUFFLENBQUM7UUFFdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLEtBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNELEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pELEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsZ0NBQVUsR0FBVixVQUFXLElBQVk7UUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENB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QyxVQUFVLEdBQUcsSUFBSSxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQztJQUVELCtDQUFtQixHQUFuQjtRQUNFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQzdCLENBQUM7SUFDSCx3QkFBQztBQUFELENBQUMsQUExREQsSUEwREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQb2x5Z29uVXRpbCB9IGZyb20gJy4vcG9seWdvbi51dGlsJztcclxuXHJcbmV4cG9ydCBjbGFzcyBQb2x5Z29uSW5mbyB7XHJcbiAgcG9seWdvbjogSUxhdExuZ1tdW11bXSA9IFtdO1xyXG4gIHRyYXNoY2FuUG9pbnQ6IElMYXRMbmdbXSA9IFtdO1xyXG4gIHNxbUFyZWE6IG51bWJlcltdID0gW107XHJcbiAgcGVyaW1ldGVyOiBudW1iZXJbXSA9IFtdO1xyXG4gIGNvbnN0cnVjdG9yKHBvbHlnb24pIHtcclxuICAgIGNvbnNvbGUubG9nKCdQb2x5Z29uSW5mbzogJywgcG9seWdvbik7XHJcbiAgICBwb2x5Z29uLmZvckVhY2goKHBvbHlnb25zLCBpKSA9PiB7XHJcbiAgICAgIHRoaXMudHJhc2hjYW5Qb2ludFtpXSA9IHRoaXMuZ2V0VHJhc2hjYW5Qb2ludChwb2x5Z29uc1swXSk7XHJcbiAgICAgIHRoaXMuc3FtQXJlYVtpXSA9IHRoaXMuY2FsY3VsYXRlUG9seWdvbkFyZWEocG9seWdvbnNbMF0pO1xyXG4gICAgICB0aGlzLnBlcmltZXRlcltpXSA9IHRoaXMuY2FsY3VsYXRlUG9seWdvblBlcmltZXRlcihwb2x5Z29uc1swXSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKHBvbHlnb25zWzBdKTtcclxuICAgICAgdGhpcy5wb2x5Z29uW2ldID0gcG9seWdvbnM7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgc2V0U3FtQXJlYShhcmVhOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRoaXMuc3FtQXJlYVswXSA9IGFyZWE7XHJcbiAgfVxyXG4gIHByaXZhdGUgZ2V0VHJhc2hjYW5Qb2ludChwb2x5Z29uOiBJTGF0TG5nW10pOiBJTGF0TG5nIHtcclxuICAgIGNvbnN0IHJlcyA9IE1hdGgubWF4LmFwcGx5KFxyXG4gICAgICBNYXRoLFxyXG4gICAgICBwb2x5Z29uLm1hcChvID0+IG8ubGF0KVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGlkeCA9IHBvbHlnb24uZmluZEluZGV4KG8gPT4gby5sYXQgPT09IHJlcyk7XHJcblxyXG4gICAgbGV0IHByZXZpb3VzUG9pbnQ6IElMYXRMbmc7XHJcbiAgICBsZXQgbmV4dFBvaW50OiBJTGF0TG5nO1xyXG5cclxuICAgIGlmIChpZHggPiAwKSB7XHJcbiAgICAgIHByZXZpb3VzUG9pbnQgPSBwb2x5Z29uW2lkeCAtIDFdO1xyXG4gICAgICBpZiAoaWR4IDwgcG9seWdvbi5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgbmV4dFBvaW50ID0gcG9seWdvbltpZHggKyAxXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuZXh0UG9pbnQgPSBwb2x5Z29uWzBdO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwcmV2aW91c1BvaW50ID0gcG9seWdvbltwb2x5Z29uLmxlbmd0aCAtIDFdO1xyXG4gICAgICBuZXh0UG9pbnQgPSBwb2x5Z29uW2lkeCArIDFdO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNlY29uZFBvaW50ID1cclxuICAgICAgcHJldmlvdXNQb2ludC5sbmcgPCBuZXh0UG9pbnQubG5nID8gcHJldmlvdXNQb2ludCA6IG5leHRQb2ludDtcclxuXHJcbiAgICBjb25zdCBtaWRwb2ludCA9IFBvbHlnb25VdGlsLmdldE1pZFBvaW50KHBvbHlnb25baWR4XSwgc2Vjb25kUG9pbnQpO1xyXG5cclxuICAgIHJldHVybiBtaWRwb2ludDtcclxuICB9XHJcbiAgcHJpdmF0ZSBjYWxjdWxhdGVQb2x5Z29uQXJlYShwb2x5Z29uOiBJTGF0TG5nW10pOiBudW1iZXIge1xyXG4gICAgY29uc3QgYXJlYSA9IFBvbHlnb25VdGlsLmdldFNxbUFyZWEocG9seWdvbiBhcyBhbnkpO1xyXG4gICAgcmV0dXJuIGFyZWE7XHJcbiAgfVxyXG4gIHByaXZhdGUgY2FsY3VsYXRlUG9seWdvblBlcmltZXRlcihwb2x5Z29uOiBJTGF0TG5nW10pOiBudW1iZXIge1xyXG4gICAgY29uc3QgcGVyaW1ldGVyID0gUG9seWdvblV0aWwuZ2V0UGVyaW1ldGVyKHBvbHlnb24gYXMgYW55KTtcclxuICAgIHJldHVybiBwZXJpbWV0ZXI7XHJcbiAgfVxyXG59XHJcbmNvbnN0IGFkZENsYXNzOiAoc2VsZWN0b3I6IHN0cmluZywgY2xhc3NOYW1lOiBzdHJpbmcpID0+IHZvaWQgPSAoXHJcbiAgc2VsZWN0b3I6IHN0cmluZyxcclxuICBjbGFzc05hbWU6IHN0cmluZ1xyXG4pOiB2b2lkID0+IHtcclxuICBjb25zdCBlbGVtZW50czogTm9kZUxpc3RPZjxIVE1MRWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBlbGVtZW50cy5pdGVtKGkpLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCByZW1vdmVDbGFzczogKHNlbGVjdG9yOiBzdHJpbmcsIGNsYXNzTmFtZTogc3RyaW5nKSA9PiB2b2lkID0gKFxyXG4gIHNlbGVjdG9yOiBzdHJpbmcsXHJcbiAgY2xhc3NOYW1lOiBzdHJpbmdcclxuKTogdm9pZCA9PiB7XHJcbiAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgZWxlbWVudHMuaXRlbShpKS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIFBvbHlnb25EcmF3U3RhdGVzIHtcclxuICBpc0FjdGl2YXRlZDogYm9vbGVhbjtcclxuICBpc0ZyZWVEcmF3TW9kZTogYm9vbGVhbjtcclxuICBpc01vdmVNb2RlOiBib29sZWFuO1xyXG4gIGNhblJldmVydDogYm9vbGVhbjtcclxuICBpc0F1dG86IGJvb2xlYW47XHJcbiAgaGFzUG9seWdvbnM6IGJvb2xlYW47XHJcbiAgY2FuVXNlUG9seURyYXc6IGJvb2xlYW47XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5jYW5Vc2VQb2x5RHJhdyA9IGZhbHNlO1xyXG4gICAgdGhpcy5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgYWN0aXZhdGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzQWN0aXZhdGVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc0FjdGl2YXRlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5oYXNQb2x5Z29ucyA9IGZhbHNlO1xyXG4gICAgdGhpcy5jYW5SZXZlcnQgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNBdXRvID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5yZXNldERyYXdNb2RlcygpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXREcmF3TW9kZXMoKTogdm9pZCB7XHJcbiAgICB0aGlzLmlzRnJlZURyYXdNb2RlID0gZmFsc2U7XHJcbiAgICByZW1vdmVDbGFzcygnaW1nLmxlYWZsZXQtdGlsZScsICdkaXNhYmxlLWV2ZW50cycpO1xyXG4gICAgdGhpcy5pc01vdmVNb2RlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBzZXRGcmVlRHJhd01vZGUoaXNBdXRvOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcclxuICAgIGlmIChpc0F1dG8pIHtcclxuICAgICAgdGhpcy5pc0FjdGl2YXRlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5pc0FjdGl2YXRlZCkge1xyXG4gICAgICB0aGlzLnJlc2V0RHJhd01vZGVzKCk7XHJcbiAgICAgIHRoaXMuaXNGcmVlRHJhd01vZGUgPSB0cnVlO1xyXG4gICAgICBhZGRDbGFzcygnaW1nLmxlYWZsZXQtdGlsZScsICdkaXNhYmxlLWV2ZW50cycpO1xyXG4gICAgICBpZiAoaXNBdXRvKSB7XHJcbiAgICAgICAgdGhpcy5pc0F1dG8gPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZXRNb3ZlTW9kZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmlzQWN0aXZhdGVkKSB7XHJcbiAgICAgIHRoaXMucmVzZXREcmF3TW9kZXMoKTtcclxuICAgICAgdGhpcy5pc01vdmVNb2RlID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZvcmNlQ2FuVXNlRnJlZURyYXcoKTogdm9pZCB7XHJcbiAgICB0aGlzLmNhblVzZVBvbHlEcmF3ID0gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUxhdExuZyB7XHJcbiAgbGF0OiBudW1iZXI7XHJcbiAgbG5nOiBudW1iZXI7XHJcbn1cclxuIl19