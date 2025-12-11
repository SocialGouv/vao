import { randomInt } from "crypto";

export const buildAdresseFixture = async (): Promise<object> => {
  const departement = randomDepartement();
  return {
    cleInsee: `${departement}${randomInt(10000, 99999)}`,
    codeInsee: `${departement}${randomInt(100, 999)}`,
    codePostal: `${departement}${randomInt(100, 999)}`,
    coordinates: [parseFloat(randomLatitude()), parseFloat(randomLongitude())],
    departement: departement,
    label: randomLabel(),
  };
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
  // Traitement de l'exception de la corse
  const newDep = dep === "20" ? "2A" : dep;
  return newDep;
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
