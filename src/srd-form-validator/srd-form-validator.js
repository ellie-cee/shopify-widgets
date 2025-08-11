class SrDExtraFormValidation {
    constructor(options) {
        this.options = options;
        this.form = document.querySelector(this.options.form)
        this.form.addEventListener("submit",event=>{
            this.formData = new FormData(this.form)
            if (!this.validateForm()) {
                event.preventDefault()
                event.stopPropagation();
            }
        })
        this.form.querySelectorAll("[data-validate]").forEach(field=>{
          field.addEventListener("change",event=>{
            this.formData = new FormData(this.form)
            this.validateForm()
          })
        });
        this.formData = new FormData(this.form)
        this.form.querySelectorAll("[data-is-referenced]").forEach(field=>{
          this.formData = new FormData(this.form)
          field.addEventListener("change",event=>this.validateForm())
        })
    }
    
    annotateField(field,text) {
        if (!field.parentNode.querySelector(".error-notification")) {
          let errorDiv = document.createElement("DIV");
          errorDiv.classList.add("error-notification")
          errorDiv.textContent = text
          field.parentNode.appendChild(errorDiv)  
        }
    }
    removeAnnotation(field) {
      if (field.parentNode.querySelector(".error-notification")) {
        field.parentNode.removeChild(
          field.parentNode.querySelector(".error-notification")
        )
      }
    }
    fieldValue(field) {
      let value = field.value;
      if (field.tagname=="SELECT") {
        value = field.options[field.selectedIndex].value;
      }
      return value
    }
    validateField(field) {
        let references = this.form.querySelector(`#${field.dataset.references}`)
        let errorLabel = field.dataset.errorLabel||"Required"
        let isValid = true;
        let fieldValue = this.fieldValue(field)
        switch(field.dataset.validate) {
            case "is-checked":
               
                if (references.checked) {
                  
                 
                  if (fieldValue.length<1) {
                    
                    errorLabel = `This field is required to ${references.dataset.referenceText}`
                    isValid = false
                  }
                    
                }
                break;
            default:
                if (!fieldValue.length<1 ) {
                    isValid = false
                }
        }
        if (isValid) {
            this.removeAnnotation(field)
        } else {
            this.annotateField(field,errorLabel)
        }
        return isValid
    }
    validateForm() {
        let retVal = true;
        let formData = new FormData(this.form)
        
        this.form.querySelectorAll("[data-validate]").forEach(field=>{
          
            let isValid = this.validateField(field);
            if (!isValid) {
                retVal = false
            }
        })
        return retVal
    }
}
