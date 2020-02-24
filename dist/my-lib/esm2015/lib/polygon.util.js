import * as L from "leaflet";
import * as turf from "@turf/turf";
export class PolygonUtil {
    static getCenter(polygon) {
        const pi = Math.PI;
        let x = 0;
        let y = 0;
        let z = 0;
        polygon.forEach(v => {
            let lat1 = v.lat;
            let lon1 = v.lng;
            lat1 = lat1 * pi / 180;
            lon1 = lon1 * pi / 180;
            x += Math.cos(lat1) * Math.cos(lon1);
            y += Math.cos(lat1) * Math.sin(lon1);
            z += Math.sin(lat1);
        });
        let lng = Math.atan2(y, x);
        const hyp = Math.sqrt(x * x + y * y);
        let lat = Math.atan2(z, hyp);
        lat = lat * 180 / pi;
        lng = lng * 180 / pi;
        const center = { lat: lat, lng: lng };
        return center;
    }
    static getSouthWest(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getNorthWest();
    }
    static getNorthEast(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getNorthEast();
    }
    static getNorthWest(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getNorthWest();
    }
    static getSouthEast(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getSouthEast();
    }
    static getNorth(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getNorth();
    }
    static getSouth(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getSouth();
    }
    static getWest(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getWest();
    }
    static getEast(polygon) {
        const bounds = this.getBounds(polygon);
        return bounds.getEast();
    }
    static getSqmArea(polygon) {
        const poly = new L.Polygon(polygon);
        const geoJsonPoly = poly.toGeoJSON();
        const area = turf.area((geoJsonPoly));
        return area;
    }
    static getPerimeter(polygon) {
        const poly = new L.Polygon(polygon);
        const geoJsonPoly = poly.toGeoJSON();
        const perimeter = turf.length((geoJsonPoly), { units: "meters" });
        return perimeter;
    }
    static getPolygonChecksum(polygon) {
        const uniqueLatLngs = polygon.filter((v, i, a) => {
            return a.indexOf(a.find(x => x.lat === v.lat && x.lng === v.lng)) === i;
        });
        return uniqueLatLngs.reduce((a, b) => +a + +b.lat, 0) * uniqueLatLngs.reduce((a, b) => +a + +b.lng, 0);
    }
    static getMidPoint(point1, point2) {
        const p1 = turf.point([point1.lng, point1.lat]);
        const p2 = turf.point([point2.lng, point2.lat]);
        const midpoint = turf.midpoint(p1, p2);
        const returnPoint = {
            lat: midpoint.geometry.coordinates[1],
            lng: midpoint.geometry.coordinates[0]
        };
        return returnPoint;
    }
    static getBounds(polygon) {
        const tmpLatLng = [];
        polygon.forEach(ll => {
            if (isNaN(ll.lat) || isNaN(ll.lng)) {
            }
            tmpLatLng.push(ll);
        });
        const polyLine = new L.Polyline(tmpLatLng);
        const bounds = polyLine.getBounds();
        return bounds;
    }
}
//export class FreedrawSubtract extends L.FreeDraw {
//    constructor() {
//        //this will become L.FreeDraw
//        super(null);
//        //call methods in freedraw by this
//        const foo = this.size();
//        this.consoleLogNumberOfPolygons(foo);
//    }
//    consoleLogNumberOfPolygons(size: number): void {
//        console.log("Number of polygons: ", size);
//    }
//}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWdvbi51dGlsLmpzIiwic291cmNlUm9vdCI6Im5nOi8vcG9seWRyYXcvIiwic291cmNlcyI6WyJsaWIvcG9seWdvbi51dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sS0FBSyxDQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdCLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFBO0FBR2xDLE1BQU0sT0FBTyxXQUFXO0lBQ3BCLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBa0I7UUFDL0IsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2hCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDakIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUNqQixJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDdkIsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO1lBQ3ZCLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0IsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNyQixNQUFNLE1BQU0sR0FBWSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBRS9DLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQWtCO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsT0FBTyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUNELE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBa0I7UUFDbEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxPQUFPLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBQ0QsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFrQjtRQUNsQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQWtCO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsT0FBTyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBa0I7UUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxPQUFPLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFrQjtRQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWtCO1FBQzdCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsT0FBTyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBa0I7UUFDN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxPQUFPLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBQ0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFrQjtRQUNoQyxNQUFNLElBQUksR0FBYyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0MsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRXJDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQVEsQ0FBQyxDQUFDO1FBRTdDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQWtCO1FBQ2xDLE1BQU0sSUFBSSxHQUFjLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFckMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBUSxFQUFFLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFFdkUsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUNELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFrQjtRQUN4QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNHLENBQUM7SUFDRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQWUsRUFBRSxNQUFlO1FBRS9DLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRWhELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXZDLE1BQU0sV0FBVyxHQUFZO1lBQ3pCLEdBQUcsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDckMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztTQUN4QyxDQUFDO1FBRUYsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUNELE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBa0I7UUFDL0IsTUFBTSxTQUFTLEdBQWUsRUFBRSxDQUFDO1FBRWpDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDakIsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUU7YUFDbkM7WUFDRCxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQWMsQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQWUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVwQyxPQUFPLE1BQU0sQ0FBQztJQUVsQixDQUFDO0NBQ0o7QUFFRCxvREFBb0Q7QUFHcEQscUJBQXFCO0FBRXJCLHVDQUF1QztBQUN2QyxzQkFBc0I7QUFDdEIsNENBQTRDO0FBQzVDLGtDQUFrQztBQUVsQywrQ0FBK0M7QUFFL0MsT0FBTztBQUVQLHNEQUFzRDtBQUN0RCxvREFBb0Q7QUFDcEQsT0FBTztBQUVQLEdBQUciLCJzb3VyY2VzQ29udGVudCI6WyJcclxuaW1wb3J0ICogYXMgTCBmcm9tIFwibGVhZmxldFwiO1xyXG5pbXBvcnQgKiBhcyB0dXJmIGZyb20gXCJAdHVyZi90dXJmXCJcclxuaW1wb3J0IHsgSUxhdExuZyB9IGZyb20gXCIuL3BvbHlnb24taGVscGVyc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBvbHlnb25VdGlsIHtcclxuICAgIHN0YXRpYyBnZXRDZW50ZXIocG9seWdvbjogSUxhdExuZ1tdKSB7XHJcbiAgICAgICAgY29uc3QgcGkgPSBNYXRoLlBJO1xyXG4gICAgICAgIGxldCB4ID0gMDtcclxuICAgICAgICBsZXQgeSA9IDA7XHJcbiAgICAgICAgbGV0IHogPSAwO1xyXG5cclxuICAgICAgICBwb2x5Z29uLmZvckVhY2godiA9PiB7XHJcbiAgICAgICAgICAgIGxldCBsYXQxID0gdi5sYXQ7XHJcbiAgICAgICAgICAgIGxldCBsb24xID0gdi5sbmc7XHJcbiAgICAgICAgICAgIGxhdDEgPSBsYXQxICogcGkgLyAxODA7XHJcbiAgICAgICAgICAgIGxvbjEgPSBsb24xICogcGkgLyAxODA7XHJcbiAgICAgICAgICAgIHggKz0gTWF0aC5jb3MobGF0MSkgKiBNYXRoLmNvcyhsb24xKTtcclxuICAgICAgICAgICAgeSArPSBNYXRoLmNvcyhsYXQxKSAqIE1hdGguc2luKGxvbjEpO1xyXG4gICAgICAgICAgICB6ICs9IE1hdGguc2luKGxhdDEpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgbG5nID0gTWF0aC5hdGFuMih5LCB4KTtcclxuICAgICAgICBjb25zdCBoeXAgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XHJcbiAgICAgICAgbGV0IGxhdCA9IE1hdGguYXRhbjIoeiwgaHlwKTtcclxuICAgICAgICBsYXQgPSBsYXQgKiAxODAgLyBwaTtcclxuICAgICAgICBsbmcgPSBsbmcgKiAxODAgLyBwaTtcclxuICAgICAgICBjb25zdCBjZW50ZXI6IElMYXRMbmcgPSB7IGxhdDogbGF0LCBsbmc6IGxuZyB9O1xyXG5cclxuICAgICAgICByZXR1cm4gY2VudGVyO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldFNvdXRoV2VzdChwb2x5Z29uOiBJTGF0TG5nW10pOiBJTGF0TG5nIHtcclxuICAgICAgICBjb25zdCBib3VuZHMgPSB0aGlzLmdldEJvdW5kcyhwb2x5Z29uKTtcclxuICAgICAgICByZXR1cm4gYm91bmRzLmdldE5vcnRoV2VzdCgpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldE5vcnRoRWFzdChwb2x5Z29uOiBJTGF0TG5nW10pOiBJTGF0TG5nIHtcclxuICAgICAgICBjb25zdCBib3VuZHMgPSB0aGlzLmdldEJvdW5kcyhwb2x5Z29uKTtcclxuICAgICAgICByZXR1cm4gYm91bmRzLmdldE5vcnRoRWFzdCgpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldE5vcnRoV2VzdChwb2x5Z29uOiBJTGF0TG5nW10pOiBJTGF0TG5nIHtcclxuICAgICAgICBjb25zdCBib3VuZHMgPSB0aGlzLmdldEJvdW5kcyhwb2x5Z29uKTtcclxuICAgICAgICByZXR1cm4gYm91bmRzLmdldE5vcnRoV2VzdCgpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldFNvdXRoRWFzdChwb2x5Z29uOiBJTGF0TG5nW10pOiBJTGF0TG5nIHtcclxuICAgICAgICBjb25zdCBib3VuZHMgPSB0aGlzLmdldEJvdW5kcyhwb2x5Z29uKTtcclxuICAgICAgICByZXR1cm4gYm91bmRzLmdldFNvdXRoRWFzdCgpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldE5vcnRoKHBvbHlnb246IElMYXRMbmdbXSk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgYm91bmRzID0gdGhpcy5nZXRCb3VuZHMocG9seWdvbik7XHJcbiAgICAgICAgcmV0dXJuIGJvdW5kcy5nZXROb3J0aCgpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldFNvdXRoKHBvbHlnb246IElMYXRMbmdbXSk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgYm91bmRzID0gdGhpcy5nZXRCb3VuZHMocG9seWdvbik7XHJcbiAgICAgICAgcmV0dXJuIGJvdW5kcy5nZXRTb3V0aCgpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldFdlc3QocG9seWdvbjogSUxhdExuZ1tdKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBib3VuZHMgPSB0aGlzLmdldEJvdW5kcyhwb2x5Z29uKTtcclxuICAgICAgICByZXR1cm4gYm91bmRzLmdldFdlc3QoKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRFYXN0KHBvbHlnb246IElMYXRMbmdbXSk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgYm91bmRzID0gdGhpcy5nZXRCb3VuZHMocG9seWdvbik7XHJcbiAgICAgICAgcmV0dXJuIGJvdW5kcy5nZXRFYXN0KCk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0U3FtQXJlYShwb2x5Z29uOiBJTGF0TG5nW10pOiBudW1iZXIge1xyXG4gICAgICAgIGNvbnN0IHBvbHk6IEwuUG9seWdvbiA9IG5ldyBMLlBvbHlnb24ocG9seWdvbik7XHJcbiAgICAgICAgY29uc3QgZ2VvSnNvblBvbHkgPSBwb2x5LnRvR2VvSlNPTigpO1xyXG5cclxuICAgICAgICBjb25zdCBhcmVhID0gdHVyZi5hcmVhKChnZW9Kc29uUG9seSkgYXMgYW55KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGFyZWE7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0UGVyaW1ldGVyKHBvbHlnb246IElMYXRMbmdbXSk6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgcG9seTogTC5Qb2x5Z29uID0gbmV3IEwuUG9seWdvbihwb2x5Z29uKTtcclxuICAgICAgICBjb25zdCBnZW9Kc29uUG9seSA9IHBvbHkudG9HZW9KU09OKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBlcmltZXRlciA9IHR1cmYubGVuZ3RoKChnZW9Kc29uUG9seSkgYXMgYW55LCB7dW5pdHM6IFwibWV0ZXJzXCJ9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBlcmltZXRlcjtcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRQb2x5Z29uQ2hlY2tzdW0ocG9seWdvbjogSUxhdExuZ1tdKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCB1bmlxdWVMYXRMbmdzID0gcG9seWdvbi5maWx0ZXIoKHYsIGksIGEpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXhPZihhLmZpbmQoeCA9PiB4LmxhdCA9PT0gdi5sYXQgJiYgeC5sbmcgPT09IHYubG5nKSkgPT09IGk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB1bmlxdWVMYXRMbmdzLnJlZHVjZSgoYSwgYikgPT4gK2EgKyArYi5sYXQsIDApICogdW5pcXVlTGF0TG5ncy5yZWR1Y2UoKGEsIGIpID0+ICthICsgK2IubG5nLCAwKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRNaWRQb2ludChwb2ludDE6IElMYXRMbmcsIHBvaW50MjogSUxhdExuZyk6IElMYXRMbmcge1xyXG5cclxuICAgICAgICBjb25zdCBwMSA9IHR1cmYucG9pbnQoW3BvaW50MS5sbmcsIHBvaW50MS5sYXRdKTtcclxuICAgICAgICBjb25zdCBwMiA9IHR1cmYucG9pbnQoW3BvaW50Mi5sbmcsIHBvaW50Mi5sYXRdKTtcclxuXHJcbiAgICAgICAgY29uc3QgbWlkcG9pbnQgPSB0dXJmLm1pZHBvaW50KHAxLCBwMik7XHJcblxyXG4gICAgICAgIGNvbnN0IHJldHVyblBvaW50OiBJTGF0TG5nID0ge1xyXG4gICAgICAgICAgICBsYXQ6IG1pZHBvaW50Lmdlb21ldHJ5LmNvb3JkaW5hdGVzWzFdLFxyXG4gICAgICAgICAgICBsbmc6IG1pZHBvaW50Lmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJldHVyblBvaW50O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldEJvdW5kcyhwb2x5Z29uOiBJTGF0TG5nW10pOiBMLkxhdExuZ0JvdW5kcyB7XHJcbiAgICAgICAgY29uc3QgdG1wTGF0TG5nOiBMLkxhdExuZ1tdID0gW107XHJcblxyXG4gICAgICAgIHBvbHlnb24uZm9yRWFjaChsbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihsbC5sYXQpIHx8IGlzTmFOKGxsLmxuZykpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0bXBMYXRMbmcucHVzaChsbCBhcyBMLkxhdExuZyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBvbHlMaW5lOiBMLlBvbHlsaW5lID0gbmV3IEwuUG9seWxpbmUodG1wTGF0TG5nKTtcclxuICAgICAgICBjb25zdCBib3VuZHMgPSBwb2x5TGluZS5nZXRCb3VuZHMoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vZXhwb3J0IGNsYXNzIEZyZWVkcmF3U3VidHJhY3QgZXh0ZW5kcyBMLkZyZWVEcmF3IHtcclxuXHJcblxyXG4vLyAgICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbi8vICAgICAgICAvL3RoaXMgd2lsbCBiZWNvbWUgTC5GcmVlRHJhd1xyXG4vLyAgICAgICAgc3VwZXIobnVsbCk7XHJcbi8vICAgICAgICAvL2NhbGwgbWV0aG9kcyBpbiBmcmVlZHJhdyBieSB0aGlzXHJcbi8vICAgICAgICBjb25zdCBmb28gPSB0aGlzLnNpemUoKTtcclxuXHJcbi8vICAgICAgICB0aGlzLmNvbnNvbGVMb2dOdW1iZXJPZlBvbHlnb25zKGZvbyk7XHJcblxyXG4vLyAgICB9XHJcblxyXG4vLyAgICBjb25zb2xlTG9nTnVtYmVyT2ZQb2x5Z29ucyhzaXplOiBudW1iZXIpOiB2b2lkIHtcclxuLy8gICAgICAgIGNvbnNvbGUubG9nKFwiTnVtYmVyIG9mIHBvbHlnb25zOiBcIiwgc2l6ZSk7XHJcbi8vICAgIH1cclxuXHJcbi8vfSJdfQ==