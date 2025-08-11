//* map components *//

class SnappingBehaviour {
    static EXTEND = "extend"
    static TRUNCATE = "truncate"
    static CLOSEST = "closest"
    static NONE = "none"
}
class DrawingMode {
    static INITIALIZED = 0x01;
    static DRAWING = 0x02;
    static GATES = 0x03;
}
class Enclosure {
    constructor(points) {
        this.pointData = points;
        this.isCompleted = true;
        this.resetBounds()
    }
    setPointsLiteral(points) {
      this.pointData = points.map(point=>new google.maps.LatLng(point.lat,point.lng))
    }
    complete() { this.isCompleted = true; }
    completed() { return this.isCompleted; }
    getBounds() { return {};}
    resetBounds() {
        this.bounds = this.getBounds()
    }
    isClosed() {
        return this.isCompleted;
    }
    midPoint() {
        if (this.bounds==null) {
            this.bounds = this.getBounds()
        }
        return this.bounds.midPoint;
    }
    pointBetween(start,end) {
        return new google.maps.LatLng(
            (start.lat()+end.lat())/2,
            (start.lng()+end.lng())/2
        )
    }
    sideFaces(side) {
        return Enclosure.INDETERMINATE;
    }
    clear() {
        this.pointData = [];
        this.isCompleted = false
    }
    points(points=null) {
        if (points!=null) {
            this.pointData = points;
            this.resetBounds()
        }
        return this.pointData;
    }
    addPoint(point) {
        this.pointData.push(point)
        this.resetBounds()
    }
    hasPoints() {
        return this.pointData.length>0;
    }
    removeLastPoint() {
        this.pointData.pop()
        this.resetBounds()
    }
    lastPoint() {
        if (this.hasPoints()) {
            return this.pointData[this.pointData.length-1]
        }
        return null;
    }
    penultimatePoint() {

        if (this.hasPoints()) {
            return this.pointData[this.pointData.length-2]
        }
        return null;
    }
    getPoint(index) {
        return this.pointData[index]
    }
    leftOfCenter(point) {
        return point.lat()<this.midPoint().lat();
    }
    rightOfCenter(point) {
        return point.lat()>this.midPoint().lat();
    }
    northOfCenter(point) {
        return point.lng()<this.midPoint().lng();
    }
    southOfCenter(point) {
        return point.lng()>this.midPoint().lng();
    }
    distanceBetween(start,end) {
        let val = google.maps.geometry.spherical.computeDistanceBetween(start,end);
        return Math.round(val*100)
    }

    static UP = 0x01;
    static RIGHT = 0x02;
    static DOWN = 0x03;
    static LEFT = 0x04;
    static INDETERMINATE = 0x05;
    static CLOCKWISE = 0x06;
    static COUNTERCLOKWISE = 0x07;
}

class PolygonEnclosure extends Enclosure {
    getBounds() {
        let nw = new google.maps.LatLng(this.getPoint(0))
        let se = new google.maps.LatLng(this.getPoint(0))
        this.points().forEach(point=>{
            if (point.lat()<nw.lat()) {
                nw = new google.maps.LatLng(point.lat(),nw.lng())
            }
            if (point.lng()<nw.lng()) {
                nw = new google.maps.LatLng(nw.lat(),point.lng())

            }
            if (point.lat()>se.lat()) {
                se = new google.maps.LatLng(point.lat(),se.lng())
            }
            if (point.lng()>se.lng()) {
                se = new google.maps.LatLng(se.lat(),point.lng())
            }
        })

        return {
            "nw":nw,
            "se":se,
            "midPoint":this.pointBetween(nw,se)
        }
    }

    sideIsVertical(side) {
        let xDistance = Math.abs(side.start.lat()-side.end.lat())
        let yDistance = Math.abs(side.start.lng()-side.end.lng())
        return yDistance>xDistance;
    }
    sideIsHorizontal(side) {
        return !this.sideIsVertical(side)
    }

    sideFaces(sideIndex) {
        let directions = [Enclosure.UP,Enclosure.RIGHT,Enclosure.DOWN,Enclosure.LEFT]
        let sides = this.getSides()
        let firstSide = sides[0]
        let initialIndex = 0;
        if (this.sideIsVertical(firstSide)) {
            if (side.start.lng()<side.end.lng()) {

            }
        }



    }

