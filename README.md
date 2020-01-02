![PolyDraw](/tmp-logo.jpg)

> PolyDraw is a free-hand drawing tool that allows you to draw shapes which are converted to polygons on your Leaflet-map. The tool supports concaving by default, subtracting (donut polygons) and are fully editable by adding edges, dragging edges.
PolyDraw was initially heavily inspired by [Leaflet.FreeDraw (Adam Timberlake "Wildhoney")](https://github.com/Wildhoney/Leaflet.FreeDraw) and [leaflet-freehandshapes (Benjamin DeLong "bozdoz")](https://github.com/bozdoz/leaflet-freehandshapes), so a big thank you and kudos for you!

![Screen shot](/tmp-screenshot.jpg)

## Getting started
```javascript
import * as L from "Leaflet";

const polyDraw = new PolyDraw();
```

## Configuration
> Road to configuration.
* **Default configuration**
```json
{
    "configPath": null,
    "mergePolygons": true,
    "deleteMarkers": {
        "isVisible": true,
        "placement": 0,
    },
    "arealMarkers": {
        "isVisible": true,
        "placement": 0,
        "showArea": true,
        "showCircumference": true,
        "useMetrics": true
    },
    "minimumPolyDrawZoomLevel": 12,
    "maximumPolyDrawZoomLevel": null,
    "polyLineOptions": {
        "color": "#50622b",
        "opacity": 1,
        "smoothFactor": 0,
        "noClip": true,
        "clickable": false,
        "weight": 2
    },
    "polygonOptions": {
        "smoothFactor": 0.3,
        "color": "#50622b",
        "fillColor": "#b4cd8a",
        "noClip": true
    },
    "simplifyTolerance": {
        "tolerance": 0.00010, 
        "highQuality": false
    }
}
```
* **Inline configuration**
```javascript
const polyDraw = new PolyDraw({
  ...args...
});
```
* **Point out your own json-file with configuration options**
```javascript
const polyDraw = new PolyDraw({
  configPath: "path/to/your/location/polydraw.config.json"
});
```
## Config explained

| Key                         | Default      | Result                               |
| --------------------------- |------------- | ------------------------------------ |
| `configPath`                | `null`        | Path to custom config-file. |
| `mergePolygons`             | `true`        | PolyDraw attempts to merge polygons if they are intersecting. |
| `minimumPolyDrawZoomLevel`  | `null`        | Path to custom config-file. |
| `maximumPolyDrawZoomLevel`  | `true`        | PolyDraw attempts to merge polygons if they are intersecting. |
**deleteMarkers**
| `isVisible`                 | `true`        | Show trash-can on every polygons. |
| `placement`                 | `0 (Center)`  | Where to place the trash-can marker [MarkerPlacement](#enums).. |
**areaMarkers**
| `isVisible`                 | `true`        | Show area info-label on every polygons. |
| `placement`                 | `0 (Center)`  | Where to place the trash-can marker [MarkerPlacement](#enums).. |
| `showArea`                  | `true`        | Show area info on the marker icon. |
| `showPerimeter`             | `true`        | Show perimeter info on the marker icon |
| `useMetrics`                | `true`        | If false, Imperial units are showed. |
| `numOfDecimals`             | `0`           | Number of decimals |
| `areaLabel`                 | `"Area"`      | Text on label. |
| `perimeterLabel`            | `"Perimeter"` | Text on label. |
**polyLineOptions**
| `color`                     | `#50622b`     | Color of the stroke when drawing. |
| `opacity`                   | `1`           | Opacity 0 - 1 |
| `smoothFactor`              | `0`           |  |
| `noClip`                    | `true`        |  |
| `clickable`                 | `false`       |  |
| `weight`                    | `2`           | Stroke width |
**polygonOptions**
| `color`                     | `#50622b`     | Border color of edge markers. |
| `fillColor`                 | `#b4cd8a`     | Color of the edge markers |
| `smoothFactor`              | `0.3`         |  |
| `noClip`                    | `true`        |  |
**simplifyTolerance**
| `tolerance`                 | `0.00010`     | How much the polygon should be simplified. |
| `highQuality`               | `false`       |  |


## Enums
```javascript
MarkerPlacement {
    Center = 0,
    North = 1,
    East = 2,
    South = 3,
    West = 4,
    NorthEast = 5,
    NorthWest = 6,
    SouthEast = 7,
    SouthWest = 8
}
```
