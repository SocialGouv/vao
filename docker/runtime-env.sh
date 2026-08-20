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
#
# 🔑 DEUX PIÈGES, tous deux vérifiés en conditions réelles (page blanche sinon) :
#
# 1. CSP. `nuxt-security` fige dans la balise <meta Content-Security-Policy> le
#    sha256 des scripts INLINE, calculé au build. Modifier le script de config
#    invalide cette empreinte : sous 'strict-dynamic', 'unsafe-inline' et 'self'
#    sont ignorés, donc le navigateur REFUSE le script, `window.__NUXT__.config`
#    n'existe pas et l'app plante (`Cannot read properties of undefined (reading
#    'baseURL')`). => on recalcule l'empreinte et on la remplace dans la CSP.
#
# 2. TYPES. Nuxt type les valeurs à la lecture des env (destr) : `false` devient
#    un booléen. Une sentinelle n'étant pas parsable reste une CHAÎNE, sérialisée
#    `enabled:"__NUXT_PUBLIC_SENTRY_ENABLED__"`. Substituer le texte seul donnerait
#    `enabled:"false"` — chaîne non vide, donc VRAIE en JS : les plugins Sentry/Matomo
#    s'initialiseraient avec une config vide. => pour les littéraux JSON (true/false/
#    null/nombre) on absorbe les guillemets englobants, ce qui restitue le type.
set -eu

HTML_ROOT="${HTML_ROOT:-/usr/share/nginx/html}"

# sha256 base64 (format CSP) du contenu passé en argument
sha_b64() { printf '%s' "$1" | sha256sum | cut -d' ' -f1 | xxd -r -p | base64 | tr -d '\n'; }
# contenu du <script> inline de configuration Nuxt (HTML minifié : une seule ligne)
inline_cfg() { sed -n 's/.*<script>\(window\.__NUXT__[^<]*\)<\/script>.*/\1/p' "$1" | head -1; }

VARS="$(env | grep -o '^NUXT_PUBLIC_[A-Z0-9_]*' || true)"
[ -n "$VARS" ] || { [ "$#" -eq 0 ] || exec "$@"; exit 0; }

# Fichiers porteurs d'au moins une sentinelle (aucun => image aux valeurs déjà cuites)
FILES="$(grep -rl '__NUXT_PUBLIC_[A-Z0-9_]*__' "$HTML_ROOT" 2>/dev/null || true)"
[ -n "$FILES" ] || { echo "runtime-env: aucune sentinelle (image aux valeurs cuites) — rien à faire"; [ "$#" -eq 0 ] || exec "$@"; exit 0; }

echo "runtime-env: substitution dans $(echo "$FILES" | wc -l) fichier(s)"
echo "$FILES" | while IFS= read -r f; do
  before="$(inline_cfg "$f")"

  for var in $VARS; do
    val="$(printenv "$var")"
    case "$val" in *'|'*) echo "runtime-env: valeur de $var ignorée (contient '|')" >&2; continue ;; esac
    # littéral JSON -> absorber les guillemets englobants pour restituer le type
    case "$val" in
      true|false|null|[0-9]*|-[0-9]*) sed -i "s|\"__${var}__\"|${val}|g" "$f" ;;
    esac
    sed -i "s|__${var}__|${val}|g" "$f"
  done

  # Réaligner l'empreinte CSP du script inline modifié
  if [ -n "$before" ]; then
    after="$(inline_cfg "$f")"
    if [ "$before" != "$after" ]; then
      sed -i "s|sha256-$(sha_b64 "$before")|sha256-$(sha_b64 "$after")|g" "$f"
    fi
  fi
done
echo "runtime-env: terminé (valeurs injectées + empreintes CSP réalignées)"

[ "$#" -eq 0 ] || exec "$@"
