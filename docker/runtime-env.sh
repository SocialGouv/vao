#!/bin/sh
# Injecte la configuration NUXT_PUBLIC_* au DÉMARRAGE du conteneur (build-once).
#
# POURQUOI. Les frontends sont générés en statique (`ssr: false` + `nuxt generate`) :
# Nuxt résout les variables NUXT_PUBLIC_* pendant le build et écrit leurs valeurs
# directement dans les pages HTML produites. Aucun processus ne tourne ensuite (nginx
# ne fait que servir des fichiers), donc une image ne peut normalement servir qu'un
# seul environnement. Pour qu'une même image serve tous les environnements, le build
# écrit à la place des MARQUEURS `__NUXT_PUBLIC_X__`, que ce script remplace ici par
# les valeurs réelles lues dans l'environnement du conteneur, avant de lancer nginx.
#
# OÙ. Ce script est l'ENTRYPOINT de l'image ; il termine par `exec "$@"`, donc la
# commande du conteneur (CMD = nginx) prend sa place. À noter : l'image de base
# nginx4spa n'exécute pas les scripts de /docker-entrypoint.d (son entrypoint se
# limite à `exec nginx -g 'daemon off;'`), d'où ce wrapper.
#
# COMPATIBILITÉ. Si l'image a été construite en passant les vraies valeurs en
# --build-arg (cas des pipelines GitHub/Fabrique), les pages ne contiennent aucun
# marqueur : le script ne trouve rien à remplacer et se contente de lancer nginx.
#
# DEUX POINTS DÉLICATS, tous deux constatés en conditions réelles (page blanche) :
#
# 1. Content-Security-Policy. Le module nuxt-security inscrit dans la balise
#    <meta Content-Security-Policy> l'empreinte SHA-256 de chaque script écrit dans
#    la page, calculée pendant le build. Remplacer une valeur modifie le contenu du
#    script, donc son empreinte ne correspond plus à celle déclarée. Comme la
#    politique contient 'strict-dynamic' (qui neutralise 'unsafe-inline' et 'self'),
#    le navigateur REFUSE alors d'exécuter ce script : window.__NUXT__.config n'est
#    jamais défini et l'application échoue au démarrage ("Cannot read properties of
#    undefined (reading 'baseURL')"). On recalcule donc l'empreinte après remplacement
#    et on met la balise à jour.
#
# 2. Type des valeurs. Nuxt convertit les variables d'environnement à la lecture :
#    `false` devient un booléen, `42` un nombre. Un marqueur n'étant convertible en
#    rien, il est écrit comme une chaîne de caractères : enabled:"__NUXT_PUBLIC_X__".
#    Remplacer seulement le texte donnerait enabled:"false" — une chaîne non vide,
#    donc évaluée comme VRAIE en JavaScript : les plugins Sentry/Matomo se lanceraient
#    avec une configuration vide. Pour les valeurs JSON (true, false, null, nombre) on
#    remplace donc aussi les guillemets qui entourent le marqueur, ce qui redonne à la
#    valeur son type d'origine.
set -eu

HTML_ROOT="${HTML_ROOT:-/usr/share/nginx/html}"

# Empreinte SHA-256 encodée en base64, au format attendu par la CSP
sha_b64() { printf '%s' "$1" | sha256sum | cut -d' ' -f1 | xxd -r -p | base64 | tr -d '\n'; }
# Contenu du <script> de configuration Nuxt écrit dans la page (HTML minifié = 1 ligne)
inline_cfg() { sed -n 's/.*<script>\(window\.__NUXT__[^<]*\)<\/script>.*/\1/p' "$1" | head -1; }

VARS="$(env | grep -o '^NUXT_PUBLIC_[A-Z0-9_]*' || true)"
[ -n "$VARS" ] || { [ "$#" -eq 0 ] || exec "$@"; exit 0; }

# Pages contenant au moins un marqueur (aucune = image construite avec --build-arg)
FILES="$(grep -rl '__NUXT_PUBLIC_[A-Z0-9_]*__' "$HTML_ROOT" 2>/dev/null || true)"
[ -n "$FILES" ] || { echo "runtime-env: aucun marqueur à remplacer (valeurs déjà figées au build)"; [ "$#" -eq 0 ] || exec "$@"; exit 0; }

echo "runtime-env: injection de la configuration dans $(echo "$FILES" | wc -l) page(s)"
echo "$FILES" | while IFS= read -r f; do
  before="$(inline_cfg "$f")"

  for var in $VARS; do
    val="$(printenv "$var")"
    case "$val" in *'|'*) echo "runtime-env: $var ignorée (sa valeur contient '|', séparateur utilisé par sed)" >&2; continue ;; esac
    # Valeur JSON : on remplace aussi les guillemets encadrants pour conserver le type
    case "$val" in
      true|false|null|[0-9]*|-[0-9]*) sed -i "s|\"__${var}__\"|${val}|g" "$f" ;;
    esac
    sed -i "s|__${var}__|${val}|g" "$f"
  done

  # Mettre à jour l'empreinte CSP du script modifié, sinon le navigateur le rejette
  if [ -n "$before" ]; then
    after="$(inline_cfg "$f")"
    if [ "$before" != "$after" ]; then
      sed -i "s|sha256-$(sha_b64 "$before")|sha256-$(sha_b64 "$after")|g" "$f"
    fi
  fi
done
echo "runtime-env: configuration injectée, empreintes CSP mises à jour"

[ "$#" -eq 0 ] || exec "$@"
