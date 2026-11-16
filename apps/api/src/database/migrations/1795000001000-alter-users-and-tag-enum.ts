import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersAndTagEnum1795000001000 implements MigrationInterface {
  name = 'AlterUsersAndTagEnum1795000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM('fan', 'cosplayer', 'recruiter')
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD "username" character varying(60)
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'fan'
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD "show_online_status" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD "last_active_at" TIMESTAMP WITH TIME ZONE
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "notifications" SET DEFAULT '{"email": true, "system": true, "security": true, "notifyNewPost": true, "notifyInteractions": true, "notifyFestivals": false, "notifyBooking": true}'
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_user_username" ON "users" ("username") WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."entity_tags_entity_type_enum" ADD VALUE IF NOT EXISTS 'event'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."entity_tags_entity_type_enum" ADD VALUE IF NOT EXISTS 'job'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."entity_tags_entity_type_enum" ADD VALUE IF NOT EXISTS 'cosplayer_profile'
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."entity_tag_logs_entity_type_enum" ADD VALUE IF NOT EXISTS 'event'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."entity_tag_logs_entity_type_enum" ADD VALUE IF NOT EXISTS 'job'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."entity_tag_logs_entity_type_enum" ADD VALUE IF NOT EXISTS 'cosplayer_profile'
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."entity_tag_configs_entity_type_enum" ADD VALUE IF NOT EXISTS 'event'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."entity_tag_configs_entity_type_enum" ADD VALUE IF NOT EXISTS 'job'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."entity_tag_configs_entity_type_enum" ADD VALUE IF NOT EXISTS 'cosplayer_profile'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."UQ_user_username"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "notifications" SET DEFAULT '{"email": true, "system": true, "security": true}'
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "last_active_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "show_online_status"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "role"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "username"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."user_role_enum"
    `);
  }
}
