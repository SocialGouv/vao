<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Données personnelles</h1>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <h2>
          Identité et coordonnées du responsable de traitement des données
        </h2>
        <p>
          La Direction Générale de la Cohésion Sociale est responsable du
          traitement de données à caractères personnel relatives au service
          numérique dédié aux « Vacances Adaptées Organisées » (VAO).
        </p>
      </div>
      <div class="fr-col-12">
        <h2>Base légale du traitement</h2>
        <p>
          Ce traitement de données est mis en œuvre pour l'exécution d'une
          <b>mission d'intérêt public</b>, conformément au e du 1 de l'article 6
          du règlement (UE) du 27 avril 2016 susvisé, et pour les motifs
          d'intérêt public mentionnés au i du 2 de l'article 9 du même
          règlement.
        </p>
      </div>
      <div class="fr-col-12">
        <h2>Finalités du traitement</h2>
        <p>Ce traitement a pour finalités :</p>

        <ol role="listitem">
          <li role="listitem">
            Le dépôt et l’instruction des demandes d’agrément « vacances
            adaptées organisées », tel que prévu aux articles L. 412-2 et R.
            412-9 et suivants du code du tourisme ;
          </li>
          <li role="listitem">
            Le dépôt et l’instruction des déclarations de séjours « vacances
            adaptées organisées », tel que prévu à l’article R. 412-14 du même
            code ;
          </li>
          <li role="listitem">
            Le recueil et le suivi des signalements des évènements indésirables
            graves déclarés en application de l’article R. 412-14-1 du même code
            ;
          </li>
          <li role="listitem">
            Le suivi et l’évaluation du dispositif « vacances adaptées
            organisées » au niveau national et local.
          </li>
        </ol>
      </div>
      <div class="fr-col-12">
        <h2>Destinataires des données</h2>
        <p>
          Sont habilités à accéder au traitement mentionné, à raison de leurs
          attributions respectives et dans la limite du besoin d'en connaître :
        </p>
        <ol role="listitem">
          <li role="listitem">
            Les personnes physiques ou morales demandant un agrément “vacances
            adaptées organisées“, déclarant un séjour « vacances adaptées
            organisées » ou signalant un évènement indésirable grave, pour les
            seules données qu’ils enregistrent ;
          </li>
          <li role="listitem">
            Les agents des services déconcentrés du ministère chargé des
            affaires sociales spécialement habilités par leur directeur ;
          </li>
          <li role="listitem">
            Les agents de la direction générale de la cohésion sociale
            spécialement habilités par le directeur général de la cohésion
            sociale, pour le suivi et l’évaluation du dispositif « vacances
            adaptées organisées » au niveau national et local ;
          </li>
          <li role="listitem">
            Le cas échéant, les sous-traitants auxquels les responsables de
            traitement ont recours, dans le respect des conditions fixées par
            l'article 28 du règlement (UE) 2016/679 du 27 avril 2016 susvisé.
          </li>
        </ol>
      </div>
      <div class="fr-col-12">
        <h2>
          Durée de conservation des données prévue par le responsable du
          traitement
        </h2>
        <p>
          Les données sont conservées pendant une durée maximale de 5 ans à
          compter de la date de fin du dernier séjour organisé pour un même
          dossier d’agrément.
        </p>
        <p>
          Les données techniques et de traçabilité liées à l'utilisation du
          traitement font l'objet d'un enregistrement et sont conservées pendant
          une durée d'un an.
        </p>
        <p>
          Vous pouvez accéder aux données vous concernant, les rectifier,
          demander leur effacement ou exercer votre droit à la limitation du
          traitement de vos données.
        </p>
        <p>
          Pour exercer ces droits ou pour toute question sur le traitement de
          vos données dans ce dispositif, vous pouvez contacter en précisant
          dans l’objet de votre message “VAO” :
        </p>
        <p><strong>Par courriel</strong> DGCS-RGPD@social.gouv.fr</p>
        <p>
          <strong>Par voie postale</strong>
          <em
            ><dl>
              <dt>Direction Générale de la Cohésion Sociale</dt>
              <dt>78 rue Olivier de Serres</dt>
              <dt>75015 PARIS</dt>
            </dl>
          </em>
        </p>
        <em>
          <p>
            Consultez le site de la
            <a
              title="Site internet de la CNIL"
              href="https://cnil.fr/"
              target="_blank"
              rel="noopener external"
              >CNIL</a
            >
            pour plus d’informations sur vos droits.
          </p>
        </em>
        <a
          title="formulaire de plainte de la CNIL"
          href="https://www.cnil.fr/fr/plaintes"
          target="_blank"
          rel="noopener external"
          >Réclamation, plainte auprès de la CNIL</a
        >
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: "Données personnelles | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de description de l'utilisation des données personnelles.",
    },
  ],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Données personnelles",
  },
];
</script>
