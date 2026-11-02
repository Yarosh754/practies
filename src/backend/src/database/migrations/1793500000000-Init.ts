import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1793500000000 implements MigrationInterface {
  name = 'Init1793500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS app');

    await queryRunner.query(`
      CREATE TABLE app.ads (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(30) NOT NULL,
        description VARCHAR(1000) NOT NULL,
        price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
        category_id VARCHAR(64) NOT NULL,
        location VARCHAR(64) NOT NULL,
        status VARCHAR(16) NOT NULL DEFAULT 'MODERATION'
          CHECK (status IN ('MODERATION','ACTIVE','SOLD','DELETE','REJECTED')),
        images JSONB NOT NULL DEFAULT '[]'::jsonb,
        author_id VARCHAR(255) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      'CREATE INDEX idx_ads_status_created ON app.ads (status, created_at DESC)',
    );
    await queryRunner.query('CREATE INDEX idx_ads_author ON app.ads (author_id)');
    await queryRunner.query('CREATE INDEX idx_ads_category ON app.ads (category_id)');
    await queryRunner.query('CREATE INDEX idx_ads_location ON app.ads (location)');

    await queryRunner.query(`
      CREATE TABLE app.favorites (
        username VARCHAR(255) NOT NULL,
        ad_id BIGINT NOT NULL REFERENCES app.ads(id) ON DELETE CASCADE,
        PRIMARY KEY (username, ad_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE app.chat_messages (
        id BIGSERIAL PRIMARY KEY,
        chat_id VARCHAR(512) NOT NULL,
        sender_id VARCHAR(255) NOT NULL,
        text VARCHAR(2000) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        is_read BOOLEAN NOT NULL DEFAULT false
      )
    `);
    await queryRunner.query(
      'CREATE INDEX idx_chat_messages_chat ON app.chat_messages (chat_id, created_at)',
    );

    await queryRunner.query(`
      CREATE TABLE app.notifications (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(512),
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      'CREATE INDEX idx_notifications_user ON app.notifications (username, created_at DESC)',
    );

    await queryRunner.query(`
      CREATE TABLE app.images (
        id UUID PRIMARY KEY,
        mime_type VARCHAR(64) NOT NULL,
        data BYTEA NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS app.images');
    await queryRunner.query('DROP TABLE IF EXISTS app.notifications');
    await queryRunner.query('DROP TABLE IF EXISTS app.chat_messages');
    await queryRunner.query('DROP TABLE IF EXISTS app.favorites');
    await queryRunner.query('DROP TABLE IF EXISTS app.ads');
  }
}
