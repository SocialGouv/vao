// Jest runs on Node 22.x in this repo.
// Some transitive dependencies (via jsonwebtoken -> jws -> jwa -> buffer-equal-constant-time)
// still expect `require('buffer').SlowBuffer` to exist.
// Node 22 no longer exposes it, so we polyfill it for tests.
//
// This stays test-only (jest setup) to avoid impacting runtime behavior.
const buffer = require("buffer");
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}

process.env.PG_VAO_CIPHER_DATA =
  "e14de305fbac8f2ed5ab96ce9659265625db31d01ea9d5b7a20b5f985612a054";
process.env.DEBUG = "info:vao*, debug:vao*";
