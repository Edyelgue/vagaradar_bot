import express from "express";
import { sendMessage } from "./services/telegram.service.js";
import { markJobSeen } from "./services/db.service.js";

const router = express.Router();

router.post("/webhook/new-job", async (req: express.Request, res: express.Response) => {
  console.log("📨 Webhook recebido:", req.body);

  const job = req.body;

  const message = `
🚀 Nova vaga encontrada!

💼 ${job.title || "Sem título"}
🏢 ${job.company || "Empresa desconhecida"}
📍 ${job.location || "Localização não informada"}

🔗 ${job.url || "Sem link"}
📅 ${job.publishedDate ? new Date(job.publishedDate).toLocaleDateString('pt-BR') : "Data não informada"}
  `.trim();

  console.log("📝 Mensagem preparada:", message);

  try {
    // Primeiro, envia a mensagem para o Telegram
    console.log("📤 Enviando para Telegram...");
    await sendMessage(message);

    // Depois, persiste no banco de dados
    console.log("💾 Persistindo no banco...");
    await markJobSeen({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      url: job.url,
      publishedDate: job.publishedDate,
    });

    console.log(`✅ Vaga ${job.id} processada: Telegram enviado e persistida no banco`);
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Erro ao processar webhook interno:", error);
    res.status(500).send("Falha no processamento do webhook");
  }
});

export default router;
