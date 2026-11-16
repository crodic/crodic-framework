import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCosplayerCharactersTable1795000004000 implements MigrationInterface {
  name = 'CreateCosplayerCharactersTable1795000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cosplayer_characters" (
        "id" BIGSERIAL NOT NULL,
        "user_id" bigint NOT NULL,
        "character_name" character varying(160) NOT NULL,
        "series_name" character varying(160) NOT NULL,
        "character_tag_id" bigint,
        "copyright_tag_id" bigint,
        "cover_file_id" bigint,
        "cover_image_url" character varying(500) NOT NULL,
        "albums_count" integer NOT NULL DEFAULT '0',
        "photos_count" integer NOT NULL DEFAULT '0',
        "sort_order" smallint NOT NULL DEFAULT '0',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cosplayer_character_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cosplayer_characters_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cosplayer_characters_character_tag_id" FOREIGN KEY ("character_tag_id") REFERENCES "tags"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_cosplayer_characters_copyright_tag_id" FOREIGN KEY ("copyright_tag_id") REFERENCES "tags"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_cosplayer_characters_cover_file_id" FOREIGN KEY ("cover_file_id") REFERENCES "files"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_cosplayer_characters_user_char" ON "cosplayer_characters" ("user_id", "character_name", "series_name")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_cosplayer_characters_character_tag" ON "cosplayer_characters" ("character_tag_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_cosplayer_characters_user_sort" ON "cosplayer_characters" ("user_id", "sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cosplayer_characters_user_sort"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cosplayer_characters_character_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_cosplayer_characters_user_char"`,
    );
    await queryRunner.query(`DROP TABLE "cosplayer_characters"`);
  }
}
