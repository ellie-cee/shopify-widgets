class SrDCarouselSubscriptions extends SrD {
    defaults() {
        return {
            "injection_point":".srd-carousel-subs",
        }
    }
    constructor(options={}) {
        super(options);
        this.init();
    }
    init() {
        this.productIds = this.collectProducts();
        if (this.productsIds.length>0) {
            this.loadProducts().then(q=>{
                this.products = q.data.products
                this.render();        
            })
            
        }
        
    }
    collectProducts() {
        return []
    }
    loadProducts() {
        return new Promise((resolve,reject)=>{
            resolve( {"data":{
                "products":{},
            }})
        })
    }
    render() {
        this.products.forEach(product=>{
            product.root.querySelector(".price").dataset.discountMultiplier = 1-(product.sellingPlans[0].price_adjustments[0].value/100);
            product.root.querySelector(".srd-carousel-subscriptions").innerHTML = `
                ${product.sellingPlans.map((plan,index)=>`
                    <input type="radio" name="selling_plan" class="plan-radio" id="plan-${product.id}-${plan.id}" value="${plan.id}" ${index==0?' checked':''} data-discount-multiplier="${1-(product.sellingPlans[0].price_adjustments[0].value/100)}">
                    <label for="plan-${product.id}-${plan.id}">${plan.name.split(" ").slice(-1).join(" ")}</label>
                `).join("\n")}            `

        })
    }
    setupEvents() {

    }
}