import eigService from "../../services/eig";

type CreateEigParams = {
  declarationId: number;
  departement?: string;
  userId: number;
};

export const createEig = async ({
  declarationId,
  departement = "75",
  userId,
}: CreateEigParams): Promise<number> => {
  return eigService.create({
    date: new Date().toISOString().slice(0, 10),
    declarationId,
    departement,
    userId,
  });
};
