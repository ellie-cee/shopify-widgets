class LiLacCOMClub extends SrDAtc {
    constructor(options) {
        super(options);
        this.getCart().then(cart=>{
            this.note = cart.note||"";
        })
        
        
    }
    setupEvents() {
        document.querySelectorAll(".cta subscription-button").forEach(
            button=>button.addEventListener(
                "click",event=>this.selectVariant(button)
            )
        )
    }
    postSelect() {
        if (this.config.noNote) {
            this.atc()
            return;
        }
        let maxChars = 200;
        innerHTML = `
        <div class="com-add-note">
            <h2>Add A Gift Note</h2>
            <textarea rows="5" cols="60" class="com-gift-message message-save" name="note">
            </textarea>
            <div>
              <span count="" class="srd-gift-note-cart-char-count">
                ${maxChars}
              </span> Characters remaining
            </div>
            <div class="buttons">
                <button class="cta com-note-cancel">No Note</button>
                <button class="cta com-note-submit" disabled>Submit</submit>
            </div>
        </div>
        `
        let modal = SrDModal.show(innerHTML,cls="ComClub");
        let submit = modal.querySelector(".com-note-submit")
        modal.querySelector(".com-note-cancel").addEventListener("click",event=>{
            SrDModal.close()
            this.atc()
        })
        modal.querySelectorAll(".com-gift-message").forEach(message=>{
            
            message.addEventListener("keyUp",event=>{
                remaining = maxChars-message.value.length;
                if (remaining<1) {
                    event.stopImmediatePropagation()
                    return false;
                }
                
                if (remaining<maxChars) {
                    submit.disabled = false;
                } else {
                    submit.disabled = true
                }
                modal.querySelector(".srd-gift-note-cart-char-count").textContent = remaining;
            })
        })
        submit.addEventListener("click",event=>{
            this.note = modal.querySelector("[name='note']").value()
            SrDModal.close()
            this.atc()
        })
    }
    postAdd(cart) {
        this.updateCart({note:this.note})
    }
}