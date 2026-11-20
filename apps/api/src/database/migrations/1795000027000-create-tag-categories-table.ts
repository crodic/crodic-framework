import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTagCategoriesTable1795000027000 implements MigrationInterface {
  name = 'CreateTagCategoriesTable1795000027000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tag_categories" (
        "id" BIGSERIAL NOT NULL,
        "slug" character varying(60) NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" text,
        "color" character varying(30) NOT NULL DEFAULT '#64748b',
        "icon" character varying(50) NOT NULL DEFAULT 'Tag',
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_system" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tag_category_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_tag_categories_slug" ON "tag_categories" ("slug") WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tag_categories_sort_order" ON "tag_categories" ("sort_order")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tag_categories_is_active" ON "tag_categories" ("is_active")
    `);

    // Alter tags.category from enum to varchar(60) so custom categories can be stored
    await queryRunner.query(`
      ALTER TABLE "tags" ALTER COLUMN "category" TYPE character varying(60) USING "category"::text
    `);

    // Add category_id foreign key column to tags
    await queryRunner.query(`
      ALTER TABLE "tags" ADD "category_id" bigint
    `);

    await queryRunner.query(`
      ALTER TABLE "tags" ADD CONSTRAINT "FK_tags_category_id" FOREIGN KEY ("category_id") REFERENCES "tag_categories"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tags_category_id" ON "tags" ("category_id")
    `);

    // Seed default tag categories
    await queryRunner.query(`
      INSERT INTO "tag_categories" ("slug", "name", "description", "color", "icon", "sort_order", "is_system", "is_active")
      VALUES
        ('general', 'General', 'General concepts, themes, actions, and objects', '#64748b', 'Tag', 1, true, true),
        ('character', 'Character', 'Named fictional or historical characters', '#3b82f6', 'User', 2, true, true),
        ('copyright', 'Copyright / Series', 'Original franchises, games, anime, and media series', '#a855f7', 'Sparkles', 3, true, true),
        ('artist', 'Artist / Creator', 'Illustrators, photographers, cosplayers, and studios', '#ec4899', 'Palette', 4, true, true),
        ('meta', 'Meta / Taxonomy', 'Technical, resolution, and administrative metadata', '#eab308', 'Info', 5, true, true),
        ('system', 'System Marker', 'Platform flags, safety indicators, and AI markers', '#ef4444', 'Shield', 6, true, true),
        ('costume', 'Costume / Outfit', 'Outfits, wigs, props, makeup styles, and cosplay attire', '#06b6d4', 'Shirt', 7, false, true),
        ('event', 'Event / Gathering', 'Conventions, expos, fan-gatherings, and festivals', '#10b981', 'Calendar', 8, false, true)
      ON CONFLICT ("slug") WHERE "deleted_at" IS NULL DO NOTHING
    `);

    // Backfill tags.category_id based on tags.category slug
    await queryRunner.query(`
      UPDATE "tags"
      SET "category_id" = tc."id"
      FROM "tag_categories" tc
      WHERE "tags"."category" = tc."slug"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."IDX_tags_category_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "tags" DROP CONSTRAINT "FK_tags_category_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "tags" DROP COLUMN "category_id"
    `);

    // Reset any custom categories to 'general' before restoring enum
    await queryRunner.query(`
      UPDATE "tags" SET "category" = 'general' WHERE "category" NOT IN ('general', 'copyright', 'character', 'artist', 'meta', 'system')
    `);

    await queryRunner.query(`
      ALTER TABLE "tags" ALTER COLUMN "category" TYPE "public"."tags_category_enum" USING "category"::"public"."tags_category_enum"
    `);

    await queryRunner.query(`
      DROP INDEX "public"."IDX_tag_categories_is_active"
    `);

    await queryRunner.query(`
      DROP INDEX "public"."IDX_tag_categories_sort_order"
    `);

    await queryRunner.query(`
      DROP INDEX "public"."UQ_tag_categories_slug"
    `);

    await queryRunner.query(`
      DROP TABLE "tag_categories"
    `);
  }
}
