import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDirectMessagesTable1795000022000 implements MigrationInterface {
  name = 'CreateDirectMessagesTable1795000022000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "direct_messages" (
        "id" BIGSERIAL NOT NULL,
        "sender_id" bigint NOT NULL,
        "recipient_id" bigint NOT NULL,
        "content" text NOT NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "read_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_direct_message_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_direct_messages_sender_id" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_direct_messages_recipient_id" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_direct_messages_recipient_unread" ON "direct_messages" ("recipient_id", "is_read", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_direct_messages_recipient_unread"`,
    );
    await queryRunner.query(`DROP TABLE "direct_messages"`);
  }
}
