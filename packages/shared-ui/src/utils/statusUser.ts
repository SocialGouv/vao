import { STATUS_USER_FRONT } from "@vao/shared-bridge";

const label = [
  {
    value: "",
    text: "Tous",
  },
  {
    value: STATUS_USER_FRONT.VALIDATED,
    text: "Validé",
  },
  {
    value: STATUS_USER_FRONT.NEED_EMAIL_VALIDATION,
    text: "En attente confirmation de email",
  },
  {
    value: STATUS_USER_FRONT.NEED_SIRET_VALIDATION,
    text: "En attente validation compte",
  },
  {
    value: STATUS_USER_FRONT.BLOCKED,
    text: "Désactivé",
  },
];

export default {
  status: STATUS_USER_FRONT,
  label,
};
