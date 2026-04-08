import { initDb, isJobSeen } from "../services/db.service.js";

const memoryCache = new Set<string>();

export async function filterNewJobs(jobs: any[]) {
  await initDb();

  const newJobs: any[] = [];

  for (const job of jobs) {
    if (!job?.id) continue;

    if (memoryCache.has(job.id)) continue;

    const seen = await isJobSeen(job.id);
    if (seen) {
      memoryCache.add(job.id);
      continue;
    }

    memoryCache.add(job.id);
    newJobs.push(job);
  }

  return newJobs;
}
