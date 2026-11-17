import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostsTable1795000005000 implements MigrationInterface {
  name = 'CreatePostsTable1795000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."post_type_enum" AS ENUM('photoset', 'wip', 'crafting', 'video')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."album_category_enum" AS ENUM('general', 'group', 'series', 'premium')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."post_status_enum" AS ENUM('draft', 'published', 'archived', 'hidden')
    `);

    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" BIGSERIAL NOT NULL,
        "slug" character varying(200) NOT NULL,
        "author_id" bigint NOT NULL,
        "title" character varying(220) NOT NULL,
        "caption" text,
        "post_type" "public"."post_type_enum" NOT NULL DEFAULT 'photoset',
        "album_category" "public"."album_category_enum" NOT NULL DEFAULT 'general',
        "album_category_label" character varying(80),
        "character_name" character varying(160),
        "fandom_name" character varying(160),
        "cosplayer_character_id" bigint,
        "character_tag_id" bigint,
        "copyright_tag_id" bigint,
        "cover_image_url" character varying(500) NOT NULL,
        "is_collage" boolean NOT NULL DEFAULT false,
        "collage_preview_urls" jsonb NOT NULL DEFAULT '[]',
        "tag_names_cache" jsonb NOT NULL DEFAULT '[]',
        "collaborators" jsonb NOT NULL DEFAULT '[]',
        "is_public" boolean NOT NULL DEFAULT true,
        "enable_watermark" boolean NOT NULL DEFAULT false,
        "status" "public"."post_status_enum" NOT NULL DEFAULT 'published',
        "is_featured_work" boolean NOT NULL DEFAULT false,
        "photos_count" smallint NOT NULL DEFAULT '1',
        "likes_count" bigint NOT NULL DEFAULT '0',
        "comments_count" bigint NOT NULL DEFAULT '0',
        "saves_count" bigint NOT NULL DEFAULT '0',
        "shares_count" bigint NOT NULL DEFAULT '0',
        "views_count" bigint NOT NULL DEFAULT '0',
        "trending_score" double precision NOT NULL DEFAULT '0',
        "published_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_post_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_posts_author_id" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_posts_cosplayer_character_id" FOREIGN KEY ("cosplayer_character_id") REFERENCES "cosplayer_characters"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_posts_character_tag_id" FOREIGN KEY ("character_tag_id") REFERENCES "tags"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_posts_copyright_tag_id" FOREIGN KEY ("copyright_tag_id") REFERENCES "tags"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_posts_copyright_tag" ON "posts" ("copyright_tag_id", "published_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_posts_character_tag" ON "posts" ("character_tag_id", "published_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_posts_cosplayer_character" ON "posts" ("cosplayer_character_id", "published_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_posts_featured" ON "posts" ("is_featured_work", "published_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_posts_trending" ON "posts" ("is_public", "status", "trending_score")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_posts_feed_public" ON "posts" ("is_public", "status", "published_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_posts_author_category" ON "posts" ("author_id", "album_category", "published_at")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_posts_slug" ON "posts" ("slug") WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_posts_slug"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_posts_author_category"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_posts_feed_public"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_posts_trending"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_posts_featured"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_posts_cosplayer_character"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_posts_character_tag"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_posts_copyright_tag"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TYPE "public"."post_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."album_category_enum"`);
    await queryRunner.query(`DROP TYPE "public"."post_type_enum"`);
  }
}
