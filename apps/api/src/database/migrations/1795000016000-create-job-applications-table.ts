import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobApplicationsTable1795000016000 implements MigrationInterface {
  name = 'CreateJobApplicationsTable1795000016000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."job_application_status_enum" AS ENUM('pending', 'reviewing', 'approved', 'rejected', 'withdrawn')
    `);

    await queryRunner.query(`
      CREATE TABLE "job_applications" (
        "id" BIGSERIAL NOT NULL,
        "job_id" bigint NOT NULL,
        "applicant_user_id" bigint NOT NULL,
        "full_name" character varying(120) NOT NULL,
        "stage_name" character varying(120) NOT NULL,
        "contact_info" character varying(120) NOT NULL,
        "portfolio_url" character varying(300),
        "experience" text NOT NULL,
        "message" text,
        "status" "public"."job_application_status_enum" NOT NULL DEFAULT 'pending',
        "reviewer_note" text,
        "reviewed_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_job_application_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_job_applications_job_id" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_job_applications_applicant_user_id" FOREIGN KEY ("applicant_user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_job_applications_applicant" ON "job_applications" ("applicant_user_id", "created_at")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_job_applications_job_applicant" ON "job_applications" ("job_id", "applicant_user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."UQ_job_applications_job_applicant"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_job_applications_applicant"`,
    );
    await queryRunner.query(`DROP TABLE "job_applications"`);
    await queryRunner.query(`DROP TYPE "public"."job_application_status_enum"`);
  }
}
