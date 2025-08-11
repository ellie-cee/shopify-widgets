class MarketHouseSticky extends SrdRenderedAtc {
  constructor(options) {
      super(options)
      this.form = document.querySelector(`form[data-type="add-to-cart-form"]`);
      this.myForm = document.querySelector(".pdp-sticky-form")
      this.variantId = this.config.variantId;
      
      this.loadData()
  }
  
  loadData() {
    this.graphql(
      `
      query getProductData($id:ID!) {
        product(id:$id) {
          id
          title
          options(first: 3) {
              name
              values: optionValues {
                value: name
              }
          }
          featuredImage {
            alt: altText
            src: url
          }
          variants(first:50) {
              nodes {
                id
                title
                available: availableForSale
                image {
                  alt: altText
                  src: url
                }
                price {
                  amount
                }
                options: selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      
      `,
      {id:`gid://shopify/Product/${this.config.productId}`}
    ).then(q=>{
      this.init(q.data.product)
      
    })
  }
  init(product) {
    let variantBuilder = (variant)=>{
      let key = variant.id.split("/").pop()
      let newObject = {}
      newObject[key] = variant;
      return newObject;
    };
    console.error(product)
    this.optionsHandler = new SrDOptionsHandler(product.options,product.variants.nodes);
    this.variants = product.variants.nodes.reduce((a,b)=>Object.assign(a,variantBuilder(b)),{});
    this.selectedVariant = this.variants[this.variantId];
    this.quantity = this.form.querySelector('[name="quantity"]').value;
    this.product = product;
    this.monitorForm(this.form,"id","quantity");
    
      document.addEventListener("srd:formValue:changed",event=>{
        switch(event.detail.field) {
          case "id":
            this.selectedVariant = this.variants[event.detail.value];
            break;
          case "quantity":
            this.quantity = event.detail.value;
            break;
        }
        
        this.render()
      });
    document.addEventListener("srd:quantity:changed",event=>{
      this.quantity =  event.detail.value;
      this.unmonitoredAction(()=>{
        this.form.querySelector('[name="quantity"]').value = event.detail.value
      })
    })
    this.render()
    
  }
  currentPrice() {
    let amount = this.selectedVariant.price.amount;
    let amountAsDecimal = parseFloat(amount);
    if (amountAsDecimal % 1 > 0) {
      return amount;
    } else {
      return amount.split(".")[0]
    }
  }
  currentVariantOption(optionName) {
    return this.selectedVariant.options.find(option=>option.name==optionName).value;
  }
  render() {
    
    let innerHtml = `
      
        <input type="hidden" name="id" value="${this.selectedVariant?this.gid2id(this.selectedVariant.id):''}">
        <input type="hidden" name="quantity" value="${this.quantity}">
        <div class="product-info">
          <div class="product-image">
            <img src="${this.product.featuredImage.src}">
          </div>
          <div class="product-description">
            <div class="product-name">${this.product.title}</div>
            <div class="product-price">$${this.currentPrice()}</div>
          </div>
        </div>
        <div class="dummy"></div>
        <div class="pdp-sticky-atc">
          ${this.optionsHandler.options.map(option=>`
          <div class="pdp-sticky-select-holder">
            <select class="sticky-pdp-select" name="${option.name}">
            ${option.values.map(value=>`<option value="${value}" ${value==this.currentVariantOption(option.name)?' selected':''}>${value} ${option.name}</option>`).join("\n")}
            </select>
          </div>
        
        
        `).join("\n")}
          <div class="quantity-holder">
          ${new SrDQuantity({value:this.quantity,dataset:{}}).render()}
          </div>
          <div class="atc-button">
            ${this.renderATC()}
            
          </div>
        </div>
      
    `;
    this.sticky.innerHTML = innerHtml;
    this.reposition();
    this.setupEvents()
  }
renderATC() {
  if (!this.selectedVariant || !this.selectedVariant.available) {
    return `<button name="atc" class="btn btn--primary sticky-atc" disabled>Sold Out</button>`
  } else {
    return `<button name="atc" class="btn btn--primary sticky-atc">Add to cart</button>`
    
  }
}
setupEvents() {
  SrDQuantity.setupEvents();
  this.myForm.querySelectorAll("select").forEach(select=>select.addEventListener("change",event=>{
    let selectValue = select.options[select.selectedIndex].value
    let variant = this.optionsHandler.getVariant(Array.from(this.myForm.querySelectorAll("select")).map(select=>select.options[select.selectedIndex].value))
    
    this.variantId = variant.variantId;
    this.selectedVariant = this.variants[this.variantId];
    
      let variantSelects = document.querySelector(`variant-selects`);
      let field = variantSelects.querySelector(`variant-selects input[name="${select.name}"][value="${selectValue}"]`);
      field.click()
    
    
    this.render()
  }))
  document.querySelector(".srd-sticky.pdp-atc .sticky-atc").addEventListener("click",event=>{
    event.preventDefault();
    event.stopPropagation();
    this.form.querySelector('[name="add"]').click();
    
  })
  
}
  
}