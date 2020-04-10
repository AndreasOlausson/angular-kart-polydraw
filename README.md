![PolyDraw](/tmp-logo.jpg)

> PolyDraw is a free-hand drawing tool that allows you to draw shapes which are converted to polygons on your Leaflet-map. The tool supports concaving by default, subtracting (donut polygons) and are fully editable by adding edges, dragging edges.
PolyDraw was initially heavily inspired by [Leaflet.FreeDraw (Adam Timberlake "Wildhoney")](https://github.com/Wildhoney/Leaflet.FreeDraw) and [leaflet-freehandshapes (Benjamin DeLong "bozdoz")](https://github.com/bozdoz/leaflet-freehandshapes), so a big thank you and kudos for you!



## Table of Contents

1. [Summary](#summary)
2. [Getting started](#getting-started)
  1. [Configuration](#configuration)
  2. [Configuration explained](#config-explained)
  3. [Draw modes](#draw-modes)
  4. [Enums](#enums)


## Summary
> Bla bla bla
![Screen shot](/tmp-screenshot.jpg)

## Getting started
 > Pre requirements
 
Polydraw require that TSyringe, a lightweight dependency injection container for JavaScript/TypeScript, is installed in your project, it might work without it if you use angular (Injectable).
 
TSyringe can be found at [https://github.com/microsoft/tsyringe](https://github.com/microsoft/tsyringe).

```
npm:
npm install --save tsyringe

yarn:
yarn add tsyringe

```
Include the following lines to you tsconfig.json
```javascript
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```
You also need to add a polyfill for the Reflect API, use one of the following, we use 'reflect-metadata' in the example below.

- [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)
- [core-js (core-js/es7/reflect)](https://www.npmjs.com/package/core-js)
- [reflection](https://www.npmjs.com/package/@abraham/reflection)

 > How to
```javascript
import "reflect-metadata";
import { container } from "tsyringe";
import * as L from "Leaflet";

import { MapStateService, PolyDrawService, ILatLng } from 'leaflet-polydraw';

export class LeafletPolyDrawExample {

  polyDrawService: PolyDrawService;

  constructor() {
      this.mapState = container.resolve(MapStateService);
      this.polyDrawService = container.resolve(PolyDrawService);
  }
  
  onInit() {
    this.map = new L.Map("map");
    this.map.setView(new L.LatLng(59.911491, 10.757933), 16);
  }
  
  onDrawClick(): void {
    this.polyDrawService.drawModeClick();
  }
  
  onSubtractClick(): void {
    this.polyDrawService.subtractClick();
  }
  
  onAutoAddPolygon(polygon: ILatLng[][][]): void {
    this.polyDrawService.addAutoPolygon(polygon);
  }
}
```

## Configuration
Road to configuration.
* **Default configuration**
```json
{
  "touchSupport": true,
  "mergePolygons": true,
  "kinks": false,
  "modes": {
    "attachElbow": false,
    "dragElbow": true
  },
  "markers": {
    "deleteMarker": true,
    "infoMarker": true,
    "menuMarker": true,
    "coordsTitle": true,
    "zIndexOffset": 0,
    "markerIcon": {
      "styleClasses": [
        "polygon-marker"
      ],
      "zIndexOffset": null
    },
    "holeIcon": {
      "styleClasses": [
        "polygon-marker",
        "hole"
      ],
      "zIndexOffset": null
    },
    "markerInfoIcon": {
      "position": 3,
      "showArea": true,
      "showPerimeter": true,
      "useMetrics": true,
      "usePerimeterMinValue": false,
      "areaLabel": "Area",
      "perimeterLabel": "Perimeter",
      "values": {
        "min": {
          "metric": "50",
          "imperial": "100"
        },
        "unknown": {
          "metric": "-",
          "imperial": "-"
        }
      },
      "units": {
        "unknownUnit": "",
        "metric": {
          "onlyMetrics": true,
          "perimeter": {
            "m": "m",
            "km": "km"
          },
          "area": {
            "m2": "m²",
            "km2": "km²",
            "daa": "daa",
            "ha": "ha"
          }
        },
        "imperial": {
          "perimeter": {
            "feet": "ft",
            "yards": "yd",
            "miles": "mi"
          },
          "area": {
            "feet2": "ft²",
            "yards2": "yd²",
            "acres": "ac",
            "miles2": "mi²"
          }
        }
      },
      "styleClasses": [
        "polygon-marker",
        "info"
      ],
      "zIndexOffset": null
    },
    "markerMenuIcon": {
      "position": 7,
      "styleClasses": [
        "polygon-marker",
        "menu"
      ],
      "zIndexOffset": null
    },
    "markerDeleteIcon": {
      "position": 5,
      "styleClasses": [
        "polygon-marker",
        "delete"
      ],
      "zIndexOffset": null
    }
  },
  "polyLineOptions": {
    "color": "#50622b",
    "opacity": 1,
    "smoothFactor": 0,
    "noClip": true,
    "clickable": false,
    "weight": 2
  },
  "subtractLineOptions": {
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
  "simplification": {
    "simplifyTolerance": {
      "tolerance": 0.0001,
      "highQuality": false,
      "mutate": false
    },
    "dynamicMode": {
      "fractionGuard": 0.9,
      "multipiler": 2
    }
  },
  "boundingBox": {
    "addMidPointMarkers": true
  },
  "bezier": {
    "resolution": 10000,
    "sharpness": 0.85
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
| touchSupport			|boolean| `true`        | Allow touch support. |
| mergePolygons           |boolean| `true`        | PolyDraw attempts to merge polygons if they are intersecting. |
| kinks              		|boolean| `false`        | text |
| **modes**              	|object|         | Turn on or off features |
| &nbsp;&nbsp;&nbsp;attachElbow             |boolean| `false`        | When enabled, attaching elbows is allowed |
| &nbsp;&nbsp;&nbsp;dragElbow             |boolean| `true`        | When enabled, dragging elbows is allowed |
| **markers**             |object|         | Main object for marker configuration. |
| &nbsp;&nbsp;&nbsp;deleteMarker            |boolean| `true`        | When enabled, show delete marker icon. |
| &nbsp;&nbsp;&nbsp;infoMarker              |boolean| `true`        | When enabled, show info marker icon. |
| &nbsp;&nbsp;&nbsp;menuMarker              |boolean| `true`        | When enabled, show menu marker icon. |
| &nbsp;&nbsp;&nbsp;coordsTitle             |boolean| `true`        | When enabled, show tooltip with coord information on elbow markers. |
| &nbsp;&nbsp;&nbsp;zIndexOffset             |number| `0`        | By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like 1000 (or high negative value, respectively). |
| &nbsp;&nbsp;&nbsp;**markerIcon**              |object|         | Default elbow marker icon configuration. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;styleClasses            |Array| `[polygon-marker]`        | String array with name of style classes |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;zIndexOffset             |number| `null`        | Override of the zIndexOffset on **markers** |
| &nbsp;&nbsp;&nbsp;**holeIcon**              	|object|        | Hole marker icon configuration. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;styleClasses            |array| `[polygon-marker, hole]`        | String array with name of style classes |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;zIndexOffset             |number| `null`        | Override of the zIndexOffset on **markers** |
| &nbsp;&nbsp;&nbsp;&nbsp;**markerInfoIcon**          |object|         | Info marker icon configuration. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;position              	|int|         | Where to position the marker, see [Marker position](#marker-position) for more information. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;showArea              	|boolean|         | When enabled, displays area information. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;showPerimeter           |boolean|         | When enabled, displays perimeter information section. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;useMetrics             |boolean|         | When enabled, displays metric units, otherwise imperial units. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;usePerimeterMinValue    |boolean|         | When enabled, a predefined value is shown in case of a unknown value. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;areaLabel              	|string|         | Display text on area label |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;perimeterLabel          |string|         | Display text on perimeter label |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**values**              	|object|         | Predefined default values |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**min**              		|object|         | Default values for min values if **usePerimeterMinValue** is enabled. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;metric              	|string| `50`        | Default min value for metric values |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;imperial              	|string| `100`        | Default min value for imperial values |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**unknown**              	|object|         | Default values for unkown values |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;metric              	|string| `-`        | Default unknown value for metric values |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;imperial              	|string| `-`        | Default unknown value for imperial values |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**units**              		|object|         | Predefined default units |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;unknownUnit            	|string| `empty string`        | Value for unknown units |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**metric**              	|object|         | Metric properties |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;onlyMetrics            	|boolean| false        | When enabled, daa and ha is removed from area, only m2 and km2 is used.  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**perimeter**              	|object|         |  Perimeter properties |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;m              			|string| `m`        | Meter unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;km              		|string| `km`        | Kilometer unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**area**              		|object|         | Area properties |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;m2              		|string| `m²`        | Square meter unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;km2              		|string| `km²`        | Square kilometer unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;daa              		|string| `daa`        | Decare unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ha              		|string| `ha`        | Hectare unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**imperial**              	|object|         | Imperial properties |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**perimeter**              	|object|         | Perimeter properties |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;feet              		|string| `ft`        | Feet unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;yards              		|string| `yd`        | Yard unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;miles              		|string| `mi`        | Miles unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**area**              		|object|         | Area properties |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;feet2              		|string| `ft²`        | Square feet unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;yards2              	|string| `yd²`        | Square yard unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;acres              		|string| `ac`        | Acre unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;miles2              	|string| `mi²`        | Square mile unit |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;styleClasses           	|array| `[polygon-marker, info]`        | String array with name of style classes |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;zIndexOffset             |number| `null`        | Override of the zIndexOffset on **markers** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**markerMenuIcon**          |object|         | Menu marker icon configuration. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;position              	|int| `7`        | Where to put the marker, see [Marker position](#marker-position) for more information. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;styleClasses           	|array| `[polygon-marker, info]`        | String array with name of style classes |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;zIndexOffset             |number| `null`        | Override of the zIndexOffset on **markers** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**markerDeleteIcon**        |object|         | Delete marker icon configuration. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;position              	|int| `5`        | Where to put the marker, see [Marker position](#marker-position) for more information. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;styleClasses           	|array| `[polygon-marker, delete]`        | String array with name of style classes |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;zIndexOffset             |number| `null`        | Override of the zIndexOffset on **markers** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**polyLineOptions**        	|object|         | Polyline configuration. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;color              		|string| `#50622b`        | Polyline color |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;opacity           		|number| `1.0`        | Opacity on polyline. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;smoothFactor         	|number| `0.0`        | How much to simplify the polyline. Much: smoother look, Less: more accurate. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;noClip           		|boolean| `true`        | Disable polyline clipping. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;clickable              	|boolean| `false`        | text |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;weight           		|number| `2`        | Polyline width in pixels |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**subtractLineOptions**        	|object|         | Subtract (holes) polyline configuration. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;color              		|string| `#50622b`        | Polyline color |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;opacity           		|number| `1.0`        | Opacity on polyline. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;smoothFactor         	|number| `0.0`        | How much to simplify the polyline. Much: smoother look, Less: more accurate. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;noClip           		|boolean| `true`        | Disable polyline clipping. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;clickable              	|boolean| `false`        | text |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;weight           		|number| `2`        | Poly line width in pixels |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**polygonOptions**        	|object|         | Polygon configuration. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;color              		|string| `#50622b`        | Polygon color |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fillColor           	|number| `#b4cd8a`        | Polygon fill color. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;smoothFactor         	|number| `0.3`        | How much to simplify the polyline. Much: smoother look, Less: more accurate. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;noClip           		|boolean| `true`        | Disable polyline clipping. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**simplification**        	|object|         | Simplification configuration. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**simplifyTolerance**       |object|         | Tolerance configuration |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;tolerance           	|number| `0.0001`        | Tolerance affects the amount of simplification (lesser value means higher quality but slower and with more points). |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;highQuality         	|boolean| `false`        | Excludes distance-based preprocessing step which leads to highest quality simplification but runs ~10-20 times slower. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mutate           		|boolean| `false`        | Allows GeoJSON input to be mutated (significant performance increase if true) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**dynamicMode**       		|object|         |  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fractionGuard           	|number| `0.9`        | When to stop the dynamic simplification. (ie. Avoid the polygon to have less than 3 points. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;multiplier         	|number| `2`        | A number for how much the tolerance should be increased by. (ie. tolerance * multipiler) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**boundingBox**       		|object|         |  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;addMidPointMarkers           	|boolean| `true`        | When enabled, bounding boxes is decorated with West, North, East and South elbows. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**bezier**       		|object|         |  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;resolution           	|number| `10000`        | Time in milliseconds between points. |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;sharpness           	|number| `0.75`        | A measure of how curvy the path should be between splines. |


## Markers

![Markers](/polydraw-markers.png)

> Delete marker (North West)

Used to delete the polygon. You can control this marker by:
```javascript
this.polyDrawService.configurate({
    "markers": {
      "deleteMarker": true,
      "markerDeleteIcon: {
        ...options...
      }
    }
});
``` 

> Menu marker (North)

![Menu](/polydraw-menu-popup.png)

Used to show a popup with alter-options to the polygon. 
- Simplify, decrease number of elbows
- BBox, convert polygon to it's bounding box
You can control this marker by:
```javascript
this.polyDrawService.configurate({
    "markers": {
      "menuMarker": true,
      "markerDeleteIcon: {
        ...options...
      }
    }
});
``` 
> Info marker (North East)

![Info](/polydraw-info-popup.png)

Used to show a popup with info about the polygon. You can control this marker by:
```javascript
this.polyDrawService.configurate({
    "markers": {
      "infoMarker": true,
      "markerInfoIcon: {
        ...options...
      }
    }
});
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

![PolyDraw](/star2.png)

```javascript
MarkerPosition {
    SouthWest = 0,
    South = 1,
    SouthEast = 2,
    East = 3,
    NorthEast = 4,
    North = 5,
    NorthWest = 6,
    West = 7
}
```

## Up next...

- Prio 1, Not started - Marker cursor, when dragElbows is false
- Prio 2, Not started - Fallback positions for special markers (delete, info & menu)
- Prio 1, Beta phase  - New menu item Increase elbows
- Prio 3, Not started - New menu item Bezier 
