const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

function execGit(args) {
  const res = spawnSync("git", args, { encoding: "utf8" });
  if (res.status !== 0) {
    const stderr = (res.stderr || "").trim();
    throw new Error(
      `Failed to run git ${args.join(" ")}${stderr ? `: ${stderr}` : ""}`,
    );
  }
  return (res.stdout || "").trim();
}

function normalizeAbs(p) {
  return path.normalize(p);
}

function resolveToAbsFromRepoRoot(repoRoot, maybeRepoRelative) {
  return normalizeAbs(
    path.isAbsolute(maybeRepoRelative)
      ? maybeRepoRelative
      : path.resolve(repoRoot, maybeRepoRelative),
  );
}

function resolveToAbsFromPackageCwd(packageCwd, maybeRelativeToPackage) {
  return normalizeAbs(
    path.isAbsolute(maybeRelativeToPackage)
      ? maybeRelativeToPackage
      : path.resolve(packageCwd, maybeRelativeToPackage),
  );
}

function parseArgs(argv) {
  // Expected invocation:
  //   node scripts/typecheck-staged-tsc.cjs -- <checker...> -- <staged files...>
  // Example in package.json:
  //   node ../../scripts/typecheck-staged-tsc.cjs -- tsc -b ./tsconfig.json --
  const first = argv.indexOf("--");
  const second = first === -1 ? -1 : argv.indexOf("--", first + 1);
  if (first === -1 || second === -1) {
    throw new Error(
      "Usage: node typecheck-staged-tsc.cjs -- <checker...> -- <staged files...>",
    );
  }

  const checker = argv.slice(first + 1, second);
  const files = argv.slice(second + 1).filter((a) => a !== "--");

  return { checker, files };
}

function extractErrorFilePaths(output, packageCwd) {
  // Match common TypeScript formats.
  // 1) src/file.ts(1,2): error TS1234: ...
  // 2) src/file.ts:1:2 - error TS1234: ...
  // 3) src/file.ts:1:2: error TS1234: ...
  const patterns = [
    /^(.*)\(\d+,\d+\):\s+error\s+TS\d+:/gm,
    /^(.*):\d+:\d+\s+-\s+error\s+TS\d+:/gm,
    /^(.*):\d+:\d+:\s+error\s+TS\d+:/gm,
  ];

  const files = new Set();
  for (const re of patterns) {
    let m;
    while ((m = re.exec(output))) {
      const file = (m[1] || "").trim();
      if (!file) continue;
      files.add(resolveToAbsFromPackageCwd(packageCwd, file));
    }
  }
  return files;
}

function filterOutputToStagedErrors(output, packageCwd, stagedAbsSet) {
  const lines = output.split(/\r?\n/);
  const kept = [];

  const headerPatterns = [
    /^(.*)\(\d+,\d+\):\s+error\s+TS\d+:/,
    /^(.*):\d+:\d+\s+-\s+error\s+TS\d+:/,
    /^(.*):\d+:\d+:\s+error\s+TS\d+:/,
  ];

  let keepBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matched = null;

    for (const re of headerPatterns) {
      const m = re.exec(line);
      if (m) {
        matched = m;
        break;
      }
    }

    if (matched) {
      const file = (matched[1] || "").trim();
      const abs = resolveToAbsFromPackageCwd(packageCwd, file);
      keepBlock = stagedAbsSet.has(abs);
    }

    if (keepBlock) kept.push(line);
  }

  // Trim leading/trailing empty lines for nicer output.
  while (kept.length && kept[0].trim() === "") kept.shift();
  while (kept.length && kept[kept.length - 1].trim() === "") kept.pop();

  return kept.join("\n");
}

const packageCwd = process.cwd();
const repoRoot = execGit(["rev-parse", "--show-toplevel"]);

const { checker, files: inputFiles } = parseArgs(process.argv.slice(2));
if (inputFiles.length === 0) process.exit(0);

const stagedAbs = new Set(
  inputFiles
    .map((f) => resolveToAbsFromRepoRoot(repoRoot, f))
    .map((p) => normalizeAbs(p)),
);

// Run a full `tsc` for the package (including project references).
// Then only fail the hook if `tsc` reports errors in staged files.
const child = spawn("corepack", ["pnpm", "exec", ...checker], {
  cwd: packageCwd,
  stdio: ["ignore", "pipe", "pipe"],
});

let out = "";
child.stdout.on("data", (d) => (out += d.toString()));
child.stderr.on("data", (d) => (out += d.toString()));

child.on("exit", (code) => {
  if (code === 0) {
    process.exit(0);
  }

  const errorFiles = extractErrorFilePaths(out, packageCwd);
  const stagedErrors = [...errorFiles].filter((f) => stagedAbs.has(f));

  if (stagedErrors.length === 0) {
    process.exit(0);
  }

  const filtered = filterOutputToStagedErrors(out, packageCwd, stagedAbs);
  process.stderr.write(filtered || out);
  process.exit(1);
});

