class SrDSidecartDiscount {
	constructor(opts={}) {
		let defaults = {
			target:".srd-sidecart-discount-code-holder",
            placeholder_text:"Type Discount Code here",
            button_text:"Apply",
            update_text:"Update",
            clear_button_text:`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M15.89 14.696l-4.734-4.734 4.717-4.717c.4-.4.37-1.085-.03-1.485s-1.085-.43-1.485-.03L9.641 8.447 4.97 3.776c-.4-.4-1.085-.37-1.485.03s-.43 1.085-.03 1.485l4.671 4.671-4.688 4.688c-.4.4-.37 1.085.03 1.485s1.085.43 1.485.03l4.688-4.687 4.734 4.734c.4.4 1.085.37 1.485-.03s.43-1.085.03-1.485z"></path></svg>`,
			preview:false,
			sitename:"mysite",
			url:"https://srd-discount-details-preview-3cd4d003b92e.herokuapp.com/"          
		};

		let style = document.createElement("style");
        this.cart = {attributes:{}}
        style.type = "text/css";
        style.id="srd-discount-handler";
        style.textContent = this.css();
        document.querySelector("head").appendChild(style);

		this.rebuy_content = []
		this.config = {...defaults,...opts};
		document.addEventListener("CartUpdated",(event)=>{
			this.handleCart(event.detail);
		});
        this.cookies = document.cookie.split(";")
      	  		.map(cookieString=>cookieString.trim().split("="))
      	 		.reduce(
           	 		(acc,curr)=>{acc[curr[0]] = curr[1];return acc;},
          			{}
       		);
        
        this.url_cookie = this.cookies["discount_code"]!=null?this.cookies["discount_code"]:""
      
        
        
 	}
	handleCart(cart) {
		this.cart = cart;
        
		if (this.config.preview) {
            
			this.process(this.discountCode(),"handle cart");
		} else {
          this.render("no preview");
        }
	}
	async updateCart(payload) {
	   
	    fetch(`/cart/update.js`, {
	      method: 'POST',
	      credentials: 'same-origin',
	      headers: {
	        'Content-Type': 'application/json',
	        'X-Requested-With': 'xmlhttprequest'
	      },
	      body: JSON.stringify(payload)
	    }).then((response) => response.json());
	 }
	 hasCode() {
	 	return this.discountCode()!=null && this.discountCode()!="";
	 }
	 clearCode(clear_error=true) {
    	this.cart.attributes["_discount_code"]="";
        this.url_cookie = "";
    	this.updateCart({attributes:this.cart.attributes}).then(json=>{
          console.warn("updated code");
          window.setTimeout(()=>document.dispatchEvent(new CustomEvent("ShowCart",{bubbles:true,detail:json})),250);
        });
        document.querySelector(".srd-sc-discount-code-input").value="";
        document.cookie = `discount_code=`;
        document.querySelector(`${this.config.target} .srd-sc-discount-code-description`).innerHTML = "";
        if (clear_error) {
          this.showError("");  
        }
        
	 }
	 render(which) {
	 	let injection_point = document.querySelector(this.config.target);
	 	if (!injection_point) {
	 		console.error(`Injection target ${this.config.target} does not exist`);
	 	}
	 	injection_point.childNodes.forEach(node=>injection_point.removeChild(node));
        
	 	injection_point.innerHTML = `
	 		 <div class="srd-sc-discount-code-wrapper">
                <div class="srd-sc-discount-code-form ${this.hasCode()?'d-none':''}">
                  <input type="text" name="discount-code" data-original-code="${this.discountCode()}" class="srd-sc-discount-code-input " placeholder="${this.config.placeholder_text}" value="${this.discountCode()}">
                  <a class="srd-sc-discount-code-button apply">${this.config.button_text}</a>
                  
                </div>
                <div class="srd-sc-discount-code-indicator ${this.hasCode()?'':'d-none'}">
                  <div>${this.discountCode()}</div>
                  <a class="clear ${(this.hasCode())?'':'d-none'}">${this.config.clear_button_text}</a>
                </div>
				<div class="srd-sc-discount-code-error"></div>
                <div class="srd-sc-discount-code-description"></div>
            </div>
	 	`;
        injection_point.querySelector(".srd-sc-discount-code-input").addEventListener("keydown",event=>{
          if (event.keyCode==13) {
            event.preventDefault();
            event.stopPropagation();
            this.applyCode(injection_point.querySelector(".srd-sc-discount-code-input").value);
          }
        })
	 	injection_point.querySelector(".srd-sc-discount-code-button.apply").addEventListener("click",event=>{
		    event.stopPropagation();
            event.preventDefault();
            let code =  injection_point.querySelector(".srd-sc-discount-code-input").value;
            if (code=="") {
              return;
            }
            this.applyCode(code)
            
	  	});
       injection_point.querySelector(".srd-sc-discount-code-indicator .clear").addEventListener("click",event=>{
         this.clearCode();
       });
	}
    applyCode(code) {
      
      let button = document.querySelector(`${this.config.target} .srd-sc-discount-code-button`);
      button.classList.add("active");
      button.innerHTML = "Applying...";
      this.process(code,"apply code");
    
    }

