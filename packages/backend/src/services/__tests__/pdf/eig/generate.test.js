const generate = require("../../../../services/pdf/eig/generate");

describe("Service PDF EIG - generate() réel", () => {
  it("devrait générer un PDF réel et renvoyer un Buffer", async () => {
    const fakeEig = {
      idFonctionnelle: "EIG123",
      agrementRegionObtention: "REG1",
      departementLibelle: "DEP",
      departement: "75",
      raisonSociale: "OVA",
      libelle: "Séjour été",
      dateDebut: "2025-06-01",
      dateFin: "2025-06-10",
      saison: "Été",
      adresses: ["Paris"],
      date: "2025-06-02",
      deroulement: "Tout s'est bien passé.",
      dispositionRemediation: "Aucune",
      dispositionVictimes: "RAS",
      dispositionInformations: "Famille informée",
      readByDdets: true,
      readByDreets: false,
      personnel: [
        {
          nom: "Dupont",
          prenom: "Jean",
          dateNaissance: "2000-01-01",
          listeFonction: ["Animateur"],
          telephone: "0600000000",
        },
      ],
      types: [{ type: "accident", precision: "Mineur" }],
    };

    const buffer = await generate({
      eig: fakeEig,
      serviceRegional: "Île-de-France",
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it("devrait générer un PDF minimal sans personnel ni types", async () => {
    const fakeEig = {
      agrementRegionObtention: "REG1",
      departementLibelle: "DEP",
      departement: "75",
      adresses: [],
      personnel: [],
      types: [],
      deroulement: "",
      dispositionRemediation: "",
      dispositionVictimes: "",
      dispositionInformations: "",
    };

    const buffer = await generate({ eig: fakeEig, serviceRegional: "Centre" });

    expect(Buffer.isBuffer(buffer)).toBe(true);
  });
});
