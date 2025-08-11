/*!
 * 
 *   @bornfight/gocart v1.0.6
 *   
 * 
 *   Copyright (c) Bornfight (https://www.bornfight.com/)
 * 
 *   This source code is licensed under the MIT license found in the
 *   LICENSE file in the root directory of this source tree.
 *   
 */

class GoCart extends SrD {
    defaults() {
        return {
            cartModalFail: '.js-go-cart-modal-fail',
            cartModalFailClose: '.js-go-cart-modal-fail-close',
            cartDrawer: '.js-go-cart-drawer',
            cartDrawerContent: '.js-go-cart-drawer-content',
            cartDrawerSubTotal: '.js-go-cart-drawer-subtotal',
            cartDrawerFooter: '.js-go-cart-drawer-footer',
            cartDrawerClose: '.js-go-cart-drawer-close',
            cartTrigger: '.js-go-cart-trigger',
            cartOverlay: '.js-go-cart-overlay',
            cartCount: '.js-go-cart-counter',
            addToCart: '.js-go-cart-add-to-cart',
            removeFromCart: '.js-go-cart-remove-from-cart',
            removeFromCartNoDot: 'js-go-cart-remove-from-cart',
            itemQuantity: '.js-go-cart-quantity',
            itemQuantityPlus: '.js-go-cart-quantity-plus',
            itemQuantityMinus: '.js-go-cart-quantity-minus',
            cartMode: 'drawer',
            drawerDirection: 'right',
            moneyFormat: '${{amount}}',
            permanent_domain: 'aloha-dev.myshopify.com',
            checkout_domain: 'checkout.rechargeapps.com',
            extended_cart:false,
            extended_cart_path:"/cart?view=json",
            bundle_parent_property:"_bundleID",
            bundle_item_property:"_bundleParentID",
        }
    }
    constructor(options) {
        this.defaults = Object.assign({}, this.defaults, options);
        this.cartModalFail = document.querySelector(this.defaults.cartModalFail);
        this.cartModalFailClose = document.querySelector(this.defaults.cartModalFailClose);
        this.cartDrawer = document.querySelector(this.defaults.cartDrawer);
        this.cartDrawerContent = document.querySelector(this.defaults.cartDrawerContent);
        this.cartDrawerSubTotal = document.querySelector(this.defaults.cartDrawerSubTotal);
        this.cartDrawerFooter = document.querySelector(this.defaults.cartDrawerFooter);
        this.cartDrawerClose = document.querySelector(this.defaults.cartDrawerClose);
        
        this.cartTrigger = document.querySelectorAll(this.defaults.cartTrigger);
        this.cartOverlay = document.querySelector(this.defaults.cartOverlay);
        this.cartCount = document.querySelector(this.defaults.cartCount);
        this.addToCart = document.querySelectorAll(this.defaults.addToCart);
        this.cartCheckout = document.querySelector('.js-go-checkout__button');
        this.removeFromCart = this.defaults.removeFromCart;
        this.removeFromCartNoDot = this.defaults.removeFromCartNoDot;
        this.itemQuantity = this.defaults.itemQuantity;
        this.itemQuantityPlus = this.defaults.itemQuantityPlus;
        this.itemQuantityMinus = this.defaults.itemQuantityMinus;
        this.drawerDirection = this.defaults.drawerDirection;
        this.moneyFormat = this.defaults.moneyFormat;
        this.permanent_domain = this.defaults.permanent_domain;
        this.checkout_domain = this.defaults.checkout_domain;

        this.init();
    }

   
    init() {

        this.fetchCart();
        this.setDrawerDirection();
        if (this.addToCart) { 
            this.addToCart.forEach((item) => {
                item.addEventListener('click', (event) => {
                    event.preventDefault();
                    let form = item.parentNode;
                    while ('form' !== form.tagName.toLowerCase()) {
                        form = form.parentNode;
                    }
                    
                    const formID = form.getAttribute('id');
                  console.error(form,formID);
                    this.addItemToCart(formID);
                });
            });
        }

        if (this.cartTrigger) { 
            this.cartTrigger.forEach((item) => {
                item.addEventListener('click', (event) => {
                    this.openCartDrawer();
                    this.openCartOverlay();
                });
            });
        }

        this.cartOverlay.addEventListener('click', () => {
            this.closeFailModal();
            this.closeCartDrawer();
            this.closeCartOverlay();
        });

        
       this.cartDrawerClose.addEventListener('click', () => {
            this.closeCartDrawer();
            this.closeCartOverlay();
        });
        
        this.cartModalFailClose.addEventListener('click', () => {
            this.closeFailModal();
            this.closeCartDrawer();
            this.closeCartOverlay();
        });

        if (this.cartCheckout) { 
            this.cartCheckout.addEventListener('click', (event) => { 
                event.preventDefault();
                this.redirectToReChargeCheckout();
            })
        }
    }

