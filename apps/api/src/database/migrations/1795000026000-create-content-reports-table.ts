import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContentReportsTable1795000026000 implements MigrationInterface {
  name = 'CreateContentReportsTable1795000026000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."report_target_type_enum" AS ENUM('post', 'user', 'comment', 'event')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."report_status_enum" AS ENUM('pending', 'reviewing', 'resolved', 'dismissed')
    `);

    await queryRunner.query(`
      CREATE TABLE "content_reports" (
        "id" BIGSERIAL NOT NULL,
        "reporter_user_id" bigint NOT NULL,
        "target_type" "public"."report_target_type_enum" NOT NULL,
        "target_id" bigint NOT NULL,
        "reason" character varying(120) NOT NULL,
        "description" text,
        "status" "public"."report_status_enum" NOT NULL DEFAULT 'pending',
        "resolved_by_admin_id" bigint,
        "resolution_note" text,
        "resolved_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_content_report_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_content_reports_reporter_user_id" FOREIGN KEY ("reporter_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_content_reports_resolved_by_admin_id" FOREIGN KEY ("resolved_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_content_reports_moderation" ON "content_reports" ("status", "target_type", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_content_reports_target" ON "content_reports" ("target_type", "target_id")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_content_reports_reporter_target" ON "content_reports" ("reporter_user_id", "target_type", "target_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."UQ_content_reports_reporter_target"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_content_reports_target"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_content_reports_moderation"`,
    );
    await queryRunner.query(`DROP TABLE "content_reports"`);
    await queryRunner.query(`DROP TYPE "public"."report_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."report_target_type_enum"`);
  }
}