    getSides(autoComplete=true) {
        let sides = [];
        for (let i=0;i<this.points().length;i++) {
            let start = this.getPoint(i);
            let end = null;
            if (i+1>=this.points().length) {
                if (autoComplete) {
                    end = this.getPoint(0)
                } else {
                    break;
                }

            } else {
                end = this.getPoint(i+1)
            }

            if (this.distanceBetween(start,end)>0) {
                sides.push(
                    {
                        "start":start,
                        "end":end,
                        "centerPoint":this.pointBetween(start,end),
                        "distance":this.distanceBetween(start,end)
                    }
                )
            }
        }
        return sides;
    }
}

class PolygonManager  {
    static DESKTOP = 0x01;
    static MOBILE = 0x02;
    static FULL = 0x03;
    static PARTIAL = 0x04;
    
    static SHOW_LIVE_ALWAYS = 0x05;
    static SHOW_LIVE_ADDING = 0x06;

    static RENDER_LIVE_ACTIVE = 0x07;
    static RENDER_LIVE_INACTIVE = 0x08;

    
    
    constructor(map,config,parent) {
        super()

        this.parent = parent;
        this.googleMap = map;
        this.canDropPoint = true;
        this.config = config;

        this.markers = {}
        this.completionMode = PolygonManager.PARTIAL;
        this.liveUpdateMode = PolygonManager.SHOW_LIVE_ADDING;
        this.liveUpdateStatus = PolygonManager.RENDER_LIVE_INACTIVE;
        this.mode = DrawingMode.INITIALIZED;
        this.snappingBehaviour = SnappingBehaviour.CLOSEST;
        this.contolsMode = PolygonManager.DESKTOP

        if (this.isMobile()) {
            this.contolsMode = PolygonManager.MOBILE;
        }
        
        this.minimumSideLength = parseFloat(config.segmentLength);
        this.snapTo = parseFloat(config.snapTo.value);
        this.snapToFeet = Math.round(this.snapTo/30.48);

        this.gatePolys = []
        this.gateLengths = config.gateLengths;
        this.buttons = {}
        this.pointMarkers = []
        this.windows = []
        this.gates = [];
        this.assets = {};

        this.googleMap.setOptions(
            {
                draggableCursor:"pointer"
            }
        )

        this.enclosure = new PolygonEnclosure([])

        this.livePoly = new google.maps.Polyline({
            path:[],
            geodesic: true,
            strokeColor: this.assets["line-preview-valid"].color,
            strokeOpacity: 1.0,
            strokeWeight: 2,
        })
        this.livePoly.setMap(map)

        this.previewPoly = new google.maps.Polyline({
            path:[],
            geodesic: true,
            strokeColor: this.assets["preview-perimeter"].color,
            strokeOpacity: 1.0,
            strokeWeight: 3,
            map:this.googleMap
        })

        this.permaPoly = new google.maps.Polygon({
            path:[],
            geodesic: true,
            strokeColor: this.assets["final-perimeter"].color,
            fillColor:"#00000080",
            strokeOpacity: 1.0,
            strokeWeight: 3,

        })
        this.previewPoly.setMap(map)

        google.maps.event.addListener(map,"mousemove",event=>{
            this.handleLiveUpdate(event)
        })

        google.maps.event.addListener(this.livePoly,"click",event=>{
            this.handleAddPoint(event)

        })
        google.maps.event.addListener(map,"click",event=>{
            this.handleAddPoint(event)
        })

        document.addEventListener("srd:map:drawing:restart",event=>{
            this.startDrawing()
        })
          document.addEventListener("srd:map:geometry:set",event=>{
            this.loadGeometry(event.detail)
        })

        config.assets.forEach(asset=>{
          this.assets[asset.key] = {
            color: asset.color,
            description: asset.description,
            image:asset.image?asset.image.image.url:null,
            name:asset.name,
            showInLegend: asset.showInLegend && asset.showInLegend!="false"
          }
        })
        
        this.googleMap.setOptions(
            {
                zoomControl:true,
                zoomControlOptions:{
                    position:google.maps.ControlPosition.BLOCK_END_INLINE_START
                }
            }
        
        )
        

        this.showHowTo();  
    }
    
    isMobile() {
        return false
    }

    /* geometry functions */

