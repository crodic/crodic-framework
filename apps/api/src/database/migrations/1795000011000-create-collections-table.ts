import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCollectionsTable1795000011000 implements MigrationInterface {
  name = 'CreateCollectionsTable1795000011000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "collections" (
        "id" BIGSERIAL NOT NULL,
        "user_id" bigint NOT NULL,
        "title" character varying(140) NOT NULL,
        "slug" character varying(160) NOT NULL,
        "description" character varying(500),
        "is_default" boolean NOT NULL DEFAULT false,
        "is_public" boolean NOT NULL DEFAULT true,
        "items_count" integer NOT NULL DEFAULT '0',
        "preview_thumbnails" jsonb NOT NULL DEFAULT '[]',
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_collection_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_collections_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_collections_user_updated" ON "collections" ("user_id", "updated_at")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_collections_user_slug" ON "collections" ("user_id", "slug") WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_collections_user_slug"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_collections_user_updated"`,
    );
    await queryRunner.query(`DROP TABLE "collections"`);
  }
}
