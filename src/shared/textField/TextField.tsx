

export interface TextFieldProps {
  label: string
  disabled: boolean
  type: 'text' | 'number'
}

export const TextField = ({ label, disabled, type }: TextFieldProps) => (
  <div>
    <label htmlFor="">{label}</label><br />
    <input disabled={disabled} type={type} />
  </div>
);
