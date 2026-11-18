import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostCommentsTable1795000008000 implements MigrationInterface {
  name = 'CreatePostCommentsTable1795000008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "post_comments" (
        "id" BIGSERIAL NOT NULL,
        "post_id" bigint NOT NULL,
        "author_id" bigint NOT NULL,
        "parent_id" bigint,
        "content" text NOT NULL,
        "likes_count" integer NOT NULL DEFAULT '0',
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_post_comment_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_post_comments_post_id" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_comments_author_id" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_comments_parent_id" FOREIGN KEY ("parent_id") REFERENCES "post_comments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_post_comments_author_id" ON "post_comments" ("author_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_post_comments_post_created" ON "post_comments" ("post_id", "parent_id", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_post_comments_post_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_post_comments_author_id"`,
    );
    await queryRunner.query(`DROP TABLE "post_comments"`);
  }
}
