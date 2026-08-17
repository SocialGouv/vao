#!/bin/sh
# Substitution au démarrage des NUXT_PUBLIC_* dans les fichiers générés (build-once).
#
# Les Dockerfiles frontends buildent par défaut avec des valeurs sentinelles
# (__NUXT_PUBLIC_X__). Ce script, ENTRYPOINT de l'image finale, remplace chaque
# sentinelle par la valeur de la variable d'environnement homonyme fournie au
# conteneur, puis exec la commande servie (CMD = nginx).
# NB : l'entrypoint de nginx4spa n'exécute PAS /docker-entrypoint.d (vérifié
# sur 8.2.4 : `exec nginx -g 'daemon off;'`), d'où ce wrapper.
#
# Rétro-compatible : si l'image a été buildée avec de vraies valeurs
# (--build-arg, pipeline legacy), aucune sentinelle n'est présente et le
# script ne modifie rien.
set -eu

HTML_ROOT="${HTML_ROOT:-/usr/share/nginx/html}"

for var in $(env | grep -o '^NUXT_PUBLIC_[A-Z0-9_]*'); do
  val="$(printenv "$var")"
  case "$val" in *'|'*) echo "runtime-env: valeur de $var ignorée (contient '|')" >&2; continue ;; esac
  files="$(grep -rl "__${var}__" "$HTML_ROOT" 2>/dev/null || true)"
  [ -n "$files" ] || continue
  echo "runtime-env: substitution de __${var}__"
  echo "$files" | while IFS= read -r f; do
    sed -i "s|__${var}__|${val}|g" "$f"
  done
done

exec "$@"
