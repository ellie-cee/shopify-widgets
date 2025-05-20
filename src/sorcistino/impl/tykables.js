class TykablesSubscription extends Sorcistino {
  constructor(options) {
      super(options);
      this.data.options = []
      this.data.selectedOptions = []
      this.data.optionValues = []
      this.data.selectedVariant = [];
      this.data.variants = []
      this.data.sellingPlans = [];
      this.data.product = [];
      this.screens = [];
      
    
  }
  load_data() {
    this.getProduct(this.config.product);
  }
  getProduct(id) {
      this.graphql(this.query(),{id:`gid://shopify/Product/${id}`}).then(q=>{
          this.initProduct(q);
      })
  }
  selectedVariant(index=0) {
    
    return this.data.variants[index].find(variant=>variant.signature==this.data.selectedOptions[index].join("|"))||this.data.variants[index][0]
  }
  mapVariants(product) {
    return product.variants.nodes.map(variant=>{
      return {
        "id":this.gid2id(variant.id),
        signature: variant.selectedOptions.map(option=>option.value).join("|"),
        options:variant.selectedOptions.map(option=>option.value),
        option_names:variant.selectedOptions.map(option=>option.value),
        price:parseFloat(variant.price.amount),
        available: variant.availableForSale
      }
    });
  }
  setProduct(product,index=0) {
    this.data.product[index] = product;
    this.data.options[index] = this.data.product[index].options;
    this.data.optionValues[index] = this.data.product[index].options.map(opt=>opt.name);
    this.data.variants[index] = this.mapVariants(this.data.product[index])
    this.data.sellingPlans[index] = [];
    this.data.product[index].sellingPlanGroups.nodes.forEach(group=>group.sellingPlans.nodes.forEach(plan=>{
      this.data.sellingPlans[index].push({
        id:this.gid2id(plan.id),
        label:plan.options[0].value,
      });
    }))
      
    
    this.data.selectedOptions[index] = this.data.variants[index][0].options;
    
    
  }
  init(q) {
    
    this.initProduct(q)
  }
  initProduct(q) {
    console.error("ip",q)
    this.data.parentProduct = q.data.product;
    this.data.parentVariants = this.mapVariants(q.data.product);
    this.data.parentSellingPlans = []
    this.data.parentProduct.sellingPlanGroups.nodes.forEach(group=>group.sellingPlans.nodes.forEach(plan=>{
      this.data.parentSellingPlans.push({
        id:this.gid2id(plan.id),
        label:plan.options[0].value,
      });
    }))
    this.data.children = []
    if (this.data.parentProduct.childProducts) {
      this.data.children = this.data.parentProduct.childProducts.products.nodes;
      this.data.children.forEach((child,index)=>this.setProduct(child,index));
    } else {
        this.setProduct(this.data.parentProduct,0);
    }
    if (this.screens.length>0) {
      if (this.screens[0].preserve()) {
        this.screens = [this.screens[0]];
      } else {
        this.screens = [];
      }
    }
    
    let startingIndex = this.screens.length;
    this.data.product.forEach((product,productIndex)=>{
      this.data.options[productIndex].forEach((option,index)=>{
        this.screens.push(
          new TykablesSubscriptionScreen(
          this,
          {
            option:option.name,
            title:`Choose your ${option.name}`,
            values: option.values,
            index:index,
            productIndex:productIndex
          },
          index+startingIndex
        ));  
      });
    });
    this.screens.push(new TykablesSubscriptionFinalScreen(
      this,
      {
        "title":"Need anything else?",
        index:this.screens.length,
      },
      this.screens.length,
    ))
    this.screen = 0;
    
    this.render(startingIndex)
  }
  additionalProductQuery() {
      return `
          options(first:3) {
            name
            values
          }
          descriptionHtml
          rating: metafield(namespace:"judgeme",key:"badge") {
              value
          }
          title
          description: metafield(namespace:"srd",key:"product_description") {
              value
          }
          childProducts: metafield(namespace:"gearbox",key:"products") {
            products: references(first:10) {
              nodes {
                ... on Product {
                  id
                  variants(first:100) {
                      nodes {
                          id
                          price {
                              amount
                          }
                          title
                          availableForSale
                          selectedOptions {
                            name
                            value
                          }
                      }
                  }
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
                options(first:3) {
                  name
                  values
                }
                descriptionHtml
                rating: metafield(namespace:"judgeme",key:"badge") {
                  value
                }
                title
                description: metafield(namespace:"srd",key:"product_description") {
                  value
                }
                featuredImage {
                  url
                }      
              }
            }
          }
        }
        featuredImage {
          url
        }
      `
  }
  additionalVariantQuery() {
    return `
      title
      availableForSale
      selectedOptions {
        name
        value
      }
    `
  }
  query() {
      return this.productQuery()
  }
  finalize() {
    let payload = {
      items:[{
          id:this.data.parentProduct.variants.nodes[0].id.split("/").pop(),
          selling_plan: (this.data.parentSellingPlans && this.data.parentSellingPlans.length>0)?this.data.parentSellingPlans[0].id:null,
          quantity:1,
        }]
    }
    if (this.data.product.length>0) {
        payload.items[0].properties = {
          _bundleParentID:this.uuid,
          _bundleContents:this.data.product.filter(product=>this.data.parentProduct.id!=product.id).map((child,index)=>this.gid2id(child.variants.nodes[0].id)),
          _bundleType:"gearbox",
        };
        this.data.product.forEach((product,index)=>{
        if (product.id!=this.data.parentProduct.id) {
          payload.items.push(
            {
              id:this.selectedVariant(index).id,
              selling_plan:this.data.sellingPlans[index][0].id,
              quantity:1,
              properties:{
                _bundleID:this.uuid,
                _bundleType:"gearbox",
              }
            }
          )
        }
      });
    }
    
    
    this.addToCart(payload);
  }
  imageFor(index=0) {
    if (this.data.product[index].featuredImage) {
      return this.data.product[index].featuredImage.url
    }
  }
  displayPrice() {
    return this.selectedVariant().price.toFixed(2)
  }
  screenCount() {
    return screens.length()
  }
}

