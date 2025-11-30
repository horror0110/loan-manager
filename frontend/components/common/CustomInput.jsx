import React, { useState, forwardRef } from 'react'
import { Eye, EyeOff, Search, X, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Input Component
export const Input = forwardRef(({
  type = "text",
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  className,
  label,
  error,
  success,
  helperText,
  leftIcon,
  rightIcon,
  clearable = false,
  showPasswordToggle = false,
  loading = false,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  autoFocus = false,
  size = "md", // sm, md, lg
  variant = "default", // default, filled, borderless
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputType = type === "password" && showPassword ? "text" : type

  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: "" } })
    }
  }

  const handleFocus = (e) => {
    setIsFocused(true)
    if (onFocus) onFocus(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    if (onBlur) onBlur(e)
  }

  // Size variants
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-3 py-2 text-sm", 
    lg: "px-4 py-3 text-base"
  }

  // Variant styles
  const variantClasses = {
    default: cn(
      "border bg-white",
      error ? "border-red-500 focus:border-red-500 focus:ring-red-500" :
      success ? "border-green-500 focus:border-green-500 focus:ring-green-500" :
      "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      "focus:ring-2 focus:ring-opacity-20"
    ),
    filled: cn(
      "border-0 bg-gray-100",
      error ? "bg-red-50 focus:bg-red-50" :
      success ? "bg-green-50 focus:bg-green-50" :
      "focus:bg-blue-50",
      "focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
    ),
    borderless: cn(
      "border-0 bg-transparent border-b-2",
      error ? "border-b-red-500 focus:border-b-red-500" :
      success ? "border-b-green-500 focus:border-b-green-500" :
      "border-b-gray-300 focus:border-b-blue-500"
    )
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Label */}
      {label && (
        <label className={cn(
          "block text-sm font-medium mb-1",
          error ? "text-red-700" : success ? "text-green-700" : "text-gray-700"
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {React.cloneElement(leftIcon, {
              className: cn("w-4 h-4", 
                error ? "text-red-400" : 
                success ? "text-green-400" : 
                isFocused ? "text-blue-400" : "text-gray-400"
              )
            })}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={cn(
            "w-full rounded-md transition-colors duration-200",
            "focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "placeholder:text-gray-400",
            sizeClasses[size],
            variantClasses[variant],
            leftIcon && "pl-10",
            (rightIcon || clearable || showPasswordToggle || loading || error || success) && "pr-10"
          )}
          {...props}
        />

        {/* Right Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Loading */}
          {loading && (
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full" />
          )}

          {/* Clear Button */}
          {clearable && value && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Password Toggle */}
          {type === "password" && showPasswordToggle && !loading && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Status Icons */}
          {!loading && error && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          {!loading && success && !error && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}

          {/* Right Icon */}
          {rightIcon && !loading && !clearable && !showPasswordToggle && !error && !success && (
            React.cloneElement(rightIcon, {
              className: cn("w-4 h-4", 
                isFocused ? "text-blue-400" : "text-gray-400"
              )
            })
          )}
        </div>
      </div>

      {/* Helper Text / Error Message */}
      {(helperText || error) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className={cn("text-sm", success ? "text-green-600" : "text-gray-500")}>
              {helperText}
            </p>
          )}
        </div>
      )}

      {/* Character Count */}
      {maxLength && (
        <div className="mt-1 text-right">
          <span className={cn(
            "text-xs",
            value?.length > maxLength * 0.9 ? "text-orange-500" :
            value?.length === maxLength ? "text-red-500" : "text-gray-400"
          )}>
            {value?.length || 0} / {maxLength}
          </span>
        </div>
      )}
    </div>
  )
})

Input.displayName = "Input"

// Textarea Component
export const Textarea = forwardRef(({
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  className,
  label,
  error,
  success,
  helperText,
  maxLength,
  minLength,
  rows = 4,
  resize = "vertical", // none, vertical, horizontal, both
  autoResize = false,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = (e) => {
    setIsFocused(true)
    if (onFocus) onFocus(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    if (onBlur) onBlur(e)
  }

  const handleChange = (e) => {
    if (onChange) onChange(e)
    
    // Auto resize
    if (autoResize && e.target) {
      e.target.style.height = 'auto'
      e.target.style.height = e.target.scrollHeight + 'px'
    }
  }

  const resizeClasses = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x", 
    both: "resize"
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Label */}
      {label && (
        <label className={cn(
          "block text-sm font-medium mb-1",
          error ? "text-red-700" : success ? "text-green-700" : "text-gray-700"
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        rows={rows}
        className={cn(
          "w-full px-3 py-2 border rounded-md text-sm transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-opacity-20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "placeholder:text-gray-400",
          resizeClasses[resize],
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" :
          success ? "border-green-500 focus:border-green-500 focus:ring-green-500" :
          "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        )}
        {...props}
      />

      {/* Helper Text / Error Message */}
      {(helperText || error) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className={cn("text-sm", success ? "text-green-600" : "text-gray-500")}>
              {helperText}
            </p>
          )}
        </div>
      )}

      {/* Character Count */}
      {maxLength && (
        <div className="mt-1 text-right">
          <span className={cn(
            "text-xs",
            value?.length > maxLength * 0.9 ? "text-orange-500" :
            value?.length === maxLength ? "text-red-500" : "text-gray-400"
          )}>
            {value?.length || 0} / {maxLength}
          </span>
        </div>
      )}
    </div>
  )
})

Textarea.displayName = "Textarea"

// SearchInput Component  
export const SearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder = "Хайх...",
  disabled = false,
  className,
  loading = false,
  clearable = true,
  debounceMs = 300,
  ...props
}) => {
  const [debounceTimer, setDebounceTimer] = useState(null)

  const handleChange = (e) => {
    const newValue = e.target.value
    onChange(e)

    // Debounced search
    if (onSearch && debounceMs > 0) {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      
      const timer = setTimeout(() => {
        onSearch(newValue)
      }, debounceMs)
      
      setDebounceTimer(timer)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(value)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        leftIcon={<Search />}
        clearable={clearable}
        loading={loading}
        {...props}
      />
    </form>
  )
}