import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
dotenv.config();

export const connectionSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_UNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false,
  name: 'default',
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
  charset: "utf8mb4",
  // migrations: ['src/migrations/**/*{.ts,.js}'],
  // subscribers: ['src/subscriber/**/*{.ts,.js}'],
})