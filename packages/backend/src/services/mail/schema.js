const yup = require("yup");

const mailSchema = yup.object({
  attachments: yup.array(),
  cc: yup.array(yup.string().email()),
  from: yup.string().email().required(),
  html: yup.string().required(),
  replyTo: yup.string(),
  subject: yup.string().required(),
  to: yup.array(yup.string().email()),
});

module.exports = mailSchema;
