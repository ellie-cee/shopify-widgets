class LooseLeafQuickAdd extends SrDQuickAdd {
  constructor(options) {
      super(options);
      document.addEventListener("srd:quantity:changed",event=>{
        
        this.updateVariant(event);
      })
      document.addEventListener("srd:quantity:remove",event=>{
        this.updateVariant(event);
      })
      this.quanttity
  }
  render() {
    super.render();
    LooseLeafQuickAddQuantity.setupEvents();
      
    this.root.querySelector(".remove-all").addEventListener("click",event=>{
      this.removeAll();
    });
    this.root.querySelector(".view-cart").addEventListener("click",event=>{
      window.Rebuy.Cart.fetchShopifyCart(callback=>window.Rebuy.SmartCart.show())
      SrDModal.close();
    })
  }
  innerHTML() {
      let prices = this.variants.filter(variant=>variant.available).map(variant=>variant.price);
     
      return `
          <div class="body">
            <div class="image">
                <img src="${this.product.featuredImage.url}&width=240" alt="${this.product.featuredImage.altText}"/>
            </div>
            <div class="content">
                <h1 class="product-title">${this.product.title}</h1>
                <div class="product-price-range">
                    <span class="min">$${Math.min(...prices).toFixed(2)}</span>
                    -
                    <span class="max">$${Math.max(...prices).toFixed(2)}</span>
                </div>
                <div class="variant-list">
                    ${this.variants.map(variant=>this.renderVariantLine(variant)).join("")}
                </div>
            </div>
          </div>
          <div class="footer">
          <div class="summary">
                <div class="items field">
                  <span><button class="view-cart button button--full-width">View Cart</button></span>
                </div>
                <div class="items field remove">
                  <span class="remove-all">
                  <button class="remove-all-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false" class="icon icon-remove">
                      <path d="M14 3h-3.53a3.07 3.07 0 00-.6-1.65C9.44.82 8.8.5 8 .5s-1.44.32-1.87.85A3.06 3.06 0 005.53 3H2a.5.5 0 000 1h1.25v10c0 .28.22.5.5.5h8.5a.5.5 0 00.5-.5V4H14a.5.5 0 000-1zM6.91 1.98c.23-.29.58-.48 1.09-.48s.85.19 1.09.48c.2.24.3.6.36 1.02h-2.9c.05-.42.17-.78.36-1.02zm4.84 11.52h-7.5V4h7.5v9.5z" fill="currentColor"></path>
                      <path d="M6.55 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5zM9.45 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5z" fill="currentColor"></path>
                    </svg>
                  </button>
                  <span>remove all</span>
                  </span>
                </div>
                
                <div class="field total-items">
                  <span>${this.totalItems()}</span>
                  <span>total items</span>
                </div>
                <div class="field price_total">$${this.totalPrice().toFixed(2)}</div>
              </div>
          </div>
          
    `
  }
  renderVariantLine(variant) {
      return `
      <div class="variant">
          <div class="title field">
          <span class="image">
            <img src="${variant.image}&crop=center&width=24">
          </span>
            <span class="title-text">
              ${this.variantTitle(variant)}
          </span>
          </div>
          <div class="quantity field">${variant.available?new LooseLeafQuickAddQuantity({min:0,max:variant.availableItems,value:variant.quantity,dataset:{"variant-id":variant.id,"line-id":variant.cartLineId}}).render():'Sold Out'}</div>
          <div class="price_per field">$${variant.price.toFixed(2)}</div>
          <div class="price_total field">$${(variant.price*variant.quantity)}</div>
      </div>
      `
  }
 
}