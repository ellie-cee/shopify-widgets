class WaiakeaCarouselSubscriptions extends SrDCarouselSubscriptions {
    constructor(options={}) {
        super(options);
        this.root = document.querySelector(`#${this.config.section}`);
    }
    collectProducts() {
        return this.root.querySelectorAll(`.single-product[data-subscriptions="true"]`)
            .map(element=>element.dataset.productId);
    }
    loadProducts() {
        return new Promise((resolve,reject)=>{
            resolve({
                data:{
                    products:this.root.querySelectorAll(`.single-product[data-subscriptions="true"]`)
                        .map(element=>{
                            return {
                                "root":element,
                                id:element.dataset.productId,
                                sellingPlans:JSON.parse(element.dataset.sellingPlans)
                            }
                        })
                }
            })
        })
    }
}