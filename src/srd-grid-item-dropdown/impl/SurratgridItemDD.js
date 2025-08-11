class SurratGridItemDD extends SrDGridItemDD {
    render(target) {
        let variants = [];
        try {
            variants = JSON.parse(target.getAttribute("data-variants")).filter(variant=>variant.available);
        } catch(e) {
            console.error(typeof this,e);
            return;
        }
        if (variants.filter(item=>item.available).length<=1) {
            return;
        }
        let options = variants.map(variant=>`
        <li class="srd-gidd-option" data-variant="${variant.id}">
            <span class="srd-gidd-option-icon"><img src="${variant.featured_image.src}"></span>
            <span class="srd-gidd-option-label">${this.config.title_transform(variant.title)}</span>
        </li>`);
        target.innerHTML = `<button class="srd-gidd-option-button">
            <span class="srd-gidd-selected-icon"><img src="${variants[0].featured_image.src}"></span>
            <span class="srd-gidd-selected-label">${this.config.title_transform(variants[0].title)}</span>
            <i class="zmdi zmdi-chevron-down"></i>
        </button>
        <ul class="srd-gidd-selected-options">${options.join("")}</ul>`;

        target.querySelector(".srd-gidd-option-button").addEventListener("click",event=>{
            e.preventDefault();
            e.stopPropagation();
            target.classList.toggle("active");
        });
        target.querySelectorAll(".srd-gidd-option").forEach(li=>li.addEventListener("click",event=>{
            target.classList.remove("active");
            let variant = variants.find(variant=>variant.id==int(li.dataset.variant));
            if (variant) {
                target.querySelector("srd-gidd-option-icon img").src = variant.featured_image.src;
                target.querySelector("srd-gidd-option-label").textContent = this.config.title_transform(variant.title);
            }
        }));
    }
}