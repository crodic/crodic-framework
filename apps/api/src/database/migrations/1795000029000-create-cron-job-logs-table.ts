import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCronJobLogsTable1795000029000 implements MigrationInterface {
  name = 'CreateCronJobLogsTable1795000029000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."cron_job_logs_status_enum" AS ENUM('RUNNING', 'SUCCESS', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cron_job_logs_trigger_type_enum" AS ENUM('SCHEDULED', 'MANUAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cron_job_logs" ("id" BIGSERIAL NOT NULL, "job_key" character varying(100) NOT NULL, "job_name" character varying(255) NOT NULL, "status" "public"."cron_job_logs_status_enum" NOT NULL DEFAULT 'RUNNING', "trigger_type" "public"."cron_job_logs_trigger_type_enum" NOT NULL DEFAULT 'SCHEDULED', "triggered_by_admin_id" bigint, "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "finished_at" TIMESTAMP WITH TIME ZONE, "duration_ms" integer, "summary" text, "error_message" text, "error_stack" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cron_job_log_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cron_job_logs_job_key" ON "cron_job_logs" ("job_key")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cron_job_logs_status" ON "cron_job_logs" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cron_job_logs_trigger_type" ON "cron_job_logs" ("trigger_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cron_job_logs_triggered_by" ON "cron_job_logs" ("triggered_by_admin_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cron_job_logs_started_at" ON "cron_job_logs" ("started_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cron_job_logs_started_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cron_job_logs_triggered_by"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cron_job_logs_trigger_type"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_cron_job_logs_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cron_job_logs_job_key"`);
    await queryRunner.query(`DROP TABLE "cron_job_logs"`);
    await queryRunner.query(
      `DROP TYPE "public"."cron_job_logs_trigger_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."cron_job_logs_status_enum"`);
  }
}
