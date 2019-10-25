
import { FeatureGroup, Marker } from "leaflet";
import * as L from "leaflet";
import * as turf from "@turf/turf";

import * as ConcaveHull from "concavehull"

export interface IPolyDrawOptions {
  mode?: number;
  smoothFactor?: number;
  polyline?: Object; 
  elbowDistance?: number;
  simplifyFactor?: number;
  mergePolygons?: boolean;
  concavePolygon?: boolean;
  maximumPolygons?: number;
  notifyAfterEditExit?: boolean;
  leaveModeAfterCreate?: boolean;
  strokeWidth?: number;
}
export const defaultOptions: IPolyDrawOptions = {
  
  smoothFactor: 0.3,
  elbowDistance: 10,
  simplifyFactor: 1.1,
  mergePolygons: true,
  concavePolygon: true,
  maximumPolygons: Infinity,
  notifyAfterEditExit: false,
  leaveModeAfterCreate: false,
  strokeWidth: 2
};
/* export const instanceKey = Symbol("freedraw/instance");
export const modesKey = Symbol("freedraw/modes");
export const notifyDeferredKey = Symbol("freedraw/notify-deferred");
export const edgesKey = Symbol("freedraw/edges"); */


export default class PolyDraw extends FeatureGroup {
  map: L.Map;
  options: IPolyDrawOptions;
  polyLineOptions = {  
      color:'#5cb85c',
      opacity:1,
      smoothFactor: 0,
      noClip : true,
      clickable : false,
      weight:2
  
  }
  newJson;
  polygonOptions = {
    className: 'leaflet-free-hand-shapes',
    smoothFactor: 1,
    // fill:false,
    fillOpacity : 0.5,
    noClip : true,
  }
  Polygon: L.Polygon; 
  drawMode: string = "";
  simplify_tolerance: number = 0.005; 
  merge_polygons: boolean= true
  concave_polygons: boolean = true
  creating: boolean = false;
  defaultPreferences; //Trenger en Interface
  LayerGroup: L.LayerGroup;
  layers:L.LayerGroup[] = [];

  tracer = L.polyline([[0,0]], L.extend({}, this.polyLineOptions));

  constructor(options: IPolyDrawOptions = defaultOptions) {
    super();
    this.options = { ...defaultOptions, ...options };
  }

  onAdd(map: L.Map) {
    var _this = this; 
    this.map = map;

    this.defaultPreferences = {
      dragging: this.map.dragging._enabled,
      doubleClickZoom: this.map.doubleClickZoom._enabled,
      scrollWheelZoom: this.map.scrollWheelZoom._enabled
  }

  this.Polygon = L.Polygon.extend({
    getGroup : function () {
        return _this;
    },
    destroy : function () {
        this.map.removeLayer(this);
    },
    onAdd : function (_map) {
        this.on('click', this._onClick, this);
        L.Polygon.prototype.onAdd.call(this, _map);
    },
    _onClick : function (e) {
        _this.polygonClick(this, e);
    }
});

    // Set the mouse events.
    this.__events('on');
    this.map.addLayer(this.tracer)

  }


  __events(onoff: string){
    let onoroff = onoff || 'on'; 

    if(L.version.substr(0,1 ) === '1'){
      this.map[onoroff]('mousedown touchstart', this.mouseDown, this);
      this.map[ onoff ]('zoomstart movestart', this.zoomMoveStart, this);
    }
  }

  zoomMoveStart(){
    if(!this.creating) return;
    this.stopDraw()
  }

  mouseDown(event){
    let rightClick = 2,
    originalEvent = event.originalEvent; 
    
   if(L.Path.CANVAS){
     console.log("L.Path");
    this.tracer._leaflet_id = 0;
    L.stamp(this.tracer);
    this.map.addLayer(this.tracer)
   }

   this.tracer.setLatLngs([event.latlng]);

   if(!L.Path.CANVAS){
     this.tracer.bringToFront();
   }

   this.startDraw()
  }

  startDraw(){
    this.creating = true; 
    this.drawStartedEvents('on');
    this.setMapPermissions('disable')
  }

  stopDraw(){
    this.creating = false; 
  this.resetTracker(); 
  this.drawStartedEvents('off');
  this.setMapPermissions('enable')    
  }

