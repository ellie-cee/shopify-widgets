class SrDUpgradeToSubscription extends SrD {
	constructor(options) {
	  super(options);
	  if (!this.config.graphql_token) {
		  console.error("Subscriptions Upgrade Widget requires a graphql storefront token");
	  }
	  this.cart = {};
	  this.subscriptions = {};

		this.load_subs();
		document.addEventListener("CartUpdated",event=>{


		  this.ready = true;
		  this.render(event.detail)
	  });
	}
	defaults() {
	   return {
		  'cart_item_selector':'.go-cart-item__single',
		  'upgrade_text':'Upgrade To Subscription',
		  'downgrade_text':'Converting to One-Time',
		  'upgrading_text':'Upgrading to Autoship',
		  'updating_text':'Updating Autoship',
    	  'shop':'wild-planet-food.myshopify',
		  'onetime_text':'One-time Purchase',
		  'update_cart':(obj)=>goCart.fetchCart(),
          'option_text':(text)=>text,
          'eligibility_check':(item)=>true,
	  };
	}
	  render(cart={}) {

			this.cart = cart;

			let subscription_items = cart.items.reduce((a,b)=>{
				return (b.selling_plan_allocation && b.selling_plan_allocation.selling_plan)?a+b.quantity:a;
			},0);

		  document.querySelectorAll(this.config.cart_item_selector).forEach((element)=>{
			  let eligible_item = element.querySelector("[data-upgradeable-item]");
			  if (eligible_item) {
					let product = this.subscriptions[parseInt(eligible_item.getAttribute("data-line-item-product"))];

				  if (!product) {

							  return;
				  } else {
                    if (!this.config.eligibility_check(this.cart.items[parseInt(eligible_item.dataset.line)-1])) {
                      return;
                    }
                  }
				  if (eligible_item.getAttribute("data-selling-plan")) {
						  this.insert_delivery_schedule(eligible_item,eligible_item.getAttribute("data-selling-plan"));
				  } else {
						  this.insert_upgrade_button(eligible_item,subscription_items);
				  }
			  }
		  });
		  document.dispatchEvent(
			  new CustomEvent("CartUpdated2",{bubbles:true,detail:cart})
		  );
	  }
	  insert_upgrade_button(element,esubs) {
		  while(element.firstChild) {
			  element.removeChild(element.firstChild);
		  }
	  let psubs = esubs+parseInt(element.getAttribute("data-quantity"));
	  let discount = 10;
	  if (psubs==2) {
		  discount=15;
	  } else if (psubs>=3) {
		  discount=25
	  }

		  let button  = document.createElement("button");
		  button.setAttribute("data-line-item-key",element.getAttribute("data-line-item-key"));
		  button.setAttribute("data-line",element.getAttribute("data-line"));
		  button.innerHTML = `${this.config.upgrade_text.replace("##amount",discount)}`;
		  button.classList.add("cr-upgrade-to-subscription-widget-button");
		  button.addEventListener("click",(event)=>{
			  this.upgrade_to_subscription(event.srcElement);
		  });
		  element.appendChild(button);
	  }
	  insert_delivery_schedule(element,current_id) {
		  while(element.firstChild) {
			  element.removeChild(element.firstChild);
		  }

		  let select = document.createElement("select");
		   select.setAttribute("data-line-item-key",element.getAttribute("data-line-item-key"));
			 select.setAttribute("data-line",element.getAttribute("data-line"));
		  select.classList.add("cr-upgrade-to-subscription-widget-select");

		  let otgroup = document.createElement("optgroup");
		   otgroup.label = this.config.onetime_text;
		  let otv = document.createElement("option");
			otv.value="";
			otv.text=this.config.onetime_text;
			otgroup.appendChild(otv);
			select.appendChild(otgroup);

		  let subgroup = document.createElement("optgroup");
			subgroup.label="Subscribe and Save";
		  this.subscriptions[element.getAttribute("data-line-item-product")].options.forEach((option)=>{
			  let opt = document.createElement("option");
			  opt.value=option.id;
			  opt.text=this.config.option_text(option.label);
			  if (current_id==option.id) {
				   opt.selected = "true";
			  }
			  subgroup.appendChild(opt);
		  });
		  select.appendChild(subgroup);
		  element.appendChild(select);
		  select.addEventListener("change",(event)=>{
			  this.update_subscription(event.srcElement);
		  });
	  }
	  upgrade_to_subscription(element) {
		  let eligible_item = element.parentNode;

		  let product = this.subscriptions[eligible_item.getAttribute("data-line-item-product")];
		  eligible_item.removeChild(element);
		  this.display_notice(eligible_item,this.config.upgrading_text);
			eligible_item.setAttribute("data-selling-plan",product.options[0].id);

			this.changeCart(
				{line:eligible_item.getAttribute('data-line'),selling_plan:product.options[0].id,quantity:eligible_item.getAttribute('data-quantity')}
		  )
				.then(json=>{
				  eligible_item.setAttribute("data-selling-plan",product.options[0].id);
                  document.dispatchEvent(new CustomEvent("ShowCart",{bubbles:true}))
				  this.render(this.cart);
			  }
			)
	  }

	  update_subscription(element) {
		  let eligible_item = element.parentNode;
		  let value = element.options[element.selectedIndex].value;

		  if (value) {
				eligible_item.setAttribute("data-selling-plan",value);
			  this.display_notice(eligible_item,this.config.updating_text);
			  this.changeCart({
				  line:eligible_item.getAttribute('data-line'),
				  selling_plan:value,
				  quantity:eligible_item.getAttribute('data-quantity')
			  })
				  .then(json=>{

					eligible_item.setAttribute("data-selling-plan",value);
					document.dispatchEvent(new CustomEvent("ShowCart",{bubbles:true}))
				  })
		  } else {
			  this.display_notice(eligible_item,this.config.downgrade_text);
			  this.changeCart({
				  line:eligible_item.getAttribute('data-line'),
				  selling_plan:value,
			  })
				  .then(json=>{
					  document.dispatchEvent(new CustomEvent("ShowCart",{bubbles:true}))
					  eligible_item.setAttribute("data-selling-plan",'');
				  })


		  }
	  }
	  display_notice(element,text) {
		  while(element.firstChild) {
			  element.removeChild(element.firstChild);
		  }
		  let notice = document.createElement("div");
		  notice.classList.add("cr_upgrade_to_selection_widget-notification");
		  notice.innerHTML = text;
		  element.appendChild(notice);
	  }
	  dispatch(detail) {
		  let ev = new CustomEvent("SubscriptionUpgrade",{bubbles:true,detail:detail});
		  document.dispatchEvent(ev);
	  }
	  products_query(cursor=null) {
		  return `
		  query getProducts($first: Int, $query: String${(cursor)?',$after:String':''}) {
			  products(first: $first,${(cursor)?'after:$after':''},query:$query) {
					  pageInfo {
						  hasNextPage
						  startCursor
						  endCursor
						 }
					  edges {
						 cursor
						  node {
						  sellingPlanGroups(first: 250) {
							  edges {
							  node {
								  name
								  sellingPlans(first:250) {
									  edges {
										  node {
											  id
											  options{
												  value
											  }
											  recurringDeliveries
										  }
									  }
								  }
							  }
						  }
					  } 
					  id
				  }
			  }
		  }
	  }`
	  }
		load_subs(cursor=null) {

		  if (sessionStorage.getItem(this.keyname)) {
			  let data = JSON.parse(sessionStorage.getItem(this.keyname));

			  if (Date.now()-data.timestamp<60*60*2*1000) {

				this.subscriptions = data.subscriptions;
				if (this.ready) {
				  this.render(this.cart);
				}
				return;
			  }


		  }

		  this.graphql(this.products_query(cursor),{after:cursor,first:25,query:"tag_not:dqdwdeqw"})
			  .then(q=> {

				  if (q.data && q.data.products.edges.length>0) {
					  let tmp_subscriptions = {};
					  q.data.products.edges.forEach(edge=>{
						  if (edge.node.sellingPlanGroups.edges.length>0) {
							  let group = edge.node.sellingPlanGroups.edges[0].node;
							  tmp_subscriptions[this.gid2id(edge.node.id)] = {
								  group_id:group.name,
								  options:group.sellingPlans.edges.map(selling_plan=>{
									  return {
										  id:this.gid2id(selling_plan.node.id),
										  label:selling_plan.node.options[0].value,
										  recurring:selling_plan.node.recurringDeliveries
									  }
								  }).filter(item=>item.recurring)
							  }

						  }
					  })
					  this.subscriptions = {...this.subscriptions,...tmp_subscriptions}
					  try {

						  if (q.data.products.pageInfo && q.data.products.pageInfo.hasNextPage) {
							if (q.data.products.pageInfo.endCursor!=this.last_cursor) {
							  this.last_cursor = cursor;
								this.load_subs(q.data.products.pageInfo.endCursor)
							}
					  } else {
						  sessionStorage.setItem(this.keyname,JSON.stringify({timestamp:Date.now(),subscriptions:this.subscriptions}));
							  if (this.ready) {
								  this.render(this.cart);
							  }
						  }
					  } catch(e) {
						console.error(e);
						console.error(q);
					  }

				  }
		  });
	  }
      css() {
        return ``;
      }
  }