import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCollectionItemsTable1795000012000 implements MigrationInterface {
  name = 'CreateCollectionItemsTable1795000012000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "collection_items" (
        "id" BIGSERIAL NOT NULL,
        "collection_id" bigint NOT NULL,
        "post_id" bigint NOT NULL,
        "post_media_id" bigint,
        "sort_order" integer NOT NULL DEFAULT '0',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_collection_item_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_collection_items_collection_id" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_collection_items_post_id" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_collection_items_post_media_id" FOREIGN KEY ("post_media_id") REFERENCES "post_media"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_collection_items_collection_media" ON "collection_items" ("collection_id", "post_id", "post_media_id") WHERE "post_media_id" IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_collection_items_collection_post" ON "collection_items" ("collection_id", "post_id") WHERE "post_media_id" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_collection_items_collection_sort" ON "collection_items" ("collection_id", "sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_collection_items_collection_sort"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_collection_items_collection_post"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_collection_items_collection_media"`,
    );
    await queryRunner.query(`DROP TABLE "collection_items"`);
  }
}
