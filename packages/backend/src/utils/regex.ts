export const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;
export const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
export const siretRegex = /^[0-9]{14}$/;
export const sirenRegex = /^[0-9]{9}$/;
export const acceptedCharsRegex =
  /^([AÀÂBCÇDEÉÈÊËFGHIÎÏJKLMNOÔPQRSTUÙÛÜVWXYŸZÆŒ\- ']+)$/i;
export const spaceFollowingDashRegex = /( -)|(- )/i;
export const doubleSpacesRegex = / {2}/i;
export const tripleDashRegex = /-{3}/i;
export const doubleDashRegex = /-{2}/i;
export const pwdRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[<>{}"/\\|;:.,~!?@#$%^=&*\]()[¿§«»ω⊙¤°℃℉€¥£¢¡®©_+-])(?=.{12,})/;
export const pwdRegexSpecial =
  /^(?=.*[<>{}"/\\|;:.,~!?@#$%^=&*\]()[¿§«»ω⊙¤°℃℉€¥£¢¡®©_+-])/;
export const pwdRegexNumber = /^(?=.*[0-9])/;
export const pwdRegexMaj = /^(?=.*[A-Z])/;
export const pwdRegexMin = /^(?=.*[a-z])/;
