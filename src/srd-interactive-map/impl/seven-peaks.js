class SevenPeaksInteractiveMap extends SrDInteractiveMap {
    constructor(options) {
        super(options)
        this.position = {
            "latitude":32.86973595439656,
            "longitude":-96.64901936921868
        }
    }
    snapToPosition() {
        return true;
    }
    setupMap() {
        super.setupMap();
        
        this.shapeManager = new SevenPeaksPolygonManager(this.map,this.config.config)
    }
}

class SevenPeaksPolygonManager extends PolygonManager  {
    static DESKTOP = 0x01;
    static MOBILE = 0x02;
    
    constructor(map,config) {
        super(map,config)
        super()
        this.googleMap = map;
        this.canDropPoint = true;
        this.config = config;

        this.markers["gates"]=[]
        config.assets.forEach(asset=>{
          this.assets[asset.key] = {
            color: asset.color,
            description: asset.description,
            image:asset.image?asset.image.image.url:null,
            name:asset.name,
            showInLegend: asset.showInLegend && asset.showInLegend!="false"
          }
        })
        this.instructions = config.instructions.map(node=>{
          return {
            "title":node.title,
            "content":node.content.split("\n").filter(para=>para.length>0).map(para=>`<p class="google-maps-instructions">${para}</p>`).join("\n")
          }
        })
        this.snappingBehaviour = SnappingBehaviour.CLOSEST;
        this.buttons.how_to = this.createButton(this.textFor("how-to"));
        this.buttons.drawing = this.createButton(this.textFor("start-drawing"));
        this.buttons.secondary = this.createButton(this.textFor("add-gates"));
        this.buttons.secondary.classList.add("gate-mode");
      
        this.buttons.how_to.addEventListener("click",event=>this.showHowTo())
        this.buttons.drawing.addEventListener("click",event=>this.startDrawing())
        this.buttons.secondary.disabled=true;
        this.buttons.secondary.addEventListener("click",event=>{

            if (this.buttons.secondary.classList.contains("gate-mode")) {
                this.startAddGates();
            } else {
                this.finalize();
            }
        })
        this.showHowTo();
    }
    
    
    generateGeometry() {
      
      let sides = this.enclosure.getSides();
      
        let returnValue = {
            sides:[],
            pixels:[],
            points: this.enclosure.points().length
        }

        sides.forEach((side,index)=>{
          
            let gateWidth = this.gates[index]?this.gates[index]:0;
          
            let sideDistance = this.enclosure.distanceBetween(side.start,side.end);
            let sideValue = {
                components:[
                    {
                        type:"panel",
                        count:Math.round((sideDistance/this.minimumSideLength)*10)/10,
                        width:this.toSnappedFeet(sideDistance),
                    }
                ]
            }
            if (gateWidth>0) {
                sideValue.components.push(
                    {
                        type:"gate",
                        count:1,
                        width:gateWidth
                    }
                )
            }
            returnValue.sides.push(sideValue)
        })
      
      return returnValue;
    }
    startDrawing() {
        super.startDrawing();
        
        this.gates = []
        this.clearMarkers("gates")
        this.buttons.drawing.textContent = this.textFor("restart-drawing");
        this.buttons.secondary.textContent = this.textFor("add-gates");
        this.buttons.secondary.classList.add("gate-mode")
        this.buttons.secondary.disabled = true;
    }
    endDrawing() {
        this.buttons.secondary.disabled = false;
    }
    startAddGates() {
        this.clearWindows()
        this.gatesAdded = []
        this.clearMarkers("gates")

        this.enclosure.getSides().forEach((side,index)=>{
            this.addGateMarkerCreate(side,index)
        })
        this.buttons.secondary.classList.remove("gate-mode")
        this.buttons.secondary.textContent = this.textFor("continue-to-selection")
    }
    addGateMarkerCreate(side,index) {
        let marker = this.createIconMarker(side.centerPoint,this.assets["add-gate"].image);
        google.maps.event.addListener(marker,"click",event=>{
            this.addGatePopup(side.centerPoint,index);
        })
        this.orientMarkerToSide(side,marker)
        this.markers["gates"].push(marker)
    }
    showButtons() {
      this.googleMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(this.buttons.how_to);
      this.googleMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(this.buttons.drawing);
      this.googleMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(this.buttons.secondary);
    }
    showHowTo() {
        if (this.howToWindow) {
          return;
        }
        this.hideButtons();
        let infoDiv = document.createElement("DIV")
        infoDiv.classList.add("google-maps-howto")
        
      
        infoDiv.innerHTML = `
        <div class="section-header">${this.textFor('legend')}</div>
        <div class="legend">
          ${Object.values(this.assets).filter(asset=>asset.showInLegend).map(asset=>`
            <div class="legend-row">
              <div class="legend-image"><img src="${asset.image}"></div>
              <div class="legend-text">${asset.description}</div>
              </div>
          `).join("")
          }
          </div>
          ${this.instructions.map(instruction=>`
            <div class="section-header">${instruction.title}</div>
            <div class="howto-body">${instruction.content}</div>
          `).join('')}
        `
        this.howToWindow = new google.maps.InfoWindow({
            position:this.googleMap.getCenter(),
            content:infoDiv,
            ariaLabel: this.textFor("howto-popup","How-to"),
            headerContent:this.windowTitle(this.textFor("howto-popup","How-to")),
            zIndex:10000000

        });
        google.maps.event.addListener(this.howToWindow,"close",event=>{
          this.howToWindow = null;
          this.showButtons()
        })
        
        this.howToWindow.open(this.googleMap)
    }

