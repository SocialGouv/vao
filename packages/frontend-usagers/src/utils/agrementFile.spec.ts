import { FILE_CATEGORY, type AgrementDto } from "@vao/shared-bridge";
import { describe, it, expect } from "vitest";

import { getFileByCategory } from "./agrementFile";

describe("getFileByCategory", () => {
  it("deduplicates files for single categories and keeps new file", () => {
    const agrementEnTraitement = {
      agrementFiles: [
        {
          name: "existing.pdf",
          uuid: "existing-a1",
          fileUuid: "existing-a1",
          category: FILE_CATEGORY.ASSURRAPAT,
          agrementId: 23,
        },
        {
          name: "existing.pdf",
          uuid: "existing-b1",
          fileUuid: "existing-b1",
          category: FILE_CATEGORY.BILANQUALIT,
          agrementId: 23,
        },
      ],
    } as unknown as AgrementDto;

    const agrementUpdated = {
      agrementFiles: [
        {
          name: "existing.pdf",
          uuid: "existing-a1",
          fileUuid: "existing-a1",
          category: FILE_CATEGORY.ASSURRAPAT,
          agrementId: 23,
        },
        {
          name: "uploaded.pdf",
          uuid: "uploaded-a2",
          fileUuid: "uploaded-a2",
          category: FILE_CATEGORY.ASSURRAPAT,
          agrementId: 23,
        },
      ],
    };

    const result = getFileByCategory(agrementEnTraitement, agrementUpdated);

    expect(result).toEqual([
      {
        name: "uploaded.pdf",
        uuid: "uploaded-a2",
        fileUuid: "uploaded-a2",
        category: FILE_CATEGORY.ASSURRAPAT,
        agrementId: 23,
      },
      {
        name: "existing.pdf",
        uuid: "existing-b1",
        fileUuid: "existing-b1",
        category: FILE_CATEGORY.BILANQUALIT,
        agrementId: 23,
      },
    ]);
  });

  it("deduplicates files for single categories and keeps new file (without order)", () => {
    const agrementEnTraitement = {
      agrementFiles: [
        {
          name: "existing.pdf",
          uuid: "existing-a",
          fileUuid: "existing-a",
          category: FILE_CATEGORY.ASSURRAPAT,
          agrementId: 23,
        },
      ],
    } as unknown as AgrementDto;

    const agrementUpdated = {
      agrementFiles: [
        {
          name: "uploaded.pdf",
          uuid: "uploaded-a",
          fileUuid: "uploaded-a",
          category: FILE_CATEGORY.ASSURRAPAT,
          agrementId: 23,
        },
        {
          name: "existing.pdf",
          uuid: "existing-a",
          fileUuid: "existing-a",
          category: FILE_CATEGORY.ASSURRAPAT,
          agrementId: 23,
        },
      ],
    };

    const result = getFileByCategory(agrementEnTraitement, agrementUpdated);

    expect(result).toEqual([
      {
        name: "uploaded.pdf",
        uuid: "uploaded-a",
        fileUuid: "uploaded-a",
        category: FILE_CATEGORY.ASSURRAPAT,
        agrementId: 23,
      },
    ]);
  });

  it("deduplicates files for single categories and keeps existing files without change", () => {
    const agrementEnTraitement = {
      agrementFiles: [
        {
          name: "existing.pdf",
          uuid: "existing-a",
          fileUuid: "existing-a",
          category: FILE_CATEGORY.ASSURRAPAT,
          agrementId: 23,
        },
      ],
    } as unknown as AgrementDto;

    const agrementUpdated = {
      agrementFiles: [
        {
          name: "existing.pdf",
          uuid: "existing-a",
          fileUuid: "existing-a",
          category: FILE_CATEGORY.ASSURRAPAT,
          agrementId: 23,
        },
      ],
    };

    const result = getFileByCategory(agrementEnTraitement, agrementUpdated);

    expect(result).toEqual([
      {
        name: "existing.pdf",
        uuid: "existing-a",
        fileUuid: "existing-a",
        category: FILE_CATEGORY.ASSURRAPAT,
        agrementId: 23,
      },
    ]);
  });

  it("deduplicates files for single categories and remove existing files", () => {
    const agrementEnTraitement = {
      agrementFiles: [
        {
          name: "existing.pdf",
          uuid: "existing-a",
          fileUuid: "existing-a",
          category: FILE_CATEGORY.ASSURRAPAT,
          agrementId: 23,
        },
      ],
    } as unknown as AgrementDto;

    const agrementUpdated = {
      agrementFiles: [],
    };

    const result = getFileByCategory(agrementEnTraitement, agrementUpdated);

    expect(result).toEqual([]);
  });

  it("deduplicates files for multiple categories and keeps existing files", () => {
    const agrementEnTraitement = {
      agrementFiles: [
        {
          name: "existing-a.pdf",
          uuid: "existing-a",
          fileUuid: "existing-a",
          category: FILE_CATEGORY.CHANGEEVOL,
          agrementId: 23,
        },
        {
          name: "existing-b.pdf",
          uuid: "existing-b",
          fileUuid: "existing-b",
          category: FILE_CATEGORY.CHANGEEVOL,
          agrementId: 23,
        },
      ],
    } as unknown as AgrementDto;

    const agrementUpdated = {
      agrementFiles: [
        {
          name: "existing-a.pdf",
          uuid: "existing-a",
          fileUuid: "existing-a",
          category: FILE_CATEGORY.CHANGEEVOL,
          agrementId: 23,
        },
        {
          name: "existing-b.pdf",
          uuid: "existing-b",
          fileUuid: "existing-b",
          category: FILE_CATEGORY.CHANGEEVOL,
          agrementId: 23,
        },
        {
          name: "updated-c.pdf",
          uuid: "updated-c",
          fileUuid: "updated-c",
          category: FILE_CATEGORY.CHANGEEVOL,
          agrementId: 23,
        },
      ],
    };

    const result = getFileByCategory(agrementEnTraitement, agrementUpdated);

    expect(result).toEqual([
      {
        name: "existing-a.pdf",
        uuid: "existing-a",
        fileUuid: "existing-a",
        category: FILE_CATEGORY.CHANGEEVOL,
        agrementId: 23,
      },
      {
        name: "existing-b.pdf",
        uuid: "existing-b",
        fileUuid: "existing-b",
        category: FILE_CATEGORY.CHANGEEVOL,
        agrementId: 23,
      },
      {
        name: "updated-c.pdf",
        uuid: "updated-c",
        fileUuid: "updated-c",
        category: FILE_CATEGORY.CHANGEEVOL,
        agrementId: 23,
      },
    ]);
  });

  it("deduplicates files for multiple categories and delete existing files", () => {
    const agrementEnTraitement = {
      agrementFiles: [
        {
          name: "existing-a.pdf",
          uuid: "existing-a",
          fileUuid: "existing-a",
          category: FILE_CATEGORY.CHANGEEVOL,
          agrementId: 23,
        },
        {
          name: "existing-b.pdf",
          uuid: "existing-b",
          fileUuid: "existing-b",
          category: FILE_CATEGORY.CHANGEEVOL,
          agrementId: 23,
        },
        {
          name: "existing-c.pdf",
          uuid: "existing-c",
          fileUuid: "existing-c",
          category: FILE_CATEGORY.CHANGEEVOL,
          agrementId: 23,
        },
      ],
    } as unknown as AgrementDto;

    const agrementUpdated = {
      agrementFiles: [
        {
          name: "existing-a.pdf",
          uuid: "existing-a",
          fileUuid: "existing-a",
          category: FILE_CATEGORY.CHANGEEVOL,
          agrementId: 23,
        },
        {
          name: "existing-c.pdf",
          uuid: "existing-c",
          fileUuid: "existing-c",
          category: FILE_CATEGORY.CHANGEEVOL,
          agrementId: 23,
        },
      ],
    };

    const result = getFileByCategory(agrementEnTraitement, agrementUpdated);

    expect(result).toEqual([
      {
        name: "existing-a.pdf",
        uuid: "existing-a",
        fileUuid: "existing-a",
        category: FILE_CATEGORY.CHANGEEVOL,
        agrementId: 23,
      },
      {
        name: "existing-c.pdf",
        uuid: "existing-c",
        fileUuid: "existing-c",
        category: FILE_CATEGORY.CHANGEEVOL,
        agrementId: 23,
      },
    ]);
  });

  it("deduplicates files for multiple categories and keeps existing files", () => {
    const agrementEnTraitement = {
      agrementFiles: [
        {
          name: "existing.pdf",
          uuid: "existing-a",
          fileUuid: "existing-a",
          category: FILE_CATEGORY.ASSURRESP,
          agrementId: 23,
        },
      ],
    } as unknown as AgrementDto;

    const agrementUpdated = {
      agrementFiles: [
        {
          name: "existing.pdf",
          uuid: "existing-a",
          fileUuid: "existing-a",
          category: FILE_CATEGORY.ASSURRAPAT,
          agrementId: 23,
        },
      ],
    };

    const result = getFileByCategory(agrementEnTraitement, agrementUpdated);

    expect(result).toEqual([
      {
        name: "existing.pdf",
        uuid: "existing-a",
        fileUuid: "existing-a",
        category: FILE_CATEGORY.ASSURRAPAT,
        agrementId: 23,
      },
    ]);
  });
});
