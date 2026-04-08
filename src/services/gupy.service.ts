import axios from "axios";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  publishedDate?: string;
}

const DEFAULT_LEVEL_FILTERS = ["jr", "junior", "junior", "júnior", "pl", "pleno"];
const DEFAULT_DEV_FILTERS = ["desenvolvedor", "desenvolvedora", "developer", "dev"];

function normalizeText(value: string | undefined): string {
  return (value || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function containsAny(text: string, terms: string[]): boolean {
  return terms.some((term) => term && text.includes(term));
}

export function isDeveloperJob(job: Job, filters: string[]): boolean {
  const text = normalizeText(`${job.title} ${job.company} ${job.location}`);
  return containsAny(text, filters);
}

export function hasLevel(job: Job, filters: string[]): boolean {
  const text = normalizeText(`${job.title} ${job.company} ${job.location}`);
  return containsAny(text, filters);
}

export function isRemoteJob(job: Job): boolean {
  const text = normalizeText(`${job.title} ${job.location}`);
  return text.includes("remoto") || text.includes("remote") || text.includes("home office") || text.includes("anywhere");
}

export async function fetchJobs(): Promise<Job[]> {
  try {
    const jobName = process.env.KEYWORD || "Desenvolvedor";
    const limit = Number(process.env.LIMIT || 10);
    const offset = Number(process.env.OFFSET || 0);
    const remoteOnly = process.env.REMOTE_ONLY?.toLowerCase() === "true";
    const workplaceType = process.env.WORKPLACE_TYPE?.trim() || (remoteOnly ? "remote" : undefined);

    // Prepara os filtros uma única vez (performance)
    const devFilters = (process.env.DEV_FILTERS || DEFAULT_DEV_FILTERS.join(","))
      .split(",").map(t => normalizeText(t.trim()));
    const levelFilters = (process.env.LEVEL_FILTERS || DEFAULT_LEVEL_FILTERS.join(","))
      .split(",").map(t => normalizeText(t.trim()));

    const requireLevel = process.env.REQUIRE_LEVEL?.toLowerCase() === "true";
    const version = process.env.NODE_ENV || "development";

    const params: any = {
      jobName,
      limit,
      offset,
      sortBy: "publishedDate",
      sortOrder: "desc",
    };

    if (workplaceType && workplaceType !== "any") {
      params.workplaceType = workplaceType;
    }

    console.log("fetchJobs params:", params);

    const headers: any = {
      "Accept": "application/json",
      "Accept-Language": "pt-BR,pt;q=0.8",
    };

    // Adiciona cookies se fornecidos
    if (process.env.GUPY_COOKIES) {
      headers["Cookie"] = process.env.GUPY_COOKIES;
    }

    // Adiciona User-Agent customizado se fornecido
    if (process.env.GUPY_USER_AGENT) {
      headers["User-Agent"] = process.env.GUPY_USER_AGENT;
    }

    const response = await axios.get("https://employability-portal.gupy.io/api/v1/jobs", {
      params,
      headers,
      timeout: 15000,
    });

    const items =
      response.data?.data ||
      response.data?.items ||
      response.data ||
      [];

    if (!Array.isArray(items)) {
      console.warn("Formato de resposta inesperado de Gupy:", response.data);
      return [];
    }

    const jobs: Job[] = items.map((job: any) => ({
      id: job.id?.toString() || `${job.name}-${job.careerPageName}`,
      title: job.name || "Sem título",
      company: job.careerPageName || "Desconhecida",
      location: `${job.city || "Remoto"}, ${job.state || ""}`.trim().replace(/,\s*$/, ""),
      url: job.jobUrl || "",
      publishedDate: job.publishedDate,
    }));

    const filtered = jobs.filter((job) => {
      if (!isDeveloperJob(job, devFilters)) return false;
      if (requireLevel && !hasLevel(job, levelFilters)) return false;
      if (remoteOnly && !isRemoteJob(job)) return false;
      return true;
    });

    console.log(`fetchJobs: total ${jobs.length}, filtro final ${filtered.length}`);

    if (filtered.length === 0) {
      console.log(`Nenhuma vaga passou no filtro (requireLevel:${requireLevel} remoteOnly:${remoteOnly})`);
      console.log(`jobs brutos processados: ${jobs.length}`);
      console.log(`jobs selecionados por dev/title: ${jobs.filter((j) => isDeveloperJob(j, devFilters)).length}, por nivel: ${jobs.filter((j) => hasLevel(j, levelFilters)).length}`);
    }

    return filtered;
  } catch (error) {
    console.error("Erro ao buscar vagas:", error);
    return [];
  }
}
