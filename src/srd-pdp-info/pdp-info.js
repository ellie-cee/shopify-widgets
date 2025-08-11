class SrDPdpInfo extends SrD {
    constructor(options) {
        super(options)
        self.loadProduct().then(q=>{
            self.processQuery(q)
        })
    }
    processQuery(q) {

    }
    loadProduct() {
        this.graphql(
            `
            query getProductInfo($id:ID!) {
                product {
                    id
                    title
                    description: descriptionHtml
                    handle
                    url: onlineStoreUrl
                    tags
                    featuredImage {
                        url
                    }
                    featuredImage {
                        alt: altText
                        url
                    }
                    variants(first:100) {
                        nodes {
                            id
                            title
                            available: availableForSale 
                            sku
                            barcode
                            price {
                                amount
                            }
                            compareAtPrice {
                                amount
                            }
                            image {
                                alt: altText
                                url
                            }
                            option: selectedOptions {
                                name
                                value
                            }
                            ${additionalVariantQuery()}

                        }
                    }
                    ${this.additionalProductQuery}
                }
            }
            `,
            {
                productId: self.config.productId
            }
        )
    }
    render() {

    }
    additionalProductQuery() {}
    additionalVariantQuery() {}

}