class SrDCheckoutUpdates extends SrD {
    defaults() {
        return {
            action_for:{
                "show":()=>console.log("hey now"),
            },
        };
    }
    constructor(opts) {

        this.cart = null;
        document.addEventListener("page:change",(e)=>{
            this.update()
          });
          document.addEventListener("DOMContentLoaded",()=>{
            this.update();
          });
          document.addEventListener("DOMSubtreeModified",(event)=>{
            if (event.target.classList.contains("order-summary")) {
              this.update();
            }
          });
    }
    update() {
        if (this.config.cart==null) {
            window.fetch("/cart.js")
                .then(response=>response.json())
                .then(cart=>{
                    this.cart = cart;
                    this.render();
                });
        } else {
            this.render();
        }
    }
    render() {
        if (this.config.action_for[Shopify.Checkout.page]) {
            this.config.action_for[Shopify.Checkout.page](cart);
        }
    }
}