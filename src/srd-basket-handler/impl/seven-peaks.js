class SpBasketHandler extends SrDBasketHandler {
    
    save() {
      sessionStorage.setItem(
        "fence-builder-basket",
        JSON.stringify(this.baskets)
      )
    }
    getGeometry(index=null) {
      if (index==null) {
        index = this.basketIndex;
      }
      
      return this.get(index).geometry;
    }
    setGeometry(geometry) {
        this.baskets[this.basketIndex].geometry = geometry;
        if (geometry.sides.length<1) {
          this.clear()
          
        }
        return this;
    }
    clearSection(section) {
      super.clearSection(section)
      if (section=="clips") {
        if (this.baskets[this.basketIndex].contents["screws"]) {
          delete this.baskets[this.basketIndex].contents["screws"]  
        }
      }
    }
    
    setGate(index,contents) {
      if (!this.baskets[this.basketIndex].contents.gates) {
        this.baskets[this.basketIndex].contents.gates = []
      }
      this.baskets[this.basketIndex].contents.gates[index] = contents
    }
    clearGates() {
      this.baskets[this.basketIndex].contents.gates = []
    }
    consolidated(index=null) {
      let basket = this.get(index).contents
      let groups = {
          "hardware":[]
        }
        if (basket["panels"]) {
          groups["panels"] = basket["panels"]
        }
        if (basket["posts"]) {
          groups["posts"] = basket["posts"]
        }
        if (basket["gates"]) {
          let consolidatedItems = {}
          basket["gates"].forEach(gate=>{
            let variantId = gate.id;
            if (consolidatedItems[variantId]) {
              consolidatedItems[variantId].quantity+=gate.quantity;
            } else {
              consolidatedItems[variantId] = {
                id:gate.id,
                product:gate.product,
                variant: gate.variant,
                quantity:gate.quantity
              }
            }
          })
          groups["gates"] = Object.values(consolidatedItems)
        }
        ["caps","clips","clamps","screws"].forEach(category=>{
          if (basket[category]) {
            basket[category].forEach(item=>groups["hardware"].push(item))
          }
        })
        return groups
    }
    
    

    render(basketIndex=null) {
      let groups = this.consolidated(basketIndex)
      let retVal = ["panels","gates","posts","hardware"].map(
          basketCase=>groups[basketCase] && groups[basketCase].length>0?this.renderBasketEntry(basketIndex,basketCase,groups[basketCase]):''
        ).join("");
      
      return retVal
    }
  
    recommendedLabel(item) {
      if (parseInt(item.quantity)<parseInt(item.recommended)) {
            return 'less than recommended'
      } else if (parseInt(item.quantity)>parseInt(item.recommended)) {
        return "more than recommended"
      } else {
        return "recommended"
      }
    }
    renderBasketEntry(basketIndex,entry,details) {
        
        return `
            <div class="items-category">
              <div class="items-category-label">${entry.capitalize()}:</div>
              <div class="line-items">
                ${details.map(item=>`
                
                <div class="line-item" data-product="${item.id}" >
                  <div class="product-image"><img src="${this.variantImage(item.product,item.variant)}?width=105&height=93&crop=center" alt="${this.variantImageAlt(item.product,item.variant)}"></div>
                  <div class="details">
                    <div class="product-title">${item.product.title} ${item.variant.title.includes("Default")?'':item.variant.title}</div>
                    <div class="item-details">
                      <div class="quantity-field">${new SrDQuantity({value:item.quantity,dataset:{productId:item.id,recommended:item.recommended,basket:basketIndex}}).render()}</div>
                      <div class="quantity-label">${this.recommendedLabel(item)}</div>
                    </div>
                  </div>
                </div>
            `).join("")}
            </div>
          </div>
        `
      }
    lineItemProperties(basket,item) {
      return {"_fenceBuilderId":basket.id}
    }
  
  }