    loadGeometry(geometry) {
      this.enclosure.setPointsLiteral(geometry.enclosure)
      this.googleMap.setOptions({
        center:new google.maps.LatLng(geometry.centerPoint.lat,geometry.centerPoint.lng),
        zoom:geometry.zoom,
      })
      this.endDrawing(false)
    }
    generateGeometry() {
      
      let sides = this.getSides();
      let centerPoint = this.googleMap.getCenter()
      let returnValue = {
            sides:sides,
            pixels:[],
            points: this.enclosure.points().length,
            enclosure: this.enclosure.points().map(point=>{return {lat:point.lat(),lng:point.lng()}}),
            zoom:this.googleMap.getZoom(),
            centerPoint:{lat:centerPoint.lat(),lng:centerPoint.lng()},
            mode:"advanced"
        };
      return returnValue;
    }
    broadcastGeometry() {
        SrD.dispatchEvent(
          "srd:mapdrawer:geometry:updated",
          JSON.parse(JSON.stringify(this.generateGeometry()))
        )
    }
    finalize() {
        SrD.dispatchEvent(
           "srd:mapdrawer:finished",
            this.generateGeometry()
        )
    }

    getSides() { 
        let sides =  this.enclosure.getSides(this.completionMode == PolygonManager.FULL && this.enclosure.isClosed())       
        return sides;
    }
    points() { return this.enclosure.points()}
    getPoint(index) { return this.enclosure.getPoint(index)}
    lastPoint() { return this.enclosure.lastPoint()}
    penultimatePoint() { return this.enclosure.penultimatePoint()}
  
    getAngle(start,end) {
        return google.maps.geometry.spherical.computeHeading(start,end);
    }
    midPoint(start,end) {
        return new google.maps.LatLng(
            (start.lat()+end.lat())/2,
            (start.lng()+end.lng())/2
        )
    }
    clearWindows() {
        this.windows.forEach(window=>window.close())
        this.windows = []
    }
    distanceBetween(start,end) {
        let val = google.maps.geometry.spherical.computeDistanceBetween(start,end);
        return Math.round(val*100)
    }
    toFeet(value) {
        return Math.round((value/100)*3.28);

    }
    toSnappedFeet(value) {
        let distance = this.toFeet(value)
        let leftoverDistance = distance % this.snapToFeet;
        switch(this.snappingBehaviour) {
            case SnappingBehaviour.EXTEND:
                distance+=(this.snapToFeet-leftoverDistance)
                break;
            case SnappingBehaviour.TRUNCATE:
                distance-=leftoverDistance;
                break;
            case SnappingBehaviour.CLOSEST:
                if (leftoverDistance<=(this.snapToFeet/2)) {
                    distance-=leftoverDistance;
                } else {
                    distance+=(this.snapToFeet-leftoverDistance)
                }
                break;
        }
        

        return distance
    }
    toCentimeters(value) {
        return Math.round(value*30.48)
    }
    distanceBetweenInFeet(start,end) {
        let value = (this.distanceBetween(start,end)/100)*3.28;
        return Math.round(value)
    }
    getEndpoint(start,distance,angle) {
        return google.maps.geometry.spherical.computeOffset(start,distance/100,angle)
    }

     /* fraewing functions */


