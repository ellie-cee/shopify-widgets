class SpFenceBuilder extends Sorcistino {
  constructor(options) {
      super({...options,class:"fence-builder"})
      this.screenData = {}
      this.basket = new SpBasketHandler().clear()
      this.data = {}
      
    this.geometryData = {sides:[],points:0}
    document.addEventListener("srd:mapdrawer:geometry:updated",event=>{
      this.updateGeometry(event.detail)
      this.basket.setGeometry(event.detail)
      this.reRenderBasket()
    })
    document.addEventListener("srd:quantity:changed",event=>{
      this.updateProductQuantity(event.detail.dataset)
    })
    document.addEventListener("srd:fence-builder:add-quote",event=>{
      this.basket.newBasket()
      this.show(0);
      this.screens.forEach(screen=>screen.unComplete())
      SrD.dispatchEvent(
        "srd:map:drawing:restart"
      )
    });
    document.addEventListener("srd:fence-builder:edit-fence",event=>{
      this.basket.load(parseInt(event.detail))
      this.show(0);
      this.screens.forEach(screen=>screen.unComplete())
      SrD.dispatchEvent(
        "srd:map:geometry:set",
        this.basket.get().geometry
      )
    })
    document.addEventListener("srd:fence-builder:clone-fence",event=>{
      this.basket.clone(parseInt(event.detail))
      this.show(0);
      this.screens.forEach(screen=>screen.unComplete())
      SrD.dispatchEvent(
        "srd:map:geometry:set",
        this.basket.get().geometry
      )
    })
    
    this.loadData().then(q=>this.init(this.collapse_query(q)))
      
  }
  loadData() {
      let productSubQuery = `
      ... on Product {
          title
          tags
          handle
          id
          length: metafield(namespace:"srd",key:"total_length_mm") {
            __typename
            value
          }
          subtype: metafield(namespace:"srd",key:"subtype") {
            value
          }
          fastener: metafield(namespace:"srd",key:"fastener") {
            reference {
              ... on Product {
                count: metafield(namespace:"srd",key:"item_count_per") {
                  value
                }
                title
                tags
                handle
                id
                variant: variants(first:1) {
                  nodes {
                    id
                    title
                    price {
                      amount
                    }
                  }
                }
                featuredImage {
                  id
                  alt: altText
                  url
                }
              }
            }
          }
          variant: variants(first:10) {
              nodes {
                  
                  id
                  title
                  price {
                    amount
                  }
                  length: metafield(namespace:"srd",key:"length") {
                    __typename
                    value
                  }
              }
          }
          featuredImage {
            id
            alt: altText
            url
          }
      }
      `
      let fileSubquery = `
        ... on MediaImage {
          image {
            url
          }
        }
        `
   
      return this.graphql(
          `
          query getConfigObject($input:MetaobjectHandleInput!) {
              config: metaobject(handle:$input) {
                  id
                  handle
                  name: field(key:"name") {
                      value
                  }
                  segmentLength: field(key:"segment_length_cm") {
                      value
                  }
                  snapTo: field(key:"snap_to_length_cm") {
                      value
                  }
                  instructions: field(key:"instructions") {
                    references(first:10) {
                      nodes {
                        ... on Metaobject {
                          name: field(key:"name") {
                              value
                            }
                            title: field(key:"header_text") {
                              value
                            }
                            content: field(key:"instructions") {
                              value
                            }
                            video: field(key:"video") {
                              reference {
                                ... on Video {
                                  sources {
                                    url
                                    type: mimeType
                                  }
                                }
                              }
                            }
                            titleCard: field(key:"title_card") {
                              reference {
                                ${fileSubquery}
                              }
                              
                            }
                        }
                      }
                    }
                  }
                  assets: field(key:"assets") {
                      references(first:20) {
                          nodes {
                            ... on Metaobject {
                            name: field(key:"name") {
                              value
                            }
                            key: field(key:"key") {
                              value
                            }
                            color: field(key:"color") {
                              value
                            }
                            showInLegend: field(key:"show_in_legend") {
                              value
                            }
                            image: field(key:"file") {
                              reference {
                                ${fileSubquery}
                              }
                            }
                            
                            description: field(key:"description") {
                              value
                            }
                          }
                        }
                      }
                      products: references(first:10) {
                          nodes {
                              ${productSubQuery}
                          }
                      }
                  }
                  options: field(key:"panel_type") {
                      references(first:10) {
                        nodes {
                            ... on Metaobject {
                                name: field(key:"name") {
                                    value
                                }
                                postsPerSegment: field(key:"posts_per_segment") {
                                    value
                                }
                                railCount: field(key:"rail_count") {
                                    value
                                }
                                panel: field(key:"panel") {

                                    product: reference {
                                        ${productSubQuery}
                                    }
                                }
                                gates: field(key:"gates") {
                                    
                                    products: references(first:10) {
                                        nodes {
                                            ${productSubQuery}
                                        }
                                    }
                                }
                                posts: field(key:"posts") {
                                    products: references(first:10) {
                                        nodes {
                                            ${productSubQuery}
                                        }
                                    }
                                }
                                caps: field(key:"caps") {
                                    products: references(first:10) {
                                        nodes {
                                            ${productSubQuery}
                                        }
                                    }
                                }
                                clips: field(key:"clips") {
                                    products: references(first:10) {
                                        nodes {
                                            ${productSubQuery}
                                        }
                                    }
                                }
                                clamps: field(key:"clamps") {
                                    products: references(first:10) {
                                        nodes {
                                            ${productSubQuery}
                                        }
                                    }
                                }
                            }
                          }
                      }
                  }

              }
          }
          `,
          {
            "input":{
              handle:this.config.builderType,
              type:"fence_builder_configuration"}
          }
      )
  }
  render(screen=0) {
    super.render(screen);
    
    
  }
  addScreen(screen) {
      this.screens.push(screen)
  }
  init(q) {
      console.error(q)
      this.data = q.data.config;
      let iconsMapped = {};

      this.data.gateLengths = {}

      this.data.options.forEach(option=>{
        option.gates.products.forEach(gate=>{
          gate.variant.forEach(variant=>{
            if (variant.length) {
              this.data.gateLengths[parseInt(variant.length.value).toString()] = true
            }  
          })
        })
      })
    
      
      this.addScreen(
        new SevenPeaksFenceBuilderInitializationScreen(this,this.data,this.screens.length)
      )
      this.addScreen(
        new SpFenceBuilderRailScreen(this,this.data,this.data,this.screens.length)
      )
      
      this.render()
  }
  selectPanel(selectedPanel) {

    let panel = this.data.options.find(option=>option.panel.product.id==selectedPanel.id)
    this.selectedPanelType = panel;
    this.screens = this.screens.filter(screen=>screen.preserve());
    let startingScreen = this.screens.length;
    
    this.basket.clearGates()
    this.basket.getGeometry().sides.reduce(
      (a,b)=>a.concat(b.components.filter(component=>component.type=="gate").map(gate=>gate.width)),
      []
    ).forEach((gateWidth,index)=>{
      let productSet = [];
      let gateOptions = []
      
      panel["gates"].products.forEach(gateProduct=>{
        gateProduct.variant.filter(gate=>parseInt(gate.length.value)==parseInt(gateWidth)).forEach(gate=>gateOptions.push(gate))
      })
      if (gateOptions.length==1) {
      let selectedVariant = gateOptions[0];
      let selectedProduct = panel["gates"].products.reduce((a,b)=>b.variant.find(variant=>variant.id==selectedVariant.id)?b:null,{})
      this.basket.setGate(index,{
          id:this.getId(selectedVariant),
          variant: selectedVariant,
          product: selectedProduct,
          quantity: this.multiplier("gate"),
          screen:-1,
        });  
      } else {
        this.addScreen(
          new SpFenceBuilderGateScreen(
              this,
              {
                type:"gates",
                products:panel["gates"].products,
                gateIndex:index,
                gateLength:gateWidth
              },
              this.screens.length
            )
          )  
        }
    });
    
    ["posts","caps","clips","clamps"].forEach(category=>{
      if (panel[category]) {
        this.addScreen(
          new SpFenceBuilderProductScreen(
            this,
            {
              type:category,
              products:panel[category].products
            },
            this.screens.length
          )
        )  
      }
    })
    this.addScreen(
      new SpFenceBuilderLastScreen(
        this,
        {},
        this.screens.length
      )
    )
    
    
    
    
    this.show(startingScreen)
  }
  render(startingScreen=0) {
      super.render();
      this.setupEvents();
      SrD.dispatchEvent(
        "sorcistino:rendered",
        this
      )
      this.show(startingScreen)
  }
  
  renderFooter() {
      return ``
  }
  renderHeader() {
    return ``
  }
  renderProgressBar() {
      return `plop`
  }
  processScreen(data) {
    
  }
  reRenderBasket() {
    document.querySelector(".screen-summary .basket").innerHTML = this.basket.render()
  }
  renderProgressDetails() {
    
    return `
      ${this.renderStatistics(this.basket.basketIndex)}
      <div class="basket basket-display" data-basket="${this.basket.basketIndex}">
        ${this.basket.render()}
      </div>
    `
  }
  renderBasket() {
    return this.basket.render()
  }
  renderStatistics(basketIndex) {
    
    return `
    <div class="statistics">
        <div class="statistics-row">
          <div>Linear Footage:</div>
          <div class="fence-builder-linear-feet">${this.squareFeet(basketIndex)} ft</div>
        </div>
        <div class="statistics-row">
          <div>Number of Sides:</div>
          <div class="fence-builder-corner-count">${this.cornerCount(basketIndex)}</div>
        </div>
        <div class="statistics-row">
          <div>Gates:</div>
          <div class="fence-builder-gate-count">${this.gateCount(basketIndex)}</div>
        </div>
      </div>
    `
  }
updateGeometry(data) {
    this.basket.setGeometry(data)
    this.geometryData = data;
    this.element(".fence-builder-linear-feet").innerHTML = this.squareFeet();
    this.element(".fence-builder-corner-count").innerHTML = this.cornerCount();
    this.element(".fence-builder-gate-count").innerHTML = this.gateCount();
}
updateProductQuantity(dataSet) {
    let basketIndex = parseInt(dataSet.basket)
    let basketDisplay = document.querySelector(`.basket-display[data-basket="${basketIndex}"]`)
    
    let totalField = basketDisplay.querySelector(".cart-total");
    let quantity = parseInt(dataSet.quantity);
    let recommended = parseInt(dataSet.recommended)
    let recText = "recommended";
    this.basket.updateQuantity(basketIndex,dataSet.productid,quantity)
    if (quantity<recommended) {
      recText = "less than recommended"
    } else if (quantity>recommended) {
      recText = "more than recommended"
    }
    basketDisplay.querySelector(`[data-product="${dataSet.productid}"] .quantity-label`).textContent = recText;
    if (totalField) {
      totalField.textContent = this.basket.total(basketIndex);  
    }
}

variantImage(product,variant) {  
  if (variant.image) {
    return variant.image.url.split("?")[0];
  }
  return product.featuredImage.url.split("?")[0]
}
variantImageAlt(product,variant) {
  if (variant.image) {
    return variant.image.alt;
  }
  return product.featuredImage.alt
}
  
  
nextBehaviour() {
  return "nextCompletes"
}
cornerCount(basketIndex) {
  return this.basket.getGeometry(basketIndex).sides.length;
}
polygonArea(vertices) {
    let area = 0;
    let n = vertices.length;

    for (let i = 0; i < n; i++) {
      let x1 = vertices[i].x;
      let y1 = vertices[i].y;
      let x2 = vertices[(i + 1) % n].x;
      let y2 = vertices[(i + 1) % n].y;

      area += (x1 * y2 - x2 * y1);
    }
    return Math.abs(area) / 2;
}
squareFeet(basketIndex) {
  let linearFeet = 0;
  let panels = this.basket.getSection("panels",basketIndex)
  if (panels) {
      linearFeet = panels[0].quantity*Math.round(parseInt(this.data.segmentLength.value)*0.0328);
    }
    if (linearFeet==0) {
      linearFeet = Math.round(this.geometry(basketIndex).sides.reduce(
        (a,b)=>a+b.components.filter(component=>component.type=="panel").reduce(
          (c,d)=>c+d.width,
          0
        ),
        0
      ))  
    }
    return linearFeet;
  }
  geometry(basketIndex) {
    return JSON.parse(JSON.stringify(this.basket.getGeometry(basketIndex)))
  }
  panelCount(basketIndex) {
    let panels = this.basket.getSection("panels",basketIndex);
    if (panels) {
      return panels[0].quantity;  
    }
    return Math.ceil(this.squareFeet(basketIndex)/20)
  }
  gateCount(basketIndex) { 
    return Math.ceil(this.basket.get(basketIndex).geometry.sides.reduce(
      (a,b)=>a+b.components.filter(component=>component.type=="gate").reduce(
          (a1,b1)=>a1+b1.count,
          0
        ),
      0
    ))
  }

  multiplier(type,product) {
    let railCount = this.selectedPanelType?parseInt(this.selectedPanelType.railCount):0;
    
    let clipCount = (postCount) => ((postCount*railCount)%10>0) ? (postCount*railCount)+(10-(postCount*railCount)%10) : postCount*railCount;
    let sideCount = this.geometry().sides.length;
    let panelMultiplier = (this.panelCount()*2)+1;
    switch(type) {
      case "panels":
          
        return this.panelCount()
        break;
      case "posts":
      case "caps":
          return panelMultiplier
          break;
      case "clips":
          return (panelMultiplier*railCount)+(railCount*sideCount)
          return clipCount(panelMultiplier,parseInt(this.selectedPanelType.railCount))+(parseInt(this.selectedPanelType.railCount)*this.geometry().sides.length)
          break;
      case "screws":
        let countPer = parseInt(product.count.value)
        return Math.ceil(
          (((panelMultiplier*railCount)+(railCount*sideCount))*2)/countPer
        )
        default:
          return 1
          break;
      case "bolts":
        return Math.ceil(
          (((panelMultiplier*railCount)+(railCount*sideCount))*2)/50
        )
    }
  }
  getId(object) {
    return object.id.split("/").pop()
  }
  processScreen(data) {
    switch(data.section) {
      case "geometry":
        this.geometryData = data.geometry;
        this.basket.setGeometry(data.geometry)
        this.next()
        break;
      case "panels":
        this.basket.setSection("panels",[
          {
            id:this.getId(data.selectedVariant),
            variant: data.selectedVariant,
            product:data.selectedProduct,
            quantity: this.multiplier("panels"),
            screen:this.screen,
            recommended:this.multiplier("panels")
          }
        ])
        
        this.selectPanel(data.selectedProduct)
        break;
      case "clear":
        this.basket.clearSection(data.type)
        this.next();
        break;
      case "options":
        this.basket.setSection(data.type,[{
          id:this.getId(data.selectedVariant),
          variant:data.selectedVariant,
          product: data.selectedProduct,
          quantity: this.multiplier(data.type,data.selectedProduct),
          recommended: this.multiplier(data.type,data.selectedProduct),
          screen:this.screen,
        }])
        
        if (data.type=="clips") {
            let fastener = data.selectedProduct.fastener;
            this.basket.setSection("screws",[
              {
                id:this.getId(fastener.variant[0]),
                variant:fastener.variant[0],
                "product":fastener,
                "quantity":this.multiplier("screws",fastener),
                recommended:this.multiplier("screws",fastener),
                screen:null
              }
            ])
        }
        this.next()
        break;
      case "gates":
        this.basket.setGate(
          data.gateIndex,
          {
            id:this.getId(data.selectedVariant),
            variant: data.selectedVariant,
            product: data.selectedProduct,
            quantity: this.multiplier(data.type,data.selectedProduct),
            screen:this.screen,
          }
        )
        this.next();
    }
  }
  show(screen) {
    super.show(screen);
    if (window.innerWidth<=762) {
      document.querySelector(".announcement-bar-section").scrollIntoView(true)
    }
  }
  doAtc() {
    let payload = this.basket.payload()
    this.basket.addToCart().then(cart=>{
      location.href = '/cart/'
    })
  }
  renderPreNav() {
    if (!this.isMobile()) {
      return '';
    }
    return `
      <div class="mobile-summary border-top">
        <label for="preview-summary" class="sorcistino-nav-button cta grid-item-cta cta-foreward-lite-primary preview-summary-button">
          <input type="checkbox" id="preview-summary" name="preview-summary" class="preview-summary">
          Project Summary
        </label>  
        <div class="project-summary">
            ${this.renderProgressDetails()}
        </div>
      </div>
    `
  }
  
}

