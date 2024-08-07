const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const siretRegex = /^[0-9]{14}$/;
const sirenRegex = /^[0-9]{9}$/;
const acceptedCharsRegex =
  /^([AÀÂBCÇDEÉÈÊËFGHIÎÏJKLMNOÔPQRSTUÙÛÜVWXYŸZÆŒ\- ']+)$/i;
const spaceFollowingDashRegex = /( -)|(- )/i;
const doubleSpacesRegex = / {2}/i;
const tripleDashRegex = /-{3}/i;
const doubleDashRegex = /-{2}/i;
const pwdRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[<>{}"/\\|;:.,~!?@#$%^=&*\]()[¿§«»ω⊙¤°℃℉€¥£¢¡®©_+-])(?=.{12,})/;
const pwdRegexSpecial =
  /^(?=.*[<>{}"/\\|;:.,~!?@#$%^=&*\]()[¿§«»ω⊙¤°℃℉€¥£¢¡®©_+-])/;
const pwdRegexNumber = /^(?=.*[0-9])/;
const pwdRegexMaj = /^(?=.*[A-Z])/;
const pwdRegexMin = /^(?=.*[a-z])/;

export {
  acceptedCharsRegex,
  doubleDashRegex,
  doubleSpacesRegex,
  emailRegex,
  numTelephoneRegex,
  pwdRegex,
  pwdRegexMaj,
  pwdRegexMin,
  pwdRegexNumber,
  pwdRegexSpecial,
  sirenRegex,
  siretRegex,
  spaceFollowingDashRegex,
  tripleDashRegex,
};