     startDrawing() {
        this.hideButtons()
        
        this.clearWindows()
        this.clearMarkers()
        this.mode = DrawingMode.DRAWING;
        this.canDropPoint = true;
        this.googleMap.setOptions(
            {
                draggableCursor:'crosshair'
            }
        )
        this.liveUpdateStatus = PolygonManager.RENDER_LIVE_ACTIVE;
        this.canDropPoint = true; 
        this.clearPolygons(this.permaPoly,this.previewPoly,this.livePoly)
        this.enclosure.clear()
        this.broadcastGeometry();
    }
    endDrawing(showGatePopup=true) {
        this.clearWindows()
        this.mode = DrawingMode.INITIALIZED;
        
        this.clearPolygons(this.previewPoly,this.livePoly)
        this.clearMarkers()
        this.renderPermaPoly()
        this.broadcastGeometry()
    }
    handleAddPoint(event) {
        if (this.mode!=DrawingMode.DRAWING) {
            return
        }
        if (this.liveUpdateMode==PolygonManager.SHOW_LIVE_ADDING) {
          if (this.liveUpdateStatus==PolygonManager.RENDER_LIVE_INACTIVE) {
            if (this.points().length>2)
            return;
          }  
        }
        
        let droppedPoint = event.latLng
        if (this.canDropPoint) {
            if (this.lastPoint()) {
                let segmentLength = this.distanceBetween(this.lastPoint(),droppedPoint)
                let segmentLengthAdjusted = this.adjustedLength(this.lastPoint(),droppedPoint)
                let angle = this.getAngle(this.lastPoint(),droppedPoint)
                let potentialEndpoint = this.getEndpoint(this.lastPoint(),segmentLengthAdjusted,angle)
                droppedPoint = potentialEndpoint
                if (this.liveUpdateMode==PolygonManager.SHOW_LIVE_ADDING) {
                  this.liveUpdateStatus = PolygonManager.RENDER_LIVE_INACTIVE;
                }
                this.canDropPoint = false;
            } else {
                if (this.liveUpdateMode==PolygonManager.SHOW_LIVE_ADDING) {
                  this.liveUpdateStatus = PolygonManager.RENDER_LIVE_ACTIVE;
                }
            }
            this.enclosure.addPoint(droppedPoint)
            this.broadcastGeometry();
            this.clearMarkers("live")
            this.renderPreviewPoly()
        }
    }
   


    renderPreviewPoly() {

        this.renderPoly(this.previewPoly,"preview")
    }
    
   
    renderPermaPoly() {
        this.clearPolygons(this.previewPoly)
        this.previewPoly.setMap(null)
        this.renderPoly(this.permaPoly,"permanent")
    }

    
    clearPolygons() {
        Array.from(arguments).forEach(polygon=>{
            polygon.setPath([])
        })
    }
    
    renderPoly(polyObject,markerType) {

        polyObject.setPath(this.points())
        polyObject.setMap(this.googleMap)
        this.clearMarkers(markerType,"preview-delete","preview-add")
        

        if (this.mode==DrawingMode.DRAWING && !this.polygonComplete) {
            for (let i=0;i<this.points().length-1;i++) {
                
                let marker = this.createIconMarker(this.enclosure.getPoint(i),(i==0)?this.assets["first-corner"].image:this.assets.corner.image)
                this.markers[markerType].push(marker)
                if (i==0) {
                    google.maps.event.addListener(marker,"click",event=>{
                        this.enclosure.addPoint(new google.maps.LatLng(this.getPoint(i)))
                        this.enclosure.complete()
                        this.endDrawing()
                    })
                }
                
            }

            if (this.points().length==1 || this.liveUpdateMode==PolygonManager.SHOW_LIVE_ALWAYS) {
              this.markers["preview-delete"].push(
                this.createDeleteMarker(
                  this.lastPoint()
                )
              )
              
            } else {
              let lastPoint = this.lastPoint();
              let penultimatePoint = this.penultimatePoint();
              let deletePlacementPoint = 
              this.markers["preview-delete"].push(
                this.createDeleteMarker(
                  this.getEndpoint(
                    penultimatePoint,
                    this.distanceBetween(penultimatePoint,lastPoint)*.8,
                    this.getAngle(penultimatePoint,lastPoint)
                  )
                )
              )
              this.markers["preview-add"].push(
                this.createAddPointMarker(
                  this.lastPoint()
                )  
              )
            }
            /*
            
          */
        }
        this.getSides().forEach((side,index)=>{

            let angle = this.getAngle(side.start,side.end);
            let anchorPoint = this.getEndpoint(side.start,this.distanceBetween(side.start,side.end)/4,angle)
            
            let marker = this.createTextMarker(anchorPoint,`${this.toSnappedFeet(this.distanceBetween(side.start,side.end))}ft`)
            this.markers[markerType].push(marker)
        })
    }

