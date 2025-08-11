class MarketHouseSticky extends SrdRenderedSticky {
    constructor(options) {
        super(options)
        
    }

    additionalProductQuery() {

    }
    additionalVariantQuery() {
        
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