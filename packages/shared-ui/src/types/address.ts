export type MunicipalityOption = {
  label: string;
  codeInsee: string;
  codePostal: string;
  coordinates: number[];
  departement: string;
};

export type ApiAdresseResult = {
  properties: {
    label: string;
    citycode: string;
    postcode: string;
    context: string;
  };
  geometry: {
    coordinates: number[];
  };
};
