import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

export const DatabaseModule = TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get<string>('DB_HOST') || 'localhost',
    port: parseInt(configService.get<string>('DB_PORT')) || 3306,
    username: configService.get<string>('DB_UNAME'),
    password: configService.get<string>('DB_PASS'),
    database: configService.get<string>('DB_NAME'),
    entities: ['dist/**/*.entity.js'],
    autoLoadEntities: false,
    logging: true,
    migrationsTableName: 'migration_table_dev',
    migrations: ['dist/migrations/*.js'],
    cli: {
      migrationsDir: 'src/migrations',
    },
  }),
  inject: [ConfigService],
});
