/**
 * Central lint-staged config for the whole monorepo.
 *
 * Goal:
 * - ESLint runs only on staged files.
 * - Typecheck runs once per affected package (not once per file).
 *
 * Scoping rules:
 * - Files under packages/<name>/... are linted with that package's ESLint.
 * - Files outside packages/ (e.g. e2e/, scripts/, repo root) are linted with repo-root ESLint.
 * - Typecheck/build runs once per affected package when TS/Vue files are staged.
 */

var fs = require("node:fs");
var path = require("node:path");

var SOURCE_GLOB = "**/*.{js,jsx,ts,tsx,vue,mjs,cjs}";

function toPosix(p) {
  // Ensure lint-staged path separators are stable across platforms.
  return String(p).split(path.sep).join("/");
}

function toRepoRelative(p) {
  // lint-staged may provide absolute paths; normalize everything to repo-relative.
  var s = String(p);
  if (!path.isAbsolute(s)) return s;
  return path.relative(process.cwd(), s);
}

function quoteForShell(arg) {
  // POSIX shell single-quote escaping:  abc'd -> 'abc'\''d'
  return "'" + String(arg).split("'").join("'\\''") + "'";
}

function readJson(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

 function isTypecheckRelevant(file) {
   return /\.(ts|tsx|vue)$/i.test(file);
 }

function unique(list) {
  return Array.from(new Set(list));
}

function groupByPackage(files) {
  // byPkg: Map<pkgName, { repoFiles: string[], pkgFiles: string[] }>
  var byPkg = new Map();
  var rootFiles = [];

  var posixFiles = [];
  for (var i = 0; i < files.length; i++) {
    posixFiles.push(toPosix(toRepoRelative(files[i])));
  }

  for (var j = 0; j < posixFiles.length; j++) {
    var f = posixFiles[j];
    var m = /^packages\/([^/]+)\/(.+)$/.exec(f);
    if (!m) {
      rootFiles.push(f);
      continue;
    }

    var pkgName = m[1];
    var inPkg = m[2];

    var entry = byPkg.get(pkgName);
    if (!entry) entry = { repoFiles: [], pkgFiles: [] };
    entry.repoFiles.push(f);
    entry.pkgFiles.push(inPkg);
    byPkg.set(pkgName, entry);
  }

  return { byPkg: byPkg, rootFiles: rootFiles };
}

var config = {};

config[SOURCE_GLOB] = function (files) {
  var grouped = groupByPackage(files);
  var byPkg = grouped.byPkg;
  var rootFiles = grouped.rootFiles;

  var commands = [];

  // 1) Package-scoped ESLint + typecheck/build
  byPkg.forEach(function (value, pkgName) {
    var repoFiles = value.repoFiles;
    var pkgFiles = value.pkgFiles;

    var uniquePkgFiles = unique(pkgFiles);
    if (uniquePkgFiles.length > 0) {
      var eslintCmdParts = [];
      eslintCmdParts.push("corepack pnpm --dir packages/" + pkgName + " exec eslint");
      eslintCmdParts.push("--cache --fix --max-warnings=0 --");
      for (var i = 0; i < uniquePkgFiles.length; i++) {
        eslintCmdParts.push(quoteForShell(uniquePkgFiles[i]));
      }
      commands.push(eslintCmdParts.join(" "));
    }

    // 2) Package-scoped typecheck/build (once per affected package)
    var uniqueRepoFiles = unique(repoFiles);
    var relevant = [];
    for (var j = 0; j < uniqueRepoFiles.length; j++) {
      if (isTypecheckRelevant(uniqueRepoFiles[j])) relevant.push(uniqueRepoFiles[j]);
    }
    if (relevant.length === 0) return;

    var pkgJsonPath = path.join("packages", pkgName, "package.json");
     var pkgJson = readJson(pkgJsonPath);
     var scripts = pkgJson.scripts || {};

     // Only run the dedicated staged typecheck script.
     if (scripts["typecheck:staged"]) {
       var typecheckCmdParts = [];
       typecheckCmdParts.push(
         "corepack pnpm --dir packages/" + pkgName + " run typecheck:staged --",
       );
       for (var k = 0; k < relevant.length; k++) {
         typecheckCmdParts.push(quoteForShell(relevant[k]));
       }
       commands.push(typecheckCmdParts.join(" "));
     }
   });

  // 3) Root-scoped ESLint (e2e/, scripts/, repo root, etc.)
  var uniqueRootFiles = unique(rootFiles);
  if (uniqueRootFiles.length > 0) {
    var rootEslintCmdParts = [];
    rootEslintCmdParts.push("corepack pnpm exec eslint");
    rootEslintCmdParts.push("--cache --fix --max-warnings=0 --");
    for (var r = 0; r < uniqueRootFiles.length; r++) {
      rootEslintCmdParts.push(quoteForShell(uniqueRootFiles[r]));
    }
    commands.push(rootEslintCmdParts.join(" "));
  }

  return commands;
};

module.exports = config;
