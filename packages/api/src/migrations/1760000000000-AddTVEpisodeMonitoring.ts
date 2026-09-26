import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTVEpisodeMonitoring1760000000000 implements MigrationInterface {
  public name = 'AddTVEpisodeMonitoring1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tv_episode"
      ADD COLUMN IF NOT EXISTS "monitored" boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tv_episode_monitored"
      ON "tv_episode" ("monitored")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_tv_episode_monitored"');
    await queryRunner.query(
      'ALTER TABLE "tv_episode" DROP COLUMN IF EXISTS "monitored"'
    );
  }
}