    discountCode() {
    	if (this.cart.attributes && this.cart.attributes["_discount_code"] && this.cart.attributes["_discount_code"]!="") {
            return this.cart.attributes["_discount_code"];
        } else {
          return this.url_cookie;            
      	}
	 }
	async getDiscountDetails(code) {
		return window.fetch(`${this.config.url}/code/${this.config.sitename}/${code}`)
			.then(response=>response.json())
	}
	
	process(code,which) {
        if (code=="") {
          this.render("nocode");
          return;
        }
        let key = `discount-${code.toLowerCase()}`;
		if (sessionStorage.getItem(key)) {
            let cached_details = JSON.parse(sessionStorage.getItem(key));
            if (Date.now()-cached_details.timestamp<60*60*1000) {
                this.do_process(cached_details.details);
                return;
            }
			
		}
		this.getDiscountDetails(code).then(details=>{
            
            sessionStorage.setItem(key,JSON.stringify({timestamp:Date.now(),details:details}));
			this.do_process(details)
		});	
	}
	showError(message) {
        if (message=="") {
          document.querySelector(this.config.target).querySelector(".srd-sc-discount-code-error").innerHTML = message;  
        } else {
          document.querySelector(this.config.target)
            .querySelector(".srd-sc-discount-code-error").innerHTML = `<div class="content">${message}</div>`;
        }
      document
        .querySelector(`${this.config.target} .srd-sc-discount-code-description`).innerHTML ="";
		
	}
	do_process(details) {
		if (!details.valid) {
            this.render("invalid");
			this.showError(details.error);
			return;
		} else {
          if (details.title.toUpperCase()!=this.discountCode()) {
            this.cart.attributes["_discount_code"] = details.title.toUpperCase();
            this.url_cookie = details.title.toUpperCase();
            let payload = {
              ...this.cart.attributes,
              ...{code:details.title.toUpperCase()}
            };
            this.updateCart({attributes:payload}).then(json=>{
              document.cookie = `discount_code=${details.title.toUpperCase()}`
            });  
          }
          window.fetch(`/discount/${details.title}`)
            .then(response=>response.text())
            .then(text=>{
          
            })
            .catch(error=>console.error(error,"CAN'T UPDATE???"));
            this.render("do_process");
        }
		let discount = DiscountProcessor.process(this.cart,details);
		switch(discount.constructor.name) {
			case "DiscountError":
				this.showError(discount.value())
				break;
			case "DiscountReturn":
              
              this.renderCart(discount);
              break;
          case "UnsupportedDiscount":
            this.showError("Preview Unavailable");
		}
	}
	renderCart(value) {
      document
        .querySelector(`${this.config.target} .srd-sc-discount-code-description`)
        .innerHTML = `<div class="content">${value.summary()}</div>`;
        document
        .querySelector(`${this.config.target} .srd-sc-discount-code-error`)
        .innerHTML = ``;
        let button = document.querySelector(`${this.config.target} .srd-sc-discount-code-button`);
        button.classList.remove("active");
        button.innerHTML = this.config.update_text
        

	}
      
	css() {
		return ``;
	}
}

class DiscountReturn {
	constructor(object) {
        
        this.data = object;
	}
	
	items() {
		return this.data.items;
	}
	subtotal() {
		return this.data.new_total;
	}
	freeShipping() {
		return this.data.freeShipping;
	}
    summary() {
      return this.data.summary;
    }
  
}
class DiscountError {
	constructor(message) {
		this.message = message;
	}
	value() {
		return this.message;
	}
}
class UnsupportedDiscount {

}

