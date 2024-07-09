const lock = require("./lock");
const save = require("./save");
const logger = require("../utils/logger");

const log = logger(module.filename);

module.exports = function run(name, action) {
  return async () => {
    const start = Date.now();
    let uuid;
    try {
      uuid = await lock(start, name);
    } catch (error) {
      log.i(`${name} - already locked`);
      log.i(`${name} - ${error.message}`);
      return;
    }
    if (uuid) {
      try {
        const result = await action(start);
        const duration = Date.now() - start;
        await save(uuid, duration, null, result);
      } catch (error) {
        log.w(`${name} - DONE with error`, error.message);
        const duration = Date.now() - start;
        await save(uuid, duration, error.message);
      }
    }
  };
};
