import {
  AGREMENT_STATUT,
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
}) {
  return {
    accompRespAttestHono: true,
    accompRespCompExp: "Oui",
    accompRespNb: 1,
    accompRespRecruteUrg: "Non",
    agrementAnimation: [{ activiteId }, { activiteId: `${21 - activiteId}` }],
    agrementBilanAnnuel: [
      {
        annee: 2024,
        bilanHebergement: [
          {
            adresse: await buildAdresseFixture(),
            mois: [6, 7],
            nbJours: 140,
            nomHebergement: "Centre de vacances Test",
          },
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
      { category: FILE_CATEGORY.MOTIVATION, fileUuid: randomUUID() },
      { category: FILE_CATEGORY.IMMATRICUL, fileUuid: randomUUID() },
    ],
    agrementSejours: [
      {
        adresse: await buildAdresseFixture(),
        mois: [5, 11],
        nbVacanciers: 10,
        nomHebergement: "Centre de vacances Test",
      },
    ],
    animationAutre: "Atelier peinture",
    bilanAucunChangementEvolution: false,
    bilanChangementEvolution: true,
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
    commentaire: "Commentaire de test",
    dateConfirmCompletude: new Date("2024-12-07"),
    dateDepot: new Date("2024-12-01"),
    dateObtentionCertificat: new Date("2025-01-15"),
    dateVerifCompleture: new Date("2024-12-05"),
    immatriculation: "123-AB-456",
    motivations: "Motivation de test",
    organismeId,
    protocoleEvacUrg: "Procédure OK",
    protocoleInfoFamille: "Information envoyée",
    protocoleMateriel: "Matériel complet",
    protocoleRapatEtranger: "Procédure OK",
    protocoleRapatUrg: "Procédure OK",
    protocoleRemboursement: "Remboursement OK",
    sejourNbEnvisage: 2,
    statut: AGREMENT_STATUT.BROUILLON,
    suiviMedAccordSejour: "Oui",
    suiviMedDistribution: "Oui",
    transportAllerRetour: "Bus",
    transportSejour: "Train",
    updatedAt: new Date(),
    vacanciersNbEnvisage: 10,
  };
}
