class SrDFileUpload extends CnR {
    constructor(options) {
      super(options)
      this.uuid = crypto.randomUUID()
      this.uploadCache = {}
    }
    root() {
      return document.querySelector(this.config.optionsRoot)
    }
    buildProperties() {
      let shippingOptionType = document.querySelector("input[data-shipping-type]:checked");
      let properties = {}
     
      Object.entries(this.uploadCache).forEach(kvp=>properties[kvp[0]]=kvp[1])
      return properties
      
    }
    
    setupEvents() {
  
    }
    hasUploads(type) {
       let fileInput = this.fileField(type);
        if (!fileInput) {
          return false;
        }
        return fileInput.files.length>0;
    }
    fileField(type) {
      return document.querySelector(`[name="${type}"]`)
    }
    uploadPath() {
        return 'upload'
    }
    uploadFiles(types) {
      let uploadForm = new FormData();
      uploadForm.append("uuid",this.uuid)
      let uploadCount = 0;
      types.forEach(type=>{
        let uploadField = this.fileField(type);
        if (uploadField && uploadField.files.length>0) {
            uploadForm.append(type,uploadField.files[0]);
            uploadCount++;
        }
      })
      return fetch(
        `${this.config.appUrl}/${this.uploadPath()}`,
        {
          method:"POST",
          body:uploadForm,
        }
      ).then(response=>response.json())
    }
    collectUploads(properties,uploadFields) {
      let uploads = []
      uploadFields.forEach(uploadType=>{
          
          if (this.hasUploads(uploadType)) {        
            if (!this.uploadCache[uploadType]) {
              uploads.push(uploadType);
            } else {
              console.error(`skipping upload ${uploadType}: ${properties._gifting[uploadType]}`)
            }
          }
      });
      
      return uploads;
    }
    uploadFields() {
        return []
    }
    finalize() {
      let properties = this.buildProperties();
      
      let uploads = this.collectUploads(properties,this.uploadFields())
      if (uploads.length>0) {
        this.uploadFiles(uploads).then(uploads=>{
          this.postUpload(properties);
        })
      } else {
        this.postUpload(properties);
      }
    }
    
    postUpload(properties) {
    } 
  }