/* Chelsea and Rachel Co. 2024 */

 class LilacGiftingHandler extends SrDFileUpload {
    constructor(options) {
      super(options)

      this.submitButton = document.querySelector(".gifting-submit")
      this.checkValues()
    }
    root() {
      return document.querySelector(this.config.optionsRoot)
    }
    uploadPath() {
        return "upload";
    }
    uploadFields() {
        return ["logo_upload","addresses_upload"];
    }
    buildProperties() {
      let items = {}
      this.propertiesComplete = true;
      let propertySelectors = this.root().querySelectorAll('ul[role="listbox"]');
      this.root().querySelectorAll('ul[role="listbox"]').forEach(options=>{
        let itemKey = options.dataset.collate
        let selectedItem = options.querySelector('[aria-selected="true"]');
        if (!selectedItem) {
          this.propertiesComplete = false;
          return;
        }
        if (!items[itemKey]) {
          items[itemKey] = {
            title:null,
            optionValues:[],
          };
        }
        if (options.dataset.formTitle) {
          items[itemKey].title = options.dataset.formTitle;
        }
        items[itemKey].optionValues.push(selectedItem.dataset.value)
      })
      items = Array.from(Object.values(items))
      
      let visiblePropertyItemBuilder = (item)=> {
          let newObject = {}
          newObject[item.title] = item.optionValues.join(" ")
          return newObject
      };
  
      let properties = items.reduce((a,b)=>Object.assign(a,visiblePropertyItemBuilder(b)),{});
      let shippingOptionType = document.querySelector("input[data-shipping-type]:checked");
      
      properties._gifting = {
        items:items.map(item=>Object.assign({},{title:`${item.title.trim()}: ${item.optionValues.join(" ")}`})),
        shipping_type:shippingOptionType.dataset.shippingType,
      }
      Object.entries(this.uploadCache).forEach(kvp=>properties._gifting[kvp[0]]=kvp[1])
      
      return properties
      
    }
    checkValues() {
      let properties = this.buildProperties();
      console.error(properties,this.propertiesComplete)
      if (this.propertiesComplete) {
        this.submitButton.disabled = false;
        this.submitButton.classList.remove("inactive")
      } else {
        this.submitButton.disabled = true;
        this.submitButton.classList.add("inactive")
      }
    }
    
    setupEvents() {
      super.setupEvents()
  
      
    // COLOR DROPDOWNS
        const dropdowns = document.querySelectorAll('[data-color-dropdown]');
        dropdowns.forEach(dropdown => {
          const toggle = dropdown.querySelector('.color-dropdown-toggle');
          const options = dropdown.querySelector('.color-dropdown-options');
          const items = dropdown.querySelectorAll('.color-dropdown-option');
          const hiddenInput = dropdown.querySelector('input[name^="properties"]');
          const selectedLabel = dropdown.querySelector('.color-dropdown-selected');
          const swatchPreview = dropdown.querySelector('.color-swatch-preview');
      
          toggle.addEventListener('click', () => {
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!isOpen));
            dropdown.setAttribute('aria-expanded', String(!isOpen));
          });
      
          items.forEach(item => {
            item.addEventListener('click', () => {
              const value = item.dataset.value;
              const swatchColor = item.dataset.color;
              hiddenInput.value = value;
              selectedLabel.textContent = value;
              if (swatchPreview && swatchColor) swatchPreview.style.backgroundColor = swatchColor;
              items.forEach(i => i.setAttribute('aria-selected', 'false'));
              item.setAttribute('aria-selected', 'true');
              toggle.setAttribute('aria-expanded', 'false');
              dropdown.setAttribute('aria-expanded', 'false');
              this.checkValues()
            });
      
            item.addEventListener('keydown', e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
              }
            });
          });
      
          document.addEventListener('click', e => {
            if (!dropdown.contains(e.target)) {
              toggle.setAttribute('aria-expanded', 'false');
              dropdown.setAttribute('aria-expanded', 'false');
            }
          });
        });
        let validateFieldEvent = (field,blurEvent=false)=>{
            
            if (field.classList.contains("error")) {
              if (this.isValidField(field)) {
                console.error(field.name,this.isValidField(field))
                field.classList.remove("error")   
              } else {
                    
              }  
            } else if (blurEvent) {
              if (this.isValidField(field)) {
                field.classList.remove("error")   
              } else {
                  field.classList.add("error")   
              }  
            }
            
        }
        document.querySelectorAll(".supplemental-form-input[required]").forEach(field=>field.addEventListener("blur",event=>{
          validateFieldEvent(field,true)
        }))
        document.querySelectorAll(".supplemental-form-input[required]").forEach(field=>field.addEventListener("keydown",event=>{
          
          validateFieldEvent(field,false)
        }))
  
        /* set default selections */
        
      
        // SHIPPING TYPE SELECTOR (Only handles showing download link)
        const shippingInputs = document.querySelectorAll('input[data-shipping-type]');
        const multiNote = document.getElementById('multi-shipping-note');
      
        if (!shippingInputs.length || !multiNote) {
          
        } else {
          shippingInputs.forEach(input => {
            input.addEventListener('change', () => {
              this.checkValues();
              const isMulti = input.checked && input.value === 'Multiple Addresses';
              console.log('Shipping type changed:', input.value, '→ show file?', isMulti);
              multiNote.style.display = isMulti ? 'block' : 'none';
            });
          });
        }
        this.submitButton.addEventListener("click",event=>this.finalize())
  
      
    }
    finalize() {
      let properties = this.buildProperties();
  
      if ( properties._shipping_type=="multiple") {
        this.processMulti();
        return;
      }
      this.submitButton.disabled = true;
      this.submitButton.classList.remove("inactive")
      this.submitButton.classList.add("processing");
  
      let hasUploads = false;
      
      let uploads = this.collectUploads(properties,this.uploadFields())
      if (uploads.length>0) {
        this.uploadFiles(uploads).then(uploads=>{
          if (uploads.error) {
            CnRModal.show("An error has occurred uploading files. Please try again in a little while.")
            this.submitButton.classList.remove("inactive")
            this.submitButton.classList.remove("processing")
            this.submitButton.disabled = false;
            return;
          }
          Object.keys(uploads.urls).forEach(uploaded=>{
            properties._gifting[uploaded] = uploads.urls[uploaded].id;
            this.uploadCache[uploaded] = uploads.urls[uploaded].id;
          })
          this.postUpload(properties);
        })
      } else {
        this.postUpload(properties);
      }
    }
    
    postUpload(properties) {
      console.error(properties)
      if ( properties._gifting.shipping_type=="single") {
        this.processCart(properties);
      } else {
        this.processMulti(properties)
      }
    }
    isValidField(field) {
      if (field.dataset.regex) {
        let re = new RegExp(field.dataset.regex);
        if (field.value.match(re) && field.value!="") {
          return true
        } else {
          return false;
        }
      } else {
        switch (field.tagName) {
          case "INPUT":
            if (field.value!="") {
              return true;
            }
            break;
          case "SELECT":
            if (field.options[field.selectIndex].value!="") {
              return true;
            }
            
        }
      }
      return false;
    }
    processMulti(properties) {
      
      let proceed = true;
      let payload = properties._gifting;
      payload.quantity = this.quantity()
      payload.productId = this.config.productId;
      Object.entries(this.uploadCache).forEach(kvp=>payload[kvp[0]]=kvp[1])
      
      document.querySelectorAll(".supplemental-form-input").forEach(field=>{
        if (!field.hasAttribute("required") && field.value!="") {
          payload[field.name]  = field.value
        }
        if (!this.isValidField(field)) {
          field.classList.add("error")
          proceed = false;
        } else {
          field.classList.remove("error")
          payload[field.name]  = field.value
        }
      })
      console.error(JSON.stringify(payload,null,1))
      if (proceed) {
        fetch(`${this.config.appUrl}/gifting/create`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        ).then(response=>response.json()).then(result=>{
          console.error(result)
          CnRModal.show(`<h1>Finished!</h1>Now is the part where we're redirected to a page or something idk I just work here`)  
        })
        
      } else {
        this.submitButton.disabled=false;
        this.submitButton.classList.remove("processing")  
      }
      
      
    }
    quantity() {
      return parseInt(document.querySelector(".quantity__input").value)
    }
    processCart(properties) {
      
      
      this.addToCart(
        {
          items:[
            {
              id:parseInt(this.config.productId),
              quantity:this.quantity(),
              properties:properties
            }
          ],
          
        }
      ).then(cart=>{
        console.error(cart)
      })
    }
    
  }
  
  