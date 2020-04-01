![PolyDraw](/tmp-logo.jpg)

> PolyDraw is a free-hand drawing tool that allows you to draw shapes which are converted to polygons on your Leaflet-map. The tool supports concaving by default, subtracting (donut polygons) and are fully editable by adding edges, dragging edges.
PolyDraw was initially heavily inspired by [Leaflet.FreeDraw (Adam Timberlake "Wildhoney")](https://github.com/Wildhoney/Leaflet.FreeDraw) and [leaflet-freehandshapes (Benjamin DeLong "bozdoz")](https://github.com/bozdoz/leaflet-freehandshapes), so a big thank you and kudos for you!



## Table of Contents

1. [Summary](#summary)
2. [Getting started](#getting-started)
  1. [Configuration](#configuration)
  2. [Configuration explained](#configuration-explained)
  3. [Draw modes](#draw-modes)
  4. [Enums](#enums)


## Summary
> Bla bla bla
![Screen shot](/tmp-screenshot.jpg)

## Getting started
```javascript
import * as L from "Leaflet";

this.map = new L.Map("map");
this.map.setView(new L.LatLng(59.911491, 10.757933), 16);
/* Polydraw is initiated with default options, see "Configuration section"*/
const polyDraw = new PolyDraw();
polyDraw.setDrawMode(DrawMode.Add);

```

## Configuration
Road to configuration.
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

|Key|Type|Default|Description|
|---|----|-------|-----------|
| `touchSupport`			|boolean| `true`        | Allow touch support. |
| `mergePolygons`           |boolean| `true`        | PolyDraw attempts to merge polygons if they are intersecting. |
| `kinks`              		|boolean| `false`        | text |
| `**modes**`              	|object|         | xxx |
| `&nbsp;&nbsp;&nbsp;attachElbow`             |boolean| `false`        | Set support for attaching elbows |
| **markers**             |object| `-`        | Main object for marker configuration. |
| `&nbsp;&nbsp;&nbsp;deleteMarker`            |boolean| `true`        | When enabled, show delete marker icon. |
| `&nbsp;&nbsp;&nbsp;infoMarker`              |boolean| `true`        | When enabled, show info marker icon. |
| `&nbsp;&nbsp;&nbsp;menuMarker`              |boolean| `true`        | When enabled, show menu marker icon. |
| `&nbsp;&nbsp;&nbsp;coordsTitle`             |boolean| `true`        | Allow touch support. |
| **&nbsp;&nbsp;&nbsp;markerIcon**              |object| `--`        | Default elbow marker icon configuration. |
| `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;styleClasses`            |Array| `[polygon-marker]`        | String array with name of style classes |
| **&nbsp;&nbsp;&nbsp;holeIcon**              	|object| `--`        | Hole marker icon configuration. |
| `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;styleClasses`            |Array| `[polygon-marker, hole]`        | String array with name of style classes |
| **&nbsp;&nbsp;&nbsp;&nbsp;markerInfoIcon**          |object| `--`        | Info marker icon configuration. |
| `position`              	|int| `--`        | Where to put the marker, see [Marker position](#marker-position) for more information. |
| `showArea`              	|boolean| `--`        | When enabled, displays area information. |
| `showPerimeter`           |boolean| `--`        | When enabled, displays perimeter information. |
| `useMetrics`              |boolean| `--`        | When enabled, displays metric units, otherwise imperial units. |
| `usePerimeterMinValue`    |boolean| `--`        | When enabled, uses a defined default value in case of the value is unknown. |
| `areaLabel`              	|string| `--`        | Display text on area label |
| `perimeterLabel`          |string| `--`        | Display text on perimeter label |
| `values`              	|object| `--`        | Predefined default values |
| `min`              		|object| `--`        | Default values for min values if **usePerimeterMinValue** is enabled. |
| `metric`              	|string| `50`        | Display text on perimeter label |
| `imperial`              	|string| `100`        | Display text on perimeter label |
| `unknown`              	|object|         | Default values for unkown values |
| `metric`              	|string| `-`        | Display text on perimeter label |
| `imperial`              	|string| `-`        | Display text on perimeter label |
| `units`              		|object|         | Predefined default values |
| `unknownUnit`            	|string| `empty string`        | Value for unknown units |
| `metric`              	|string| `empty string`        | Value for unknown units |
| `perimeter`              	|object| `--`        | Default values for min values if **usePerimeterMinValue** is enabled. |
| `m`              			|string| `50`        | Display text on perimeter label |
| `km`              		|string| `100`        | Display text on perimeter label |
| `area`              		|object|         | Default values for unkown values |
| `m2`              		|string| `-`        | Display text on perimeter label |
| `km2`              		|string| `-`        | Display text on perimeter label |
| `daa`              		|string| `-`        | Display text on perimeter label |
| `ha`              		|string| `-`        | Display text on perimeter label |
| `imperial`              	|string| `empty string`        | Value for unknown units |
| `perimeter`              	|object| `--`        | Default values for min values if **usePerimeterMinValue** is enabled. |
| `feet`              		|string| `50`        | Display text on perimeter label |
| `yards`              		|string| `100`        | Display text on perimeter label |
| `miles`              		|string| `100`        | Display text on perimeter label |
| `area`              		|object|         | Default values for unkown values |
| `feet2`              		|string| `-`        | Display text on perimeter label |
| `yards2`              	|string| `-`        | Display text on perimeter label |
| `acres`              		|string| `-`        | Display text on perimeter label |
| `miles2`              	|string| `-`        | Display text on perimeter label |
| `styleClasses`           	|array| `[polygon-marker, info]`        | String array with name of style classes |
| `markerMenuIcon`          |object|         | Menu marker icon configuration. |
| `position`              	|int| `7`        | Where to put the marker, see [Marker position](#marker-position) for more information. |
| `styleClasses`           	|array| `[polygon-marker, info]`        | String array with name of style classes |
| `markerDeleteIcon`        |object|         | Delete marker icon configuration. |
| `position`              	|int| `5`        | Where to put the marker, see [Marker position](#marker-position) for more information. |
| `styleClasses`           	|array| `[polygon-marker, delete]`        | String array with name of style classes |
| `polyLineOptions`        	|object|         | Normal poly line configuration. |
| `color`              		|string| `#50622b`        | Poly line color |
| `opacity`           		|number| `1.0`        | Opacity on poly line. |
| `smoothFactor`         	|number| `0.0`        | text How much to simplify the polyline. |
| `noClip`           		|boolean| `true`        | text |
| `clickable`              	|boolean| `false`        | text |
| `weight`           		|number| `2`        | Poly line width in pixels |
| `subtractLineOptions`        	|object|         | Subtract (holes) poly line configuration. |
| `color`              		|string| `#50622b`        | Poly line color |
| `opacity`           		|number| `1.0`        | Opacity on poly line. |
| `smoothFactor`         	|number| `0.0`        | text How much to simplify the polyline. |
| `noClip`           		|boolean| `true`        | text |
| `clickable`              	|boolean| `false`        | text |
| `weight`           		|number| `2`        | Poly line width in pixels |
| `polygonOptions`        	|object|         | Polygon configuration. |
| `color`              		|string| `#50622b`        | Polygon color |
| `fillColor`           	|number| `#b4cd8a`        | Polygon fill color. |
| `smoothFactor`         	|number| `0.3`        | text How much to simplify the polyline. |
| `noClip`           		|boolean| `true`        | text |
| `simplification`        	|object|         | Simplification configuration. |
| `simplifyTolerance`       |object|         | Tolerance configuration |
| `tolerance`           	|number| `0.0001`        | text |
| `highQuality`         	|boolean| `false`        | text |
| `mutate`           		|boolean| `false`        | text |
| `dynamicMode`       		|object|         | text |
| `fractionGuard`           	|number| `0.9`        | text |
| `multiplier`         	|number| `2`        | text |
| `boundingBox`       		|object|         | text |
| `addMidPointMarkers`           	|boolean| `true`        | When enabled, bounding boxes is decorated with West, North, East and South elbows. |




## Draw modes
You can combine draw modes for different behaviour.
```javascript
polyDraw.setDrawMode(DrawMode.Add | DrawMode.Edit);
```
With this you can add and edit polygons but you can't append edges.
How ever, you can't add and subtract at the same time, so if combined "Add" overrides "Subtract".
```javascript
DrawMode {
    Off = 0,
    Add = 1,
    Edit = 2,
    Subtract = 4,
    AppendMarker = 8,
    LoadPredefined = 16
}
```

## Marker position
You can choose where you want to put the delete-marker and area information-marker.
The area information-marker offsets around the delete marker.
example:
```javascript
const polyDraw = new PolyDraw({
  markers: {
    markerDeleteIcon: {
      position: MarkerPlacement.North
    },
    markerInfoIcon: {
      position: MarkerPlacement.East
    },
    markerMenuIcon: {
      position: MarkerPlacement.West
    }
  }
});
```
This configuration gives this result.

![PolyDraw](/star.png)

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
