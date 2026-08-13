// components/ui/FormField.jsx
import { forwardRef } from 'react';
import styles from './FormField.module.css';

/**
 * FormField — labeled form control with optional icon and error state.
 * Forwards ref so it can be used directly with react-hook-form's `register()`:
 *   <FormField label="Email" {...register('email')} error={errors.email?.message} />
 *
 * Props:
 *   id          {string}
 *   label       {string}
 *   required    {boolean}
 *   icon        {string}    — Material Symbol name
 *   error       {string}    — error message (activates error state)
 *   type        {string}    — 'text'|'email'|'password'|'date'|'select'|'textarea'
 *   rows        {number}    — for textarea
 *   placeholder {string}
 *   children    {ReactNode} — <option> elements for select
 *   ...rest     — spread onto the underlying input/select/textarea (name, onChange, onBlur, value, etc.)
 */
const FormField = forwardRef(function FormField(
  {
    id,
    label,
    required = false,
    icon,
    error,
    type = 'text',
    rows = 4,
    placeholder,
    children,
    name,
    ...rest
  },
  ref,
) {
  const fieldId = id ?? name;
  const hasError = Boolean(error);

  const inputClass = [
    type === 'select' ? styles.select : type === 'textarea' ? styles.textarea : styles.input,
    icon ? styles.inputWithIcon : '',
    hasError ? styles.inputError : '',
  ].filter(Boolean).join(' ');

  const renderControl = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={fieldId}
          name={name ?? fieldId}
          ref={ref}
          className={inputClass}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
          {...rest}
        />
      );
    }
    if (type === 'select') {
      return (
        <select
          id={fieldId}
          name={name ?? fieldId}
          ref={ref}
          className={inputClass}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
          {...rest}
        >
          {children}
        </select>
      );
    }
    return (
      <input
        id={fieldId}
        name={name ?? fieldId}
        type={type}
        ref={ref}
        className={inputClass}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${fieldId}-error` : undefined}
        {...rest}
      />
    );
  };

  return (
    <div className={styles.field}>
      {label && (
        <div className={styles.labelRow}>
          <label className={styles.label} htmlFor={fieldId}>
            {label}
          </label>
          {required && <span className={styles.required}>Requerido</span>}
        </div>
      )}

      <div className={styles.inputWrapper}>
        {icon && (
          <span className={`material-symbols-outlined ${styles.inputIcon}`}>
            {icon}
          </span>
        )}
        {renderControl()}
      </div>

      {hasError && (
        <p className={styles.errorMessage} id={`${fieldId}-error`} role="alert">
          <span className={`material-symbols-outlined ${styles.errorIcon}`}>error</span>
          {error}
        </p>
      )}
    </div>
  );
});

export default FormField;
