class AlohaPDPSubscriptions extends SrDSubscriptionsWidget {
    constructor(options) {
        super(options);
        document.addEventListener("QuantityChanged",event=>{
          this.render();
        });
    }
    discounted_price() {
      let discount_multiplier = 0.90;
      let subscription_items = parseInt(document.querySelector(".quantity-selector").value);
      if (this.cart) {
        subscription_items += this.cart.items.reduce((a,b)=>(b.selling_plan_allocation)?a+b.quantity:a,0);
      }
      if (subscription_items==2) {
        discount_multiplier = 0.85;
      } else if (subscription_items>=3) {
        discount_multiplier = 0.75;
      }
      console.error(this.cart,subscription_items,this.config.selected_variant.price*discount_multiplier);
      return this.config.selected_variant.price*discount_multiplier;
    }
    render() {
      
      let render_select = (plans)=>{
        return plans.map(plan=>{
          return `
          <option value="${plan.id}" ${(this.config.selling_plan && this.config.selling_plan.id==plan.id)?'selected':''}>
            ${this.config.delivery_label} ${plan.label}
          </option>`
        })
      }
      let root = document.querySelector(this.config.injection_point);
      root.innerHTML = `
        <div id="rc_container">
          <div id="rc_radio_options" role="radiogroup" aria-labelledby="Purchase options">
            <div class="rc_block rc_block__type rc_block__type__onetime ${!this.config.selling_plan?'rc_block__type--active':''}" >
        		<input type="radio" id="rc_purchase_type_onetime" name="purchase_type" value="onetime" data-selling-plan="" class="rc_radio rc_radio__onetime" ${!this.config.selling_plan?'checked':''} data-purchase-type="onetime">
        		<label for="rc_purchase_type_onetime" class="rc_label rc_label__onetime">
                  ${this.config.onetime_label} 
        		  <span id="rc_price_onetime" class="rc_price rc_price__onetime" aria-label="original price">$${this.regular_price().toFixed(2)}</span>
    			</label>
    		</div>
            <div class="rc_block rc_block__type rc_block__type__autodeliver ${this.config.selling_plan?'rc_block__type--active':''} ${this.selling_plans.options.length>0?'':'d-none'}" >
        		<input type="radio" name="purchase_type" id="rc_purchase_type_autodeliver" value="autodeliver"  class="rc_radio rc_radio__autodeliver" ${this.config.selling_plan?'checked':''} data-purchase-type="autodeliver">
    			<label for="rc_purchase_type_autodeliver" class="rc_label rc_label__autodeliver">
                    ${this.config.subscription_label}
            		<span id="rc_price_autodeliver" class="rc_price rc_price__autodeliver" aria-label="recurring price">$${this.discounted_price().toFixed(2)}</span>
    			</label>
    			<div id="rc_autodeliver_options" class="rc_block rc_block__type__options d-none">
        			<select name="selling_plan_id" id="rc_shipping_interval_frequency" class="rc_select rc_select__frequency styled replaced d-none">
                      ${render_select(this.selling_plans.options)}
                	</select>
    			</div>
    		</div>
          </div>
        </div>
      `;
      let plan_input = document.querySelector('[name="selling_plan"]');
      if (!plan_input) {
        plan_input = document.createElement("input");
        plan_input.type="hidden";
        plan_input.name="selling_plan";
        document.querySelector("[data-product-form]").appendChild(plan_input);
      }
      if (plan_input && this.config.selling_plan) {
        plan_input.value = this.config.selling_plan.id;
      }
      root.querySelectorAll('input[name="purchase_type"]').forEach(radio=>{
        radio.addEventListener("click",event=>{
          /*document.querySelector(".rc_block__type--active").classList.remove("rc_block__type--active");
          document.querySelector(`[data-purchase-type="${radio.dataset.purchaseType}"]`)
            .classList.add("rc_block__type--active");*/
          
          
          switch(radio.dataset.purchaseType) {
            case "onetime":
              this.config.last_selling_plan = this.config.selling_plan;
              this.config.selling_plan = null;
              
              plan_input.value="";
              break;
            case "autodeliver":
              if (this.config.last_selling_plan) {
                this.config.selling_plan = this.config.last_selling_plan;
              } else {
                this.config.selling_plan = this.config.selling_plans.options[0];
              }
              plan_input.value = this.config.selling_plan.id;
              break;
          }
          this.render();
          
        });
      })
        
    }
}