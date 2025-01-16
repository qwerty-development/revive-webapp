// lib/form-validation.ts
export type ValidationRule = {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    validate?: (value: any) => boolean | string
  }
  
  export type ValidationRules = {
    [key: string]: ValidationRule
  }
  
  export type ValidationErrors = {
    [key: string]: string
  }
  
  export const validateForm = (values: any, rules: ValidationRules): ValidationErrors => {
    const errors: ValidationErrors = {}
  
    Object.entries(rules).forEach(([field, rule]) => {
      const value = values[field]
  
      if (rule.required && !value) {
        errors[field] = 'This field is required'
      }
  
      if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = `Minimum ${rule.minLength} characters required`
      }
  
      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `Maximum ${rule.maxLength} characters allowed`
      }
  
      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors[field] = 'Invalid format'
      }
  
      if (value && rule.validate) {
        const result = rule.validate(value)
        if (typeof result === 'string') {
          errors[field] = result
        } else if (!result) {
          errors[field] = 'Invalid value'
        }
      }
    })
  
    return errors
  }