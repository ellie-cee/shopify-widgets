class SrDSticky extends SrD {

  defaults() {
    return {
      targetBottomOffset:0,
      stickySpacing:5,
      stickTo:"bottom"
    }
  }
  constructor(options) {
      super(options)
      this.sticky = document.querySelector(this.config.sticky)
      this.target = document.querySelector(this.config.target)
       
        this.reposition();
      if (window.innerWidth<=762) {
        this.sticky.classList.remove("ignore-default-behaviour")
      }
      
      
      document.addEventListener("scroll",event=>{
        this.handleScrollV2(event)
       
      })
  }
  reposition() {
    let stickyBounds = this.sticky.getBoundingClientRect();
    document.querySelector("mobile-dock").style.bottom = `${stickyBounds.height}px`;
    
  }
  stickyOffset(spacing=null) {
    if (spacing==null) {
      spacing = this.config.stickySpacing
    }
    let stickyBounds = this.sticky.getBoundingClientRect();
    
    switch(this.config.stickTo) {
      case "bottom":
        return (window.pageYOffset+window.innerHeight)-(stickyBounds.height+spacing);
        break;
      case "top":
        return window.pageYOffset+spacing;
        break;
    }
  }

  handleScrollV2(event) {
      let targetBounds = this.target.getBoundingClientRect()
      let stickyTopOffset = this.stickyOffset()

      let sticky = document.querySelector("mobile-dock.pdp-atc")

      if (targetBounds.top<=(targetBounds.height+this.config.targetBottomOffset)*-1) {
        document.querySelector(".sticky-holder").classList.add("is-active")
        sticky.classList.add("is-active")
        self.dispatchEvent(
          "srd:status:actived",
         null
        )
      } else {
          sticky.classList.remove("is-active") 
          self.dispatchEvent(
            "srd:status:deactived",
           null
          )
      }
        
  }
}