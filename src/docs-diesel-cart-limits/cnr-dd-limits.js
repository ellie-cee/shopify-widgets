class CnRDocsDieselCartMinimum {
    defaults() {
        return {
            minimum: 0,
            button:".checkout-button",
        }
    }
    constructor(options) {
        this.config = {...this.defaults(),...options}
    }
    evaluate(subtotal) {
        let checkout_button = document.querySelector(this.config.button);
        let checkout_button_text = document.querySelector(this.config.button_text);
        if (!checkout_button || !checkout_button_text) {
          return;
        }
        console.error(this.config.minimum,subtotal)
        if (this.config.minimum<=(subtotal/100)) {
            checkout_button.disabled = false;
            checkout_button_text.textContent = "Checkout";
        } else {
            checkout_button.disabled = true;
            checkout_button_text.innerHTML = `<span class="line_one">Add $${(this.config.minimum-(subtotal/100)).toFixed(2)}</span> <br><span class="line_two">to check out</span>`
        }
    }
}
class DocsDieselSidecartMinimum extends CnRDocsDieselCartMinimum {
    constructor(options) {
        super(options);
        document.addEventListener("rebuy:smartcart.show",event=>{
          console.error(event,event.detail.smartcart.cart.items_subtotal_price);
          this.evaluate(event.detail.smartcart.cart.items_subtotal_price);
        })
        document.addEventListener("rebuy:cart.add",event=>{
          console.error(event.detail);
          this.evaluate(event.detail.cart.cart.items_subtotal_price);
        })
        document.addEventListener("rebuy:cart.change",event=>{
          console.error(event.detail);
          this.evaluate(event.detail.cart.cart.items_subtotal_price);
        })
    }
  
}
class DocsDieselCartPageMinimum extends CnRDocsDieselCartMinimum {
    constructor(options) {
        super(options);
        document.addEventListener("CartChanged",event=>{
          this.evaluate(event.detail.items_subtotal_price);
        })
    }
    
}