    buildCheckoutUrl(cart) {
        // Build the Checkout URL
        var checkout_url = 'https://' + this.checkout_domain + '/r/checkout?',
            url_params = [
                'myshopify_domain=' + this.permanent_domain,
            ],
            cart_token = [],
            ga_linker = [],
            discount_codes = [];

        try {
            cart_token = ['cart_token=' + (document.cookie.match('(^|; )cart=([^;]*)')||0)[2]];
        } catch (e) { 
        }

        try {
            ga_linker = [ga.getAll()[0].get('linkerParam')];
        } catch (e) { 
        }

        // if ( cart.total_price >= 5000 ) {
        //     discount_codes = ['discount=ADDITIONAL10'];
        // }

        url_params = url_params
            .concat(cart_token)
            .concat(ga_linker)
            .concat(discount_codes);

        return checkout_url + url_params.join('&');
    }

    fetchCart(callback) {
            window.fetch('/cart', {
                credentials: 'same-origin',
                method: 'GET',
            })
            .then((response) => response.text())
            .then((cart) => {
                if (this.defaults.enrich_cart) {
                    this.enrichCart(cart);
                } else {
                    document.dispatchEvent(
                        new CustomEvent("CartFetched",{bubbles:true,detail:cart})
                    );
                    this.fetchHandler(window.cart, callback)}
                }
            )
            .catch((error) => {
                
                this.ajaxRequestFail();
                console.error(error);
                throw new Error(error);
            });
    }
    enrichCart(cart) {
        this.fetchHandler(cart);
    }

