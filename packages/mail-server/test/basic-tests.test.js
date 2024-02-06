const axios = require("axios");
const nock = require("nock");

const {
  beforeAll,
  beforeEach,
  describe,
  test,
  expect,
  afterEach,
  afterAll,
} = require("@jest/globals");

const { initializeWebServer, stopWebServer } = require("../app");

// Configuring file-level HTTP client with base URL will allow
// all the tests to approach with a shortened syntax
let axiosAPIClient;

beforeAll(async () => {
  // ️️️✅ Best Practice: Place the backend under test within the same process
  const apiConnection = await initializeWebServer();

  const axiosConfig = {
    baseURL: `http://127.0.0.1:${apiConnection.port}`,
    validateStatus: () => true, // Don't throw HTTP exceptions. Delegate to the tests to decide which error is acceptable
  };

  axiosAPIClient = axios.create(axiosConfig);

  // ️️️✅ Best Practice: Ensure that this component is isolated by preventing unknown calls
  const hostname = "127.0.0.1";
  nock.disableNetConnect();
  nock.enableNetConnect(hostname);

  // Some http clients swallow the "no match" error, so throw here for easy debugging
  nock.emitter.on("no match", (req) => {
    if (req.hostname !== hostname) {
      throw new Error(`Nock no match for: ${req.hostname}`);
    }
  });
});

beforeEach(() => {});

afterEach(() => {
  nock.cleanAll();
});

afterAll(async () => {
  // ️️️✅ Best Practice: Clean-up resources after each run
  nock.enableNetConnect();
  await stopWebServer();
});

// ️️️✅ Best Practice: Structure tests
describe("/api", () => {
  describe("POST /send", () => {
    test("When called with a correct body, Then email should be sent and receive 200 response", async () => {
      const body = {
        from: "titi@titi.me",
        to: "to@to.me",
        subject: "subject here",
        html: "payload here",
      };

      const response = await axiosAPIClient.post(`/api/mail`, body);

      expect(response).toMatchObject({
        status: 200,
        data: {
          message: expect.any(String),
        },
      });
    });

    test("When called with a correct body via list recipients, Then email should be sent and receive 200 response", async () => {
      const body = {
        from: "titi@titi.me",
        to: ["to@to.me", "to@ti.me"],
        subject: "subject here",
        html: "payload here",
      };

      const response = await axiosAPIClient.post(`/api/mail`, body);

      expect(response).toMatchObject({
        status: 200,
        data: {
          message: expect.any(String),
        },
      });
    });

    test("When called with a correct body to only cc recipients, Then email should be sent and receive 200 response", async () => {
      const body = {
        from: "titi@titi.me",
        cc: ["cc@to.me", "cc@ti.me"],
        subject: "subject here",
        html: "payload here",
      };

      const response = await axiosAPIClient.post(`/api/mail`, body);

      expect(response).toMatchObject({
        status: 200,
        data: {
          message: expect.any(String),
        },
      });
    });

    test("When called with missing body, Then should receive 423 response", async () => {
      const response = await axiosAPIClient.post(`/api/mail`);

      expect(response.status).toBe(423);
    });

    test("When called with missing param in body, Then should receive 423 response", async () => {
      const body = {};
      const response = await axiosAPIClient.post(`/api/mail`, body);

      expect(response.status).toBe(423);
    });

    test("When called with a body without recipients, Then email should not be sent and receive 423 response", async () => {
      const body = {
        from: "titi@titi.me",
        subject: "subject here",
        html: "payload here",
      };

      const response = await axiosAPIClient.post(`/api/mail`, body);

      expect(response.status).toBe(423);
    });
  });
});
