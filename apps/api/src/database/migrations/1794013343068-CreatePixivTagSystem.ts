import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePixivTagSystem1794013343068 implements MigrationInterface {
  name = 'CreatePixivTagSystem1794013343068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tag_aliases_alias_type_enum" AS ENUM('synonym', 'abbreviation', 'typo', 'legacy_merge')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag_aliases" ("id" BIGSERIAL NOT NULL, "tag_id" bigint NOT NULL, "alias_name" character varying(120) NOT NULL, "normalized_alias" character varying(140) NOT NULL, "unaccented_alias" character varying(140) NOT NULL, "alias_type" "public"."tag_aliases_alias_type_enum" NOT NULL DEFAULT 'synonym', "locale" character varying(16), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_tag_alias_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tag_aliases_tag_id" ON "tag_aliases" ("tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tag_aliases_unaccented_alias" ON "tag_aliases" ("unaccented_alias") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_tag_aliases_normalized_alias" ON "tag_aliases" ("normalized_alias") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tag_encyclopedia_revisions" ("id" BIGSERIAL NOT NULL, "encyclopedia_id" bigint NOT NULL, "revision_number" integer NOT NULL, "summary" text NOT NULL, "body" text NOT NULL, "change_note" character varying(280), "editor_user_id" bigint, "editor_admin_id" bigint, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_tag_encyclopedia_revision_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tag_encyclopedia_revisions_encyclopedia" ON "tag_encyclopedia_revisions" ("encyclopedia_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_tag_encyclopedia_revisions_number" ON "tag_encyclopedia_revisions" ("encyclopedia_id", "revision_number") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tag_encyclopedias" ("id" BIGSERIAL NOT NULL, "tag_id" bigint NOT NULL, "locale" character varying(16) NOT NULL, "summary" text NOT NULL, "body" text NOT NULL, "featured_file_id" bigint, "is_edit_locked" boolean NOT NULL DEFAULT false, "current_revision" integer NOT NULL DEFAULT '1', "view_count" bigint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_tag_encyclopedia_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tag_encyclopedias_locale" ON "tag_encyclopedias" ("locale") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_tag_encyclopedias_tag_locale" ON "tag_encyclopedias" ("tag_id", "locale") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tag_relations_relation_type_enum" AS ENUM('hierarchy', 'related', 'disambiguation')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag_relations" ("id" BIGSERIAL NOT NULL, "source_tag_id" bigint NOT NULL, "target_tag_id" bigint NOT NULL, "relation_type" "public"."tag_relations_relation_type_enum" NOT NULL DEFAULT 'hierarchy', "sort_order" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_tag_relation_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tag_relations_target_type" ON "tag_relations" ("target_tag_id", "relation_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tag_relations_source_type" ON "tag_relations" ("source_tag_id", "relation_type") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_tag_relations_edge" ON "tag_relations" ("source_tag_id", "target_tag_id", "relation_type") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tag_translations_source_enum" AS ENUM('admin', 'community', 'system')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag_translations" ("id" BIGSERIAL NOT NULL, "tag_id" bigint NOT NULL, "locale" character varying(16) NOT NULL, "translated_name" character varying(120) NOT NULL, "normalized_name" character varying(140) NOT NULL, "unaccented_name" character varying(140) NOT NULL, "short_summary" character varying(280), "source" "public"."tag_translations_source_enum" NOT NULL DEFAULT 'admin', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_tag_translation_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tag_translations_locale" ON "tag_translations" ("locale") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tag_translations_unaccented_name" ON "tag_translations" ("unaccented_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tag_translations_normalized_name" ON "tag_translations" ("normalized_name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_tag_translations_tag_locale" ON "tag_translations" ("tag_id", "locale") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tags_category_enum" AS ENUM('general', 'copyright', 'character', 'artist', 'meta', 'system')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tags_safety_rating_enum" AS ENUM('safe', 'sensitive', 'r18', 'r18g')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tags_status_enum" AS ENUM('active', 'pending', 'merged', 'banned')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" BIGSERIAL NOT NULL, "slug" character varying(140) NOT NULL, "name" character varying(100) NOT NULL, "normalized_name" character varying(120) NOT NULL, "unaccented_name" character varying(120) NOT NULL, "category" "public"."tags_category_enum" NOT NULL DEFAULT 'general', "safety_rating" "public"."tags_safety_rating_enum" NOT NULL DEFAULT 'safe', "status" "public"."tags_status_enum" NOT NULL DEFAULT 'active', "is_official" boolean NOT NULL DEFAULT false, "is_system" boolean NOT NULL DEFAULT false, "usage_count" bigint NOT NULL DEFAULT '0', "trending_score" double precision NOT NULL DEFAULT '0', "merged_into_id" bigint, "created_by_user_id" bigint, "created_by_admin_id" bigint, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_tag_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tags_trending_score" ON "tags" ("trending_score") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tags_usage_count" ON "tags" ("usage_count") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tags_safety_rating" ON "tags" ("safety_rating") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tags_category_status" ON "tags" ("category", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tags_unaccented_name" ON "tags" ("unaccented_name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_tags_normalized_name" ON "tags" ("normalized_name") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_tags_slug" ON "tags" ("slug") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_muted_tags" ("id" BIGSERIAL NOT NULL, "user_id" bigint NOT NULL, "tag_id" bigint NOT NULL, "include_children" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_user_muted_tag_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_muted_tags_user_id" ON "user_muted_tags" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_user_muted_tags_user_tag" ON "user_muted_tags" ("user_id", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tag_closure" ("ancestor_id" bigint NOT NULL, "descendant_id" bigint NOT NULL, "depth" smallint NOT NULL DEFAULT '0', CONSTRAINT "PK_tag_closure" PRIMARY KEY ("ancestor_id", "descendant_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tag_closure_ancestor_depth" ON "tag_closure" ("ancestor_id", "depth") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tag_closure_descendant_depth" ON "tag_closure" ("descendant_id", "depth") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."entity_tags_entity_type_enum" AS ENUM('cms_page', 'artwork', 'file', 'post')`,
    );
    await queryRunner.query(
      `CREATE TABLE "entity_tags" ("id" BIGSERIAL NOT NULL, "entity_type" "public"."entity_tags_entity_type_enum" NOT NULL, "entity_id" bigint NOT NULL, "tag_id" bigint NOT NULL, "is_author_tag" boolean NOT NULL DEFAULT false, "is_locked" boolean NOT NULL DEFAULT false, "sort_order" smallint NOT NULL DEFAULT '0', "added_by_user_id" bigint, "added_by_admin_id" bigint, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_entity_tag_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_entity_tags_tag_entity_type" ON "entity_tags" ("tag_id", "entity_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_entity_tags_target_sort" ON "entity_tags" ("entity_type", "entity_id", "sort_order") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_entity_tags_target_tag" ON "entity_tags" ("entity_type", "entity_id", "tag_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."entity_tag_logs_entity_type_enum" AS ENUM('cms_page', 'artwork', 'file', 'post')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."entity_tag_logs_action_enum" AS ENUM('add', 'remove', 'lock', 'unlock', 'work_lock', 'work_unlock', 'reorder', 'merge_rewire')`,
    );
    await queryRunner.query(
      `CREATE TABLE "entity_tag_logs" ("id" BIGSERIAL NOT NULL, "entity_type" "public"."entity_tag_logs_entity_type_enum" NOT NULL, "entity_id" bigint NOT NULL, "tag_id" bigint, "tag_name_snapshot" character varying(120), "action" "public"."entity_tag_logs_action_enum" NOT NULL, "actor_user_id" bigint, "actor_admin_id" bigint, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_entity_tag_log_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_entity_tag_logs_actor_user" ON "entity_tag_logs" ("actor_user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_entity_tag_logs_target_created" ON "entity_tag_logs" ("entity_type", "entity_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."entity_tag_configs_entity_type_enum" AS ENUM('cms_page', 'artwork', 'file', 'post')`,
    );
    await queryRunner.query(
      `CREATE TABLE "entity_tag_configs" ("id" BIGSERIAL NOT NULL, "entity_type" "public"."entity_tag_configs_entity_type_enum" NOT NULL, "entity_id" bigint NOT NULL, "owner_user_id" bigint, "tag_edit_locked" boolean NOT NULL DEFAULT false, "max_tags" smallint NOT NULL DEFAULT '10', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_entity_tag_config_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_entity_tag_configs_target" ON "entity_tag_configs" ("entity_type", "entity_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "file_folders" ADD "title" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_folders" ADD "color" character varying(20) NOT NULL DEFAULT '#8B5CF6'`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_folders" ADD "parent_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_folders" ADD "depth" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD "visibility" character varying NOT NULL DEFAULT 'public'`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD "is_starred" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD "created_by_admin_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD "updated_by_admin_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_file_folders_parent_id" ON "file_folders" ("parent_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_files_visibility" ON "files" ("visibility") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_files_created_by_admin_id" ON "files" ("created_by_admin_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_files_updated_by_admin_id" ON "files" ("updated_by_admin_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_files_folder_created_at" ON "files" ("folder", "created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_aliases" ADD CONSTRAINT "FK_tag_aliases_tag_id" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_folders" ADD CONSTRAINT "FK_file_folders_parent_id" FOREIGN KEY ("parent_id") REFERENCES "file_folders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_files_created_by_admin" FOREIGN KEY ("created_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_files_updated_by_admin" FOREIGN KEY ("updated_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedia_revisions" ADD CONSTRAINT "FK_tag_encyclopedia_revisions_encyclopedia_id" FOREIGN KEY ("encyclopedia_id") REFERENCES "tag_encyclopedias"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedia_revisions" ADD CONSTRAINT "FK_tag_encyclopedia_revisions_editor_user_id" FOREIGN KEY ("editor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedia_revisions" ADD CONSTRAINT "FK_tag_encyclopedia_revisions_editor_admin_id" FOREIGN KEY ("editor_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedias" ADD CONSTRAINT "FK_tag_encyclopedias_tag_id" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedias" ADD CONSTRAINT "FK_tag_encyclopedias_featured_file_id" FOREIGN KEY ("featured_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_relations" ADD CONSTRAINT "FK_tag_relations_source_tag_id" FOREIGN KEY ("source_tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_relations" ADD CONSTRAINT "FK_tag_relations_target_tag_id" FOREIGN KEY ("target_tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_translations" ADD CONSTRAINT "FK_tag_translations_tag_id" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" ADD CONSTRAINT "FK_tags_merged_into_id" FOREIGN KEY ("merged_into_id") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" ADD CONSTRAINT "FK_tags_created_by_user_id" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" ADD CONSTRAINT "FK_tags_created_by_admin_id" FOREIGN KEY ("created_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_muted_tags" ADD CONSTRAINT "FK_user_muted_tags_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_muted_tags" ADD CONSTRAINT "FK_user_muted_tags_tag_id" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_closure" ADD CONSTRAINT "FK_tag_closure_ancestor_id" FOREIGN KEY ("ancestor_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_closure" ADD CONSTRAINT "FK_tag_closure_descendant_id" FOREIGN KEY ("descendant_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tags" ADD CONSTRAINT "FK_entity_tags_tag_id" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tags" ADD CONSTRAINT "FK_entity_tags_added_by_user_id" FOREIGN KEY ("added_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tags" ADD CONSTRAINT "FK_entity_tags_added_by_admin_id" FOREIGN KEY ("added_by_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tag_logs" ADD CONSTRAINT "FK_entity_tag_logs_tag_id" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tag_logs" ADD CONSTRAINT "FK_entity_tag_logs_actor_user_id" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tag_logs" ADD CONSTRAINT "FK_entity_tag_logs_actor_admin_id" FOREIGN KEY ("actor_admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tag_configs" ADD CONSTRAINT "FK_entity_tag_configs_owner_user_id" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_tag_configs" DROP CONSTRAINT "FK_entity_tag_configs_owner_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tag_logs" DROP CONSTRAINT "FK_entity_tag_logs_actor_admin_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tag_logs" DROP CONSTRAINT "FK_entity_tag_logs_actor_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tag_logs" DROP CONSTRAINT "FK_entity_tag_logs_tag_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tags" DROP CONSTRAINT "FK_entity_tags_added_by_admin_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tags" DROP CONSTRAINT "FK_entity_tags_added_by_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_tags" DROP CONSTRAINT "FK_entity_tags_tag_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_closure" DROP CONSTRAINT "FK_tag_closure_descendant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_closure" DROP CONSTRAINT "FK_tag_closure_ancestor_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_muted_tags" DROP CONSTRAINT "FK_user_muted_tags_tag_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_muted_tags" DROP CONSTRAINT "FK_user_muted_tags_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" DROP CONSTRAINT "FK_tags_created_by_admin_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" DROP CONSTRAINT "FK_tags_created_by_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" DROP CONSTRAINT "FK_tags_merged_into_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_translations" DROP CONSTRAINT "FK_tag_translations_tag_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_relations" DROP CONSTRAINT "FK_tag_relations_target_tag_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_relations" DROP CONSTRAINT "FK_tag_relations_source_tag_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedias" DROP CONSTRAINT "FK_tag_encyclopedias_featured_file_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedias" DROP CONSTRAINT "FK_tag_encyclopedias_tag_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedia_revisions" DROP CONSTRAINT "FK_tag_encyclopedia_revisions_editor_admin_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedia_revisions" DROP CONSTRAINT "FK_tag_encyclopedia_revisions_editor_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedia_revisions" DROP CONSTRAINT "FK_tag_encyclopedia_revisions_encyclopedia_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_files_updated_by_admin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_files_created_by_admin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_folders" DROP CONSTRAINT "FK_file_folders_parent_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_aliases" DROP CONSTRAINT "FK_tag_aliases_tag_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_files_folder_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_files_updated_by_admin_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_files_created_by_admin_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_files_visibility"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_file_folders_parent_id"`);
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "files" DROP COLUMN "updated_by_admin_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" DROP COLUMN "created_by_admin_id"`,
    );
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "is_starred"`);
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "visibility"`);
    await queryRunner.query(`ALTER TABLE "file_folders" DROP COLUMN "depth"`);
    await queryRunner.query(
      `ALTER TABLE "file_folders" DROP COLUMN "parent_id"`,
    );
    await queryRunner.query(`ALTER TABLE "file_folders" DROP COLUMN "color"`);
    await queryRunner.query(`ALTER TABLE "file_folders" DROP COLUMN "title"`);
    await queryRunner.query(
      `DROP INDEX "public"."UQ_entity_tag_configs_target"`,
    );
    await queryRunner.query(`DROP TABLE "entity_tag_configs"`);
    await queryRunner.query(
      `DROP TYPE "public"."entity_tag_configs_entity_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_entity_tag_logs_target_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_entity_tag_logs_actor_user"`,
    );
    await queryRunner.query(`DROP TABLE "entity_tag_logs"`);
    await queryRunner.query(`DROP TYPE "public"."entity_tag_logs_action_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."entity_tag_logs_entity_type_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."UQ_entity_tags_target_tag"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_entity_tags_target_sort"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_entity_tags_tag_entity_type"`,
    );
    await queryRunner.query(`DROP TABLE "entity_tags"`);
    await queryRunner.query(
      `DROP TYPE "public"."entity_tags_entity_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tag_closure_descendant_depth"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tag_closure_ancestor_depth"`,
    );
    await queryRunner.query(`DROP TABLE "tag_closure"`);
    await queryRunner.query(
      `DROP INDEX "public"."UQ_user_muted_tags_user_tag"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_muted_tags_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "user_muted_tags"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_tags_slug"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_tags_normalized_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tags_unaccented_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tags_category_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tags_safety_rating"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tags_usage_count"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tags_trending_score"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TYPE "public"."tags_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tags_safety_rating_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tags_category_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."UQ_tag_translations_tag_locale"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tag_translations_normalized_name"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tag_translations_unaccented_name"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tag_translations_locale"`,
    );
    await queryRunner.query(`DROP TABLE "tag_translations"`);
    await queryRunner.query(
      `DROP TYPE "public"."tag_translations_source_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."UQ_tag_relations_edge"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tag_relations_source_type"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tag_relations_target_type"`,
    );
    await queryRunner.query(`DROP TABLE "tag_relations"`);
    await queryRunner.query(
      `DROP TYPE "public"."tag_relations_relation_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_tag_encyclopedias_tag_locale"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tag_encyclopedias_locale"`,
    );
    await queryRunner.query(`DROP TABLE "tag_encyclopedias"`);
    await queryRunner.query(
      `DROP INDEX "public"."UQ_tag_encyclopedia_revisions_number"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tag_encyclopedia_revisions_encyclopedia"`,
    );
    await queryRunner.query(`DROP TABLE "tag_encyclopedia_revisions"`);
    await queryRunner.query(
      `DROP INDEX "public"."UQ_tag_aliases_normalized_alias"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tag_aliases_unaccented_alias"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_tag_aliases_tag_id"`);
    await queryRunner.query(`DROP TABLE "tag_aliases"`);
    await queryRunner.query(`DROP TYPE "public"."tag_aliases_alias_type_enum"`);
  }
}
