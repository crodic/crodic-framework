import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCosplayerProfilesTable1795000002000 implements MigrationInterface {
  name = 'CreateCosplayerProfilesTable1795000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cosplayer_profiles" (
        "id" BIGSERIAL NOT NULL,
        "user_id" bigint NOT NULL,
        "slug" character varying(80) NOT NULL,
        "display_name" character varying(120) NOT NULL,
        "handle" character varying(80) NOT NULL,
        "role_badge" character varying(80),
        "tagline" character varying(255),
        "bio" character varying(500),
        "artistic_bio" text,
        "avatar_file_id" bigint,
        "avatar_url" character varying(500),
        "cover_file_id" bigint,
        "cover_url" character varying(500),
        "location_label" character varying(120),
        "city_id" bigint,
        "country_id" bigint,
        "work_area" character varying(160),
        "height_cm" smallint,
        "height_label" character varying(50),
        "experience_years_num" smallint,
        "experience_label" character varying(100),
        "skills" jsonb NOT NULL DEFAULT '[]',
        "specialties" jsonb NOT NULL DEFAULT '[]',
        "awards_badges" jsonb NOT NULL DEFAULT '[]',
        "contact_email" character varying(255),
        "contact_phone" character varying(50),
        "facebook_url" character varying(500),
        "instagram_url" character varying(500),
        "tiktok_url" character varying(500),
        "twitter_url" character varying(500),
        "is_verified" boolean NOT NULL DEFAULT false,
        "is_accepting_booking" boolean NOT NULL DEFAULT false,
        "is_crafting_creator" boolean NOT NULL DEFAULT false,
        "followers_count" bigint NOT NULL DEFAULT '0',
        "following_count" bigint NOT NULL DEFAULT '0',
        "total_likes_count" bigint NOT NULL DEFAULT '0',
        "albums_count" integer NOT NULL DEFAULT '0',
        "characters_count" integer NOT NULL DEFAULT '0',
        "collections_count" integer NOT NULL DEFAULT '0',
        "ranking_score" double precision NOT NULL DEFAULT '0',
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "REL_cosplayer_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_cosplayer_profile_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cosplayer_profiles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cosplayer_profiles_avatar_file_id" FOREIGN KEY ("avatar_file_id") REFERENCES "files"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_cosplayer_profiles_cover_file_id" FOREIGN KEY ("cover_file_id") REFERENCES "files"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_cosplayer_profiles_city_id" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_cosplayer_profiles_country_id" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cosplayer_profiles_city_id" ON "cosplayer_profiles" ("city_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_cosplayer_profiles_ranking" ON "cosplayer_profiles" ("ranking_score", "total_likes_count")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_cosplayer_profiles_booking" ON "cosplayer_profiles" ("is_accepting_booking", "is_verified", "followers_count")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_cosplayer_profiles_handle" ON "cosplayer_profiles" ("handle") WHERE "deleted_at" IS NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_cosplayer_profiles_slug" ON "cosplayer_profiles" ("slug") WHERE "deleted_at" IS NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_cosplayer_profiles_user_id" ON "cosplayer_profiles" ("user_id") WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."UQ_cosplayer_profiles_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."UQ_cosplayer_profiles_slug"`);
    await queryRunner.query(
      `DROP INDEX "public"."UQ_cosplayer_profiles_handle"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cosplayer_profiles_booking"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cosplayer_profiles_ranking"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cosplayer_profiles_city_id"`,
    );
    await queryRunner.query(`DROP TABLE "cosplayer_profiles"`);
  }
}
