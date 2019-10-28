
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
  _container; 
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
    this._container = this.map._container;
    console.log(this.map);
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
    // this
    this.map.addLayer(this.tracer)

  }


  __events(onoff: string){
    let onoroff = onoff || 'on'; 
    console.log(onoroff);
    if(L.version.substr(0,1 ) === '1'){      
      //Touchevents
      // L.DomEvent[onoroff](this._container, 'touchstart', this.mouseDown.bind(this));      
      document.addEventListener("touchstart", e => {
        this.mouseDown(e)})
      this.map[onoroff]('mousedown', this.mouseDown, this);
      this.map[onoroff]('zoomstart', this.zoomMoveStart, this);
    }

    L.DomEvent[ onoff ](document.body, 'mouseleave', this.mouseUpLeave.bind(this));
  }

  zoomMoveStart(){
    if(!this.creating) return;
    this.stopDraw()
  }

  mouseDown(event){ 
  
   if (event.originalEvent != null) {
    this.tracer.setLatLngs([event.latlng]);
  }
  else{
    // event.stopPropagation()
     let latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY])
     
     this.tracer.setLatLngs([latlng]);
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
    document.addEventListener("touchmove", e => {
    this.mouseMove(e)
  })
    document.addEventListener("touchend", e => {this.mouseUpLeave(e)})
    

    this.map[onoroff]('mousemove', this.mouseMove, this);
    this.map[onoroff]('mouseup', this.mouseUpLeave, this);
  }

  mouseMove(event){
    // console.log(event);
    if (event.originalEvent != null) {
      this.tracer.addLatLng(event.latlng);
    }
    else {
      
      let latlng = this.map.containerPointToLatLng([event.touches[0].clientX, event.touches[0].clientY])
      // console.log(latlng);
      this.tracer.addLatLng(latlng);
    }
    
  }

  mouseUpLeave(events){
    var latlngs = this.tracer.getLatLngs() ;
    this.stopDraw(); 

    if(latlngs.length < 3) return

    if(this.concave_polygons){
      latlngs.push(latlngs[0]);
      latlngs = new ConcaveHull(latlngs).getLatLngs();
    }
    // this.addPolygon(latlngs, true)
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
    let polys = this.LayerGroup;
        
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
    // this.LayerGroup.removeLayer( poly );
    
       this.map.removeLayer( poly );
       return;
   } 

   if (union.geometry.type === "MultiPolygon") {
       // do not union non-contiguous polys
       return;
   }

   // destroy the old, merge into new
  //  this.LayerGroup.removeLayer( poly );
       this.map.removeLayer( poly );
   newJson = union;
  });
   this.cb(newJson)

  }

  cb (newJson) {
    var _latlngs = []; 

    _latlngs = this.getLatLngsFromJSON(newJson);

    this.addLayer( this.getPolygon(_latlngs), false );
}

  addLayer(layer, noevent){
    this.LayerGroup = L.LayerGroup.prototype.addLayer.call(this,layer); 
    console.log(this.LayerGroup);
    this.layers.push(layer)
    
    if(noevent){
      return this; 
    }    
    console.log(layer);
    this.map.addLayer(layer)
  }

  

  polygonClick(layer, event){
    if (this.drawMode === 'delete') { 
      this.map.removeLayer(layer);
  }
  }

  addPolygon(latlngs,force: boolean, nomerge: boolean = false, noevent:boolean = true){
    var latLngs = force ? latlngs : this.getSimplified(latlngs);     

    if(this.merge_polygons && !nomerge && this.layers.length>0){
      this.merge(latLngs); 
      
    } else {
      this.addLayer(this.getPolygon(latLngs), noevent)
    }
  }

  getPolygon(latlngs){
    
    var polyoptions = L.extend({}, this.polygonOptions)
    
    
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
    var polys = this.LayerGroup;
    
    var newJson = polygon.toGeoJSON(); 
    var fnc = this._tryturf.bind(this, 'difference');
    
    polys.eachLayer(poly => {
      var siblingjson = poly.toGeoJSON(),
          diff = fnc(siblingjson, newJson);
    console.log("Diff: ",diff);
      if (diff === false) {
          // turf failed
          return;
      } 

      if (diff === undefined) {
          // poly was removed
          // this.LayerGroup.removeLayer( poly );
          this.map.removeLayer( poly );
          return;
      }

      if (diff.geometry.type === "MultiPolygon") {
          // poly was split into multi
          // destroy and rebuild
          this.LayerGroup.removeLayer( poly );
          this.map.removeLayer( poly );

          var coords = diff.geometry.coordinates;
          console.log(coords);
          for (var j = 0, lenj = coords.length; j < lenj; j++) {
              var polyjson = turf.polygon( coords[ j ] ),
                  latlngs = this.getLatLngsFromJSON( polyjson );
              
              this.addPolygon(latlngs, true, true, true);
          }
      } 
      else {
        console.log("Was not split");
          // poly wasn't split: reset latlngs
          poly.setLatLngs( this.getLatLngsFromJSON( diff ) );
      }
      
  })
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
    console.log(mode);
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

