import { strict as assert } from "assert";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DB_PATH = path.join(__dirname, "test.sqlite");

async function runTests() {
  console.log("🚀 Iniciando testes unitários e de integração...");

  // Importando diretamente dos fontes usando tsx
  const { initDb, closeDb } = await import("../src/services/db.service.js");
  const { filterNewJobs } = await import("../src/utils/filters.js");
  const { isDeveloperJob, hasLevel, hasExcludedLevel } = await import("../src/services/gupy.service.js");

  console.log("🔍 Testando filtro de desenvolvedor e nível...");
  const job1 = { id: "a", title: "Desenvolvedor Jr", company: "A", location: "Remoto", url: "" };
  const job2 = { id: "b", title: "Desenvolvedor Pleno", company: "B", location: "Presencial", url: "" };
  const job3 = { id: "c", title: "Suporte", company: "C", location: "Remoto", url: "" };

  const devFilters = ["desenvolvedor", "desenvolvedora", "developer", "dev"];
  const levelFilters = ["jr", "junior", "júnior", "pl", "pleno"];
  const excludeLevelFilters = ["sr", "sênior", "senior", "especialista", "specialist"];

  assert.equal(isDeveloperJob(job1, devFilters), true);
  assert.equal(hasLevel(job1, levelFilters), true);
  assert.equal(isDeveloperJob(job2, devFilters), true);
  assert.equal(hasLevel(job2, levelFilters), true);
  assert.equal(isDeveloperJob(job3, devFilters), false);

  const job4 = { id: "d", title: "Desenvolvedor Sênior", company: "D", location: "Remoto", url: "" };
  assert.equal(hasExcludedLevel(job4, excludeLevelFilters), true);
  assert.equal(hasExcludedLevel(job1, excludeLevelFilters), false);

  console.log("✅ isDeveloperJob/hasLevel/hasExcludedLevel: regras de filtro funcionam");

  process.env.SQLITE_FILE = TEST_DB_PATH;
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);

  await initDb();

  const jobs = [
    { id: "1", title: "Desenvolvedor Jr Backend", company: "X", location: "Remoto", url: "https://x" },
    { id: "2", title: "Desenvolvedor Pl Frontend", company: "Y", location: "SP", url: "https://y" },
    { id: "3", title: "Analista de QA", company: "Z", location: "SP", url: "https://z" },
  ];

  const newJobs1 = await filterNewJobs(jobs);
  assert.equal(newJobs1.length, 3);

  const newJobs2 = await filterNewJobs(jobs);
  assert.equal(newJobs2.length, 0);

  console.log("✅ filterNewJobs + SQLite: persistência funciona");

  await closeDb();
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);

  console.log("🎉 Todos os testes passaram.");
}

runTests().catch((error) => {
  console.error("❌ Falha em testes:", error);
  process.exit(1);
});