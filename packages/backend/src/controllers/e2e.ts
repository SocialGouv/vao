import { NextFunction, Request, Response } from "express";
import { PoolClient } from "pg";

import { config } from "../config";
import AppError from "../utils/error";
import { logger } from "../utils/logger";
import { withTransaction } from "../utils/pgpool";

const log = logger(module.filename);

const E2E_BO_USER_EMAIL = "tnra.agent.idf@example.com";

export async function resetE2e(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (config.sentry.environment === "production") {
    return next(
      new AppError("NOT_FOUND", {
        name: "NOT_FOUND",
        statusCode: 404,
      }),
    );
  }

  try {
    await withTransaction(async (tx: PoolClient) => {
      // check if tnra.agent.idf@example.com back.user exists
      const { rows: userRows } = await tx.query(
        `
          SELECT COUNT(*) AS count FROM back.users WHERE mail = $1
        `,
        [E2E_BO_USER_EMAIL],
      );
      let insertedUserCount = 0;
      if (Number(userRows[0].count) === 0) {
        // and create user with role in one query
        await tx.query(
          `
          WITH new_user AS (
            INSERT INTO back.users (
              validated,
              mail,
              prenom,
              nom,
              pwd,
              ter_code,
              enddate
            )
            VALUES (
              true,
              $1,
              'IDF',
              'TNRA',
              crypt('Azertyuiop1!', gen_salt('bf')),
              'IDF',
              now()
            )
            RETURNING id
          )
          INSERT INTO back.user_roles (use_id, rol_id)
          SELECT id, rol_id
          FROM new_user
          CROSS JOIN (VALUES (1), (4), (5), (6), (7)) AS roles(rol_id);
        `,
          [E2E_BO_USER_EMAIL],
        );
        insertedUserCount++;
        console.log("insertedUserCount", insertedUserCount);
      } else {
        console.log("user already exists");
      }

      log.i("reset - Update fiche_territoire");
      await tx.query(
        `
        UPDATE back.fiche_territoire
        SET service_mail = $1
        WHERE service_mail IS NULL
      `,
        ["tnra@example.com"],
      );

      log.i("reset - Update users (cgu_accepted)");
      await tx.query(
        `
        UPDATE back.users
        SET cgu_accepted = TRUE
        WHERE mail LIKE $1
      `,
        ["tnra%@example.com"],
      );

      const { rows: testsUsers } = await tx.query(`
        SELECT id
        FROM front.users
        WHERE mail LIKE '%e2e-%@test.com'
          OR mail LIKE '%e2e-%@example.com'
          OR mail LIKE 'tnra-%@example.com'
      `);
      const testsUserIds: number[] = testsUsers.map(
        ({ id }: { id: number }) => id,
      );

      log.i(`reset - ${testsUserIds.length} tests users found`);

      if (testsUserIds.length === 0) {
        return res.status(200).json({
          deletedOrganismesCount: 0,
          deletedUsersCount: 0,
          deletedUsersForcedCount: 0,
          insertedUserCount,
        });
      }

      const { rows: organismes } = await tx.query(
        `
        SELECT DISTINCT org_id
        FROM front.user_organisme
        WHERE use_id = ANY($1::int[])
      `,
        [testsUserIds],
      );

      for (const { org_id: orgId } of organismes) {
        await tx.query("CALL vao_supprimer_organisme($1, $2)", [orgId, true]);
      }

      const { rowCount: deletedUsersForcedCount } = await tx.query(
        `
        DELETE FROM front.users
        WHERE id = ANY($1::int[])
      `,
        [testsUserIds],
      );

      log.i("reset - DONE");
      return res.status(200).json({
        deletedOrganismesCount: organismes.length,
        deletedUsersCount: testsUserIds.length,
        deletedUsersForcedCount,
        insertedUserCount,
      });
    });
  } catch (error) {
    log.w("reset - FAILED", error);
    return next(error);
  }
}
