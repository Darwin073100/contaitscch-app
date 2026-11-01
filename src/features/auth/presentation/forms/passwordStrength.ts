import { MIN_PASSWORD } from './registerFormSchema';

export type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong';

// Solo orienta al usuario; la única regla obligatoria es el mínimo de caracteres.
const charClasses = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return 'empty';
  if (password.length < MIN_PASSWORD) return 'weak';
  const variety = charClasses.filter((re) => re.test(password)).length;
  if (password.length >= 10 && variety >= 3) return 'strong';
  return variety >= 2 ? 'medium' : 'weak';
}
