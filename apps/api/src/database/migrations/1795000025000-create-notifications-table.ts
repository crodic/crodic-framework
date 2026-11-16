import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1795000025000 implements MigrationInterface {
  name = 'CreateNotificationsTable1795000025000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."notification_category_enum" AS ENUM('social', 'booking', 'system')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."notification_type_enum" AS ENUM('like', 'comment', 'follow', 'booking_request', 'booking_accepted', 'job_approved', 'badge_awarded', 'security')
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" BIGSERIAL NOT NULL,
        "recipient_user_id" bigint NOT NULL,
        "category" "public"."notification_category_enum" NOT NULL,
        "type" "public"."notification_type_enum" NOT NULL,
        "actor_user_id" bigint,
        "actor_name" character varying(120),
        "actor_avatar_url" character varying(500),
        "actor_role" character varying(80),
        "actor_is_verified" boolean NOT NULL DEFAULT false,
        "title" character varying(220) NOT NULL,
        "description" text NOT NULL,
        "action_url" character varying(300),
        "action_label" character varying(80),
        "secondary_action_label" character varying(80),
        "preview_image_url" character varying(500),
        "subject_type" character varying(50),
        "subject_id" bigint,
        "is_read" boolean NOT NULL DEFAULT false,
        "read_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_notification_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_recipient_user_id" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_notifications_actor_user_id" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_inbox" ON "notifications" ("recipient_user_id", "is_read", "category", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_subject" ON "notifications" ("subject_type", "subject_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_subject"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_inbox"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notification_category_enum"`);
  }
}