    /* marker/button functions */
    createDeleteMarker(endPoint) {
        let marker = this.createIconMarker(endPoint,this.assets.delete.image)
            
        google.maps.event.addListener(marker,"click",event=>{
          this.enclosure.removeLastPoint()
          if (this.points().length<1) {
            marker.setMap(null)
            this.canDropPoint = true;
            this.clearMarkers("live")
                    
          } else {
            if (this.points().length==1) {
                this.liveUpdateStatus = PolygonManager.RENDER_LIVE_ACTIVE;
                this.canDropPoint = false;
            } else {
              if (this.liveUpdateMode==PolygonManager.SHOW_LIVE_ADDING) {
                this.liveUpdateStatus = PolygonManager.RENDER_LIVE_INACTIVE;
                this.canDropPoint = false;  
              }
            }
            
            this.livePoly.setPath([])
            this.renderPreviewPoly()
                      
        }
  
      })
      return marker
    }
    createAddPointMarker(endPoint) {
        let marker = this.createIconMarker(endPoint,this.assets["add-side"].image)
        google.maps.event.addListener(marker,"click",event=>{
          this.canDropPoint = true;
          this.liveUpdateStatus = PolygonManager.RENDER_LIVE_ACTIVE;

      })
      return marker
    }
    createTextMarker(point,text) {
        let textElement = document.createElement("div")
        textElement.textContent = text;
        textElement.classList.add("annotation")
        return this.createMarker(point,textElement,google.maps.CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY)
    }
    createIconMarker(point,src) {
        let icon = document.createElement("img");
        icon.src = src;
        return this.createMarker(point,icon,google.maps.CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL)
    }
    createMarker(point,element,behavior) {
        let marker = new google.maps.marker.AdvancedMarkerElement(
            {
                map:this.googleMap,
                content:element,
                position:point,
                collisionBehavior:behavior,
            }
        )
        marker.content.style.transform = 'translateY(50%)'
        return marker
    }

    hideButtons() {
        this.parent.locationSearch.style.display="none";
        
        [google.maps.ControlPosition.RIGHT_TOP,google.maps.ControlPosition.RIGHT_BOTTOM].forEach(placement=>{
          while (this.googleMap.controls[placement].length>0) {
            this.googleMap.controls[placement].pop()
          }  
        })    
      }
      showButtons() {
        this.hideButtons()
        Array.from(arguments).forEach(button=>{
          this.googleMap.controls[this.buttons[button].placement].push(this.buttons[button].button)
        });
        this.parent.locationSearch.style.display="block";
      }
    createButton(text) {
        let button = document.createElement("button");
        button.classList.add("google-maps-button")
        button.innerHTML = text;
        return button;
    }

    clearMarkers() {
        Array.from(arguments).forEach(which=>{
            if (this.markers[which]) {
                if (!Array.isArray(this.markers[which])) {
                  this.markers[which].forEach(multiside=>multiside.forEach(marker=>marker.setMap(null)))
                } else {
                  this.markers[which].forEach(marker=>{
                    try {
                      marker.setMap(null)
                    } catch(e) {
                      
                    }
                  })
                  this.markers[which] = []
                }
                
            }
        })
    }
    clearGateMarkers() {
      
      for(let side=0;side<this.markers.gates.length;side++) {
        if (this.markers.gates[side]) {
          this.markers.gates[side].forEach(marker=>{
            marker.setMap(null)
          })
        }
      }

      this.markers.gates = []
    }

    setGateMarker(sideIndex,gateIndex,value) {
      
        if (!this.markers.gates[sideIndex]) {
          this.markers.gates[sideIndex] = []
        }
        this.markers.gates[sideIndex][gateIndex]=value;
      }
      orientMarkerToSide(segment,marker) {
        let angle = this.getAngle(segment.start,segment.end);
          if (angle<0) {
              angle+=360;
          }
          if (this.enclosure.rightOfCenter(new google.maps.LatLng(marker.position.lat,marker.position.lng))) {
              angle+=90
          } else {
              angle+=90;
          }
  
          marker.content.style.transformOrigin = "center"
          marker.content.classList.add("google-maps-gate-icon")
          marker.content.style.transform = ` translateY(50%) rotate(${angle}deg)`
          
      }
   
    
    /* windows */

    windowTitle(text) {
      let span = document.createElement("span")
      span.classList.add("google-maps-window-title");
      span.textContent = text;
      return span;
    }

