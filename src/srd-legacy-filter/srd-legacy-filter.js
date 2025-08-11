class SrDLegacyFilter {
    defaults() {
        return {
            label:"Product",
            filterSelector:".filter-tagby-js"
        }
    };
    constructor(options={}) {
        this.config = {...this.defaults(),...options};
        this.url = new URL(location.href);
        
        this.active_tags = this.extract_tags();
        console.error(this.active_tags);
        document.querySelectorAll(this.config.filterSelector).forEach(filter=>{
          if (this.active_tags.includes(filter.id)) {
            filter.checked = true;
          }
          filter.addEventListener("change",event=>{
            if (filter.checked) {
              this.active_tags.push(filter.id);
            } else {
              this.active_tags = this.active_tags.filter(tag=>tag!=filter.id);
            }
            this.apply_filter();
          });
        })
    }
    extract_tags() {
      let parts = this.url.pathname.split("/").filter(p=>p && p.length>0)
      
      if (parts.length>2) {
        return parts.pop().split("+");
      } else {
        return [];
      }
    }
    apply_filter() {
      let params = this.url.searchParams;
      params.delete("page");
      if (params.size>0) {
        this.url.search = `?${params.toString()}`
      }
      this.url.pathname = this.url.pathname.split("/").filter(p=>p && p.length>0).slice(0,2).concat([this.active_tags.join("+")]).join("/");
      location.href = this.url.toString();
    }

}