import axios from "axios";
import { fetchJobs } from "../services/gupy.service.js";
import { filterNewJobs } from "../utils/filters.js";

const port = process.env.WEBHOOK_PORT || process.env.PORT || 3000;
const internalWebhookUrl = process.env.INTERNAL_WEBHOOK_URL || `http://localhost:${port}/webhook/new-job`;

export async function runJob() {
  const jobs = await fetchJobs();
  console.log(`Total de vagas encontradas na Gupy: ${jobs.length}`);

  const newJobs = await filterNewJobs(jobs);

  if (newJobs.length === 0) {
    console.log("Nenhuma vaga nova encontrada");
    return;
  }

  for (const job of newJobs) {
    try {
      await axios.post(internalWebhookUrl, job, { timeout: 15000 });
      console.log(`Webhook interno disparado para vaga ${job.id || job.title}`);
    } catch (error) {
      console.error(`Falha ao enviar webhook interno para vaga ${job.id}:`, error);
    }
  }

  console.log(`${newJobs.length} novas vagas detectadas e webhook disparados`);
}
