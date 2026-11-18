import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostCommentLikesTable1795000009000 implements MigrationInterface {
  name = 'CreatePostCommentLikesTable1795000009000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "post_comment_likes" (
        "id" BIGSERIAL NOT NULL,
        "comment_id" bigint NOT NULL,
        "user_id" bigint NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_post_comment_like_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_post_comment_likes_comment_id" FOREIGN KEY ("comment_id") REFERENCES "post_comments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_comment_likes_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_post_comment_likes_pair" ON "post_comment_likes" ("comment_id", "user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_post_comment_likes_pair"`);
    await queryRunner.query(`DROP TABLE "post_comment_likes"`);
  }
}