    addItemToCart(formID) {
        const form = document.querySelector(`#${formID}`);
        const formData = serialize(form, {hash: true});
        console.error(form,formData);
        window.fetch('/cart/add.js', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((product) => this.addItemToCartHandler(product))
            .catch((error) => {
                this.ajaxRequestFail();
                throw new Error(error);
            });
    }

    removeItem(line) {
        const quantity = 0;
        window.fetch('/cart/change.js', {
            method: 'POST',
            credentials: 'same-origin',
            body: JSON.stringify({quantity, line}),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((cart) => this.fetchCart())
            .catch((error) => {
                this.ajaxRequestFail();
                throw new Error(error);
            });
    }

    addSubscriptionItem(itemData) { 
        window.fetch('/cart/add.js', {
            method: 'POST',
            credentials: 'same-origin',
            body: JSON.stringify({
                items: [
                    {
                        id: itemData.subscription_variant_id,
                        quantity: 1,
                        properties: {
                            'shipping_interval_frequency': itemData.subscription_properties.frequency[0],
                            'shipping_interval_unit_type': itemData.subscription_properties.interval
                        }
                    }
                ]
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((response) => response.json())
        .then(() => this.fetchCart())
        .catch((error) => {
            this.ajaxRequestFail();
            throw new Error(error);
        });
    }

    upgradeItemToSubscription(itemData, line) {
        // remove first
        const quantity = 0; 
        window.fetch('/cart/change.js', {
            method: 'POST',
            credentials: 'same-origin',
            body: JSON.stringify({quantity, line}),
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((response) => response.json())
        .then(() => this.addSubscriptionItem(itemData))
        .catch((error) => {
            this.ajaxRequestFail();
            throw new Error(error);
        });
    }

    redirectToReChargeCheckout() { 
        if ( !window.cart.has_subscription_products ) { 
            var checkout_url = this.cartCheckout.getAttribute('href');
            window.location.href = checkout_url;

            return;
        }

        var checkout_url = this.buildCheckoutUrl(window.cart);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/cart/update.js');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                window.console.log('done', JSON.parse(xhr.responseText));
            } else if (xhr.status !== 200) {
                window.console.log('fail', JSON.parse(xhr.responseText));
            }

            var form = document.createElement('form');
            form.setAttribute('method', 'post');
            form.setAttribute('action', checkout_url);
            form.setAttribute('id', 'rc_form');
            form.style.display = 'none';

            if (window.cart.customer) { 
                Object.keys(window.cart.customer).forEach(function(key) {
                    var input = document.createElement('input');
                    input.setAttribute('type', 'hidden');
                    input.setAttribute('name', key);
                    input.setAttribute('value', typeof(window.cart.customer[key]) === 'object' ? JSON.stringify(window.cart.customer[key]) : window.cart.customer[key]);
                    form.appendChild(input);
                });
            }

            document.body.appendChild(form);
            // form.submit();
        };
        xhr.send(JSON.stringify(window.cart));
				window.location = checkout_url;
    }

    changeItemQuantity(line, quantity) {
        window.fetch('/cart/change.js', {
            method: 'POST',
            credentials: 'same-origin',
            body: JSON.stringify({quantity, line}),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {let ret = response.json();ret.status=response.status;return ret;})
            .then((cart) => {
              if (cart.status==422 && cart.message.includes("sold out")) {
                this.openFailModal("Sorry, this item is no longer in stock and will be removed from your cart.")
                this.removeItem(line);
              } else {
                this.fetchCart();
              }
            })
            .catch((error) => {
                this.ajaxRequestFail();
                throw new Error(error);
            });
    }

    cartItemCount(cart) {
        this.cartCount.innerHTML = cart.item_count;
    }

    fetchAndOpenCart() {
        this.fetchCart(() => {
            this.openCartDrawer();
            this.openCartOverlay();
        });
    }

    fetchHandler(cart, callback) {
      document.dispatchEvent(new CustomEvent("CartUpdated",{bubbles:true,detail:cart}));
        this.cartItemCount(cart);
        if (cart.item_count === 0) {
            this.renderBlankCartDrawer();
            this.cartDrawerFooter.classList.add('is-invisible');
        } else {
            this.renderDrawerCart(cart);
            this.cartDrawerFooter.classList.remove('is-invisible');
            if ((typeof callback) === 'function') {
                callback(cart);
            }
        }
    }

    addItemToCartHandler(product) {
        const item = {
            id: product.id,
            title: product.title,
            price: product.price/100
        };
   
        return this.fetchAndOpenCart();
    }

    ajaxRequestFail() {
        this.openFailModal();
        this.openCartOverlay();
    }
   
    renderDrawerCart(cart) {
        console.error("CartDrawer");
        this.clearCartDrawer();
        let cartOriginTotal = 0;
        let maxDiscount     = 5;

        let original_undiscounted_price = cart.items.reduce((a,item)=>{
          if (item.onetime_variant_price) {
            return a+(item.onetime_variant_price/100)*item.quantity;
          } else {
            return a+item.original_price;
          }
        },0);

        this.cart_items.forEach((item,index)=>item.index = index+1);
        let bundle_items = this.cart.items(item=>item.properties && item.properties[this.defaults.bundle_item_property]!=null);

        let cart_item_html = cart.items.map(item=>{
            if (item.properties && item.properties[this.defaults.bundle_parent_property]) {
                return this.cartBundleItem(item,bundle_items);
            } else if (item.properties && item.properties[this.defaults.bundle_item_property]) {
                return null
            } else if ((item.properties && item.properties["_hidden"]) || item.hidden ) {
                return null
            } else {
                return this.cartSingleItem(item);
            }
        }).filter(item=item!=null).join("\n");
      

        // SubTotal Price 
        if ( original_undiscounted_price > cart.total_price/100 ) { 
            this.cartDrawerSubTotal.innerHTML = `<s>$${original_undiscounted_price.toFixed(2)}</s> ${formatMoney(cart.total_price, this.moneyFormat)}`;
        } else { 
            this.cartDrawerSubTotal.innerHTML = formatMoney(cart.total_price, this.moneyFormat);
        }

        this.cartDrawerSubTotal.parentNode.classList.remove('is-invisible');

        const removeFromCart = document.querySelectorAll(this.removeFromCart);
        removeFromCart.forEach((item) => {
            item.addEventListener('click', () => {
                GoCart.removeItemAnimation(item.parentNode);
                const line = item.parentNode.getAttribute('data-line');
                this.removeItem(line);
            });
        });
        const itemQuantityPlus = document.querySelectorAll(this.itemQuantityPlus);
        itemQuantityPlus.forEach((item) => {
            item.addEventListener('click', () => {
                const line = item.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
                const quantity = Number(item.parentNode.querySelector(this.itemQuantity).value) + 1;
                this.changeItemQuantity(line, quantity);
            });
        });
        const itemQuantityMinus = document.querySelectorAll(this.itemQuantityMinus);
        itemQuantityMinus.forEach((item) => {
            item.addEventListener('click', () => {
                const line = item.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
                const quantity = Number(item.parentNode.querySelector(this.itemQuantity).value) - 1;
                this.changeItemQuantity(line, quantity);
                if (Number((item.parentNode.querySelector(this.itemQuantity).value - 1)) === 0) {
                    GoCart.removeItemAnimation(item.parentNode.parentNode.parentNode.parentNode.parentNode);
                }
            });
        });
      

      document.dispatchEvent(
          new CustomEvent("CartUpdated",{bubbles:true,detail:cart})
        );

    }
    cartItemdiscounts(item) {

    }
    lineItemExtra() {

    }
    cartSingleItem(item) {
        return `
        <div class="go-cart-item__single" data-line="${item.index}" data-id="${item.id}" data-tags="${item.product_tags.join(",")}">
            <div class="go-cart-item__info-wrapper">
                <div class="go-cart-item__image" style="background-image: url(${item.image});"></div>
                <div class="go-cart-item__info">
                    <div class="go-cart-item__info-inner">
                        <a href="/products/${item.onetime_product_handle}" class="go-cart-item__title">${item.product_title.includes('Auto renew')? item.onetime_product_title : item.product_title}</a>
                        <div class="go-cart-item__variant">${itemVariant}</div>
                        <div class="go-cart-item__price">${(item.is_subscription && item.onetime_variant_price > item.final_price)? `<s> ${formatMoney(item.onetime_variant_price * item.quantity, this.moneyFormat)}</s>` : ``} ${formatMoney(item.line_price, this.moneyFormat)} ${(item.is_subscription && item.onetime_variant_price > item.final_price)? hasScriptDiscount? `` : `<span>Save ${tieredDiscounts? tieredDiscounts : item.subscription_properties.discount}%</span>` : ``}</div>
                        <div class="go-cart-item__quantity">
                            <span class="go-cart-item__quantity-button js-go-cart-quantity-minus">-</span>
                            <input class="go-cart-item__quantity-number js-go-cart-quantity" type="number" value="${item.quantity}" disabled>
                            <span class="go-cart-item__quantity-button js-go-cart-quantity-plus">+</span>
                        </div>
                    </div>
                    <div data-upgradeable-item data-line-item-product="${item.product_id}" data-line-item-key="${item.variant_id}" data-line="${Number(index + 1)}" data-selling-plan="${selling_plan_id}" data-quantity="${item.quantity}"></div>
                    ${hasScriptDiscount? `<div class="go-cart-item__variant">${item.discounts[0].title}</div>` : ``}
                </div>
            </div>
            
            <a class="go-cart-item__remove ${this.removeFromCartNoDot}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                    <path d="M15.89 14.696l-4.734-4.734 4.717-4.717c.4-.4.37-1.085-.03-1.485s-1.085-.43-1.485-.03L9.641 8.447 4.97 3.776c-.4-.4-1.085-.37-1.485.03s-.43 1.085-.03 1.485l4.671 4.671-4.688 4.688c-.4.4-.37 1.085.03 1.485s1.085.43 1.485.03l4.688-4.687 4.734 4.734c.4.4 1.085.37 1.485-.03s.43-1.085.03-1.485z" fill="#0f5a47"></path>
                </svg>
                Remove
            </a>
        </div>
        `;
    }
    renderBlankCartDrawer() {
        this.cartDrawerSubTotal.parentNode.classList.add('is-invisible');
        this.clearCartDrawer();
        this.cartDrawerContent.innerHTML = '<div class="go-cart__empty body1 empty-cart">Your Cart is currenty empty!</div>';
        document.dispatchEvent(
            new CustomEvent("CartEmpty",{bubbles:true,detail:cart})
          );
    }

    clearCartDrawer() {
        this.cartDrawerContent.innerHTML = '';
    }


    openCartDrawer() {
        this.cartDrawer.classList.add('is-open');
    }

    closeCartDrawer() {
        this.cartDrawer.classList.remove('is-open');
    }

    openFailModal(text="Something went wrong, please contact us!") {
        document.querySelector(".js-go-cart-modal-fail-content").innerHTML = text;
        this.cartModalFail.classList.add('is-open');
    }

    closeFailModal() {
        this.cartModalFail.classList.remove('is-open');
    }

    openCartOverlay() {
        this.cartOverlay.classList.add('is-open');
    }

    closeCartOverlay() {
        this.cartOverlay.classList.remove('is-open');
    }

    static removeItemAnimation(item) {
        item.classList.add('is-invisible');
    }

    setDrawerDirection() {
        this.cartDrawer.classList.add(`go-cart__drawer--${this.drawerDirection}`);
    }

}

// window.GoCart = GoCart;
