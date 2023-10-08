import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitApp1650765360947 implements MigrationInterface {
  name = 'InitApp1650765360947';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`project\` CHANGE \`banner\` \`banner\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partner\` CHANGE \`logo\` \`logo\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`partner\` CHANGE \`logo\` \`logo\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`project\` CHANGE \`banner\` \`banner\` varchar(255) NOT NULL`,
    );
  }
}