  drawStartedEvents(onoff: string){
    let onoroff = onoff || 'on';

    this.map[onoroff]('mousemove touchmove', this.mouseMove, this);
    this.map[onoff]('mouseup touchend', this.mouseUpLeave, this);
  }

  mouseMove(event){
    
    this.tracer.addLatLng(event.latlng)
  }

  mouseUpLeave(){
    //Hvis denne er utkommentert så kan vi ikke få tegnet ut polygonene slik personen har tegnet dem: 
    //var latlngs = this.getSimplified( this.tracer.getLatLngs() );
    var latlngs = this.tracer.getLatLngs() ;
    this.stopDraw(); 

    if(latlngs.length < 3) return

    if(this.concave_polygons){
      latlngs.push(latlngs[0]);
      latlngs = new ConcaveHull(latlngs).getLatLngs();
    }
    this.addPolygon(latlngs, true)
    if(this.drawMode === 'add'){
      this.addPolygon(latlngs, true)
    } else if(this.drawMode === 'subtract'){
      this.subtractPolygon(latlngs,true)
    }
  }

  getCoordsFromLatLngs(latlngs) {
    
    var coords = [L.GeoJSON.latLngsToCoords(latlngs)];
  
    coords[0].push(coords[0][0]);
  
    return coords;
  }

  getLatLngsFromJSON(json) {
    console.log(json);
    var coords = json.geometry ? json.geometry.coordinates : json;
    return L.GeoJSON.coordsToLatLngs(coords, 1, L.GeoJSON.coordsToLatLng);
  }


  _tryturf(method, a, b) {
    var fnc = turf[method];
    try {
      return fnc(a, b);
    } catch (_) {
      // buffer non-noded intersections
      try {
        return fnc(turf.buffer(a, 0.000001), turf.buffer(b, 0.000001));
      } catch (_) {
        // try buffering again
        try {
          return fnc(turf.buffer(a, 0.1), turf.buffer(b, 0.1));
        } catch (_) {
          // try buffering one more time
          try {
            return fnc(turf.buffer(a, 1), turf.buffer(b, 1));
          } catch (e) {
            // give up
            console.error("turf failed", a, b, e);
            return false;
          }
        }
      }
    }
  }

  merge(latlngs){
    let newJson = turf.buffer(turf.polygon(this.getCoordsFromLatLngs(latlngs)), 0);
    console.log(this.LayerGroup);
    let polys = this.LayerGroup;
    
    console.log("layers: ", this.layers);
    let fnc = this._tryturf.bind(this, 'union')
    polys.eachLayer(poly => {
      let element = poly.toGeoJSON()
    
    var siblingjson = element,
       union;

   if (!turf.intersect(newJson, siblingjson)) {
       return;
   }

   union = fnc(newJson, siblingjson);

   if (union === false) {
    this.LayerGroup.removeLayer( poly );
    
       this.map.removeLayer( poly );
       return;
   } 

   if (union.geometry.type === "MultiPolygon") {
       // do not union non-contiguous polys
       return;
   }

   // destroy the old, merge into new
    
       this.map.removeLayer( poly );
   newJson = union;
  });
   this.cb(newJson)

  }

  cb (newJson) {
    var _latlngs = []; 

    console.log("newJson: ",newJson);
    _latlngs = this.getLatLngsFromJSON(newJson);
    console.log("merge",_latlngs);
    this.addLayer( this.getPolygon(_latlngs), false );
}

  addLayer(layer, noevent){
    this.LayerGroup = L.LayerGroup.prototype.addLayer.call(this,layer); 
    this.layers.push(layer)
    console.log(layer);
    if(noevent){
      return this; 
    }
    console.log(); 
    
    this.map.addLayer(layer)
  }

  

  polygonClick(layer, event){
    if (this.drawMode === 'delete') { 
      this.map.removeLayer(layer);
  }
  }

  addPolygon(latlngs,force: boolean, nomerge: boolean = false, noevent:boolean = true){
    var latLngs = force ? latlngs : this.getSimplified(latlngs); 

    console.log(latLngs, force, nomerge, noevent);

    if(this.merge_polygons && !nomerge && this.layers.length>0){
      this.merge(latlngs); 
      
    } else {
      this.addLayer(this.getPolygon(latLngs), noevent)
    }
  }

