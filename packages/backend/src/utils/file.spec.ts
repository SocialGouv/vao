import { Readable } from "node:stream";

import {
  decodeFilename,
  encodeFilename,
  getFileNameAndExtension,
  streamToBuffer,
} from "./file";

describe("utils/file", () => {
  describe("encodeFilename / decodeFilename", () => {
    it("devrait encoder puis décoder correctement un nom de fichier avec des caractères spéciaux", () => {
      const original = "fichier-éxemple 123.pdf";

      const encoded = encodeFilename(original);
      const decoded = decodeFilename(encoded);

      expect(encoded).toBe(Buffer.from(original, "latin1").toString("base64"));
      expect(decoded).toBe(original);
    });
  });

  describe("getFileNameAndExtension", () => {
    it("devrait séparer correctement le nom et l'extension lorsqu'il y a un point", () => {
      const result = getFileNameAndExtension("document.final.pdf");

      expect(result).toEqual({
        extension: ".pdf",
        name: "document.final",
      });
    });

    it("devrait retourner un nom sans extension lorsqu'il n'y a pas de point", () => {
      const result = getFileNameAndExtension("document");

      expect(result).toEqual({
        extension: "",
        name: "document",
      });
    });
  });

  describe("streamToBuffer", () => {
    it("devrait concaténer correctement les chunks d'un stream en Buffer", async () => {
      const stream = new Readable({
        read() {},
      });

      const part1 = "Bonjour ";
      const part2 = Buffer.from("le monde");

      stream.push(part1);
      stream.push(part2);
      stream.push(null);

      const result = await streamToBuffer(stream);

      expect(result).toEqual(Buffer.concat([Buffer.from(part1), part2]));
    });
  });
});
