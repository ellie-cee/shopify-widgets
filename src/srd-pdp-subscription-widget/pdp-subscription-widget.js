class SrDSubscriptionsWidget extends SrD {
  defaults() {
      return {
          default_to_subscription:true,
          onetime_label:"One Time Purchase",
          subscription_label:"Autoship & save",
          delivery_label: "",
          injection_point:".srd-subscription-widget",
          form_selector:"[data-product-form]",
          krc:true,
          selling_group_index:1,
          "id":"default-widget",
      };
  }
  appName() { return "subscriptions_widget";}
  constructor(options) {
    super(options);
    this.selling_plans = {}
    this.optionIndex = 0;
    this.root = document.querySelector(this.config.injection_point);
    this.load_product(this.config.product).then(q=>this.init(q));
    this.formElement = document.querySelector(this.config.form_selector)

    document.addEventListener("CartUpdated",event=>{
      this.cart = event.detail;
      this.render();
    });

    document.addEventListener("VariantChanged",event=>{
      this.selectedVariant = this.variants.find(variant=>variant.id==parseInt(event.detail))
      this.render();
    });

  }
  renderRoot() {
    return this.root;
  }
  form() {
    return this.formElement
  }
  setFormField(fieldName,value) {
    let field = this.form().querySelector(`[name="${fieldName}"]`)
    if (!field) {
      return;
    }
    switch(field.tagName) {
      case "SELECT":
        field.options[field.options.findIndex(option=>option.value==value)].selected = "selected";
        break;
      default:
        field.value = value;
    }
  }
  
  formField(fieldName) {
    return this.form().querySelector(`[name="${fieldName}"]`)
  }
  formValue(fieldName) {
    let field = this.form().querySelector(`[name="${fieldName}"]`)
    return 
    if (!field) {
      return;
    }
    switch(field.tagName) {
      case "SELECT":
        return field.options[field.selectedIndex].value;
        break;
      default:
        return field.value 
    }
  }

  fragments() {

    return `
      fragment sellingPlanGroup on SellingPlanGroup {
        name
        appName
        options {
          name
          values
        }
        sellingPlans(first:5) {
          nodes {
            id
            name
            options {
              name
              value
            }
            billingPolicy {
              ... on SellingPlanRecurringBillingPolicy {
                interval
                intervalCount
              }
            }
            deliveryPolicy {
              ... on SellingPlanRecurringDeliveryPolicy {
                interval
                intervalCount
              }
            }
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
      fragment sellingPlanAllocations on SellingPlanAllocation {
        sellingPlan {
          billingPolicy {
              ... on SellingPlanRecurringBillingPolicy {
                interval
                intervalCount
              }
            }
            deliveryPolicy {
              ... on SellingPlanRecurringDeliveryPolicy {
                interval
                intervalCount
              }
            }
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
            description
            id
            name
            options {
              name
              value
            }
          }
      }
    `;
  }
  
  init(q) {
    console.error(q);
    let hasSellingPlans = true;

    
    
    if (q.data.products) {
      this.products = q.data.products.nodes;
      this.products.forEach(product=>product.productId=this.gid2id(product.id))
      this.product = this.products.find(product=>this.gid2id(product.id)==this.config.product)
    } else if (q.data.product) {
      this.products = [q.data.product]
      this.product = q.data.product;
      this.product.productId = this.gid2id(this.product.id)
    } else {
      return;
    }
    this.additionalInitialization();
    this.initProduct();
    console.error(this)
  }
  additionalInitialization() {}
  switchProduct(productId) {
    let newProduct = this.products.find(product=>this.gid2id(product.id)==productId)
    this.product = newProduct;
    console.error(newProduct)
    this.initProduct()
  }
  initProduct() {
    
    this.variants = this.product.variants.nodes.map(variant=>this.addVariant(variant));
    let hasSellingPlans = true;
    if (!this.config.variant_id) {
      this.selectedVariant = this.variants[0];
    } else {
      let prospectiveVariant = this.variants.find(variant=>variant.id==this.config.variant_id)
      if (prospectiveVariant) {
        this.selectedVariant = prospectiveVariant;
      } else {
        this.selectedVariant = this.variants[0];
      }
    }
    if (this.product.sellingPlanGroups.nodes.length>0) {
        this.selling_plans = this.parseSellingPlans();
        if (!this.selling_plan_id) {
          if (this.config.default_to_subscription) {
            this.selling_plan= this.selling_plans.options[0];
            this.config.last_selling_plan = this.selling_plan;
          } else {
            this.config.last_selling_plan= this.selling_plans.options[0];
          }
        } else {
          this.selling_plan = this.selling_plans.options.find(plan=>plan.id==this.selling_plan_id);
          this.config.last_selling_plan = this.selling_plan;
        }
      } else {
        hasSellingPlans = false;
      }
    
    if (!hasSellingPlans) {
      return;
    }

    this.afterLoad();
    this.subscriptionsMontorForm();
    this.render();
  }
  afterLoad() {}
  addVariant(variant) {
      return {
          id:this.gid2id(variant.id),
          price:parseFloat(variant.price.amount),
          available: variant.available,
          title:variant.title,
          options: variant.options
      
      }
  }
  parseSellingPlans() {
      return this.parseSellingPlansV2();
  }
  parseSellingPlansV1() {
      let group = this.product.sellingPlanGroups.nodes.pop();
      let variantMap = {}
      
      this.product.variants.nodes.forEach(variant=>{
        if (variant.sellingPlanAllocations!=null) {
          variant.sellingPlanAllocations.nodes.forEach(sellingPlan=>{
            let id = this.gid2id(sellingPlan.id)
              if (variantMap[id]!=null) {
                variantMap[id].push(this.gid2id(variant.id))
              } else {
                variantMap[id].push[this.gid2id(variant.id)]
              }
          })
        }
      })
    
      return {
          group_id:group.name,
          options:group.sellingPlans.nodes.map(selling_plan=>{
              return {
                  id:this.gid2id(selling_plan.id),
                  label:selling_plan.options[0].value,
                  discount:selling_plan.priceAdjustments[0].adjustmentValue.percent/100,
              };
          }),
          variantMap:this.mapVariants(q)
      };
  }
  parseSellingPlansV2() {
      let by_app = {};

      this.product.sellingPlanGroups.nodes.forEach(group=>{
          if (!by_app[group.appName]) {
              by_app[group.appName] = []
          }
          if (this.isValidGroup(group)) {
            group.sellingPlans.nodes.forEach(plan=>{
              by_app[group.appName].push({
                id:this.gid2id(plan.id),
                "label":plan.name,
                "discount":plan.priceAdjustments[0].adjustmentValue.percent/100,
                "interval":plan.deliveryPolicy.intervalCount,
              });  
          });
        }
      });


    
      return {
          group_id:this.config.subscription_label,
          options:this.sorted((this.config.use_app)?by_app[this.config.use_app]:Object.values(by_app).pop()),
          variantMap:this.mapVariants()
      };
  }
  sorted(options) {
    return options;
  }
  isValidGroup(group) { return true}
  
  mapVariants() {
    let variantMap = {}
    this.product.variants.nodes.forEach(variant=>{
        if (variant.sellingPlanAllocations!=null) {
          variant.sellingPlanAllocations.nodes.forEach(allocation=>{
              let sellingPlan = allocation.sellingPlan
              let id = this.gid2id(sellingPlan.id)
              if (variantMap[id]!=null) {
                variantMap[id].push(this.gid2id(variant.id))
              } else {
                variantMap[id]=[this.gid2id(variant.id)]
              }
          })
        }
      })
    return variantMap;
  }

  load_product(id) {
    return this.graphql(`
      query getProducts($id: ID!) {
        product(id:$id) {
          id
          title
          handle
          variants(first:100) {
            nodes {
              id
              title
              options: selectedOptions {
                name
                value
              }
              available: availableForSale
              price {
                amount
              }
              sellingPlanAllocations(first:10) {
                nodes {
                  ...sellingPlanAllocations
                }
              }
              ${this.additionalVariantQuery()}
            }
          }
          ${this.additionalProductQuery()}
          sellingPlanGroups(first: 10) {             
            nodes {
              ...sellingPlanGroup
            }
          }
        }
      }
      ${this.fragments()}
      `,
      {id:`gid://shopify/Product/${id}`}
    );
  }
  additionalVariantQuery() { return '';}
  additionalProductQuery() { return '';}
  regular_price(variant=null) {
      return this.selectedVariant.price;
  }
  display_regular_price() {
      return `$${this.regular_price().toFixed(2)}`
  }
  apply_discount(price,selling_plan) {
      return price*(1-((selling_plan)?selling_plan.discount:0));
  }
  currentOrLastSellingPlan() {
    let selling_plan = this.selling_plan;
    if (!selling_plan) {
        selling_plan = this.config.last_selling_plan;
    }
    return selling_plan;
  }
  discounted_price() {
      
      return this.apply_discount(this.selectedVariant.price,this.currentOrLastSellingPlan());
  }
  display_current_price() {
    if (this.selling_plan) {
          return this.display_discounted_price();
      } else {
          return this.display_regular_price();
      }
  }
  current_price() {
      if (this.selling_plan) {
          return this.discounted_price();
      } else {
          return this.regular_price();
      }
  }
  frequency_label() {
      return this.selling_plan?this.selling_plan.label:'';
  }
  display_discounted_price() {
      return `$${this.discounted_price().toFixed(2)}`
  }
  subscription_label() {
      return `${this.config.subscription_label} `;
  }
  onetime_label() {
      return this.config.onetime_label;
  }
  killReCharge() {
      this.rci = window.setInterval(()=>{
          let recharge = document.querySelector(".rc-container-wrapper");
          if (recharge) {
              recharge.parentElement.removeChild(recharge);

              window.clearInterval(this.rci)
          }
      },200)

  }
  getFormVariantField() {
    return document.querySelector(this.config.form_selector).querySelector('[name="id"]')
  }
  subscriptionsMontorForm() {
      console.error("monitoring form")
      document.addEventListener("srd:formValue:changed",event=>{
        let action = event.detail;
        if (action.field=="id") {
          this.selectedVariant = this.variants.find(variant=>variant.id==parseInt(action.value))
        }
      })
      this.monitorForm(this.form(),"id")
  }
  onetime_label_extra() {
      return ``;
  }
  subscriptions_label_extra() {
      return ''
  }
  onetime_block_extra() {
      return ``;
  }
  subscriptions_block_extra() {
      return ``; }
  container_extra() {
      return '';
  }
  delivery_string() {
      return 'Delivers every'
  }
  format_label(label) {
      return label;
  }
  broadcastPlan(id) {
      document.dispatchEvent(new CustomEvent("srd:subscriptions:planUpdated",{bubbles:true,detail:id}))
  }
  broadcastPrice() {
      
      document.dispatchEvent(new CustomEvent("srd:subscriptions:priceUpdated",{bubbles:true,detail:this.current_price()}))
  }
  
  renderSellingPlanSelector(plans) {
      let selected_plan = this.selling_plan||this.config.last_selling_plan;
      return `
      <div class="options-selector ${plans.length>1?'multiple-options':''}">
        <select name="selling_plan_id" id="srd-shipping_interval_frequency" class="srd-select srd-select__frequency styled replaced">
          ${plans.map(plan=>{
          return `
              <option value="${plan.id}" ${(selected_plan.id==plan.id)?'selected':''}>
                ${this.config.delivery_label} ${this.format_label(plan.label)}
              </option>`
      }).join('')}
        </select>
      </div>`;
  }
  
  headerContent() {
    return ``;
  }
  render() {
    super.render();
      this.root.innerHTML = `
      
    <div class="srd-subs-container" data-default-to-sub="{${this.config.default_to_subscription}">
      <div class="subscriptions-header">${this.headerContent()}</div>
      <div id="srd-radio_options" role="radiogroup" aria-labelledby="Purchase options">
        <div class="srd-block srd-block__type onetime-block -option srd-block__type__onetime ${!this.selling_plan?'srd-block__type--active':''}" >
          <div class="description">
           
            <label for="srd-purchase_type_onetime" class="srd-label srd-label__onetime body2">
               <span class="radio">
                <input type="radio" id="srd-purchase_type_onetime" name="purchase_type" value="onetime" data-selling-plan="" class="srd-radio srd-radio__onetime" ${!this.selling_plan?'checked':''} data-purchase-type="onetime">
              </span>
              <span class="srd-description">${this.onetime_label()}</span>
              <span id="srd-extra">${this.onetime_label_extra()}</span>
            </label>
          </div>
         <div class="block-extra-content">${this.onetime_block_extra()}</div>
      </div>
      <div class="srd-block srd-block__type subscription-block srd-block__type__autodeliver ${this.selling_plan?'srd-block__type--active':''} ${this.selling_plans.options && this.selling_plans.options.length>0?'':'d-none'}" >
          <div class="description">
           
          <label for="srd-purchase_type_autodeliver" class="srd-label srd-label__autodeliver body2">
               <span class="radio">
                <input type="radio" name="purchase_type" id="srd-purchase_type_autodeliver" value="autodeliver"  class="srd-radio srd-radio__autodeliver" ${this.selling_plan?'checked':''} data-purchase-type="autodeliver">
              </span>
              <span class="srd-description">
                <div class="">${this.subscription_label()}</div>
                <div class="display-price">${this.display_discounted_price()}</div>
              <span id="srd-price_autodeliver" class="srd-price srd-price__autodeliver" aria-label="recurring price"></span>
              <span id="srd-extra">${this.subscriptions_label_extra()}</span>
            </label>
            
          </div>
          <div class="block-extra-content">${this.subscriptions_block_extra()}</div>
          
        </div>
        
        <div class="container-extra">${this.container_extra()}</div>
      </div>
      <div id="srd-autodeliver_options" class="srd-block__type__options">
              ${this.renderSellingPlanSelector(this.selling_plans.options)}
        </div>
        ${this.extraHTML()}
      </div>
  `;
      
      this.setupEvents();
    
  }
  verifyVariant(value) {
    let variantField = this.getFormVariantField()
    let variantId = parseInt(variantField.value)
    let variantMapped = this.selling_plans.variantMap[parseInt(value)]
    if (variantMapped) {
      if (!variantMapped.includes(variantId)) {
        variantField.value = variantMapped[0]
      }
    }
    
  }
  setupSelectorEvents() {
      let shippingFrequency = this.root.querySelector("#srd-shipping_interval_frequency");
      this.addEventListener(shippingFrequency,"change",event=>{
          let value = event.target.options[event.target.selectedIndex].value;
          this.config.last_selling_plan = this.selling_plan;
          this.selling_plan = this.selling_plans.options.find(plan=>plan.id==parseInt(value));
          
          this.broadcastPlan(value)
          this.broadcastPrice()
          this.setSellingPlan(value)
          
          
          this.verifyVariant(value)
          this.render()
      })
  }
  setupEvents() {
      let plan_input = this.formField("selling_plan")
      if (!plan_input) {window.clearInterval(this.id);
          plan_input = document.createElement("input");
          plan_input.type="hidden";
          plan_input.name="selling_plan";
          document.querySelector(this.config.form_selector).appendChild(plan_input);
      }

      
      if (this.selling_plan) {
          this.setSellingPlan(this.selling_plan.id)
          this.broadcastPlan(this.selling_plan.id)
          this.broadcastPrice()
      }
      this.setupSelectorEvents();
      this.root.querySelectorAll('input[name="purchase_type"]').forEach(radio=>{
          this.addEventListener(radio,"change",event=>{

              switch(radio.dataset.purchaseType) {
                  case "onetime":
                      this.config.last_selling_plan = this.selling_plan;
                      this.selling_plan = null;
                     this.setSellingPlan("")
                      
                      break;
                  case "autodeliver":

                      if (this.config.last_selling_plan) {
                          this.selling_plan = this.config.last_selling_plan;
                      } else {
                          this.selling_plan = this.selling_plans.options[0];
                      }
                      this.setSellingPlan(this.selling_plan.id)
                      
                      
                      this.verifyVariant(this.formValue("selling_plan"))
                      break;

              }
              this.broadcastPrice();
              this.broadcastPlan(this.formValue("selling_plan"))
              this.render();

          });
      })

  }

  extraHTML() {
      return '';
  }
}