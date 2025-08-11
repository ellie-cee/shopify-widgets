class LiLacCartNote extends SrDGiftNote {
    constructor(options) {
        super(options)
        document.addEventListener('rebuy:smartcart.show', (event) => {
            this.cart = event.detail.smartcart.cart;
            this.render();
        });
    }
    hasGift() {
        console.error("hasGift",this.cart.note!=null && this.cart.note!="")
	 	return this.cart.note!=null && this.cart.note!="";
	}
	giftText() {
	 	return this.cart.note||"";
	}
    shipDate() {
      if (this.cart.attributes['Delivery-Date']) {
        let date = this.cart.attributes['Delivery-Date'].split("/")
        return [date[2],date[0],date[1]].join("-");
      } else {
        return '';
      }
    }
    hasDate() {
      console.error(this.cart.attributes['Delivery-Date'] && this.cart.attributes['Delivery-Date']!="",this.cart.attributes['Delivery-Date'])
      return this.cart.attributes['Delivery-Date'] && this.cart.attributes['Delivery-Date']!="";
    }
    daysHence(days) {
      Date.prototype.addDays = function (num) {
        var value = this.valueOf();
        value += 86400000 * num;
        return new Date(value);
    }

      let d = new Date().addDays(days);
      return d.toISOString().substring(0,10);

      
    }
    noteForm() {
    return `
    <div class="padding">
       <div class="cart-expand-header gift-message">
          <label for="CartNote" class="order-summary-title">Add a Gift Message</label>
          <span class="open-close">
             <div class="more">
                <div class="circle-plus">
                   <div class="circle">
                      <div class="horizontal"></div>
                      <div class="vertical"></div>
                   </div>
                </div>
             </div>
          </span>
       </div>
       <div class="cart-expand-content">         
          <textarea class="srd-gift-note-cart-text cart-note-field" name="note" maxlength="${this.config.cart_gift_message_max}">${this.giftText()}</textarea>
          <div class="srd-gift-note-cart-utility">
            <div>
              <span count="" class="srd-gift-note-cart-char-count">
              ${this.config.cart_gift_message_max - this.giftText().length}
              </span> Characters remaining
            </div>
          </div>
       </div>
    </div>
    <div class="padding">
       <div class="cart-expand-header">
          <label for="CartNote" class="order-summary-title">Shipping Details</label>
          <span class="open-close">
             <div class="more">
                <div class="circle-plus">
                   <div class="circle">
                      <div class="horizontal"></div>
                      <div class="vertical"></div>
                   </div>
                </div>
             </div>
          </span>
       </div>
         <div class="cart-expand-content">
           <p><strong>Same day shipping</strong>: Orders must be placed before 9am EST &amp; "Next Business Day" selected from shipping options</p><p><strong>Holiday shipping</strong>: Due to volume, processing time is increased to 2-3 business days, regardless of shipping method. </p><p><strong>General Ship times</strong>: Your chocolates could be in transit for up to <em>7 business days</em>, based on the destination and shipping method selected. </p><p><a href="https://www.li-lacchocolates.com/pages/shipping-information"><strong>Our complete shipping policies</strong></a>.&nbsp;</p>
        </div>
      </div>
      <div class="padding">
         <div class="cart-expand-header">
            <label for="CartNote" class="order-summary-title">Buy Now Ship Later</label>
            <span class="open-close">
               <div class="more">
                  <div class="circle-plus">
                     <div class="circle">
                        <div class="horizontal"></div>
                        <div class="vertical"></div>
                     </div>
                  </div>
               </div>
            </span>
            <p class="body1">Orders normally ship within 1-2 business days unless a future ship date is selected.  </p>
         </div>
         <div class="cart-expand-content date-picker">         
            <div class="buy-now-ship-later">BUY NOW, SHIP LATER. Select a future ship date below:</div>  
            <div><input id="srd-gift-ship-date" type="date" name="date" value="${this.shipDate()}" min="${this.daysHence(3)}"></div>
         </div>
      </div>`;
    }
    changed() {
      if (this.intervalID) {
        window.clearTimeout(this.intervalID);
      }
      this.interval = window.setTimeout(()=>{      
            window.clearTimeout(this.intervalID);
            this.handleUpdate()
            this.intervalID=null;
        },400);
    }
    render() {
        
        let injection_point = document.querySelector(this.config.target);
        injection_point.innerHTML = this.noteForm()
        injection_point.querySelector("#srd-gift-ship-date").addEventListener("change",(event)=>{
          this.changed()
        });
        injection_point.querySelector("textarea").addEventListener("keyup",event=>{
            console.error("updating");
			let remaining = this.config.cart_gift_message_max - injection_point.querySelector("textarea").value.length;
			if (remaining<=0) {
				event.stopImmediatePropagation();
				return false;
			}
            injection_point.querySelector(".srd-gift-note-cart-char-count").textContent = remaining-1;
            this.changed();
        });
        injection_point.querySelector("textarea").addEventListener("paste", (event) => {
          
          let remaining = this.config.cart_gift_message_max - injection_point.querySelector("textarea").value.length;
          injection_point.querySelector(".srd-gift-note-cart-char-count").textContent = remaining-1;
          this.changed()
      });
        injection_point.querySelectorAll(".cart-expand-content").forEach(item=>item.style.display="none" && $(item).slideUp(200));
        injection_point.querySelectorAll(".cart-expand-header").forEach(item=>item.addEventListener("click",event=>{
           $(item).next().slideToggle(200);
           $(item).toggleClass("expanded");  
        }))  
    }
    clear() {
      this.cart.attributes['Delivery-Date']=null;
      this.cart.note = "";
      
      this.updateCart({note:"",attributes:this.cart.attributes})
			.then(json=>this.opret = json);
      
    }
    handleUpdate() {
        let injection_point = document.querySelector(this.config.target);
        this.cart.note = injection_point.querySelector("textarea").value;
        let date = injection_point.querySelector("#srd-gift-ship-date").value.split("-");
        if (date.length==3) {
          this.cart.attributes["Delivery-Date"] = [date[1],date[2],date[0]].join("/");
        }
        this.updateCart({note:this.cart.note,attributes:this.cart.attributes})
            .then(json=>this.opret = json);
    }
}   