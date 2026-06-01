# 🚀 Express Azure API — Production Grade Learning Project

> **Part of my AI-200 Azure AI Cloud Developer Associate certification journey**  
> Built while studying Domain 1: Develop Containerized Solutions on Azure

---

## 📖 Why I Built This Project

I am studying for the **Microsoft AI-200 Azure AI Cloud Developer Associate** certification with a target of 1000/1000. Instead of just reading theory, I built a real production-grade project to apply every concept hands-on.

This project covers **Topics t1, t2, t3** from Domain 1 of the AI-200 exam:
- **t1** — Build, store, version, and manage container images using ACR
- **t2** — Build and run images using ACR Tasks
- **t3** — Deploy containers to Azure App Service with environment variables and secrets

---

## 🏗️ What I Built

A production-grade REST API using **Node.js + Express**, fully containerized and deployed on Azure using:

- **Azure Container Registry (ACR)** — private image storage
- **ACR Tasks** — automated builds on every GitHub commit
- **Azure App Service** — container hosting
- **Azure Key Vault** — secure secret storage
- **Managed Identity** — zero-credential authentication

---

## 🌐 Live Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Root — API status |
| `GET /health` | Health check — App Service warmup probe |
| `GET /api/info` | Shows environment variables injected by App Service |
| `GET /api/secret` | Proves Key Vault secrets are resolving correctly |
| `GET /api/version` | Shows deployment version and timestamp |

---

## 🔧 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Node.js 20 | Runtime |
| Express.js | Web framework |
| Docker | Containerization |
| Azure Container Registry | Private image registry |
| ACR Tasks | Automated CI/CD builds |
| Azure App Service (Linux, B1) | Container hosting |
| Azure Key Vault | Secret storage |
| Azure Managed Identity | Zero-credential auth |
| GitHub | Source control + webhook trigger |

---

## 📐 Architecture

```
Developer (VS Code)
        │
        │ git push to main
        ▼
GitHub (deveasin/express-azure-api)
        │
        │ webhook triggers ACR Task
        ▼
ACR Task (build-on-commit)
        │ builds image tagged with Run ID (cm1, cm2, cm3...)
        ▼
Azure Container Registry (expressapiacr)
        │ stores image: express-api:cm6
        ▼
Azure App Service (express-api-easin)
        │
        ├── Non-sensitive config (App Settings)
        │     NODE_ENV     = "production"
        │     APP_VERSION  = "1.0.0"
        │     PORT         = "3000"
        │
        └── Sensitive secrets (Key Vault via Managed Identity)
              DB_PASSWORD  → express-api-vault ✅
              API_KEY      → express-api-vault ✅
```

---

## 🐳 Dockerfile — Production Grade

```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/
COPY package.json ./

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD ["node", "src/index.js"]
```

**Why production grade:**
- ✅ Multi-stage build — smaller final image
- ✅ Non-root user — limited attack surface
- ✅ Only production dependencies in final image

---

## 🔄 CI/CD Pipeline

```
git push origin main
        │
        │ GitHub webhook → ACR Task triggers
        ▼
az acr task (build-on-commit)
        │ pulls code from GitHub
        │ builds Docker image
        │ tags with unique Run ID: express-api:cm6
        ▼
Image stored in ACR ✅
```

**Key command used:**
```bash
az acr task create \
  --registry expressapiacr \
  --name build-on-commit \
  --image express-api:{{.Run.ID}} \
  --context https://github.com/deveasin/express-azure-api.git#main \
  --file Dockerfile \
  --git-access-token $GH_TOKEN
```

---

## 🔐 Security Setup

### Environment Variables Strategy

| Variable | Value | Storage | Why |
|----------|-------|---------|-----|
| `NODE_ENV` | `production` | App Settings | Not sensitive |
| `APP_VERSION` | `1.0.0` | App Settings | Not sensitive |
| `PORT` | `3000` | App Settings | Not sensitive |
| `DB_PASSWORD` | `***` | Key Vault | Sensitive credential |
| `API_KEY` | `***` | Key Vault | Sensitive credential |

### Key Vault Reference Format
```
DB_PASSWORD = @Microsoft.KeyVault(VaultName=express-api-vault;SecretName=db-password)
```

### Managed Identity Flow
```
App Service → proves identity via Azure AD token (auto-generated)
Key Vault   → checks: "Does express-api-easin have Key Vault Secrets User role?"
            → Yes → returns secret value ✅
            → No credentials stored anywhere
```

**RBAC assignments:**
| Identity | Resource | Role | Purpose |
|---------|---------|------|---------|
| Md Easin (me) | Key Vault | Key Vault Administrator | Manage secrets |
| express-api-easin | Key Vault | Key Vault Secrets User | Read secrets |
| express-api-easin | ACR | AcrPull | Pull images |

---

## 🚧 Real Problems I Hit & Fixed

### Problem 1 — Typo in Dockerfile
```
FROM node:20-alphine  ❌
FROM node:20-alpine   ✅
Error: manifest unknown
Lesson: Always copy base image names from hub.docker.com
```

### Problem 2 — Container Timeout
```
Error: Container did not start within 230s
Cause: WEBSITES_PORT not set
Fix: Set WEBSITES_PORT=3000 in App Settings
Lesson: App Service needs to know which port your container listens on
```