class DiscountProcessor {
	constructor(cart,details) {
		this.cart = cart;
		this.items_count = this.cart.items.reduce((a,b)=>a+b.quantity,this.cart.items,0)
		this.total_value = this.cart.items.reduce((a,b)=>a+(b.line_price/100),0);
		this.onetime_value = this.cart.items.reduce((a,b)=>(b.selling_plan_allocation)?a:a+(b.line_price/100),0);
		this.subscription_value = this.cart.items.reduce((a,b)=>(b.selling_plan_allocation)?a+(b.line_price/100):a,0);
		this.details = details;
		this.message = ""
        
	}
	static process(cart,details) {
		switch(details.type) {
			case "DiscountCodeBasic":
				switch(details.discountClass) {
					case "ORDER":
						return new BasicDiscountOrder(cart,details).run()
						break;
					case "PRODUCT":
						return new BasicDiscountProduct(cart,details).run()
						break;
					default:
				}
				break;
            case "DiscountCodeFreeShipping":
              return new FreeShippingDiscount(cart,details).run()
              break;
			default:
				return new UnsupportedDiscount();
				break;
		}
	}
	isValid() {
		let now = Date.now();
		if (now<Date.parse(this.details.startsAt)) {
			this.message = `${this.details.title} is not valid until ${new Date(this.details.startsAt).toDateString()}`;
			return false;
		}
		if (this.details.endsAt && now>Date.parse(this.details.endsAt)) {
			this.message = `${this.details.title} expired ${new Date(this.details.endsAt).toDateString()}`;
			return false;
		}
		if (this.details.status!="ACTIVE") {
			this.message = `${this.details.title} is no longer active`;
			return false;
		}
		return true;
	}
	meetsRequirements()	{
		if (this.details.minimum==null) {
			return true;
		}
		if (this.details.minimum.subtotal && this.total_value<parseFloat(this.details.minimum.subtotal.amount)) {
			this.message = `${this.details.title} requires a miniumum subtotal of $${this.details.minimum.subtotal.amount}`;
			return false;
		}
		if (this.details.minimum.quantity && this.items_count<this.details.minimum.quantity) {
			this.message = `${this.details.title} requires a miniumum of ${this.details.minimum.quantity} items`;
			return false;
		}
		return true;
	}
}
class FreeShippingDiscount extends DiscountProcessor {
  run() {
    if (!this.isValid() || !this.meetsRequirements()) {
    	return new DiscountError(this.message);
	}
    return new DiscountReturn({
          title:this.details.title,
          items:[],
          new_total:this.details.total_value,
          freeShipping:true,
          summary:this.details.summary
        });
  }
}
class BasicDiscountOrder extends DiscountProcessor {
	run() {
		if (!this.isValid() || !this.meetsRequirements()) {
			return new DiscountError(this.message);
		}
		let order_total = this.total_value;
        let order_items = this.cart.items.map((item,index)=>Object.assign({},item,{line:index+1}));
		let discount = 0;
        
		if (this.details.benefits.oneTimeValid && !this.details.benefits.subscriptionValied) {
			order_total = this.onetime_value;
            order_items=order_items.filter(item=>!item.selling_plan_allocation);
		} else if (!this.details.benefits.oneTimeValid && this.details.benefits.subscriptionValid) {
            order_items=order_items.filter(item=>item.selling_plan_allocation!=null);
          
			order_total = this.subscription_value;
		}
		if (this.details.benefits.value.percentage ) {
            order_items = order_items.map(item=>Object.assign(
                item,
                {
                  new_price:((item.final_line_price/100)*(1-this.details.benefits.value.percentage)),
                  discount_amount:((item.final_line_price/100)*(this.details.benefits.value.percentage)),
                }
              )
            );
			discount = order_total*this.details.benefits.value.percentage;
		} else if (this.details.benefits.value.amount) {
            discount = parseFloat(this.details.benefits.value.amount.amount)
            let per_item = discount/order_items.reduce((a,b)=>a+b.quantity);
            order_items = order_items.map(item=>Object.assign(
                item,
                {
                  new_price:((item.final_line_price/100)-per_item*item.quantity),
                  discount_amount:(per_item*item.quantity),
                }
              )
            )
		}
        
		let new_total = this.total_value - discount;
      
        return new DiscountReturn({
          title:this.details.title,
          items:order_items.map(item=>{
            return {
              original_price:(item.final_line_price/100).toFixed(2),
                  price:item.new_price,
                  total_discount:item.discount_amount,
                  key:item.key,
                  discounts:[{title:this.details.title}],
                  line:item.line,
            }
          }),
          new_total:new_total,
          freeShipping:false,
          summary:this.details.summary
        });
		
	}
}

class BasicDiscountProduct extends DiscountProcessor {
	run() {
		if (!this.isValid() || !this.meetsRequirements()) {
			return new DiscountError(this.message);
		}
		let order_total = this.total_value;
		let discount = 0;
        let discounted_items = [];
        let proceed = true;

        this.cart.items.forEach((item,index)=>{
          if (proceed) {
            if ((!this.details.benefits.oneTimeValid && !item.selling_plan_allocation) || (!this.details.benefits.subscriptionValid && item.selling_plan_allocation)) {
              return;
            }
            if (this.details.products.length<1 || this.details.products.includes(item.product_id)) {
              if (this.details.benefits.value.percentage) {
                let item_discount = ((item.final_line_price/100)*this.details.benefits.value.percentage);
                discount+=item_discount;
                discounted_items.push({
                  original_price:(item.final_line_price/100).toFixed(2),
                  price:((item.final_line_price/100)*(1-this.details.benefits.value.percentage)),
                  total_discount:item_discount,
                  key:item.key,
                  discounts:[{title:this.details.title}],
                  line:index+1,
                });
                
              } else if (this.details.benefits.value.amount) {
                let item_discount = parseFloat(this.details.benefits.value.amount.amount)
                discount+=item_discount;
                discounted_items.push({
                  original_price:(item.final_line_price/100).toFixed(2),
                  price:(item.final_line_price/100)-item_discount,
                  total_discount:item_discount,
                  key:item.key,
                  discounts:[{title:this.details.title}],
                  line:index+1,
                });
                if (this.details.benefits.value.amount && this.details.benefits.value.amount.appliesOnEachItem) {
                  proceed = false;
                }
            }
          }
          }
        });
		let new_total = order_total - discount;
		return new DiscountReturn({
          title:this.details.title,
          items:discounted_items,
          new_total:new_total,
          freeShipping:false,
          summary:this.details.summary
        });
	}
}
