import {
  AGREMENT_STATUT,
  AgrementDto,
  AgrementFilesDto,
  AgrementSejoursDto,
  BilanHebergementDto,
  FILE_CATEGORY,
  TRANCHE_AGE,
  TYPE_HANDICAP,
} from "@vao/shared-bridge";
import { randomUUID } from "crypto";

import { buildAdresseFixture } from "./adresseFixture";

export async function buildAgrementFixture({
  organismeId,
  activiteId = Math.floor(Math.random() * 20) + 1,
}: {
  organismeId: number;
  activiteId?: number;
}): Promise<AgrementDto> {
  return {
    accompRespAttestHono: true,
    accompRespCompExp: "Oui",
    accompRespNb: 1,
    accompRespRecruteUrg: "Non",
    agrementAnimation: [
      {
        activite: { activiteType: null, code: null, libelle: null },
        activiteId,
        agrementId: null,
      },
      {
        activite: { activiteType: null, code: null, libelle: null },
        activiteId: 21 - activiteId,
        agrementId: null,
      },
    ],
    agrementBilanAnnuel: [
      {
        agrementId: null,
        annee: 2024,
        bilanHebergement: [
          {
            adresse: await buildAdresseFixture(),
            mois: [6, 7],
            nbJours: 140,
            nomHebergement: "Centre de vacances Test",
          } as BilanHebergementDto,
        ],
        nbFemmes: 10,
        nbGlobalVacanciers: 20,
        nbHommes: 10,
        nbTotalJoursVacances: 140,
        trancheAge: [TRANCHE_AGE.TA_18_39, TRANCHE_AGE.TA_40_59],
        typeHandicap: [TYPE_HANDICAP.MOTEUR, TYPE_HANDICAP.COGNITIF],
      },
    ],
    agrementFiles: [
      {
        category: FILE_CATEGORY.MOTIVATION,
        fileUuid: randomUUID(),
      } as AgrementFilesDto,
      {
        category: FILE_CATEGORY.IMMATRICUL,
        fileUuid: randomUUID(),
      } as AgrementFilesDto,
    ],
    agrementSejours: [
      {
        adresse: await buildAdresseFixture(),
        mois: [5, 11],
        nbVacanciers: 10,
        nomHebergement: "Centre de vacances Test",
      } as AgrementSejoursDto,
    ],
    animationAutre: "Atelier peinture",
    bilanAucunChangementEvolution: false,
    bilanChangementEvolution: "Ajout de nouvelles activités",
    bilanFinancierCommentaire: "Commentaire financier",
    bilanFinancierComparatif: "Comparatif OK",
    bilanFinancierComptabilite: "Comptabilité OK",
    bilanFinancierRessourcesHumaines: "Ressources OK",
    bilanQualElementsMarquants: "Éléments marquants",
    bilanQualPerceptionSensibilite: "Sensibilité OK",
    bilanQualPerspectiveEvol: "Perspectives OK",
    budgetComplement: "Complément OK",
    budgetGestionPerso: "Gestion perso OK",
    budgetPaiementSecurise: "Paiement OK",
    budgetPersoGestionComplementaire: "Gestion complémentaire OK",
    commentaire: "Commentaire de test",
    dateConfirmCompletude: new Date("2024-12-07"),
    dateDepot: new Date("2024-12-01"),
    dateObtentionCertificat: new Date("2025-01-15"),
    dateVerifCompleture: new Date("2024-12-05"),
    immatriculation: "123-AB-456",
    motivations: "Motivation de test",
    numero: "AGR-2024-0001",
    organismeId,
    protocoleEvacUrg: "Procédure OK",
    protocoleInfoFamille: "Information envoyée",
    protocoleMateriel: "Matériel complet",
    protocoleRapatEtranger: "Procédure OK",
    protocoleRapatUrg: "Procédure OK",
    protocoleRemboursement: "Remboursement OK",
    regionObtention: "IDF",
    sejourCommentaire: "Commentaire de test",
    sejourNbEnvisage: 2,
    sejourTypeHandicap: [],
    statut: AGREMENT_STATUT.BROUILLON,
    suiviMedAccordSejour: "Oui",
    suiviMedDistribution: "Oui",
    transportAllerRetour: "Bus",
    transportSejour: "Train",
    updatedAt: new Date(),
    vacanciersNbEnvisage: 10,
  };
}
