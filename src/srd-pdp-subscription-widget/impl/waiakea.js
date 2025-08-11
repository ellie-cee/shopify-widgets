class WaiakeaBuyBox extends SrDSubscriptionsWidget {
    constructor(options) {
        super(options)
    }
    extraProductQuery() {
        return `
        buyBoxGroup: metafield(namespace:"srd",key:"buy_box_group") {
            value
        }
        buyBoxIcon: metafield(namespace:"srd",key:"buy_box_icon") {
            value
            reference {
                ... on MediaImage {
                    image {
                        url
                    }
                }
            }
        }
        `
    }
    load_product(id) {
       
        if (this.config.tagGroup==null) {
            return super.load_product(id)
        }
        return this.graphql(`
            query getProducts($query:String) {
                products(limit:20,query:$query) {
                    nodes {
                        id
                        tags
                        variants(first:10) {
                            nodes {
                                id
                                price {
                                    amount
                                }
                                sellingPlanGroups(first:5) {
                                    nodes {
                                        ...sellingPlanGroup
                                    }
                                }
                            }
                        }
                        sellingPlanGroups(first:5) {
                            nodes {
                                ...sellingPlanGroup
                            }
                        }
                        ${this.additionalProductQuery()}

                    }
                }
            }
            ${this.fragments()}
            `,
            {query:`tag:${this.config.tagGroup}`}
        );
    }
}