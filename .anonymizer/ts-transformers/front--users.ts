import { hashSync, genSaltSync } from "bcryptjs"
import { main } from "./common/lib"
import { email, firstName, lastName } from "./common/data-helpers";

const password = "VAO_fakepwd"
const hashRounds = 6 // default postgres config
const salt = genSaltSync(hashRounds);
const hashedPassword = hashSync(password, salt);

function anonymize(values: Record<string, any>) {
  if (!values.mail.endsWith("@sg.social.gouv.fr")) {
    values.mail = email()
  }

  values.prenom = firstName()
  values.nom = lastName()
  values.telephone = "0123456789"
  values.pwd = values.pwd ? hashedPassword : ""
}

main(anonymize)