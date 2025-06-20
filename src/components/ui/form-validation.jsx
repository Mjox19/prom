import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Validation rules
export const validationRules = {
  required: (value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0 || "This field is required";
    }
    return value !== null && value !== undefined && value !== '' || "This field is required";
  },
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !value || emailRegex.test(value) || "Please enter a valid email address";
  },
  
  minLength: (min) => (value) => {
    return !value || value.length >= min || `Must be at least ${min} characters`;
  },
  
  maxLength: (max) => (value) => {
    return !value || value.length <= max || `Must be no more than ${max} characters`;
  },
  
  number: (value) => {
    return !value || !isNaN(Number(value)) || "Must be a valid number";
  },
  
  positiveNumber: (value) => {
    return !value || (Number(value) >= 0) || "Must be a positive number";
  },
  
  phone: (value) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return !value || phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) || "Please enter a valid phone number";
  }
};

// Form field with validation
export const ValidatedInput = React.forwardRef(({
  label,
  error,
  success,
  required = false,
  className,
  children,
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className={cn("text-sm font-medium leading-none", required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </label>
      )}
      <div className="relative">
        {children}
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
        {success && !error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

ValidatedInput.displayName = "ValidatedInput";

// Hook for form validation
export const useFormValidation = (initialValues, rules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const fieldRules = rules[name];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const result = rule(value);
      if (result !== true) {
        return result;
      }
    }
    return null;
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  };

  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const setTouched = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const isValid = Object.keys(errors).length === 0 && Object.keys(touched).length > 0;

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validateAll,
    reset,
    isValid
  };
};