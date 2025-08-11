class BambooSubscriptionWidget extends SrDSubscriptionsWidget {
  constructor(options) {
    super(options)
  }
  monitorForm() {
    super.monitorForm()
    let quantity = document.querySelector(this.config.form_selector).querySelector('[name="quantity"]');
    if (quantity) {
        quantity.addEventListener("change",event=>document.dispatchEvent(new CustomEvent("srd:subscriptions:quantityChanged",{bubbles:true,detail:quantity.value})))  
      }
  }
  container_extra() {
    return this.config.badge_text.replace("##discount##",`${this.config.last_selling_plan.discount*100}%`);
  }
  format_label(label) {
       return super.format_label(label).replace("(","").replace(")","")
  }
     parseSellingPlans(q) {
      return this.parseSellingPlansV1(q);
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
    onetime_label_extra() {
      
      return `$${(this.regular_price()/this.config.selected_variant.cupsPer).toFixed(2)}/cup`
    }
    subscriptions_label_extra() {
      return `$${(this.discounted_price()/this.config.selected_variant.cupsPer).toFixed(2)}/cup`;
    }
    render() {
      super.render();
      this.enhanceATC();  
    }
}
  