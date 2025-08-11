class SrDCountdown {
    defaults() {
        return {
            campaign:"TESTCAMPAIGN",
            target_date:"2024-12-23",
            dismissed_key:"countdown-banner-dismissed",
            dismisser:".js-dismiss-banner",
            dismissable:true,
            worker:"",
            on_expired:()=>document.querySelector(".component-timer-banner").classList.add("d-none")
        }
    }

    constructor(options) {
        this.config = {...this.defaults(),...options};
        if (sessionStorage.getItem(this.dkey())) {
            return;
        }    
        this.countdown_worker = new Worker(this.config.worker);
        if (this.config.dismisser) {
                document.querySelector(this.config.dismisser).addEventListener("click",event=>{
                this.countdown_worker.terminate();
                sessionStorage.setItem(this.dkey(),"true");
            });
        }
        this.countdown_worker.onmessage = (event) =>{
            if (event.data.expired) {
                this.config.on_expired();
                this.countdown_worker.terminate()
            } else {
                this.render(event.data)
            }
        }
        this.countdown_worker.postMessage(this.config.target_date);

    }
    dkey() {
        return `${this.config.dismissed_key}-${this.config.campaign}`;
    }
    render(payload) {
        document.querySelector(".component-timer-banner").classList.remove("d-none");
        let innerHTML = ["days","hours","minutes","seconds"].map(key=>`
            <div class="timer-block"> 
            <div class="timer-block-bg">
                <span class="timer-block__num js-timer-days">${payload[key]}</span>
                <span class="timer-block__num-fake"></span>
            </div>
                <span class="timer-block__unit timer-text-label">${key.charAt(0).toUpperCase()+key.slice(1)}</span> 
            </div> 
        `).join("\n");
        document.querySelector(".srd-countdown-holder").innerHTML = `
        <div class="timer"> 
            <div class="timer-display">
            ${innerHTML}
            </div> 
        </div>`;
    }
}