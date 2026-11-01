import type { ComponentProps } from 'react';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

import { TextField } from '@/shared/ui';

type FormTextFieldProps<T extends FieldValues> = Omit<
  ComponentProps<typeof TextField>,
  'value' | 'onChangeText' | 'onBlur' | 'error' | 'ref'
> & {
  control: Control<T>;
  name: Path<T>;
};

/** `TextField` conectado a React Hook Form: valor, error y `ref` (para `setFocus`). */
export function FormTextField<T extends FieldValues>({
  control,
  name,
  ...props
}: FormTextFieldProps<T>) {
  // Se desestructura: el linter del React Compiler trata `field` como ref por tener `field.ref`.
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name });
  return (
    <TextField
      ref={ref}
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      error={error?.message}
      {...props}
    />
  );
}
