const status = {
  BLOCKED: "BLOCKED",
  NEED_EMAIL_VALIDATION: "NEED_EMAIL_VALIDATION",
  NEED_SIRET_VALIDATION: "NEED_SIRET_VALIDATION",
  VALIDATED: "VALIDATED",
};

const label = [
  {
    value: "",
    text: "Tous",
  },
  {
    value: status.VALIDATED,
    text: "Validé",
  },
  {
    value: status.NEED_EMAIL_VALIDATION,
    text: "En attente confirmation de email",
  },
  {
    value: status.NEED_SIRET_VALIDATION,
    text: "En attente validation compte",
  },
  {
    value: status.BLOCKED,
    text: "Désactivé",
  },
];

export default {
  status,
  label,
};
