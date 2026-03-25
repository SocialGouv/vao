/*
Ces procédures servent à supprimer (ou simuler la suppression) de toutes les données liées à un organisme.
- Suppression de l'ensemble des séjours liés à un organisme : supprimer_demandes_sejour_organisme
- Sous procedure de suppression de l'ensemble des données liées à un organisme ; supprimer_organisme (Incluant les séjours)

- Elle cascade manuellement les suppressions sur toutes les tables liées (users, personnes, agréments, séjours, etc.).
==> Entrées
p_organisme_id INT : ID de l’organisme cible
p_action_delete BOOLEAN :
    TRUE → suppression réelle en base + COMMIT
    FALSE → mode simulation (aucune suppression, uniquement des logs)

==> Sorties
Pas de retour direct (pas de RETURN), mais :
- Logs (RAISE NOTICE)

Exemple d'appel de la procédure :
DO $$
BEGIN
    BEGIN
        CALL vao_supprimer_organisme(6, true);
        -- Si tout va bien, commit implicite via fin du DO
        RAISE NOTICE 'Toutes les suppressions ont été validées (COMMIT)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erreur détectée : %', SQLERRM;
            ROLLBACK;
            RAISE;
    END;
END;
$$;*/

CREATE OR REPLACE PROCEDURE vao_supprimer_demandes_sejour_organisme(
  p_organisme_id INT,
  p_action_delete BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  recordDemandeSejour RECORD;
  recordEig RECORD;
  nbDemandeSejour INT := 0;
  nbEig INT := 0;
BEGIN
  FOR recordDemandeSejour IN
    SELECT id, id_fonctionnelle
    FROM front.demande_sejour
    WHERE organisme_id = p_organisme_id
  LOOP
    RAISE NOTICE 'Demande_Sejour : id=% / id-fonctionnel=%',
      recordDemandeSejour.id,
      recordDemandeSejour.id_fonctionnelle;

    RAISE NOTICE 'EIG DELETION';
    FOR recordEig IN
      SELECT id
      FROM front.eig
      WHERE demande_sejour_id = recordDemandeSejour.id
    LOOP
      RAISE NOTICE 'Eig : id=%', recordEig.id;

      IF p_action_delete THEN
        DELETE FROM tracking_actions
        WHERE entity = 'EIG'
          AND entity_id = recordEig.id::text;

        DELETE FROM front.eig_to_eig_type
        WHERE eig_id = recordEig.id;

        DELETE FROM front.eig
        WHERE id = recordEig.id;
      END IF;

      nbEig := nbEig + 1;
    END LOOP;

    nbDemandeSejour := nbDemandeSejour + 1;

    RAISE NOTICE 'DEMANDE_SEJOUR DELETION idSejour : %', recordDemandeSejour.id;
    IF p_action_delete THEN
      RAISE NOTICE 'tracking_actions DELETION';
      DELETE FROM tracking_actions
        WHERE entity = 'DEMANDE_SEJOUR'
        AND entity_id = recordDemandeSejour.id::text;

      RAISE NOTICE 'demande_sejour_history DELETION';
      DELETE FROM front.demande_sejour_history
        WHERE demande_sejour_id = recordDemandeSejour.id;

      RAISE NOTICE 'demande_sejour_message DELETION';
      DELETE FROM front.demande_sejour_message
        WHERE declaration_id = recordDemandeSejour.id;

      RAISE NOTICE 'demande_sejour_to_hebergement DELETION';
      DELETE FROM front.demande_sejour_to_hebergement
        WHERE demande_sejour_id = recordDemandeSejour.id;

      RAISE NOTICE 'demande_sejour DELETION';
      DELETE FROM front.demande_sejour
        WHERE id = recordDemandeSejour.id;
    END IF;
  END LOOP;

  RAISE NOTICE 'Nb Demandes séjours traitées : %', nbDemandeSejour;
  RAISE NOTICE 'Nb Eig traités : %', nbEig;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erreur dans vao_supprimer_demandes_sejour_organisme : %', SQLERRM;
      RAISE;
END $$;


CREATE OR REPLACE PROCEDURE vao_supprimer_organisme(
  p_organisme_id INT,
  p_action_delete BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  recordUsers RECORD;
	recordPersonneMorale RECORD;
	recordPersonnePhysique RECORD;

  nbPersonnePhysique INT := 0;
  nbPersonneMorale INT := 0;
	nbUsers INT := 0;
BEGIN
  CALL vao_supprimer_demandes_sejour_organisme(p_organisme_id, p_action_delete);

  FOR recordPersonneMorale IN
      SELECT id
      FROM front.personne_morale
      WHERE organisme_id = p_organisme_id
  LOOP
    nbPersonneMorale := nbPersonneMorale + 1;
    RAISE NOTICE 'Personne Morale : id = %', recordPersonneMorale.id;

    IF p_action_delete THEN
      DELETE FROM front.opm_etablissements
      WHERE personne_morale_id = recordPersonneMorale.id;

      DELETE FROM front.opm_representants_legaux
      WHERE personne_morale_id = recordPersonneMorale.id;

      DELETE FROM front.personne_morale
      WHERE id = recordPersonneMorale.id;
    END IF;
  END LOOP;

  FOR recordPersonnePhysique IN
    SELECT id
    FROM front.personne_physique
    WHERE organisme_id = p_organisme_id
  LOOP
    nbPersonnePhysique := nbPersonnePhysique + 1;
    RAISE NOTICE 'Personne Physique : id = %', recordPersonnePhysique.id;

    IF p_action_delete THEN
        DELETE FROM front.personne_physique
        WHERE id = recordPersonnePhysique.id;
    END IF;
  END LOOP;

  IF p_action_delete THEN
    DELETE FROM front.agrement_files
    WHERE agrement_id IN (SELECT id
              FROM front.agrements
              WHERE organisme_id = p_organisme_id);

    DELETE FROM front.agrement_animation
    WHERE agrement_id IN (SELECT id
              FROM front.agrements
              WHERE organisme_id = p_organisme_id);

    DELETE FROM front.agrement_sejours
    WHERE agrement_id IN (SELECT id
              FROM front.agrements
              WHERE organisme_id = p_organisme_id);


    DELETE FROM front.agrement_bilan_annuel
    WHERE agrement_id IN (SELECT id
              FROM front.agrements
              WHERE organisme_id = p_organisme_id);

    DELETE FROM front.agrement_history
    WHERE agrement_id IN (SELECT id
              FROM front.agrements
              WHERE organisme_id = p_organisme_id);


    DELETE FROM front.agrements
      WHERE organisme_id = p_organisme_id;

    DELETE FROM front.hebergement_to_prestations_hotelieres
      WHERE hebergement_id IN (SELECT id
                  FROM front.hebergement
                  WHERE organisme_id = p_organisme_id);
    DELETE FROM front.hebergement WHERE organisme_id = p_organisme_id;
    DELETE FROM front.ops_to_ce
      WHERE protocole_sanitaire_id IN (SELECT id
                      FROM front.org_protocole_sanitaire
                      WHERE organisme_id = p_organisme_id);
    DELETE FROM front.ops_to_ram
      WHERE protocole_sanitaire_id IN (SELECT id
                      FROM front.org_protocole_sanitaire
                      WHERE organisme_id = p_organisme_id);
    DELETE FROM front.org_protocole_sanitaire_files
      WHERE protocole_sanitaire_id IN (SELECT id
                      FROM front.org_protocole_sanitaire
                      WHERE organisme_id = p_organisme_id);
    DELETE FROM front.org_protocole_sanitaire WHERE organisme_id = p_organisme_id;

    DELETE FROM front.opt_to_ptm
      WHERE protocole_transport_id IN (SELECT id
                      FROM front.org_protocole_transport
                      WHERE organisme_id = p_organisme_id);
    DELETE FROM front.opt_to_ptr
      WHERE protocole_transport_id IN (SELECT id
                      FROM front.org_protocole_transport
                      WHERE organisme_id = p_organisme_id);

    DELETE FROM front.org_protocole_transport_files
      WHERE protocole_transport_id IN (SELECT id
                      FROM front.org_protocole_transport
                      WHERE organisme_id = p_organisme_id);

    DELETE FROM front.org_protocole_transport
      WHERE organisme_id = p_organisme_id;
  END IF;
  FOR recordUsers IN
    SELECT uo.org_id, u.*
    FROM front.user_organisme uo
    INNER JOIN front.users u ON u.id = uo.use_id
      WHERE org_id = p_organisme_id
  LOOP
    nbUsers := nbUsers + 1;
    RAISE NOTICE 'User: id = %, mail = %', recordUsers.id, recordUsers.mail;
    IF p_action_delete THEN
      DELETE FROM front.user_organisme
        WHERE use_id = recordUsers.id;

      DELETE FROM front.user_roles
        WHERE use_id = recordUsers.id;

      DELETE FROM front.users
        WHERE id = recordUsers.id;
    END IF;
  END LOOP;
  IF p_action_delete THEN
    DELETE FROM front.organismes
      WHERE id = p_organisme_id;
    RAISE NOTICE 'supprimer_organisme : Données supprimées';
  ELSE
      RAISE NOTICE 'Simulation supprimer_organisme : aucune donnée supprimée';
  END IF;
  EXCEPTION
  WHEN OTHERS THEN
      RAISE NOTICE 'Erreur dans vao_supprimer_organisme : %', SQLERRM;
      RAISE;
END $$;
