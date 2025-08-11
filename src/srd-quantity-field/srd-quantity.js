class SrDQuantity {
    defaults() {
        return {
            "min":1,
            "max":999999,
            "step":1,
            "value":1,
            dataset:{},
        }
    }
    constructor(options={}) {
        this.uuid = crypto.randomUUID()
        this.config = {...this.defaults(),...options};
    }
    dataset() {
        return Object.keys(this.config.dataset).map(k=>`data-${k}="${this.config.dataset[k]}"`).join(" ");
    }
    setdata(data) {
      this.config.dataset = {};
    }
    render() {
        return `
        <div class="srd-quantity ${this.config.value>0?'active':''}" data-uuid="${this.uuid}">
            <div class="wrapper">
                <span class="minus" data-uuid="${this.uuid}">-</span>
                <label for="${this.uuid}">${this.config.value}</label>
                <input type="number" name="quantity" class="quantity-input" min=${this.config.min}" max="${this.config.max}" step="${this.config.step}" value="${this.config.value}" id="${this.uuid}" ${this.dataset()}/>
                <span class="plus" data-uuid="${this.uuid}">+</span>
            </div>
            <span class="extra">${this.extra()}</span>
        </div>
        `
    }
    root() {
      return document.querySelector(`[data-uuid="${this.uuid}"]`)
    }
    static setupEvents() {
        
        document.querySelectorAll(".srd-quantity").forEach(quantity=>{
            
            let current = quantity.querySelector(".quantity-input");
            let label = quantity.querySelector("label")
            quantity.querySelector(".plus").addEventListener("click",event=>{

                if (current.disabled) { return;}
                if (parseInt(current.value)+1<=parseInt(current.max)) {
                    current.value = parseInt(current.value)+1;
                    label.textContent = current.value;

                    quantity.classList.add("active");
                    this.active = true;
                    let dataset = Object.assign({},current.dataset);
                    dataset.quantity=current.value;
                    SrD.dispatchEvent("srd:quantity:changed",{dataset:dataset,value:current.value,field:current})
                }
            });
            quantity.querySelector(".minus").addEventListener("click",event=>{
                if (current.disabled) { return;}
                if (parseInt(current.value)-1>=parseInt(current.min)) {
                    current.value = parseInt(current.value)-1
                    label.textContent = current.value;
                    if (current.value<=parseInt(current.min)) {
                        quantity.classList.remove("active");
                    }
                    this.active = true;
                    let dataset = Object.assign({},current.dataset);
                    dataset.quantity=current.value;
                    SrD.dispatchEvent("srd:quantity:changed",{dataset:dataset,value:current.value,field:current})
                }
            })
        })

    }
    extra() { return ''}
}