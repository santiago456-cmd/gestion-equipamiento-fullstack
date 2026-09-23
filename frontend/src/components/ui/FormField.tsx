// components/ui/FormField.tsx
import { forwardRef } from 'react';
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';
import styles from './FormField.module.css';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'date'
  | 'number'
  | 'tel'
  | 'url'
  | 'select'
  | 'textarea';

type FormFieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface BaseProps {
  id?: string;
  label?: string;
  required?: boolean;
  /** Material Symbol name */
  icon?: string;
  /** Error message (activates error state) */
  error?: string;
  type?: FormFieldType;
  /** For textarea */
  rows?: number;
  placeholder?: string;
  /** <option> elements for select */
  children?: ReactNode;
  name?: string;
}

// Resto de atributos nativos (onChange, onBlur, value, defaultValue, etc.)
// que se spreadean sobre el input/select/textarea subyacente.
type NativeRestProps = Omit<
  InputHTMLAttributes<HTMLInputElement> &
    SelectHTMLAttributes<HTMLSelectElement> &
    TextareaHTMLAttributes<HTMLTextAreaElement>,
  keyof BaseProps
>;

export type FormFieldProps = BaseProps & NativeRestProps;

const FormField = forwardRef<FormFieldElement, FormFieldProps>(function FormField(
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
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={inputClass}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }
    if (type === 'select') {
      return (
        <select
          id={fieldId}
          name={name ?? fieldId}
          ref={ref as React.Ref<HTMLSelectElement>}
          className={inputClass}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
          {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
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
        ref={ref as React.Ref<HTMLInputElement>}
        className={inputClass}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${fieldId}-error` : undefined}
        {...(rest as InputHTMLAttributes<HTMLInputElement>)}
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