import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventParticipantsTable1795000018000 implements MigrationInterface {
  name = 'CreateEventParticipantsTable1795000018000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "event_participants" (
        "id" BIGSERIAL NOT NULL,
        "event_id" bigint NOT NULL,
        "user_id" bigint,
        "name" character varying(150) NOT NULL,
        "avatar_url" character varying(500) NOT NULL,
        "is_verified" boolean NOT NULL DEFAULT false,
        "role_label" character varying(100),
        "sort_order" smallint NOT NULL DEFAULT '0',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_participant_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_event_participants_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_event_participants_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_event_participants_event_sort" ON "event_participants" ("event_id", "sort_order")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_event_participants_event_user" ON "event_participants" ("event_id", "user_id") WHERE "user_id" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."UQ_event_participants_event_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_event_participants_event_sort"`,
    );
    await queryRunner.query(`DROP TABLE "event_participants"`);
  }
}
