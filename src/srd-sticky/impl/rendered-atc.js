class SrdRenderedAtc extends SrDSticky {
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
    }
  
    setupEvents() {
    
  }
    
}
