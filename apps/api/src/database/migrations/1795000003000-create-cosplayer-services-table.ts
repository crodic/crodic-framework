import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCosplayerServicesTable1795000003000 implements MigrationInterface {
  name = 'CreateCosplayerServicesTable1795000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."currency_code_enum" AS ENUM('VND', 'USD', 'JPY')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."service_price_unit_enum" AS ENUM('hour', 'session', 'day', 'event', 'set', 'project', 'item')
    `);

    await queryRunner.query(`
      CREATE TABLE "cosplayer_services" (
        "id" BIGSERIAL NOT NULL,
        "user_id" bigint NOT NULL,
        "title" character varying(180) NOT NULL,
        "description" character varying(500),
        "badge_label" character varying(80) NOT NULL,
        "starting_price" numeric(14,2),
        "currency" "public"."currency_code_enum" NOT NULL DEFAULT 'VND',
        "price_unit" "public"."service_price_unit_enum",
        "is_negotiable" boolean NOT NULL DEFAULT true,
        "sort_order" smallint NOT NULL DEFAULT '0',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cosplayer_service_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cosplayer_services_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cosplayer_services_user_sort" ON "cosplayer_services" ("user_id", "is_active", "sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cosplayer_services_user_sort"`,
    );
    await queryRunner.query(`DROP TABLE "cosplayer_services"`);
    await queryRunner.query(`DROP TYPE "public"."service_price_unit_enum"`);
    await queryRunner.query(`DROP TYPE "public"."currency_code_enum"`);
  }
}
