import dayjs from "dayjs";
import { eigModel } from "@vao/shared-ui";
import { DeclarationSejour, useUserStore } from "#imports";
import { ROLES as userRolesRef } from "../helpers/users";

const isDeclarationligibleToEig = (d) =>
  dayjs(d.dateDebut).format("YYYY-MM-DD") <= dayjs().format("YYYY-MM-DD") &&
  dayjs(d.dateFin).add(1, "week").format("YYYY-MM-DD") >=
    dayjs().format("YYYY-MM-DD") &&
  [
    DeclarationSejour.statuts.VALIDEE_8J,
    DeclarationSejour.statuts.SEJOUR_EN_COURS,
    DeclarationSejour.statuts.TERMINEE,
  ].includes(d.statut);

const canDelete = (statut) => eigModel.Statuts.BROUILLON === statut;

const getEigPermissions = () => {
  const userStore = useUserStore();
  const allowEigReadWrite = userStore.user?.roles?.includes(
    userRolesRef.EIG_ECRITURE,
  );
  const allowEigReadOnly = userStore.user?.roles?.includes(
    userRolesRef.EIG_LECTURE,
  );
  return { allowEigReadWrite, allowEigReadOnly };
};

export { isDeclarationligibleToEig, canDelete, getEigPermissions };
