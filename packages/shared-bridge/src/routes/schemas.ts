import * as yup from "yup";

export const SearchQuerySchema = {
  limit: yup.number().default(10),
  offset: yup.number().default(0),
  sortBy: yup.string().default(""),
  sortDirection: yup.string().oneOf(["ASC", "DESC", ""]).default(""),
};
