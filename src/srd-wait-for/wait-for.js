class WaitFor {
    constructor(element,callback,timeout=50,attempts=50) {
        this.iterations = 0;
        this.id = window.setInterval(()=>{
            this.iterations++;
            let element= document.querySelector(element);
            if (element) {
                window.clearInterval(this.id);
                callback(element);
            } else if (this.iterations>=attempts) {
                window.clearInterval(this.id);
            }
        },timeout);
    }
}