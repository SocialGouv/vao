const mockVerify = jest.fn();
const mockTransporter = { verify: mockVerify };
const mockCreateTransport = jest.fn(() => mockTransporter);

jest.mock("nodemailer", () => ({
  createTransport: mockCreateTransport,
}));

const mockSmtpConfig = {
  auth: {
    pass: "password",
    user: "user@example.com" as string | undefined,
  },
  host: "smtp.example.com",
  pool: true,
  port: 587,
  secure: false,
};

jest.mock("../../config", () => ({
  config: {
    get smtp() {
      return mockSmtpConfig;
    },
  },
}));

function loadTransporterModule() {
  let transporterModule: typeof import("./transporter");

  jest.isolateModules(() => {
    transporterModule = require("./transporter");
  });

  return transporterModule!;
}

describe("transporter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSmtpConfig.auth.user = "user@example.com";
  });

  describe("getTransporter", () => {
    it("creates a transporter with smtp auth settings", () => {
      const { getTransporter } = loadTransporterModule();

      const transporter = getTransporter();

      expect(mockCreateTransport).toHaveBeenCalledWith({
        auth: {
          pass: "password",
          user: "user@example.com",
        },
        host: "smtp.example.com",
        pool: true,
        port: 587,
        secure: false,
      });
      expect(transporter).toBe(mockTransporter);
    });

    it("returns the same transporter instance on subsequent calls", () => {
      const { getTransporter } = loadTransporterModule();

      const first = getTransporter();
      const second = getTransporter();

      expect(first).toBe(second);
      expect(mockCreateTransport).toHaveBeenCalledTimes(1);
    });

    it("omits auth when smtp user is undefined", () => {
      mockSmtpConfig.auth.user = undefined;
      const { getTransporter } = loadTransporterModule();

      getTransporter();

      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: "smtp.example.com",
        pool: true,
        port: 587,
        secure: false,
      });
    });
  });

  describe("verifyConnection", () => {
    it("verifies the transporter connection", async () => {
      mockVerify.mockResolvedValueOnce(true);
      const { verifyConnection } = loadTransporterModule();

      await verifyConnection();

      expect(mockVerify).toHaveBeenCalledTimes(1);
    });

    it("throws an AppError when verification fails", async () => {
      mockVerify.mockRejectedValueOnce(new Error("connection refused"));
      const { verifyConnection } = loadTransporterModule();

      await expect(verifyConnection()).rejects.toMatchObject({
        message: "erreur lors de la connexion",
        name: "mailserver-connection-failed",
      });
    });
  });
});
