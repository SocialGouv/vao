import { email, firstName, lastName } from "./common/data-helpers"
import { main } from "./common/lib"
import { fakerFR as faker } from "@faker-js/faker"



function anonymize(values: Record<string, any>) {
  values.libelle = faker.lorem.sentence(5).substring(0, 50)

  anonResponsableSejour(values)
}

function anonResponsableSejour(values: Record<string, any>) {
  const old_responsable_sejour = JSON.parse(values.responsable_sejour)
  const new_responsable_sejour = {
    ...old_responsable_sejour,
    "nom": lastName(),
    "email": email(),
    "prenom": firstName(),
    "adresse": { "label": faker.location.streetAddress() },
    "telephone": "0123456789"
  }
  values.responsable_sejour = JSON.stringify(new_responsable_sejour)
}

function anonHebergements(values: Rec)

main(anonymize)



