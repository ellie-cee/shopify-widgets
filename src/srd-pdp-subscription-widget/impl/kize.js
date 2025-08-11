class KizePdpSubscriptionWidget extends SrDSubscriptionsWidget {
    
    constructor(options) {
        super(options)
    }
    additionalProductQuery() {
        return `
            perBox: metafield(namespace:"custom",key:"items_per_box") {
                value
            }
        `;
    }
    pricePer(price,items) {
        return price/parseInt(items);
    }
    display_regular_price() {
        if (this.config.product.perBox) {
            return `$${this.regular_price().toFixed(2)} <span class="price-per">$${this.pricePer(this.regular_price(),this.config.product.perBox.value).toFixed(2)}/bar</span>`;
        } else {
            return `$${this.regular_price().toFixed(2)}`
        }
    }
    display_discounted_price() {
        if (this.config.product.perBox) {
            return `$${this.discounted_price().toFixed(2)} <span class="price-per">$${this.pricePer(this.discounted_price(),this.config.product.perBox.value).toFixed(2)}/bar</span>`;
        } else {
            return `$${this.discounted_price().toFixed(2)}`
        }
    }
    extraHTML() {
      return `
        <div class="rc_popup" data-v-7bc675e0=""><div class="rc_popup__hover acsb-hover" data-v-7bc675e0="" style="--backgroundColor: #cc6d6d;" data-acsb-hover="true" data-acsb-navigable="true" tabindex="0" data-acsb-now-navigable="true"><button class="rc_popup_label_wrapper row" aria-label="Subscription details" aria-expanded="false" data-v-7bc675e0="" data-acsb-clickable="true" data-acsb-force-unnavigable="true" tabindex="-1" data-acsb-now-navigable="false" role="button" data-acsb-navigable="true" data-custom-button-processed="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="#191D48" xmlns="http://www.w3.org/2000/svg" class="reload-icon" data-test-popup-icon="" data-v-7bc675e0="" aria-hidden="true" data-acsb-hidden="true" data-acsb-force-hidden="true"><path fill="currentColor" d="M13.64 2.35C12.19 0.9 10.2 0 7.99 0C3.57 0 0 3.58 0 8C0 12.42 3.57 16 7.99 16C11.72 16 14.83 13.45 15.72 10H13.64C12.82 12.33 10.6 14 7.99 14C4.68 14 1.99 11.31 1.99 8C1.99 4.69 4.68 2 7.99 2C9.65 2 11.13 2.69 12.21 3.78L8.99 7H15.99V0L13.64 2.35Z"></path></svg><span class="rc_popup__label" data-v-7bc675e0="">Subscription details</span></button><div class="rc_popup__block" data-v-7bc675e0="" style="--backgroundColor: #cc6d6d; background-color: rgb(204, 109, 109); color: rgb(255, 255, 255);" aria-hidden="false" data-acsb-hidden="false"><div class="rc_popup__block__content" data-v-7bc675e0=""><div class="rc_popup__how_it_works" data-v-7bc675e0=""><strong>How subscriptions work</strong><br>Products are automatically delivered on your schedule. No obligation, modify or cancel your subscription anytime.</div><a class="rc_popup__learn_more" href="http://rechargepayments.com/subscribe-with-recharge" target="_blank" rel="noopener noreferrer" data-v-7bc675e0="" style="color: rgb(255, 255, 255);" data-acsb-tooltip="New Window" data-acsb-clickable="true" data-acsb-force-unnavigable="true" tabindex="-1" data-acsb-now-navigable="false" data-custom-button-processed="true">Learn more...<span class="acsb-sr-only" data-acsb-sr-only="true" data-acsb-force-visible="true" data-acsb-sr-only-position="after" aria-hidden="false" data-acsb-hidden="false"> - subscribe with recharge - recharge payments New Window</span></a></div><!--v-if--></div></div></div>
      `
    }
    render() {
      super.render();
      
    }
}