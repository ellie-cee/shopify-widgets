//* Copyright 2021 Chelsea and Rachel Co. ellie@chelseaandrachel.com *//
class SrDShippingMotivator extends SrD {
    defaults() {
		return {
            inject_css:true,
			extended_cart:false,
			context:"sidecart",
			target:".srd-shipping-motivator-holder",
			shipping_threshold:100,
			shipping_text:"You're $##amount## away from Free Shipping!",
			shipping_met_text:"You've unlocked free shipping!",
			gwp_enabled:false,
			gwp_threshold:150,
			gwp_text:"You're $##amount## away from a free gift",
			gwp_met_text:"You've unlocked free shipping and a free gift!",
			gwp_indicator_text:"Free gift",
			shipping_indicator_text:"",
			bottom_text:"",
			cart_total:0,
			item_applicable_amount:(item)=>item.quantity*item.discounted_price,
	};}
	constructor(opts={}) {
		super(opts);
      
		this.shortfall = this.config.threshold;
		this.cart_total = 0;
		this.perc = 0;
		this.goal_met = false;
		this.mode = "shipping";

		document.addEventListener("CartUpdated",(event)=>{
			this.cart = event.detail;
			this.render();
		});
        document.addEventListener("CartEmpty",(event)=>{
			this.cart = {};
			this.blank();
		});
	}
	motivatorText() {
		return ((this.mode=="shipping")?this.config.shipping_text:this.config.gwp_text).replace("##amount##",this.shortfall.toFixed(2));
	} 
	goalMetText() {
		return (this.mode=="shipping")?this.config.shipping_met_text:this.config.gwp_met_text;
	}
	indicatorText() {
		return (this.mode=="shipping")?this.config.shipping_indicator_text:this.config.gwp_indicator_text;
	}
	calculate() {
			this.cart_total = this.cart.items.reduce(
              (sum,item)=>sum+(this.config.item_applicable_amount(item)/100),
              0
            );
			this.shortfall = this.config.shipping_threshold - this.cart_total;
			if (this.shortfall<=0) {
				if (this.config.gwp_enabled) {
					this.mode="gwp";
					this.shortfall = this.config.gwp_threshold - this.cart_total;
					if (this.shortfall<=0) {
						this.shortfall = 0;
						this.perc = 100;
						this.goal_met = true;
					} else {
							this.perc = (this.cart_total/this.config.gwp_threshold)*100;
							this.goal_met = false;
					}

				} else  {
					this.mode="shipping";
					this.shortfall = 0;
					this.perc = 100;
					this.goal_met = true;
				}
				
			} else {
                this.goal_met = false;
				this.mode="shipping";
				this.perc = (this.cart_total/this.config.shipping_threshold)*100;
			}
	}
    blank() {
      let injection_point = document.querySelector(this.config.target);
	 	if (!injection_point) {
	 		console.error(`Injection target ${this.config.target} does not exist`);
	 	}
        injection_point.innerHTML = "";
    }
	render() {
	 	let injection_point = document.querySelector(this.config.target);
	 	if (!injection_point) {
	 		console.error(`Injection target ${this.config.target} does not exist`);
	 	}
        this.calculate();
    
	 	injection_point.childNodes.forEach(node=>injection_point.removeChild(node));
	 	injection_point.innerHTML = `
	 		<div class="srd-sm-shipping--message js-srd-sm-shipping--message">
     		<div class="srd-sm-shipping-full js-srd-sm-shipping-full h6${this.goal_met?'':' d-none'}"><strong>${this.goalMetText()}</strong></div>
     		<div class="srd-sm-shipping-start js-srd-sm-shipping-start h6${this.goal_met?' d-none':''}">
     			${this.motivatorText()}
      	</div>
      </div>
      <div class="srd-sm-shipping--meter js-srd-sm-shipping--meter${this.goal_met?' d-none':''}">
      	<div class="srd-sm-shipping--meter-fill js-srd-sm-shipping--meter-fill" style="width: ${this.perc}%;"></div>
      </div>
      <div class="srd-sm-benefits-bar columns-1 js-srd-sm-benefits-bar">
   	  	<div class="srd-sm-benefits-item srd-sm-benefit-freeshipping">
    	  	<div class="srd-sm-benefits-bar-point"></div>
     			<span>${this.indicatorText()}</span>
    	  </div>
		  <div class="srd-sm--bottom-text">${this.config.bottom_text}</div>
      </div>
	 	`;
	}	  
	getCart(cart=null) {
		if (cart!=null) {
			this.cart = cart;
			this.render();
			return;
		}
		fetch(this.config.extended_cart?"/cart?view=json":"/cart.js")
			.then(res=>(this.config.extended_cart)?res.text():res.json())
			.then(cart=>{
				if (this.config.extended_cart) {
					eval(cart);
					this.cart = window.cart;
				} else {
					this.cart = cart;
				}
				this.render();
			});
	}
    css() {
      return `
      .srd-sm-shipping--message {
        padding: 10px 0;
        text-align: center;
      }
      .srd-sm-shipping--meter {
        background: #e0af59;
        border-radius: 20px;
        display: block;
        font-weight: bold;
        height: 20px;
        margin: 9px 0;
        padding: 0;
        position: relative;
        width: 90%;
        margin-left:24px;
        margin-right:24px;
      }
      .srd-sm-shipping--meter-fill {
        background: #391d1f;
        border-radius: 24px;
        color: #391d1f;
        font-size: 12px;
        height: 20px;
        left: 0;
        line-height: 20px;
        overflow: hidden;
        opacity: 1;
        padding: 0 10px;
        position: absolute;
        text-align: right;
        top: 0;
        transition: all 0.5s ease;
      }
      .srd-sm-benefits-bar {
        display:none;
      }
      `;
    }
}