    showAddGatesPopup() {
      this.hideButtons();
      let popupContent = document.createElement("div");
      popupContent.classList.add("google-maps-howto")
      
      popupContent.innerHTML = `${SrDConfigurableText.textFor("add-gates-popup-text").split("\n").map(line=>`<p>${line}</p>`).join('')}`
      
      this.addGatesWindow = new google.maps.InfoWindow({
            position:this.googleMap.getCenter(),
            content:popupContent,
            ariaLabel: SrDConfigurableText.textFor("add-gates-popup-header","Add Gates"),
            headerContent:this.windowTitle(SrDConfigurableText.textFor("add-gates-popup-header","Add Gates")),
            zIndex:10000000

        });
        google.maps.event.addListener(this.addGatesWindow,"close",event=>{
          this.addGatesWindow = null;
        })
        window.setTimeout(()=>{
          if (this.addGatesWindow) {
            this.addGatesWindow.close()
          }
        },1000)
        this.addGatesWindow.open(this.googleMap)      
    }
    clearActiveWindow() {
      if (this.activeWindow) {
        this.activeWindow.close();
        this.activeWindow = null;
      }
    }
    showHowTo() {
      
        if (this.howToWindow) {
          return;
        }
        this.hideButtons();
        let infoDiv = document.createElement("DIV")
        infoDiv.classList.add("google-maps-howto")
        
        let renderTextContent = (node)=>{
          
          return `
              <div class="section-header">${node.title}</div>
              <div class="howto-body">${node.content}</div>
            `
        }
        let renderVideoContent = (node)=>{
          return `
            <div class="section-header">${node.title}</div>
            <div class="instruction-video">
              <video poster="${node.titleCard.image.url}" controls class="howto-video">
                ${node.video.sources.map(source=>`<source src="${source.url}" type="${source.type}"/>`).join("")}
              </video>
            </div>
          `
        }
      
        infoDiv.innerHTML = `
          <div class="section-header">${SrDConfigurableText.textFor('completion-mode-header')}</div>
          <div class="mode-buttons">
            <button class="google-maps-button small partial-mode ">${SrDConfigurableText.textFor('completion-mode-draw')}</button>
            <button class="google-maps-button small basic-mode">${SrDConfigurableText.textFor('completion-mode-basic')}</button>
          </div>
          <div class="instructions">
            ${this.instructions.map(entry=>entry.video?renderVideoContent(entry):renderTextContent(entry)).join('')}
          </div>
          <div class="section-header">${SrDConfigurableText.textFor('legend')}</div>
          <div class="legend">
            ${Object.values(this.assets).filter(asset=>asset.showInLegend).map(asset=>`
          <div class="legend-row">
            <div class="legend-image"><img src="${asset.image}"></div>
            <div class="legend-text">${asset.description}</div>
          </div>
        `).join("")}
          </div>
        `
        this.howToWindow = new google.maps.InfoWindow({
            position:this.googleMap.getCenter(),
            content:infoDiv,
            ariaLabel: SrDConfigurableText.textFor("howto-popup","How-to"),
            headerContent:this.windowTitle(SrDConfigurableText.textFor("howto-popup","How-to")),
            zIndex:10000000

        });
        google.maps.event.addListener(this.howToWindow,"close",event=>{
          this.howToWindow = null;
          this.startDrawing()
        })
      
        
        infoDiv.querySelector(".partial-mode").addEventListener("click",event=>{
          this.completionMode = PolygonManager.PARTIAL;
          this.howToWindow.close()
        })
      
        infoDiv.querySelector(".basic-mode").addEventListener("click",event=>{
          event.preventDefault();
          event.stopPropagation();
          SrD.dispatchEvent(
            "srd:mapdrawer:setMode",
            "basic"
          )
        })
        
        this.howToWindow.open(this.googleMap)
    }

   

