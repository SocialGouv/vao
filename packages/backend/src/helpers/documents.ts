import { FILE_CATEGORY } from "@vao/shared-bridge";

import type { DocumentCategoryDef } from "../types/document";
import {
  resolveAgrementId,
  resolveDemandeSejourId,
  resolveHebergementId,
  resolveMessageDemandeSejourId,
  resolveProtocoleSanitaireAgrementId,
  resolveProtocoleTransportAgrementId,
} from "../utils/documents";
import { DroitsGroup } from "./droits";

const demandeSejourDef: DocumentCategoryDef = {
  droit: DroitsGroup.demande_sejour,
  resolveResourceId: resolveDemandeSejourId,
};

const messageDef: DocumentCategoryDef = {
  droit: DroitsGroup.demande_sejour,
  resolveResourceId: resolveMessageDemandeSejourId,
};

const agrementDef: DocumentCategoryDef = {
  droit: DroitsGroup.agrement,
  resolveResourceId: resolveAgrementId,
};

const hebergementDef: DocumentCategoryDef = {
  droit: DroitsGroup.hebergement,
  resolveResourceId: resolveHebergementId,
};

const protocoleSanitaireDef: DocumentCategoryDef = {
  droit: DroitsGroup.agrement,
  resolveResourceId: resolveProtocoleSanitaireAgrementId,
};

const protocoleTransportDef: DocumentCategoryDef = {
  droit: DroitsGroup.agrement,
  resolveResourceId: resolveProtocoleTransportAgrementId,
};

// TODO EIG: resolver et vérificateur d'accès à implémenter. Accès refusé en attendant.
const eigDef: DocumentCategoryDef = {
  droit: DroitsGroup.eig,
  resolveResourceId: async () => null,
};

const registry: Record<string, DocumentCategoryDef> = {
  AR_declaration_2_mois: demandeSejourDef,
  AR_declaration_8_jours: demandeSejourDef,
  agrement: agrementDef,
  arrete_autorisation_maire: hebergementDef,
  attestation_securite: hebergementDef,
  declaration_2_mois: demandeSejourDef,
  declaration_8jours: demandeSejourDef,
  eig: eigDef,
  message: messageDef,
  protocole_sanitaire: protocoleSanitaireDef,
  protocole_transport: protocoleTransportDef,
  reponse_explouprop: hebergementDef,
};

for (const category of Object.values(FILE_CATEGORY)) {
  registry[category] = agrementDef;
}

export function getCategoryDef(
  category: string | null | undefined,
): DocumentCategoryDef | null {
  if (!category) {
    return null;
  }
  return registry[category] ?? null;
}
