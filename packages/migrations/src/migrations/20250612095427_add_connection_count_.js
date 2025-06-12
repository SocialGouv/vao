/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE TABLE back.login_attempts (
        id SERIAL PRIMARY KEY,
        mail VARCHAR(320) NOT NULL,
        ip_address VARCHAR(45),
        attempt_at TIMESTAMP DEFAULT NOW(),
        attempt_count INTEGER DEFAULT 0
    );
    CREATE INDEX idx_back_login_attempts_mail ON back.login_attempts(mail);

    CREATE TABLE front.login_attempts (
        id SERIAL PRIMARY KEY,
        mail VARCHAR(320) NOT NULL,
        ip_address VARCHAR(45),
        attempt_at TIMESTAMP DEFAULT NOW(),
        attempt_count INTEGER DEFAULT 0
    );
    CREATE INDEX idx_front_login_attempts_mail ON front.login_attempts(mail);

    GRANT ALL ON TABLE back.login_attempts TO vao_u;
    GRANT ALL ON SEQUENCE back.login_attempts_id_seq TO vao_u;
    GRANT ALL ON TABLE front.login_attempts TO vao_u;
    GRANT ALL ON SEQUENCE front.login_attempts_id_seq TO vao_u;
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TABLE back.login_attempts;
    DROP TABLE front.login_attempts;
`);
};
