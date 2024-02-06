const isPortReachable = require("is-port-reachable");
const path = require("path");
const dockerCompose = require("docker-compose");

module.exports = async () => {
  console.time("global-setup");

  // ️️️✅ Best Practice: Speed up during development, if already live then do nothing
  const isSMTPReachable = await isPortReachable(8080);
  if (!isSMTPReachable) {
    // ️️️✅ Best Practice: Start the infrastructure within a test hook - No failures occur because the DB is down
    await dockerCompose.upAll({
      cwd: path.join(__dirname),
      log: true,
    });
  }

  // 👍🏼 We're ready
  console.timeEnd("global-setup");
};
