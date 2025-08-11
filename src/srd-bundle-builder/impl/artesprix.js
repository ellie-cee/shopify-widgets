class ArtesPrixBundleBuilder extends SrDBundleBuilder {
    constructor(options) {
        super(options);
        this.fetch().then(q=>this.init(q))
    }
    init(q) {
        super.init(q);
        console.error(q);
    }
    additionalProductFields() {
        return `
            count: metafield(namespace:"srd",key:"product_count") {
                value
            }
            product: metafield(namespace:"srd",key:"bundle_product") {
                reference {
                    ... on Product {
                        id
                        title
                        variants(first:1) {
                            nodes {
                                id
                                price {
                                    amount
                                }
                            }
                        }
                    }
                }
            }
            variants: metafield(namespace:"srd",key:"bundle_variants") {
                references {
                    ... on ProductVariant {
                        id
                        title
                        selectedOptions {
                            name
                            value
                        }
                    }
                }
            }
            type: metafield(namespace:"srd",key:"product_count") {
                value
            }
        `
    }
}