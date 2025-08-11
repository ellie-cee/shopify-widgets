class SrDProductSwatch extends SrD {
    defaults() {
        return {
            hidden:[],
            swatch:[],
            injection_point:".srd-swatches",
        };
    }
    constructor(options) {
        super(options);
        this.options = [];
        document.addEventListener("swatch:selectVariant",event=>{
            this.selectedVariant = this.variants.find(variant=>variant.id==id);
        })
        this.fetch().then(q=>{
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
                      
                    }
                    ret.available = ret.variants.length>0;
                    return ret;
                })
            })
            this.process(this.product)
            console.error(this)
            this.render();
            this.selectVariant();
        })
    }
    fetch() {
        return this.graphql(
            `
            query getProduct($id:ID!) {
                product(id:$id) {   
                    id
                    options {
                        name
                        values
                    }
                    ${this.additionalFields()}
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
            }

            `,
            {
                id:`gid://shopify/Product/${this.config.product_id}`
            }
        )
    }
    process(product) {}
    additionalFields() { return '';}
    additionalVariantFields() { return '';}


     render() {
         document.querySelector(this.config.injection_point).innerHTML = this.options.map((option,index)=>{
             if (option.values.length<1) {
                 return '';
             }
             if (option.values.length==1 && option.name.toLowerCase()!="color") {
                 return this.renderHidden(option.name,option.values[0],index)
             } else {
                 if (this.config.swatch.includes(option.name.toLowerCase())) {
                     return this.sectionWrapper(
                         option.name,
                         "swatch",
                         index,
                         option.values.map(value=>this.renderSwatch(option.name,value,index)).join("")
                     )
                 } else {
                     return this.sectionWrapper(
                         option.name,
                         "buttons",
                         index,
                         option.values.map(value=>this.renderButton(option.name,value,index)).join("")
                     )
                 }
             }
         }).join('')
         this.setupEvents()
     }
     sectionWrapper(name,type,index,html) {
        return `
        <div class="srd-swatch-set ${type}" data-option-position="${index}">
            <fieldset class="radio-fieldset">
                <legend class="radio-legend">
                    <span class="label">${name}</span>
                </legend>
                ${html}
            </fieldset>
        </div>`
                      
    }
    renderButton(name,value,index) {
        return `
            <span class="srd-swatch-field  srd-swatches-option-field-button ${value.available?'':'sold-out all-sold-out'}" data-index="${index}" data-option="${value.value}">
                <input class="srd-swatches-radio" type="radio" class="" data-single-option-selector="" data-index="${index}" name="options[${name}]" value="${value.value}" id="option-${index}-${name}-${value.value}" ${this.selectedVariant.options.includes(value.value)?'checked':''}>
                <label for="option-${index}-${name}-${value.value}" class="radio-label">
                    <span>${value.value}</span>
                </label>
        </span>
        `;
    }
    renderSwatch(name,value,index) {
        return `<span class="srd-swatch-field srd-swatches-option-field-swatch ${value.available?'':'all-sold-out'}" data-tooltip="${value.value}" title="${value.value}" data-index="${index}" data-option="${value.value}">
            <input class="srd-swatches-radio" type="radio" data-single-option-selector="" data-index="${index}" name="options[${name}]" value="${value.value}" id="option-${index}-${name}-${value.value}" ${this.selectedVariant.options.includes(value.value)?'checked':''}>
            <label for="option-${index}-${name}-${value.value}" class="swatch-label" data-swatch="${value.value}" data-tooltip="${value.value}" data-swatch-variant="option-${index}-${name}-${value.value}" style="background:${value.swatchImage?'url('+value.swatchImage+')':value.swatchColor}">
                <span class="icon icon-check"></span>
            </label>
        </span>`
    }
    renderHidden(name,value,index) {
        return `<input class="srd-swatches-radio" type="radio"  data-single-option-selector="" data-index="${index}" name="options[${name}]" value="${value.value}" id="option-${index}-${name}-${value.value}" checked style="display:none">`
    }
    selectVariant() {
        this.selectedOptions = Array.from(document.querySelectorAll(`${this.config.injection_point} .srd-swatches-radio:checked`))
            .map(radio=>radio.value);
      
        this.selectedVariant = this.variants.find(variant=>variant.options.join("-")==this.selectedOptions.join("-"));
        if (this.selectedVariant) {
            document.dispatchEvent(new CustomEvent("VariantUpdated",{bubbles:true,detail:this.selectedVariant}));
        }
        this.options.forEach((option,index)=>{
          option.values.forEach(value=>{
              let is_valid_parent = false;
              let is_valid_child = false;
              if (index+1<this.options.length) {
                is_valid_parent = this.variants
                    .find(variant=>variant.options.slice(index,index+2).join("-")==[value.value,this.selectedOptions[index+1]].join("-") && variant.available)!=null;
              } else {
                is_valid_parent = true;
              }
              if (index>0) {
                is_valid_child = this.variants
                  .find(variant=>variant.options.slice(index-1,index+1).join("-")==[this.selectedOptions[index-1],value.value].join("-") && variant.available)!=null
              } else {
                is_valid_child = true
              }
              
              let field = document.querySelector(`.srd-swatch-field[data-index="${index}"][data-option="${value.value}"]`);
              if (field) {
                if (is_valid_child && is_valid_parent) {
                  field.classList.remove("sold-out")
                } else {
                  field.classList.add("sold-out");
                }
              }
          })
          
        })

        

    }
    setupEvents() {
        document.querySelectorAll(`${this.config.injection_point} .srd-swatches-radio`)
            .forEach(item=>{
                item.addEventListener("click",event=>{
                    this.clickedIndex = parseInt(item.dataset.index);
                    this.clickedOption = item.value;
                    this.selectVariant();
                })
        })
       
    }
}