class SrDDailyCountdown extends SrD {
    defaults() {
        return {
            cutoff:16,
            blackout_days:[],
            holidays:[],
            worker:""
        }
    }
    constructor(options) {
        super(options);
        
        this.config.holidays = this.config.holidays?this.config.holidays.split("\n").map(
            date=>new Date(date)
        ):[];
        this.countdown_worker = new Worker(this.config.worker);
        this.countdown_worker.onmessage = (event) =>{
            if (event.data.expired) {
                this.expired();
                this.countdown_worker.terminate()
            } else {
                this.render(event.data)
            }
        }
        this.countdown_worker.postMessage(this.config);

    }
    render(payload) {}
    expired() {}
}