    addGatePopup(anchorPoint,sideIndex) {
        let frag = document.createDocumentFragment()
        let holderDiv = document.createElement("DIV")

        holderDiv.innerHTML = `
        <div class="google-maps-fence-selector">
            ${Object.keys(this.gateLengths).map(gateLength=>`
              <div class="gate-selector-button">
                <button data-option="ten-foot" class="google-maps-button small" data-length="${gateLength}">${gateLength}' Gate</button>
            </div>  
            `).join("\n")}
        </div>
        <div class="gate-selector-cancel">
                <button data-option="cancel" class="google-maps-button small">Cancel</button>
        </div>
        `

        let gateInfoWindow = new google.maps.InfoWindow({
            content:holderDiv,
            position:anchorPoint,
            ariaLabel: SrDConfigurableText.textFor('select-gate-header'),
            headerContent:this.windowTitle(SrDConfigurableText.textFor('select-gate-header'))

        });
        this.windows.push(gateInfoWindow)
        gateInfoWindow.open(this.googleMap)

        let infoWindowContent = gateInfoWindow.getContent();
        infoWindowContent.querySelectorAll("[data-length]").forEach(lengthSelector=>{
          lengthSelector.addEventListener("click",event=>{
            gateInfoWindow.close()
            this.selectGate(anchorPoint,sideIndex,parseInt(lengthSelector.dataset.length))  
          })
          
        })
        infoWindowContent.querySelector('[data-option="cancel"]')
          .addEventListener("click",event=>{
            gateInfoWindow.close()
          });
    }
    removeGatePopup(anchorPoint,sideIndex,gateIndex) {
        
        let holderDiv = document.createElement("DIV")

        holderDiv.innerHTML = `
        <div class="google-maps-fence-selector">
            <div class="gate-remover-button">
                <button data-option="remove-gate" class="google-maps-button small">${SrDConfigurableText.textFor('remove-gate-header')}</button>
            </div>
            <div class="gate-selector-button">
                <button data-option="cancel" class="google-maps-button small">Cancel</button>
            </div>
        `
        let gateInfoWindow = new google.maps.InfoWindow({
            content:holderDiv,
            position:anchorPoint,
            ariaLabel: SrDConfigurableText.textFor('remove-gate-header'),
            headerContent:this.windowTitle(SrDConfigurableText.textFor('remove-gate-header'))

        });
        this.windows.push(gateInfoWindow)
        gateInfoWindow.open(this.googleMap)
        holderDiv.querySelector('[data-option="remove-gate"]')
            .addEventListener("click",event=>{
                gateInfoWindow.close()
                this.removeGate(sideIndex,gateIndex)

            });
            holderDiv.querySelector('[data-option="cancel"]')
            .addEventListener("click",event=>{
                gateInfoWindow.close()
        });
    }
    removeGate(sideIndex,gateIndex) {
        this.setGate(sideIndex,gateIndex,null)
        let sides = this.getSides()
        
        let gate = this.markers["gates"][sideIndex][gateIndex];
        gate.setMap(null)
        this.broadcastGeometry()
    }
    selectGate(anchorPoint,sideIndex,length) {
        let sides = this.getSides()
        let gateSide = this.getSides()[sideIndex]
        let gateIndex = this.gates[sideIndex]?this.gates[sideIndex].length:0;
        
        this.setGate(sideIndex,gateIndex,length)
        let assetId = "gate-10"
        if (length<10) {
          assetId = "gate-4"
        }
        let gateMarker = this.createIconMarker(
          anchorPoint,
          this.assets[assetId].image
        );
        google.maps.event.addListener(gateMarker,"click",event=>{
            this.removeGatePopup(anchorPoint,sideIndex,gateIndex)
        })
        this.setGateMarker(sideIndex,gateIndex,gateMarker)
        this.orientMarkerToSide(gateSide,gateMarker)
        
        this.broadcastGeometry()


    }
    


