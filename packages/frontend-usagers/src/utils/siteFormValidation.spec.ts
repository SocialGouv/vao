import { describe, expect, it } from "vitest";

import { HEBERGEMENT_STATUT } from "@vao/shared-bridge";

import {
  buildSiteFormValidationSchema,
  requiresAddressConfirmation,
} from "../components/hebergements/siteFormValidation";

describe("buildSiteFormValidationSchema", () => {
  it("requires fields when status is not BROUILLON", async () => {
    const schema = buildSiteFormValidationSchema(HEBERGEMENT_STATUT.ACTIF);

    await expect(
      schema.validate({
        nomSiteOfficiel: "",
        nomSiteOrganisme: "",
        adresse: null,
      }),
    ).rejects.toThrow(
      /Le nom officiel du lieu est obligatoire|L’adresse du lieu est obligatoire/,
    );

    await expect(
      schema.validate({
        nomSiteOfficiel: "Gîte des Pins",
        nomSiteOrganisme: "",
        adresse: { label: "123 rue des Fables", coordinates: [1, 2] },
      }),
    ).resolves.toMatchObject({
      nomSiteOfficiel: "Gîte des Pins",
    });
  });

  it("allows draft values when status is BROUILLON", async () => {
    const schema = buildSiteFormValidationSchema(HEBERGEMENT_STATUT.BROUILLON);

    await expect(
      schema.validate({
        nomSiteOfficiel: "",
        nomSiteOrganisme: "",
        adresse: null,
      }),
    ).resolves.toMatchObject({
      nomSiteOfficiel: "",
      adresse: null,
    });
  });

  it("requires confirmation when the address is manually selected without coordinates", () => {
    expect(
      requiresAddressConfirmation({
        label: "18 rue des Fables, 33000 Bordeaux",
        coordinates: [],
      }),
    ).toBe(true);

    expect(
      requiresAddressConfirmation({
        label: "18 rue des Fables, 33000 Bordeaux",
        coordinates: [44.8378, -0.5792],
      }),
    ).toBe(false);

    expect(requiresAddressConfirmation(null)).toBe(true);
  });
});
