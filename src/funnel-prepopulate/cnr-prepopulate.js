class CnrPrepopulate extends CnR {
    constructor(options) {
        super(options);
        self.addToCart(
            {
                id:this.config.variant_id,
                quantity:1,
            }
        ).then(json=>{
            location.href = this.config.cart_url
        })
    }
}