class TykeablesGearBox extends TykablesSubscription {
load_data() {
  this.graphql(
    `
    query getConfig($handle:MetaobjectHandleInput) {
      config: metaobject(handle:$handle) {
        name: field(key:"name") {
          value
        }
        media: field(key:"group_image") {
          entry: reference {
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
        styles: field(key:"parent_products") {
          value
          products: references(first:3) {
            nodes {
              ... on Product {
                title
                id
                options(first:3) {
                  name
                  values
                }
              } 
            }
          }
        }
      }
    }
    `,
    {handle:{handle:this.config.group,type:'gear_box_groups'}}
  ).then(q=>{
    console.error(q)
    this.init(q);
  })
}
init(q) {
  this.data.q = q;
  this.data.image = q.data.config.media?q.data.config.media.entry.image.url:'';
  this.data.productsList = q.data.config.styles.products.nodes.map(node=>{
          return {id:this.gid2id(node.id),title:node.title}
  });
  if (this.data.productsList.length>1) {
    this.screens.push(
      new TykablesGearSelectionScreen(
        this,
        {
          products:this.data.productsList,
          title:"Select your Style",
        },
        0
      )
    )
    this.render()  
  } else {
    this.getProduct(this.data.productsList[0].id)
  }
  
}
imageFor(index=0) {
  return this.data.image;
}
displayPrice() {
  return this.data.parentVariants[0].price.toFixed(2)
}
screenCount() {
  return this.childProducts.reduce((a,b)=>a+b.reduce)
}
}

