class DocsDieselShippingCountdown extends SrDDailyCountdown {
    expired() {
        [".srd-shipping-countdown-mobile",".srd-shipping-countdown"].forEach(cls=>document.querySelector(cls).innerHTML='')
        this.target().innerHTML =  ``; /* this.wrapper("Same-Day Shipping","M-F by 2pm ET",true) */
        this.setupEvents();
    }
    target() {
        return document.querySelector(window.innerWidth<767?".srd-shipping-countdown-mobile":".srd-shipping-countdown")
    }
    wrapper(header,text,expired) {
        return `
        <div class="nav-user-shipping on-hours" style="display: flex;">
            <div class="shipping-notice">
                <div class="shipping-notice__title ${expired?'expired':''} text-center timer-alignment">
                    <span class="text-uppercase countdown-timer" role="timer">${header}</span>
                </div>
                <div class="info">
                  <span class="shipping-notice__info">${text}</span>
                  <span class="shipping-notice__info-icon on-hours" role="button" tabindex="0" aria-label="Shipping Notice">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" role="presentation">
                              <g clip-path="url(#clip0_2956_3007)">
                                  <path d="M4.11591 4.2388H4.86426V3.49046H4.11591M4.49009 8.35463C2.83995 8.35463 1.49665 7.01137 1.49665 5.3613C1.49665 3.71122 2.83995 2.36796 4.49009 2.36796C6.14022 2.36796 7.48352 3.71122 7.48352 5.3613C7.48352 7.01137 6.14022 8.35463 4.49009 8.35463ZM4.49009 1.61963C3.99871 1.61963 3.51214 1.71641 3.05816 1.90445C2.60419 2.09248 2.19169 2.36809 1.84424 2.71554C1.14251 3.41724 0.748291 4.36894 0.748291 5.3613C0.748291 6.35365 1.14251 7.30535 1.84424 8.00705C2.19169 8.3545 2.60419 8.63011 3.05816 8.81814C3.51214 9.00618 3.99871 9.10296 4.49009 9.10296C5.48247 9.10296 6.43421 8.70875 7.13593 8.00705C7.83766 7.30535 8.23188 6.35365 8.23188 5.3613C8.23188 4.86993 8.1351 4.38338 7.94705 3.92942C7.75901 3.47546 7.48339 3.06298 7.13593 2.71554C6.78848 2.36809 6.37598 2.09248 5.92201 1.90445C5.46803 1.71641 4.98146 1.61963 4.49009 1.61963ZM4.11591 7.23213H4.86426V4.98713H4.11591V7.23213Z" fill="#ffffff"></path>
                              </g>
                              <defs>
                                  <clipPath id="clip0_2956_3007">
                                      <rect width="8.98031" height="8.98" fill="white" transform="translate(0 0.871094)"></rect>
                                  </clipPath>
                              </defs>
                          </svg>
                    </span>
                  </span>
            </div>   
        </div>`
    }
    render(payload) {
        [".srd-shipping-countdown-mobile",".srd-shipping-countdown"].forEach(cls=>document.querySelector(cls).innerHTML='')
        this.target().innerHTML = this.wrapper(
          ["hours","minutes","seconds"].map(key=>payload[key]).join(":"),
          "Order by 2pm EST and we'll ship the same day",
          false
        );
        this.setupEvents()
    }
  setupEvents() {
    this.target().querySelector(".shipping-notice__info-icon").addEventListener("click",event=>{
          SrDModal.show(this.modalContent());
    })
  }
  modalContent() {
    return `
      <ul><li>Most orders placed Monday thru Friday before 2PM Eastern Time will ship the same day.</li>
      <li>Next-Day Shipping orders placed on Saturday not arrive on Sunday</li>
      </ul>
      
       `
  }
}