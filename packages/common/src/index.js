function hello() {
  console.log("Hello from shared package!");
  return "hello world from common!";
}

module.exports = {
  hello: hello,
};
