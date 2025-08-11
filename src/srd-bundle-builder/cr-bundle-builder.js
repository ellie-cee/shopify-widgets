class SrDBundleBuilder extends SrD {
    defaults() {
      return {
        target:".srd-bundle-builder",
        "type":"Add All"
      }
    }
    constructor(options) {
        super(options);

        this.fetch().then(q=>q.init())
    }
    init(q) {
      this.product = this.collapse_query(q).data.product;
      this.options = this.product.options;
      this.variants = this.product.variants.map(variant=>{
        return {
          id:this.gid2id(variant.id),
          options:variant.selectedOptions.map(option=>option.value),
          available:variant.available,
          title:variant.title,
          price:parseFloat(variant.price.amount),
          quantity:variant.quantity||0,
        }
      })
      this.selectedVariant = this.variants.find(variant=>variant.id==this.config.selected.id)
        this.options.forEach(option=>{
          option.values = option.values.map(value=>{
            let value_variants = this.product.variants
              .filter(variant=>variant.selectedOptions.find(so=>so.name==option.name && so.value==value) && variant.available);
            let ret =  {
              "value":value,
              variants:value_variants.map(variant=>this.gid2id(variant.id)),
              totalInventory: value_variants.reduce((a,b)=>a+b.quantity,0)          
            };
            ret.available = ret.variants.length>0;
            return ret;
          })
        });
        
    }
    fetch() {
      return this.graphql(
          `query getProduct($id:ID!) {
              product(id:$id) {   
                  id
                  options {
                      name
                      values
                  }
                  ${this.additionalProductFields()}
                  variants(first:100) {
                      nodes {
                          id
                          title
                          quantity: quantityAvailable
                          price {
                              amount
                          }
                          image {
                              alt: altText
                              url
                          }
                          available: availableForSale
                          selectedOptions {
                              name
                              value
                          }
                          ${this.additionalVariantFields()}
                      }
                  }
              }
          }`,
          {
              id:`gid://shopify/Product/${this.config.product_id}`
          }
      )
  }
  setup_events() {}
  additionalProductFields() {return '';}
  additionalVariantFields() {  return ''; }
}