import { randomInt } from "crypto"
import { email, firstName, lastName } from "./common/data-helpers"
import { main } from "./common/lib"
import { fakerFR as faker } from "@faker-js/faker"

function anonymize(values: Record<string, any>) {
  values.libelle = faker.lorem.sentence(5).substring(0, 50)

  anonResponsableSejour(values)
  anonHebergements(values)
}

function anonResponsableSejour(values: Record<string, any>) {
  const old_responsable_sejour = JSON.parse(values.responsable_sejour)
  const new_responsable_sejour = {
    ...old_responsable_sejour,
    nom: lastName(),
    email: email(),
    prenom: firstName(),
    adresse: { label: faker.location.streetAddress() },
    telephone: "0123456789",
  }
  values.responsable_sejour = JSON.stringify(new_responsable_sejour)
}

function anonHebergements(values: Record<string, any>) {
  if (!values.hebergement) {
    return
  }
  const old_hebergement = JSON.parse(values.hebergement)

  const new_hebergement = {
    hebergement: old_hebergement.hebergements.map((hebergement: any) => {
      return {
        ...hebergement,
        nom: faker.company.name(),
        coordonnees: {
          adresse: {
            label: faker.location.streetAddress(),
            codePostal: faker.location.zipCode(),
            codeInsee: faker.location.zipCode(),
            departement: randomInt(1, 95).toString(),
            coordinates: faker.location.nearbyGPSCoordinate({
              origin: [faker.location.latitude(), faker.location.longitude()],
              radius: 30000,
            }),
          },
          numTelephone1: faker.phone.number(),
          numTelephone2: faker.phone.number(),
          nomGestionnaire: faker.company.name(),
        },
      }
    }),
  }

  values.hebergement = JSON.stringify(new_hebergement)
}

main(anonymize)
