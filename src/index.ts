import cron from "node-cron";
import express from "express";
import webhookApp from "./webhook.js";
import { runJob } from "./jobs/fetchJobs.job.js";
import { initDb } from "./services/db.service.js";

// Configurações hardcoded para teste
process.env.TELEGRAM_TOKEN = "8725315488:AAGGsHBmWS4Tl90DU6lGfyrg_y-tpH-8EFA";
process.env.TELEGRAM_CHAT_ID = "848066265";
process.env.KEYWORD = "Desenvolvedor";
process.env.LIMIT = "50";
process.env.OFFSET = "0";
process.env.WORKPLACE_TYPE = "remote";
process.env.LEVEL_FILTERS = "jr,junior,júnior,pl,pleno";
process.env.DEV_FILTERS = "desenvolvedor,desenvolvedora,developer,dev";
process.env.REQUIRE_LEVEL = "false";
process.env.REMOTE_ONLY = "true";
process.env.PORT = "3000";
process.env.WEBHOOK_PORT = "3000";
process.env.INTERNAL_WEBHOOK_URL = "http://localhost:3000/webhook/new-job";
process.env.SQLITE_FILE = "vagaradar.db";

const port = Number(process.env.PORT || 3000);
const webhookPort = Number(process.env.WEBHOOK_PORT || port);

console.log("🚀 VagaRadar iniciado...");
console.log("🔧 Configurações carregadas:");
console.log(`  - TELEGRAM_TOKEN: ${process.env.TELEGRAM_TOKEN ? '✅ Definido' : '❌ Não definido'}`);
console.log(`  - TELEGRAM_CHAT_ID: ${process.env.TELEGRAM_CHAT_ID ? '✅ Definido' : '❌ Não definido'}`);
console.log(`  - SQLITE_FILE: ${process.env.SQLITE_FILE || 'vagaradar.db'}`);

async function start() {
  try {
    if (!process.env.TELEGRAM_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      throw new Error("TELEGRAM_TOKEN e TELEGRAM_CHAT_ID são obrigatórios.");
    }

    await initDb();

    const app = express();
    app.use(express.json());
    app.use(webhookApp);

    app.listen(webhookPort, async () => {
      console.log(`🌐 Webhook interno disponível em http://localhost:${webhookPort}`);

      console.log("🔎 Buscando vagas iniciais...");
      await runJob();
    });

    cron.schedule("*/10 * * * *", async () => {
      console.log("🔎 Buscando vagas...");
      await runJob();
    });
  } catch (error) {
    console.error("Falha ao iniciar aplicação:", error);
    process.exit(1);
  }
}

start();
