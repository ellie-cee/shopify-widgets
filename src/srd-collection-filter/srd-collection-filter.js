class SrDCollectionFilter extends SrD {
    constructor(options) {
        super(options);
        this.product_filters = [];
        this.options = []
    }
    defaults() {
        return {

        }
    }
    render() {

    }
    load_collection(handle,after=null) {
        return this.graphql(
            `
            query getCollectionByHandle($handle:String,$first:Int,${after?'$after:String':''}) {
                filters: metafield(namespace:"custom",key:"filters") {
                    value
                    reference {
                        ... on Metaobject {
                            title: field(key:"title") {
                                value
                            }
                            product_tags: field(key:"filters") {
                                references(first:10) {
                                    nodes {
                                        ... on Metaobject {
                                            fields {
                                                key
                                                value
                                            }
                                        }
                                    }
                                }   
                            }
                            ranges: field(key:"price_range") {
                                references(first:10) {
                                    nodes {
                                        ... on Metaobject {
                                            fields {
                                                key
                                                value
                                            }
                                        }
                                    }
                                }   
                            }

                        }
                    }
                }
            `,
            {handle:handle,first:25,after:after}
        ).then(data=>{
            let q = this.collapse_query(data);
            console.error(q);
        })
    }
}

class ProductFilter {
    constructor(parent,filters) {
        this.parent = parent;
        this.filters = filters;
    }
    render_form() {

    }
    render_indicator() {

    }
    renderType() { return "tags"}
    url() {

    }
    setup_events() {

    }
}
