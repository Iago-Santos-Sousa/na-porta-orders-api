import "dotenv/config";
import AppDataSource from "../../data-source";
import { runDemoSeed } from "../seeds/seed";

async function executeSeed() {
  const dataSource = await AppDataSource.initialize();

  try {
    await runDemoSeed(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

executeSeed().catch((error) => {
  console.error("Erro ao executar a seed: ", error);
  process.exit(1);
});
