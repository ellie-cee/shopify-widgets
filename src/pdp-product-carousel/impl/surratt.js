class SurrattPdpPhotos extends CnRPdpPhotos {
    main_image(image) { 
      return image;
    }
  render() {
    
    let images = null;
    if (!this.config.options) {
      return;
    }
    
    if (this.config.options.length==1 && this.config.options[0].values.length==1) { /* single variant product */
      images = this.images;
    } else {
      images = this.images.filter(img=>this.config.image_filter(img,this.config.selected))
    }
    
    let primary_images = images.filter(image=>!image.alt.includes("SWATCH")).map(image=>`
       <div class="single-featured-photo" style="width:476px!important">
        <div class="image-fit-wrap">
            <div class="featured-image">
                <img data-src="${ this.main_image(image.src) }"
                src="${ this.main_image(image.src) }"
                alt="${ image.alt }"
                width="1000"
                height="auto"
                />
            </div>
        </div>
      </div>
    `).join("\n");
    let thumbnail_images = images.filter(image=>!image.alt.includes("SWATCH")).map((image,index)=>`
      <div class="single-thumb" data-image="${ image.id }" data-index="${index}" data-is-swatch="false">
        <div class="thumb-fit-wrap bg-placeholder" style="background-image:url(${this.thumbnail(image.src)});">
            <img data-src="${ this.thumbnail(image.src) }" src="${ this.thumbnail(image.src) }" alt="${ image.alt }" width="115px" height="115px">
        </div>
      </div>
    `).join("\n")
    
    document.querySelector(this.config.injection_point).innerHTML = `
      <div class="single-product-photo product-photo slider-wrap">
         <div  class="js-slider-primary" id="ProductPhoto">
           ${primary_images}
        </div>
      </div>
      <div class="product-thumbs slider-wrap has-arrows pdp-carousel-slider">
        <div class="js-slider-thumbs" id="ProductThumbs">
          ${thumbnail_images}
        </div>
      </div>
    `;
    this.setup_carousel();
  }
}