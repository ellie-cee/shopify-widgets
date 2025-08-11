class SrDBasketHandler {
    constructor() {
      this.baskets = []
      this.newBasket()
    }
    count() {
      return this.baskets.length;
    }
    load(index) {
      if (this.baskets[index]) {
        this.basketIndex = index
      }
      return this;
    }
    clone(index) {
      if (this.get(index)) {
        
        let clonedBasket = JSON.parse(JSON.stringify(this.get(index)))
        this.baskets.push(clonedBasket)
        this.basketIndex = this.baskets.length-1;  
      }
      
    }
    newBasket() {
      this.basketIndex = this.baskets.length;
      this.baskets.push({
        "id":crypto.randomUUID(),
        "contents":{},
        geometry: {sides:[],points:0},
      })
      return this;
    }
    clear(index=null) {
      if (index==null) {
        index = this.basketIndex;
      }
      this.baskets[index].contents={};
      
      return this;
    }
    save() {}
    loadAll(basketsObject) {
      if (basketsObject) {
          this.baskets = basketsObject;
          this.basketIndex = this.baskets.length-1;  
        } else {
          this.newBasket()
        }
    }
    render(basketIndex=null) {}
    renderBasketEntry(basketIndex,entry,details) {}
  
   clearSection(section) {
      delete this.baskets[this.basketIndex].contents[section]
   }
    get(index=null) {
      if (index==null) { index = this.basketIndex;}
      return this.baskets[index]
    }
    getSection(section,basketIndex) {
      
      return this.get(basketIndex).contents[section]
    }
    setSection(type,value) {
        this.baskets[this.basketIndex].contents[type] = value
    }
    total(index=null) {
          let total = 0;
          Object.values(this.get(index).contents).forEach(basket=>{
              total+=basket.reduce((a,b)=>a+(b.product.variant[0].price.amount*b.quantity),0)
          })
          return formatMoney(total*100)
    }
    updateQuantity(basketIndex,variantId,quantity) {
        
        Object.values(this.baskets[basketIndex].contents).forEach(productSet=>{
          productSet.forEach(entry=>{
            if (entry.id==variantId)
                entry.quantity = quantity;    
            })
        })
    }
    variantImage(product,variant) {  
    
    if (variant.image) {
      return variant.image.url.split("?")[0];
    }
    return product.featuredImage.url.split("?")[0]
  }
  variantImageAlt(product,variant) {
    if (variant.image) {
      return variant.image.alt;
    }
    return product.featuredImage.alt
  }
  lineItemProperties(item) {
    return {}
  }
  async addToCart(basketIndex=null) {
    
      let payload = {items:[]}
      let basket = this.baskets[basketIndex]
    
      Object.values(basket.contents).forEach(productSet=>{
        productSet.forEach(entry=>{
          payload.items.push({
            id:entry.id.split("/").pop(),
            quantity:entry.quantity,
            properties:this.lineItemProperties(entry)
          })
        })
      })
    
      payload.items = payload.items.reverse()
      let config = {
          method: 'POST',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
      }
      return fetch("/cart/add.js",config)
          .then((response) => response.json())
    }
    delete(basketIndex) {
      this.baskets[basketIndex] = null;
      this.baskets = this.baskets.filter(basket=>basket!=null)
      this.basketIndex = this.baskets.length-1;
      
    }
}