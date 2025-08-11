class SrDOptionsHandler {
  constructor(productOptions,variants) {
    
     []
    this.optionsMap = {}
    this.variantsMap = {}
    this.options = productOptions.map(option=>{
      return {name:option.name,values:option.values.map(value=>value.value)};
    });
    variants.forEach(variant=>{
      let key = variant.options.map(option=>option.value).join("|");
      this.optionsMap[key] = {
        values: variant.options.map(option=>option.value),
        variantId: variant.id.split("/").pop(),
        available: variant.available,
        price: parseFloat(variant.price.amount),
      }
    })
  }

  allOptionsMap(options,index) {
    
  }
  
  optionNames() {
    return Object.keys(this.options)
  }
  getVariant(options) {
    return this.optionsMap[options.join("|")];
  }
}
