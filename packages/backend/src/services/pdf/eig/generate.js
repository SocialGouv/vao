const logger = require("../../../utils/logger");
const build = require("./build");

const log = logger(module.filename);

const generate = async ({ eig, serviceRegional }) => {
  log.i("IN");
  try {
    const file = await build({
      eig,
      serviceRegional,
    });
    return file;
  } catch (e) {
    log.w(e);
    return null;
  }
};

module.exports = generate;
