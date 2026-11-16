import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBrandMembersTable1795000014000 implements MigrationInterface {
  name = 'CreateBrandMembersTable1795000014000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."brand_member_role_enum" AS ENUM('owner', 'admin', 'member')
    `);

    await queryRunner.query(`
      CREATE TABLE "brand_members" (
        "id" BIGSERIAL NOT NULL,
        "brand_id" bigint NOT NULL,
        "user_id" bigint NOT NULL,
        "role" "public"."brand_member_role_enum" NOT NULL DEFAULT 'member',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_brand_member_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_brand_members_brand_id" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_brand_members_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_brand_members_pair" ON "brand_members" ("brand_id", "user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_brand_members_pair"`);
    await queryRunner.query(`DROP TABLE "brand_members"`);
    await queryRunner.query(`DROP TYPE "public"."brand_member_role_enum"`);
  }
}
