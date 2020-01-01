# POLYDRAW

> PolyDraw is a free-hand drawing tool that allows you to draw shapes which are converted to polygons on your Leaflet-map. The tool supports concaving by default, subtracting (donut polygons) and are fully editable by adding edges, dragging edges.
PolyDraw was initially heavily inspired by [Leaflet.FreeDraw (Adam Timberlake "Wildhoney")](https://github.com/Wildhoney/Leaflet.FreeDraw) and [leaflet-freehandshapes (Benjamin DeLong "bozdoz")](https://github.com/bozdoz/leaflet-freehandshapes), so a big thank you and kudos for you!

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

| Key                    | Default      | Result                               |
| ---------------------- |------------- | ------------------------------------ |
| `configPath`                 | `null`        | Path to custom config-file. |
| `mergePolygons`                 | `true`        | PolyDraw attempts to merge polygons if they are intersecting. |
**deleteMarkers**
| `isVisible`                 | `true`        | Show trash-can on every polygons. |
| `placement`                 | `0 (Far north)`        | [placement enum](#enums).. |


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
