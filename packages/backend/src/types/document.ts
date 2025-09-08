import type { DroitDomain } from "../helpers/droits";

export interface DocumentCategoryDef {
  droit: DroitDomain;
  // eslint-disable-next-line no-unused-vars
  resolveResourceId: (uuid: string) => Promise<number | null>;
}
