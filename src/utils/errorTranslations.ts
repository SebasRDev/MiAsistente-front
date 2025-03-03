const authErrorMessages: Record<string, string> = {
  // Sign In errors
  invalid_credentials: 'Correo electrónico o contraseña inválidos',
  email_not_confirmed: 'Correo electrónico no confirmado',

  // Sign Up errors
  email_exists: 'Correo electrónico ya existe',
  signup_disabled: 'Registro deshabilitado',
  weak_password: 'La contraseña es muy débil',

  // Update Email errors
  same_password: 'La contraseña no puede ser la misma',

  // Generic errors
  'Server error. Try again later.': 'Error del servidor. Intenta más tarde.',
  'Request failed': 'La solicitud falló',
  'Network error': 'Error de conexión',

  // Add more error translations as needed
};

export function translateAuthError(errorCode: string): string {
  return authErrorMessages[errorCode] || `Error: ${errorCode}`;
}
