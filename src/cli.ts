import { fetchJobs } from "./services/gupy.service.js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function exportJobs() {
  console.log("🔍 Iniciando busca de vagas...");
  
  // Busca as vagas usando os filtros definidos no seu .env (como REMOTE_ONLY=true)
  const jobs = await fetchJobs();

  if (jobs.length === 0) {
    console.log("⚠️ Nenhuma vaga encontrada com os filtros atuais do seu arquivo .env.");
    return;
  }

  // 1. Mostrar na linha de comando (Tabela formatada)
  console.log("\n📋 VAGAS ENCONTRADAS:");
  console.table(jobs.map(job => ({
    Título: job.title,
    Empresa: job.company,
    Local: job.location,
    Publicado: job.publishedDate
  })));

  // 2. Criar arquivo CSV
  // Usamos ponto e vírgula (;) como separador para abrir direto no Excel sem problemas de formatação
  const header = "ID;Título;Empresa;Localização;URL\n";
  const rows = jobs.map(j => 
    `"${j.publishedDate}";"${j.id}";"${j.title}";"${j.company}";"${j.location}";"${j.url}"`
  ).join("\n");

  const fileName = "vagas_radar.csv";
  fs.writeFileSync(fileName, header + rows, "utf-8");

  console.log(`\n✅ Sucesso!`);
  console.log(`📊 Total de vagas: ${jobs.length}`);
  console.log(`📄 Arquivo gerado: ${fileName}`);
}

exportJobs().catch(err => console.error("❌ Erro ao exportar vagas:", err));