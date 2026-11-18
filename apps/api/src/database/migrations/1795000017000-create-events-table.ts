import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsTable1795000017000 implements MigrationInterface {
  name = 'CreateEventsTable1795000017000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."event_status_enum" AS ENUM('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')
    `);

    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" BIGSERIAL NOT NULL,
        "slug" character varying(200) NOT NULL,
        "title" character varying(220) NOT NULL,
        "start_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_at" TIMESTAMP WITH TIME ZONE,
        "location_label" character varying(100) NOT NULL,
        "city_id" bigint,
        "venue" character varying(255) NOT NULL,
        "image_file_id" bigint,
        "image_url" character varying(500) NOT NULL,
        "banner_image_url" character varying(500),
        "description" text NOT NULL,
        "ticket_price_amount" integer,
        "is_recruiting" boolean NOT NULL DEFAULT false,
        "is_featured_festival" boolean NOT NULL DEFAULT false,
        "schedule" jsonb NOT NULL DEFAULT '[]',
        "categories" jsonb NOT NULL DEFAULT '[]',
        "status" "public"."event_status_enum" NOT NULL DEFAULT 'upcoming',
        "participants_count" integer NOT NULL DEFAULT '0',
        "applications_count" integer NOT NULL DEFAULT '0',
        "interested_count" integer NOT NULL DEFAULT '0',
        "organizer_user_id" bigint,
        "organizer_name" character varying(160),
        "created_by_admin_id" bigint,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_events_city_id" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_events_image_file_id" FOREIGN KEY ("image_file_id") REFERENCES "files"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_events_organizer_user_id" FOREIGN KEY ("organizer_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_events_created_by_admin_id" FOREIGN KEY ("created_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_events_recruiting" ON "events" ("is_recruiting", "start_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_events_featured" ON "events" ("is_featured_festival", "start_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_events_status_start" ON "events" ("status", "start_at")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_events_slug" ON "events" ("slug") WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_events_slug"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_events_status_start"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_events_featured"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_events_recruiting"`);
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TYPE "public"."event_status_enum"`);
  }
}
