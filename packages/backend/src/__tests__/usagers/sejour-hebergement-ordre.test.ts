import { STATUS_USER_FRONT } from "@vao/shared-bridge";
import request from "supertest";

import { roles } from "../../helpers/users";
import { getPool } from "../../utils/pgpool";
import { getFoAppHelper } from "../helpers/appHelper";
import { createDemandeSejour } from "../helpers/demandeSejourHelper";
import { createHebergement } from "../helpers/hebergementHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUserValide } from "../helpers/userHelper";

jest.setTimeout(30000);

let foUserId = 0;
const getSejourFoUser = () => ({
  id: foUserId,
  roles: [roles.DEMANDE_SEJOUR_LECTURE, roles.DEMANDE_SEJOUR_ECRITURE],
  territoireCode: "FRA",
});

let organismeId = 0;
let declarationId = 0;

beforeAll(async () => {
  await createTestContainer({ pg: true, s3: true });
  const foUser = await createUsagersUserValide();
  await getPool().query(
    `UPDATE front.users SET status_code = $1 WHERE id = $2`,
    [STATUS_USER_FRONT.VALIDATED, foUser.id],
  );
  foUserId = foUser.id;
  organismeId = await createOrganisme({ userId: foUserId });
  declarationId = await createDemandeSejour({ organismeId });
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /sejour/:declarationId", () => {
  it("retourne les hébergements dans l'ordre chronologique de date de début", async () => {
    await createHebergement({
      organismeId,
      declarationId,
      dateDebut: "2024-08-05",
      dateFin: "2024-08-08",
    });
    await createHebergement({
      organismeId,
      declarationId,
      dateDebut: "2024-08-01",
      dateFin: "2024-08-03",
    });
    await createHebergement({
      organismeId,
      declarationId,
      dateDebut: "2024-08-10",
      dateFin: "2024-08-12",
    });

    const response = await request(getFoAppHelper(getSejourFoUser())).get(
      `/sejour/${declarationId}`,
    );

    expect(response.status).toBe(200);

    const hebergements = response.body.demande.hebergement.hebergements;
    expect(Array.isArray(hebergements)).toBe(true);
    expect(hebergements).toHaveLength(3);

    const dates = hebergements.map(
      (hebergement: { dateDebut: string | Date }) =>
        new Date(hebergement.dateDebut).getTime(),
    );
    const expectedSorted = [...dates].sort((a, b) => a - b);
    expect(dates).toEqual(expectedSorted);
    expect(expectedSorted[0]).toBe(new Date("2024-08-01").getTime());
  });
});
