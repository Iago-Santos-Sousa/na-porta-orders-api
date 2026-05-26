import "dotenv/config";
import path from "path";
import { DataSource, DataSourceOptions } from "typeorm";

const isCompiledRuntime = __filename.endsWith(".js");
const entitiesRoot = isCompiledRuntime ? "dist/src" : "src";
const migrationExtension = isCompiledRuntime ? "js" : "ts";
const databaseName = process.env.DB_NAME ?? process.env.DB_SCHEMA ?? "na_porta_orders";
const sslEnabled = process.env.DB_SSL === "true";

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD,
  database: databaseName,
  entities: [path.join(process.cwd(), entitiesRoot, `**/*.entity.${migrationExtension}`)],
  migrations: [path.join(process.cwd(), entitiesRoot, `migrations/*.${migrationExtension}`)],
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  migrationsRun: false,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  extra: { bigNumberStrings: false },
  poolSize: Number(process.env.DB_CONNECTION_LIMIT) || 10,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
