//* Copyright 2023 Chelsea and Rachel Co. ellie@chelseaandrachel.com *//


class SrDGiftNote extends SrD {
	defaults() {
		return {
			context:"sidecart",
			target:".srd-giftnote-holder",
			button_text_empty:"Add Note",
			button_text_set:"Update",
			button_text_updating:"Updating Note...",
			checkbox_label_text:"Add A Note",
			extended_cart:false,
		};
	}
	constructor(opts={}) {
		super(opts)
		document.addEventListener("CartUpdated",(event)=>{
			this.cart = event.detail;
			this.render();
		});
 	}

	hasGift() {
	 	return this.cart.attributes['gift']!=null;
	}
	giftText() {
	 	return this.cart.attributes["Gift Note"]||"";
	}
	render() {
		let injection_point = document.querySelector(this.config.target);
		if (!injection_point) {
			console.error(`Injection target ${this.config.target} does not exist`);
		}
		injection_point.childNodes.forEach(node=>injection_point.removeChild(node));
        
		let html = "";
		if (this.hasGift()) {
			html += `
			<div>
				<div class="d-flex justify-content-between">
				<h3 class="srd-gift-note-has-note">${this.config.cart_gift_message_added_label}</h3>
				<a class="srd-gift-note-cart-open-form">Edit / Remove</a>
				</div>
				<p>${this.config.cart_gift_message_notice}</p>
				<p class="srd-gift-note-cart-message"><i>“<span message="">${this.giftText()}</span>...”</i></p>
			</div>
			`
		} else {
			html += `
			<div class="srd-gift-note-cart-add-message srd-gift-note-cart-open-form" btn-open>
				${this.config.cart_gift_message_label}
			</div>
			`
		}
		html+= this.noteForm();
		injection_point.innerHTML=`<div class='srd-gift-note-cart-message ${this.hasGift()?'has-message':''}'>${html}</div>`;

		injection_point.querySelectorAll(".srd-gift-note-cart-open-form").forEach(button=>button.addEventListener("click",button=>{
			document.querySelector(".srd-gift-note-cart-message").classList.add("active");
		}));
		injection_point.querySelectorAll(".srd-gift-note-cart-cancel").forEach(button=>button.addEventListener("click",button=>{
			document.querySelector(".srd-gift-note-cart-message").classList.remove("active");
		}));
        //btn-clear
        
		injection_point.querySelector("textarea").addEventListener("keypress",event=>{
			let remaining = this.config.cart_gift_message_max - injection_point.querySelector("textarea").value.length;
			if (remaining<=0) {
				event.stopImmediatePropagation();
				return false;
			}
			document.querySelector(".srd-gift-note-cart-char-count").innerHTML = remaining;
		});
		injection_point.querySelector(".srd-gift-note-cart-save").addEventListener("click",event=>{
		  this.handleUpdate();
          
		});
        injection_point.querySelector(".srd-gift-note-cart-clear").addEventListener("click",event=>{
			this.clear();
			document.querySelector(".srd-gift-note-cart--message").classList.remove("active");
		});
	}
	noteForm() {
		return `
		<div class="srd-gift-note-cart-form">
			<h3 class="h1">${this.config.cart_gift_message_popup_label}</h3>

			<textarea class="srd-gift-note-cart-text" name="note" maxlength="${this.config.cart_gift_message_max}">${this.giftText()}</textarea>
			<div class="srd-gift-note-cart-utility">
				<small><span count="" class="srd-gift-note-cart-char-count">${this.config.cart_gift_message_max - this.giftText().length}</span> Characters remaining</small>
				<small><a class="srd-gift-note-cart-clear">Clear</a></small>
			</div>
			<div class="srd-gift-note-cart-form-footer">
			<button type="button" class="btn btn-primary srd-gift-note-cart-dave">Save Message</button>
			<a class="srd-gift-note-cart-cancel>Cancel</a>
			</div>
		</div>
		`;
	}
	handleUpdate() {
		this.cart.note = injection_point.querySelector("textarea").value;
		this.updateCart({note:injection_point.querySelector("textarea").value})
			.then(json=>this.render());
		document.querySelector(".srd-gift-note-cart-message").classList.remove("active");
	}
  }