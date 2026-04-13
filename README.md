# VagaRadar

VagaRadar é uma ferramenta Node.js + TypeScript para buscar vagas de desenvolvedor via API Gupy, filtrar e enviar notificações para Telegram, com persistência de histórico em SQLite (vagas já processadas).

## 📦 Tecnologias
- Node 18+ (ESM)
- TypeScript
- Express
- Axios
- node-cron
- sqlite3
- node-telegram-bot-api
- dotenv

## 🧩 Arquitetura
1. `src/services/gupy.service.ts`: consome endpoint Gupy `/api/v1/jobs` com query params e filtros padrão (dev + nível + exclusão de níveis + localização).
2. `src/utils/filters.ts`: checa se vaga já foi processada (memória + SQLite) e retorna somente vagas novas.
3. `src/jobs/fetchJobs.job.ts`: executa fetch + filtra + dispara webhook interno (`/webhook/new-job`).
4. `src/webhook.ts`: trata POST interno e:
   - envia mensagem para Telegram via `src/services/telegram.service.ts`
   - persiste vaga em SQLite via `src/services/db.service.ts`
5. `src/services/db.service.ts`: inicializa DB `vagaradar.db`, tabela `jobs`, `INSERT OR IGNORE`.

## ⚙️ Configuração (arquivo `.env`)
```ini
TELEGRAM_TOKEN=<bot-token>
TELEGRAM_CHAT_ID=<chat-id>

KEYWORD=Desenvolvedor
LIMIT=100
OFFSET=0

LEVEL_FILTERS=jr,junior,júnior,pl,pleno
DEV_FILTERS=desenvolvedor,desenvolvedora,developer,dev
EXCLUDE_LEVEL_FILTERS=sr,sênior,senior,especialista,specialist
REQUIRE_LEVEL=false
REMOTE_ONLY=false

PORT=3000
WEBHOOK_PORT=3000
INTERNAL_WEBHOOK_URL=http://localhost:3000/webhook/new-job

SQLITE_FILE=vagaradar.db

# opcional
# GUPY_COOKIES=gupy_locale=pt; candidate_secure_token=xxxx
# GUPY_USER_AGENT=Mozilla/5.0 ...
```

## ▶️ Execução
- `npm install`
- `npm run cli` (dispara fetch único + CSV)
- `npm run dev` (inicia servidor + cron 10min)
- `npm test` (testes unitários e DB)

## 💾 Persistência SQLite
- arquivo: `vagaradar.db`
- tabela: `jobs`
- colunas:
  - `id` (PK)
  - `title`, `company`, `location`, `url`
  - `published_date`
- atualiza via `INSERT OR IGNORE`, evita duplicidade

## 💬 Telegram
- `src/services/telegram.service.ts` usa `node-telegram-bot-api` com token/chat_id obrigatórios
- Exceptions são logadas e propagadas
- formato de mensagem:
  - título
  - empresa
  - localização
  - link
  - data

## 🛠️ Teste manual de webhook
```bash
curl -X POST http://localhost:3000/webhook/new-job \
  -H "Content-Type: application/json" \
  -d '{"id":"test","title":"Vaga Teste","company":"Empresa Teste","location":"Remoto","url":"https://teste.com"}'
```

## 🧹 Validação de finalização
- rodar `npm test` deve retornar `🎉 Todos os testes passaram.`
- rodar `npm run cli` deve gerar `vagas_radar.csv`
- rodar `npx tsx src/index.ts` inicia servidor e job cron

## ⚠️ Notas
- Se a API Gupy mudar payload, ajuste `src/services/gupy.service.ts` (campo `id`, `name`, `careerPageName`, `jobUrl`, `publishedDate`).
- Se ocorrer `can't parse entities`, use mensagem plain text sem Markdown ou escape manual.

---

## 🧾 Como contribuir
- Faça fork do repositório
- Ajuste `gupy.service` para novos parâmetros do endpoint
- Adicione/atualize testes em `test/run-tests.ts`
- Crie PR com changelog
