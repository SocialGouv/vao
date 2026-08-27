import type { OrganismeDto } from "@vao/shared-bridge";

export function isOrganismePorteurAgrement(
  organisme: OrganismeDto | null | undefined,
): boolean {
  return (
    organisme?.typeOrganisme === "personne_physique" ||
    organisme?.personneMorale?.porteurAgrement === true
  );
}
