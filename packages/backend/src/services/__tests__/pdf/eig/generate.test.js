const generate = require("../../../../services/pdf/eig/generate");

describe("Service PDF EIG - generate() réel", () => {
  it("devrait générer un PDF réel et renvoyer un Buffer", async () => {
    const fakeEig = {
      adresses: ["Paris"],
      agrementRegionObtention: "REG1",
      date: "2025-06-02",
      dateDebut: "2025-06-01",
      dateFin: "2025-06-10",
      departement: "75",
      departementLibelle: "DEP",
      deroulement: "Tout s'est bien passé.",
      dispositionInformations: "Famille informée",
      dispositionRemediation: "Aucune",
      dispositionVictimes: "RAS",
      idFonctionnelle: "EIG123",
      libelle: "Séjour été",
      personnel: [
        {
          dateNaissance: "2000-01-01",
          listeFonction: ["Animateur"],
          nom: "Dupont",
          prenom: "Jean",
          telephone: "0600000000",
        },
      ],
      raisonSociale: "OVA",
      readByDdets: true,
      readByDreets: false,
      saison: "Été",
      types: [{ precision: "Mineur", type: "accident" }],
    };

    const buffer = await generate({
      eig: fakeEig,
      serviceRegional: "Île-de-France",
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it("devrait générer un PDF minimal sans personnel ni types", async () => {
    const fakeEig = {
      adresses: [],
      agrementRegionObtention: "REG1",
      departement: "75",
      departementLibelle: "DEP",
      deroulement: "",
      dispositionInformations: "",
      dispositionRemediation: "",
      dispositionVictimes: "",
      personnel: [],
      types: [],
    };

    const buffer = await generate({ eig: fakeEig, serviceRegional: "Centre" });

    expect(Buffer.isBuffer(buffer)).toBe(true);
  });
});
