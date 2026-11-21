import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUserRoleAndCreateCosplayerApplications1795000028000 implements MigrationInterface {
  name = 'DropUserRoleAndCreateCosplayerApplications1795000028000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop role column from users and user_role_enum
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "role"
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."user_role_enum"
    `);

    // 2. Create cosplayer_application_status_enum
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cosplayer_application_status_enum') THEN
          CREATE TYPE "public"."cosplayer_application_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED');
        END IF;
      END$$;
    `);

    // 3. Create cosplayer_applications table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cosplayer_applications" (
        "id" BIGSERIAL NOT NULL,
        "user_id" bigint NOT NULL,
        "stage_name" character varying(100) NOT NULL,
        "bio" text NOT NULL,
        "social_links" jsonb,
        "portfolio_urls" text array,
        "status" "public"."cosplayer_application_status_enum" NOT NULL DEFAULT 'PENDING',
        "rejection_reason" text,
        "reviewed_by_id" bigint,
        "reviewed_at" TIMESTAMP WITH TIME ZONE,
        "admin_notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cosplayer_application_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cosplayer_applications_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cosplayer_applications_reviewed_by_id" FOREIGN KEY ("reviewed_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cosplayer_applications_user_id" ON "cosplayer_applications" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cosplayer_applications_status" ON "cosplayer_applications" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "cosplayer_applications"
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."cosplayer_application_status_enum"
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM('fan', 'cosplayer')
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'fan'
    `);
  }
}
