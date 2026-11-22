import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillCosplayerCharacters1795000030000 implements MigrationInterface {
  name = 'BackfillCosplayerCharacters1795000030000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
          r RECORD;
          v_char_id BIGINT;
          v_series VARCHAR;
          v_photos_count INT;
      BEGIN
          FOR r IN 
              SELECT id, author_id, character_name, fandom_name, cover_image_url, photos_count, character_tag_id, copyright_tag_id
              FROM posts
              WHERE character_name IS NOT NULL AND TRIM(character_name) != '' AND deleted_at IS NULL
              ORDER BY id ASC
          LOOP
              v_series := COALESCE(NULLIF(TRIM(r.fandom_name), ''), 'Original');
              v_photos_count := COALESCE(r.photos_count, 1);

              -- Check if character already exists for this user
              SELECT id INTO v_char_id 
              FROM cosplayer_characters 
              WHERE user_id = r.author_id 
                AND LOWER(character_name) = LOWER(TRIM(r.character_name)) 
                AND LOWER(series_name) = LOWER(v_series)
              LIMIT 1;

              IF v_char_id IS NOT NULL THEN
                  UPDATE cosplayer_characters 
                  SET albums_count = albums_count + 1,
                      photos_count = photos_count + v_photos_count
                  WHERE id = v_char_id;
              ELSE
                  INSERT INTO cosplayer_characters (
                      user_id, character_name, series_name, cover_image_url, 
                      albums_count, photos_count, sort_order, 
                      character_tag_id, copyright_tag_id, created_at, updated_at
                  ) VALUES (
                      r.author_id, TRIM(r.character_name), v_series, COALESCE(r.cover_image_url, ''),
                      1, v_photos_count, 0,
                      r.character_tag_id, r.copyright_tag_id, NOW(), NOW()
                  ) RETURNING id INTO v_char_id;

                  -- Update profile charactersCount
                  UPDATE cosplayer_profiles 
                  SET characters_count = characters_count + 1 
                  WHERE user_id = r.author_id;
              END IF;

              -- Link post to cosplayer_character
              UPDATE posts SET cosplayer_character_id = v_char_id WHERE id = r.id;
          END LOOP;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reversible: unlink posts
    await queryRunner.query(`
      UPDATE posts SET cosplayer_character_id = NULL WHERE cosplayer_character_id IS NOT NULL;
    `);
  }
}
