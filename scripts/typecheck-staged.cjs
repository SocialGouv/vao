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

const packageCwd = process.cwd();
const repoRoot = execGit(["rev-parse", "--show-toplevel"]);

const inputFiles = process.argv.slice(2).filter((arg) => arg !== "--");
if (inputFiles.length === 0) process.exit(0);

const stagedAbs = new Set(
  inputFiles
    .map((f) => (path.isAbsolute(f) ? f : path.resolve(repoRoot, f)))
    .map((p) => path.normalize(p)),
);

// Run a full vue-tsc for the package (Nuxt provides types in .nuxt).
// Then only fail the hook if vue-tsc reports errors *in staged files*.
// This keeps the hook usable even if the repo is not globally typecheck-clean.
const child = spawn("corepack", ["pnpm", "exec", "vue-tsc", "--noEmit"], {
  cwd: packageCwd,
  stdio: ["ignore", "pipe", "pipe"],
});

let out = "";
child.stdout.on("data", (d) => (out += d.toString()));
child.stderr.on("data", (d) => (out += d.toString()));

function extractErrorFilePaths(output) {
  // Matches:
  // - src/file.ts(1,2): error TS1234: ...
  // - /abs/path/file.ts(1,2): error TS1234: ...
  const re = /^(.*)\(\d+,\d+\):\s+error\s+TS\d+:/gm;
  const files = new Set();
  let m;
  while ((m = re.exec(output))) {
    const file = m[1].trim();
    if (!file) continue;
    const abs = path.isAbsolute(file) ? file : path.resolve(packageCwd, file);
    files.add(path.normalize(abs));
  }
  return files;
}

function filterOutputToStagedErrors(output, stagedAbsSet) {
  const lines = output.split(/\r?\n/);
  const kept = [];

  // Error header line example:
  // src/file.ts(1,2): error TS1234: ...
  const headerRe = /^(.*)\(\d+,\d+\):\s+error\s+TS\d+:/;

  let keepBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = headerRe.exec(line);
    if (m) {
      const file = m[1].trim();
      const abs = path.normalize(
        path.isAbsolute(file) ? file : path.resolve(packageCwd, file),
      );
      keepBlock = stagedAbsSet.has(abs);
    }

    if (keepBlock) kept.push(line);
  }

  // Trim leading/trailing empty lines for nicer output.
  while (kept.length && kept[0].trim() === "") kept.shift();
  while (kept.length && kept[kept.length - 1].trim() === "") kept.pop();

  return kept.join("\n");
}

child.on("exit", (code) => {
  if (code === 0) {
    process.exit(0);
  }

  const errorFiles = extractErrorFilePaths(out);
  const stagedErrors = [...errorFiles].filter((f) => stagedAbs.has(f));

  if (stagedErrors.length === 0) {
    process.exit(0);
  }

  const filtered = filterOutputToStagedErrors(out, stagedAbs);
  process.stderr.write(filtered || out);
  process.exit(1);
});
