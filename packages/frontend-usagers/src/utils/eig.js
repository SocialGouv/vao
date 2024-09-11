import dayjs from "dayjs";
import { eigModel } from "@vao/shared";
import { DeclarationSejour } from "#imports";

const isDeclarationligibleToEig = (d) =>
  d.dateDebut <= dayjs().format("YYYY-MM-DD") &&
  dayjs(d.dateFin).add(1, "week").format("YYYY-MM-DD") >=
    dayjs().format("YYYY-MM-DD") &&
  [
    DeclarationSejour.statuts.VALIDEE_8J,
    DeclarationSejour.statuts.SEJOUR_EN_COURS,
    DeclarationSejour.statuts.TERMINEE,
  ].includes(d.statut);

const canDelete = (statut) => eigModel.Statuts.BROUILLON === statut;
export default {
  isDeclarationligibleToEig,
  canDelete,
};
