const { reorgQueryParams } = require("../query");

describe("reorgQueryParams", () => {
  test("devrait fusionner correctement les queryParams avec search", () => {
    const input = {
      limit: 10,
      offset: 0,
      search: {
        organismeId: 123,
        statuts: "EN_COURS,TERMINEE",
      },
    };

    const result = reorgQueryParams(input);

    expect(result).toEqual({
      limit: 10,
      offset: 0,
      organismeId: 123,
      statuts: ["EN_COURS", "TERMINEE"],
    });
  });

  test("devrait gérer les queryParams sans search", () => {
    const input = { limit: 5 };
    const result = reorgQueryParams(input);
    expect(result).toEqual({ limit: 5 });
  });

  test("devrait supprimer la clé 'search' du résultat final", () => {
    const input = { search: { organismeId: 42 } };
    const result = reorgQueryParams(input);
    expect(result.search).toBeUndefined();
  });
});
