import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTagEncyclopediaFeaturedImageUrl1794016431087 implements MigrationInterface {
  name = 'AddTagEncyclopediaFeaturedImageUrl1794016431087';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedias" ADD "featured_image_url" character varying(500)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tag_encyclopedias" DROP COLUMN "featured_image_url"`,
    );
  }
}
