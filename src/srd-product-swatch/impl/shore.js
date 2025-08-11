class ShoreSwatchHandler extends SrDProductSwatch {
    constructor(options) {
      super(options)
    }
    additionalFields() {
        return `
            inventoryLimit: metafield(namespace:"custom",key:"inventory_limit") {
                value
            }
        `
    }
    additionalVariantFields() {
        return `
            swatchColor: metafield(namespace:"custom",key:"variant_swatch_color") {
                value
            }
            swatchImage: metafield(namespace:"custom",key:"variant_swatch_image") {
                reference {
                    ... on MediaImage {
                        image {
                            url
                        }
                    }
                }
            }
        `
    }
     process(product) {
         this.config.inventoryLimit = this.product.inventoryLimit?parseInt(this.product.inventoryLimit.value):0;
         this.options.forEach(option=>{
           option.values.forEach(value=>{
             if (value.totalInventory<=this.config.inventoryLimit) {
               value.available = false;
             }
           })
         });
         this.variants.forEach(variant=>{
           if (variant.quantity<=this.config.inventoryLimit) {
             variant.available=false;
           }
         })
         this.config.swatch.forEach(element => {
             let option = this.options.find((option,index)=>option.name.toLowerCase()==element.toLowerCase());
             option.values.forEach(value=>{
                 let variant = this.product.variants
                     .find(variant=>variant.selectedOptions
                         .find(so=>so.name==option.name && so.value==value.value)
                              && (variant.swatchColor!=null || variant.swatchImage!=null))
                 if (variant) {
                     value.swatchColor = variant.swatchColor?variant.swatchColor.value:null;
                     value.swatchImage = variant.swatchImage?variant.swatchImage.image.url:null
                 }
             })
         });
     }
     variantsByOptionCombo(start,end,values) {
       return variants.filter(variant=>variant.options.slice(start,end).join("-")==values.join("-"));
     }
     walkOptions(values=[],index) {
       
     }
     selectVariant() {
        super.selectVariant()
         
         this.walkOptions([],0);

        let formWrapper = document.querySelector("[data-form-wrapper]");
        let formButton = document.querySelector("[data-add-to-cart-text]");

        if (this.selectedVariant && this.selectedVariant.available) {
            formWrapper.classList.remove("variant--soldout");
            formButton.textContent = this.config.atc;

        } else {
            formWrapper.classList.add("variant--soldout");
            formButton.textContent = this.config.soldOut;
        }
        document.querySelector(".product__price--regular").textContent = `$${this.selectedVariant.price.toFixed(2)}`;
        document.querySelector("[data-product-select]").value = this.selectedVariant.id;
     }
     
 }