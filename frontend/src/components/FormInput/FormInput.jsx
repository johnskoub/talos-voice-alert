import './FormInput.css';

function FormInput({
  id,
  label,
  name,
  type = 'text',
  placeholder,
  value,
  error,
  onChange,
}) {
  const errorId = `${id}-error`;

  return (
    <div className="form-input-group">
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />

      {error && (
        <p id={errorId} className="form-input-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormInput;