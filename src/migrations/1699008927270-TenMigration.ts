import { MigrationInterface, QueryRunner } from "typeorm";

export class TenMigration1699008927270 implements MigrationInterface {
    name = 'TenMigration1699008927270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`video\` DROP FOREIGN KEY \`FK_74e27b13f8ac66f999400df12f6\``);
        await queryRunner.query(`ALTER TABLE \`video\` CHANGE \`userId\` \`user\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`video\` ADD CONSTRAINT \`FK_242afa90beb90bc87d3ae39b41b\` FOREIGN KEY (\`user\`) REFERENCES \`customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`video\` DROP FOREIGN KEY \`FK_242afa90beb90bc87d3ae39b41b\``);
        await queryRunner.query(`ALTER TABLE \`video\` CHANGE \`user\` \`userId\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`video\` ADD CONSTRAINT \`FK_74e27b13f8ac66f999400df12f6\` FOREIGN KEY (\`userId\`) REFERENCES \`customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
