/* Chelsea and Rachel Co. 2025 */

Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});
Object.defineProperty(String.prototype, 'depluralize', {
  value: function() {
    let lastChar = this.substring(this.length-1)
    if (lastChar=="s" || lastChar=="S") {
      return this.substring(0,this.length-1)
    }
    return this
  },
  enumerable: false
});


class EscVariableStore {
  static setValues(textObject) {
    
    if (window._EscVariableStoreValues) {
      window._EscVariableStoreValues = {...window._EscVariableStoreValues,...textObject}
    } else {
      window._EscVariableStoreValues = textObject;  
    }
  }
  static intFor(key,defaultValue) {
    return parseInt(EscVariableStore.textFor(key,defaultValue))
  }
  static textFor(key,defaultValue) {
    
    if (window._EscVariableStoreValues[key]) {
      return window._EscVariableStoreValues[key]
    } else {
      if (defaultValue) {
        return defaultValue;
      } else {
        return `missing text for ${key}`  
      }
    }
  }
  static multilineTextFor(key,tag="p",attributes={}) {
    let attributesString = Object.entries(attributes).map(values=>`${values[0]}="${values[1]}"`).join(" ");
    return EscVariableStore.textFor(key,"").split("\n").map(line=>`<${tag} ${attributesString}>${line}</${tag}`).join("\n")
  }
}

class HasUUID {
  contructor(options) {
    this.uuid = crypto.randomUUID()
    
  }
  getThisElement() {
    return document.querySelector(`[data-uuid="${this.uuid}"]`)
  }
}

