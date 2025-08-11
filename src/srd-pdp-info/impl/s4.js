class S4PdpInfo extends SrDPdpInfo {
    additionalProductQuery() {
        return `
        additionalItems: metafield(namespace:"srd",key:"additional_items") {
            config: reference {
                ... on MetaObject {
                    fields(first:4) {
                        key
                        value
                        productSet: reference {
                            ... on MetaObject {
                                key
                                type
                                fields(first:4) {
                                    key
                                    value
                                    products: references(first:50) {
                                        ... on Product {
                                            id
                                            title
                                            url: onlineStoreUrl
                                            description: descriptionHtml
                                            featuredImage {
                                                alt: altText
                                                url
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        productInfo: metafield(namespace:"srd",key:"product_information_tab_v1") {
            type
            value
        }
        family: metafield(namespace:"facets",key:"product_family") {
            type
            value
        }
        featuresAndBenefits: metafield(namespace:"srd",key:"srd.features_and_benefits") {
            type
            value
        }
        `
    }
    additionalVariantQuery() {
        return `
        productInfo: metafield(namespace:"srd",key:"product_information_tab_v1") {
            type
            value   
        }
        `
    }
    processQuery(q) {
        console.error(q)
        pdpInfo = self.collapseQuery(q)
        console.error(pdpInfo)
    }
}