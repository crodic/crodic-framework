import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventApplicationsTable1795000019000 implements MigrationInterface {
  name = 'CreateEventApplicationsTable1795000019000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."event_application_status_enum" AS ENUM('pending', 'approved', 'rejected', 'cancelled')
    `);

    await queryRunner.query(`
      CREATE TABLE "event_applications" (
        "id" BIGSERIAL NOT NULL,
        "event_id" bigint NOT NULL,
        "applicant_user_id" bigint NOT NULL,
        "full_name" character varying(150) NOT NULL,
        "stage_name" character varying(150) NOT NULL,
        "category" character varying(120) NOT NULL,
        "phone" character varying(50) NOT NULL,
        "character_planned" character varying(255) NOT NULL,
        "portfolio_url" character varying(500),
        "notes" text,
        "status" "public"."event_application_status_enum" NOT NULL DEFAULT 'pending',
        "reviewed_by_admin_id" bigint,
        "reviewed_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_application_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_event_applications_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_event_applications_applicant_user_id" FOREIGN KEY ("applicant_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_event_applications_reviewed_by_admin_id" FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_event_applications_event_user_cat" ON "event_applications" ("event_id", "applicant_user_id", "category")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."UQ_event_applications_event_user_cat"`,
    );
    await queryRunner.query(`DROP TABLE "event_applications"`);
    await queryRunner.query(
      `DROP TYPE "public"."event_application_status_enum"`,
    );
  }
}
