import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostLikesTable1795000007000 implements MigrationInterface {
  name = 'CreatePostLikesTable1795000007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "post_likes" (
        "id" BIGSERIAL NOT NULL,
        "post_id" bigint NOT NULL,
        "user_id" bigint NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_post_like_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_post_likes_post_id" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_likes_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_post_likes_created" ON "post_likes" ("created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_post_likes_user_created" ON "post_likes" ("user_id", "created_at")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_post_likes_post_user" ON "post_likes" ("post_id", "user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_post_likes_post_user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_post_likes_user_created"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_post_likes_created"`);
    await queryRunner.query(`DROP TABLE "post_likes"`);
  }
}
