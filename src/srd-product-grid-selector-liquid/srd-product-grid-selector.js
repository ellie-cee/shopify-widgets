class SrDProductGridSelector {
    constructor() {
      document.querySelectorAll(".srd-product-grid-selector").forEach(selector=>{
        this.render(selector);
        selector.addEventListener("click",event=>{
          Array.from(document.querySelectorAll(".srd-product-grid-selector.active"))
            .filter(otra=>otra.dataset.productId!=selector.dataset.productId)
            .forEach(otra=>otra.classList.remove("active"));
          
          selector.classList.toggle("active");
        });
        selector.addEventListener("gridselector-close-all",event=>{
          console.error("closing 2");
          selector.classList.remove("active");
        });
        selector.querySelectorAll(".option-item").forEach(item=>item.addEventListener("click",event=>{
          event.stopPropagation();
          event.preventDefault();
          selector.querySelector(".header").textContent = item.dataset.title;
          selector.querySelector(".srd-product-grid-variant-id").value = item.dataset.variantId;
          selector.classList.remove("active")
        }))
      })
      document.querySelector("body").addEventListener("click",event=>{
        let node = event.target;
        let proceed= true;
        while(proceed && node.parentNode) {
          if (node.classList.contains("srd-product-grid-selector")) {
            proceed = false;
          } else if (node.classList.contains("main-content")) {
            proceed = false;
            console.error("closing");
            document.querySelectorAll(".srd-product-grid-selector").forEach(selector=>selector.classList.remove("active"))
            
          } else {
            node = node.parentNode;
          }
        }
      })
    }
    setTitle(item) {
      selector.querySelector(".header").textContent = item.dataset.title;
    }
    render(selector) {
    }
  }