  getPolygon(latlngs){
    if(this.LayerGroup != null)
    console.log("layerGroup: ",this.LayerGroup.toGeoJSON());
    // const marker = 
    var polyoptions = L.extend({}, this.polygonOptions)
    this.addMarker(latlngs)
    console.log(new L.Polygon(latlngs,polyoptions));
    return new L.Polygon(latlngs,polyoptions)
  }

  addMarker(latlngs){
    latlngs.forEach(latlng => {
      // L.LayerGroup.prototype.addLayer.call(this,new Marker(latlng).addTo(this.map));
      
    });
  }

  subtractPolygon(latlngs, force){
    var latLngs = force ? latlngs: this.getSimplified(latlngs); 
    var polygon = new L.Polygon(latLngs)

    this.subtract(polygon)
  }

  subtract(polygon){
    var polys = this.map.getLayers();
    var newJson = polygon.toGeoJson(); 
    var fnc = this._tryturf.bind(this, 'difference');
    
    for (var i = 0, len = polys.length; i < len; i++) {
      var poly = polys[i],
          siblingjson = poly.toGeoJSON(),
          diff = fnc(siblingjson, newJson);

      if (diff === false) {
          // turf failed
          continue;
      } 

      if (diff === undefined) {
          // poly was removed
          this.map.removeLayer( poly );
          continue;
      }

      if (diff.geometry.type === "MultiPolygon") {
          // poly was split into multi
          // destroy and rebuild
          this.map.removeLayer( poly );

          var coords = diff.geometry.coordinates;

          for (var j = 0, lenj = coords.length; j < lenj; j++) {
              var polyjson = turf.polygon( coords[ j ] ),
                  latlngs = this.getLatLngsFromJSON( polyjson );
              this.addPolygon(latlngs, true, true, true);
          }
      } else {
          // poly wasn't split: reset latlngs
          poly.setLatLngs( this.getLatLngsFromJSON( diff ) );
      }
  }
  }

  getSimplified(latLngs){
    var latlngs = latLngs || [],
    points, 
    simplified, 
    tolerance = this.simplify_tolerance; 

    if(latlngs.length && tolerance){
      points = latlngs.map(function(a){
        return {x: a.lat, y: a.lng}
      })

      simplified = L.LineUtil.simplify(points, tolerance); 

      latlngs = simplified.map(function (a) {
        return {lat: a.x, lng: a.y}
      });
    }
    return latlngs
  }

  setMapPermissions(method: string){
    let preferences = this.defaultPreferences; 

    this.map.dragging[method]();
    this.map.doubleClickZoom[method]()
    this.map.scrollWheelZoom[method]()

    if(method === 'enable'){
      if(!preferences.dragging){
        this.map.dragging.disable();
      }

      if(!preferences.doubleClickZoom){
        this.map.doubleClickZoom.disable();
      }

      if(!preferences.scrollWheelZoom){
        this.map.scrollWheelZoom.disable();
      }

    } else {

    }
  }

  setMode(mode:string){
    var mode = mode || 'view'

    mode = mode.toLowerCase(); 

    this.drawMode = mode; 

  /*   this.fire('mode', {
      mode: mode
    }) */

    if(mode === 'subtract'){
      this.tracer.setStyle({
        color: '#9534f'
      })
    }
    else if(mode === 'add'){
      this.tracer.setStyle({
        color: this.polyLineOptions.color
      })
    }

    if (!this.map) {
      return;
  }

  if (mode === 'add' || mode === 'subtract') {
      this.map.dragging.disable();
  } else {
      this.map.dragging.enable();
  }
  this.setMapClass();
  }

  setMapClass(){
    var map = this.map._container; 
  var util = L.DomUtil; 
  var removeClass = util.removeClass;

  removeClass(map, 'leaflet-fhs-add');
        removeClass(map, 'leaflet-fhs-subtract');
        removeClass(map, 'leaflet-fhs-delete');
        removeClass(map, 'leaflet-fhs-view');

        util.addClass(map, 'leaflet-fhs-' + this.drawMode);
  }

  resetTracker(){
    this.tracer.setLatLngs([[0,0]]);
  }
}

export const freeDraw = options => {
  return new PolyDraw(options);
};

