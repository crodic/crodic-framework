import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeaderboardSnapshotsTable1795000023000 implements MigrationInterface {
  name = 'CreateLeaderboardSnapshotsTable1795000023000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."ranking_filter_category_enum" AS ENUM('week', 'month', 'all', 'projects', 'crafting')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."ranking_trend_enum" AS ENUM('up', 'down', 'same')
    `);

    await queryRunner.query(`
      CREATE TABLE "leaderboard_snapshots" (
        "id" BIGSERIAL NOT NULL,
        "filter_category" "public"."ranking_filter_category_enum" NOT NULL,
        "period_key" character varying(32) NOT NULL,
        "is_current" boolean NOT NULL DEFAULT true,
        "rank" integer NOT NULL,
        "previous_rank" integer,
        "trend" "public"."ranking_trend_enum" NOT NULL DEFAULT 'same',
        "user_id" bigint NOT NULL,
        "post_id" bigint,
        "likes_count" bigint NOT NULL DEFAULT '0',
        "followers_count" bigint NOT NULL DEFAULT '0',
        "score" double precision NOT NULL DEFAULT '0',
        "featured_projects" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leaderboard_snapshot_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_leaderboard_snapshots_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_leaderboard_snapshots_post_id" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_leaderboard_current_rank" ON "leaderboard_snapshots" ("filter_category", "is_current", "rank")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_leaderboard_current_rank"`,
    );
    await queryRunner.query(`DROP TABLE "leaderboard_snapshots"`);
    await queryRunner.query(`DROP TYPE "public"."ranking_trend_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."ranking_filter_category_enum"`,
    );
  }
}
