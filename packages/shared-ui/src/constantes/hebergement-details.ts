import { InputTypes } from "./input-types";

export const HebergementDetailsSections = {
  localisation: "Précisions de l'emplacement",
  capaciteAccueil: "Capacité d'accueil total communiqué par l'hébergeur",
};

export const HebergementDetailsInput = {
  complementLocalisation: {
    inputType: InputTypes.TEXT,
    label: "Complément de localisation (optionnel)",
    hint: "Exemples : Bâtiment A, Chalet des libellules, 1er et 2e étage, Porte A, Maison individuelle, autres",
  },
  nombreCouchagesTotal: {
    inputType: InputTypes.NUMBER,
    label: "Nombre de couchages total",
    hint: "Il s'agit du nombre maximum de personnes pouvant coucher dans l'hébergement. Exemple : 20",
  },
  nombreChambresTotal: {
    inputType: InputTypes.NUMBER,
    label: "Nombre de chambres total",
    hint: "Il s'agit du nombre de chambres présente dans l'hébergement. Exemple : 8",
  },
};

export const HebergementDetailsDisplayInput = {
  InputTypes,
  HebergementDetailsInput,
  HebergementDetailsSections,
};
