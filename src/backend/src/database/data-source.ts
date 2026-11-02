import { join } from 'node:path';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '9300', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'arosv754',
  database: process.env.DB_NAME || 'practics',
  entities: [join(__dirname, '..', '**', '*.entity.js')],
  migrations: [join(__dirname, 'migrations', '*.js')],
  synchronize: false,
});
