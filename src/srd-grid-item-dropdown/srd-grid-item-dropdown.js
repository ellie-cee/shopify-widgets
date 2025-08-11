class SrDGridItemDD extends SrD {
    defaults = {
        target:".srd-variants-dd",
        icons: true,
        title_transform:(title)=>title,
    }
    constructor(options) {
        super(options);
        document.querySelectorAll(this.config.target).forEach(item=>this.render(item));
    }

    render() {    }
    
    css() {
        return ``;
    }
}