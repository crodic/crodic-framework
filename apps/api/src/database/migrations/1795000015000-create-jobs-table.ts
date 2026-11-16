import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobsTable1795000015000 implements MigrationInterface {
  name = 'CreateJobsTable1795000015000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."job_category_enum" AS ENUM('lookbook', 'event', 'crafting', 'game_ads')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."job_status_enum" AS ENUM('draft', 'pending_approval', 'open', 'closed', 'expired')
    `);

    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id" BIGSERIAL NOT NULL,
        "slug" character varying(220) NOT NULL,
        "brand_id" bigint,
        "poster_user_id" bigint,
        "created_by_admin_id" bigint,
        "brand_name" character varying(160) NOT NULL,
        "brand_logo_url" character varying(500),
        "brand_logo_file_id" bigint,
        "brand_initials" character varying(10),
        "brand_color" character varying(60) DEFAULT 'bg-primary',
        "is_verified" boolean NOT NULL DEFAULT false,
        "title" character varying(255) NOT NULL,
        "category_code" "public"."job_category_enum" NOT NULL,
        "category_label" character varying(100) NOT NULL,
        "budget_label" character varying(120) NOT NULL,
        "budget_min" numeric(14,2),
        "budget_max" numeric(14,2),
        "location_label" character varying(120) NOT NULL,
        "location_filter_code" character varying(30),
        "city_id" bigint,
        "deadline_label" character varying(50) NOT NULL,
        "deadline_at" TIMESTAMP WITH TIME ZONE,
        "requirements" text NOT NULL,
        "description" text NOT NULL,
        "perks" jsonb NOT NULL DEFAULT '[]',
        "filter_tags" jsonb NOT NULL DEFAULT '[]',
        "contact_email" character varying(255) NOT NULL,
        "thumbnail_url" character varying(500),
        "is_featured" boolean NOT NULL DEFAULT false,
        "status" "public"."job_status_enum" NOT NULL DEFAULT 'pending_approval',
        "applications_count" integer NOT NULL DEFAULT '0',
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_job_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_jobs_brand_id" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_jobs_poster_user_id" FOREIGN KEY ("poster_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_jobs_created_by_admin_id" FOREIGN KEY ("created_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_jobs_brand_logo_file_id" FOREIGN KEY ("brand_logo_file_id") REFERENCES "files"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_jobs_city_id" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_jobs_deadline" ON "jobs" ("status", "deadline_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_jobs_featured" ON "jobs" ("status", "is_featured", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_jobs_listing" ON "jobs" ("status", "category_code", "location_filter_code", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_jobs_brand_id" ON "jobs" ("brand_id")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_jobs_slug" ON "jobs" ("slug") WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_jobs_slug"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_jobs_brand_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_jobs_listing"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_jobs_featured"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_jobs_deadline"`);
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TYPE "public"."job_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_category_enum"`);
  }
}
