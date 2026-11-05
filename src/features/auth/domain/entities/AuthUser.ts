// Usuario autenticado: lo que devuelven registro y login. La contraseña nunca forma parte de él.

export type UserProfile = {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  state: string;
  city: string | null;
};

/** Datos del formulario de registro (ya validados por la UI). */
export type RegisterInput = UserProfile & { password: string };

export type LoginInput = { email: string; password: string };
