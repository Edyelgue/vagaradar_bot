# Suporte a Cookies Gupy

A API do Gupy é acessível **sem autenticação** no endpoint:
```
https://employability-portal.gupy.io/api/v1/jobs
```

Status: ✅ **Funcionando sem cookies**

---

## Se a API começar a exigir cookies

Se no futuro a Gupy exigir autenticação, você pode adicionar cookies ao `.env`:

### 1. Extrair os cookies do navegador

Abra o DevTools (F12) e vá até a requisição:
- **Request URL:** `https://employability-portal.gupy.io/api/v1/jobs?...`
- **Request Headers** → procure por `cookie:`

Você verá algo como:
```
cookie: gupy_locale=pt; candidate_secure_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; candidate_logged_in=true; ...
```

### 2. Copiar os cookies para `.env`

Adicione a linha (descomente se necessário):

```env
GUPY_COOKIES=gupy_locale=pt; candidate_secure_token=seu_token_aqui; candidate_logged_in=true
```

### 3. Opcionalmente, adicione User-Agent customizado

```env
GUPY_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
```

### 4. Reinicie o app

```bash
npm run dev
```

---

## Como saber se precisa de cookies?

Observe o console ao rodar:
- `✅ 200 OK` → API acessível sem cookies
- `❌ 401 Unauthorized` → Precisa de cookies
- `❌ 403 Forbidden` → Possível bloqueio de IP ou rate limit

Se receber erro, adicione os cookies e tente novamente.

---

## Notas de segurança

- ⚠️ **Não commit** do `.env` com cookies em repositórios públicos
- ⚠️ Cookies podem expirar (JWT expira em ~24h conforme o exemplo)
- ⚠️ Se compartilhar `.env`, revogue os tokens/cookies imediatamente

Use `.env.example` para projeto:
```env
# .env.example
GUPY_COOKIES=your_cookies_here
GUPY_USER_AGENT=your_user_agent_here
```
