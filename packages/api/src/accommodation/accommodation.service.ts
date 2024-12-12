import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";

import { status } from "../helpers/accommodation";
import { HotelServiceService } from "../hotelService/hotelService.service";
import { parseData } from "../lib/zodHelper";
import type {
  Accommodation,
  CreateAccommodation,
} from "../schemas/accommodation.schema";
import { AccommodationSchema } from "../schemas/accommodation.schema";
import type { Organism } from "../schemas/organism.schema";
import type { User } from "../schemas/user.schema";

@Injectable()
export class AccommodationService {
  constructor(
    @Inject("PG_CONNECTION") private readonly db: Pool,
    private hotelServiceService: HotelServiceService,
  ) {}
  private readonly logger = new Logger(AccommodationService.name);

  async create(
    accommodation: CreateAccommodation,
    userId: User["id"],
    organismId: Organism["id"],
  ): Promise<Accommodation> {
    const { rows } = await this.db.query(
      `
    WITH inserted AS (
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
        AMENAGEMENTS_SPECIFIQUES_PRECISION,
        STATUT_ID
      )
      VALUES (
        $1,                                                                 --organisme_id,
        $2,                                                                 --CREATED_BY,
        $3,                                                                 --EDITED_BY,
        NOW(),                                                              --created_at,
        NOW(),                                                              --edited_at,
        $4,                                                                 --HEBERGEMENT_ID,
        TRUE,                                                               --CURRENT,
        $5,                                                                 --nom,
        $6,                                                                 --coordonnees,
        $7,                                                                 --informations_locaux,
        $8,                                                                 --informations_transport,
        $9,                                                                 --EMAIL,
        $10,                                                                --ADRESSE_ID,
        $11,                                                                --TELEPHONE_1,
        $12,                                                                --TELEPHONE_2,
        $13,                                                                --NOM_GESTIONNAIRE,
        (SELECT ID FROM FRONT.HEBERGEMENT_TYPE WHERE VALUE = $14),          --TYPE_ID,
        (SELECT ID FROM FRONT.HEBERGEMENT_TYPE_PENSION WHERE VALUE = $15),  --TYPE_PENSION_ID,
        $16,                                                                --NOMBRE_LITS,
        $17,                                                                --LIT_DESSUS,
        $18,                                                                --NOMBRE_LITS_SUPERPOSES,
        $19,                                                                --NOMBRE_MAX_PERSONNES_COUCHAGE,
        $20,                                                                --VISITE_LOCAUX,
        (SELECT ID FROM FRONT.HEBERGEMENT_ACCESSIBILITE WHERE VALUE = $21), --ACCESSIBILITE_ID,
        $24,                                                                --CHAMBRES_DOUBLES,
        $23,                                                                --CHAMBRES_UNISEXES,
        $22,                                                                --REGLEMENTATION_ERP,
        $25,                                                                --COUCHAGE_INDIVIDUEL,
        $26,                                                                --RANGEMENT_INDIVIDUEL,
        $27,                                                                --AMENAGEMENTS_SPECIFIQUES,
        $28,                                                                --DESCRIPTION_LIEU_HEBERGEMENT,
        $29,                                                                --EXCURSION_DESCRIPTION,
        $30,                                                                --DEPLACEMENT_PROXIMITE_DESCRIPTION,
        $31,                                                                --VEHICULES_ADAPTES,
        $32,                                                                --FILE_REPONSE_EXPLOITANT_OU_PROPRIETAIRE,
        $33,                                                                --FILE_DERNIER_ARRETE_AUTORISATION_MAIRE,
        $34,                                                                --FILE_DERNIERE_ATTESTATION_SECURITE
        $35,                                                                --VISITE_LOCAUX_AT
        $36,                                                                --ACCESSIBILITE_PRECISION
        $37,                                                                --AMENAGEMENTS_SPECIFIQUES_PRECISION
        (SELECT ID FROM FRONT.HEBERGEMENT_STATUT WHERE VALUE = $38)         --STATUS_ID
      )
      RETURNING *
    )
    SELECT
      i.id as "id",
      i.nom as "name",
      TO_CHAR(i.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt",
      TO_CHAR(i.edited_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "editedAt",
      i.organisme_id as "organismId",
      json_build_object(
        'address', json_build_object(
          'id', a.id,
          'department', a.departement,
          'lat', a.lat,
          'long', a.long,
          'label', a.label,
          'inseeKey', a.cle_insee,
          'inseeCode', a.code_insee,
          'postalCode', a.code_postal
        ),
        'email', i.email,
        'managerName', i.nom_gestionnaire,
        'phoneNumber1', i.telephone_1,
        'phoneNumber2', i.telephone_2
      ) as "coordinates",
      json_build_object(
        'accessibility', ha.value,
        'accessibilityDetails', i.accessibilite_precision,
        'accommodationDescription', i.description_lieu_hebergement,
        'type', ht.value,
        'accommodationType', htp.value,
        'numberOfBeds', i.nombre_lits_superposes,
        'bunkBeds', i.lit_dessus,
        'doubleRooms', i.chambres_doubles,
        'erpRegulations', i.reglementation_erp,
        'individualBeds', i.couchage_individuel,
        'individualStorage', i.rangement_individuel,
        'lastMayorAuthorizationFile', i.file_dernier_arrete_autorisation_maire,
        'lastSafetyCertificateFile', i.file_derniere_attestation_securite,
        'localInspection', i.visite_locaux,
        'localInspectionDate', TO_CHAR(i.visite_locaux_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'maxSleepingCapacity', i.nombre_max_personnes_couchage,
        'numberOfBeds', i.nombre_lits,
        'numberOfBunkBeds', i.nombre_lits_superposes,
        'responseFromOwnerOrOperatorFile', i.file_reponse_exploitant_ou_proprietaire,
        'singleSexRooms', i.chambres_unisexes,
        'specificAdaptations', i.amenagements_specifiques,
        'specificAdaptationsDetails', i.amenagements_specifiques_precision
      ) as "accommodationInfo",
      json_build_object(
        'adaptedVehicles', i.vehicules_adaptes,
        'excursion', i.excursion_description,
        'nearbyTravel', i.deplacement_proximite_description
      ) as "transportInfo"
    FROM inserted i
    LEFT JOIN front.adresse a ON a.id = i.adresse_id
    LEFT JOIN front.hebergement_type ht on ht.id = i.type_id
    LEFT JOIN front.hebergement_type_pension htp on htp.id = i.type_pension_id
    LEFT JOIN front.hebergement_accessibilite ha ON ha.id = i.accessibilite_id;
        `,
      [
        organismId, // $1 (ID de l'organisme)
        userId, // ID de l'utilisateur
        userId, // ID de l'utilisateur
        crypto.randomUUID(), // 5 (Identifiant unique)
        accommodation.name, // nom
        {}, // coordonnees
        {}, // informationsLocaux
        {}, // informationsTransport
        accommodation.coordinates.email, // email
        accommodation.coordinates.addressId, // codeInsee
        accommodation.coordinates.phoneNumber1, // numTelephone1
        accommodation.coordinates.phoneNumber2, // numTelephone2
        accommodation.coordinates.managerName, // nomGestionnaire
        accommodation.accommodationInfo.type, // type
        accommodation.accommodationInfo.accommodationType, // pension
        accommodation.accommodationInfo.numberOfBeds, // nombreLits
        accommodation.accommodationInfo.bunkBeds, // litsDessus
        accommodation.accommodationInfo.numberOfBunkBeds, // nombreLitsSuperposes
        accommodation.accommodationInfo.maxSleepingCapacity, // nombreMaxPersonnesCouchage
        accommodation.accommodationInfo.localInspection, // visiteLocaux
        accommodation.accommodationInfo.accessibility, // accessibilite
        accommodation.accommodationInfo.doubleRooms, // chambresDoubles
        accommodation.accommodationInfo.singleSexRooms, // chambresUnisexes
        accommodation.accommodationInfo.erpRegulations, // reglementationErp
        accommodation.accommodationInfo.individualBeds, // couchageIndividuel
        accommodation.accommodationInfo.individualStorage, // rangementIndividuel
        accommodation.accommodationInfo.specificAdaptations, // amenagementsSpecifiques
        accommodation.accommodationInfo.accommodationDescription, // descriptionLieuHebergement
        accommodation.transportInfo.excursion, // excursion
        accommodation.transportInfo.nearbyTravel, // deplacementProximite
        accommodation.transportInfo.adaptedVehicles, // vehiculesAdaptes
        accommodation.accommodationInfo.responseFromOwnerOrOperatorFile ?? null, // fichierReponseExploitantOuProprietaire
        accommodation.accommodationInfo.lastMayorAuthorizationFile ?? null, // fichierDernierArreteAutorisationMaire
        accommodation.accommodationInfo.lastSafetyCertificateFile ?? null, // fichierDerniereAttestationSecurite
        accommodation.accommodationInfo.localInspectionDate, // visiteLocauxAt
        accommodation.accommodationInfo.accessibilityDetails, // accessibilitePrecision
        accommodation.accommodationInfo.specificAdaptationsDetails, // precisionAmenagementsSpecifiques
        status.DRAFT,
      ],
    );

    const accommodationCreated = rows[0];
    accommodationCreated.accommodationInfo.hotelServices =
      await this.hotelServiceService.create(
        accommodationCreated.id,
        accommodation.accommodationInfo.hotelServices,
      );

    try {
      return parseData(accommodationCreated, AccommodationSchema);
    } catch (error) {
      this.logger.error(accommodationCreated);
      throw error;
    }
  }
}
