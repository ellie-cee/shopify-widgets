class SrDQuickAdd extends SrD {
  constructor(options) {
      super(options);
      this.getCart().then(cart=>{
          this.cart = cart;
          
          this.load(this.config.product).then(q=>{
              
              this.processLoad(q.data)
          })
      })   
  }
  refresh() {
    this.getCart().then(cart=>{
          this.cart = cart;
          let cart_variants = this.cart.items.map(item=>item.variant_id);
          let our_variants = this.variants.map(variant=>variant.id);
          this.variants.filter(variant=>!cart_variants.includes(variant.id)).forEach(variant=>{
            variant.quantity=0;
            variant.cartLineId = null;
          })
          this.cart.items.forEach(item=>{
            let my_variant = this.variants.find(variant=>variant.id==item.id);
            if (my_variant) {
              my_variant.cartLineId = item.key;
              my_variant.quantity = item.quantity;
            }
          })
          this.render();
    })
          
  }
  processLoad(data) {
    
      this.product = data.product;
      this.variants = this.product.variants.nodes.map(variant=>{
          let variantId = this.gid2id(variant.id);
          let item_in_cart = this.cart.items.find(item=>item.id==variantId);
          let details = {
              id:variantId,
              title:variant.title,
              image:variant.image?variant.image.url:null,
              price:parseFloat(variant.price.amount),
              available:variant.availableForSale,
              availableItems:variant.quantityAvailable,
              cartLineId:item_in_cart?item_in_cart.key:null,
              quantity:item_in_cart?item_in_cart.quantity:0,
          };
          return {...details,...this.additionalVariantDetails(variant)}
      });
      this.render();
  }
  load(id,after=null) {
      return this.graphql(`
          query getProduct($id:ID!) {
              product(id:$id) {
                  id
                  title
                  handle
                  options {
                      values
                  }
                  featuredImage {
                      id
                      url
                      altText
                  }
                  variants(first:100) {
                      nodes {
                          availableForSale
                          quantityAvailable
                          price {
                              amount
                          }
                          id
                          title
                          image {
                              url
                          }
                          ${this.additionalvariantQuery()}
                      }
                  }
                  media(first:100) {
                      nodes {
                          mediaContentType
                          alt
                          id
                          ... on MediaImage {
                              image {
                                  src: url
                                  width
                                  height
                              }
                          }
                          ... on Video {
                              sources {
                                  src: url
                                  mimeType
                                  format
                                  height
                                  width
                              }
                          }
                      }
                      pageInfo {
                          hasNextPage
                          endCursor
                      }
                  }
              }
              ${this.additionalProductQuery()}
          }`,
          {id:`gid://shopify/Product/${id}`}
      )   
  }
  additionalProductQuery() { return '';}
  additionalvariantQuery() { return '';}
  additionalVariantDetails(variant) { return {};}
  render() {
    
    let html = `
      <div class="srd-quick-add-content ${this.totalItems()>0?'active':''}">
        ${this.innerHTML()}
      </div>
      `
      SrDModal.show(html);
      this.root = document.querySelector(".srd-quick-add-content");
  }
  setupEvents() {}
  variantTitle(variant) {
      return variant.title;
  }
  extra() {return ''}
  activeVariants() {
    return this.variants.filter(variant=>variant.cartLineId && variant.quantity>0);
  }
  
  removeAll() {
    let payload = {};
    this.pause();
    
    this.activeVariants().forEach(variant=>payload[variant.id.toString()]=0);
    this.updateCart({updates:payload}).then(response=>{
      this.variants.forEach(variant=>{
        variant.quantity=0;
        variant.cartLineId = null;
      })
      this.render()
    });
  }
  removeAllCB(items) {
    this.pause()
    if (items.length<1) {
      this.variants.forEach(variant=>{
        variant.quantity=0;
        variant.cartLineId = null;
      })
      this.render()
    } else {
      let next = items.pop();
      this.changeCart({
        id:next.id.toString(),
        quantity:0,
      }).then(response=>{
        let my_variant = this.variants.find(variant=>variant.id==parseInt(next.id));
        if (my_variant) {
          my_variant.quantity=0;
          my_variant.cartLineId = null;
          this.render();
        }
        this.removeAllCB(items);
      })
    }
  }
  pause() {
    this.root.querySelectorAll("input[type='number']").forEach(input=>input.disabled = true)
  }
  innerHTML() {
    return ``
  }
  totalItems() {
      return this.activeVariants().reduce((a,b)=>a+b.quantity,0)
  }
  totalPrice() {
    return this.activeVariants().reduce((a,b)=>a+(b.quantity*b.price),0);
  }

  updateVariant(event) {
      let data = event.detail.dataset;
      
      let variant = this.variants.find(item=>item.id==parseInt(data.variantId));
      if (variant) {
          if (event.detail.value<1) {
              if (variant.cartLineId) {
                  this.pause()
                  
                  this.removeItemFromCart(variant.id.toString()).then(response=>{
                    variant.quantity = 0;
                    variant.cartLineId = null;
                    this.render()
                  })
              } else {
                variant.quantity = 0;
                variant.cartLineId = null;
                this.render()
              }
          } else {
            if (variant.cartLineId) {
              this.pause()
              this.updateItemCount(variant.id.toString(),event.detail.value).then(response=>{
                variant.quantity=parseInt(event.detail.value);
                this.render();
              })
            } else {
              this.pause();
              
              this.addToCart({id:data.variantId,quantity:1}).then(response=>{
                variant.cartLineId = response.key;
                variant.quantity=1;
                this.render();
              })
            }
          }
      }
  }
}