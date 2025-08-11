class SrDAtc extends SrD {
    constructor(options) {
        super(options)
        this.setupEvents()
        this.selectedVariant = null
        this.sellingPlanId = null
        this.properties = {}
    }
    setupEvents() {

    }
    selectVariant(object) {
        this.selectedVariant = object.dataset.variantId;
        this.sellingPlanId = object.dataset.sellingPlan;
        this.postSelect()
    }
    postSelect() {}
    atc() {
        payload = {
            id:this.selectVariant,
        }
        if (this.selllingPlanId!=null) {
            payload.selling_plan = this.sellingPlanId
        }
        if (Object.keys(this.properties).length>0) {
            payload.properties = properties;
        }

        this.addToCart(payload).then(cart=>this.postAdd(cart))
    }
    postAdd(cart) {}
}