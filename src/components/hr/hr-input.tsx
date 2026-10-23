import React from 'react';

export interface HrFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function HrField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className = '',
}: HrFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-semibold text-[var(--hr-text)] flex items-center gap-1 select-none"
        >
          <span>{label}</span>
          {required && <span className="text-[var(--hr-status-error)]">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-[var(--hr-status-error)] font-medium mt-0.5 leading-tight">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-[var(--hr-text-muted)] mt-0.5 leading-tight">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface HrInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const HrInput = React.forwardRef<HTMLInputElement, HrInputProps>(
  ({ className = '', error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-[var(--hr-text-muted)]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={`w-full h-[44px] sm:h-[38px] px-3 ${leftIcon ? 'pl-9' : ''} ${
            rightIcon ? 'pr-9' : ''
          } bg-[var(--hr-surface)] border ${
            error
              ? 'border-[var(--hr-status-error)] focus:border-[var(--hr-status-error)]'
              : 'border-[var(--hr-border)] hover:border-[var(--hr-text-muted)] focus:border-[var(--hr-primary)]'
          } rounded-[var(--hr-radius)] text-sm text-[var(--hr-text)] placeholder-[var(--hr-text-light)] transition-colors focus:outline-none focus:ring-1 ${
            error ? 'focus:ring-[var(--hr-status-error)]' : 'focus:ring-[var(--hr-primary)]'
          } disabled:bg-[var(--hr-surface-muted)] disabled:text-[var(--hr-text-muted)] disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 flex items-center text-[var(--hr-text-muted)]">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
HrInput.displayName = 'HrInput';

export interface HrSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options?: { value: string | number; label: string; disabled?: boolean }[];
}

export const HrSelect = React.forwardRef<HTMLSelectElement, HrSelectProps>(
  ({ className = '', error, options, children, disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full h-[44px] sm:h-[38px] px-3 pr-8 bg-[var(--hr-surface)] border ${
            error
              ? 'border-[var(--hr-status-error)] focus:border-[var(--hr-status-error)]'
              : 'border-[var(--hr-border)] hover:border-[var(--hr-text-muted)] focus:border-[var(--hr-primary)]'
          } rounded-[var(--hr-radius)] text-sm text-[var(--hr-text)] transition-colors focus:outline-none focus:ring-1 ${
            error ? 'focus:ring-[var(--hr-status-error)]' : 'focus:ring-[var(--hr-primary)]'
          } disabled:bg-[var(--hr-surface-muted)] disabled:text-[var(--hr-text-muted)] disabled:cursor-not-allowed appearance-none ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3 pointer-events-none text-[var(--hr-text-muted)]">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  }
);
HrSelect.displayName = 'HrSelect';

export interface HrTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const HrTextarea = React.forwardRef<HTMLTextAreaElement, HrTextareaProps>(
  ({ className = '', error, disabled, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={`w-full p-3 bg-[var(--hr-surface)] border ${
          error
            ? 'border-[var(--hr-status-error)] focus:border-[var(--hr-status-error)]'
            : 'border-[var(--hr-border)] hover:border-[var(--hr-text-muted)] focus:border-[var(--hr-primary)]'
        } rounded-[var(--hr-radius)] text-sm text-[var(--hr-text)] placeholder-[var(--hr-text-light)] transition-colors focus:outline-none focus:ring-1 ${
          error ? 'focus:ring-[var(--hr-status-error)]' : 'focus:ring-[var(--hr-primary)]'
        } disabled:bg-[var(--hr-surface-muted)] disabled:text-[var(--hr-text-muted)] disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);
HrTextarea.displayName = 'HrTextarea';

export interface HrCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const HrCheckbox = React.forwardRef<HTMLInputElement, HrCheckboxProps>(
  ({ label, hint, className = '', id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`flex items-start gap-2.5 min-h-[44px] sm:min-h-[auto] py-1 ${className}`}>
        <div className="flex items-center h-5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className="w-4 h-4 rounded-[var(--hr-radius-sm)] border-[var(--hr-border)] text-[var(--hr-primary)] focus:ring-[var(--hr-primary)] focus:ring-offset-0 disabled:cursor-not-allowed cursor-pointer"
            {...props}
          />
        </div>
        {label && (
          <label htmlFor={inputId} className="cursor-pointer select-none text-xs flex flex-col">
            <span className="font-medium text-[var(--hr-text)]">{label}</span>
            {hint && <span className="text-[var(--hr-text-muted)] mt-0.5">{hint}</span>}
          </label>
        )}
      </div>
    );
  }
);
HrCheckbox.displayName = 'HrCheckbox';

export function HrFormSection({
  title,
  description,
  children,
  actions,
  className = '',
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-[var(--hr-border-subtle)] gap-2">
        <div>
          <h3 className="text-sm font-bold text-[var(--hr-text)] tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-[var(--hr-text-muted)] mt-0.5">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
