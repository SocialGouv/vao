const { object, string, mixed } = require("yup");

function schema() {
  return object({
    declaration_id: string().required(),
    file: mixed().nullable(),
    message: string()
      .max(1000, "Le message ne doit pas dépasser 1000 caractères")
      .nullable(),
  }).test(
    "at-least-one-present",
    "Le message ou la pièce jointe est requis",
    (value) => {
      const hasMessage = value?.message && value.message.trim() !== "";
      const hasFile = !!value?.file;
      return hasMessage || hasFile;
    },
  );
}

module.exports = { schema };
