import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostMediaTable1795000006000 implements MigrationInterface {
  name = 'CreatePostMediaTable1795000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."media_type_enum" AS ENUM('image', 'video')
    `);

    await queryRunner.query(`
      CREATE TABLE "post_media" (
        "id" BIGSERIAL NOT NULL,
        "post_id" bigint NOT NULL,
        "file_id" bigint,
        "media_type" "public"."media_type_enum" NOT NULL DEFAULT 'image',
        "url" character varying(500) NOT NULL,
        "original_url" character varying(500),
        "alt_text" character varying(255),
        "width" integer,
        "height" integer,
        "duration" integer,
        "sort_order" smallint NOT NULL DEFAULT '0',
        "is_cover" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_post_media_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_post_media_post_id" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_media_file_id" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_post_media_file_id" ON "post_media" ("file_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_post_media_post_sort" ON "post_media" ("post_id", "sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_post_media_post_sort"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_post_media_file_id"`);
    await queryRunner.query(`DROP TABLE "post_media"`);
    await queryRunner.query(`DROP TYPE "public"."media_type_enum"`);
  }
}
