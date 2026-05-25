import "dotenv/config";
import AppDataSource from "../../data-source";
import { runDemoSeed } from "../seeds/seed";

async function bootstrapDatabase() {
  const dataSource = await AppDataSource.initialize();

  try {
    await dataSource.runMigrations();

    if (process.env.DB_SEED_DEMO === "true") {
      await runDemoSeed(dataSource);
    }
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

bootstrapDatabase().catch((error) => {
  console.error("Database bootstrap failed:", error);
  process.exit(1);
});
