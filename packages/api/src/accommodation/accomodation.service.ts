import { Inject, Injectable } from "@nestjs/common";
import { Pool } from "pg";

import { status } from "../helpers/accomodation";
import { parseData } from "../lib/zodHelper";
import type {
  Accomodation,
  CreateAccomodation,
} from "../schemas/accomodation.schema";
import { AccomodationSchema } from "../schemas/accomodation.schema";
import type { Organisme } from "../schemas/organisme.schema";
import type { User } from "../schemas/user.schema";

@Injectable()
export class AccomodationService {
  constructor(@Inject("PG_CONNECTION") private readonly db: Pool) {}

  async create(
    accomodation: CreateAccomodation,
    userId: User["id"],
    organismeId: Organisme["id"],
  ): Promise<Accomodation> {
    const { rows } = await this.db.query(
      `
    INSERT INTO front.hebergement(
      organisme_id,
      CREATED_BY,
      EDITED_BY,
      created_at,
      edited_at,
      HEBERGEMENT_ID,
      CURRENT,
      nom,
      coordonnees,
      informations_locaux,
      informations_transport,
      EMAIL,
      ADRESSE_ID,
      TELEPHONE_1,
      TELEPHONE_2,
      NOM_GESTIONNAIRE,
      TYPE_ID,
      TYPE_PENSION_ID,
      NOMBRE_LITS,
      LIT_DESSUS,
      NOMBRE_LITS_SUPERPOSES,
      NOMBRE_MAX_PERSONNES_COUCHAGE,
      VISITE_LOCAUX,
      ACCESSIBILITE_ID,
      CHAMBRES_DOUBLES,
      CHAMBRES_UNISEXES,
      REGLEMENTATION_ERP,
      COUCHAGE_INDIVIDUEL,
      RANGEMENT_INDIVIDUEL,
      AMENAGEMENTS_SPECIFIQUES,
      DESCRIPTION_LIEU_HEBERGEMENT,
      EXCURSION_DESCRIPTION,
      DEPLACEMENT_PROXIMITE_DESCRIPTION,
      VEHICULES_ADAPTES,
      FILE_REPONSE_EXPLOITANT_OU_PROPRIETAIRE,
      FILE_DERNIER_ARRETE_AUTORISATION_MAIRE,
      FILE_DERNIERE_ATTESTATION_SECURITE,
      VISITE_LOCAUX_AT,
      ACCESSIBILITE_PRECISION,
      AMENAGEMENTS_SPECIFIQUES_PRECISION
    )
    VALUES (
      $1,                                                               --organisme_id,
      $2,                                                               --CREATED_BY,
      $3,                                                               --EDITED_BY,
      $4,                                                               --created_at,
      NOW(),                                                            --edited_at,
      $5,                                                                --HEBERGEMENT_ID,
      TRUE,                                                             --CURRENT,
      $6,                                                               --nom,
      $7,                                                               --coordonnees,
      $8,                                                               --informations_locaux,
      $9,                                                               --informations_transport,
      $10,                                                               --EMAIL,
      $11,                                                               --ADRESSE_ID,
      $12,                                                               --TELEPHONE_1,
      $13,                                                               --TELEPHONE_2,
      $14,                                                              --NOM_GESTIONNAIRE,
      (SELECT ID FROM FRONT.HEBERGEMENT_TYPE WHERE VALUE = $15),          --TYPE_ID,
      (SELECT ID FROM FRONT.HEBERGEMENT_TYPE_PENSION WHERE VALUE = $16),  --TYPE_PENSION_ID,
      $17,                                                              --NOMBRE_LITS,
      $18,                                                              --LIT_DESSUS,
      $19,                                                              --NOMBRE_LITS_SUPERPOSES,
      $20,                                                              --NOMBRE_MAX_PERSONNES_COUCHAGE,
      $21,                                                              --VISITE_LOCAUX,
      (SELECT ID FROM FRONT.HEBERGEMENT_ACCESSIBILITE WHERE VALUE = $22), --ACCESSIBILITE_ID,
      $23,                                                              --CHAMBRES_DOUBLES,
      $24,                                                              --CHAMBRES_UNISEXES,
      $25,                                                              --REGLEMENTATION_ERP,
      $26,                                                              --COUCHAGE_INDIVIDUEL,
      $27,                                                              --RANGEMENT_INDIVIDUEL,
      $28,                                                              --AMENAGEMENTS_SPECIFIQUES,
      $29,                                                              --DESCRIPTION_LIEU_HEBERGEMENT,
      $30,                                                              --EXCURSION_DESCRIPTION,
      $31,                                                              --DEPLACEMENT_PROXIMITE_DESCRIPTION,
      $32,                                                              --VEHICULES_ADAPTES,
      $33,                                                              --FILE_REPONSE_EXPLOITANT_OU_PROPRIETAIRE,
      $34,                                                              --FILE_DERNIER_ARRETE_AUTORISATION_MAIRE,
      $35,                                                              --FILE_DERNIERE_ATTESTATION_SECURITE
      $36,                                                              --VISITE_LOCAUX_AT
      $37,                                                              --ACCESSIBILITE_PRECISION
      $38,                                                               --AMENAGEMENTS_SPECIFIQUES_PRECISION
      (SELECT ID FROM FRONT.HEBERGEMENT_STATUT WHERE VALUE = $39)
    )`,
      [
        organismeId, // $1 (ID de l'organisme)
        userId, // ID de l'utilisateur
        new Date(), // Date de création
        new Date(), // Date de mise à jour
        crypto.randomUUID(), // 5 (Identifiant unique)
        accomodation.name, // nom
        accomodation.coordinates, // coordonnées
        accomodation.accommodationInfo, // informationsLocaux
        accomodation.transportInfo, // informationsTransport
        accomodation.coordinates.email, // email
        accomodation.coordinates.address.codeInsee, // codeInsee
        accomodation.coordinates.phoneNumber1, // numTelephone1
        accomodation.coordinates.phoneNumber2, // numTelephone2
        accomodation.coordinates.managerName, // nomGestionnaire
        accomodation.accommodationInfo.type, // type
        accomodation.accommodationInfo.accommodationType, // pension
        accomodation.accommodationInfo.numberOfBeds, // nombreLits
        accomodation.accommodationInfo.bunkBeds, // litsDessus
        accomodation.accommodationInfo.numberOfBunkBeds, // nombreLitsSuperposes
        accomodation.accommodationInfo.maxSleepingCapacity, // nombreMaxPersonnesCouchage
        accomodation.accommodationInfo.localInspection, // visiteLocaux
        accomodation.accommodationInfo.accessibility, // accessibilite
        accomodation.accommodationInfo.doubleRooms, // chambresDoubles
        accomodation.accommodationInfo.singleSexRooms, // chambresUnisexes
        accomodation.accommodationInfo.erpRegulations, // reglementationErp
        accomodation.accommodationInfo.individualBeds, // couchageIndividuel
        accomodation.accommodationInfo.individualStorage, // rangementIndividuel
        accomodation.accommodationInfo.specificAdaptations, // amenagementsSpecifiques
        accomodation.accommodationInfo.accommodationDescription, // descriptionLieuHebergement
        accomodation.transportInfo.excursion, // excursion
        accomodation.transportInfo.nearbyTravel, // deplacementProximite
        accomodation.transportInfo.adaptedVehicles, // vehiculesAdaptes
        // accomodation.accommodationInfo.fileReponseExploitantOuProprietaire
        //   ?.uuid ?? null, // fichierReponseExploitantOuProprietaire
        // accomodation.accommodationInfo.fileDernierArreteAutorisationMaire
        //   ?.uuid ?? null, // fichierDernierArreteAutorisationMaire
        // accomodation.accommodationInfo.fileDerniereAttestationSecurite?.uuid ??
        //   null, // fichierDerniereAttestationSecurite
        accomodation.accommodationInfo.localInspectionDate, // visiteLocauxAt
        accomodation.accommodationInfo.accessibilityDetails, // accessibilitePrecision
        accomodation.accommodationInfo.specificAdaptationsDetails, // precisionAmenagementsSpecifiques
        status.DRAFT,
      ],
    );
    return parseData(rows, AccomodationSchema);
  }
}