    addGatePopup(anchorPoint,gateIndex) {
        let frag = document.createDocumentFragment()
        let holderDiv = document.createElement("DIV")

        holderDiv.innerHTML = `
        <div class="google-maps-fence-selector">
            <div class="gate-selector-button">
                <button data-option="ten-foot">${this.textFor('add-gate-10')}</button>
            </div>
            <div class="gate-selector-button">
                <button data-option="five-foot">${this.textFor('add-gate-5')}</button>
            </div>
            <div class="gate-selector-button">
                <button data-option="cancel">Cancel</button>
            </div>
        `

        let gateInfoWindow = new google.maps.InfoWindow({
            content:holderDiv,
            position:anchorPoint,
            ariaLabel: this.textFor('select-gate-header'),
            headerContent:this.windowTitle(this.textFor('select-gate-header'))

        });
        this.windows.push(gateInfoWindow)
        gateInfoWindow.open(this.googleMap)

        let infoWindowContent = gateInfoWindow.getContent();

        infoWindowContent
            .querySelector('[data-option="ten-foot"]')
            .addEventListener("click",event=>{
                gateInfoWindow.close()
                this.selectGate(gateIndex,10)

            });
        infoWindowContent
            .querySelector('[data-option="five-foot"]')
            .addEventListener("click",event=>{
                gateInfoWindow.close()
                this.selectGate(gateIndex,5)
            });
            infoWindowContent
            .querySelector('[data-option="cancel"]')
            .addEventListener("click",event=>{
                gateInfoWindow.close()
            });
    }
    removeGatePopup(anchorPoint,gateIndex) {
        let holderDiv = document.createElement("DIV")

        holderDiv.innerHTML = `
        <div class="google-maps-fence-selector">
            <div class="gate-remover-button">
                <button data-option="remove-gate">${this.textFor('remove-gate-header')}</button>
            </div>
            <div class="gate-selector-button">
                <button data-option="cancel">Cancel</button>
            </div>
        `
        let gateInfoWindow = new google.maps.InfoWindow({
            content:holderDiv,
            position:anchorPoint,
            ariaLabel: this.textFor('remove-gate-header'),
            headerContent:this.windowTitle(this.textFor('remove-gate-header'))

        });
        this.windows.push(gateInfoWindow)
        gateInfoWindow.open(this.googleMap)
        holderDiv.querySelector('[data-option="remove-gate"]')
            .addEventListener("click",event=>{
                gateInfoWindow.close()
                this.removeGate(gateIndex)

            });
            holderDiv.querySelector('[data-option="cancel"]')
            .addEventListener("click",event=>{
                gateInfoWindow.close()
        });
    }
    removeGate(gateIndex) {

        this.gates[gateIndex] = null;
        let sides = this.getSides()

        let gate = this.markers["gates"][gateIndex];
        gate.setMap(null)
        let gateSide = this.getSides()[gateIndex]
        let position = gate.position;
        this.addGateMarkerCreate(gateSide,gateIndex)
        this.broadcastGeometry()



    }
    selectGate(gateIndex,length) {
        let sides = this.getSides()

        let gate = this.markers["gates"][gateIndex];
        gate.setMap(null)
        let gateSide = this.getSides()[gateIndex]
        let position = gate.position;

        this.gates[gateIndex] = length;


        let gateMarker = this.createIconMarker(position,this.assets[`gate-${length}`].image);

        google.maps.event.addListener(gateMarker,"click",event=>{
            this.removeGatePopup(position,gateIndex)
        })
        this.markers["gates"][gateIndex] = gateMarker;
        this.orientMarkerToSide(gateSide,gateMarker)
        this.broadcastGeometry()
    }
}




class Enclosure {
    constructor(points) {
        this.pointData = points;
        this.isCompleted = true;
        this.resetBounds()
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

    getSides(excludeFinal=true) {
        let sides = [];
        for (let i=0;i<this.points().length;i++) {
            let start = this.getPoint(i);
            let end = null;
            if (i+1>=this.points().length) {
                if (this.isClosed()) {
                    end = this.getPoint(0)
                } else {
                    break;
                }

            } else {
                end = this.getPoint(i+1)
            }

            if (this.distanceBetween(start,end)>0 && excludeFinal) {
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