class SpFenceBuilderScreen extends SorcistinoScreen {
  title() {
    return `Screen ${this.index+1}`
  }
  autoadvance() { return true;}
      
  render() {
      this.parent.setContent(`
      <div class="builder-header" style="background-image:url(${this.parent.data.assets.find(asset=>asset.key=="header-background").image.image.url})">
        Build a Fence
      </div>
      <div class="panels fence-builder" data-uuid="${this.uuid}">
          
          <div class="screen-content">
              <h3>${this.title()}</h3>
              ${this.renderContent()}
              
              ${this.parent.renderNavButtons()}
          </div>
          <div class="screen-summary">
              <div class="summary-header">
                  <h3>Project Summary</h3>
              </div>
              ${this.isMobile()?'':this.parent.renderProgressDetails()}
          </div>
      </div>
      `);
      this.setupEvents()
      SrDQuantity.setupEvents()

    }
  renderContent() {
      return ``
  }
  setupEvents() {
    
    this.parent.setBackVisibility(this.index>0)
    this.element('[data-screen-nav="next"]').addEventListener("click",event=>this.complete())
    this.element('[data-screen-nav="back"]').addEventListener("click",event=>this.parent.prev())
  }
  hideBack() { return false;}
}

class SevenPeaksFenceBuilderInitializationScreen extends SpFenceBuilderScreen {


constructor(parent,data,index) {
  super(parent,data,index);
  this.initialized  = false;
  this.savedState = null;
  this.linearFeet = null;
  this.sides = null;
  this.gates = null;
  if (window.innerWidth<=768) {
    this.mode = "basic"  
  } else {
    this.mode = "advanced"
  }
  

  this.cornersSelector = new SrDSelect(
    {
      "name":"srd-corner-selector",
      "id":"corner-selector",
      "options":[
        {label:"1",value:"1"},
        {label:"2",value:"2"},
        {label:"3",value:"3"},
        {label:"4",value:"4"},
        {label:"5",value:"5"},
        {label:"6",value:"6"},
        {label:"7",value:"7"},
        {label:"8",value:"8"},
        {label:"9",value:"9"},
        {label:"10",value:"10"},
      ],
      value:this.sides,
    }
  );
  this.gateSelector = new SrDSelect(
    {
      "name":"srd-gate-selector",
      "id":"gate-selector",
      "options":[
        {label:"None",value:"0"},
        {label:"1",value:"1"},
        {label:"2",value:"2"},
        {label:"3",value:"3"},
        {label:"4",value:"4"},
        {label:"5",value:"5"},
        {label:"6",value:"6"},
        {label:"7",value:"7"},
        {label:"8",value:"8"},
      ],
      value:this.gates
    }
  )
  
  document.addEventListener("srd:mapdrawer:finished",event=>{
    this.saveState();
    this.broadcastCompletion({section:"geometry",type:"geometry",geometry:event.detail})
  })
  document.addEventListener("srd:mapdrawer:setMode",event=>{
    this.setMode(event.detail)
  })
  document.addEventListener("srd:map:geometry:set",event=>{
    let geometry = event.detail;
    this.setMode(geometry.mode)
    
  })
}
setMode(mode) {
  this.mode = mode;
    
  this.parent.setNextVisibility(this.mode=="basic")
  this.root().querySelectorAll(".entry-option").forEach(node=>{
    if (node.classList.contains(this.mode)) {
      node.classList.add("active");
    } else {
      node.classList.remove("active")
    }
  })
  switch(this.mode) {
    case "basic":
      this.element(".screen-summary").style.display="none";
      break;
    case "advanced":
      this.element(".screen-summary").style.display="flex";
      break;
  }
  let drawingDiv = this.element(".google-map-holder");
  if (drawingDiv.querySelector(".google-map")==null) {
    this.mapElement = new SevenPeaksInteractiveMap({googleMapId:this.parent.config.googleMapId,config:this.data})
  }
}
saveState() {
  this.savedState = [];
  
  
  
  Array.from(this.element(".screen-content").children).forEach(node=>{
    this.savedState.push(node)
    node.parentNode.removeChild(node)
  });
  this.element(".screen-content").innerHTML = '';
}
restoreState() {
  let existingNodes = []
  let screenContent = this.element(".screen-content");
  Array.from(screenContent.children).forEach(node=>{
    screenContent.removeChild(node)
  })
  
  this.savedState.forEach(node=>screenContent.appendChild(node));
  existingNodes.forEach(node=>screenContent.appendChild(node));
  
}

render() {
  
  this.parent.setContent(`
      <div class="builder-header" style="background-image:url(${this.data.assets.find(asset=>asset.key=="header-background").image.image.url})">
        Build a Fence
      </div>
      <div class="panels fence-builder calculator-screen" data-uuid="${this.uuid}">
          
          <div class="screen-content">
              
              ${this.savedState?'':this.renderContent()}
              ${this.parent.renderNavButtons()}
          </div>
          <div class="screen-summary">
              <div class="summary-header">
                  <h3>Project Summary</h3>
              </div>
              ${this.parent.renderProgressDetails()}
          </div>
      </div>
      `);
      
    this.parent.setNextVisibility(true);
    if (this.element(".mobile-summary")) {
      this.element(".mobile-summary").classList.add("hide");  
    }
    this.setupEvents()
    
    
}


renderContent() {
  
  if (this.savedState) {
    return '';
  }
  return `
    <div class="basic-entry-mode entry-option basic ${this.mode=="basic"?" active":""}">
      <div class="manual-builder">
        <div class="form">
          <div class="form-row">
             <div class="field-label">
                ${SrDConfigurableText.textFor('linear-feet-label')}
             </div>
             <div class="field-value">
                <input type="text" name="linear-feet" class="linear-feet" value="${this.linearFeet||""}" placeholder="Linear Feet">
             </div>
          </div>
          <div class="form-row">
             <div class="field-label">
                ${SrDConfigurableText.textFor('side-count-label')}
             </div>
             <div class="field-value corners">
                ${this.cornersSelector.render()}
             </div>
          </div>
          <div class="form-row">
             <div class="field-label">
                ${SrDConfigurableText.textFor('gate-count-label')}
             </div>
             <div class="field-value gates-selector">
                ${this.gateSelector.render()}
             </div>
             <div class="gate-selector-options"></div>
             <div class="advanced-mode-buttons ${window.innerWidth<=768?'mobile':''}"><button class="button cta grid-item-cta cta-foreward-lite-primary advanced-mode">draw ur map</button></div>
          </div>
         </div>
        <div class="illustration"><img src="${this.data.assets.find(asset=>asset.key=="fence_diagram").image.image.url}"></div>
      </div>
    </div>
    <div class="google-map-holder entry-option advanced ${this.mode=="advanced"?" active":""}"></div>
  `

}
setupEvents() {
  
  
  super.setupEvents()
  
  if (this.savedState) {
    this.restoreState();
    return;
  }
  let gateDropDown = document.querySelector("#gate-selector")
    gateDropDown.addEventListener("change",event=>{
      this.renderGateSelectors()
  })
  let linearFeetField = this.element(".linear-feet")
  linearFeetField.addEventListener("keydown",event=>{
    if (parseInt(linearFeetField.value)>0) {
      this.parent.setNextVisibility(true)
    }
  })
  linearFeetField.addEventListener("change",event=>{
    if (parseInt(linearFeetField.value)>0) {
      this.parent.setNextVisibility(true)
    }
  })
  this.element(".advanced-mode").addEventListener("click",event=>{
    this.setMode("advanced")
  })
  if (this.events) {
    return;
  }
  
  this.events = true;
  
  
  
  
    this.mapElement = new SevenPeaksInteractiveMap({googleMapId:this.parent.config.googleMapId,config:this.data})
    
  if (this.mode=="basic") {
    this.parent.setNextVisibility(true);
  }
  this.element(".linear-feet").addEventListener("keyup",event=>{
    let value = parseInt(event.target.value);
    if (value && value>0) {
      this.parent.setNextVisibility(true)
    } else {
      this.parent.setNextVisibility(false)
    }
  })
  SrD.dispatchEvent("srd:formFields:rendered")
  
}
renderGateSelectors() {
  let currentGates = []
  let gateCountSelector = this.root().querySelector("#gate-selector");
  let gateCount = parseInt(gateCountSelector.options[gateCountSelector.selectedIndex].value);
  let gateSelectorOptions = this.root().querySelector(".gate-selector-options")
  this.root().querySelectorAll(".gate-length-select").forEach(gate=>{
    currentGates.push(parseInt(gate.options[gate.selectedIndex].value));
  })
  gateSelectorOptions.innerHTML = '';
  
  let gateLengths = Object.keys(this.parent.data.gateLengths).map(option=>parseInt(option));

  for (let i=0;i<gateCount;i++) {
    let gateSelector = `
      <div class="selectorItem">
        <div class="slector-value" data-index="${i}"><select name="selector-${i}" class="gate-length-select">
          ${gateLengths.map(width=>`
            <option value="${width}" ${currentGates[i]==width?' selected':''}>${width}'</option>`).join('\n')
          }
          </select>
      </div>
    `
    gateSelectorOptions.innerHTML+=gateSelector;
  }
  
}
complete() {
  if (this.mode=="advanced") {
    this.parent.next();
    return;
  }
  let data = {
    length: parseInt(this.element(".linear-feet").value),
    sideCount: parseInt(this.cornersSelector.getValue()),
    gateCount: parseInt(this.gateSelector.getValue())
  }

  
  
  this.linearFeet = data.length;
  this.sides = data.sideCount;
  this.gates = data.dateCount;
  let lengthPerSide = data.length/data.sideCount;
  let gatesAvailable = data.gateCount;
  let geometry = {
    "sides":[],
    "mode":"basic",
  }
  for (let i=0;i<data.sideCount;i++) {
    let side = 
      {
        components:[
          {
            type:"panel",
            count:Math.round((lengthPerSide/20)*10)/10,
            width:lengthPerSide
          }
        ]
      }
    geometry.sides.push(side);
  }
  this.root().querySelectorAll(".gate-length-select").forEach(selector=>{
        geometry.sides[0].components.push(
          {
            type:"gate",
            count:1,
            width:parseInt(selector.options[selector.selectedIndex].value)
          }
        )
        gatesAvailable = 0;
      });
  
  this.broadcastCompletion({section:"geometry",type:"geometry",geometry:geometry})
  this.element(".summary-header").style.display="flex";
}
title() {
  return "Create Your Fence";
}
preserve() {
  return true;
}

}

class SpFenceBuilderProductScreen extends SpFenceBuilderScreen {
title() {
  return `Choose Your ${this.data.type}`
}
selector() {
  return "radio"
}
constructor(parent,data,index) {
  super(parent,data,index);
  this.selectedOption = null;
}
getId(object) {
  return object.id.split("/").pop()
}
unComplete() {
  super.unComplete();
  this.selectedOption = null;
  
}
variantImage(product,variant) {
  return this.parent.variantImage(product,variant)  
}
variantImageAlt(product,variant) {
  return this.parent.variantImageAlt(product,variant)
}

filteredVariants(variants) {
  return variants;
}

productRow(product,selectedVariantId) {
    
    let productId =  this.getId(product)

    return this.filteredVariants(product.variant).map(variant=>`
      <div class="item-entry">
        <label for="product-${this.getId(variant)}" class="product-selection-row">
          <input type="${this.selector()}" class="product-selector-radio" name="product-${this.uuid}" id="product-${this.getId(variant)}" value="${this.getId(variant)}" ${this.getId(variant)==selectedVariantId?' checked':''}>
          <div class="product-image"><img src="${this.variantImage(product,variant)}?width=105&height=93&crop=center" alt="${this.variantImageAlt(product,variant)}"></div>
          <div class="product-title">${product.title} ${variant.title.includes("Default")?'':variant.title}</div>
        </label>
      </div>
    `).join("\n")
    
  }
productList() {
  return this.data.products;
}
renderContent() {
  
  return `<div class="listing">${this.productList().map(product=>this.productRow(product,this.selectedOption,"radio")).join("")}</div>`
}
setupEvents() {
  super.setupEvents()
  this.parent.setNextVisibility(this.selectedOption!=null)
  
  
  this.root().querySelectorAll(".product-selector-radio").forEach(radio=>radio.addEventListener(this.selector()=="radio"?'change':'click',event=>{
   
    this.selectedOption = radio.value;
    this.parent.setNextVisibility(true)
    if (this.autoadvance()) { this.complete()}
  }))
}
preserve() {
  return false
}
section() {
  return "options"
}
completionPayload() {
  let selectedProduct = null;
  let selectedVariant = null;
  this.productList().forEach(product=>{
    
    product.variant.forEach(variant=>{
    
      if (this.getId(variant)==this.selectedOption) {
        selectedProduct = product;
        selectedVariant = variant
      }
    })
  })
  if (selectedVariant) {
    if (selectedProduct.tags.includes("do-not-add")) {
      this.broadcastCompletion({section:"clear",type:this.data.type})
      return null;
    }
    return {
      section:this.section(),
      type:this.data.type,
      selectedProduct:selectedProduct,
      selectedVariant:selectedVariant,
      screenIndex:this.index
    }
  }
  return null;
}
complete() {
  let payload = this.completionPayload()
  if (payload!=null) {
    this.broadcastCompletion(payload)
  }
}
}

class SpFenceBuilderGateScreen extends SpFenceBuilderProductScreen {
title() {
  return `Choose Your Gate: #${this.data.gateIndex+1} (${this.data.gateLength}')`
}
section() {
  return "gates"
}
complete() {
  let payload = this.completionPayload()
  if (payload!=null) {
    payload.gateIndex = this.data.gateIndex
    this.broadcastCompletion(payload)
  }

}
filteredVariants(variants) {
  return variants.filter(variant=>variant.length && parseInt(variant.length.value)==parseInt(this.data.gateLength))
}
}

