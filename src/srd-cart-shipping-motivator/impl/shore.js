class ShoreShippingMotivator extends SrDShippingMotivator {
    constructor(options) {
        super(options);
        document.addEventListener("theme:cart:loaded",event=>{
            this.getCart();
        })
    }
    css() {
        return `
        .srd-sm-shipping--message {
            padding: 10px 0;
            text-align: center;
          }
          .srd-sm-shipping--meter {
            background: #e0af59;
            border-radius: 20px;
            display: block;
            font-weight: bold;
            height: 20px;
            margin: 9px 0;
            padding: 0;
            position: relative;
            width: 90%;
            margin-left:24px;
            margin-right:24px;
          }
          .srd-sm-shipping--meter-fill {
            background: #391d1f;
            border-radius: 24px;
            color: #391d1f;
            font-size: 12px;
            height: 20px;
            left: 0;
            line-height: 20px;
            overflow: hidden;
            opacity: 1;
            padding: 0 10px;
            position: absolute;
            text-align: right;
            top: 0;
            transition: all 0.5s ease;
          }
          .srd-sm-benefits-bar {
            display:none;
          }
        `
    }
}