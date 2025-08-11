class Sorcistino extends SrD {
    defaults() {
        return {
            injection_point:".sorcistino-holder",
            zeroButtonBehavior: "hide",
            class:"sorcistino",
        }
    }
    constructor(options) {
        super(options)
        this.screens = [];
        this.screen = 0;
        this.data = {};
        this.screens_data = {}
        this.screenTitles = []
        this.root = document.querySelector(this.config.injection_point);
        this.load_data();
        this.uuid = crypto.randomUUID();
        document.addEventListener("sorcistino:screen:completed",event=>{
          
            this.processScreen(event.detail)
        })
    }
    processScreen(data) {

    }
    query() {
        return ``;
    }
    element(selector) {
      return this.root.querySelector(selector)
    }
    additionalVariantQuery() {
        return ``
    }
    additionalProductQuery() {
        return ``
    }
    productQuery() {
     return `
            query getProducts($id: ID!) {
                product(id:$id) {
                    id
                    variants(first:100) {
                        nodes {
                            id
                            price {
                                amount
                            }
                            ${this.additionalVariantQuery()}
                        }
                    }
                    ${this.additionalProductQuery()}
                    sellingPlanGroups(first: 10) {
                        nodes {
                            appName
                            name
                            sellingPlans(first:250) {
                                nodes {
                                    recurringDeliveries
                                    id
                                    options {
                                        value
                                    }
                                    description
                                    priceAdjustments {
                                        adjustmentValue {
                                            ... on SellingPlanPercentagePriceAdjustment {
                                                percent: adjustmentPercentage
                                            }
                                            ... on SellingPlanFixedPriceAdjustment {
                                                amount: price {
                                                    amount
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`
    }

    addScreen(data,index) {
        this.screens.push(new SorcistinoScreen(this,data,index))
    }
    render(startingScreen=0) {
        this.root.innerHTML = `
            <div class="sorcistino-holder ${this.config.class} ${this.isMobile()?' mobile':''}">
                <div class="sorcistino-header">
                    <div class="title"></div>
                    ${this.renderHeader()}
                </div>
                <div class="content"></div>
                <div class="footer">${this.renderFooter()}</div>
            </div>
        `
        this.setupEvents();
        SrD.dispatchEvent("sorcistino:rendered",this)
        this.show(startingScreen)
    }
    renderProgress() {
      return `
      <div class="progress">
        <div class="progress-bar-wrapper js-progress-bar-wrapper">
          <div class="progress js-progress" style="width: 0%;"></div>
        </div>
      </div>
      `
    }
    renderPreNav() {
      return '';
    }
    renderNavButtons() {
      return `
      <div class="preNav">${this.renderPreNav()}</div>
      <div class="nav">
            <ul class="sorcistino-nav-menu">
                <div class="sorcistino-nav-holder">
                    
                    <div><button class="sorcistino-nav-button button cta grid-item-cta cta-foreward-lite-primary" data-screen-nav="back" ${this.canGoBack()?'':'disabled'}>Back</button></div>
                    <div><button class="sorcistino-nav-button button cta grid-item-cta cta-foreward-lite-primary" data-screen-nav="next" ${this.canGoForward()?'':'disabled'}>Next</button></div>
                </div>
            </ul>
        </div>
        `
    }
    renderHeader() {
      return `
        ${this.renderProgress()}
        ${this.renderNavButtons()}
      `
    }
    renderFooter() {
        return ``
    }
    setupEvents() {
        this.root.querySelectorAll(".sorcistino-nav-button").forEach(button=>button.addEventListener("click",event=>this.navigate(button)))
    }
    navigate(nav) {

      if (nav.getAttribute("data-screen-nav")=="back") {
        this.show(this.screen-1);
      } else {
        
        if (this.nextBehaviour()=="afterComplete" && this.screen.completed()) {
            this.show(this.screen+1);
        } else if (this.nextBehaviour()=="nextCompletes") {
          this.screens[this.screen].complete()
        }
        
      }
    }
    next() {
      if (this.screen+1<this.screens.length) {
        this.show(this.screen+1);
      }
    }
    prev() {
      if (this.screen-1>=0) {
        this.show(this.screen-1);
      }
    }
    setNextVisibility(show=true) {
        try {
          this.nextVisibility= show
          if (show) {
              this.root.querySelector('[data-screen-nav="next"]').disabled = false;
  
          } else {
              this.root.querySelector('[data-screen-nav="next"]').disabled = true;
          }  
        } catch(e) {
          
        }
        
    }
    setBackVisibility(show=true) {
        try {
          this.backVisibility = show;
          if (show) {
            this.root.querySelector('[data-screen-nav="back"]').disabled = false;
          } else {
            this.root.querySelector('[data-screen-nav="back"]').disabled = true;
          }  
        } catch(e) {
          
        }
    }
    setProgress(perc) {
        try {
          this.root.querySelector(".js-progress").style.width=`${Math.floor(perc*100)}%`  
        } catch(e){}
        
    }
    currentScreen() {
        return this.screens[this.screen];
    }
    renderScreen() {
        this.currentScreen().render()
    }
    setScreen(index) {
        this.screen = index;
        return this.currentScreen()
    }
    setContent(content) {
      this.root.querySelector(".content").innerHTML = content;
    }
    canGoBack() {
      return this.backVisibility;
    }
    canGoForward() {
      return this.nextVisibility;
    }
    nextBehaviour() {
      return "afterComplete"
    }
    show(screen) {

        this.screen = screen;
        if (screen<0) {
            this.screen = 0;
            SrD.dispatchEvent("sorcistino:reset",this)
            return;
        }

        if (this.screen==0) {
            document.querySelectorAll(".sorcistino-nav-holder").forEach(nav=>nav.removeAttribute("hidden"));
        }
        let screenObj = this.setScreen(screen)
         

        if (screen>=0 && screen<=this.screens.length) {
            screenObj.render()
            
        }
        if (this.screen+1<this.screens.length && screenObj.completed()) {
            this.setNextVisibility(true)
        } else {
              this.setNextVisibility(false)  
        }
        if (this.root.querySelector(".title")) {
            this.root.querySelector(".title").innerHTML = screenObj.title();
        }

        if (this.screen>0) {
              if (!screenObj.hideBack()) {
                 this.setBackVisibility(true)   
              } else {
                 this.setBackVisibility(false)   
              }
             
        } else {
            if (this.config.zeroButtonBehavior=="hide") {
                this.setBackVisibility(false)
            } else {
              this.setBackVisibility(true)
            }
        }

        //\/ Nav Buttons
        
       
        if (screen==0) {
            this.setProgress(0.05);
        } else if (screen==this.screens.length-1) {
            this.setProgress(1)
        } else {
          this.setProgress((screen/(this.screens.length-1))+0.05)
        }
        SrD.dispatchEvent(
            "sorcistino:screen:changed",
            this
         );

        if (this.isFinalScreen()) {
            document.dispatchEvent(
                new CustomEvent("sorcistino:screen:final",{bubbles:true,detail:this})
            );
            this.finalize();
        }
        
    }
    isFinalScreen() {
        return this.screen == this.screens.length-1;

    }
    load_data() {

    }
    finalize() {

    }
    isMobile() {
      return window.innerWidth<=762;
    }
}
class SorcistinoModal extends Sorcistino {
    constructor(options) {
        super(options)
        this.root = document.querySelector(".srd-modal .modal-text");
    }
}
class SorcistinoScreen {
    constructor(parent,data,index) {
        this.index = index;
        this.parent = parent;
        this.data = data;
        this.is_completed = false;
        this.uuid = crypto.randomUUID()
    }
    setupEvents() {

    }
    hideBack() {
      return false;
    }
    completed() {
        return this.is_completed;
    }
    complete() {
    
    }
    unComplete() {
      this.is_completed = false;
    }
    broadcastCompletion(data={}) {
      this.is_completed=true;
      SrD.dispatchEvent(
        "sorcistino:screen:completed",
        data
      )
      return this.is_completed;
    }
    data() {
        return this.data;
    }
    is_final() {
      return this.screen.hasAttribute("data-final-screen");
    }
    render() {
        return ``
        this.setupEvents()
    }
    renderContent() {
      
    }
    preserve() { return false;}
    title() {
      return 'title'
    }
    root() {
      return document.querySelector(`[data-uuid="${this.uuid}"]`)
    }
    element(selector) {
      return this.root().querySelector(selector)
    }
    isMobile() {
      return window.innerWidth<=762;
    }
    
}