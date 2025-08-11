class SrDUpsellTree extends SrD {
    constructor(options) {
        super(options);
    }
    defaults() {
        return {
            "target":"srd-upsell-tree",
        };
    }
    states() {
        return {};
    }
    classMap() {
        return {}
    }
    textContent() {
        return '';
    }
    target() {
        return document.querySelector(this.config.target);
    }
    render() {
        this.target().innerHTML = this.textContent();
    }
    setupEvents() {
        this.target().querySelectorAll(".offer-accept").forEach(element => {
            element.addEventListener("click",event=>{
                this.accept();
            })
        });
        this.target().querySelectorAll(".offer-decline").forEach(element => {
            element.addEventListener("click",event=>{
                this.accept();
            });
        });
    }
    finalize() {
        
    }
    accept() {
        this.finalize();
        if (this.parent) {
            if (this.parent.states[this.state]["accept"]) {
                this.parent.showState(this.parent.states[this.state]["accept"])
            } 
        }
    }
    decline() {
        if (this.parent) {
            if (this.parent.states[this.state]["decline"]) {
                this.parent.showState(this.parent.states[this.state]["decline"])
            } 
        }
    }
    showState(state) {
        if (this.states()[state]) {
            this.state  = new this.states()[state]["class"](this,state);
            this.state.render();
            this.state.setupEvents();
        }
    }

}