class SpFenceBuilderRailScreen extends SpFenceBuilderProductScreen {
title() {
  return SrDConfigurableText.textFor("select-panels")
}
selector() { return "radio"; }
constructor(parent,data,index) {
  super(parent,data,index);
  this.selectedOption = null;
}
preserve() {
  return true
}
section() { return "panels" }

productList() {
  return this.data.options.map(option=>option.panel.product);
}
}

class SpFenceBuilderLastScreen extends SpFenceBuilderScreen {
title() {
  return SrDConfigurableText.textFor("review-fence")
}

hideBack() {
  return true
}
renderContent() {
    this.parent.setBackVisibility(false)
    return `
     
      <div class="all-baskets">
        ${this.parent.basket.baskets.map((basket,index)=>`
          <div class="final-basket basket-display" data-basket="${index}">
           <div class="final-summary">${this.parent.renderStatistics(index)}</div>
            <div class="items">
              ${this.parent.basket.render(index)}
            </div>
            <div class="final-actions border-top">
              <div class="cart-total-atc">
                <div class="cart-total-display">
                  Total <span class="cart-total" data-basket="${index}">${this.parent.basket.total(index)}</span>  
                </div>
                <div>
                  <button class="button atc" data-uuid="${this.parent.basket.baskets[index].id}" data-basket="${index}">
                    ${SrDConfigurableText.textFor("add-to-cart")}
                  </button>
                </div>
              </div>
              <div class="basket-buttons">  
                <button class="button edit" data-uuid="${this.parent.basket.baskets[index].id}" data-basket="${index}">
                  ${SrDConfigurableText.textFor("summary-edit-fence-label")}
                </button>
                 <button class="button clone" data-uuid="${this.parent.basket.baskets[index].id}" data-basket="${index}">
                  ${SrDConfigurableText.textFor("summary-clone-fence-label")}
                </button>
                 <button class="button delete" data-uuid="${this.parent.basket.baskets[index].id}" data-basket="${index}">
                  ${SrDConfigurableText.textFor("summary-delete-fence-label")}
                </button>
              </div>
            </div>
          </div>
          `).join("")}
          <div class="final-buttons">
          <button class="button add-quote">
              ${SrDConfigurableText.textFor("add-quote-text")}
          </button>
        </div>
      </div>
    `;
  
}
setupEvents() {
  super.setupEvents();
  this.parent.setBackVisibility(false)
  if (this.parent.basket.count()<2) {
    this.root().querySelectorAll("button.delete").forEach(button=>button.style.display="none")
  }
  this.element("h3").classList.add("border-bottom")
  this.element(".screen-summary").classList.add("final")
  this.element(".screen-content").classList.add("final")
  if (this.element(".mobile-summary")) {
      this.element(".mobile-summary").classList.add("hide");  
    }
  this.root().querySelectorAll("button.atc").forEach(atc=>atc.addEventListener("click",event=>{
    let basketIndex = parseInt(event.target.dataset.basket)
    this.parent.basket.addToCart(basketIndex).then(cart=>{
      
      SrD.openDawnCart()
    }).catch((e) => {
        console.error(e);
    });
    
  }))
  this.root().querySelectorAll("button.edit").forEach(
    button=>button.addEventListener("click",event=>SrD.dispatchEvent("srd:fence-builder:edit-fence",button.dataset.basket))
  )
  
  this.root().querySelectorAll("button.clone").forEach(
    button=>button.addEventListener("click",event=>SrD.dispatchEvent("srd:fence-builder:clone-fence",button.dataset.basket))
  )
  this.root().querySelectorAll("button.delete").forEach(button=>button.addEventListener("click",event=>{
      this.parent.basket.delete(parseInt(button.dataset.basket))
      this.parent.show(this.index)
    })
  )
  this.element("button.add-quote").addEventListener("click",event=>{
    SrD.dispatchEvent(
      "srd:fence-builder:add-quote"
    )
  })
  
}

}