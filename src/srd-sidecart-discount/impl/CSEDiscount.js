class CSEDiscount extends SrDSidecartDiscount {
	defaults() {
		return {}
	}
    constructor(options) {
        super(options);
        
        
        document.querySelector(".go-cart-drawer")
          .querySelector(".go-cart__button").addEventListener("click",event=>{
            event.preventDefault();
            if (this.discountCode()!="") {
              location.href=`/checkout/?discount=${this.discountCode()}`;
            } else {
              location.href="/checkout"
            }
        });
      
    }
    clearCode() {
      super.clearCode();
      document.querySelector(".go-cart-drawer__info_text.shipping-info").innerHTML = "Calculated at checkout";
    }
	renderCart(value) {
        super.renderCart(value);
        if (value.subtotal()) {
          document.querySelector(".js-go-cart-drawer-subtotal").innerHTML = `$${value.subtotal().toFixed(2)}`  
        }
        this.cart.items.forEach((item,index)=>{
          document.querySelector(`.go-cart-item__single[data-line="${index+1}"]`)
            .querySelector(".go-cart-item__price")
            .innerHTML = `$${(item.final_line_price/100).toFixed(2)}`;
        })
        value.items().forEach(item=>{
          document.querySelector(`.go-cart-item__single[data-line="${item.line}"]`)
            .querySelector(".go-cart-item__price")
            .innerHTML = `<span class="srd-discount-original-price">$${item.original_price}</span> <span class="srd-discount-new-price">$${item.price.toFixed(2)}</span>`;
        });
        if (value.freeShipping()) {
          document.querySelector(".go-cart-drawer__info_text.shipping-info").innerHTML = "Free";
        } else {
          document.querySelector(".go-cart-drawer__info_text.shipping-info").innerHTML = "Calculated at checkout";
        }
		
	}
	css() {
		return `
		.srd-sc-discount-code-button, .srd-sc-discount-code-input {
			color: #c6c6c6;
			background-color: #fff;
			width: 20rem;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 4.6rem;
			font-family: var(--primary-font-black);
			font-weight: 900;
			font-size: 1.6rem;
			line-height: 1;
			letter-spacing: .04px;
			text-align: center;
			text-transform: uppercase;
			border-radius: 8px;
			border: 1px solid #C6C6C6;
			transition: .2s all ease-in-out;
		}
		.srd-sc-discount-code-input {
			width: 100%;
			font-family: "Avenir";
			text-align: start;
			padding-left: 0.5em;
			text-transform: capitalize;
			font-family: var(--primary-font);
			color: var(--color-black);
			outline: var(--color-black);
		}
		
		.srd-sc-discount-code-button:hover,.srd-sc-discount-code-button.active {
		
			background-color: var(--color-primary-button-bg);
			border-color: var(--color-primary-button-border);
		
		}
		.srd-sc-discount-code-input::placeholder {
		  font-style:normal;
		  color: #B0B0B0;
		}
		.srd-sc-discount-code-button {
			text-transform: uppercase;
			cursor:pointer;
		}
		.srd-sc-discount-code-wrapper {
			background-color: #F2ECE5;
			margin-bottom:8px;
		
		}
        .srd-sc-discount-code-form {
          	display:flex;
			flex-direction: row;
			gap: 12px;
        }
        .srd-sc-discount-code-error {
          
          color:#990000;
          text-align:center;
          font-weight: bold;
        }
        .srd-sc-discount-code-error .content,.srd-sc-discount-code-description .content {
            margin-top:12px;
            padding:4px;
          }
        .srd-sc-discount-code-description {
    
          
          text-align:center;
        }
        .srd-discount-original-price {
          text-decoration: line-through;
          font-style: italic;
        }
        .srd-discount-new-price {
          font-weight: bold;
        }
        .go-cart-drawer [data-rebuy-id] {
          display:none!important;
        }
		.d-none {
          display:none!important;
        }
		`;
	}
}