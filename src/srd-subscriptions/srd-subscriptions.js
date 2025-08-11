class SrDSubscriptions extends SrD {
    constructor(options) {
        super(options)
    
        this.load_product(this.config.product)
          .then(q=>{
              console.error(JSON.parse(JSON.stringify(q)))
              this.config.product = q.data.product;
              this.config.variants = q.data.product.variants.nodes.map(variant=>this.addVariant(variant));
              if (!this.config.variant_id) {
                this.config.selected_variant = this.config.variants[0];
              } else {
                this.config.selected_variant = this.config.variants.find(variant=>variant.id==this.config.variant_id)
              }
              if (q.data && q.data.product) {
                if (q.data.product.sellingPlanGroups.nodes.length>0) {
                  this.selling_plans = this.parseSellingPlans(q);
                  if (!this.config.selling_plan_id) {
                    if (this.config.default_to_subscription) {
                        this.config.selling_plan= this.selling_plans.options[0];  
                        this.config.last_selling_plan = this.config.selling_plan;
                      } else {
                        this.config.last_selling_plan= this.selling_plans.options[0];  
                      }
                    } else {
                      this.config.selling_plan = this.selling_plans.options.find(plan=>plan.id==this.config.selling_plan_id);  
                      this.config.last_selling_plan = this.config.selling_plan;
                    }
                  }        
                }
              this.afterLoad();
          });
   }
  afterLoad() {}
  addVariant(variant) {
    return {
      id:this.gid2id(variant.id),
      price:parseFloat(variant.price.amount)
    }
  }
  parseSellingPlans(q) {
    return this.parseSellingPlansV2(q);
  }
  parseSellingPlansV1(q) {
    let group = q.data.product.sellingPlanGroups.nodes.pop();
    return {
      group_id:group.name,
      options:group.sellingPlans.nodes.map(selling_plan=>{
        return {
          id:this.gid2id(selling_plan.id),
          label:selling_plan.options[0].value,
          discount:selling_plan.priceAdjustments[0].adjustmentValue.percent/100,
        };
      }),
    };
  }
  parseSellingPlansV2(q) {
    let by_app = {};

    q.data.product.sellingPlanGroups.nodes.forEach(group=>{
      if (!by_app[group.appName]) {
        by_app[group.appName] = []
      }
        
      by_app[group.appName].push({
          id:this.gid2id(group.sellingPlans.nodes[0].id),
          "label":group.name,
          "discount":group.sellingPlans.nodes[0].priceAdjustments[0].adjustmentValue.percent/100
        });
    });

    return {
      group_id:this.config.subscription_label,
      options:(this.config.use_app)?by_app[this.config.use_app]:Object.values(by_app).pop()
    };
  }
  load_product(id) {
    return this.graphql(`
    query getProducts($id: ID!) {
      product(id:$id) {
        id
        variants(first:100) {
          nodes {
            id
            price {
              amount
            }${this.additionalVariantQuery()}
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
    }`,
    {id:`gid://shopify/Product/${id}`}
    );
  }
  additionalVariantQuery() { return '';}
  additionalProductQuery() { return '';}
  regular_price(variant=null) {
    return this.config.selected_variant.price;
  }
  display_regular_price() {
    return `$${this.regular_price().toFixed(2)}`
  }
  apply_discount(price,selling_plan) {
    return price*(1-((selling_plan)?selling_plan.discount:0));
  }
  discounted_price() {
    let selling_plan = this.config.selling_plan;
    if (!selling_plan) {
      selling_plan = this.config.last_selling_plan;
    }
    return this.apply_discount(this.config.selected_variant.price,selling_plan);
  }
  current_price() {
    if (this.config.selling_plan) {
      return this.discounted_price();
    } else {
      return this.regular_price();
    }
  }
  frequency_label() {
    return this.config.selling_plan?this.config.selling_plan.label:'';
  }
  display_discounted_price() {
    return `$${this.discounted_price().toFixed(2)}`
  }
  subscription_label() {
    return `${this.config.subscription_label}`;
  }
  onetime_label() {
    return this.config.onetime_label;
  }
}