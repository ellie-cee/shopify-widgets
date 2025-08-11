//* Copyright 2024 Checlsea and Rachel Co ellie@chelseaandrachel.com *//
class CountDown {
    constructor(config) {
        this.config = config;

        this.raw_date = new Date();
            
        this.then = toUTC(new Date());
        this.then.setUTCHours(this.config.cutoff);





        this.intervalID = setInterval(()=>{
            this.calc();
        },1000);
        this.calc();
    }
    toUTC(date,hour=null) {
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
        date.getUTCDate(), hour?hour:date.getUTCHours(),
        date.getUTCMinutes(), date.getUTCSeconds()))
    }
    now() {
        return new Date(this.toUTC(new Date()))
    }
    calc() {
        this.delta = Math.floor((this.then - this.now())/1000);
        if (this.delta<0) {
            postMessage({days:0,hours:0,minutes:0,seconds:0,expired:true});
            clearInterval(this.intervalID);
            return;
        }

        postMessage({
            expired: false,
            days:this.extract(60*60*24),
            hours:this.extract(60*60),
            minutes:this.extract(60),
            seconds:this.extract(1)
        });
    }
    extract(seconds) {
        let val = Math.floor(this.delta/seconds);
        this.delta = this.delta % seconds;
        return String(val).padStart(2,'0');
    }
}
onmessage = (event)=>{
    const cdw = new CountDown(event.data);
}