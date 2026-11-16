import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserFollowsTable1795000010000 implements MigrationInterface {
  name = 'CreateUserFollowsTable1795000010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_follows" (
        "id" BIGSERIAL NOT NULL,
        "follower_id" bigint NOT NULL,
        "following_id" bigint NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_follow_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_follows_follower_id" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_follows_following_id" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_follows_follower" ON "user_follows" ("follower_id", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_user_follows_following" ON "user_follows" ("following_id", "created_at")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_user_follows_pair" ON "user_follows" ("follower_id", "following_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_user_follows_pair"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_follows_following"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_follows_follower"`);
    await queryRunner.query(`DROP TABLE "user_follows"`);
  }
}
