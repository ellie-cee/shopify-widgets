class SrdPdpPhotos extends SrD {
    defaults() {
        return {
            image_filter:(image,data)=>image.alt.includes(data.variantName),
            injection_point:".product-photos",
            thumbnail_width:100,
            thumbnail_height:100,
            thumbnail_process:['crop','center'],
            main_width:100,
            main_height:100,
            main_process:['crop','center'],
        }
  
    }
    image_filter(image,data) {
      return image.alt.includes(data.variantName);
    }
    constructor(options) {
      
        super(options);
        this.images=[];
        this.uuid = crypto.randomUUID();
        this.fetch();
        document.addEventListener("VariantUpdated",event=>{
            this.handleVariantUpdate(event.detail);
        });
    }
    handleVariantUpdate(detail) {
      this.config.selected = detail;
      this.render();
    }
    resize(image,width,height,process) {
      let url = new URL(image);
      url.pathname = url.pathname.replace(/(.*)\.(.*?)$/,'$1'+`_${width}x${height}${process.length>0?'_':''}${process.join("_")}`+'.$2')
      return url.toString()
    }
    thumbnail(image) {
        return this.resize(image,this.config.thumbnail_width,this.config.thumbnail_height,this.config.thumbnail_process);
    }
    main_image(image) {
        return this.resize(image,this.config.main_width,this.config.main_height,this.config.main_process);
    }
    
    fetch(after=null) {
        this.run_query(this.config.product_id,after).then(query=>{
            
            this.config.options = query.data.product.options;
            let featured_image_id = null;
            if (query.data.product.featuredImage) {
                featured_image_id = this.gid2id(query.data.product.featuredImage.id);
            }
            query.data.product.media.nodes.filter(item=>item.mediaContentType=="IMAGE").forEach(item => {
              
                this.images.push({
                    id:this.gid2id(item.id),
                    src:item.image.src,
                    alt:item.alt,
                    featured: item.id==featured_image_id,
                    type:item.mediaContentType.toLowerCase(),
                    width:item.image.width,
                    height:item.image.height,
                    aspect_ratio:item.image.width/item.image.height,
                })
            });
            if (query.data.product.media.pageInfo.hasNextPage) {
                this.fetch(query.data.product.media.pageInfo.endCursor);
            } else {
               
                this.render();
            }
        });
    }
    run_query(id,after=null) {
        
        return this.graphql(`
            query getProduct($id:ID!,$first:Int${after!=null?',$after:String':''}) {
                product(id:$id) {
                    id
                    options {
                        values
                    }
                    featuredImage {
                        id
                    }
                    media(first:$first${after!=null?',after:$after':''}) {
                        nodes {
                            mediaContentType
                            alt
                            id
                            ... on MediaImage {
                                image {
                                    src: url
                                    width
                                    height
                                }
                            }
                            ... on Video {
                                sources {
                                    src: url
                                    mimeType
                                    format
                                    height
                                    width
                                }
                            }
                        }
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                    }
                }
            }`,
            {id:`gid://shopify/Product/${id}`,after:after,first:250}
        )
        
    }
    render() {
  
    
    }
    setup_carousel() {
        document.dispatchEvent(new CustomEvent("PDPCarousel",{bubbles:true}));    
    }
  } 