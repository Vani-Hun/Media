module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_UNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  autoLoadEntities: true,
  logging: true,
  synchronize: true,
  charset: "utf8mb4",
  collation: "utf8mb4_0900_ai_ci"
  // migrationsTableName: 'migration_table_dev',
  // migrations: ['dist/migrations/*.js'],
  // cli: {
  //   migrationsDir: 'src/migrations',
  // },
};
