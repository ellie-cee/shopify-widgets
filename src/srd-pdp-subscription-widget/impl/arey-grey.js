class AreyGreySubscriptionWidget extends SrDSubscriptionsWidget {
    container_extra() {
        return ``;
    }
    format_label(label) {
        return super.format_label(label).replace("(","").replace(")","")
    }
    parseSellingPlans(q) {
        return this.parseSellingPlansV2(q);
    }
    discounted_price() {
        let selling_plan = this.config.selling_plan;
        if (!selling_plan) {
            selling_plan = this.config.last_selling_plan;
        }
        let provisional_price = this.config.selected_variant.price*(1-((selling_plan)?selling_plan.discount:0));
        return provisional_price;
    }
    extraHTML() {
        return `
     `
    }
    render() {
        super.render();
        let root = document.querySelector(this.config.injection_point);
        /* root.querySelector(".rc-subscription-details").addEventListener("mouseover",event=>{
          root.querySelector(".rc-tooltip").classList.add("active");
        });
        root.querySelector(".rc-subscription-details").addEventListener("mouseout",event=>{
          root.querySelector(".rc-tooltip").classList.remove("active");
        }); */
    }
}