### Problem 3 — Quota Exceeded
```
Error: QuotaExceeded on B1 plan
Cause: Free trial limits
Fix: Deleted unused resources, recreated
Lesson: Always delete resources after practice!
```

### Problem 4 — Webhook 401 Unauthorized
```
Error: ACR webhook → App Service returns 401
Cause: SCM Basic Auth disabled by default in newer Azure
Fix: GitHub Actions with Managed Identity (proper solution)
Lesson: Microsoft deprecated basic auth webhooks — use GitHub Actions
```

### Problem 5 — Key Vault Forbidden
```
Error: Caller is not authorized (ForbiddenByRbac)
Cause: RBAC model requires explicit role assignment even for creator
Fix: Assign "Key Vault Administrator" role to myself via IAM
Lesson: Key Vault RBAC model ≠ automatic access for creator
```

### Problem 6 — Deprecated CLI Flags
```
Warning: --docker-registry-server-user deprecated
Fix: Use --container-registry-user instead
Lesson: Azure CLI evolves — always check for deprecation warnings
```

---

## 📚 What I Learned

### Azure Container Registry (ACR)
- Registry vs Repository vs Tag — clear understanding
- SKU tiers: Basic/Standard/Premium (geo-replication = Premium only)
- `az acr build` — build in cloud without local Docker
- Image tagging strategies: `latest` is dangerous, use commit SHA in production
- Admin Credentials vs Managed Identity for authentication

### ACR Tasks
- **Quick Task** — `az acr build` — one-time manual build
- **Triggered Task** — auto-build on git commit, base image update, or schedule
- **Multi-Step Task** — build → test → push pipeline with `when` keyword
- Base image update trigger — unique ACR feature for security patching
- `{{.Run.ID}}` — auto-generated unique tag per build

### Azure App Service
- App Service Plan = the server; Web App = your app
- Container deployment requires B1 minimum (Free tier doesn't support containers)
- `WEBSITES_PORT` — critical setting for container port mapping
- Environment variables: App Settings vs Key Vault references
- Managed Identity — zero-credential access to Azure services
- Principle of Least Privilege — Key Vault Secrets User (read only) for app

### Azure Key Vault
- RBAC model requires explicit role assignment — even for creator
- Key Vault reference format: `@Microsoft.KeyVault(VaultName=...;SecretName=...)`
- `Resolved` status in portal confirms secret is accessible
- Managed Identity eliminates the "secret zero" problem

### Production Patterns
- Multi-stage Docker builds — smaller, cleaner images
- Non-root container user — security best practice
- Separate sensitive vs non-sensitive config
- GitHub Actions > webhook for continuous deployment when basic auth disabled

---

## 🗂️ Project Structure

```
express-azure-api/
  ├── src/
  │     └── index.js        ← Express app with all endpoints
  ├── Dockerfile             ← Multi-stage production build
  ├── .gitignore             ← Ignores node_modules, .env
  ├── package.json           ← Dependencies
  └── README.md              ← This file
```

---

## 🚀 How to Run Locally

```bash
# Clone
git clone https://github.com/deveasin/express-azure-api.git
cd express-azure-api

# Install
npm install

# Create .env file (never commit this!)
cat > .env << 'EOF'
NODE_ENV=development
PORT=3000
APP_VERSION=1.0.0
DB_PASSWORD=localpassword
API_KEY=local-api-key
EOF

# Run
npm run dev

# Test
curl http://localhost:3000/health
curl http://localhost:3000/api/info
curl http://localhost:3000/api/secret
```

---

## ☁️ Azure Resources Used

| Resource | Name | Purpose |
|---------|------|---------|
| Resource Group | `express-api-rg` | Container for all resources |
| Container Registry | `expressapiacr` | Store Docker images |
| ACR Task | `build-on-commit` | Auto-build on GitHub push |
| App Service Plan | `express-api-plan` | Server (Linux, B1) |
| Web App | `express-api-easin` | Run container |
| Key Vault | `express-api-vault` | Store secrets |

---

## 🎯 AI-200 Exam Topics Covered

| Topic | Status |
|-------|--------|
| t1 — ACR: build, store, version, manage images | ✅ 100% quiz score |
| t2 — ACR Tasks: quick, triggered, multi-step | ✅ 100% quiz score |
| t3 — App Service: containers, env vars, secrets | ✅ 100% quiz score |

---

## 📅 Study Journey

| Date | What I Did |
|------|-----------|
| June 1, 2026 | Built complete project from scratch |
| June 1, 2026 | Hit and fixed 6 real production errors |
| June 1, 2026 | Scored 100% on all 3 topic quizzes |
| June 1, 2026 | Scored 100% on Section quiz (5/5) |

---

## 🔗 References

- [AI-200 Exam Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-cloud-developer-associate/)
- [Azure Container Registry Docs](https://learn.microsoft.com/en-us/azure/container-registry/)
- [ACR Tasks Docs](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-tasks-overview)
- [App Service Container Docs](https://learn.microsoft.com/en-us/azure/app-service/configure-custom-container)
- [Key Vault References in App Service](https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references)
- [Disable Basic Auth in App Service](https://learn.microsoft.com/en-us/azure/app-service/configure-basic-auth-disable)

---

*Built with 💪 by Md Easin | AI-200 Certification Journey | June 2026*