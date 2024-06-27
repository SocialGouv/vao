const lock = require("./lock");
const save = require("./save");
const logger = require("../utils/logger");

const log = logger(module.filename);

module.exports = function run(name, action) {
  return async () => {
    const start = Date.now();
    let uuid;
    try {
      console.log("Lock de la table");
      uuid = await lock(start, name);
      console.log("uuid", uuid);
    } catch (error) {
      log.i(`${name} - already locked`);
      log.i(`${name} - ${error.message}`);
      return;
    }
    if (uuid) {
      try {
        console.log("Exécution du cron", uuid);
        const result = await action(start);
        const duration = Date.now() - start;
        await save(uuid, duration, null, result);
        console.log("Fin d'exécution du cron", uuid);
      } catch (error) {
        log.w(`${name} - DONE with error`, error.message);
        const duration = Date.now() - start;
        await save(uuid, duration, error.message);
      }
    }
  };
};
