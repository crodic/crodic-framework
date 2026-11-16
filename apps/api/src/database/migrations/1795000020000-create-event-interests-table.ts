import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventInterestsTable1795000020000 implements MigrationInterface {
  name = 'CreateEventInterestsTable1795000020000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "event_interests" (
        "id" BIGSERIAL NOT NULL,
        "event_id" bigint NOT NULL,
        "user_id" bigint NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_interest_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_event_interests_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_event_interests_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_event_interests_pair" ON "event_interests" ("event_id", "user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_event_interests_pair"`);
    await queryRunner.query(`DROP TABLE "event_interests"`);
  }
}