    adjustedLength(start,end) {
        let lineDistance = this.distanceBetween(start,end)
        let startingLineDistance = lineDistance;
        
        let leftoverDistance = lineDistance % this.snapTo
        switch(this.snappingBehaviour) {
            case SnappingBehaviour.EXTEND:
                lineDistance+=(this.snapTo-leftoverDistance)
                break;
            case SnappingBehaviour.TRUNCATE:
                lineDistance-=leftoverDistance;
                break;
            case SnappingBehaviour.CLOSEST:
                if (leftoverDistance<=(this.snapTo/2)) {
                    lineDistance-=leftoverDistance;
                } else {
                    lineDistance+=(this.snapTo-leftoverDistance)
                }
                break;
        }

        return lineDistance;
    }
    handleLiveUpdate(event) {

        if (this.mode!=DrawingMode.DRAWING) {
            return;
        }
        if (this.liveUpdateMode==PolygonManager.SHOW_LIVE_ADDING) {
          if (this.liveUpdateStatus!=PolygonManager.RENDER_LIVE_ACTIVE) {
            return
          }
        }
        

        if (this.points().length<1) {
            return [this.lastPoint(),event.latLng]
        }
        this.clearMarkers("live")
        let livePoints = [this.lastPoint(),event.latLng];
        if (this.completionMode == PolygonManager.FULL) {
          livePoints.push(this.getPoint(0))
        }
        this.livePoly.setPath(new google.maps.MVCArray(livePoints));
        this.livePoly.setMap(this.googleMap)
        let lineDistance = this.distanceBetween(this.lastPoint(),event.latLng)
        let lineDistanceToClose = this.distanceBetween(event.latLng,this.getPoint(0))
        let finishMidpoint = this.midPoint(event.latLng,this.getPoint(0))
        let angle = this.getAngle(this.lastPoint(),event.latLng)
        let anchorPoint = this.midPoint(this.lastPoint(),event.latLng)

        if (lineDistance<this.minimumSideLength) {
            this.canDropPoint = false
            this.livePoly.setOptions({strokeColor:this.assets["line-preview-invalid"].color})
        } else {
            this.canDropPoint = true
            this.livePoly.setOptions({strokeColor:this.assets["line-preview-valid"].color})
        }
        if (this.canDropPoint) {
            
            if (this.showliveMarkers || true) {
              if (!this.liveMarkerWait) {
                this.liveMarkerWait = true;
                setTimeout(()=>{
                    this.liveMarkerWait = false;
                    this.markers["live"].push(this.createTextMarker(anchorPoint,`${this.toSnappedFeet(lineDistance)}ft`))
                    if (this.completionMode == PolygonManager.FULL) {
                      this.markers["live"].push(this.createTextMarker(finishMidpoint,`${this.toSnappedFeet(lineDistanceToClose)}ft`))
                    }
                },20);
              }  
            }
            
        }
    }
}

class SrDInteractiveMap extends SrD {
    constructor(options) {
        super(options)
        this.markers = []
        this.position = {
            "latitude":45.52003730373199,
            "longitude":-122.66034053594124
        }

        this.loadData()

    }
    loadData() {
        if (this.snapToPosition()) {
            navigator.geolocation.getCurrentPosition(
                (pos)=>{

                    this.position = {
                        "latitude":pos.coords.latitude,
                        "longitude":pos.coords.longitude,
                    }
                    this.setupMap()
                },
                (error)=>{
                    console.error(error)
                    this.setupMap()
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                  }
            );
        }

    }
    injectionPoint() {
        return document.querySelector(".google-map-holder")
    }
    autoComplete(event) {

        var places = this.searchBox.getPlaces();
        if (places.length == 0) {
        return;
        }
        this.markers.forEach(marker=>marker.setMap(null))
        this.markers = [];
        var bounds = new google.maps.LatLngBounds();
        places.forEach(place=>{
            let marker = new google.maps.Marker({
                map: this.map,
                icon: {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                },
                title: place.name,
                position: place.geometry.location
            })
            bounds.extend(place.geometry.location)
            this.markers.push(marker)

        });
        this.map.fitBounds(bounds);
    }
    setupMap() {
        let root = this.injectionPoint();
        let map = document.createElement("DIV")
        map.id = "google-map"
        map.classList.add("google-map")
        root.appendChild(map)
        var srdMapType = new google.maps.StyledMapType([  ], {
            name: 'Map'
        });
        var srdMapStyle = 'srd-maps';

        this.map = new google.maps.Map(map, {
            center: new google.maps.LatLng(this.position.latitude,this.position.longitude),
            zoom: 14,
            tilt:0,
            rotateControl: false,
            mapTypeId:"satellite",
            mapId:this.config.googleMapId,
            //mapId:"dd5b42e1f0e1dd7c",
            fullscreenControl: false,
            disableDefaultUI:true,
            styles:[
                {
                    elementType: "labels.icon",
                    stylers: [{ visibility: "off" }],
                  }
            ]
        })

        let locationSearch = document.createElement("input")
        locationSearch.classList.add("google-maps-search-box")
        locationSearch.type = "text"
        locationSearch.placeholder = this.textFor('location-search-placeholder');

        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(locationSearch);
        this.searchBox = new google.maps.places.SearchBox((locationSearch));
        google.maps.event.addListener(this.searchBox, 'places_changed', event=>{
            this.autoComplete(event)
        });



    }

}

class SrDPolygonMap extends SrDInteractiveMap {
    setupMap() {
        super.setupMap();
        
        this.shapeManager = new PolygonManager(this.map,this.config.config)
    }
}