class TykablesSubscriptionScreen extends SorcistinoScreen {
  render() {
    let product = this.parent.data.product[this.data.productIndex]
    this.parent.setContent(`
      <div class="panels" data-uuid="${this.uuid}">
        <div class="rounded-section db-column db-image-column js-db-image-column d-flex justify-content-center align-items-center">
          <div class="image-wrapper js-image-wrapper">
            <img src="${this.parent.imageFor(this.data.productIndex)}" alt="" width="537" height="538" class="no-pointer-events">
          </div>
        </div>
        <div class="rounded-section db-column db-main-column js-main-column d-flex justify-content-center align-items-center">
          <div class="inner">
            <div class="eyebrow color-poppy h5">
              Subscriptions
            </div>
            <h1 class="h1 db-heading first-heading js-first-heading">
              ${product.title}
            </h1>
            <div class="h1 db-heading last-heading js-last-heading d-none"></div>
              <div class="review-app-wrapper body2 pdp-stars">${product.rating.value}</div>
              <h3 class="h5 choose-option js-choose-option-Size js-choose-option">Choose ${this.data.option}</h3>
                <div class="switch-field js-switch-field switch-field-Size">
                  ${this.data.values.map(value=>`
                    <input type="radio" id='${this.data.option}-${value}' name="option-${this.data.option}" value='${value}' class="js-variant-button variant-button js-variant-button0-radio1" data-option-name="${this.data.option}" data-option-index="${this.index}" ${value==this.data.selectedValue?' checked':''}>
                    <label for='${this.data.option}-${value}' class="cta">${value}</label>
                    `).join("\n")}
                  </div>
                  <div class="price-add-wrapper d-flex w-100 justify-content-between align-items-center flex-wrap flex-lg-nowrap">
                    <span class="h3 db-box-price js-box-price d-block js-summary-price">$<span class="money">${this.parent.displayPrice()}</span></span>
                  </div>
                  <div class="body2 body-copy textile js-body-copy">
                    <div class="js-hero-copy"><p>${product.description?product.description.value.split("\n").map(para=>`<p>${para}</p>`).join("\n"):''}</p></div>
                      <div class="d-none js-last-copy"></div>
                    </div>
                  </div>
                </div>
              </div>
    `);

  }
  screenRoot() {
    return document.querySelector(`[data-uuid="${this.uuid}"]`);
  }
  setupEvents() {
    let screenRoot = this.screenRoot();
    if (screenRoot) {
      screenRoot.querySelectorAll("input").forEach(option=>option.addEventListener("click",event=>{
        this.data.selectedValue = option.value;
        this.parent.data.selectedOptions[this.data.productIndex][this.data.index] = option.value;

        this.is_completed = true;
        this.parent.next()
      }))
    }
    
  }
  title() {

    return `<h2 class="h2 progress-bar-heading js-choose-style-heading js-steps-heading js-steps-title d-none d-lg-block">Choose your ${this.data.option}</h2>`
  }
}
class TykablesGearSelectionScreen extends TykablesSubscriptionScreen {
preserve() {
  return true;
}
title() {
 return `<h2 class="h2 progress-bar-heading js-choose-style-heading js-steps-heading js-steps-title d-none d-lg-block">${this.data.title}</h2>`
}
render() {
    let product = this.parent.data.product[this.data.productIndex]
    this.parent.setContent(`
      <div class="panels" data-uuid="${this.uuid}">
        <div class="rounded-section db-column db-image-column js-db-image-column d-flex justify-content-center align-items-center">
          <div class="image-wrapper js-image-wrapper">
            <img src="${this.parent.imageFor()}" alt="" width="537" height="538" class="no-pointer-events" style="width:537;height:auto">
          </div>
        </div>
        <div class="rounded-section db-column db-main-column js-main-column d-flex justify-content-center align-items-center">
          <div class="inner">
            <div class="eyebrow color-poppy h5">
              Subscriptions
            </div>
            <h1 class="h1 db-heading first-heading js-first-heading">
              Select your Style
            </h1>
            <div class="h1 db-heading last-heading js-last-heading d-none"></div>
              <div class="review-app-wrapper body2 pdp-stars"></div>
                <h3 class="h5 choose-option js-choose-option-Size js-choose-option"></h3>
                  <div class="switch-field js-switch-field switch-field-Size">
                    ${this.data.products.map((value,index)=>`
                      <input type="radio" id='${value.id}-${index}' name="${value.id}-${index}" value='${value.id}' class="js-variant-button variant-button js-variant-button0-radio1 js-style-button"}>
                      <label for='${value.id}-${index}' class="cta">${value.title.split(" ").pop()}</label>
                    `).join("\n")}
                  </div><!--
                  <div class="price-add-wrapper d-flex w-100 justify-content-between align-items-center flex-wrap flex-lg-nowrap">
                    <span class="h3 db-box-price js-box-price d-block js-summary-price">$<span class="money"></span></span>
                  </div>-->
                  <div class="body2 body-copy textile js-body-copy">
                    <div class="js-hero-copy"><p></p></div>
                    <div class="d-none js-last-copy"></div>
                  </div>
                </div>
              </div>
            </div>
    `);
  }
  setupEvents() {
    let screenRoot = this.screenRoot();
    if (screenRoot) {
      screenRoot.querySelectorAll("input").forEach(option=>option.addEventListener("click",event=>{
        this.parent.getProduct(option.value)
      }))
    } 
  }
}
class TykablesSubscriptionFinalScreen extends TykablesSubscriptionScreen {
render() {
 this.parent.setContent(
   `<div class="panels" data-uuid="${this.uuid}">
        <div class="rounded-section db-column db-image-column js-db-image-column d-flex justify-content-center align-items-center">
          <div class="rebuy"></div>
        </div>
        <div class="rounded-section db-column db-main-column js-main-column d-flex justify-content-center align-items-center">
          <div class="inner">
            <div class="eyebrow color-poppy h5">
              Subscriptions
            </div>
            <h1 class="h1 db-heading first-heading js-first-heading">
              ${this.data.title}
            </h1>
            <div class="h1 db-heading last-heading js-last-heading d-none"></div>
              <div class="review-app-wrapper body2 pdp-stars"></div>
                <h3 class="h5 choose-option js-choose-option-Size js-choose-option"></h3>
                <div class="price-add-wrapper d-flex w-100 justify-content-between align-items-center flex-wrap flex-lg-nowrap">
                  <span class="h3 db-box-price js-box-price d-block js-summary-price">$<span class="money">${this.parent.displayPrice()}</span></span>
                </div>
                <div class="body2 body-copy textile js-body-copy">
                  <button class="cta grid-item-cta cta-foreward-lite-primary js-cart">Continue to Cart</button>
                </div>
              </div>
            </div>
            
 `)
}
setupEvents() {
  this.screenRoot().querySelector(".js-cart").addEventListener("click",event=>location.href="/cart");
  let widget = document.querySelector(`.rebuy-holder [data-rebuy-id="${this.parent.config.rebuy_id}"]`);
  if (widget) {
    widget.parentNode.removeChild(widget);
    this.screenRoot().querySelector(".rebuy").appendChild(widget);
  }
}
title() {

    return `<h2 class="h2 progress-bar-heading js-choose-style-heading js-steps-heading js-steps-title d-none d-lg-block">${this.data.title}</h2>`
  }
}