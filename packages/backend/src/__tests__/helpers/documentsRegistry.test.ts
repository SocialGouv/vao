import { FILE_CATEGORY } from "@vao/shared-bridge";

import { getCategoryDef } from "../../helpers/documents";
import { DroitsGroup } from "../../helpers/droits";

describe("helpers/documents - registre des catégories", () => {
  it("associe les catégories de demande de séjour au droit demande_sejour", () => {
    for (const category of [
      "AR_declaration_2_mois",
      "AR_declaration_8_jours",
      "declaration_2_mois",
      "declaration_8jours",
      "message",
    ]) {
      expect(getCategoryDef(category)?.droit).toBe(DroitsGroup.demande_sejour);
    }
  });

  it("associe les catégories d'hébergement au droit hebergement", () => {
    for (const category of [
      "arrete_autorisation_maire",
      "attestation_securite",
      "reponse_explouprop",
    ]) {
      expect(getCategoryDef(category)?.droit).toBe(DroitsGroup.hebergement);
    }
  });

  it("associe la catégorie générique et les protocoles au droit agrement", () => {
    for (const category of [
      "agrement",
      "protocole_sanitaire",
      "protocole_transport",
    ]) {
      expect(getCategoryDef(category)?.droit).toBe(DroitsGroup.agrement);
    }
  });

  it("associe toutes les catégories de fichiers d'agrément au droit agrement", () => {
    for (const category of Object.values(FILE_CATEGORY)) {
      expect(getCategoryDef(category)?.droit).toBe(DroitsGroup.agrement);
    }
  });

  it("expose un resolver de ressource pour chaque catégorie connue", () => {
    expect(typeof getCategoryDef("agrement")?.resolveResourceId).toBe(
      "function",
    );
  });

  it("refuse (null) une catégorie inconnue ou vide", () => {
    expect(getCategoryDef("categorie_inexistante")).toBeNull();
    expect(getCategoryDef("")).toBeNull();
    expect(getCategoryDef(null)).toBeNull();
    expect(getCategoryDef(undefined)).toBeNull();
  });
});
