import { runJob } from "./src/jobs/fetchJobs.job.js";

console.log("🚀 Iniciando teste do job...");
runJob()
  .then(() => console.log("✅ Job concluído com sucesso!"))
  .catch((error) => console.error("❌ Erro no job:", error));