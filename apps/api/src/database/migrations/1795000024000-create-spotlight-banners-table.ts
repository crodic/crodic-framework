import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSpotlightBannersTable1795000024000 implements MigrationInterface {
  name = 'CreateSpotlightBannersTable1795000024000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "spotlight_banners" (
        "id" BIGSERIAL NOT NULL,
        "cosplayer_user_id" bigint NOT NULL,
        "badge" character varying(80) NOT NULL,
        "tagline" character varying(255) NOT NULL,
        "banner_file_id" bigint,
        "banner_image_url" character varying(500) NOT NULL,
        "sort_order" smallint NOT NULL DEFAULT '0',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_spotlight_banner_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_spotlight_banners_cosplayer_user_id" FOREIGN KEY ("cosplayer_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_spotlight_banners_banner_file_id" FOREIGN KEY ("banner_file_id") REFERENCES "files"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_spotlight_banners_active_sort" ON "spotlight_banners" ("is_active", "sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_spotlight_banners_active_sort"`,
    );
    await queryRunner.query(`DROP TABLE "spotlight_banners"`);
  }
}