class Esc {
  api_version = "2024-10";
  keyname = "subscriptions-2024-02";
 constructor(opts={}) {
      this.config = {...this.defaults(),...opts};
      this.errors=[];
      this.requires().forEach(field=>{
        if (!field in this.config) {
          this.errors.push(`Missing Required config field: ${field}`)
        }
      });
      if (this.errors.length>0) {
        throw new Error(this.errors.join("\n"));
      }
      this.observers = {}
  }
  static dispatchEvent(name,detail=null) {
    document.dispatchEvent(
      new CustomEvent(
        name,
        {"bubbles":true,"detail":detail}
      )
    )
  }
  static scrollToTarget(selector) {
    var element = document.querySelector(selector);
    var headerOffset = 0;
    var elementPosition = element.getBoundingClientRect().top;
    var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
    window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
      });   
  }

  
  requires() {
    return []
  }
  defaults() {
    return {
      api_version:"2023-10",
      keyname:"subscriptions-2024-02",
      siteRoot:'',
    };
  }
  fetch(url,config) {
    if (this.config.fetch_function) {
      return pure_fetch(url,config)
    } else {
      return fetch(url,config)
    }
  }
  /* shopify cart functions */
  siteUrl(path) {
    if (this.config.siteRoot) {
        return `${this.config.siteRoot}${path}`
    }
    return path
  }
  async getCart(url=this.siteUrl("/cart.js"),extended=false,callback=()=>{}) {
      let cart = {};
      return this.fetch(url)
    .then(res=>(extended)?res.text():res.json());
  }
  async request(url) {
      return this.fetch(this.siteUrl(ur)).then(text=>response.text())
  }
  async updateCart(payload) {
    return this.fetch(this.siteUrl(`/cart/update.js`), {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'xmlhttprequest'
      },
      body: JSON.stringify(payload)
    }).then((response) => response.json());
 }
  async removeItemFromCart(key) {
      return this.changeCart({
          id:key,
          quantity:0
        })
  }
  async updateItemCount(key,quantity) {
    return this.changeCart({
      id:key,
      quantity:parseInt(quantity)
    })
  }
  async changeCart(payload) {
      return this.fetch(this.siteUrl(`/cart/change.js`), {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'xmlhttprequest'
          },
          body: JSON.stringify(payload)
        }).then((response) => response.json());
   }
   async addToCart(payload) {
      let config = {
          method: 'POST',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
      }
      return this.fetch(this.siteUrl("/cart/add.js"),config)
          .then((response) => response.json())
   }
   
   static setupDawnProductForm(form) {
      form.querySelector("button").addEventListener("click",event=>{
         event.preventDefault();
         event.stopPropagation();
         new Esc().addToDawnCart(form).then(response=>{

       });
      });
    }
    async addToDawnCart(form) {

       let cart = document.querySelector("cart-drawer");
       const formData = new FormData();
       formData.append('product-id',form.dataset.productId);
       formData.append("id",form.querySelector('[name="id"]').value)
       formData.append("quantity",1);
       try {
         formData.append("selling_plan",form.querySelector('[name="selling_plan"]').value);
       } catch(e) {}

       formData.append('sections',cart.getSectionsToRender().map((section) => section.id));
       formData.append('sections_url',form.dataset.url);
       formData.append('form_type','product');

       return this.fetch(this.siteUrl("/cart/add"),{
           method: 'POST',
           headers: {
               "Accept":"application/javascript",
               "X-Requested-With":"XMLHttpRequest"
           },
           body: formData,form
       })
           .then((response) => response.json())
           .then(json=>{


             if (json.status) {
               EscModal.show(json.description);
             } else {
               cart.renderContents(json);
               cart.classList.remove("is-empty")
             }
             return json;
       });
    }

   /* graphql functions */
   async graphql(query,params) {
      return fetch(this.siteUrl(`/api/${this.api_version}/graphql.json`),{
          method:"POST",
          headers:{
            "content-type":"application/json",
            "X-Shopify-Storefront-Access-Token":this.config.graphql_token
            },
            body:JSON.stringify({query:query,variables:params})
          })
          .then(response=>response.json())
  }
  graphql_sync(query,params) {
      let ajax = new XMLHttpRequest();
      ajax.headers = {
          "content-type":"application/json",
          "X-Shopify-Storefront-Access-Token":this.config.graphql_token
      }
      ajax.open("POST",this.siteUrl(`/api/${this.api_version}/graphql.json`),false)
      ajax.setRequestHeader("Content-Type", "application/json");
      ajax.setRequestHeader("X-Shopify-Storefront-Access-Token", storefront_token);
      ajax.send(JSON.stringify({query:query,params:params}));
      return JSON.parse(ajax.responseText);
  }
  gid2id(gid) {
    return parseInt(gid.split("/").pop())
  }
  collapse_query(object) {
    if (object==null) {
        return object;
    }
    switch(object.constructor.name) {
    case "Array":
        return object.map(item=>this.collapse_query(item));
        break;
        case "Object":
            let ret = {};
            Object.keys(object).forEach(key=>{
                if (object[key]==null) {
                    ret[key] = null;
                    return;
                }
                if (object[key].reference) {
                    ret[key] = this.collapse_query(object[key].reference)
                    return;

                }
                if (object[key].references) {
                    let all = [];
                    object[key].references.nodes.forEach(ref=>{
                        let crv = {};
                        if (ref.fields) {
                          ref.fields.forEach(field=>{
                            crv[field.key]=this.collapse_query(field.value)
                          })  
                        } else {
                          Object.keys(ref).forEach(field=>{
                            
                            if (ref[field]) {
                              if (ref[field].value) {
                                crv[field]=this.collapse_query(ref[field].value)    
                              } else {
                                let newHash = {}
                                Object.keys(ref[field]).forEach(key=>{
                                  newHash[key] = this.collapse_query(ref[field][key])
                                });
                                crv[field] = newHash
                              }
                              
                              
                            } else {
                              crv[field] = null
                            }
                            
                          })
                        }
                        
                        all.push(crv)
                    })
                    object[key] = all;

                }
                if (object[key].type && object[key].type=="json") {
                  object[key] = JSON.parse(object[key ])
                }
                if (object[key].nodes && object[key].nodes.constructor.name=="Array") {
                    ret[key] = this.collapse_query(object[key].nodes);
                } else {
                    ret[key] = this.collapse_query(object[key])
                }
            });
            return ret
            break;
        default:
            if (object) {
                return object;
            }

            break;
    }
}
   css() {
      return '';
   }
   inject_css() {
      let css = this.css();
      if (css.length>0) {
          let style = document.createElement("style");
          style.id=this.constructor.name.toLowerCase();
          style.textContent = this.css();
          document.querySelector("head").appendChild(style);
      }

   }
   slugify(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
    str = str.toLowerCase(); // convert string to lowercase
    str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
             .replace(/\s+/g, '-') // replace spaces with hyphens
             .replace(/-+/g, '-'); // remove consecutive hyphens
    return str;
  }
  unmonitoredAction(form,field,action) {
    if (!this.observers) {
      action();
      return;
    }
    console.error(this.observers)
    console.error("starting unmonitored action")
    if (this.observers[field]) {
      if (this.observers[field]!="true") {
        this.observers[field].disconnect();
        delete this.observers[field]
      }
    }
    action();
    console.error("ending unmonitored action")
    this.monitorForm(form,field)
  }
  monitorForm(form) {
    if (!this.observers) {
      this.observers = {}
    }
    Array.from(arguments).forEach((argument,index)=>{
      if (index==0) {
        return;
      }
      let field = form.querySelector(`[name="${argument}"]`);
      if (this.observers[argument]) {
        return;
      }
      let key = `data-monitoring-${argument}`;
      if (form.getAttribute(key)) {
          return;
      }
      switch(field.tagName) {
        case "SELECT":
            this.observers[argument] = "true";
            field.addEventListener("change",event=>{
                if (window._form_montor_on) {
                  
                  Esc.dispatchEvent("esc:formValue:changed",{field:argument,value:field.options[field.selectedIndex].value});
                }
          })
          break;
        default:
          
          this.observers[argument] = new MutationObserver((list,observer)=>{

           
              Esc.dispatchEvent("esc:formValue:changed",{field:argument,value:field.value});  
           
          });
           this.observers[argument].observe(field,{attributes:true,subtree:false,childList:false});
        }
      })
  }
}

class EscStorefront extends Esc {
  requires() {
    return ["graphql_token"]
  }
}