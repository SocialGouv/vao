import { create as createAgrementServiceDeprecated } from "../../../services/Agrement";
import { AgrementService } from "../../../usagers/agrements/agrements.service";

export const createAgrementDeprecated = async ({
  organismeId,
  agrement = {},
}: {
  agrement?: Partial<object>;
  organismeId?: number;
} = {}): Promise<number> => {
  const fixture = {
    adresseIdentique: true,
    createdAt: new Date(),
    dateFinValidite: "2030-01-01",
    dateObtention: "2025-01-01",
    file: {
      createdAt: new Date(),
      name: "Arrêté modificatif VAO signé.pdf",
      uuid: "5f1f5a95-33c7-490a-9211-4663b7629888",
    },
    numero: " IDF-022-2023-02",
    organismeId,
    regionObtention: "IDF",
    ...agrement,
  };
  const agrementId = await createAgrementServiceDeprecated(
    fixture.organismeId,
    fixture.numero,
    fixture.regionObtention,
    fixture.dateObtention,
    fixture.dateFinValidite,
    null,
  );
  return agrementId;
};

export const createAgrement = async ({
  organismeId,
  agrement = {},
}: {
  agrement?: Partial<object>;
  organismeId?: number;
} = {}): Promise<number> => {
  const fixture = {
    adresseIdentique: true,
    createdAt: new Date(),
    dateFinValidite: "2030-01-01",
    dateObtention: "2025-01-01",
    file: {
      createdAt: new Date(),
      name: "Arrêté modificatif VAO signé.pdf",
      uuid: "5f1f5a95-33c7-490a-9211-4663b7629888",
    },
    numero: " IDF-022-2023-02",
    organismeId,
    regionObtention: "IDF",
    ...agrement,
  };
  const agrementId = await AgrementService.save({
    agrement: fixture,
  });
  return agrementId;
};
