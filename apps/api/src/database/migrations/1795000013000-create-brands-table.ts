import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBrandsTable1795000013000 implements MigrationInterface {
  name = 'CreateBrandsTable1795000013000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "brands" (
        "id" BIGSERIAL NOT NULL,
        "owner_user_id" bigint NOT NULL,
        "name" character varying(160) NOT NULL,
        "slug" character varying(180) NOT NULL,
        "initials" character varying(10),
        "color" character varying(50),
        "logo_file_id" bigint,
        "logo_url" character varying(500),
        "cover_file_id" bigint,
        "cover_url" character varying(500),
        "tagline" character varying(255),
        "description" text,
        "website_url" character varying(300),
        "contact_email" character varying(255) NOT NULL,
        "contact_phone" character varying(40),
        "is_verified" boolean NOT NULL DEFAULT false,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_brand_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_brands_owner_user_id" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_brands_logo_file_id" FOREIGN KEY ("logo_file_id") REFERENCES "files"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_brands_cover_file_id" FOREIGN KEY ("cover_file_id") REFERENCES "files"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_brands_owner" ON "brands" ("owner_user_id")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_brands_slug" ON "brands" ("slug") WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_brands_slug"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_brands_owner"`);
    await queryRunner.query(`DROP TABLE "brands"`);
  }
}
