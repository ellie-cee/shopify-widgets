class ShorePdpPhotos extends CnRPdpPhotos {
  main_image(image) { 
    return image;
  }
   handleVariantUpdate(detail) {
    if (this.config.selected.variantName!=detail.options[1]) {
      this.config.selected = {
        id:detail.id,
        variantName:detail.options[1],
      }  
      this.render();
    }
  }
image_filter(image,data) {
  return image.alt.toLowerCase().includes(data.variantName.toLowerCase());
}
render() {
  
  let images = null;
  if (!this.config.options) {
    return;
  }
  
  if (this.config.options.length==1 && this.config.options[1].values.length==1) { /* single variant product */
    images = this.images;
  } else {
    images = this.images.filter(img=>this.image_filter(img,this.config.selected));
    if (images.length<1) {
      images = this.images;
    }
  }
  let srcset = (image)=>[245,320,410,490,640,753,848,980,1066].map(width=>`${image}&width=${width} ${width}w`).join(", ");
  let feature_image_html = (image)=>`
    <div id="$${this.uuid}-${ image.id }" class="product-single__media-slide${!image.featured?' media--hidden':''}" data-product-slide data-id="${ image.id }" data-aspectratio="${ image.aspect_ratio }" data-media-id="${this.uuid}-${ image.id }" data-type="${ image.type }" data-product-single-media-wrapper>
      <div class="product-single__media product-single__media--image">
        <div class="product-single__media--image-height" style="padding-top:${Math.ceil((1/image.aspect_ratio)*100)}%"></div>
          <figure class="lazy-image lazy-image--cover">
            <img src="${image.src}&crop=center&height=1600&width=1066" alt="${image.alt}" width="1066" height="1600"
            loading="lazy" size"(min-width: 1400px) 369px, (min-width: 768px) calc((100vw - 40px) * 0.6 - 30px), calc(100vw - 40px)"
            srcset="${srcset(image.src)}" 
            data-product-image="" data-image-id="${image.id}"
            >
          </figure>
        </div>
      </div>
      
`;

let thumbnail_image_html = (image,index)=>`
<div class="product-single__thumbnail is-selected is-nav-selected" data-id="${image.id}" data-thumbnail-id="${this.uuid}-${image.id}" data-index="${index}">
  <div class="product-single__thumbnail-link">
    <figure class="lazy-image lazy-image--cover">
      <img src="${image.src}&crop=center&height=267&v=1709320069&width=178" alt="${image.alt}" width="178" height="267" loading="lazy" sizes="89px" srcset="${image.src}&width=89 89w" class="product-single__thumbnail-img img-object-cover" style="">
    </figure>
  </div>
</div>
`;

let primary_images = images.map(image=>feature_image_html(image)).join("\n");  
let thumbnails = images.map((image,index)=>thumbnail_image_html(image)).join("\n");  
  document.querySelector(this.config.injection_point).innerHTML = `
  <div class="product-single__media-slider${images.length==1?' product-single__media-slider--single':''} cnr-pdp-slider" >
    ${primary_images}
  </div>
  <div class="product-single__thumbnails cnr-pdp-thumbs" id="ProductThumbs" >
      ${thumbnails}
  </div>
  `;
  if (window.innerWidth<768) {
      this.flickity = new Flickity(document.querySelector(".cnr-pdp-slider"), {
        prevNextButtons: true,
        wrapAround: true,
        adaptiveHeight: false,
        cellAlign: 'left',
        groupCells: false,
        contain: true,
      });
      this.thumbs = new Flickity(document.querySelector(".cnr-pdp-thumbs"),{
        asNavFor:".cnr-pdp-slider",
        pageDots:false,
        contain:true,
        prevNextButtons: false,
      })
      
    }
}
}