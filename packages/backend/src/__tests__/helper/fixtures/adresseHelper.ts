import { randomInt } from "crypto";

import { saveAdresse } from "../../../services/adresse";

const { getPool } = require("../../../utils/pgpool");

export const createAdresse = async ({
  adresse = {},
}: {
  adresse?: Partial<object>;
} = {}): Promise<number> => {
  const departement = randomDepartement();
  const fixture = {
    adresse: {
      cleInsee: `${departement}${randomInt(10000, 99999)}`,
      codeInsee: `${departement}${randomInt(100, 999)}`,
      codePostal: `${departement}${randomInt(100, 999)}`,
      coordinates: [
        parseFloat(randomLatitude()),
        parseFloat(randomLongitude()),
      ],
      departement: departement,
      label: randomLabel(),
    },
    ...adresse,
  };
  const client = getPool();
  client.BEGIN;
  const adresseId = await saveAdresse(client, fixture.adresse);
  client.COMMIT;
  return adresseId;
};

function randomLatitude() {
  // Latitude approximative en France
  return (randomInt(425000, 515000) / 10000).toFixed(4); // 42.5 à 51.5
}

function randomLongitude() {
  // Longitude approximative en France
  return (randomInt(-51000, 88000) / 10000).toFixed(4); // -5.1 à 8.8
}

function randomDepartement() {
  const dep = randomInt(1, 95).toString().padStart(2, "0");
  return dep;
}

function randomLabel() {
  const streets = [
    "Rue de la République",
    "Avenue Victor Hugo",
    "Boulevard Saint-Germain",
    "Rue du Faubourg Saint-Honoré",
    "Place de la Liberté",
  ];
  const num = randomInt(1, 300);
  const street = streets[randomInt(0, streets.length)];
  return `${num} ${street}`;
}
