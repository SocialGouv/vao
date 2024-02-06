const yup = require("yup");

const mailSchema = yup.object({
  from: yup.string().email().required(),
  to: yup.array(yup.string().email()),
  cc: yup.array(yup.string().email()),
  subject: yup.string().required(),
  html: yup.string().required(),
  attachments: yup.array(),
  replyTo: yup.string(),
});

module.exports = mailSchema;
