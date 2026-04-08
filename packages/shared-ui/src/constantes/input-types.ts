export type InputType =
  | "raw"
  | "text"
  | "radio"
  | "select"
  | "multiselect"
  | "number"
  | "to_format"
  | "table";

export const InputTypes = {
  RAW: "raw" as InputType,
  TEXT: "text" as InputType,
  RADIO: "radio" as InputType,
  SELECT: "select" as InputType,
  MULTISELECT: "multiselect" as InputType,
  NUMBER: "number" as InputType,
  TO_FORMAT: "to_format" as InputType,
  TABLE: "table" as InputType,
};
