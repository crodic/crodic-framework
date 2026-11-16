import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingRequestsTable1795000021000 implements MigrationInterface {
  name = 'CreateBookingRequestsTable1795000021000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."booking_request_status_enum" AS ENUM('pending', 'accepted', 'declined', 'completed', 'cancelled')
    `);

    await queryRunner.query(`
      CREATE TABLE "booking_requests" (
        "id" BIGSERIAL NOT NULL,
        "target_cosplayer_id" bigint NOT NULL,
        "requester_user_id" bigint NOT NULL,
        "booking_type" character varying(150) NOT NULL,
        "full_name" character varying(150) NOT NULL,
        "contact_info" character varying(150) NOT NULL,
        "target_date_label" character varying(100) NOT NULL,
        "budget_label" character varying(120) NOT NULL,
        "details" text NOT NULL,
        "status" "public"."booking_request_status_enum" NOT NULL DEFAULT 'pending',
        "response_note" text,
        "responded_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_booking_request_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booking_requests_target_cosplayer_id" FOREIGN KEY ("target_cosplayer_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booking_requests_requester_user_id" FOREIGN KEY ("requester_user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_booking_requests_target_status" ON "booking_requests" ("target_cosplayer_id", "status", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_booking_requests_requester" ON "booking_requests" ("requester_user_id", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_booking_requests_requester"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_booking_requests_target_status"`,
    );
    await queryRunner.query(`DROP TABLE "booking_requests"`);
    await queryRunner.query(`DROP TYPE "public"."booking_request_status_enum"`);
  }
}
