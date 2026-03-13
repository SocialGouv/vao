import * as yup from "yup";

export const validateId = (
  id: string,
): { id: number | undefined; error: string | null } => {
  try {
    const idNumber = yup.number().required().validateSync(id);
    return { error: null, id: idNumber };
  } catch (error) {
    return { error: (error as Error).message, id: undefined };
  }
};
