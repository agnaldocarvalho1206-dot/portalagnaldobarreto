export const PASSWORD_MIN_LENGTH=12;
const PASSWORD_SYMBOLS="!@#$%^&*()_+-=[]{};'\\:\"|<>?,./`~";

export function newPasswordError(password:string){
  if(password.length<PASSWORD_MIN_LENGTH)return 'Use uma senha com pelo menos 12 caracteres.';
  if(!/[a-z]/.test(password))return 'Inclua pelo menos uma letra minúscula.';
  if(!/[A-Z]/.test(password))return 'Inclua pelo menos uma letra maiúscula.';
  if(!/[0-9]/.test(password))return 'Inclua pelo menos um número.';
  if(![...password].some(char=>PASSWORD_SYMBOLS.includes(char)))return 'Inclua pelo menos um símbolo.';
  return '';
}
