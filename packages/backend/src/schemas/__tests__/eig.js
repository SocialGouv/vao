const yup = require("yup");
const {
  selectionSejourSchema,
  eigTypesSchema,
  informationsGeneralesSchema,
  emailAutresDestinatairesSchema,
} = require("../eig");
const { Types, Categorie } = require("../../helpers/eig");
const {
  fonctionOptions,
} = require("../../helpers/declaration/informations-personnel");

describe("YUP - eig", () => {
  test("selectionSejourSchema", async () => {
    const eig1 = {
      date: new Date("2021-01-02"),
      declarationId: 1,
      departement: "92",
    };
    const eig2 = {
      date: new Date("2021-01-02"),
      departement: "92",
    };
    const eig3 = {
      date: new Date("2021-01-02"),
      declarationId: 1,
    };
    const eig4 = {
      declarationId: 1,
      departement: "92",
    };

    const schema = yup.object(
      selectionSejourSchema("2021-01-01", "2021-01-10"),
    );
    expect(await schema.validate(eig1)).toEqual(eig1);
    await expect(() => schema.validate(eig2)).rejects.toThrow(
      "Ce champ est obligatoire",
    );
    await expect(() => schema.validate(eig3)).rejects.toThrow(
      "Ce champ est obligatoire",
    );
    await expect(() => schema.validate(eig4)).rejects.toThrow(
      "Ce champ est obligatoire",
    );
    await expect(() =>
      schema.validate({ ...eig4, date: "bad date" }),
    ).rejects.toThrow("La date n'est pas au format attendu");
    await expect(() =>
      schema.validate({ ...eig4, date: "2020-12-31" }),
    ).rejects.toThrow(
      "La date de l'incident doit être supérieure à la date de début de séjour",
    );
    await expect(() =>
      schema.validate({ ...eig4, date: "2021-01-11" }),
    ).rejects.toThrow(
      "La date de l'incident doit être inférieure à la date de fin de séjour",
    );
  });

  test("eigTypesSchemaCRUD", async () => {
    const eig1 = {
      types: ["bad type"],
    };
    const eig2 = {
      types: [Types[Categorie.FONCTIONNEMENT_ORGANISME].AUTRE],
    };
    const eig3 = {
      types: [Types[Categorie.SANTE].AUTRE],
    };
    const eig4 = {
      types: [Types[Categorie.SECURITE].AUTRE],
    };
    const eig5 = {
      types: [Types[Categorie.VICTIMES].AUTRE],
    };

    const schema = yup.object(eigTypesSchema);

    await expect(() => schema.validate(eig1)).rejects.toThrow(
      "La valeur insérée ne fait pas partie de la liste des possibles",
    );

    // champs "autre" pour la catégorie FONCTIONNEMENT_ORGANISME
    await expect(() => schema.validate(eig2)).rejects.toThrow(
      "Ce champ est obligatoire",
    );
    await expect(() =>
      schema.validate({ ...eig2, fonctionnementAutrePrecision: "aaaa" }),
    ).rejects.toThrow("Ce champ doit faire au moins 5 caractères");
    expect(
      await schema.validate({ ...eig2, fonctionnementAutrePrecision: "aaaaa" }),
    ).toEqual({ ...eig2, fonctionnementAutrePrecision: "aaaaa" });

    // champs "autre" pour la catégorie SANTE
    await expect(() => schema.validate(eig3)).rejects.toThrow(
      "Ce champ est obligatoire",
    );
    await expect(() =>
      schema.validate({ ...eig3, santeAutrePrecision: "aaaa" }),
    ).rejects.toThrow("Ce champ doit faire au moins 5 caractères");
    expect(
      await schema.validate({ ...eig3, santeAutrePrecision: "aaaaa" }),
    ).toEqual({ ...eig3, santeAutrePrecision: "aaaaa" });

    // champs "autre" pour la catégorie SECURITE
    await expect(() => schema.validate(eig4)).rejects.toThrow(
      "Ce champ est obligatoire",
    );
    await expect(() =>
      schema.validate({ ...eig4, securiteAutrePrecision: "aaaa" }),
    ).rejects.toThrow("Ce champ doit faire au moins 5 caractères");
    expect(
      await schema.validate({ ...eig4, securiteAutrePrecision: "aaaaa" }),
    ).toEqual({ ...eig4, securiteAutrePrecision: "aaaaa" });

    // champs "autre" pour la catégorie VICTIMES
    await expect(() => schema.validate(eig5)).rejects.toThrow(
      "Ce champ est obligatoire",
    );
    await expect(() =>
      schema.validate({ ...eig5, victimesAutrePrecision: "aaaa" }),
    ).rejects.toThrow("Ce champ doit faire au moins 5 caractères");
    expect(
      await schema.validate({ ...eig5, victimesAutrePrecision: "aaaaa" }),
    ).toEqual({ ...eig5, victimesAutrePrecision: "aaaaa" });
  });

  test("informationsGeneralesSchema", async () => {
    const personnel = [
      {
        competence: "eeee",
        dateNaissance: new Date("1986-05-14"),
        listeFonction: [fonctionOptions[0].value],
        nom: "nom",
        prenom: "prenom",
        telephone: "0666666666",
      },
    ];

    const eig = {
      deroulement: "aaaaa",
      dispositionInformations: "bbbbb",
      dispositionRemediation: "ccccc",
      dispositionVictimes: "ddddd",
      personnel,
    };

    const schema = yup.object(informationsGeneralesSchema);
    expect(await schema.validate(eig)).toEqual(eig);

    await expect(() =>
      schema.validate({ ...eig, deroulement: "a" }),
    ).rejects.toThrow("Ce champ doit faire au moins 5 caractères");
    await expect(() =>
      schema.validate({ ...eig, deroulement: undefined }),
    ).rejects.toThrow("Ce champ est obligatoire");

    await expect(() =>
      schema.validate({ ...eig, dispositionInformations: "a" }),
    ).rejects.toThrow("Ce champ doit faire au moins 5 caractères");
    await expect(() =>
      schema.validate({ ...eig, dispositionInformations: undefined }),
    ).rejects.toThrow("Ce champ est obligatoire");

    await expect(() =>
      schema.validate({ ...eig, dispositionRemediation: "a" }),
    ).rejects.toThrow("Ce champ doit faire au moins 5 caractères");
    await expect(() =>
      schema.validate({ ...eig, dispositionRemediation: undefined }),
    ).rejects.toThrow("Ce champ est obligatoire");

    await expect(() =>
      schema.validate({ ...eig, dispositionVictimes: "a" }),
    ).rejects.toThrow("Ce champ doit faire au moins 5 caractères");
    await expect(() =>
      schema.validate({ ...eig, dispositionVictimes: undefined }),
    ).rejects.toThrow("Ce champ est obligatoire");

    await expect(() =>
      schema.validate({ ...eig, personnel: [] }),
    ).rejects.toThrow("Vous devez saisir au moins 1 personnel");
    await expect(() =>
      schema.validate({ ...eig, personnel: undefined }),
    ).rejects.toThrow("Ce champ est obligatoire");
  });

  test("emailAutresDestinatairesSchema", async () => {
    const eig1 = {
      emailAutresDestinataires: ["a@a.com", "b@b.fr"],
    };
    const eig2 = {
      emailAutresDestinataires: ["a@"],
    };

    const schema = yup.object(emailAutresDestinatairesSchema);

    expect(await schema.validate(eig1)).toEqual(eig1);
    await expect(() => schema.validate(eig2)).rejects.toThrow(
      "Format de courriel invalide",
    );
  });
});
